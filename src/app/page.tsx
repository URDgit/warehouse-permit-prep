"use client";

import { useState } from "react";
import { generateReviewPackage, type GenerateResult } from "@/app/actions";
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
  const [loading, setLoading] = useState(false);

  function set(section: keyof Form, key: string, value: unknown) {
    setForm((f) => ({ ...f, [section]: { ...(f[section] as object), [key]: value } }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await generateReviewPackage(toPayload(form));
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

  return (
    <form onSubmit={onSubmit}>
      <h1>Storage-Rack Permit — Intake</h1>
      <p className="note">
        Fill in the project details below, then generate a draft review package. The form is
        pre-filled with <strong>example data</strong> so you can try it immediately — replace it
        with your real values. This tool prepares a draft for a licensed engineer; it does not make
        code determinations on its own.
      </p>

      {result && !result.ok && (
        <div className="errors">
          <strong>Please fix the following before generating:</strong>
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
          <Text label="Project name" req value={form.project.projectName} onChange={(v) => set("project", "projectName", v)} />
          <Text label="Prepared by" req value={form.project.preparedBy} onChange={(v) => set("project", "preparedBy", v)} />
          <Text label="Date" req value={form.project.preparedDate} onChange={(v) => set("project", "preparedDate", v)} />
          <Text label="Jurisdiction" value="Los Angeles (LADBS/LAFD)" onChange={() => {}} disabled />
        </div>
      </fieldset>

      <fieldset>
        <legend>Building</legend>
        <div className="grid">
          <Text label="Building address" req value={form.building.address} onChange={(v) => set("building", "address", v)} />
          <Text label="Construction type (optional)" value={form.building.constructionType} onChange={(v) => set("building", "constructionType", v)} />
          <Num label="Total building area (sq ft)" req value={form.building.totalBuildingAreaSqFt} onChange={(v) => set("building", "totalBuildingAreaSqFt", v)} />
          <Num label="High-piled storage area (sq ft)" req value={form.building.highPiledAreaSqFt} onChange={(v) => set("building", "highPiledAreaSqFt", v)} />
          <Num label="Ceiling height (ft)" req value={form.building.ceilingHeightFt} onChange={(v) => set("building", "ceilingHeightFt", v)} />
          <Check label="Existing sprinkler system?" checked={form.building.existingSprinkler} onChange={(v) => set("building", "existingSprinkler", v)} />
          <Sel label="Sprinkler system type" value={form.building.sprinklerSystemType} onChange={(v) => set("building", "sprinklerSystemType", v)} options={["ESFR", "CMSA", "control-mode", "none", "unknown"]} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Rack configuration</legend>
        <div className="grid">
          <Sel label="Rack type" value={form.rack.rackType} onChange={(v) => set("rack", "rackType", v)} options={["selective", "drive-in", "push-back", "cantilever", "other", "unknown"]} />
          <Num label="Storage height (ft)" req value={form.rack.storageHeightFt} onChange={(v) => set("rack", "storageHeightFt", v)} />
          <Num label="Number of tiers" req value={form.rack.numberOfTiers} onChange={(v) => set("rack", "numberOfTiers", v)} />
          <Sel label="Rack depth configuration" value={form.rack.rackDepthConfig} onChange={(v) => set("rack", "rackDepthConfig", v)} options={["single-row", "double-row", "multi-row", "unknown"]} />
          <Num label="Aisle width (ft)" req value={form.rack.aisleWidthFt} onChange={(v) => set("rack", "aisleWidthFt", v)} />
          <Check label="Anchored to slab?" checked={form.rack.anchored} onChange={(v) => set("rack", "anchored", v)} />
          <Text label="Anchor type (optional)" value={form.rack.anchorType} onChange={(v) => set("rack", "anchorType", v)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Commodity (one type per project)</legend>
        <div className="grid">
          <Text label="Commodity description" req value={form.commodity.description} onChange={(v) => set("commodity", "description", v)} />
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
          <Num label="Design density (gpm/sq ft, optional)" value={form.sprinkler.designDensityGpmPerSqFt} onChange={(v) => set("sprinkler", "designDensityGpmPerSqFt", v)} />
          <Num label="K-factor (optional)" value={form.sprinkler.kFactor} onChange={(v) => set("sprinkler", "kFactor", v)} />
          <Check label="In-rack sprinklers present?" checked={form.sprinkler.inRackSprinklers} onChange={(v) => set("sprinkler", "inRackSprinklers", v)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Seismic site data (from the project's geotechnical / USGS data)</legend>
        <div className="grid">
          <Sel label="Site class" value={form.seismic.siteClass} onChange={(v) => set("seismic", "siteClass", v)} options={["A", "B", "C", "D", "E", "F", "unknown"]} />
          <Num label="Ss (optional)" value={form.seismic.Ss} onChange={(v) => set("seismic", "Ss", v)} />
          <Num label="S1 (optional)" value={form.seismic.S1} onChange={(v) => set("seismic", "S1", v)} />
          <Num label="Sds (optional)" value={form.seismic.Sds} onChange={(v) => set("seismic", "Sds", v)} />
          <Num label="Sd1 (optional)" value={form.seismic.Sd1} onChange={(v) => set("seismic", "Sd1", v)} />
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

function Text(props: { label: string; value: string; onChange: (v: string) => void; req?: boolean; disabled?: boolean }) {
  return (
    <label className="field">
      <span>{props.label} {props.req && <span className="req">*</span>}</span>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} disabled={props.disabled} />
    </label>
  );
}

function Num(props: { label: string; value: string; onChange: (v: string) => void; req?: boolean }) {
  return (
    <label className="field">
      <span>{props.label} {props.req && <span className="req">*</span>}</span>
      <input type="number" step="any" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </label>
  );
}

function Sel(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
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
