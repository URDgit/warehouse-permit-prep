"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLibraries, saveLibraries } from "@/app/actions";
import type { AnchorProduct, CommodityPreset, Libraries } from "@/engine/libraries";

function nid() {
  return Math.random().toString(36).slice(2, 9);
}

const PACKAGING = ["none", "cartoned", "exposed", "palletized", "unknown"];
const PLASTIC = ["none", "limited", "significant", "unknown"];

export default function LibrariesPage() {
  const [lib, setLib] = useState<Libraries | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getLibraries().then(setLib);
  }, []);

  if (!lib) return <p className="note">Loading…</p>;

  const setAnchors = (anchors: AnchorProduct[]) => {
    setLib((l) => (l ? { ...l, anchors } : l));
    setMsg(null);
  };
  const setCommodities = (commodities: CommodityPreset[]) => {
    setLib((l) => (l ? { ...l, commodities } : l));
    setMsg(null);
  };

  const addAnchor = () => setAnchors([...lib.anchors, { id: nid(), name: "", manufacturer: "", esr: "", notes: "" }]);
  const updAnchor = (id: string, k: keyof AnchorProduct, v: string) =>
    setAnchors(lib.anchors.map((a) => (a.id === id ? { ...a, [k]: v } : a)));
  const delAnchor = (id: string) => setAnchors(lib.anchors.filter((a) => a.id !== id));

  const addCommodity = () =>
    setCommodities([
      ...lib.commodities,
      { id: nid(), label: "", description: "", primaryMaterial: "", packaging: "unknown", plasticContent: "unknown", encapsulated: false, idlePalletsStored: false },
    ]);
  const updCommodity = (id: string, patch: Partial<CommodityPreset>) =>
    setCommodities(lib.commodities.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const delCommodity = (id: string) => setCommodities(lib.commodities.filter((c) => c.id !== id));

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await saveLibraries(lib!);
    setSaving(false);
    setMsg(res.ok ? { ok: true, text: "Libraries saved. They now appear as options on the intake form." } : { ok: false, text: `Could not save: ${res.message}` });
  }

  return (
    <div>
      <div className="toolbar">
        <Link className="btn btn-secondary" href="/">← Back to intake</Link>
      </div>

      <h1>Libraries</h1>
      <p className="note">
        Save things your firm reuses across projects so you don&apos;t re-type them. These are your
        own inputs (not code values). Saved anchors appear as suggestions on the &ldquo;Anchor
        type&rdquo; field; saved commodities can pre-fill the commodity section.
      </p>

      <div className="card">
        <h3>Anchor products</h3>
        <table className="report">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Name</th>
              <th style={{ width: "20%" }}>Manufacturer</th>
              <th style={{ width: "16%" }}>ICC-ES ESR #</th>
              <th>Notes</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {lib.anchors.length === 0 && (
              <tr><td colSpan={5} className="note">No anchor products yet.</td></tr>
            )}
            {lib.anchors.map((a) => (
              <tr key={a.id}>
                <td><input value={a.name} onChange={(e) => updAnchor(a.id, "name", e.target.value)} /></td>
                <td><input value={a.manufacturer} onChange={(e) => updAnchor(a.id, "manufacturer", e.target.value)} /></td>
                <td><input value={a.esr} onChange={(e) => updAnchor(a.id, "esr", e.target.value)} /></td>
                <td><input value={a.notes} onChange={(e) => updAnchor(a.id, "notes", e.target.value)} /></td>
                <td><button type="button" className="btn btn-secondary" onClick={() => delAnchor(a.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="toolbar"><button type="button" className="btn btn-secondary" onClick={addAnchor}>+ Add anchor</button></div>
      </div>

      <div className="card">
        <h3>Commodity presets</h3>
        {lib.commodities.length === 0 && <p className="note">No commodity presets yet.</p>}
        {lib.commodities.map((c) => (
          <div key={c.id} className="preset">
            <div className="grid">
              <label className="field"><span>Preset label</span><input value={c.label} onChange={(e) => updCommodity(c.id, { label: e.target.value })} /></label>
              <label className="field"><span>Commodity description</span><input value={c.description} onChange={(e) => updCommodity(c.id, { description: e.target.value })} /></label>
              <label className="field"><span>Primary material</span><input value={c.primaryMaterial} onChange={(e) => updCommodity(c.id, { primaryMaterial: e.target.value })} /></label>
              <label className="field"><span>Packaging</span>
                <select value={c.packaging} onChange={(e) => updCommodity(c.id, { packaging: e.target.value })}>
                  {PACKAGING.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="field"><span>Plastic content</span>
                <select value={c.plasticContent} onChange={(e) => updCommodity(c.id, { plasticContent: e.target.value })}>
                  {PLASTIC.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="field checkbox"><input type="checkbox" checked={c.encapsulated} onChange={(e) => updCommodity(c.id, { encapsulated: e.target.checked })} /><span>Encapsulated?</span></label>
              <label className="field checkbox"><input type="checkbox" checked={c.idlePalletsStored} onChange={(e) => updCommodity(c.id, { idlePalletsStored: e.target.checked })} /><span>Idle pallets stored?</span></label>
            </div>
            <div className="toolbar"><button type="button" className="btn btn-secondary" onClick={() => delCommodity(c.id)}>✕ Remove preset</button></div>
          </div>
        ))}
        <div className="toolbar"><button type="button" className="btn btn-secondary" onClick={addCommodity}>+ Add commodity preset</button></div>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save libraries"}</button>
        {msg && <span className={msg.ok ? "save-ok" : "save-err"}>{msg.text}</span>}
      </div>
    </div>
  );
}
