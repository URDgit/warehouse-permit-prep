import { SITE } from "@/config/site";

// =====================================================================
//  LANDING PAGE — done-for-you research service (public one-pager)
// =====================================================================
//  Current phase: PermitWright sells jurisdiction-specific research packages
//  to California structural engineers (flat fee, 48-hour turnaround). All
//  copy/pricing/package contents come from src/config/site.ts so the future
//  SaaS phase can reuse the structure. No auth links, no signup, no pricing
//  tiers — the only CTA is the sample-request mailto.
//
//  LEGAL POSITIONING (load-bearing): research + document prep only; the
//  licensed engineer of record keeps all judgment and responsible charge.
// =====================================================================

export default function LandingPage() {
  return (
    <div className="lp">
      {/* Hero */}
      <section className="lp-hero lp-hero--single">
        <div className="lp-hero__text">
          <p className="lp-eyebrow">{SITE.hero.eyebrow}</p>
          <h1 className="lp-h1">{SITE.hero.headline}</h1>
          <p className="lp-sub">{SITE.hero.subhead}</p>
          <p className="lp-pricing-line">{SITE.hero.pricingLine}</p>
          <div className="lp-cta">
            <a className="btn" href={SITE.sampleRequestHref}>{SITE.hero.cta}</a>
          </div>
        </div>
      </section>

      {/* EOR positioning strip (prominent) */}
      <section className="lp-eor" role="note">
        <strong>Your seal. Your judgment. Our legwork.</strong>
        {SITE.eorStatement}
      </section>

      {/* What's in every package */}
      <section className="lp-section">
        <h2 className="lp-h2">What&apos;s in every package</h2>
        <p className="lp-body">{SITE.packageIntro}</p>
        <div className="lp-features">
          {SITE.packageContents.map((item) => (
            <div className="lp-feature" key={item.title}>
              <strong>{item.title}</strong> — {item.detail}
            </div>
          ))}
        </div>
        <p className="lp-code-currency">{SITE.codeCurrencyLine}</p>
      </section>

      {/* How it works */}
      <section className="lp-section">
        <h2 className="lp-h2">How it works</h2>
        <div className="lp-steps">
          {SITE.steps.map((step, i) => (
            <div className="lp-step" key={step.title}>
              <div className="lp-step__n">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / contact */}
      <section className="lp-section">
        <h2 className="lp-h2">Who&apos;s behind it</h2>
        <p className="lp-body">{SITE.aboutParagraph}</p>
        <p className="lp-body">
          Questions or a project ready to go:{" "}
          <a href={`mailto:${SITE.contactEmail}`}><strong>{SITE.contactEmail}</strong></a>
        </p>
      </section>

      {/* Closing CTA */}
      <section className="lp-final">
        <h2 className="lp-h2">Stop spending billable hours on legwork.</h2>
        <p className="lp-pricing-line">{SITE.hero.pricingLine}</p>
        <div className="lp-cta">
          <a className="btn" href={SITE.sampleRequestHref}>{SITE.hero.cta}</a>
        </div>
      </section>
    </div>
  );
}
