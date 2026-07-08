import Link from "next/link";
import { SITE } from "@/config/site";

// =====================================================================
//  TERMS OF SERVICE — legal surface: uses the LLC name throughout.
//  The B&P §6735 boundary language here is load-bearing; keep it aligned
//  with CLAUDE.md and the deliverables. Drafted in-house — attorney review
//  pending (tracked in CLAUDE.md).
// =====================================================================

export const metadata = {
  title: "Terms of Service — PermitWright",
  description: "Terms of service for PermitWright's jurisdiction research packages.",
};

export default function TermsPage() {
  return (
    <div className="lp">
      <section className="lp-section" style={{ maxWidth: "70ch" }}>
        <h1 className="lp-h1" style={{ fontSize: 30 }}>Terms of Service</h1>
        <p className="lp-body" style={{ color: "var(--muted)", fontSize: 14 }}>
          Effective July 8, 2026 · {SITE.legalName}
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20, marginTop: 28 }}>1. Who we are</h2>
        <p className="lp-body">
          &ldquo;PermitWright&rdquo; is a service of {SITE.legalName}, a California limited liability
          company (&ldquo;we,&rdquo; &ldquo;us&rdquo;). Contact:{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>2. What the service is — and is not</h2>
        <p className="lp-body">
          PermitWright provides <strong>code research and document preparation only</strong>. We are
          not an engineering firm and do not offer or perform professional engineering services
          within the meaning of California Business &amp; Professions Code §6735 or otherwise. All
          engineering judgment, design decisions, and responsible charge remain solely with the
          licensed engineer of record or other licensed professional you designate. Nothing in a
          deliverable constitutes an engineering determination, a code-compliance determination, or
          professional advice, and no professional–client relationship is created.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>3. Deliverables and your review duty</h2>
        <p className="lp-body">
          Deliverables are research drafts prepared for review, adaptation, and adoption by a
          licensed professional. You are responsible for independently verifying every citation,
          value, and statement before any use, submittal, or reliance. Items requiring professional
          judgment are flagged (e.g., &ldquo;[EOR: …]&rdquo;) and are deliberately not resolved by us.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>4. No guarantee of approval</h2>
        <p className="lp-body">
          Permit issuance, plan-check outcomes, and review timelines are controlled by the authority
          having jurisdiction. We do not guarantee acceptance, approval, or any particular outcome.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>5. Code currency</h2>
        <p className="lp-body">
          Research is prepared against the 2025 California Building Standards Code (including the
          2025 California Fire Code) and the local materials identified in the deliverable, current
          as of the date stated on the deliverable. Codes, local amendments, fees, forms, and agency
          practices change; confirm requirements with the authority having jurisdiction at submittal.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>6. Fees and turnaround</h2>
        <p className="lp-body">
          Unless otherwise agreed in writing: a flat fee of $750 per project, with delivery targeted
          within 48 hours of receiving complete project information. Turnaround runs from complete
          intake; incomplete or changed intake restarts the clock.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>7. Your responsibilities</h2>
        <p className="lp-body">
          You are responsible for the accuracy and completeness of the project information you
          provide, and for ensuring that any use of a deliverable in engineering work occurs under
          the responsible charge of an appropriately licensed professional.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>8. Intellectual property</h2>
        <p className="lp-body">
          Upon payment, you may use and adapt the deliverable for the project it was prepared for.
          We retain all rights in our templates, formats, and methods.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>9. Disclaimer and limitation of liability</h2>
        <p className="lp-body">
          Deliverables are provided &ldquo;as is&rdquo; without warranties of any kind, express or
          implied, beyond the description in these terms. To the maximum extent permitted by law,
          our total liability arising out of or relating to a deliverable or these terms is limited
          to the fees you paid for that deliverable, and we are not liable for indirect, incidental,
          special, or consequential damages.
        </p>

        <h2 className="lp-h2" style={{ fontSize: 20 }}>10. General</h2>
        <p className="lp-body">
          These terms are governed by California law. If any provision is unenforceable, the rest
          remain in effect. We may update these terms; the effective date above reflects the current
          version. Questions:{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>

        <p className="lp-body" style={{ marginTop: 28 }}>
          <Link href="/">← Back to PermitWright</Link>
        </p>
      </section>
    </div>
  );
}
