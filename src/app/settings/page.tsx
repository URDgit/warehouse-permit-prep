"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirmProfile, saveFirmProfile } from "@/app/actions";
import type { FirmProfile } from "@/engine/firm";

const FIELDS: { key: keyof FirmProfile; label: string; textarea?: boolean }[] = [
  { key: "firmName", label: "Firm name" },
  { key: "firmAddress", label: "Firm address" },
  { key: "firmContact", label: "Contact (phone / email / website)" },
  { key: "engineerName", label: "Engineer of record (name)" },
  { key: "licenseType", label: "License type (PE / SE / FPE)" },
  { key: "licenseNumber", label: "License number" },
  { key: "standardNotes", label: "Standard notes (optional)", textarea: true },
];

export default function SettingsPage() {
  const [firm, setFirm] = useState<FirmProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getFirmProfile().then(setFirm);
  }, []);

  function update(key: keyof FirmProfile, value: string) {
    setFirm((f) => (f ? { ...f, [key]: value } : f));
    setMsg(null);
  }

  async function save() {
    if (!firm) return;
    setSaving(true);
    setMsg(null);
    const res = await saveFirmProfile(firm);
    setSaving(false);
    setMsg(
      res.ok
        ? { ok: true, text: "Firm profile saved. It now appears on new reports and PDFs." }
        : { ok: false, text: `Could not save: ${res.message}` },
    );
  }

  if (!firm) return <p className="note">Loading…</p>;

  return (
    <div>
      <div className="toolbar">
        <Link className="btn btn-secondary" href="/">← Back to intake</Link>
      </div>

      <h1>Firm profile</h1>
      <p className="note">
        Your firm&apos;s letterhead and engineer-of-record details appear on every report, PDF, and
        the seal/signature block. The app never applies a real stamp — it provides the labeled block
        for your own seal and signature.
      </p>

      <div className="card">
        <div className="grid">
          {FIELDS.map((f) => (
            <label className="field" key={f.key} style={f.textarea ? { gridColumn: "1 / -1" } : undefined}>
              <span>{f.label}</span>
              {f.textarea ? (
                <textarea rows={3} value={firm[f.key]} onChange={(e) => update(f.key, e.target.value)} />
              ) : (
                <input value={firm[f.key]} onChange={(e) => update(f.key, e.target.value)} />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save firm profile"}
        </button>
        {msg && <span className={msg.ok ? "save-ok" : "save-err"}>{msg.text}</span>}
      </div>
    </div>
  );
}
