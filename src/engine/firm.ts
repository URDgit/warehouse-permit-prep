// =====================================================================
//  FIRM PROFILE  — the engineering firm's branding & engineer of record
// =====================================================================
//
//  Lets the firm using the tool put their letterhead and engineer-of-record
//  details on every output, plus a seal/signature block where the licensed
//  engineer signs and stamps. Stored on disk (data/firm-profile.json) so it
//  persists for the install and appears on the server-built report.
//
//  The tool does NOT apply a real stamp — it provides the labeled block for
//  the engineer's own seal/signature.
// =====================================================================

import fs from "node:fs";
import path from "node:path";

export interface FirmProfile {
  firmName: string;
  firmAddress: string;
  /** Phone / email / website, one line. */
  firmContact: string;
  engineerName: string;
  /** PE, SE, FPE, etc. */
  licenseType: string;
  licenseNumber: string;
  /** Standard notes the firm wants on every package (optional). */
  standardNotes: string;
}

export const EMPTY_FIRM: FirmProfile = {
  firmName: "",
  firmAddress: "",
  firmContact: "",
  engineerName: "",
  licenseType: "",
  licenseNumber: "",
  standardNotes: "",
};

/** True if the firm has filled in anything worth showing as a letterhead. */
export function hasFirm(f: FirmProfile): boolean {
  return Boolean(f.firmName || f.engineerName || f.firmAddress);
}

export function loadFirmProfile(dataDir: string = path.join(process.cwd(), "data")): FirmProfile {
  const file = path.join(dataDir, "firm-profile.json");
  if (!fs.existsSync(file)) return { ...EMPTY_FIRM };
  try {
    const obj = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<FirmProfile>;
    return { ...EMPTY_FIRM, ...obj };
  } catch {
    return { ...EMPTY_FIRM };
  }
}
