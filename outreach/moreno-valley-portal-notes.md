# Moreno Valley permit-portal intel — high-piled storage filings (sweep #3)

**Source:** Moreno Valley permit portal, as pasted 2026-07-17. 34 records,
2024–2026 (29 FHP permits + 5 revision sub-records).

## How Moreno Valley handles HPS permits

- Dedicated record types: **`FHP-YY-####` — "Fire Permit High Pile Storage"**,
  plus a separate **"Fire Permit Revision (High Pile)"** type filed as
  **`.R###` sub-records** of the parent (unlike Fontana, where revisions are
  filed as brand-new FHPS records). A legacy `IFHP21-` prefix appears in
  cross-references.
- **CRITICAL LIMITATION: every applicant / licensed-professional field is
  "Not public."** Moreno Valley redacts contact data on the public portal —
  **zero prospect extraction is possible here**, unlike Fontana and Ontario.
- The consultant identities likely live on the cross-referenced **`BFC-`
  plan-check records** (seen: BFC25-0180, BFC24-0138, BFC25-0064) — many FHP
  records are "inspection only" / "track inspections," meaning plan review
  happens under the BFC series. A future sweep would need the BFC series
  (same redaction risk) or a records request.

## Volume

- ~**12–15 HPS filings/year** (FHP24 ×12, FHP25 ×13, FHP26 ×4 through July,
  + revisions) ≈ **1–1.25/month** — smaller than Fontana (~3/mo) and much
  smaller than Ontario (~4–6/mo).

## Market color (from project descriptions)

- **National tenants dominate:** Harbor Freight Tools (**548,000 SF** rack
  AM&M review — the largest single HPS scope seen on any portal so far),
  Skechers (OSR automation racking), Aldi, P&G (gantry + stacker crane),
  Hisense USA (Prologis building), Five Below, Solaris Paper, ShipBob.
- Frequent "inspection only" records and floor-storage/commodity-change
  permits — the FHP series alone understates total HPS plan-review activity.

## What this means for PermitWright

- **Moreno Valley is a delivery jurisdiction, not a prospecting jurisdiction:**
  research packages are fully sellable here (the city even publishes its own
  HPS developer guide — see the app-era jurisdiction research), but the portal
  yields no consultant/engineer contacts to prospect.
- **Sweep-method learning:** before investing in the optional Rancho
  Cucamonga / Jurupa Valley sweeps, spot-check ONE record's detail page first —
  if applicant fields are redacted like Moreno Valley's, skip the sweep.
- Prospecting focus stays Ontario + Fontana (open data, high volume, named
  repeat filers).

## Appendix — raw FHP record log (as pasted 2026-07-17)

