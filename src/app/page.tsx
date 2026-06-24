import Link from "next/link";

// =====================================================================
//  LANDING PAGE  (public marketing front door — static server component)
// =====================================================================
//  The intake tool lives at /app (gated when REQUIRE_AUTH is on). This page
//  stays public via PUBLIC_PATHS in the middleware. Copy is deliberately
//  outcome-led and honest about scope (drafting aid; engineer stays EoR) —
//  the trust posture that works for skeptical licensed engineers.
// =====================================================================

export default function LandingPage() {
  return (
    <div className="lp">
      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero__text">
          <p className="lp-eyebrow">For California PEs, SEs &amp; permit consultants</p>
          <h1 className="lp-h1">A complete rack-permit package, the first time.</h1>
          <p className="lp-sub">
            RackWright helps you assemble code-cited, site-specific high-piled storage and
            storage-rack permit submittals — so plan check doesn&apos;t bounce them back. You bring
            the engineering judgment; RackWright handles the assembly.
          </p>
          <div className="lp-cta">
            <Link className="btn" href="/login">Sign in</Link>
            <Link className="btn btn-secondary" href="/app">Open the app →</Link>
          </div>
          <p className="lp-microtrust">
            Built on CFC 2022 · ASCE 7-16 · ANSI/RMI MH16.1 · ACI 318 — every value cited to code.
          </p>
        </div>

        {/* Real-product visual: a sample cited report row + audit trail */}
        <div className="lp-preview" aria-hidden="true">
          <div className="lp-preview__bar"><span /><span /><span /></div>
          <div className="lp-preview__body">
            <div className="lp-preview__h">Code values used</div>
            <div className="lp-preview__row">
              <span>Commodity classification</span>
              <span className="badge badge--verified">VERIFIED</span>
            </div>
            <div className="lp-preview__src">Source: CFC 2022 §3203 / Table 3203.8</div>
            <div className="lp-preview__row">
              <span>Min. aisle width</span>
              <span className="badge badge--verified">VERIFIED</span>
            </div>
            <div className="lp-preview__src">Source: CFC 2022 §3206.9</div>
            <div className="lp-preview__row">
              <span>Seismic design path</span>
              <span className="badge badge--placeholder">VERIFY</span>
            </div>
            <div className="lp-preview__src">Source: ASCE 7-16 §15.5.3 — engineer confirms</div>
            <div className="lp-preview__audit">Audit trail · every value traced to its citation</div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="lp-trust">
        <div><strong>Cited to code</strong><span>Every value carries its CFC / ASCE / RMI reference</span></div>
        <div><strong>Full audit trail</strong><span>Show reviewers exactly how the package was built</span></div>
        <div><strong>128 CA jurisdictions</strong><span>Submittal checklists tuned per building &amp; fire AHJ</span></div>
        <div><strong>You stay the EoR</strong><span>You verify every value and apply your own seal</span></div>
      </section>

      {/* Problem */}
      <section className="lp-section">
        <h2 className="lp-h2">Incomplete packages are the #1 reason plan check sends it back</h2>
        <p className="lp-body">
          A submittal that&apos;s missing a required sheet, a commodity classification, a flue-space
          dimension, or a jurisdiction-specific form gets corrected and re-queued — costing you
          weeks per project. RackWright&apos;s job is to make sure the package that leaves your desk is
          <strong> complete and site-specific</strong> before it ever reaches the reviewer.
        </p>
      </section>

      {/* How it works */}
      <section className="lp-section">
        <h2 className="lp-h2">How it works</h2>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step__n">1</div>
            <h3>Enter the project</h3>
            <p>Building, racks, commodity, slab, and jurisdiction. Reusable libraries pre-fill your
              usual anchors and commodities.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step__n">2</div>
            <h3>Get a code-cited draft</h3>
            <p>A submittal checklist for that AHJ, classification and code references, readiness
              flags, and a complete audit trail — nothing invented, everything cited.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step__n">3</div>
            <h3>Verify, assemble &amp; seal</h3>
            <p>Add your verified values, merge your own calc PDFs, brand it with your letterhead,
              then review, seal, and submit. You remain the engineer of record.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-section">
        <h2 className="lp-h2">What&apos;s in the package</h2>
        <div className="lp-features">
          <div className="lp-feature"><strong>Submittal checklists</strong> per jurisdiction — plan-content (CFC §3201.3), structural &amp; fire documents, special inspections, deferred submittals.</div>
          <div className="lp-feature"><strong>Local AHJ specifics</strong> for major markets — the plan portal and the fire authority that actually reviews high-piled storage.</div>
          <div className="lp-feature"><strong>Engineer verification brief</strong> — a clean list of every value you must confirm, with its code citation.</div>
          <div className="lp-feature"><strong>Plan-check correction tracker</strong> &amp; one-click correction-response letters for resubmittals.</div>
          <div className="lp-feature"><strong>Combined-package assembler</strong> — merge your stamped calc PDFs with a cover and sheet index into one file.</div>
          <div className="lp-feature"><strong>Your firm&apos;s letterhead &amp; seal block</strong> on every output, saved to your account.</div>
        </div>
      </section>

      {/* Pricing */}
      <section className="lp-section">
        <h2 className="lp-h2">Simple pricing</h2>
        <div className="lp-pricing">
          <div className="lp-price-card">
            <div className="lp-price">$99<span>/mo</span></div>
            <div className="lp-price__per">per engineer · billed monthly · cancel anytime</div>
            <ul className="lp-price__list">
              <li>Unlimited projects &amp; packages</li>
              <li>All 128 California jurisdictions</li>
              <li>Correction tracker, forms &amp; PDF assembler</li>
              <li>Your firm letterhead &amp; account storage</li>
            </ul>
            <Link className="btn" href="/login">Sign in to get started</Link>
          </div>
          <p className="lp-roi">
            “The first package it saved me from a resubmittal paid for the year.” — what a complete,
            site-specific submittal is worth.
          </p>
        </div>
      </section>

      {/* Honest scope */}
      <section className="lp-section">
        <div className="banner banner--warn lp-scope">
          <strong>What RackWright is — and isn&apos;t</strong>
          RackWright is a drafting and assembly aid. It organizes, validates, cites, and assembles your
          submittal package. It does <em>not</em> perform engineering analysis, choose values for you,
          or guarantee approval. You confirm every value against the cited code, apply your seal, and
          remain the engineer of record. Output is a draft until you sign and stamp it.
        </div>
      </section>

      {/* Closing CTA */}
      <section className="lp-final">
        <h2 className="lp-h2">Stop getting bounced at plan check.</h2>
        <div className="lp-cta">
          <Link className="btn" href="/login">Sign in</Link>
          <Link className="btn btn-secondary" href="/app">Open the app →</Link>
        </div>
      </section>
    </div>
  );
}
