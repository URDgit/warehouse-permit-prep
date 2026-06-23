"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateReviewPackage, getVerificationBrief, type GenerateResult } from "@/app/actions";
import { intakeSchema } from "@/engine/intake/schema";
import { renderVerificationBriefMarkdown } from "@/engine/report/verificationBrief";
import { downloadVerificationBriefPdf } from "@/app/pdf/pdfBuilders";
import ReviewPackageView from "@/app/ReviewPackageView";

// Example data so the walking skeleton runs end-to-end on the first click.
// Replace with your real project data. These are inputs, not code values.
const today = new Date().toISOString().slice(0, 10);
const initialForm = {
  project: {
    projectName: "Example Project — 123 Warehouse Way",
    preparedBy: "J. Consultant (example)",
    preparedDate: today,
    jurisdiction: "los-angeles",
  },
  building: {
    address: "123 Warehouse Way, Los Angeles, CA",
    constructionType: "",
    totalBuildingAreaSqFt: "50000",
    highPiledAreaSqFt: "12000",
    ceilingHeightFt: "32",
    existingSprinkler: true,
    sprinklerSystemType: "ESFR",
  },
  rack: {
    rackType: "selective",
    storageHeightFt: "25",
    numberOfTiers: "5",
    rackDepthConfig: "double-row",
    aisleWidthFt: "8",
    anchored: true,
    anchorType: "",
  },
  loads: {
    productLoadPerLevelLb: "2000",
    numberOfLoadedLevels: "5",
    rackSelfWeightLb: "",
  },
  commodity: {
    description: "Cartoned household goods",
    primaryMaterial: "",
    packaging: "cartoned",
    plasticContent: "limited",
    encapsulated: false,
    idlePalletsStored: false,
  },
  sprinkler: {
    systemType: "ESFR",
    designDensityGpmPerSqFt: "",
    kFactor: "",
    inRackSprinklers: false,
  },
  seismic: {
    siteClass: "D",
    Ss: "1.5",
    S1: "0.6",
    Sds: "1.0",
    Sd1: "0.6",
    seismicDesignCategory: "D",
    riskCategory: "II",
  },
};

type Form = typeof initialForm;

const PROJECTS_KEY = "wpp-projects-v1";
const LEGACY_KEY = "wpp-intake-v1";

interface Project {
  id: string;
  form: Form;
  savedAt: string;
}

function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}
function projectName(p: Project): string {
  return p.form.project.projectName?.trim() || "Untitled project";
}

/** Merge a saved blob over the defaults so newly-added fields still get values. */
function mergeForm(saved: Record<string, any>): Form {
  const out: Record<string, any> = {};
  for (const k of Object.keys(initialForm) as (keyof Form)[]) {
    out[k] = { ...(initialForm[k] as object), ...((saved?.[k] as object) ?? {}) };
  }
  return out as Form;
}

function num(s: string): number {
  return s.trim() === "" ? NaN : Number(s);
}
function optNum(s: string): number | undefined {
  return s.trim() === "" ? undefined : Number(s);
}

// Convert the string-based form into the shape the engine validates.
function toPayload(f: Form) {
  return {
    project: f.project,
    building: {
      ...f.building,
      totalBuildingAreaSqFt: num(f.building.totalBuildingAreaSqFt),
      highPiledAreaSqFt: num(f.building.highPiledAreaSqFt),
      ceilingHeightFt: num(f.building.ceilingHeightFt),
    },
    rack: {
      ...f.rack,
      storageHeightFt: num(f.rack.storageHeightFt),
      numberOfTiers: num(f.rack.numberOfTiers),
      aisleWidthFt: num(f.rack.aisleWidthFt),
    },
    loads: {
      productLoadPerLevelLb: optNum(f.loads.productLoadPerLevelLb),
      numberOfLoadedLevels: optNum(f.loads.numberOfLoadedLevels),
      rackSelfWeightLb: optNum(f.loads.rackSelfWeightLb),
    },
    commodity: f.commodity,
    sprinkler: {
      ...f.sprinkler,
      designDensityGpmPerSqFt: optNum(f.sprinkler.designDensityGpmPerSqFt),
      kFactor: optNum(f.sprinkler.kFactor),
    },
    seismic: {
      ...f.seismic,
      Ss: optNum(f.seismic.Ss),
      S1: optNum(f.seismic.S1),
      Sds: optNum(f.seismic.Sds),
      Sd1: optNum(f.seismic.Sd1),
    },
  };
}

