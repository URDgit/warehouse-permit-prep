"use server";

// =====================================================================
//  SERVER ACTION — the bridge between the browser form and the engine
// =====================================================================
//
//  Runs on the server (so it can read the YAML data files). It validates
//  the submitted intake with the Zod schema, then runs the pure engine.
//  The UI never touches the engine internals directly.
//
//  Persistence (firm profile, libraries, verified-value overrides) is
//  per-account when the visitor is signed in (Supabase), and falls back to
//  the on-disk files when accounts are off (local dev) — so the same actions
//  work in both modes without the UI changing.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { intakeSchema } from "@/engine/intake/schema";
import { buildReviewPackage, type ReviewPackage } from "@/engine/report/buildReviewPackage";
import { loadCodeData, type CodeData } from "@/engine/data/loadData";
import { applyOverrides } from "@/engine/data/overrides";
import { buildVerificationBrief, type VerificationBrief } from "@/engine/report/verificationBrief";
import { buildDemoPackage } from "@/engine/demo/buildDemoPackage";
import { listVerifiableFields, type VerifiableField, type OverrideEntry } from "@/engine/data/overrides";
import { loadFirmProfile, EMPTY_FIRM, type FirmProfile } from "@/engine/firm";
import { loadLibraries, type Libraries } from "@/engine/libraries";
import { readUserData, writeUserData, type WriteResult } from "@/lib/store/userStore";

/** Friendly message for write failures, esp. read-only hosted filesystems. */
function writeError(e: unknown): string {
  const msg = (e as Error)?.message ?? String(e);
  if (/EROFS|EACCES|read-only/i.test(msg)) {
    return "Saving to the server isn't available on this hosted version (read-only filesystem). Run the app locally to save these, or sign in to save to your account.";
  }
  return msg;
}

/**
 * Code data for the current context: curated YAML + the signed-in user's
 * verified-value overrides layered on top (or the on-disk overrides when
 * nobody is signed in). This is what makes a user's verified values affect
 * their own reports.
 */
async function loadCodeDataForUser(): Promise<CodeData> {
  const data = loadCodeData(); // curated + any on-disk overrides
  const userOverrides = await readUserData<OverrideEntry[]>("overrides");
  if (Array.isArray(userOverrides)) applyOverrides(data, userOverrides);
  return data;
}

/** The firm profile for the current context: the user's saved one, else disk. */
async function resolveFirm(): Promise<FirmProfile> {
  const cloud = await readUserData<Partial<FirmProfile>>("firm_profiles");
  return cloud ? { ...EMPTY_FIRM, ...cloud } : loadFirmProfile();
}

export interface FieldError {
  path: string;
  message: string;
}

export type GenerateResult =
  | { ok: true; package: ReviewPackage }
  | { ok: false; errors: FieldError[] };

export async function generateReviewPackage(raw: unknown): Promise<GenerateResult> {
  const parsed = intakeSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: FieldError[] = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return { ok: false, errors };
  }

  try {
    const pkg = buildReviewPackage(parsed.data, {
      data: await loadCodeDataForUser(),
      firm: await resolveFirm(),
    });
    return { ok: true, package: pkg };
  } catch (e) {
    // Most likely a data-file (YAML) problem; surface it plainly.
    return { ok: false, errors: [{ path: "data", message: (e as Error).message }] };
  }
}

/**
 * Produce the Engineer Verification Brief (Markdown) from the current data
 * files. Project-agnostic: it lists everything an engineer must verify so the
 * tool can produce trustworthy output.
 */
export async function getVerificationBrief(): Promise<VerificationBrief> {
  return buildVerificationBrief(await loadCodeDataForUser());
}

/** A fabricated, watermarked demonstration report. Never reads the real data files. */
export async function getDemoPackage(): Promise<ReviewPackage> {
  return buildDemoPackage();
}

/** Map a failed account write to a user-facing save result, or null to fall back to disk. */
function saveFallbackMessage(res: Extract<WriteResult, { ok: false }>): string | null {
  if (res.reason === "not-signed-in") return "Sign in to save this to your account.";
  if (res.reason === "not-configured") return null; // local dev → write to disk
  return res.reason;
}

export async function getFirmProfile(): Promise<FirmProfile> {
  const cloud = await readUserData<Partial<FirmProfile>>("firm_profiles");
  return cloud ? { ...EMPTY_FIRM, ...cloud } : loadFirmProfile();
}

export async function saveFirmProfile(profile: FirmProfile): Promise<{ ok: true } | { ok: false; message: string }> {
  const merged = { ...EMPTY_FIRM, ...profile };
  const res = await writeUserData("firm_profiles", merged);
  if (res.ok) return { ok: true };
  const msg = saveFallbackMessage(res);
  if (msg !== null) return { ok: false, message: msg };
  try {
    const file = path.join(process.cwd(), "data", "firm-profile.json");
    fs.writeFileSync(file, JSON.stringify(merged, null, 2), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: writeError(e) };
  }
}

export async function getLibraries(): Promise<Libraries> {
  const cloud = await readUserData<Partial<Libraries>>("libraries");
  if (cloud) {
    return {
      anchors: Array.isArray(cloud.anchors) ? cloud.anchors : [],
      commodities: Array.isArray(cloud.commodities) ? cloud.commodities : [],
    };
  }
  return loadLibraries();
}

export async function saveLibraries(lib: Libraries): Promise<{ ok: true } | { ok: false; message: string }> {
  const clean: Libraries = {
    anchors: Array.isArray(lib?.anchors) ? lib.anchors : [],
    commodities: Array.isArray(lib?.commodities) ? lib.commodities : [],
  };
  const res = await writeUserData("libraries", clean);
  if (res.ok) return { ok: true };
  const msg = saveFallbackMessage(res);
  if (msg !== null) return { ok: false, message: msg };
  try {
    const file = path.join(process.cwd(), "data", "libraries.json");
    fs.writeFileSync(file, JSON.stringify(clean, null, 2), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: writeError(e) };
  }
}

/** Current state of every editable code value (with verified overrides applied). */
export async function getVerifiableFields(): Promise<VerifiableField[]> {
  return listVerifiableFields(await loadCodeDataForUser());
}

export type SaveOverridesResult = { ok: true; count: number } | { ok: false; message: string };

/** Persist engineer-verified values to the user's account, or to data/overrides.yaml locally. */
export async function saveOverrides(entries: OverrideEntry[]): Promise<SaveOverridesResult> {
  const res = await writeUserData("overrides", entries);
  if (res.ok) return { ok: true, count: entries.length };
  const msg = saveFallbackMessage(res);
  if (msg !== null) return { ok: false, message: msg };
  try {
    const file = path.join(process.cwd(), "data", "overrides.yaml");
    const header =
      "# data/overrides.yaml\n" +
      "# Engineer-verified values, managed by the app's \"Verify data\" screen.\n" +
      "# Prefer editing through the app rather than by hand. The curated YAML files\n" +
      "# are never modified; these values are merged on top of them at load time.\n\n";
    const body = yaml.dump({ overrides: entries }, { lineWidth: 100 });
    fs.writeFileSync(file, header + body, "utf8");
    return { ok: true, count: entries.length };
  } catch (e) {
    return { ok: false, message: writeError(e) };
  }
}
