# PermitWright Site Update — Claude Code Work Order

Execute in this order. The goal: reposition permitwright.com from pre-launch SaaS to a live done-for-you service, with current code citations. A `CLAUDE.md` with full business context may exist in the repo root — read it first if present.

## 0. Recon before touching anything
1. Inventory the repo: identify the framework, where page copy lives (components, markdown, config/JSON), and where meta tags are set.
2. Run and save the results of:
   - `grep -rn "2022" .` (excluding lockfiles/node_modules)
   - `grep -rn "7-16" .`
   - `grep -rni "waitlist\|coming soon\|\$99\|99/month\|ASCE" .`
3. List every hit with file/line before editing. These are the change sites.

## 1. Code-cycle corrections (highest priority — do first)
- Every "CFC 2022" / "2022 California Fire Code" → **"2025 California Fire Code"**
- Every "ASCE 7-16" → **"ASCE 7-22"**
- Where a fuller reference fits: "part of the 2025 California Building Standards Code (effective January 1, 2026)"
- Check meta descriptions, alt text, footers, JSON/config, sample content — not just visible page copy.
- Acceptance: the greps for `2022` and `7-16` return zero content hits.

## 2. Hero section — replace entirely
- **Headline:** High-piled storage permit research, done before you start.
- **Subhead:** Jurisdiction-specific research packages for California structural engineers. Every code section, submittal requirement, and worksheet prepared — so your billable hours go to the engineering, not the legwork.
- **Pricing line:** Flat $750 per project. 48-hour turnaround.
- **Primary CTA:** "Request a Sample Package" → `mailto:uriel@permitwright.com?subject=Sample%20Package%20Request`
- Acceptance: no waitlist form, no "$99/month", no "coming soon" anywhere on the page.

## 3. Remove all SaaS/pre-launch remnants
- Delete waitlist forms/CTAs, pricing-tier references, "launching soon" banners, and any signup/login stubs.
- Acceptance: grep for `waitlist`, `coming soon`, `99` (price context) returns zero content hits.

## 4. EOR positioning strip (prominent, main page)
> PermitWright provides code research and document preparation only. All engineering judgment, design decisions, and responsible charge remain with the licensed engineer of record. We make your job faster — we don't practice it.

## 5. "What's in every package" section
Intro: Each package is researched fresh for your specific project and jurisdiction.
- **AHJ submittal checklist** — exactly what your jurisdiction's fire department requires, including local amendments and plan-review preferences
- **Applicable 2025 California Fire Code sections** — Chapter 32 provisions triggered by your project's storage height, area, and configuration
- **Commodity classification worksheet** — prepared and formatted, ready for your review
- **Storage height and area trigger analysis** — which thresholds your project crosses and what each one requires
- **Draft permit narrative** — formatted to the AHJ's conventions, ready for you to adapt, finalize, and stamp

Closing line: Current with the 2025 California Building Standards Code (effective January 1, 2026) and ASCE 7-22.

## 6. "How it works" — 3 steps
1. **Send project basics.** Jurisdiction, storage height, commodity types, building details — a 5-minute email.
2. **Receive your package in 48 hours.** Complete research file, organized and formatted.
3. **You do the engineering.** Review, apply your judgment, adapt the narrative, and stamp.

## 7. About / contact
> PermitWright is run by Uriel Rojas, based in Southern California. The service grew out of firsthand experience with warehouse operations and high-piled storage permitting in SoCal jurisdictions.
>
> Questions or a project ready to go: **uriel@permitwright.com**

## 8. Footer
> © 2026 PermitWright · Southern California
> Code research current to the 2025 California Building Standards Code.

## 9. Meta tags
- **Title:** PermitWright — High-Piled Storage Permit Research for California Engineers
- **Description:** Jurisdiction-specific research packages for high-piled storage permits. 2025 CFC current. Flat $750, 48-hour turnaround. Engineering judgment stays with you.

## 10. Entity-name rule (IMPORTANT — new since last planning pass)
- PermitWright LLC's formation was submitted to the CA Secretary of State but stamped Articles have **not yet arrived**.
- Site branding stays **"PermitWright"** (no "LLC") everywhere for now — hero, footer, about.
- Do NOT publish a Terms of Service page or any legal-entity claims in this pass. When Articles arrive, a follow-up task will add "PermitWright LLC" to the footer/legal pages and publish the ToS.

## 11. Do NOT build in this pass
- No pricing-tier pages, testimonials placeholders, blog, auth, payments, dashboards, or forms beyond the mailto CTA.
- No copy implying PermitWright performs engineering ("permit engineering," "we design," "our engineers").
- Keep package contents, pricing, and jurisdiction references as data/config where the codebase allows — the future SaaS grows out of this structure.

## 12. Final QA checklist
- [ ] Greps from step 0 re-run: zero hits for `2022`, `7-16`, `waitlist`, `coming soon`, `$99`
- [ ] Build/dev server passes with no errors
- [ ] Mobile viewport check: hero, package list, and CTA render cleanly at ~380px
- [ ] mailto CTA opens with correct address and subject
- [ ] Every code citation on the site reads 2025 CFC / ASCE 7-22
- [ ] The word "LLC" appears nowhere on the public site
- [ ] Summarize all changed files with a one-line rationale each
