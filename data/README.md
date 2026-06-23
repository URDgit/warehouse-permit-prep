# How to edit the code-value data files (for non-programmers)

These files hold every code value the app uses — commodity classes, aisle
widths, sprinkler densities, seismic coefficients, anchorage references, and the
Los Angeles submittal requirements. **The app knows nothing on its own; it only
reports what is written here.** This is intentional: a licensed engineer can read
and verify every number and citation.

You do **not** need to be a programmer to edit these. Open a `.yaml` file in any
plain-text editor (Notepad, VS Code, etc.) and change the text inside quotes.

## The shape of a single value

Most values look like this:

```yaml
minimum:
  value: null                      # the actual value, or null if not set yet
  unit: "feet"                     # the unit, if any
  status: PLACEHOLDER              # PLACEHOLDER = not verified · VERIFIED = confirmed
  source: "CFC 2022 Chapter 32 — VERIFY section/table"   # the code citation
  todo: "Minimum aisle width depends on ..."             # what's needed (placeholders only)
```

### To fill in a verified value, change two lines:

```yaml
minimum:
  value: 8                         # <-- put the real number/text here
  unit: "feet"
  status: VERIFIED                 # <-- change PLACEHOLDER to VERIFIED
  source: "CFC 2022 Table 3206.2"  # <-- put the exact, confirmed citation
  todo: ""                         # (optional) clear the todo
```

That’s it. The app will then stop showing it as a PLACEHOLDER and will start
using the value — and it will display your citation in the report.

## Safety behavior you should know

- A value counts as **PLACEHOLDER** (not trusted) if `status` is anything other
  than `VERIFIED`, **or** if `value` is still `null`/empty. So a half-finished
  edit can never make the app treat an unverified number as real.
- The **seismic** and **anchorage** calculations will not output any number until
  both the data is `VERIFIED` **and** a programmer/engineer has implemented the
  matching vetted formula in the code. This prevents a real-looking but wrong
  force from ever appearing.
- The **commodity classification** stays `UNDETERMINED` until the
  `classification_rules` in `commodity-classification.yaml` are defined and set
  to `VERIFIED`.

## Formatting rules (important)

YAML cares about a few things. If the app shows a “YAML formatting error”, check:

1. **Indentation uses spaces, not tabs.** Keep the existing indentation.
2. **Keep the field names** (`value`, `status`, `source`, …) exactly as written.
3. Put **text in double quotes**: `source: "CFC 2022 Table 3206.2"`.
4. Numbers have no quotes: `value: 8`. Yes/no values: `true` or `false`.
5. Lines starting with `#` are **comments** — notes for humans, ignored by the app.

When in doubt, change only what is inside the quotes and leave the structure
alone. After editing, just reload the app and generate a new report.

## Defining the commodity-classification decision tree

In `commodity-classification.yaml` there is a `classification_rules:` block.
This is where an engineer teaches the app how to pick a commodity class. Until
it is filled in and marked `status: VERIFIED`, the app reports the class as
**UNDETERMINED** (it will not guess).

A rule has three parts:

```yaml
rules:
  - when: { packaging: cartoned, plastic_content: { in: [none, limited] } }
    assign_class: class_III
    source: "CFC 2022 §32xx.x"
```

- `when:` lists the conditions. **All** must be true for the rule to apply.
- `assign_class:` is the class to assign — must be one of the `id`s under `classes:`.
- `source:` is the code citation shown in the report.

The app checks rules **top to bottom and uses the first one that matches**, so
put more specific rules first. Condition formats you can use:

| You want… | Write it like… |
| --- | --- |
| equals | `plastic_content: significant` |
| any of a list | `packaging: { in: [cartoned, exposed] }` |
| not equal | `plastic_content: { not: none }` |
| number ≥ / ≤ / > / < | `storage_height_ft: { gte: 12 }` (or `lte`, `gt`, `lt`) |

Fields you may test: `plastic_content`, `packaging`, `encapsulated`,
`idle_pallets`, `primary_material`, `storage_height_ft`, `ceiling_height_ft`,
`high_piled_area_sqft`. If you mistype a field or class name, the app will not
silently guess — it lists the problem under "Rule data issues" in the report.

The file ships with an `example_rules:` block showing the format. The app
**never reads** `example_rules` — copy entries into `rules:` and verify them.

## The files

| File | What it holds |
| --- | --- |
| `commodity-classification.yaml` | Commodity classes (I–IV, plastics groups) and the rules that map a stored product to a class. |
| `fire-code-requirements.yaml` | Triggered fire-protection requirements: aisle widths, max heights, sprinkler design, flue spaces, smoke removal, etc. |
| `seismic.yaml` | Seismic design basis and formula references (ASCE 7-16). |
| `anchorage.yaml` | Rack base-plate anchorage references (ASCE 7-16 / ACI 318 / ANSI-RMI MH16.1) and existing-slab properties. |
| `jurisdictions/los-angeles.yaml` | LADBS/LAFD required submittal documents and the rules for when each applies. |

To add another city later, copy `jurisdictions/los-angeles.yaml` to a new file
(e.g. `jurisdictions/long-beach.yaml`) and edit it. (Wiring a second jurisdiction
into the app is a small code change.)
