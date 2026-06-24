"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getFirmProfile } from "@/app/actions";
import { loadClientData, saveClientData } from "@/lib/store/clientStore";
import { downloadCorrectionLetterPdf } from "@/app/pdf/pdfBuilders";
import type { Correction, CorrectionLetterData } from "@/engine/corrections";
import { jurisdictionName } from "@/engine/jurisdictions/registry";

const PROJECTS_KEY = "wpp-projects-v1";
const CORR_KEY = "wpp-corrections-v1";
const AGENCIES = ["Building & Safety", "Fire", "Other"];

interface ProjMeta {
  id: string;
  name: string;
  address: string;
  jurisdiction: string;
}
interface CorrSet {
  revision: number;
  items: Correction[];
}
type CorrStore = Record<string, CorrSet>;

function nid() {
  return Math.random().toString(36).slice(2, 9);
}

function mapProjects(store: { activeId?: string; projects?: any[] } | null): { activeId: string; projects: ProjMeta[] } {
  const list = Array.isArray(store?.projects) ? store!.projects : [];
  const projects: ProjMeta[] = list.map((p: any) => ({
    id: String(p.id),
    name: p.form?.project?.projectName || "Untitled project",
    address: p.form?.building?.address || "",
    jurisdiction: jurisdictionName(p.form?.project?.jurisdiction ?? "los-angeles"),
  }));
  return { activeId: store?.activeId ?? projects[0]?.id ?? "", projects };
}

export default function CorrectionsPage() {
  const [projects, setProjects] = useState<ProjMeta[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [store, setStore] = useState<CorrStore>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const projStore = await loadClientData<{ activeId?: string; projects?: any[] } | null>(
        "projects",
        PROJECTS_KEY,
        null,
      );
      const { activeId, projects } = mapProjects(projStore);
      const corr = await loadClientData<CorrStore>("corrections", CORR_KEY, {});
      if (cancelled) return;
      setProjects(projects);
      setSelected(activeId);
      setStore(corr ?? {});
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current: CorrSet = store[selected] ?? { revision: 1, items: [] };

  // Debounce persistence: edits fire on every keystroke.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function persist(next: CorrStore) {
    setStore(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveClientData("corrections", CORR_KEY, next);
    }, 700);
  }
  function setCurrent(patch: Partial<CorrSet>) {
    if (!selected) return;
    persist({ ...store, [selected]: { ...current, ...patch } });
  }
  function addItem() {
    setCurrent({ items: [...current.items, { id: nid(), number: String(current.items.length + 1), agency: "Building & Safety", codeRef: "", comment: "", response: "", status: "open" }] });
  }
  function updItem(id: string, patch: Partial<Correction>) {
    setCurrent({ items: current.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  }
  function delItem(id: string) {
    setCurrent({ items: current.items.filter((it) => it.id !== id) });
  }

  async function generateLetter() {
    const firm = await getFirmProfile();
    const proj = projects.find((p) => p.id === selected);
    const data: CorrectionLetterData = {
      firmName: firm.firmName,
      firmAddress: firm.firmAddress,
      firmContact: firm.firmContact,
      engineerName: firm.engineerName,
      licenseType: firm.licenseType,
      licenseNumber: firm.licenseNumber,
      projectName: proj?.name ?? "Project",
      projectAddress: proj?.address ?? "",
      jurisdiction: proj?.jurisdiction ?? "(jurisdiction not set)",
      revision: current.revision,
      generatedAt: new Date().toISOString().slice(0, 10),
      items: current.items,
      disclaimer: "Prepared with a permit-preparation aid. Review, verify, sign and seal by the engineer of record before submittal.",
    };
    await downloadCorrectionLetterPdf(data);
  }

  const open = current.items.filter((i) => i.status === "open").length;

  return (
    <div>
      <div className="toolbar">
        <Link className="btn btn-secondary" href="/">← Back to intake</Link>
      </div>

      <h1>Plan-check corrections</h1>
      <p className="note">
        Log the corrections the building/fire department issued, write your responses, and generate
        a <strong>Correction Response Letter</strong> to submit with your resubmittal. Saved to your
        account when signed in (otherwise this browser), per project.
      </p>

      {projects.length === 0 ? (
        <div className="banner banner--warn">
          <strong>No projects yet</strong>
          Create a project on the intake screen first; corrections are tracked per project.
        </div>
      ) : (
        <>
          <div className="projectbar">
            <label className="projectbar__select">
              <span>Project</span>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <span>Plan-check round</span>
              <input type="number" min={1} style={{ width: 70 }} value={current.revision} onChange={(e) => setCurrent({ revision: Math.max(1, Number(e.target.value) || 1) })} />
            </label>
            <span className="note">{open} open · {current.items.length} total</span>
          </div>

          {current.items.length === 0 && <p className="note">No corrections logged for this project yet.</p>}

          {current.items.map((it) => (
            <div className="card preset" key={it.id}>
              <div className="grid">
                <label className="field"><span>Comment #</span><input value={it.number} onChange={(e) => updItem(it.id, { number: e.target.value })} /></label>
                <label className="field"><span>Agency</span>
                  <select value={it.agency} onChange={(e) => updItem(it.id, { agency: e.target.value })}>
                    {AGENCIES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </label>
                <label className="field"><span>Code reference (optional)</span><input value={it.codeRef} onChange={(e) => updItem(it.id, { codeRef: e.target.value })} /></label>
                <label className="field"><span>Status</span>
                  <select value={it.status} onChange={(e) => updItem(it.id, { status: e.target.value as Correction["status"] })}>
                    <option value="open">open</option>
                    <option value="addressed">addressed</option>
                  </select>
                </label>
              </div>
              <label className="field"><span>Reviewer comment</span><textarea rows={2} value={it.comment} onChange={(e) => updItem(it.id, { comment: e.target.value })} /></label>
              <label className="field"><span>Response</span><textarea rows={2} value={it.response} onChange={(e) => updItem(it.id, { response: e.target.value })} /></label>
              <div className="toolbar"><button type="button" className="btn btn-secondary" onClick={() => delItem(it.id)}>✕ Remove</button></div>
            </div>
          ))}

          <div className="toolbar">
            <button type="button" className="btn btn-secondary" onClick={addItem}>+ Add correction</button>
            <button type="button" className="btn" onClick={generateLetter}>⤓ Correction Response Letter (PDF)</button>
          </div>
        </>
      )}
    </div>
  );
}
