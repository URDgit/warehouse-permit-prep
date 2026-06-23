// Shared shape for every calculation the engine performs.
// A calculation always reports BOTH its result AND the inputs and the
// cited rule/value it used, so an engineer can verify the chain.

import type { AuditEntry, CodeValue } from "@/engine/provenance";

export interface CalcResult {
  id: string;
  label: string;
  /** The numeric result, or a placeholder CodeValue (value null) when blocked. */
  result: CodeValue<number>;
  /** The governing formula reference that was (or would be) used. */
  formula: CodeValue<string>;
  /** The intake inputs this calc used. */
  inputsUsed: Record<string, unknown>;
  audit: AuditEntry;
}
