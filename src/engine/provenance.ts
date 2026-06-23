// =====================================================================
//  PROVENANCE & AUDIT  — the backbone of the whole engine
// =====================================================================
//
//  Two ideas live here:
//
//  1. CodeValue<T>: any value that comes from the code-value data files
//     is wrapped together with its citation (`source`) and a flag for
//     whether it is a verified value or still an unverified PLACEHOLDER.
//     The rest of the engine treats a placeholder as "no answer yet" and
//     will not fabricate a number in its place.
//
//  2. AuditEntry: a record of one step the engine took — what inputs it
//     used, which code value/rule drove it, what it assumed, and what it
//     produced — so an engineer can verify the whole chain.
//
//  This file has NO dependencies on Next.js, the browser, or the file
//  system. It is pure data + helpers, easy to unit-test.
// =====================================================================

export type CodeValueStatus = "PLACEHOLDER" | "VERIFIED";

/** The shape a code value takes inside the YAML data files. */
export interface RawCodeValue {
  value?: unknown;
  status?: string;
  source?: string;
  unit?: string;
  todo?: string;
}

/** A value used by the engine, carrying its citation and verified/placeholder state. */
export interface CodeValue<T = unknown> {
  /** Stable id, e.g. "fire_code.aisle_width.minimum". */
  id: string;
  /** Human-readable label for the report. */
  label: string;
  /** The value, or null when it is an unresolved placeholder. */
  value: T | null;
  /** Unit of the value, if any. */
  unit: string | null;
  /** Code citation, e.g. "CFC 2022 Chapter 32". */
  source: string;
  status: CodeValueStatus;
  /** True if this value must NOT be trusted as a real answer yet. */
  isPlaceholder: boolean;
  /** What is needed to resolve a placeholder. */
  todo: string | null;
}

/**
 * Convert a raw YAML code-value object into a CodeValue.
 *
 * Safety rule: a value is treated as a PLACEHOLDER if its status is not
 * explicitly "VERIFIED" OR if it has no value. This means a half-edited
 * data file can never accidentally present an unverified number as real.
 */
export function toCodeValue<T = unknown>(
  id: string,
  label: string,
  raw: RawCodeValue | undefined | null,
  fallbackSource = "Source not yet cited — VERIFY",
): CodeValue<T> {
  const statusRaw = String(raw?.status ?? "PLACEHOLDER").toUpperCase();
  const rawValue = raw?.value ?? null;
  const hasValue = rawValue !== null && rawValue !== undefined && rawValue !== "";
  const isPlaceholder = statusRaw !== "VERIFIED" || !hasValue;

  return {
    id,
    label,
    value: (hasValue ? (rawValue as T) : null),
    unit: (raw?.unit as string) ?? null,
    source: String(raw?.source ?? fallbackSource),
    status: isPlaceholder ? "PLACEHOLDER" : "VERIFIED",
    isPlaceholder,
    todo: isPlaceholder ? (raw?.todo ?? null) ?? null : null,
  };
}

export interface AuditEntry {
  /** Short name of the step, e.g. "Commodity classification". */
  step: string;
  /** Plain-language explanation of what happened and why. */
  description: string;
  /** The intake inputs this step actually used. */
  inputsUsed: Record<string, unknown>;
  /** The code values / rules that drove this step (with citations). */
  codeValues: CodeValue[];
  /** Assumptions made in this step. */
  assumptions: string[];
  /** The produced result (null if blocked by a placeholder). */
  result: unknown;
  /** Whether the step produced a real result or was intentionally blocked. */
  status: "ok" | "blocked_by_placeholder";
}

/** True if every code value supporting a step is verified. */
export function allVerified(values: CodeValue[]): boolean {
  return values.every((v) => !v.isPlaceholder);
}
