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
export function loadCodeData(dataDir: string = path.join(process.cwd(), "data")): CodeData {
  return {
    commodity: readYaml(path.join(dataDir, "commodity-classification.yaml")),
    fireCode: readYaml(path.join(dataDir, "fire-code-requirements.yaml")),
    seismic: readYaml(path.join(dataDir, "seismic.yaml")),
    anchorage: readYaml(path.join(dataDir, "anchorage.yaml")),
    jurisdictions: {
      "los-angeles": readYaml(path.join(dataDir, "jurisdictions", "los-angeles.yaml")),
    },
  };
}
