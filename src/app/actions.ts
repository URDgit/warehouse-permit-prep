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
    return { ok: false, message: (e as Error).message };
  }
}