```csv
Record Number,Date Opened,Status,Applicant Name/Firm,Applicant Email,Applicant Phone,Licensed Professional (Name/Firm/License#/Contact),Work Address,Project Description,Record Type
FHP26-0006,2026-07-02,Out for Corrections,Not public,Not public,Not public,Not public,"23450 BRODIAEA AVE, Moreno Valley CA 92553","AM&M Review: 548,000 SF High Piled Storage Racks for (e) Harbor Freight Tools",Fire Permit High Pile Storage
FHP26-0004,2026-03-18,Permit Issued,Not public,Not public,Not public,Not public,"13890 OLD 215 FRONTAGE RD, Moreno Valley CA 92553","Fire Inspection - Installation of 345 LF / 2537 SF Storage Racks for (e) PRW Power Inc in Bldg E",Fire Permit High Pile Storage
FHP26-0001,2026-01-06,Permit Issued,Not public,Not public,Not public,Not public,"22750 CACTUS AVE, Moreno Valley CA 92553","Code compliance for palletized storage (prior permit FHP25-0016 was floor storage under 6')",Fire Permit High Pile Storage
FHP25-0017,2025-12-18,Final,Not public,Not public,Not public,Not public,"24385 NANDINA AVE, Moreno Valley CA 92551","Resubmit/updated high pile storage plan (existing plan approved but never passed inspection)",Fire Permit High Pile Storage
FHP25-0016,2025-11-12,Final,Not public,Not public,Not public,Not public,"22750 CACTUS AVE, Moreno Valley CA 92553","New warehouse (Hisense USA, bldg owned by Prologis); floor storage of TVs, appliances, retail AC; seeking CO",Fire Permit High Pile Storage
FHP25-0015,2025-11-10,Ready to Issue,Not public,Not public,Not public,Not public,"28025 EUCALYPTUS AVE, Moreno Valley CA 92555","Inspection only: 63,204 SF High Pile Storage for (e) Santa Fe Warehouse",Fire Permit High Pile Storage
FHP25-0013,2025-10-22,Permit Issued,Not public,Not public,Not public,Not public,"28020 EUCALYPTUS AVE, Moreno Valley CA 92555","Solaris Paper - Solid Pile Storage (no racking); racking on permit BFC25-0180",Fire Permit High Pile Storage
FHP25-0012,2025-10-21,Expired,Not public,Not public,Not public,Not public,"24831 ALESSANDRO BLV, Moreno Valley CA 92555","Track inspections: 10,977 SF sales/storage racks and anchorage over 5 ft 9 in max 10 ft for Five Below",Fire Permit High Pile Storage
FHP25-0011,2025-04-29,Final,Not public,Not public,Not public,Not public,"12661 ALDI PL, Moreno Valley CA 92555","Inspection only: interior storage racks in (e) building for Aldi Foods - 31,023 SF",Fire Permit High Pile Storage
FHP25-0010,2025-04-16,Final,Not public,Not public,Not public,Not public,"16190 PERRIS BLV, Moreno Valley CA 92551","Using 2 bays as storage of tires on pallets",Fire Permit High Pile Storage
FHP25-0009,2025-03-26,Permit Issued,Not public,Not public,Not public,Not public,"23801 ALESSANDRO BLV, Moreno Valley CA 92553","Cozey - inspection only - installation of storage rack 20 ft H x 31,064 SF",Fire Permit High Pile Storage
FHP25-0008,2025-03-04,Final,Not public,Not public,Not public,Not public,"12197 DAVIS ST, Moreno Valley CA 92557","Change to commodity of palletized storage (originally approved IFHP21-0015 to store tires)",Fire Permit High Pile Storage
FHP25-0007,2025-02-11,Final,Not public,Not public,Not public,Not public,"23801 ALESSANDRO BLV, Moreno Valley CA 92553","Cozey - Palletized Floor Storage (no racks)",Fire Permit High Pile Storage
FHP25-0006,2025-01-29,Final,Not public,Not public,Not public,Not public,"12040 DAVIS ST, Moreno Valley CA 92557","Inspection only: 2,480 LF and 20,000 SF of racks at 27 ft and emergency lighting for Corporate Office Image",Fire Permit High Pile Storage
FHP25-0005,2025-01-23,Permit Issued,Not public,Not public,Not public,Not public,"23900 BRODIAEA AVE, Moreno Valley CA 92553","High Pile Storage (Solid Piles)",Fire Permit High Pile Storage
FHP25-0003,2025-01-22,Final,Not public,Not public,Not public,Not public,"14050 REBECCA ST, Moreno Valley CA 92553","Inspection only: 10,452 SF (1,150 LF) interior high piled storage racks for Jaeger Medical Storage - bldg 4",Fire Permit High Pile Storage
FHP25-0001,2025-01-21,Expired,Not public,Not public,Not public,Not public,"22830 RESOURCE WAY, Moreno Valley CA 92553","1,285 SF interior high piled storage racks for (e) Pape Material Handling",Fire Permit High Pile Storage
FHP24-0012,2024-10-17,Final,Not public,Not public,Not public,Not public,"28010 EUCALYPTUS AVE, Moreno Valley CA 92555","Track inspection and fees (plan check under BFC24-0138): additional 765 LF / 24,077 SF selective storage racks for (e) Shipbob",Fire Permit High Pile Storage
FHP24-0011,2024-10-07,Final,Not public,Not public,Not public,Not public,"23770 SUNNYMEAD BLV, Moreno Valley CA 92553","A-1 Tires retail new and used tires (no racks)",Fire Permit High Pile Storage
FHP24-0010,2024-10-03,Permit Issued,Not public,Not public,Not public,Not public,"22830 RESOURCE WAY, Moreno Valley CA 92553","Floor storage plan",Fire Permit High Pile Storage
FHP24-0009,2024-09-04,Permit Issued,Not public,Not public,Not public,Not public,"23855 ALESSANDRO BLV, Moreno Valley CA 92553","Detailed floor storage plan with egress paths, extinguisher placement, exits, permanent floor storage in warehouse",Fire Permit High Pile Storage
FHP24-0008,2024-09-03,Final,Not public,Not public,Not public,Not public,"29050 EUCALYPTUS AVE, Moreno Valley CA 92555","Installation of OSR automation racking, 48,000 SF and 4,000 LF for Skechers",Fire Permit High Pile Storage
FHP24-0007,2024-08-26,Permit Issued,Not public,Not public,Not public,Not public,"24773 NANDINA AVE, Moreno Valley CA 92551","Proposed floor palletized storage in a high piled storage configuration",Fire Permit High Pile Storage
FHP24-0006,2024-08-15,Reviewed Under Building Record,Not public,Not public,Not public,Not public,"13900 OLD 215 FRONTAGE RD, Moreno Valley CA 92553","Inspection only: install pallet racks for Saveway (Sections A/B/C, ~24 ft high)",Fire Permit High Pile Storage
FHP24-0005,2024-06-24,Expired,Not public,Not public,Not public,Not public,"13900 OLD 215 FRONTAGE RD, Moreno Valley CA 92553","Submitting floor storage plans",Fire Permit High Pile Storage
FHP24-0004,2024-06-10,Final,Not public,Not public,Not public,Not public,"23855 ALESSANDRO BLV, Moreno Valley CA 92553","Installation of selective pallet storage racks stored over 12 ft high - 300 LF",Fire Permit High Pile Storage
FHP24-0003,2024-04-30,Final,Not public,Not public,Not public,Not public,"23855 ALESSANDRO BLV, Bldg 1-105, Moreno Valley CA 92553","Floor storage for palletized HPS",Fire Permit High Pile Storage
FHP24-0002,2024-02-21,Final,Not public,Not public,Not public,Not public,"16110 COSMOS ST, Moreno Valley CA 92551","Install interior storage racks 844 LF in 24,067 SF for (e) P&G - gantry, stacker crane",Fire Permit High Pile Storage
FHP24-0001,2024-01-17,Final,Not public,Not public,Not public,Not public,"12135 DAVIS ST, Moreno Valley CA 92557","12,455 SF (4,156 LF) interior high piled storage racks for (e) Access Information",Fire Permit High Pile Storage
FHP26-0001.R001,2026-05-11,Completed,Not public,Not public,Not public,Not public,"22750 CACTUS AVE, Moreno Valley CA 92553","Revision to previously approved high pile storage plans",Fire Permit Revision (High Pile)
FHP25-0008.R002,2026-03-05,Completed,Not public,Not public,Not public,Not public,"12197 DAVIS ST, Moreno Valley CA 92557","Revised high piled storage plans",Fire Permit Revision (High Pile)
FHP22-0018.R001,2025-10-13,Completed,Not public,Not public,Not public,Not public,"12661 ALDI PL, Moreno Valley CA 92555","Floor storage area in freezer that the rack from BFC25-0064 is replacing (no other changes)",Fire Permit Revision (High Pile)
FHP25-0008.R001,2025-08-13,Completed,Not public,Not public,Not public,Not public,"12197 DAVIS ST, Moreno Valley CA 92557","Revision to HPS to account for correct scope of work to previous submittal",Fire Permit Revision (High Pile)
FHP24-0007.R001,2025-01-15,Completed,Not public,Not public,Not public,Not public,"24773 NANDINA AVE, Moreno Valley CA 92551","Revisions to show inspection corrections per fire inspector",Fire Permit Revision (High Pile)
```
