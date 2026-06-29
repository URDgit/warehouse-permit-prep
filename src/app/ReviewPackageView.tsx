"use client";

import { useState } from "react";
import type { ReviewPackage } from "@/engine/report/buildReviewPackage";
import type { CodeValue } from "@/engine/provenance";
import { renderMarkdown } from "@/engine/report/renderMarkdown";
import { inputRows } from "@/engine/report/inputRows";
import { downloadReviewPackagePdf, downloadVerificationBriefPdf, downloadSubmittalCoverPdf, assembleSubmittalPackagePdf, downloadSubmittalFormPdf } from "@/app/pdf/pdfBuilders";
import { specialInspectionForm, deferredSubmittalForm } from "@/engine/report/forms";
import { getVerificationBrief } from "@/app/actions";

function Badge({ cv }: { cv: CodeValue }) {
  if (cv.illustrative) return <span className="badge badge--illustrative">ILLUSTRATIVE</span>;
  return cv.isPlaceholder ? (
    <span className="badge badge--placeholder">PLACEHOLDER</span>
  ) : (
    <span className="badge badge--verified">VERIFIED</span>
  );
}

function valueText(cv: CodeValue): string {
  // Illustrative values render their (clearly-marked, unverified) example value.
  if (cv.illustrative) return `${String(cv.value)}${cv.unit ? ` ${cv.unit}` : ""}`;
  if (cv.isPlaceholder) return "— needs engineer —";
  return `${String(cv.value)}${cv.unit ? ` ${cv.unit}` : ""}`;
}

function applicabilityLabel(a: ReviewPackage["jurisdiction"]["requiredDocuments"][number]["applicability"]): string {
  if (a === "required") return "Required";
  if (a === "not_required") return "Not required";
  return "Verify applicability";
}