export default function Home() {
  const [form, setForm] = useState<Form>(initialForm);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [briefBusy, setBriefBusy] = useState<"" | "pdf" | "md">("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Load saved projects on first mount (migrating the old single-draft store).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY);
      if (raw) {
        const store = JSON.parse(raw) as { activeId?: string; projects?: any[] };
        const ps: Project[] = (store.projects ?? []).map((p) => ({
          id: String(p.id ?? newId()),
          form: mergeForm(p.form ?? {}),
          savedAt: String(p.savedAt ?? ""),
        }));
        if (ps.length > 0) {
          const active = ps.find((p) => p.id === store.activeId) ?? ps[0];
          setProjects(ps);
          setActiveId(active.id);
          setForm(active.form);
          return;
        }
      }
      // First run (or migrate the previous single auto-saved draft).
      const legacy = localStorage.getItem(LEGACY_KEY);
      const f = legacy ? mergeForm(JSON.parse(legacy)) : initialForm;
      const p: Project = { id: newId(), form: f, savedAt: new Date().toISOString() };
      setProjects([p]);
      setActiveId(p.id);
      setForm(p.form);
    } catch {
      const p: Project = { id: newId(), form: initialForm, savedAt: new Date().toISOString() };
      setProjects([p]);
      setActiveId(p.id);
    }
  }, []);

  // Keep the active project synced with the form, and persist the whole store.
  useEffect(() => {
    if (!activeId) return;
    setProjects((prev) => prev.map((p) => (p.id === activeId ? { ...p, form, savedAt: new Date().toISOString() } : p)));
  }, [form, activeId]);
  useEffect(() => {
    if (!activeId || projects.length === 0) return;
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify({ activeId, projects }));
    } catch {
      /* ignore unwritable storage */
    }
  }, [projects, activeId]);

  function selectProject(id: string) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setActiveId(id);
    setForm(p.form);
    setErrors({});
  }
  function newProject() {
    const p: Project = {
      id: newId(),
      form: { ...initialForm, project: { ...initialForm.project, projectName: "New project" } },
      savedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, p]);
    setActiveId(p.id);
    setForm(p.form);
    setErrors({});
  }
  function deleteProject() {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== activeId);
    setProjects(remaining);
    setActiveId(remaining[0].id);
    setForm(remaining[0].form);
    setErrors({});
  }
  function exportProject() {
    const blob = new Blob([JSON.stringify({ kind: "wpp-project", form }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(form.project.projectName || "project").replace(/[^\w.-]+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importProject(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      const f = mergeForm(obj?.form ?? obj ?? {});
      const p: Project = { id: newId(), form: f, savedAt: new Date().toISOString() };
      setProjects((prev) => [...prev, p]);
      setActiveId(p.id);
      setForm(f);
      setErrors({});
    } catch {
      alert("Could not import that file — it doesn't look like a saved project export.");
    }
  }

  function set(section: keyof Form, key: string, value: unknown) {
    setForm((f) => ({ ...f, [section]: { ...(f[section] as object), [key]: value } }));
    // Clear this field's error as soon as the user edits it.
    setErrors((errs) => {
      const k = `${String(section)}.${key}`;
      if (!errs[k]) return errs;
      const next = { ...errs };
      delete next[k];
      return next;
    });
  }

  /** Error message for a given field path, if any. */
  function fe(section: keyof Form, key: string): string | undefined {
    return errors[`${String(section)}.${key}`];
  }

  async function downloadBrief() {
    setBriefBusy("md");
    try {
      const brief = await getVerificationBrief();
      const md = renderVerificationBriefMarkdown(brief);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Engineer_Verification_Brief.md";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBriefBusy("");
    }
  }

  async function downloadBriefPdf() {
    setBriefBusy("pdf");
    try {
      const brief = await getVerificationBrief();
      await downloadVerificationBriefPdf(brief);
    } finally {
      setBriefBusy("");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    // Validate in the browser first, using the SAME schema the engine uses.
    const parsed = intakeSchema.safeParse(toPayload(form));
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await generateReviewPackage(parsed.data);
    setResult(res);
    setLoading(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result?.ok) {
    return (
      <div>
        <div className="toolbar">
          <button className="btn btn-secondary" onClick={() => setResult(null)}>
            ← Back to edit inputs
          </button>
        </div>
        <ReviewPackageView pkg={result.package} />
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="projectbar">
        <label className="projectbar__select">
          <span>Project</span>
          <select value={activeId} onChange={(e) => selectProject(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{projectName(p)}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-secondary" onClick={newProject}>New</button>
        <button type="button" className="btn btn-secondary" onClick={deleteProject} disabled={projects.length <= 1}>
          Delete
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportProject}>Export</button>
        <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
          Import
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={importProject} />
        </label>
      </div>
      <h1>Storage-Rack Permit — Intake</h1>
      <p className="note">
        Fill in the project details below, then generate a draft review package. The form is
        pre-filled with <strong>example data</strong> so you can try it immediately — replace it
        with your real values. This tool prepares a draft for a licensed engineer; it does not make
        code determinations on its own.
      </p>

      <details className="guide">
        <summary>How this works (4 steps)</summary>
        <ol>
          <li><strong>Fill the intake</strong> and click <em>Generate draft review package</em> to see the report.</li>
          <li><strong>Download the Engineer Verification Brief</strong> and give it to a licensed engineer to fill in and verify.</li>
          <li>Enter their answers on the <strong>Verify data</strong> screen (or in the data files).</li>
          <li><strong>Re-generate</strong> — verified values fill in and the readiness checklist clears toward &ldquo;ready&rdquo;. Nothing here is valid until reviewed and stamped by a licensed engineer.</li>
        </ol>
      </details>

      <div className="toolbar">
        <button type="button" className="btn btn-secondary" onClick={downloadBriefPdf} disabled={briefBusy !== ""}>
          {briefBusy === "pdf" ? "Generating…" : "⤓ Engineer Verification Brief (PDF)"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={downloadBrief} disabled={briefBusy !== ""}>
          {briefBusy === "md" ? "Generating…" : "Markdown"}
        </button>
        <Link className="btn btn-secondary" href="/verify">Verify data (enter answers) →</Link>
        <span className="note">A checklist to hand a licensed engineer — what to verify, with citations.</span>
      </div>

      {errorCount > 0 && (
        <div className="errors">
          <strong>
            Please fix {errorCount} highlighted {errorCount === 1 ? "field" : "fields"} below before
            generating.
          </strong>
        </div>
      )}

      {result && !result.ok && (
        <div className="errors">
          <strong>Could not generate the report:</strong>
          <ul>
            {result.errors.map((er, i) => (
              <li key={i}>
                {er.path ? <code>{er.path}</code> : null} {er.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset>
        <legend>Project</legend>
        <div className="grid">
          <Text label="Project name" req value={form.project.projectName} error={fe("project", "projectName")} onChange={(v) => set("project", "projectName", v)} />
          <Text label="Prepared by" req value={form.project.preparedBy} error={fe("project", "preparedBy")} onChange={(v) => set("project", "preparedBy", v)} />
          <Text label="Date" req value={form.project.preparedDate} error={fe("project", "preparedDate")} onChange={(v) => set("project", "preparedDate", v)} />
          <Text label="Jurisdiction" value="Los Angeles (LADBS/LAFD)" onChange={() => {}} disabled />
        </div>
      </fieldset>

      <fieldset>
        <legend>Building</legend>
        <div className="grid">
          <Text label="Building address" req value={form.building.address} error={fe("building", "address")} onChange={(v) => set("building", "address", v)} />
          <Text label="Construction type (optional)" value={form.building.constructionType} onChange={(v) => set("building", "constructionType", v)} />
          <Num label="Total building area" unit="sq ft" req value={form.building.totalBuildingAreaSqFt} error={fe("building", "totalBuildingAreaSqFt")} onChange={(v) => set("building", "totalBuildingAreaSqFt", v)} />
          <Num label="High-piled storage area" unit="sq ft" req value={form.building.highPiledAreaSqFt} error={fe("building", "highPiledAreaSqFt")} onChange={(v) => set("building", "highPiledAreaSqFt", v)} />
          <Num label="Ceiling height" unit="ft" req value={form.building.ceilingHeightFt} error={fe("building", "ceilingHeightFt")} onChange={(v) => set("building", "ceilingHeightFt", v)} />
          <Check label="Existing sprinkler system?" checked={form.building.existingSprinkler} onChange={(v) => set("building", "existingSprinkler", v)} />
          <Sel label="Sprinkler system type" value={form.building.sprinklerSystemType} onChange={(v) => set("building", "sprinklerSystemType", v)} options={["ESFR", "CMSA", "control-mode", "none", "unknown"]} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Rack configuration</legend>
        <div className="grid">
          <Sel label="Rack type" value={form.rack.rackType} onChange={(v) => set("rack", "rackType", v)} options={["selective", "drive-in", "push-back", "cantilever", "other", "unknown"]} />
          <Num label="Storage height" unit="ft" hint="Top of storage above the floor" req value={form.rack.storageHeightFt} error={fe("rack", "storageHeightFt")} onChange={(v) => set("rack", "storageHeightFt", v)} />
          <Num label="Number of tiers" req value={form.rack.numberOfTiers} error={fe("rack", "numberOfTiers")} onChange={(v) => set("rack", "numberOfTiers", v)} />
          <Sel label="Rack depth configuration" value={form.rack.rackDepthConfig} onChange={(v) => set("rack", "rackDepthConfig", v)} options={["single-row", "double-row", "multi-row", "unknown"]} />
          <Num label="Aisle width" unit="ft" req value={form.rack.aisleWidthFt} error={fe("rack", "aisleWidthFt")} onChange={(v) => set("rack", "aisleWidthFt", v)} />
          <Check label="Anchored to slab?" checked={form.rack.anchored} onChange={(v) => set("rack", "anchored", v)} />
          <Text label="Anchor type (optional)" value={form.rack.anchorType} onChange={(v) => set("rack", "anchorType", v)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Storage loads (used with a verified factor to derive seismic mass)</legend>
        <div className="grid">
          <Num label="Product load per level" unit="lb" hint="Max stored weight on one level" value={form.loads.productLoadPerLevelLb} error={fe("loads", "productLoadPerLevelLb")} onChange={(v) => set("loads", "productLoadPerLevelLb", v)} />
          <Num label="Number of loaded levels" value={form.loads.numberOfLoadedLevels} error={fe("loads", "numberOfLoadedLevels")} onChange={(v) => set("loads", "numberOfLoadedLevels", v)} />
          <Num label="Rack self-weight" unit="lb" hint="Weight of the empty rack" value={form.loads.rackSelfWeightLb} error={fe("loads", "rackSelfWeightLb")} onChange={(v) => set("loads", "rackSelfWeightLb", v)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Commodity (one type per project)</legend>
        <div className="grid">
          <Text label="Commodity description" req value={form.commodity.description} error={fe("commodity", "description")} onChange={(v) => set("commodity", "description", v)} />
          <Text label="Primary material (optional)" value={form.commodity.primaryMaterial} onChange={(v) => set("commodity", "primaryMaterial", v)} />
          <Sel label="Packaging" value={form.commodity.packaging} onChange={(v) => set("commodity", "packaging", v)} options={["none", "cartoned", "exposed", "palletized", "unknown"]} />
          <Sel label="Plastic content" value={form.commodity.plasticContent} onChange={(v) => set("commodity", "plasticContent", v)} options={["none", "limited", "significant", "unknown"]} />
          <Check label="Encapsulated?" checked={form.commodity.encapsulated} onChange={(v) => set("commodity", "encapsulated", v)} />
          <Check label="Idle pallets stored?" checked={form.commodity.idlePalletsStored} onChange={(v) => set("commodity", "idlePalletsStored", v)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Sprinkler</legend>
        <div className="grid">
          <Sel label="System type" value={form.sprinkler.systemType} onChange={(v) => set("sprinkler", "systemType", v)} options={["ESFR", "CMSA", "control-mode", "none", "unknown"]} />
          <Num label="Design density" unit="gpm/sq ft" value={form.sprinkler.designDensityGpmPerSqFt} error={fe("sprinkler", "designDensityGpmPerSqFt")} onChange={(v) => set("sprinkler", "designDensityGpmPerSqFt", v)} />
          <Num label="K-factor (optional)" value={form.sprinkler.kFactor} error={fe("sprinkler", "kFactor")} onChange={(v) => set("sprinkler", "kFactor", v)} />
          <Check label="In-rack sprinklers present?" checked={form.sprinkler.inRackSprinklers} onChange={(v) => set("sprinkler", "inRackSprinklers", v)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Seismic site data (from the project's geotechnical / USGS data)</legend>
        <div className="grid">
          <Sel label="Site class" value={form.seismic.siteClass} onChange={(v) => set("seismic", "siteClass", v)} options={["A", "B", "C", "D", "E", "F", "unknown"]} />
          <Num label="Ss" unit="g" hint="Mapped spectral accel., short period" value={form.seismic.Ss} error={fe("seismic", "Ss")} onChange={(v) => set("seismic", "Ss", v)} />
          <Num label="S1" unit="g" hint="Mapped spectral accel., 1-second" value={form.seismic.S1} error={fe("seismic", "S1")} onChange={(v) => set("seismic", "S1", v)} />
          <Num label="Sds" unit="g" hint="Design spectral accel., short period" value={form.seismic.Sds} error={fe("seismic", "Sds")} onChange={(v) => set("seismic", "Sds", v)} />
          <Num label="Sd1" unit="g" hint="Design spectral accel., 1-second" value={form.seismic.Sd1} error={fe("seismic", "Sd1")} onChange={(v) => set("seismic", "Sd1", v)} />
          <Sel label="Seismic design category" value={form.seismic.seismicDesignCategory} onChange={(v) => set("seismic", "seismicDesignCategory", v)} options={["A", "B", "C", "D", "E", "F", "unknown"]} />
          <Sel label="Risk category" value={form.seismic.riskCategory} onChange={(v) => set("seismic", "riskCategory", v)} options={["I", "II", "III", "IV", "unknown"]} />
        </div>
      </fieldset>

      <div className="toolbar">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate draft review package"}
        </button>
      </div>
    </form>
  );
}

/* ---- small input helpers (kept local to the form) ---- */

function FieldShell(props: { label: string; req?: boolean; unit?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>
        {props.label}
        {props.unit ? <span className="unit"> ({props.unit})</span> : null}
        {props.req && <span className="req"> *</span>}
      </span>
      {props.children}
      {props.hint && !props.error && <small className="hint">{props.hint}</small>}
      {props.error && <small className="field-error">{props.error}</small>}
    </label>
  );
}

function Text(props: { label: string; value: string; onChange: (v: string) => void; req?: boolean; disabled?: boolean; error?: string; hint?: string }) {
  return (
    <FieldShell label={props.label} req={props.req} hint={props.hint} error={props.error}>
      <input
        className={props.error ? "input-error" : ""}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        aria-invalid={props.error ? true : undefined}
      />
    </FieldShell>
  );
}

function Num(props: { label: string; value: string; onChange: (v: string) => void; req?: boolean; unit?: string; hint?: string; error?: string }) {
  return (
    <FieldShell label={props.label} req={props.req} unit={props.unit} hint={props.hint} error={props.error}>
      <input
        type="number"
        step="any"
        className={props.error ? "input-error" : ""}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={props.error ? true : undefined}
      />
    </FieldShell>
  );
}

function Sel(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <FieldShell label={props.label}>
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </FieldShell>
  );
}

function Check(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="field checkbox">
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
}
