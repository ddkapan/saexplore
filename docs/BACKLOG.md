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

### PR-C2 · P1 — At-hand strip, round 2 [done · v1.0.42] (Durrell 2026-07-12)
- **Season default-on + promoted:** move **★ late Jul** up with the quick filters (row 1) and
  **default it ON** (S.tripwin true / months = late-July window) — it's the trip's default view.
- **Tagged quick-filters:** add quick toggles in the at-hand strip for the **tagged** species —
  **★ focal · ⚑ tour · ✓ seen this trip** — so you can filter to them fast.
- **Count is a result, not a filter:** the `2,780 / 2,780` fraction is distracting at the top —
  move it to the **bottom** of the filter block (it's an output).
- **Dark-mode site chips are too dim** — raise site-chip contrast in dark mode (their per-site
  tints go muddy on the dark background).

### PR-D2 · P1 — In-app "app-like things" section (Durrell 2026-07-12)
- Consolidate the app/offline setup into one clear in-app section: **"To use offline: (1)
  cache the photos [button], (2) Add to Home Screen, (3) use it for notes as well as
  reference."** Surfaces the offline pill + a home-screen hint + what the app does (notes +
  reference), so Shannon sees it in-app (not only in HOWTO.md). Likely near section 08 / the
  export panel, or a new intro card.

### PR-D · P1 — Mobile layout
- **Item 7 [done · v1.0.38]:** focusing a site isolates its column (single presence-dot per row, no horizontal scroll); the "only at <site>" toggle (was hide-absent) restores the full table.
- **Item 4 [done · v1.0.36]:** journal back bar is safe-area-aware, sticky, and the back button is a larger tap target.
- **Item 2:** **taller tour** with greatest-hits **prose (left)** + larger trip/favorites list (right).
- **Item 20/21 [done · v1.0.40]:** curated per-site SPECIALS (Big Five, penguins, endemics from the digest) now lead each site's highlights + the tour, after any user marks — the "things to look out for". 76/81 names resolve. Absent-at-site or unmatched are dropped.
- **Item 23 — make SPECIALS exportable + in-app editable** — ✅ **DONE v1.0.53, SUPERSEDED BY PR-K.**
  Not solved as a one-off: SPECIALS turned out to be one instance of a missing noun. The per-site
  specials are now **shipped lists** (`lists.js`, built by `tools/reconcile/build_lists.js`) —
  data, not code — seeded into the user's list store, then editable, renameable, deletable and
  shareable like any other list. See PR-K.

- **Item 22 — share a tour via JSON** — ✅ **DONE, then GENERALISED BY PR-K.** Was "Export tour ⚑"
  (a marks-only file). That button existed because the full export dragged your private notes
  along — which was the system telling us curation and record are different layers. It is now
  **"Export lists ◆"**: every list (your picks, the site specials you edited, anything you froze
  from a view), with **no field notes**. Import merges as a **union** — it adds lists, it never
  overwrites yours. `samples/saexplore-favorites.json` (v2 marks) still imports.

### PR-D3 · P1 — site-focus labels + evidence caption (Durrell 2026-07-12, late)
- **"only at <site>" wrongly implies endemicity.** It's really *species expected/recorded at*
  that site (many are widespread — African Black Duck proves it). Relabel: e.g. **"<site>
  list"** / **"at <site>"**, and the other state **"all sites (<site> highlighted)"**. Also
  reconsider that all-sites view — the grayed-out non-focus columns aren't very useful.
- **[done · this PR] evidence caption** "strongest on the left" broke when the legend wraps on
  a narrow screen (iNat under museum) → changed to "strongest first".

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

### PR-I · P2 — Data sources: photos, BOLD, live source breakdown (findings 2026-07-12)
Three related threads Durrell raised. **Suggested order: (a) live Sources panel → (b) BOLD pull → (c) photo backfill.**

