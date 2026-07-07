# Fontana permit-portal intel — high-piled storage filings

**Sources:** Fontana Accela portal (aca-prod.accela.com/FONTANA).
Initial pull 2026-07-06; **full FHPS26 sweep 2026-07-07** via Claude in Chrome
(22 records, spot-verified against 3 known records; applicant emails captured
from record detail pages — the portal lists emails for applicants only, licensed
professionals show phone/address).

## How Fontana handles HPS permits

- Fontana uses a **dedicated HPS record type**: `FHPS-YY-####`, filed in the **Fire module** (not lumped into general building permits).
- **22 FHPS26 records** spanning ~Apr 2025 – May 2026. Real, recurring permit volume in a single jurisdiction.
- **Applicants are typically fire consultants/expediters, not structural engineers** — Fontana accepts filings with the consultant as professional of record (several records list no licensed professional at all).
- Excluded from analysis: **FHPS26-00001** (misfiled fire-alarm record — Everon LLC).

## Filer share (21 valid records)

| Filer | Filings | Share | Named staff (applicant emails) |
| --- | --- | --- | --- |
| **Premier Fire Consulting** | 8 | ~38% | Jonathan Lusk (jonathan@premier-fire.net, 2), Alex Gonzalez (Alex.g@premier-fire.net, 3), Bryan Mendoza (bryan@premier-fire.net, 3) |
| **Premier Warehouse Permits** (NEW volume filer) | 3 | ~14% | Deijon Chevis (admin@warehousepermits.com); Ziglift Material Handling (Zsigmond Balla, Contractor 1063193) is the contractor on all 3 |
| **Triad Fire Consultants** | 2 | ~10% | Lynn Seymour (lynn@triadfire.com) |
| **Compliance First** | 2 | ~10% | Brooke Lee (brooke@compliancefirst.com) |
| Dealers/integrators | 2 | ~10% | Rikk Campos, Total Warehouse (rikk@totalwarehouse.com — also his own contractor of record); Kyle Rowles, Storage Solutions (kyler@storage-solutions.com) |
| Self-filing operators | 4 | ~19% | Carlos Lopez; Carrie Sharifi (RSS); Zhe Song (ZM Trucks); Tommy Nightingale (Tech Wayne Company) |

**The consultant/expediter lane files ~70% of Fontana HPS volume (15 of 21).**

## Upstream engineering observations

- **Shared upstream FPE:** Steven Biship, **Pacific Fire Engineering** (PE 1556, spelling as captured — possibly "Bishop"; verify via DCA license lookup before contact) is licensed professional of record for **both Premier Fire (00018 Hankook) and Triad (00016 TLC Logistics)** — the stamping engineer behind competing consultants is a prime research-input prospect.
- **Second upstream FPE:** **Thomas Forcier (PE 2296)** on Triad's 00004 (JD Logistics). Two independent FPEs stamping for the same consultant confirms an upstream-engineer layer that buys stamping work from the filer lane.
- **Sal Fateen (PE 25969, Seizmic)** appears as PE of record via Storage Solutions (00021 Tricor Braun) — the dominant rack-SE shop shows up even in dealer-led filings.
- Many records list **no licensed professional at all** — Fontana accepts consultant-only filings.

## What this means for PermitWright

- **Three customer archetypes:**
  1. **Structural engineers** — seismic/rack-anchorage lane (current outreach draft).
  2. **Fire consultants / permit expediters** — the HPS-fire lane; ~70% of Fontana volume. Consultant-lane draft v1 sent to Premier Fire 7/7.
  3. **Self-filing operators** — intel-only (emails now on file); a possible future SaaS/self-serve segment, not current outreach.
- **Reclassifications:** Premier Fire (7/6), then **Triad and Compliance First** (7/7), moved from "direct competitor" to **volume filer / consultant-lane prospect** — they compete for end clients, not for the research-input niche PermitWright sells into.
- **Upstream FPEs (Biship, Forcier) are DO-NOT-CONTACT** until (a) licenses are verified via the DCA lookup and (b) relationship context is established — reach them via consultant referral, not cold. Both rows carry status `intel-only` in prospects.csv.
- **Open action items:**
  - Consultant-lane outreach to Premier Warehouse Permits (Chevis) and Triad (Seymour).
  - DCA license verification for Biship (PE 1556) and Forcier (PE 2296) — prerequisite for ever referencing or contacting.
  - Optional: pull the "View Additional Licensed Professionals" link on FHPS26-00002 (may reveal another upstream PE).

