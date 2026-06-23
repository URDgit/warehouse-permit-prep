"use server";

// =====================================================================
//  SERVER ACTION — the bridge between the browser form and the engine
// =====================================================================
//
//  Runs on the server (so it can read the YAML data files). It validates
//  the submitted intake with the Zod schema, then runs the pure engine.
//  The UI never touches the engine internals directly.
// =====================================================================

import { intakeSchema } from "@/engine/intake/schema";
import { buildReviewPackage, type ReviewPackage } from "@/engine/report/buildReviewPackage";
import { loadCodeData } from "@/engine/data/loadData";
import { buildVerificationBrief, type VerificationBrief } from "@/engine/report/verificationBrief";

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
