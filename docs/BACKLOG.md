# BACKLOG — Southern Africa Species Explorer

Open work captured from the round-2 review and the name-backbone design sessions.
Round-2 PRs #26–29 (v1.0.25–1.0.28) are **merged**. Nothing below is lost or silently
dropped. Priorities: **P1** next up · **P2** soon · **P3** when convenient.

---

## A. The name-backbone / union index (the big one)
Spec: `docs/NAME_BACKBONE.md`. Principle: **union every name, never exclude; narrowing
is a filter, not a wall** (memory: `union-not-exclusion`). None built yet.

- **[done · v1.0.29] Union index sidecar (`names.js`)** — `window.NAMES` keyed by corpus
  key: `s[]` synonyms, `v[]` English vernaculars, `l{}` SA local names. 2,550/2,780 taxa
  carry aliases. Built by `tools/reconcile/build_names.js` from GBIF synonyms +
  vernaculars. **Still to add:** eBird, BOLD, book name columns (extend the same sidecar).
- **[done · v1.0.29] Per-species name-expander** — "Also known as" block in the drawer,
  aliases grouped + source-labelled (scientific / English / by language).
- **[done · v1.0.29] OR-search across all names** — a query hits a node via key *or* any
  alias (folded into each row's `data-txt` haystack).
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
- **[app-fixed · v1.0.30 → still needs a DATA_PASS bake-in] Genus-collapsed records.**
  26 rows were matched to a GBIF *genus* key (o.s a bare genus, sometimes blank order/
  family). Resolved to species in the sidecar (`tools/reconcile/genus_fix.json` →
  `names.js` `sp`/`spii`); the app prefers the species everywhere. A DATA_PASS should bake
  the crosswalk into `data.js` at source (correct `s`, `k`, `o`, `f`) so it survives regen,
  and **change the build rule: on a genus/collision, keep the species even if a synonym —
  never fail over to the genus.**
- **[P2] Wrong-species iNat id (photo).** `k7311303` (*Passerina filiformis*) shipped a
  *P. corymbosa* photo (o.ii pointed to the wrong species); account/links re-pointed in
  v1.0.30 but `o.p` still needs a photo re-pull. Whole-corpus o.ii audit (all 2,148 ids)
  found only this one genuine wrong-species photo — the method is in `tools/reconcile/`.
- **[P3] Bare-phylum record** `k7707728` = *Tracheophyta* (no common name / iNat id) —
  review or remove.
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
