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
- **Item 14 [done · v1.0.37]:** restored "Also known as" for the 8 charismatic genus-collapsed species (Black Goshawk→Black Sparrowhawk/Accipiter melanoleucus, etc.) via pull_aka.js→aka_fix.json. 17 obscure inverts/plants have no other GBIF names (show species name, searchable).
- **Item 13 (partial):** italic-Latin-name audit (quick, safe subset).
- **Item 17 [done in PR-B]:** map **default layer → satellite**. NOTE: only `cape`/`low` ship
  a satellite tile; the `sa` overview has streets only (falls back gracefully) — **follow-up:
  bake an `sa` satellite tile** so the opening view is satellite too.
- **Item 18 [done in PR-B]:** darker gray border on the drawer photo (`#9a917f`).
- **Item 19 [mostly done · v1.0.35]:** **real dark mode.** The colour object now points at the
  CSS variables so the species list/strip/drawer flip to **light-on-dark** with the ◐ toggle;
  `color-scheme` follows the toggle (fixes the invisible-input bug too). **Follow-ups:** the
  Grinnell **journal** is still a light paper surface (print-friendly — decide if it should dark-
  theme too), and a few **hardcoded tertiary grays** (e.g. `#9a917f` meta text) don't flip.

### PR-C · P1 — Filter-system unification + at-hand redesign (the structural one)
- **[done · v1.0.34] Item 16 + order chips:** at-hand strip (section 07) rebuilt as 3 rows —
  **search leads**, then **Groups** (all/none left + group chips), then **Sites** (all left +
  site chips + ★ late Jul). all/none in the same leading position on every row.
- **[follow-up] Items 5, 8:** harmonise the **section-6** filter controls (abundance, season,
  year, sort) to the same all/none pattern/order as the strip.
- **[follow-up] Item 1:** sites are single-focus (all-vs-one), so the strip has "all"; the
  funnel's section-4 site chips + section-5 group chips **duplicate** the strip (intentional
  "teach then collapse", but the user calls 03/04 redundant) — decide whether to collapse them.
- **[follow-up] Items 9, 10:** formalise a single filter-state module; audit that no state is
  persisted in two places. (Strip + funnel controls already share `S`.)
- **[follow-up] ⌘-click set-union on ALL chips** (generalises old "⌘-click multi-site compare"):
  ⌘/Ctrl-click adds a chip to a union selection instead of replacing. Needs single-focus →
  multi-focus for sites (the deferred multi-site-compare). Hook already stubbed at the site
  chip onclick.

### PR-D · P1 — Mobile layout
- **Item 7 [done · v1.0.38]:** focusing a site isolates its column (single presence-dot per row, no horizontal scroll); the "only at <site>" toggle (was hide-absent) restores the full table.
- **Item 4 [done · v1.0.36]:** journal back bar is safe-area-aware, sticky, and the back button is a larger tap target.
- **Item 2:** **taller tour** with greatest-hits **prose (left)** + larger trip/favorites list (right).
- **Item 20:** if **no tour species are chosen**, auto-pick one representative per taxonomic group.
- **Item 21:** region **"special" species should stick** (Big Five, top birds); the **tour view
  populates with "things to look out for"** for the current region — a sensible default set that
  the user can then override. (Design with item 20; likely a per-region curated + auto-filled list.)
- **Item 22 — share a tour via JSON:** the tour/focal **marks already ride the JSON
  export/re-import** (that's how `samples/saexplore-favorites.json` works — export → send to
  Shannon → she imports → gets your tour). [done · v1.0.39] "Export tour ⚑" button (section 08) downloads a clean marks-only favorites file (marks + eBird codes, no notes/journal) to share with the Dr.

### PR-E · P2 — Names & indigenous languages
- **Item 12:** add SA languages (isiZulu, isiXhosa, Tshivenḓa, Setswana, Xitsonga, siSwati,
  Sesotho, Sepedi, isiNdebele, + SA Sign where data exists, English, Afrikaans) with
  **higher-taxon inheritance** (family/genus local name flows to children, labelled), plus a
  per-site **language-relevance map** (answer: which of the 10 sites → which languages).
  Much already sourced via GBIF vernacular pull (`tools/reconcile/vcache`).

### PR-F · P2 — Import / interop
- **Item 3:** fix the dead **eBird import** link; **import a full iNaturalist user's
  observations** (join via iNat id / eBird code now carried). Ties to got-connection.
  **Shannon's call (2026-07-12): use per-list (per-day) eBird checklist URLs** — trip reports
  are per-day, and she's unlikely to build a trip report herself. So eBird import targets the
  **per-day checklist** we already ship (J4), not trip-report import.

### PR-G · P2 — Carried-over data & backbone (was BACKLOG A/C)
- DATA_PASS bake-in of `tools/reconcile/genus_fix.json` into `data.js` (correct s/k/o/f;
  change build rule: on a genus collision keep the species even if a synonym).
- Re-pull wrong-species photo `k7311303` (*Passerina filiformis* had a *P. corymbosa* photo).
- Bare-phylum `k7707728` (*Tracheophyta*) review/remove; 4 internal dupes; 5 malformed keys;
  stale backbone keys (*Icthyophaga*→*Haliaeetus*); abundance `_e=0` for charismatic verts.
- Regional-envelope candidate pool + **"possible here" toggle** (left of `rare`, default off)
  + search-failover + **`origin`** native/introduced/invasive category + **top-surprises** live filter.
- BOLD + book/local-name crosswalks (Roberts/Sinclair) as more `names.js` columns.
- **Online crisp-tile map layer** (Shannon's call #2): keep the baked tiles as the offline
  floor (accept softness), but when online load sharp tiles so zoom is crisp. Online-only
  upgrade over the baked base — must not break offline.

### PR-H · P3 — Final polish
- **Item 13 (full):** formatting/QA sweep (italics, spacing), desktop-web + (phone) captures.

---

## Shannon's calls (both resolved 2026-07-12)
1. **eBird: per-list (per-day) URLs.** Trip reports are per-day; she won't build one. eBird
   import targets the per-day checklist (PR-F).
2. **Maps: bake in the tiles.** Accept zoom **softness offline**; when **online, allow crisp
   zooming** (load sharp tiles). So: baked tiles are the offline floor, online upgrades to
   crisp. → new PR-G/PR-D item: online-only crisp-tile layer over the baked offline base.

## Blue-sky / 3.0 (beyond current scope — parking good ideas)
- **The app builds the eBird trip report itself.** Aggregate the per-day checklists (which we
  already collect) into a shareable trip report / assist eBird submission. Shannon is unlikely
  to build trip reports by hand — having the app do it would be a genuinely great feature.
- (Add future big swings here as they come up.)

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
