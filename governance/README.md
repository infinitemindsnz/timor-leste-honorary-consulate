# Governed publication contract — writable version 1.1

This directory lets the Business Agent publisher change the consulate's two public facts and
every single-line text surface on this website through the authenticated approval ceremony,
and refuse everything else with a closed reason. Authority lives in two machine-parsed files; the rest documents them.

| File | Role |
| --- | --- |
| `writable-paths.v1.json` | The write authority (schema version 6). Declares the `public_phone_patch` coupled set and the `public_email_patch` operation over `src/data/site.yaml`, the identity assertions and closed-set occurrence scan the publisher must prove against the base revision, and every other operation as denied with its reason. |
| `approval-policy.v1.json` | The approval ceremony: exactly the two declared operations, each bound to one authenticated `publication_approval` stage. |
| `content-contract.v1.json` | Names every content source the renderer reads and the build/validation commands. Grants nothing. |
| `renderer-manifest.v1.json` | The renderer's inputs and the routes it emits. Grants nothing. |
| `schemas/site.v1.schema.json` | Platform-facing JSON Schema mirror of `src/data/schema.ts`. |

## What is writable

- **Public phone** — `contact.rows[0]` in `src/data/site.yaml`: the display value and the
  `tel:` href, written together from a closed `display` + `e164` proposal. The contact
  section, the footer and the JSON-LD `telephone` all render from these two pointers.
- **Public email** — `contact.rows[1]`: the display value and the `mailto:` href, written
  together from a closed `display` + `mailto` proposal. Same three render sites.

- **Text surfaces** — `site_text_patch` over `src/data/site.yaml` and `src/data/sections.yaml`:
  98 catalogued single-line surfaces (hero, doorways, contact intro, jurisdiction, embassy
  referral copy, chapter and insights headings, footer identity, and every section's eyebrow, title,
  lede, timeline entry, statistic, service card and the consul profile). Each surface id carries its
  file, pointer and meaning in `writable-paths.v1.json`. Hrefs, CTA labels, icons, the phone and
  email rows and the embassy contact facts are never text targets.

Not writable: markdown section bodies, insights (media-bearing), navigation, opening hours (none
published). Each denied operation is documented in `writable-paths.v1.json`.

## Invariants the repository enforces

- `npm run content:validate` — `src/data/site.yaml` parses against the strict schema, including
  the coupled-fact rules (Mobile row has an E.164 `tel:` href; Email row's href is
  `mailto:` + its value).
- `npm run test:governance` — the closed-set occurrence accounting matches the real repository
  (every raw occurrence of the phone display and `tel:` literals under the repository root minus
  `scanExclusions` is a declared target), the public email occurs only at its declared pointers,
  the approval policy binds exactly the declared operations, and no undeclared operation block
  exists in the write authority.
- `npm run lint` and `npm run build` — the components render only from `src/lib/content.ts`.

## Becoming publishable (deployment side)

1. Host the site on a Vercel project connected to this repository (`vercel.json`); the
   publisher proves preview rendering and production settlement only against Vercel.
2. Install the Business Agent GitHub App on this repository and add a pull-request rule with the
   publisher's strict required status check and zero bypass actors to ruleset `21391088`.
3. Pin this contract's digests and the App installation in the client deployment manifest and
   flip the registry entry from `publication: disabled` to `approval_required`.
