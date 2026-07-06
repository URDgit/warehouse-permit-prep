# PermitWright — Project Context & Current Task

## What PermitWright is

PermitWright (permitwright.com) is a business serving **California structural engineers** who handle **high-piled storage permits** for warehouses. It is owned by Uriel Rojas (Southern California). A dedicated entity, **PermitWright LLC**, is being formed now via Northwest Registered Agent (California, single-member, member-managed). It is deliberately separate from the owner's other entities (TCI Supply Inc. and Norvance Group LLC) — never reference or co-mingle those in this codebase.

## Strategic pivot (IMPORTANT — this changes the site's whole framing)

The original plan was a **$99/month SaaS** generating jurisdiction-specific permit packages. That is now the **future phase**, not the current one.

**Current phase (LIVE as of July 6, 2026 — awaiting first replies):** a manual, done-for-you service — "Model A":
- Sell **jurisdiction-specific research packages** directly to structural engineers
- **Flat $750 per project, 48-hour turnaround**
- The engineer remains **Engineer of Record (EOR)**; PermitWright provides code research and document preparation ONLY — never engineering judgment, design, or responsible charge (California B&P Code §6735 boundary; this positioning is legally load-bearing, preserve it in all copy)
- Each manual delivery doubles as market research and product spec for the eventual SaaS

**Future phase (do not build yet, but architect with it in mind):** SaaS that automates package generation — a jurisdictional rules engine producing the same deliverables. When writing site code, keep structure/content separation clean (e.g., package contents, jurisdictions, and pricing as data/config rather than hardcoded prose) so the marketing site can later grow into a product site with auth, billing, and a generation pipeline without a rewrite.

## What's in a research package (the product being sold now)

1. AHJ submittal checklist (jurisdiction-specific, incl. local amendments & plan-review quirks)
2. Applicable **2025 California Fire Code** Chapter 32 sections triggered by the project
3. Commodity classification worksheet
4. Storage height / area trigger analysis
5. Draft permit narrative formatted to the AHJ's conventions, for the engineer to adapt and stamp

## CRITICAL: code-cycle corrections (highest priority site task)

The existing site cites **outdated codes**. This must be fixed before any outreach traffic arrives:

- Replace every instance of **"CFC 2022"** → **"2025 California Fire Code"** (part of the 2025 California Building Standards Code, effective January 1, 2026)
- Replace every instance of **"ASCE 7-16"** → **"ASCE 7-22"**
- Grep the entire codebase (components, meta tags, alt text, footers, JSON/config, sample content) for `2022` and `7-16` to catch stragglers

## Site changes (in priority order)

1. **Code citations** — as above, sitewide
2. **Hero repositioning** — from SaaS/pre-launch to live service:
   - Headline: "High-piled storage permit research, done before you start."
   - Subhead: "Jurisdiction-specific research packages for California structural engineers. Every code section, submittal requirement, and worksheet prepared — so your billable hours go to the engineering, not the legwork."
   - Pricing line: "Flat $750 per project. 48-hour turnaround."
   - Primary CTA: **"Request a Sample Package"** → mailto:uriel@permitwright.com (subject: "Sample Package Request")
3. **Remove all** "coming soon" / waitlist / "$99/month" / pre-launch elements
4. **EOR positioning strip** (prominent): "PermitWright provides code research and document preparation only. All engineering judgment, design decisions, and responsible charge remain with the licensed engineer of record. We make your job faster — we don't practice it."
5. **"What's in every package"** section — the 5 items above, plus: "Current with the 2025 California Building Standards Code (effective January 1, 2026) and ASCE 7-22."
6. **"How it works"** — 3 steps: (1) Send project basics (jurisdiction, storage height, commodity types, building details — a 5-minute email). (2) Receive your package in 48 hours. (3) You do the engineering: review, apply judgment, adapt, stamp.
7. **About/contact** — real name (Uriel Rojas), Southern California, uriel@permitwright.com. No anonymous-startup vibe.
8. **Footer** — "© 2026 PermitWright · Southern California · Code research current to the 2025 California Building Standards Code."
9. **Meta tags** — Title: "PermitWright — High-Piled Storage Permit Research for California Engineers". Description: "Jurisdiction-specific research packages for high-piled storage permits. 2025 CFC current. Flat $750, 48-hour turnaround. Engineering judgment stays with you."

## What NOT to build right now

- No pricing tiers page, no testimonials placeholders, no blog, no auth, no payment processing, no dashboard
- A tight, accurate one-pager beats a five-page site with stale references
- Do not add any language implying PermitWright performs engineering ("permit engineering," "we design," "our engineers") — copy must always position the customer's engineer as the one practicing engineering

## Tone & audience notes

- Audience: licensed California structural engineers — skeptical, detail-oriented, will check code citations
- Voice: direct, competent, zero startup fluff; time-savings framing ("your billable hours go to the engineering")
- Any code reference must be current-cycle correct or omitted — a wrong citation to this audience is fatal to credibility

## Sequencing context (for awareness, not action)

- **Outreach LAUNCHED July 6, 2026:** five cold emails sent to structural engineering principals (pain-first draft, free-sample CTA, sent manually from uriel@permitwright.com). Recipients: Storage Rack Engineering, Burke Structural, T&B Engineering, YA Creative, JMC2 — tracked in `outreach/prospects.csv` (`sent_date`/`status` columns). Business state is **"live service awaiting first replies," not pre-launch**.
- PermitWright LLC filing is in progress; EIN → Bluevine bank account → ToS on letterhead follow
- First sample package will be built manually for whichever jurisdiction the first engineer reply names; that deliverable becomes the template for future packages and, eventually, the SaaS output spec

## Email infrastructure (live as of July 6, 2026)

- Business email: **uriel@permitwright.com** on Google Workspace (Business Starter, 1 seat). Sends AND receives — the inbound-email blocker from the site work order is **RESOLVED**. The site's mailto CTA is fully functional.
- DNS (Cloudflare, permitwright.com zone): MX → `smtp.google.com`. Root TXT SPF: `v=spf1 include:_spf.google.com ~all`. Google DKIM at `google._domainkey`. DMARC at `_dmarc` (p=none). All verified passing (SPF/DKIM/DMARC = PASS).
- Resend remains for app/transactional sending only, isolated on the `send.` subdomain (its own SPF + DKIM there). Do NOT use Resend for outreach; do NOT add MX records or a second root SPF; any future SPF change must MERGE into the single existing root record.
- Aliases (sales@, info@) if ever needed = free aliases on the existing user, never new paid seats.
