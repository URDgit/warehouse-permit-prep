"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVerifiableFields, saveOverrides } from "@/app/actions";
import type { VerifiableField } from "@/engine/data/overrides";

export default function VerifyPage() {
  const [fields, setFields] = useState<VerifiableField[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getVerifiableFields().then(setFields);
  }, []);

  function update(id: string, patch: Partial<VerifiableField>) {
    setFields((fs) => (fs ? fs.map((f) => (f.id === id ? { ...f, ...patch } : f)) : fs));
    setMessage(null);
  }

  async function save() {
    if (!fields) return;
    setSaving(true);
    setMessage(null);
    const ready = fields.filter((f) => f.verified && f.value.trim() !== "" && f.source.trim() !== "");
    const incomplete = fields.filter((f) => f.verified && (f.value.trim() === "" || f.source.trim() === "")).length;
    const entries = ready.map((f) => ({
      path: f.path,
      value: f.numeric ? Number(f.value) : f.value.trim(),
      unit: f.unit ?? undefined,
      source: f.source.trim(),
      status: "VERIFIED",
      verifiedAt: new Date().toISOString().slice(0, 10),
    }));
    const res = await saveOverrides(entries);
    setSaving(false);
    if (res.ok) {
      const note = incomplete > 0 ? ` (${incomplete} checked row${incomplete === 1 ? "" : "s"} skipped — needs a value and a citation)` : "";
      setMessage({ ok: true, text: `Saved ${res.count} verified value${res.count === 1 ? "" : "s"}.${note}` });
      const fresh = await getVerifiableFields();
      setFields(fresh);
    } else {
      setMessage({ ok: false, text: `Could not save: ${res.message}` });
    }
  }

  if (!fields) return <p className="note">Loading…</p>;

  const disciplines = Array.from(new Set(fields.map((f) => f.discipline)));
  const verifiedCount = fields.filter((f) => f.verified).length;

  return (
    <div>
      <div className="toolbar">
        <Link className="btn btn-secondary" href="/app">← Back to intake</Link>
      </div>

      <h1>Verify data — enter the engineer&apos;s answers</h1>
      <p className="note">
        Enter the values your <strong>licensed engineer</strong> provided (via the Engineer
        Verification Brief), each with the exact code citation, and tick <em>Verified</em>. Saved
        values are stored in <code>data/overrides.yaml</code> and merged on top of the code files —
        your commented data files are never changed. Only checked rows that have both a value and a
        citation are saved.
      </p>
      <p className="note">
        Classification rules and jurisdiction submittal triggers are structural logic and are edited
        in the data files (see <code>data/README.md</code>), not here.
      </p>

      <div className="banner banner--warn">
        <strong>Engineer-supplied values only</strong>
        {verifiedCount} of {fields.length} editable values are marked verified. Do not enter values
        that have not been confirmed by a licensed engineer against the cited code.
      </div>

      <div className="toolbar">
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save verified values"}
        </button>
        {message && (
          <span className={message.ok ? "save-ok" : "save-err"}>{message.text}</span>
        )}
      </div>

      {disciplines.map((discipline) => (
        <div className="card" key={discipline}>
          <h3>{discipline}</h3>
          <table className="report verify-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Verified</th>
                <th style={{ width: "28%" }}>Value</th>
                <th>Field</th>
                <th style={{ width: "34%" }}>Code citation (source)</th>
              </tr>
            </thead>
            <tbody>
              {fields
                .filter((f) => f.discipline === discipline)
                .map((f) => (
                  <tr key={f.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={f.verified}
                        onChange={(e) => update(f.id, { verified: e.target.checked })}
                        aria-label={`Mark ${f.label} verified`}
                      />
                    </td>
                    <td>
                      <input
                        type={f.numeric ? "number" : "text"}
                        step="any"
                        value={f.value}
                        placeholder={f.unit ? f.unit : ""}
                        onChange={(e) => update(f.id, { value: e.target.value })}
                      />
                    </td>
                    <td>
                      {f.label}
                      {f.unit ? <span className="source"> ({f.unit})</span> : null}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={f.source}
                        placeholder="e.g. CFC 2022 Table 3206.2"
                        onChange={(e) => update(f.id, { source: e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="toolbar">
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save verified values"}
        </button>
        {message && <span className={message.ok ? "save-ok" : "save-err"}>{message.text}</span>}
      </div>
    </div>
  );
}
