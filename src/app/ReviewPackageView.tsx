"use client";

import type { ReviewPackage } from "@/engine/report/buildReviewPackage";
import type { CodeValue } from "@/engine/provenance";
import { renderMarkdown } from "@/engine/report/renderMarkdown";
import { inputRows } from "@/engine/report/inputRows";
import { downloadReviewPackagePdf } from "@/app/pdf/pdfBuilders";

function Badge({ cv }: { cv: CodeValue }) {
  return cv.isPlaceholder ? (
    <span className="badge badge--placeholder">PLACEHOLDER</span>
  ) : (
    <span className="badge badge--verified">VERIFIED</span>
  );
}

function valueText(cv: CodeValue): string {
  if (cv.isPlaceholder) return "— needs engineer —";
  return `${String(cv.value)}${cv.unit ? ` ${cv.unit}` : ""}`;
}

function applicabilityLabel(a: ReviewPackage["jurisdiction"]["requiredDocuments"][number]["applicability"]): string {
  if (a === "required") return "Required";
  if (a === "not_required") return "Not required";
  return "Verify applicability";
}

export default function ReviewPackageView({ pkg }: { pkg: ReviewPackage }) {
  const m = pkg.meta;

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
      {/* Non-negotiable disclaimer, top and prominent */}
      <div className="banner banner--danger" role="alert">
        <strong>Draft — not an engineered or approved document</strong>
        {m.disclaimer}
      </div>

      <ReadinessPanel r={pkg.readiness} />

      <div className="toolbar">
        <button className="btn btn-secondary" onClick={() => downloadReviewPackagePdf(pkg)}>
          ⤓ Download PDF
        </button>
        <button className="btn btn-secondary" onClick={downloadMarkdown}>
          Markdown
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <div className="card">
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