**(a) Live, filter-aware "Sources" breakdown panel** — ✅ DONE v1.0.48 (#TBD). Collapsible
"Sources in view" panel by the count; 4 evidence bars + species counts + specimen/barcode
tallies over visible sites; recomputes in `applyFilters`. Below is the original spec.
- Today: per-row evidence glyphs (museum voucher `m` · genomic `g` · iNat `i` · eBird `e`) + a
  static legend; no breakdown of the *filtered set*. The old source-breakdown detail was lost.
- Build a compact panel (§6 or pinned by the count) that **recomputes on every filter**: 4 bars =
  share of the current N species carrying each evidence type + raw counts, e.g. eBird 92% (1,338),
  iNat 73%, museum voucher 38% (8,288 specimens), genomic/BOLD 6% (363 barcodes). Filter to Birds →
  eBird ~100%; Plants → museum dominates; focus a site / late-July → recomputes. Data is already in
  `o.src` + `o.st[site].m` (m[0]=specimens, m[1]=genomic) + `.i`. It's the natural home for improved BOLD.

**(b) BOLD is under-pulled + unlabeled** — ✅ DONE v1.0.49 (#TBD). Original diagnosis + what the
build actually found (the plan below changed once the APIs were probed — recorded here because
the surprises matter):
- Genomic/barcode evidence EXISTED but was sparse: **210/2,780 species, 363 records, institution
  usually "?"**. Cause confirmed: it came from **GBIF `MATERIAL_SAMPLE` occurrences** (a thin
  slice), NOT from BOLD.
- **Plan was: pull BOLD's v4 API. That does not scale.** Two hard blockers, both hit:
  1. Only `stats` is live — `specimen`/`combined` (record downloads) return a *"BOLD Public
     Offline"* page. So no bulk pull by family; it's one call **per species**.
  2. BOLD **quotas at ~300 calls**, then replies with the **plain-text** line *"You have exceeded
     your allowed request quota."* — neither JSON nor HTML. ⚠️ A first version of the puller read
     that as a miss and **cached 259 species as "0 barcodes"** (false zeros). Caught by noticing
     the barcoded count had frozen. **Rule: never cache a failed fetch.** Fixed + purged.
  3. Even when it answers, `stats?taxon=<name>` matches an **exact name string** → misses synonyms
     and is weak on plants (*Protea cynaroides* → 2 records).
- **Shipped instead: the same BOLD records via GBIF/iBOL** (dataset `040c5662…`, 23.5M records,
  865k South African). GBIF matches on the **backbone**, so it catches synonyms + subspecies the
  name string misses (*Protea cynaroides* → **32**; *Ilex mitis* → **16**). No quota. **One call
  returns count + holding institutions + per-country split.** Note it's not record-identical to
  BOLD's own stats (GBIF rolls up subspecies: elephant 117 vs BOLD's 16) — so we use **one source
  only**, not a mix.
- **Given up: BIN counts.** GBIF's iBOL BIN dataset keys on BIN pseudo-taxa, not species, so BINs
  can't be joined per species. We report *barcode records*, not BINs. (Future: enrich BINs from
  BOLD's `stats` for just the ~50 focal/tour species — well under the quota.)
- Genus-collapse trap avoided: 28 corpus keys are **genus** GBIF keys; using them as `taxonKey`
  would have counted the whole genus. Resolved to species keys first.

**(c) Photo backfill for the 270 photoless species** — ✅ DONE v1.0.51 (#TBD). 92 CC photos
(77 GBIF occurrence media + 15 Wikimedia) + 178 PhyloPic CC0 silhouettes = **0 blanks**. Silhouettes
are labelled as drawings, never as photos. Traps: species-exact taxonKey only (a genus key returns
the WRONG animal); CORS-only hosts (the precache caches an opaque response as a blank); Commons
free-text returns other species, so filenames are validated against known names. `gen_precache.js`
now regenerates `precache-list.js` (2,675 urls) so it can't go stale again. Original spec below. (Insecta 83, Other 66, Plantae 55, Mollusca 50,
  Reptilia 5, Arachnida 5, Mammalia 3, fish 2, Amphibia 1).
- CC images DO exist — probe of *Promeces longipes* (photoless beetle): **GBIF has 872 occurrences
  with images**, first is CC BY-NC iNat. Sources ranked: **GBIF occurrence media** (`mediaType=StillImage`
  + license whitelist CC0/BY/BY-NC/BY-SA — best single source) → EOL → **BOLD specimen images** → more
  Wikimedia → broader-grade iNat → **PhyloPic CC0 silhouettes** as a universal fallback so nothing is
  blank offline. Build-time pass; keep the CC-license discipline. Then regenerate `precache-list.js`.

### PR-J · P1 — Double-tap to toggle full-screen (iPhone / Dynamic Island) — GitHub issue #57
Durrell, 2026-07-13 (from the trail): the full-screen standalone view looks great on a modern
iPhone with a Dynamic Island, **but there's no way out** — the top controls sit under the island
and can't be tapped. Ask: **double-tap toggles** between full-screen and a state with a **small
header area** exposed, growing or shrinking depending on the current state.
- Likely `viewport-fit=cover` + `env(safe-area-inset-top)`: pad the top in the "headroom" state.
- Must not hijack double-taps on rows/chips/photos/the map — only neutral chrome. Beware iOS
  double-tap-to-zoom. Remember the state (localStorage), like the ◐ toggle.
- Verify with CDP device emulation at 393×852, installed/standalone — not desktop Chrome.

### PR-K · ✅ DONE v1.0.53 — LISTS: curation as a first-class, portable primitive
**The hypothesis (Durrell, 2026-07-14):** "make SPECIALS editable" was never a missing *button* —
it was a **missing noun**. Every curated thing in the app is the same shape: a **named, scoped,
portable SET of species**. Because "a set of species" wasn't a concept, each one was hand-built
with its own storage key, its own UI and its own export field:

| was | now |
|---|---|
| `SPECIALS` — hardcoded object, matched by common-name **string** at boot | **shipped lists** (`lists.js`, keys resolved at BUILD time) |
| `marks` — exactly 2 hardcoded tiers (`MARKG`) | **two default lists** (`focal`, `tour`) |
| per-site highlights | derived from the **site-scoped lists** |
| "Export tour ⚑" (marks-only) — a workaround | **"Export lists ◆"** — curation without the notes |

**Lists and filters are duals.** The app was already a filter engine: a filter is a query that
yields a set; a list is a set that acts as a filter. PR-K closes the loop — **＋ list** freezes the
current view into a named list, and every list is a filter chip.

**The three layers, now separated:** *Corpus* (what exists — data.js/names.js/bold.js/lists.js) ·
**Curation** (what matters — lists; portable, mergeable, multi-author) · *Record* (what you saw —
seen/notes/journal; personal, private). Deliberately **not** folded together: `seen` is
species×site and time-stamped, notes are prose. Forcing them into the list shape would be the
abstraction leaking.

Store `sa5_lists` (v1); export **v3** carries `lists` and still emits a derived `marks` map so v2
files and readers keep working. Import is a **union** — never destructive. Deleting a shipped list
**tombstones** it so it is not silently re-seeded.

### Follow-ups RESHAPED by PR-K (were separate items; now expressed as lists)
- **Focal/tour/normal SORT** (was: a 3-way sort) → now **sort by list priority**: order the rows by
  which list(s) a species belongs to. The tiers are no longer special; any list can carry weight.
- **"Possible here" candidate pool** (regional envelope, 2σ ellipse) → becomes a **generated list**
  per site, not a new filter category. It ships like any other list and can be toggled/deleted.
- **eBird trip report** (blue-sky) → a **day-scoped list** export. The day checklist is already a
  set of species with a date; that is a list.
- **Multi-author curation** (new, now cheap): Durrell's picks and Shannon's picks can coexist as
  separate lists instead of one `marks` map that one import would clobber.

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
