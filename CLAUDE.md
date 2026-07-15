# PermitWright — Project Context & Current Task

## What PermitWright is

PermitWright (permitwright.com) is a business serving **California structural engineers** who handle **high-piled storage permits** for warehouses. It is owned by Uriel Rojas (Southern California). The dedicated entity, **PermitWright LLC** (California, single-member, member-managed), is **formed and FILED**: Articles of Organization stamped by the CA Secretary of State, File No. B20260310113, filed 7/6/2026 — `docs/permitwright-articles-of-organization-FILED-2026-07-06.pdf`. Registered agent: Northwest Registered Agent. It is deliberately separate from the owner's other entities — never reference or co-mingle those in this codebase.

**Entity-naming rule (updated 2026-07-08):** "PermitWright LLC" on **legal surfaces** — site footer copyright line, /terms page, deliverable cover prepared-by lines. Brand voice stays **"PermitWright"** in all marketing copy (hero, sections, wordmarks, doc headers/footers).

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

- **Outreach LAUNCHED July 6, 2026 — 21 total cold emails sent across two lanes** (all sent manually from uriel@permitwright.com; free-sample CTA). **Engineer lane (17, pain-first draft):** 5 on 7/6 to structural engineering principals (Storage Rack Engineering, Burke Structural, T&B Engineering, YA Creative, JMC2) + 7 on 7/7 to firm inboxes (RME Structural, AAA Engineering Design, Blue Horizon, Riverside Engineering, NTS Engineering & Design, A to Z Engineering, AEC Moreno Design) + 5 on 7/9 (ES Engineering Solutions, Handasa, Seven Hills, CalStructures, LASE). **Consultant lane (4):** Premier Fire Consulting 7/7 (Jonathan Lusk is attempt-two if no reply by ~7/14); Premier Warehouse Permits (Chevis) + Triad (Seymour) 7/8 with Fontana-records openers; Compliance First (Brooke Lee, personalized) 7/9 — **all four major Fontana filers now contacted**. **Remaining unsent:** rack-dealer segment (needs a dealer-lane draft — next week) + Rikk Campos (Total Warehouse) / Kyle Rowles (Storage Solutions). **Next campaign action: follow-up nudges to batch one (July 6 principals) due July 10.** Tracked in `outreach/prospects.csv` (`sent_date`/`status` columns). Business state: **live service — first prospect engaged 7/15 (Lusk/Premier Fire, demo delivered); now converting engagement into the first paid package.**
- **FIRST CONVERSION — 7/15:** touch #27 (Lusk attempt-two, fired 7/15 8:30 AM) got a reply. **Jonathan Lusk (Premier Fire Consulting) ENGAGED; Fontana demo v1.1 sent to him 7/15** under the replies rule. CSV status: "engaged". Scoreboard: 27 touches → 1 engaged. The sweep-stat/demo-offer draft converted where 26 plain-text touches didn't — evidence for demo-forward messaging (Thursday's breakup touch already attaches it).
- **Campaign status 7/14 (context):** 26 touches, zero replies. **Deliverability audit PASSED 7/14** — SPF/DKIM/DMARC all PASS, 13-second seed-inbox delivery → the silence was market/messaging signal, not technical failure.
- **Dealer lane CLOSED as a cold segment (7/14):** structural barrier — dealer-poaching / competitor-taint perception (conflict with the owner's separate business in the dealer market; confirmed by the Trio job history and a warm-dealer read). **Dealers are referral-only prospects — never a cold-send segment.** The rack-dealer-lane draft is cancelled. **The campaign is now two lanes: engineers + consultants.**
- **Campaign queue:** Thu 7/16 — batch-one third touch (breakup-style), **attaching Fontana demo v1.1 directly** (deliberate exception to the replies-only rule — it's the final touch on batch one). Optional — Ontario / Rancho Cucamonga / Jurupa Valley portal sweep for wave three.
- **PermitWright entity compliance:** Statement of Information confirmed filed by Northwest — next due **07/31/2028** (any earlier Sept/Oct SOI reminders are obsolete). **$800 FTB franchise tax due ~Oct 15** (runway item).
- **PermitWright LLC: Articles RECEIVED 7/8/2026** (stamped -FILED- 7/6/2026, File No. B20260310113 — in `docs/`). **LLC-naming pass COMPLETE:** footer → "© 2026 PermitWright LLC"; `/terms` page published (drafted in-house — **attorney review pending**); template + demo covers → "Uriel Rojas · PermitWright LLC". **EIN ASSIGNED 7/8/2026** — IRS Notice CP 575 (name control PERM) filed at `docs/permitwright-EIN-CP575.pdf` (the notice itself carries the number; IRS sends it only once — this is the permanent copy).
- **BANKING LIVE 7/8/2026** — Bluevine Business Checking (Standard plan, $0/mo), approved same-day. **The business can now invoice and receive payment** (invoice structure: `deliverables/invoice-template.md` — account/routing are placeholders, real numbers never go in the repo). Remaining from the old sequence: ToS on letterhead (+ attorney review of /terms).
- **INFRASTRUCTURE PHASE CLOSED (2026-07-08).** Entity filed (Articles, File No. B20260310113) · EIN assigned (CP 575) · banking live (Bluevine) · domain/email/site/deliverables/demo all operational. **All future work is selling or delivering.**
- First sample package will be built manually for whichever jurisdiction the first engineer reply names; that deliverable becomes the template for future packages and, eventually, the SaaS output spec
- **Fontana demo sample** (`deliverables/sample-package-fontana-demo.docx` — fictional project, for generic "show me a sample" replies): **Demo status: VERIFIED — cleared for replies-only deployment** (v1.1; all citations confirmed by Uriel against the published 2025 CFC, January 2026 errata, 7/7/2026 — results in `deliverables/verify-pass.md`). **Deployment rule (amended 7/14): demo attaches to replies, and to the 7/16 batch-one breakup touch as a deliberate one-time exception; otherwise never to cold sends.**

## Email infrastructure (live as of July 6, 2026)

- Business email: **uriel@permitwright.com** on Google Workspace (Business Starter, 1 seat). Sends AND receives — the inbound-email blocker from the site work order is **RESOLVED**. The site's mailto CTA is fully functional.
- DNS (Cloudflare, permitwright.com zone): MX → `smtp.google.com`. Root TXT SPF: `v=spf1 include:_spf.google.com ~all`. Google DKIM at `google._domainkey`. DMARC at `_dmarc` (p=none). All verified passing (SPF/DKIM/DMARC = PASS).
- Resend remains for app/transactional sending only, isolated on the `send.` subdomain (its own SPF + DKIM there). Do NOT use Resend for outreach; do NOT add MX records or a second root SPF; any future SPF change must MERGE into the single existing root record.
- Aliases (sales@, info@) if ever needed = free aliases on the existing user, never new paid seats.
