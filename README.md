# Storage-Rack Permit Package — Draft Preparation Aid (Los Angeles MVP)

A local web app that guides you through an intake questionnaire and assembles a
**draft review package** for a high-piled combustible storage / storage-rack
permit in the **City of Los Angeles (LADBS/LAFD)**.

> **This tool does not produce an engineered or approved document.** Its output
> is a preliminary drafting aid. Every input, assumption, code value, and result
> must be reviewed, verified, corrected, and **stamped by a California-licensed
> professional engineer** before any use or submittal.

## What it does (MVP scope)

- **One scenario:** installing storage racks in an *existing* warehouse.
- **One jurisdiction:** City of Los Angeles (LADBS/LAFD).
- **One commodity type per project.**
- Pipeline: **Intake → classification → calculations → review package (report).**
- No CAD/drawings, no user accounts, no payments. Runs on your computer.

### Features built so far

- **Guided intake** with live, per-field validation and unit hints. Your entries
  **auto-save in the browser**, so a refresh won't lose work. ("Reset to example
  data" restores the sample project.)
- **Commodity classification engine** that runs engineer-written rules from the
  data files (and returns *UNDETERMINED* rather than guessing until those rules
  are verified).
- **Calculation engine** for seismic demand and rack anchorage that **refuses to
  output a number** until the values *and* a vetted formula are in place.
- **Los Angeles submittal triggers** that decide which documents apply (Required
  / Not required / Verify) from engineer-written conditions.
- **Readiness checklist** at the top of every report: exactly what still needs a
  licensed engineer, grouped by discipline.
- **Engineer Verification Brief** — a one-click checklist (PDF or Markdown) of
  everything an engineer must verify, with citations and where each answer goes.
- **Exports:** report and brief as **PDF** or **Markdown** (plus browser Print).

## The most important design rule

**The app never invents code values.** Commodity classes, sprinkler densities,
aisle widths, seismic coefficients, anchorage formulas, etc. all live in editable
data files under [`data/`](data/) — each with a `source` citation. Any value not
yet verified is a clearly-marked **PLACEHOLDER**, and the engine **refuses to
output a number** that depends on an unverified placeholder. You and your
engineer fill these in; see [`data/README.md`](data/README.md).

## How to run it

You need **Node.js 18+** (built and tested on Node 24). In a terminal, from this
folder:

```bash
npm install        # one time: download dependencies
npm run dev        # start the app
```

Then open the address it prints (usually <http://localhost:3000>). The form is
pre-filled with **example data** so you can click **"Generate draft review
package"** immediately and see the whole pipeline. Press `Ctrl + C` to stop.

## How to use it

1. Fill in the intake form (or try it with the example data).
2. Click **Generate draft review package** to see the on-screen report, with the
   readiness checklist, every input, every code value + citation, results, and a
   full audit trail. Download it as **PDF** or **Markdown**.
3. Click **Engineer Verification Brief (PDF)** to get the checklist you hand to a
   licensed engineer to fill in and verify.
4. As the engineer returns values, enter them in the [`data/`](data/) files and
   set each `status:` to `VERIFIED` (see [`data/README.md`](data/README.md)). The
   readiness checklist and brief shrink toward "ready" automatically.

## How to run the tests

The engine has automated tests that enforce the safety rules (e.g. "never
fabricate a number", "never guess a class"):

```bash
npm test
```

## Project layout

```
data/                          Human-editable code-value files (YAML) + how-to
  commodity-classification.yaml  Commodity classes + classification rules
  fire-code-requirements.yaml    Aisle widths, heights, sprinkler design, etc.
  seismic.yaml                   Seismic parameters, formula refs, weight factor
  anchorage.yaml                 Anchorage refs + existing-slab properties
  jurisdictions/los-angeles.yaml LADBS/LAFD documents + submittal triggers
src/engine/                    PURE logic — no UI, independently testable
  provenance.ts                  CodeValue + AuditEntry (citations & audit trail)
  conditions.ts                  Shared rule-matching machinery (3-state)
  intake/schema.ts               The questionnaire spec + input validation (Zod)
  classification/                Commodity class + triggered requirements
  calculation/                   Seismic + anchorage (placeholder-safe)
  jurisdictions/losAngeles.ts    LA submittal documents + triggers (plug-in)
  report/                        buildReviewPackage, readiness, brief, markdown,
                                 inputRows
src/app/                       The Next.js web UI (a thin layer over the engine)
  page.tsx                       Intake form (auto-save, validation)
  actions.ts                     Server actions: run engine / build brief
  ReviewPackageView.tsx          Renders the on-screen draft report
  pdf/pdfBuilders.ts             Client-side PDF generation (jsPDF)
tests/                         Tests for the engine (classification, calc,
                               jurisdiction triggers, readiness, brief)
```

The engine in `src/engine/` has **no dependency on the web UI**. That separation
is deliberate: the safety-critical logic can be tested on its own and reused if
the interface ever changes.

## Roadmap (the remaining work is content, not structure)

- Fill in and verify the `data/` files with a licensed engineer (use the brief).
- Implement the vetted seismic/anchorage formulas (today the calcs are
  intentionally placeholder-blocked; a flag is flipped once a formula is added).
- Additional jurisdictions as new files under `data/jurisdictions/`.

## Version control

This folder is a git repository. After changes you can save a snapshot with:

```bash
git add -A
git commit -m "Describe what you changed"
```
