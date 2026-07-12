# BACKLOG — Southern Africa Species Explorer

Open work captured from the round-2 review and the name-backbone design sessions.
Round-2 PRs #26–29 (v1.0.25–1.0.28) are **merged**. Nothing below is lost or silently
dropped. Priorities: **P1** next up · **P2** soon · **P3** when convenient.

---

## A. The name-backbone / union index (the big one)
Spec: `docs/NAME_BACKBONE.md`. Principle: **union every name, never exclude; narrowing
is a filter, not a wall** (memory: `union-not-exclusion`). None built yet.

- **[P1] Union index sidecar** — enrich the 2,780 with `nm:{field,gbif,inat,ebird,book…}`
  + `accepted`/`altKeys`. GBIF-canonical resolution is done (`tools/reconcile/idmap.json`,
  2,775→2,771 accepted); still need iNat + eBird (+ later book) name columns.
- **[P1] Per-species name-expander** — show every alias by source (match whichever book).
- **[P1] OR-search across all names** — a query hits a node via key *or* any alias.
- **[P2] Regional-envelope candidate pool** — per sub-region 2σ ellipse → GBIF/iNat facet,
  **all taxa** (bats, microbes, everything), each a background node + `plausibility`.
  Method validated on the Cape (`tools/reconcile/`).
- **[P2] `possible here` toggle** — left of `rare` on the abundance row, **default off**;
  on = the background pool joins the list.
- **[P2] Search-failover** — if a query only hits `background`, show it flagged
  "possible · not on our list."
- **[P2] `origin` filter category** — native / endemic / introduced / invasive, as a
  filter **and** failover category; introduced species **kept + labelled**, never dropped.
  Needs a data pass: GRIIS-South-Africa checklist and/or iNat `establishment_means`.
- **[P2] "Top surprises" = a live filter** — `background` sorted by `plausibility ×
  notability`. Not a baked list; recomputes with region/threshold.
- **[P3] got-connection** — online match (GBIF/iNat) → compact record → import; adds an
  off-DB species to the user's union. (J5 has a per-day stub; this is the global version.)
- **[P3] Book / local-name crosswalks** — Roberts / Sinclair / isiZulu etc. as `nm[]`
  source columns.

## B. Deferred features (named in PRs, not built)
- **[P2] ⌘-click multi-site compare** — needs single-focus → multi-focus. Deferred in
  PR-A and PR-C.
- **[P3] eBird trip-report import** — we ship per-day checklist URLs (J4); trip-report /
  global import is untouched (Shannon open-Q #1).

## C. Data quality (DATA_PASS pipeline — do NOT hand-edit `data.js`)
- **[P2] 4 internal corpus dupes** (two keys → one species): *Ficus thonningii*,
  *Rapanea melanophloeos*, *Oscularia falciformis*, *Senecio barbertonicus*.
- **[P2] 5 corpus rows with malformed (non-numeric) keys.**
- **[P2] Stale backbone keys** (e.g. *Icthyophaga vocifer* → current GBIF *Haliaeetus*).
- **[P3] Abundance `_e = 0` for every charismatic species** (Big Five, penguins, whales) —
  the abundance metric doesn't cover them; enrich for verts (this is *why* focal/tour
  exists, but the gap is real).

## D. Open questions for Shannon (blocking their items only)
1. eBird **trip-report vs per-day URLs** (gates B eBird-trip-report).
2. Offline map **zoom softness** (baked tile) vs **online crisp tiles** (breaks offline).
   _(Resolved earlier: abundance = dot glyphs ✓ · focal vs tour model ✓.)_

## E. Tooling / QA
- **[done] `tools/cdpshot.js`** — CDP device-emulation screenshots (true iPhone 16 Pro /
  print). Reusable for mobile QA.
- **[done] `tools/reconcile/`** — GBIF idmap cache + scripts.
- **[P3] Formal desktop-web + iPad screenshots** — iPhone 16 Pro + print done; iPad/web
  validated by Durrell by hand, never captured to file.

## F. Pre-round-2 handoff items still open
- **[P3] "Collapse to graduate" first-run hint → dismissible** (only the wording was
  softened in the voice pass).
- **[P3] Journal weather line per-site defaults** (still free-text).

---

### Suggested next sequence
1. Land tooling/cache (this PR). 2. Name-expander + OR-search (A, P1 — high value, low
risk, uses `idmap`). 3. `possible here` toggle + envelope background pool (A, P2). 4.
`origin` category + GRIIS pass, then got-connection. 5. DATA_PASS cleanup (C). 6. Get
Shannon's calls on D before building eBird-trip-report / crisp-zoom.
