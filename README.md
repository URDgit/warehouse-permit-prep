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

## The most important design rule

**The app never invents code values.** Commodity classes, sprinkler densities,
aisle widths, seismic coefficients, anchorage formulas, etc. all live in
editable data files under [`data/`](data/) — each with a `source` citation. Any
value not yet verified is a clearly-marked **PLACEHOLDER**, and the engine
**refuses to output a number** that depends on an unverified placeholder. You and
your engineer fill these in; see [`data/README.md`](data/README.md).

## How to run it

You need **Node.js 18+** (this was built and tested on Node 24). In a terminal,
from this folder:

```bash
npm install        # one time: download dependencies
npm run dev        # start the app
```

Then open the address it prints (usually <http://localhost:3000>) in your
browser. The form is pre-filled with **example data** so you can click
**“Generate draft review package”** immediately and see the whole pipeline.

To stop the app, press `Ctrl + C` in the terminal.

## How to run the tests

The classification and calculation engines have automated tests that enforce the
safety rules (e.g. “never fabricate a number”):

```bash
npm test
```

## Project layout

```
data/                         Human-editable code-value files (YAML) + how-to
  commodity-classification.yaml
  fire-code-requirements.yaml
  seismic.yaml
  anchorage.yaml
  jurisdictions/los-angeles.yaml
src/engine/                   PURE logic — no UI, independently testable
  provenance.ts                 CodeValue + AuditEntry (citations & audit trail)
  constants.ts                  Disclaimer text, code basis
  data/loadData.ts              Reads & validates the YAML data files
  intake/schema.ts              The questionnaire spec + input validation (Zod)
  classification/classify.ts    Commodity class + triggered requirements
  calculation/seismic.ts        Seismic demand (placeholder-safe)
  calculation/anchorage.ts      Rack anchorage check (placeholder-safe)
  jurisdictions/losAngeles.ts   LA submittal documents (plug-in shaped)
  report/buildReviewPackage.ts  Assembles everything into one report object
  report/renderMarkdown.ts      Markdown export of the report
src/app/                      The Next.js web UI (a thin layer over the engine)
  page.tsx                      Intake form
  actions.ts                    Validates input + runs the engine (server side)
  ReviewPackageView.tsx         Renders the draft report on screen
tests/                        Tests for the classification & calculation engines
```

The engine in `src/engine/` has **no dependency on the web UI**. That separation
is deliberate: the safety-critical logic can be tested on its own and reused if
the interface ever changes.

## Roadmap (not built yet — MVP is the walking skeleton)

- Fill in and verify the `data/` files with a licensed engineer.
- Implement the real classification rules and the vetted seismic/anchorage
  formulas (today they are intentionally placeholder-blocked).
- PDF export (currently: on-screen report + Markdown download + browser “Print
  to PDF”).
- Additional jurisdictions as new files under `data/jurisdictions/`.

## Version control

This folder is a git repository. After changes you can save a snapshot with:

```bash
git add -A
git commit -m "Describe what you changed"
```
