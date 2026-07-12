# BACKLOG / NIGHT PLAN — Southern Africa Species Explorer

**Context (2026-07-12):** Durrell is asleep; Shannon (trip leader) boards a flight in ~7–8h
and will study **offline on phone + laptop** (no iPad). Durrell gave standing permission to
work autonomously: each group → branch → PR → **merge to `main`** (merging deploys via GitHub
Pages) → continue. Durrell reviews the merged result on waking + wants a **how-to guide for
Shannon**. Priorities below are the reprioritization Durrell asked for; **P0 = offline is the
field-trip blocker.**

Deploy: GitHub Pages from `main` → https://ddkapan.github.io/saexplore/ . Merge = deploy.

## Cross-cutting principles (govern every group)
1. **Offline-first** — nothing ships without verifying it survives airplane mode.
2. **Single source of truth** (item 10) — each filter's state lives in one place; every
   control (strip / section / mobile) reads+writes it. No view can diverge.
3. **Filters are views, never data walls** (union-not-exclusion); they compose without
   conflict (item 9).
4. **Consistent controls** — same all/none, same order, on every filter (items 5, 8).

## Defaults taken on open forks (Durrell can override on waking)
- Site-focus on phone (item 7): **isolate the focused column** + a "show all sites" toggle.
- Subareas 03/04 (item 1): **collapse the redundancy** into one canonical site selector w/ all-none.
- Indigenous names (item 12): **full SA-language set from real data + higher-taxon inheritance**,
  labelled by provenance, conservative on accuracy.
- Search (item 16): **promoted to lead** the at-hand filters; group/order chips next line, all-none to their left.

---

## THE PLAN — logical groups in priority order (each ≈ one PR)

### PR-A · P0 CRITICAL — Offline rescue  ✅ (v1.0.32, branch feat/offline-rescue-1032)
Items **11, 15**. Root cause: one versioned SW cache held shell + ~1,300 photos and was
deleted on every version bump (4× this session), with `skipWaiting` racing the precache →
"content no longer in cache." Fix: **split caches** (versioned shell + *stable* media cache
never wiped), resilient item-by-item install, claim only after shell cached, **offline-ready
pill** + "save photos for offline" action. *(status: implemented; verifying offline; then merge.)*

### PR-B · P1 — Quick wins & copy
- **Item 6:** "Southern Africa" → **"South Africa"** in header/title/manifest/footer.
- **Item 14 (regression I introduced):** the coarse-key guard in #33 stripped "Also known as"
  from some species — **restore it**; pull synonyms for the *resolved species* on genus-collapsed
  records so every species keeps aliases. Review that all species have an "also known as".
- **Item 13 (partial):** italic-Latin-name audit (quick, safe subset).
- **Item 17:** map **default layer → satellite** (currently `streets`).
- **Item 18:** **photo borders darker (gray)** — thumbnails/drawer images currently use a
  taxon-coloured left border; switch to a darker neutral gray.
- **Item 19:** **dark-mode note** — add proper dark-mode handling / theme note (bigger; may
  land in PR-H polish, but capture the intent here).

### PR-C · P1 — Filter-system unification + at-hand redesign (the structural one)
- **Items 5, 8:** every filter gets **all/none** in the **same position/order**.
- **Item 1:** fix sites all/none missing; **collapse redundant subareas 03/04** to one selector.
- **Items 9, 10:** single filter-state module; non-conflicting composition (see principles).
- **Item 16 + "order chips in filters-at-hand":** redesign the **at-hand strip (section 07)**
  with a logical order — **search leads** (most-used), then taxonomic **group/order chips** with
  **all/none to their left** on the next line. Apply real design judgment; explain the layout.
- **⌘-click set-union on ALL chips** (generalizes the old "⌘-click multi-site compare", BACKLOG-B):
  ⌘/Ctrl-click adds a chip to a union selection instead of replacing. Same model for sites, taxa, etc.

### PR-D · P1 — Mobile layout
- **Item 7:** on phone, focusing a site **isolates that site's column** (see its dots without
  horizontal scrolling); "show all sites" toggle returns the full table (auto-scroll to focus).
- **Item 4:** journal → Explorer **back** affordance moved out of the Dynamic-Island zone;
  larger, safe-area-aware hit target.
- **Item 2:** **taller tour** with greatest-hits **prose (left)** + larger trip/favorites list (right).

### PR-E · P2 — Names & indigenous languages
- **Item 12:** add SA languages (isiZulu, isiXhosa, Tshivenḓa, Setswana, Xitsonga, siSwati,
  Sesotho, Sepedi, isiNdebele, + SA Sign where data exists, English, Afrikaans) with
  **higher-taxon inheritance** (family/genus local name flows to children, labelled), plus a
  per-site **language-relevance map** (answer: which of the 10 sites → which languages).
  Much already sourced via GBIF vernacular pull (`tools/reconcile/vcache`).

### PR-F · P2 — Import / interop
- **Item 3:** fix the dead **eBird import** link; **import a full iNaturalist user's
  observations** (join via iNat id / eBird code now carried). Ties to got-connection.

### PR-G · P2 — Carried-over data & backbone (was BACKLOG A/C)
- DATA_PASS bake-in of `tools/reconcile/genus_fix.json` into `data.js` (correct s/k/o/f;
  change build rule: on a genus collision keep the species even if a synonym).
- Re-pull wrong-species photo `k7311303` (*Passerina filiformis* had a *P. corymbosa* photo).
- Bare-phylum `k7707728` (*Tracheophyta*) review/remove; 4 internal dupes; 5 malformed keys;
  stale backbone keys (*Icthyophaga*→*Haliaeetus*); abundance `_e=0` for charismatic verts.
- Regional-envelope candidate pool + **"possible here" toggle** (left of `rare`, default off)
  + search-failover + **`origin`** native/introduced/invasive category + **top-surprises** live filter.
- BOLD + book/local-name crosswalks (Roberts/Sinclair) as more `names.js` columns.

### PR-H · P3 — Final polish
- **Item 13 (full):** formatting/QA sweep (italics, spacing), desktop-web + (phone) captures.

---

## Open questions for Shannon (non-blocking)
1. eBird trip-report vs per-day URLs (gates full eBird import in PR-F).
2. Offline map zoom softness (baked tile) vs online crisp tiles (breaks offline).

## Done this session (merged to main)
- v1.0.29 #31 union name index (OR-search + name-expander).
- v1.0.30 #32 genus-collapse fix (species over bare genus; whole-corpus iNat-id audit).
- v1.0.31 #33 eBird canonical for birds (species code join key; searchable/linked/exported).
- v1.0.32 #?? offline rescue (this PR).

## Tooling
`tools/cdpshot.js` (device screenshots), `tools/reconcile/` (idmap, genus_fix, eBird pull,
build_names). Regen recipes in `tools/reconcile/README.md`.

## RESUME AFTER COMPACTION
Work the groups **A→H in order**, one PR each, merge to `main` after green + verified. PR-A is
in flight on `feat/offline-rescue-1032`. Memory `saexplore-round2-status` tracks PR numbers.
Verify offline with a local http server + CDP `Network.emulateNetworkConditions offline`.