## Appendix — full FHPS26 record log (sweep 2026-07-07)

| Record | Filed | Applicant (firm) | Licensed professional | Project |
| --- | --- | --- | --- | --- |
| FHPS26-00001 | 12/02/2025 | Jay Lewis (Everon) — jjlewis@everonsolutions.com | Jay Lewis, Everon LLC (Contractor 1065604) | Applied Industrial #283100 — fire-alarm communicator. **EXCLUDED (misfiled)** |
| FHPS26-00002 | 12/10/2025 | Jonathan Lusk (Premier Fire) | Jonathan Lusk, PFC (Fire Consultant NA; additional-professionals link unpulled) | Hankook Tire HPS |
| FHPS26-00003 | 11/21/2025 | Bryan Mendoza (Premier Fire) | — | Peterman Lumber — HPS in existing building |
| FHPS26-00004 | 12/18/2025 | Lynn Seymour (Triad) | **Thomas Forcier, PE 2296** | JD Logistics — pre-manufactured racks. Closed |
| FHPS26-00005 | 12/18/2025 | Alex Gonzalez (Premier Fire) | — | DCG Fulfilment — palletized storage and racks |
| FHPS26-00006 | 04/23/2025 | Tommy Nightingale (Tech Wayne Company) | — | Longshine — 77,405 sf; Group A plastics to 35 ft; ESFR K-25.2 @ 40 psi |
| FHPS26-00007 | 10/21/2025 | Zhe Song (ZM Trucks) | — | High pile storage plan |
| FHPS26-00008 | 01/20/2026 | Brooke Lee (Compliance First) | — | Star Home Living — HPS |
| FHPS26-00009 | 10/24/2025 | Deijon Chevis (Premier Warehouse Permits) | Ziglift Material Handling (Contractor 1063193) | Bee Imagine — install HPS racks |
| FHPS26-00010 | 03/10/2026 | Carlos Lopez (individual) — charliegone1999@yahoo.com | — | Black Bear Corp — revision to FHPS24-00039 per inspector. Closed |
| FHPS26-00011 | 02/03/2026 | Bryan Mendoza (Premier Fire) | — | ACT Fulfillment — palletized storage; revised elevations (FPMT16-000551) |
| FHPS26-00012 | 07/22/2025 | Deijon Chevis (Premier Warehouse Permits) | Global Trade Marking Inc / Ziglift (Contractor 1063193) | New Classic Furniture — install HPS racks |
| FHPS26-00013 | 02/10/2026 | Bryan Mendoza (Premier Fire) | — | Discovery SCM — tied to Plan Check FPCK24-00408 |
| FHPS26-00014 | 03/16/2026 | Alex Gonzalez (Premier Fire) | — | Western Post — single/double-row racks |
| FHPS26-00015 | 02/11/2026 | Carrie Sharifi (RSS) — carriesharif@yahoo.com | — | DSV Slover Phase 3 — 2,500 sf of rack @ 40 ft |
| FHPS26-00016 | 04/24/2026 | Lynn Seymour (Triad) | **Steve Biship, PE 1556** | TLC Logistics — pre-manufactured racks + palletized |
| FHPS26-00017 | 01/16/2026 | Deijon Chevis (Premier Warehouse Permits) | Zsigmond Balla, Ziglift (Contractor 1063193) | Smart Warehousing — HPS per Ch. 32 |
| FHPS26-00018 | 05/18/2026 | Jonathan Lusk (Premier Fire) | **Steven Biship, Pacific Fire Engineering, PE 1556** | Hankook Tire HPS expansion. Exp 06/04/2027 |
| FHPS26-00019 | 05/04/2026 | Alex Gonzalez (Premier Fire) | Fire Consultant NA | Eversana — in-rack sprinklers per NFPA 30, flammable/combustible liquids in cooler room |
| FHPS26-00020 | 12/22/2025 | Brooke Lee (Compliance First) | Brooke Lee, CF (Fire Consultant n/a) | Cainiao Supply Chain — HPS |
| FHPS26-00021 | 10/15/2025 | Kyle Rowles (Storage Solutions) — kyler@storage-solutions.com | **Sal Fateen, PE 25969** | Tricor Braun — pallet racking; no MEP in scope |
| FHPS26-00022 | 02/02/2026 | Rikk Campos (Total Warehouse) — rikk@totalwarehouse.com | Rikk Campos, T W Racking Solutions (Contractor 1062365) | Lotus — 83,610 sf; ESFR K-16.8 @ 52 psi; Group A plastics; top of storage 32 ft 10 in |
