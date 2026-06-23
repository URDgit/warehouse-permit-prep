// =====================================================================
//  DATA LOADER  — reads the human-editable YAML code-value files
// =====================================================================
//
//  This is the ONLY place the engine reads the data files from disk.
//  It gives clear, plain-language errors if a file is missing or a
//  non-programmer has introduced a YAML typo, so problems are easy to fix.
//
//  Uses Node's file system, so it runs on the server and in tests — never
//  in the browser.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { applyOverrides, type OverrideEntry } from "@/engine/data/overrides";

/** A loosely-typed parsed YAML document. */
export type RawDoc = Record<string, any>;

export interface CodeData {
  commodity: RawDoc;
  fireCode: RawDoc;
  seismic: RawDoc;
  anchorage: RawDoc;
  /** Keyed by jurisdiction id, e.g. "los-angeles". */
  jurisdictions: Record<string, RawDoc>;
}

function readYaml(absPath: string): RawDoc {
  let text: string;
  try {
    text = fs.readFileSync(absPath, "utf8");
  } catch {
    throw new Error(
      `Could not read data file:\n  ${absPath}\nMake sure the file exists in the "data" folder.`,
    );
  }
  let parsed: unknown;
  try {
    parsed = yaml.load(text);
  } catch (e) {
    throw new Error(
      `The data file "${path.basename(absPath)}" has a YAML formatting error:\n  ${(e as Error).message}\n` +
        `Tip: check indentation (use spaces, not tabs) and that every value is on its own line.`,
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      `The data file "${path.basename(absPath)}" did not contain a YAML object at its top level.`,
    );
  }
  return parsed as RawDoc;
}

/**
 * Load all code-value data files.
 * @param dataDir Override the data directory (used by tests). Defaults to
 *                the "data" folder at the project root.
 */
/** Read engineer-verified overrides, tolerating a missing or empty file. */
function readOverrides(absPath: string): OverrideEntry[] {
  if (!fs.existsSync(absPath)) return [];
  try {
    const parsed = yaml.load(fs.readFileSync(absPath, "utf8"));
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, any>).overrides)) {
      return (parsed as Record<string, any>).overrides as OverrideEntry[];
    }
  } catch {
    /* ignore a malformed overrides file — verified values just won't apply */
  }
  return [];
}

/** Load every jurisdiction file, keyed by its meta.jurisdiction_id (or filename). */
function loadJurisdictions(dir: string): Record<string, RawDoc> {
  const out: Record<string, RawDoc> = {};
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /\.ya?ml$/i.test(f));
  } catch {
    return out;
  }
  for (const f of files) {
    const doc = readYaml(path.join(dir, f));
    const id = String(doc?.meta?.jurisdiction_id ?? f.replace(/\.ya?ml$/i, ""));
    out[id] = doc;
  }
  return out;
}

export function loadCodeData(dataDir: string = path.join(process.cwd(), "data")): CodeData {
  const data: CodeData = {
    commodity: readYaml(path.join(dataDir, "commodity-classification.yaml")),
    fireCode: readYaml(path.join(dataDir, "fire-code-requirements.yaml")),
    seismic: readYaml(path.join(dataDir, "seismic.yaml")),
    anchorage: readYaml(path.join(dataDir, "anchorage.yaml")),
    jurisdictions: loadJurisdictions(path.join(dataDir, "jurisdictions")),
  };
  // Layer engineer-verified values (from the in-app editor) on top.
  applyOverrides(data, readOverrides(path.join(dataDir, "overrides.yaml")));
  return data;
}