export default function ReviewPackageView({
  pkg,
  onClearIllustrative,
}: {
  pkg: ReviewPackage;
  onClearIllustrative?: () => void;
}) {
  const m = pkg.meta;
  const hasIllustrative = pkg.codeValuesUsed.some((cv) => cv.illustrative);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [briefBusy, setBriefBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [pkgFiles, setPkgFiles] = useState<File[]>([]);
  const [assembleBusy, setAssembleBusy] = useState(false);
  const [assembleErr, setAssembleErr] = useState("");
  const [formBusy, setFormBusy] = useState<"" | "si" | "ds">("");

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      await downloadReviewPackagePdf(pkg);
    } finally {
      setPdfBusy(false);
    }
  }

  async function downloadBriefPdf() {
    setBriefBusy(true);
    try {
      const brief = await getVerificationBrief();
      await downloadVerificationBriefPdf(brief);
    } finally {
      setBriefBusy(false);
    }
  }

  async function downloadCover() {
    setCoverBusy(true);
    try {
      await downloadSubmittalCoverPdf(pkg);
    } finally {
      setCoverBusy(false);
    }
  }

  function onPkgFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = e.target.files ? Array.from(e.target.files) : [];
    setPkgFiles((prev) => [...prev, ...fs]);
    setAssembleErr("");
    e.target.value = "";
  }
  function removeFile(i: number) {
    setPkgFiles((prev) => prev.filter((_, idx) => idx !== i));
  }
  function moveFile(i: number, dir: -1 | 1) {
    setPkgFiles((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  async function assemble() {
    setAssembleBusy(true);
    setAssembleErr("");
    try {
      await assembleSubmittalPackagePdf(pkg, pkgFiles);
    } catch (e) {
      setAssembleErr((e as Error).message);
    } finally {
      setAssembleBusy(false);
    }
  }

  async function downloadForm(kind: "si" | "ds") {
    setFormBusy(kind);
    try {
      const f = kind === "si" ? specialInspectionForm(pkg) : deferredSubmittalForm(pkg);
      await downloadSubmittalFormPdf(f);
    } finally {
      setFormBusy("");
    }
  }

  function downloadMarkdown() {
    const md = renderMarkdown(pkg);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${m.projectName.replace(/[^\w.-]+/g, "_") || "review-package"}_DRAFT.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {pkg.demo && (
        <div className="demo-ribbon" role="alert">
          DEMO MODE — every value below is FABRICATED. Not real, not code-based, not usable for any purpose.
        </div>
      )}
      {/* Non-negotiable disclaimer, top and prominent */}
      <div className="banner banner--danger" role="alert">
        <strong>Draft — not an engineered or approved document</strong>
        {m.disclaimer}
      </div>

      {hasIllustrative && (
        <div className="banner banner--illustrative" role="alert">
          <strong>Illustrative example values — not verified</strong>
          Values tagged{" "}
          <span className="badge badge--illustrative">ILLUSTRATIVE</span> are example numbers, shown so you
          can see the finished, fully-cited format. The <em>citations are real</em>; the <em>numbers are
          not</em> — replace each with your own engineer-verified value before use.
          {onClearIllustrative && (
            <div style={{ marginTop: 10 }}>
              <button className="btn" type="button" onClick={onClearIllustrative}>
                Clear &amp; enter my values
              </button>
            </div>
          )}
        </div>
      )}

      <ReadinessPanel r={pkg.readiness} />

      {pkg.dataIntegrity.some((i) => i.level === "error") && (
        <div className="banner banner--danger" role="alert">
          <strong>Data file problems detected</strong>
          The data files have structural errors that must be fixed before relying on this output:
          <ul>
            {pkg.dataIntegrity
              .filter((i) => i.level === "error")
              .map((i, idx) => (
                <li key={idx}>
                  <code>{i.file} › {i.path}</code> — {i.message}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="toolbar">
        <button className="btn btn-secondary" onClick={downloadPdf} disabled={pdfBusy}>
          {pdfBusy ? "Generating…" : "⤓ Download PDF"}
        </button>
        <button className="btn btn-secondary" onClick={downloadCover} disabled={coverBusy}>
          {coverBusy ? "Generating…" : "Submittal cover (PDF)"}
        </button>
        <button className="btn btn-secondary" onClick={() => downloadForm("si")} disabled={formBusy !== ""}>
          {formBusy === "si" ? "Generating…" : "Special inspections (PDF)"}
        </button>
        <button className="btn btn-secondary" onClick={() => downloadForm("ds")} disabled={formBusy !== ""}>
          {formBusy === "ds" ? "Generating…" : "Deferred submittals (PDF)"}
        </button>
        <button className="btn btn-secondary" onClick={downloadMarkdown}>
          Markdown
        </button>
        <button className="btn btn-secondary" onClick={downloadBriefPdf} disabled={briefBusy}>
          {briefBusy ? "Generating…" : "Engineer Brief (PDF)"}
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <details className="assembler">
        <summary>Assemble combined submittal package (cover + your calc PDFs)</summary>
        <p className="note">
          Combine the submittal cover with your own stamped PDFs (rack/seismic calculations, anchor
          reports, drawings) into one file, in order, ready to upload to the AHJ. Files are merged in
          your browser and never uploaded anywhere.
        </p>
        <input type="file" accept="application/pdf" multiple onChange={onPkgFiles} />
        {pkgFiles.length > 0 && (
          <table className="report">
            <thead>
              <tr><th style={{ width: 40 }}>#</th><th>File (after the cover)</th><th style={{ width: 130 }}>Order</th></tr>
            </thead>
            <tbody>
              {pkgFiles.map((f, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{f.name}</td>
                  <td>
                    <button className="btn btn-secondary" disabled={i === 0} onClick={() => moveFile(i, -1)}>↑</button>{" "}
                    <button className="btn btn-secondary" disabled={i === pkgFiles.length - 1} onClick={() => moveFile(i, 1)}>↓</button>{" "}
                    <button className="btn btn-secondary" onClick={() => removeFile(i)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="toolbar">
          <button className="btn" onClick={assemble} disabled={assembleBusy || pkgFiles.length === 0}>
            {assembleBusy ? "Assembling…" : "⤓ Download combined package PDF"}
          </button>
          {assembleErr && <span className="save-err">{assembleErr}</span>}
        </div>
      </details>

      <div className="card">
        {(m.firm.firmName || m.firm.firmAddress || m.firm.firmContact) && (
          <div className="letterhead">
            {m.firm.firmName && <div className="letterhead__name">{m.firm.firmName}</div>}
            {m.firm.firmAddress && <div className="letterhead__line">{m.firm.firmAddress}</div>}
            {m.firm.firmContact && <div className="letterhead__line">{m.firm.firmContact}</div>}
          </div>
        )}
        <h1>{m.title}</h1>
        <div className="kv">
          <div><strong>Project:</strong> {m.projectName}</div>
          <div><strong>Prepared by:</strong> {m.preparedBy} &nbsp;·&nbsp; <strong>Date:</strong> {m.preparedDate}</div>
          <div><strong>Jurisdiction:</strong> {m.jurisdiction}</div>
          <div><strong>Generated:</strong> {m.generatedAt}</div>
        </div>
        <h3>Code basis (subject to verification)</h3>
        <ul className="note">
          {m.codeBasis.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      {/* 1. Inputs */}
      <h2>1. Inputs provided</h2>
      <InputsTable pkg={pkg} />

      {/* 2. Classification */}
      <h2>2. Commodity classification</h2>
      <div className="card">
        <p>
          <strong>Result:</strong>{" "}
          {pkg.classification.commodityClass.isPlaceholder
            ? "UNDETERMINED"
            : String(pkg.classification.commodityClass.value)}{" "}
          <Badge cv={pkg.classification.commodityClass} />
        </p>
        <p className="source">Source: {pkg.classification.commodityClass.source}</p>
        {pkg.classification.commodityClass.todo && (
          <p className="note">TODO: {pkg.classification.commodityClass.todo}</p>
        )}
        {pkg.classification.dataIssues.length > 0 && (
          <p className="note"><strong>Rule data issues:</strong> {pkg.classification.dataIssues.join(" ")}</p>
        )}
        <h3>Triggered fire-code requirements</h3>
        <table className="report">
          <thead>
            <tr><th>Requirement</th><th>Value</th><th>Status</th><th>Source</th></tr>
          </thead>
          <tbody>
            {pkg.classification.triggeredRequirements.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{valueText(r.codeValue)}</td>
                <td><Badge cv={r.codeValue} /></td>
                <td className="source">{r.codeValue.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Calculations */}
      <h2>3. Calculations</h2>
      {[pkg.calculations.seismic, pkg.calculations.anchorage].map((calc) => (
        <div className="card" key={calc.id}>
          <h3>{calc.label} <Badge cv={calc.result} /></h3>
          <p><strong>Result:</strong> {valueText(calc.result)}</p>
          <p className="source">
            Formula reference: {valueText(calc.formula)} ({calc.formula.source})
          </p>
          {calc.result.todo && <p className="note"><strong>Why not computed:</strong> {calc.result.todo}</p>}
          <p className="kv"><strong>Inputs used:</strong> {JSON.stringify(calc.inputsUsed)}</p>
          {calc.audit.assumptions.length > 0 && (
            <>
              <p className="kv"><strong>Assumptions:</strong></p>
              <ul className="note">
                {calc.audit.assumptions.map((a, idx) => <li key={idx}>{a}</li>)}
              </ul>
            </>
          )}
        </div>
      ))}

      {/* 4. Jurisdiction */}
      <h2>4. {pkg.jurisdiction.jurisdictionName} — submittal documents</h2>
      <div className="card">
        {pkg.jurisdiction.reviewingAgencies.length > 0 && (
          <ul className="note">
            {pkg.jurisdiction.reviewingAgencies.map((a) => <li key={a}>{a}</li>)}
          </ul>
        )}
        {pkg.jurisdiction.dataIssues.length > 0 && (
          <p className="note"><strong>Submittal trigger data issues:</strong> {pkg.jurisdiction.dataIssues.join(" ")}</p>
        )}
        <table className="report">
          <thead>
            <tr><th>Document</th><th>Applicability</th><th>Source</th></tr>
          </thead>
          <tbody>
            {pkg.jurisdiction.requiredDocuments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>
                  {applicabilityLabel(d.applicability)} <Badge cv={d.status} />
                  <br /><span className="source">{d.reason}</span>
                </td>
                <td className="source">{d.status.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pkg.jurisdiction.localSubmittal.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Local jurisdiction specifics</h2>
          <p className="note">
            How this jurisdiction handles submittals — plan portal, the fire AHJ that reviews
            high-piled storage, and any local guidance. These are administrative facts gathered
            from the AHJ; confirm each is current before relying on it.
          </p>
          <table className="report">
            <thead><tr><th>Item</th><th>Detail</th><th>Source</th></tr></thead>
            <tbody>
              {pkg.jurisdiction.localSubmittal.map((n) => (
                <tr key={n.id}>
                  <td>{n.label}</td>
                  <td>
                    {n.detail}
                    {n.url && (<><br /><a href={n.url} target="_blank" rel="noreferrer">{n.url}</a></>)}
                  </td>
                  <td className="source">{n.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(pkg.jurisdiction.planContent.length > 0 || pkg.jurisdiction.structuralSubmittal.length > 0) && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Submittal requirements checklist</h2>
          <p className="note">
            Code-grounded checklist to help assemble a complete, site-specific package (an incomplete
            or generic package is the most common reason for plan-check rejection). Confirm each
            citation against the current adopted code.
          </p>
          {pkg.jurisdiction.planContent.length > 0 && (
            <>
              <h3>What the plans must show</h3>
              <table className="report">
                <thead><tr><th style={{ width: 34 }}>✓</th><th>Item</th><th>Source</th></tr></thead>
                <tbody>
                  {pkg.jurisdiction.planContent.map((it) => (
                    <tr key={it.id}><td>☐</td><td>{it.name}</td><td className="source">{it.source}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {pkg.jurisdiction.structuralSubmittal.length > 0 && (
            <>
              <h3>Structural / fire documents</h3>
              <table className="report">
                <thead><tr><th style={{ width: 34 }}>✓</th><th>Item</th><th>Source</th></tr></thead>
                <tbody>
                  {pkg.jurisdiction.structuralSubmittal.map((it) => (
                    <tr key={it.id}><td>☐</td><td>{it.name}</td><td className="source">{it.source}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* 5. All code values */}
      <h2>5. All code values used (with citations)</h2>
      <div className="card">
        <table className="report">
          <thead>
            <tr><th>Value</th><th>Result</th><th>Status</th><th>Source</th></tr>
          </thead>
          <tbody>
            {pkg.codeValuesUsed.map((cv) => (
              <tr key={cv.id}>
                <td>{cv.label}</td>
                <td>{valueText(cv)}</td>
                <td><Badge cv={cv} /></td>
                <td className="source">{cv.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Assumptions */}
      <h2>6. Assumptions</h2>
      <div className="card">
        {pkg.assumptions.length === 0 ? (
          <p className="note">None recorded.</p>
        ) : (
          <ul>{pkg.assumptions.map((a, idx) => <li key={idx}>{a}</li>)}</ul>
        )}
      </div>

      {/* 7. Audit trail */}
      <h2>7. Audit trail</h2>
      <div className="card audit">
        {pkg.auditTrail.map((a, idx) => (
          <div className={`audit__entry ${a.status === "ok" ? "" : "blocked"}`} key={idx}>
            <strong>{a.step}</strong>{" "}
            {a.status === "ok" ? (
              <span className="badge badge--verified">OK</span>
            ) : (
              <span className="badge badge--placeholder">BLOCKED BY PLACEHOLDER</span>
            )}
            <p>{a.description}</p>
            <p className="kv"><strong>Inputs used:</strong> {JSON.stringify(a.inputsUsed)}</p>
            <p className="kv">
              <strong>Code values / rules:</strong>{" "}
              {a.codeValues.map((c) => `${c.label} (${c.source})`).join("; ") || "none"}
            </p>
            <p className="kv"><strong>Result:</strong> {JSON.stringify(a.result)}</p>
          </div>
        ))}
      </div>

      <div className="stampblock">
        <h3>Engineer of record — review &amp; seal</h3>
        <p className="note">This package is a draft until signed and sealed by the engineer of record below.</p>
        <div className="kv">
          <div><strong>Engineer of record:</strong> {m.firm.engineerName || "________________________"}</div>
          <div><strong>License:</strong> {[m.firm.licenseType, m.firm.licenseNumber].filter(Boolean).join(" ") || "________________________"}</div>
          <div style={{ marginTop: 10 }}>Signature: ______________________________&nbsp;&nbsp;&nbsp;Date: ______________</div>
        </div>
        <div className="stampblock__seal">Seal / stamp</div>
        {m.firm.standardNotes && <p className="note"><strong>Firm notes:</strong> {m.firm.standardNotes}</p>}
      </div>

      <div className="banner banner--danger" role="alert" style={{ marginTop: 20 }}>
        <strong>Reminder</strong>
        {m.disclaimer}
      </div>
    </div>
  );
}

function ReadinessPanel({ r }: { r: ReviewPackage["readiness"] }) {
  const pct = r.totalCodeValues ? Math.round((r.verifiedCount / r.totalCodeValues) * 100) : 0;
  return (
    <div className={`readiness ${r.isSubmittalReady ? "readiness--ready" : "readiness--blocked"}`}>
      <div className="readiness__head">
        <strong>{r.isSubmittalReady ? "✓ All code values verified" : "Not ready for engineer submittal"}</strong>
        <span className="readiness__count">
          {r.verifiedCount}/{r.totalCodeValues} verified · {r.placeholderCount} outstanding
        </span>
      </div>
      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress__bar" style={{ width: `${pct}%` }} />
      </div>
      {r.blockedCalcs.length > 0 && (
        <p className="note"><strong>Calculations not computed:</strong> {r.blockedCalcs.join(", ")}.</p>
      )}
      {r.dataIssues.length > 0 && (
        <p className="note"><strong>Rule data issues:</strong> {r.dataIssues.join(" ")}</p>
      )}
      {r.byArea.length > 0 && (
        <>
          <h3>What a licensed engineer still needs to resolve</h3>
          {r.byArea.map((g) => (
            <div className="readiness__group" key={g.area}>
              <div className="readiness__area">
                {g.area} <span className="badge badge--placeholder">{g.items.length}</span>
              </div>
              <table className="report">
                <thead>
                  <tr>
                    <th style={{ width: "28%" }}>Item</th>
                    <th>What&apos;s needed</th>
                    <th style={{ width: "24%" }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.label}</td>
                      <td>{it.need}</td>
                      <td className="source">{it.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function InputsTable({ pkg }: { pkg: ReviewPackage }) {
  const rows = inputRows(pkg.inputs);
  return (
    <div className="card">
      <table className="report">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th style={{ width: "40%" }}>{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
