"use server";

// =====================================================================
//  SERVER ACTION — the bridge between the browser form and the engine
// =====================================================================
//
//  Runs on the server (so it can read the YAML data files). It validates
//  the submitted intake with the Zod schema, then runs the pure engine.
//  The UI never touches the engine internals directly.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { intakeSchema } from "@/engine/intake/schema";
import { buildReviewPackage, type ReviewPackage } from "@/engine/report/buildReviewPackage";
import { loadCodeData } from "@/engine/data/loadData";
import { buildVerificationBrief, type VerificationBrief } from "@/engine/report/verificationBrief";
import { buildDemoPackage } from "@/engine/demo/buildDemoPackage";
import { listVerifiableFields, type VerifiableField, type OverrideEntry } from "@/engine/data/overrides";
import { loadFirmProfile, EMPTY_FIRM, type FirmProfile } from "@/engine/firm";
import { loadLibraries, type Libraries } from "@/engine/libraries";

/** Friendly message for write failures, esp. read-only hosted filesystems. */
function writeError(e: unknown): string {
  const msg = (e as Error)?.message ?? String(e);
  if (/EROFS|EACCES|read-only/i.test(msg)) {
    return "Saving to the server isn't available on this hosted version (read-only filesystem). Run the app locally to save these, or this becomes available with firm accounts.";
  }
  return msg;
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
    const pkg = buildReviewPackage(parsed.data);
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
  return buildVerificationBrief(loadCodeData());
}

/** A fabricated, watermarked demonstration report. Never reads the real data files. */
export async function getDemoPackage(): Promise<ReviewPackage> {
  return buildDemoPackage();
}

export async function getFirmProfile(): Promise<FirmProfile> {
  return loadFirmProfile();
}

export async function saveFirmProfile(profile: FirmProfile): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const file = path.join(process.cwd(), "data", "firm-profile.json");
    fs.writeFileSync(file, JSON.stringify({ ...EMPTY_FIRM, ...profile }, null, 2), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: writeError(e) };
  }
}

export async function getLibraries(): Promise<Libraries> {
  return loadLibraries();
}

export async function saveLibraries(lib: Libraries): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const file = path.join(process.cwd(), "data", "libraries.json");
    const clean: Libraries = {
      anchors: Array.isArray(lib?.anchors) ? lib.anchors : [],
      commodities: Array.isArray(lib?.commodities) ? lib.commodities : [],
    };
    fs.writeFileSync(file, JSON.stringify(clean, null, 2), "utf8");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: writeError(e) };
  }
}

/** Current state of every editable code value (with verified overrides applied). */
export async function getVerifiableFields(): Promise<VerifiableField[]> {
  return listVerifiableFields(loadCodeData());
}

export type SaveOverridesResult = { ok: true; count: number } | { ok: false; message: string };

/** Persist engineer-verified values to data/overrides.yaml (curated YAML untouched). */
export async function saveOverrides(entries: OverrideEntry[]): Promise<SaveOverridesResult> {
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
