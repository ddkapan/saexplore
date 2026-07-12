# Changelog — Southern Africa Species Explorer

Field guide for the California Academy of Sciences South Africa itinerary with
Dr. Shannon Bennett (20 Jul – 1 Aug 2026). One organism per row on the GBIF
Backbone, merged across eBird · iNaturalist · museum vouchers · genomic samples.

Newest first. Each version corresponds to a merged pull request; the footer of the
app shows the running version. Versions 1.0.0–1.0.3 predate the in-app version
footer and are reconstructed from the pre-versioning development phases.

---

## 1.0.44 — intro summary, "Use it offline" card, dark-mode journal

- **A one-paragraph summary at the top** — what the app is, that it runs a museum
  naturalist's field notes **in reverse** (you start from the filed record), and that in the
  **Grinnell** tradition you then take your own notes, per day and per species.
- **"Use it offline · as an app" card** — one place for the app-like steps: **1** save the
  photos (button, drives the same page-side precache + shows the count), **2** Add to Home
  Screen / Install, **3** notes & reference. Dismissible ("hide ✕", remembered).
- **The field journal now honours dark mode** — its light "paper" surfaces flip to dark with
  the ◐ toggle (print still renders white). Shell cache → `sa-shell-v23`.

## 1.0.43 — "save photos for offline" actually completes now

The previous fix helped Chrome but the photo save still only got partway (and, with Wi‑Fi
off, pretended to run). Two deeper causes:

- **The precache ran inside the service worker, which iOS terminates after ~30s** — so it
  stopped wherever it happened to be. It now runs **from the page**, which lives as long as
  the app is open, and shows **"keep the app open"**.
- **Progress counted attempts, not actual photos, and never checked connectivity.** It now
  reports the **real cached count** (`N / 1315`) read back from the cache, **detects offline**
  ("You're offline — connect to Wi‑Fi, then tap to save photos"), **retries** throttled
  photos over a few passes, and **resumes** on re-tap (skips what's already saved). Verified
  via CDP: climbs well past the old ~93 with an accurate count. `precache-list.js` is now in
  the app shell; shell cache → `sa-shell-v22`.

## 1.0.42 — filters round 2: season-on, tag filters, count moved, dark chips

Follow-up to the at-hand redesign:

- **★ late Jul is now a top-row quick filter and on by default** — the app opens on the
  trip window (what's actually around late July), not all 2,780 records.
- **Tagged quick-filters** in the top row: **★ focal · ⚑ tour · ✓ seen this trip**. They're
  explicit picks, so they show your tagged species **regardless of season/site/abundance**
  (still honouring search + groups). Union: turn on any combination.
- **The count is a result, not a filter** — the `N / 2,780` fraction moved from the top of
  the strip to the **bottom**, under a divider.
- **Dark-mode site chips** were muddy on the dark background; their per-site tints are now
  lightened for dark mode (and repaint when you toggle ◐). Shell cache → `sa-shell-v21`.

## 1.0.41 — "save photos for offline" now works on Chrome (was stuck ~93)

"Save photos for offline" worked on iPad/Safari but stalled around 93 on Chrome. Cause:
the precache used `cache.add()` with `no-cors`, and **Chrome rejects opaque responses from
`cache.add()`** (Safari is lenient) — so photos never cached there — while hung/throttled
requests permanently stalled the workers. Fixed:

- The iNat photos allow **CORS** (2.4 KB each), so the precache now `fetch(cors)` + `cache.put`
  — real responses that cache on Chrome, with accurate (un-padded) quota. Verified via
  Chrome DevTools Protocol: the count climbs past 93 to the full set (was hard-stuck at 93).
- A **per-request timeout** + gentler concurrency (4, small stagger) so a throttled request
  can't stall the run; it also **resumes** on re-tap (already-cached photos are skipped).
- On load the app now calls `registration.update()` to **shed a stale/older service worker**
  promptly — if the app looked broken on a device that had an old cached worker, reopening
  online (or a hard refresh) now replaces it. Shell cache → `sa-shell-v20`.
- Also fixed mojibake in the export-panel buttons ("▸", "…") that a prior tooling edit
  introduced.

## 1.0.40 — per-site "specials to look out for" (Big Five, penguins, endemics)

The highlights rail + tour sorted each site by abundance — but charismatic species carry
abundance `_e=0`, so the Big Five, African Penguin, and endemic birds were buried under
common filler ("previous baked-in selections that were lost"). Added a **curated per-site
specials list** (from the trip digest / brochure) that surfaces right after your own marks:

- Focus **Boulders** → African Penguin leads; **Karongwe / Kruger** → the full Big Five;
  **Cape** sites → Cape Sugarbird, Orange-breasted Sunbird, oystercatcher, cormorants.
- 76 of 81 curated names resolve via the alias index ("African Bush Elephant" → African
  Savanna Elephant, "Swift Tern" → Great Crested Tern); the rest aren't recorded at that
  site. This also seeds the empty-tour "things to look out for" per region.

## 1.0.39 — share your tour: one-tap marks-only export

The tour/focal marks already rode the full field-notes JSON, but the only export dumped
everything. Added an **"Export tour ⚡"** button (section 08) that downloads a clean
**marks-only** file (your focal/tour picks + their eBird codes) — the same shape as the
bundled favorites preload. Hand it to another user; importing merges the pins and leaves
their notes/checklist/journal untouched.

## 1.0.38 — phone: focusing a site isolates its column

On a phone, focusing a site still showed the full wide table, so you had to scroll sideways
to find that site's presence dots. Now focusing a site collapses the matrix to just that
column — one presence dot per row, no horizontal scrolling — and lists only the species
recorded there. The "only at <site>" toggle in the strip flips back to the full table
(all sites). Tied to the existing hide-absent toggle, so it's one clear control.

## 1.0.37 — restore "Also known as" for the split species

The genus-collapse cleanup in 1.0.31 dropped the synonym/vernacular block from records keyed
to a GBIF genus — which stripped "Also known as" from the recently-split species. Restored by
pulling the **resolved species'** aliases (their old-genus binomials + vernaculars):

- **Black Goshawk** → also *Accipiter melanoleucus*, **Black Sparrowhawk**, Afrikaans
  *Swartsperwer*; **African Goshawk** → *Accipiter tachiro*; **Little Bittern** → *Ixobrychus
  minutus*; plus Black-backed Jackal, Rusty-spotted Genet, Flappet Lark, Natal Acraea, African
  Veined White. The old scientific name (often what field guides still print) is now a synonym.
- The 17 remaining genus-collapsed records are obscure inverts/plants with no other names in
  GBIF; they show their species name and are searchable. (Tracked in BACKLOG.)

Built by `tools/reconcile/pull_aka.js` → `aka_fix.json`, folded in by `build_names.js`.

## 1.0.36 — journal back-nav reachable (Dynamic Island / one-hand)

The field journal opened as a full-screen overlay with its "← Back to explorer" button at
the very top — tucked under the iPhone Dynamic Island, hard to hit, and scrolled away once
you moved down the page.

- The journal now respects the **top safe-area inset**, so the bar clears the Island/notch.
- The top bar (back · day-picker · print) is **sticky** — always reachable, however far you
  scroll.
- The **back button is larger and bolder** (a proper tap target).

## 1.0.35 — real dark mode (light text on dark, easy on the eye)

The ◐ toggle already flipped a `data-theme=dark` palette, but only elements using CSS
variables changed — the **species list, strip, and drawer were built from a JS colour
object baked to light values**, so they stayed bright (and 1.0.33's safety fix had pinned
the page to light). Now:

- The colour object points at the **live CSS variables**, so every one of the ~97 inline
  styles flips with the theme instantly — **the species list is now light text on a dark
  background**, and so are the filters, drawer, highlights, and map markers.
- `color-scheme` **follows the app's own toggle** (light by default, dark when you switch),
  so iOS auto-dark still can't render note-field text invisible, but a deliberate switch to
  dark now themes the whole app.
- Toggle it with **◐** (top-right); the choice is remembered.
  (Follow-ups: the Grinnell journal is still a light "paper" surface by design — print-
  friendly — and a few hardcoded tertiary grays; tracked in BACKLOG.)

## 1.0.34 — "Filters at hand" redesigned: search-first, consistent all/none

The at-hand filter strip was a single wrap of mixed controls. Rebuilt as three stacked
rows with a clear hierarchy:

- **Row 1 — search leads.** Search is the most-used action, so it's the widest, most
  obvious control, with the live count beside it. Placeholder now says it matches **any
  name, eBird code, or type, in every language**.
- **Row 2 — Groups.** `all` / `none` sit on the **left**, then the taxonomic group chips.
- **Row 3 — Sites.** `all` (show every site) on the left, then the site chips, then the
  `★ late Jul` season toggle.

`all` / `none` now occupy the **same leading position on every row** for muscle memory.
(Follow-ups tracked in BACKLOG: harmonising the section-6 filter controls to match,
⌘-click set-union across chips, and collapsing the funnel's teaching duplicates.)

## 1.0.33 — quick wins: title, satellite map, photo border, dark-mode text

- **"South Africa"** (was "Southern Africa") in the header, page title, and manifest — the
  trip is South Africa specifically.
- **Map defaults to satellite** where a satellite tile exists (Cape / Lowveld); the country
  overview still falls back to the basic tile (no satellite tile baked for it yet).
- **Darker gray border** on the drawer photo for definition against the parchment.
- **Dark-mode fix:** note/input text was rendering white-on-light (invisible) on dark-mode
  devices; the app now pins `color-scheme: light` so its fixed parchment palette renders
  consistently. A full dark theme is tracked separately.

## 1.0.32 — offline rescue (the app survives updates + airplane mode)

The service worker was keeping the app shell **and** ~1,300 bird photos in a single
versioned cache that `activate` deleted on every update — so each new version wiped
everything and re-downloaded from scratch, and if the device went offline mid-refresh the
content vanished. Rewritten for reliability:

- **Two caches:** a small **versioned shell cache** (index.html, data.js, names.js, app.js,
  manifest, icon) and a **stable media cache** for photos/accounts that is **never wiped on
  a version bump** — bird photos persist across updates and don't re-download.
- **Resilient install:** the shell is cached item-by-item (one bad URL can't reject the whole
  install), and the worker only takes over **after** the shell is safely stored. Photo
  precache is chunked, best-effort, and never blocks or fails the install.
- **Offline-readiness pill:** a small indicator shows whether the app is saved for offline,
  with a **"save photos for offline"** action + progress — so you can confirm it's ready
  before a flight. Shell cache → `sa-shell-v11`; media cache `sa-media-v1` (stable).

## 1.0.31 — eBird is canonical for birds (join key + names)

Birds are indexed on **eBird/Clements**, so an exported file joins straight to eBird
checklists and trip reports. iNaturalist stays as a synonym.

- **eBird species code on every bird (the join key).** It was already in the corpus
  (per-site data) — now surfaced: **584/585 Aves** carry `ebk`, it's **searchable**
  (type `blagos1`), it links to the eBird species page, and it's written into the
  favorites/journal **export** (`ebird: {corpusKey → code}` for referenced species).
- **eBird scientific names are canonical.** 15 birds adopt eBird's binomial — the split
  hawks (*Astur / Aerospiza / Tachyspiza*, already resolved in 1.0.30) plus genus moves
  eBird tracks (White-fronted Plover *Charadrius* → *Anarhynchus*, Rufous-naped Lark
  *Mirafra* → *Corypha*) and spelling fixes (*burchellii*, *corusca*). The previous
  iNat/GBIF form drops to a synonym in "Also known as". **Common names already matched
  eBird** (0 of 585 changed).
- **Dropped coarse-key vernacular noise.** A handful of records are keyed to a
  higher-rank GBIF node (a plover keyed to *Animalia*), which had leaked "Animals" /
  genus-level "…and Allies" into the synonym list. The sidecar no longer attaches GBIF
  synonyms/vernaculars pulled against a kingdom→genus key.
- Built by `tools/reconcile/pull_ebird.js` (one call to the eBird taxonomy) +
  `build_names.js`; `ebird_codes.json` / `ebird_taxonomy.json` retained for reproducible
  builds. sw cache → v10. Taxonomy © Cornell Lab / eBird.

## 1.0.30 — genus-collapse fix: prefer the resolved species, never fail to genus

Follow-up to the name index. Some corpus records were matched to a GBIF **genus** key
during the build (recent splits: *Accipiter* → *Aerospiza* / *Astur* / *Tachyspiza*,
etc.), so the scientific name shown was a bare genus and the account/Wikipedia pulled the
*genus* article — hiding the species. Rule applied (Shannon's): **prefer the species-level
name even when it's a synonym; a collision must never fail over to the genus.**

- **25 genus-collapsed records resolved to species** (`names.js` `sp`), e.g. Black Goshawk
  → *Astur melanoleucus*, African Goshawk → *Aerospiza tachiro*, Little Sparrowhawk →
  *Tachyspiza minulla*, Black-backed Jackal → *Lupulella mesomelas*, Common Protea →
  *Protea afra*. The table, drawer header, species accounts, journal, search, and the
  GBIF/iNat/Wikipedia links all prefer the species now. The genus stays in the search
  haystack — union, never exclude.
- **Whole-corpus iNat-id audit** (all 2,148 ids, 30/call). Beyond `o.s`, the id behind the
  "Normally" account + photo could itself be a **genus** (African Goshawk, Flappet Lark,
  Thrush Nightingale) or a **different species** (*Passerina filiformis* was pulling
  *P. corymbosa*). Those are re-pointed to the correct species id (`sp` `spii`); the fetch
  and links use it. Verified two other flags were only synonyms/spelling variants (no
  change). One bare-phylum record (*Tracheophyta*) is flagged for DATA_PASS review.
- Built by `tools/reconcile/build_names.js` from `genus_fix.json` (the resolution
  crosswalk, so a future DATA_PASS can bake it into `data.js` at source). sw cache → v9.

## 1.0.29 — union name index: OR-search across every name + name-expander

First working slice of the name backbone (`docs/NAME_BACKBONE.md`). The principle is
**union, never exclude**: every alias we can find is kept and placed "to the right" of
the corpus name as provenance — narrowing is a filter, never a data wall.

- **Union name sidecar (`names.js`).** A build-time pull of GBIF **synonyms** +
  **vernacular names** (multilingual), keyed by corpus usageKey, folded into
  `window.NAMES` — 2,550 of 2,780 taxa now carry aliases (2,016 with scientific
  synonyms, 1,922 with alternate English names, 1,470 with **South African local
  names**: Afrikaans, isiZulu, isiXhosa, Setswana, Sepedi, Sesotho, siSwati,
  Tshivenḓa, Xitsonga, isiNdebele). Built by `tools/reconcile/build_names.js`; the
  full multilingual union is a one-line whitelist change away (cache retained).
- **OR-search across all names.** A query now hits a species via its key **or any
  alias** — search *kolgans* (Afrikaans) → Egyptian Goose, *isibululu* (isiZulu) →
  Puff Adder, an eBird 4-letter code, or a superseded scientific name. Shannon's books
  each use different names; now they all resolve to the same row.
- **Per-species name-expander.** The detail drawer gains a collapsible **"Also known
  as"** block listing other scientific names, alternate English names, and local names
  grouped by language, each source-labelled.
- Loaded before `app.js` and precached by the service worker (`sa-explorer-v8`);
  degrades gracefully if the sidecar is absent (search falls back to corpus names).

## 1.0.28 — favorites preload + name-backbone design

A small, testable step toward the shared "value-add" workflow and the naming spine.

- **Favorites preload (`samples/saexplore-favorites.json`).** A marks-only JSON that
  pins 47 focal/tour species from the Cal Academy itinerary (29 tour + 18 focal),
  matched to the corpus by scientific name. **Import is non-destructive** — it sets the
  focal/tour pins and leaves notes / checklist / journal untouched — so it's a clean way
  to test the JSON round-trip and to seed a device from a laptop-prepared list.
- **Fix:** importing a JSON now **repaints the focal/tour strip chip** (previously the
  pins applied and rows floated, but the `★ N focal/tour` chip stayed hidden until the
  next interaction).
- **Design note `docs/NAME_BACKBONE.md`.** Captures the naming architecture we're
  prototyping on this two-biome trip but designing globally: **union every name, never
  exclude; authoritative name as the key with all other names (GBIF · iNat · eBird ·
  BOLD · field-guide books · local/indigenous) to the right; OR-match; keep both names
  when a source disagrees; cross-link concept conflicts rather than merging them.**
  Narrowing (possible-here toggle, origin native/introduced/invasive, top-surprises,
  taxa/abundance/region) is always a **filter over the one union, not a data wall.**
  Investigated live against GBIF/iNat: confirmed backbone-version key drift
  (*Bubulcus*↔*Ardea ibis*, *Icthyophaga*↔*Haliaeetus vocifer*) is why union-by-name,
  not dedup-by-key, is the right spine.

## 1.0.27 — focal/tour tiers, highlights, tour & map (Shannon's field review, PR-C)

Third of three review PRs. The trip-planning value-add: mark the species you care
about, build the tour from them, and get the map layers back. No data changes.

- **Focal / tour tiers (T1).** A small **☆** sits on every species row; tap it to
  cycle **★ focal** (your interest) → **⚑ tour** (a shared highlight) → off. The
  detail drawer has the same two buttons. Marked species **pin to the top** of the
  checklist under a **★ Focal & tour** header; a **★ N focal/tour** chip on the
  at-hand strip toggles the pin on/off (the "sticky with a hide option"). Marks are
  saved and **travel in the JSON export/import** — populate them on a laptop, import
  on your phone in the field.
- **Highlights surface your picks (T2).** The map's Trip Highlights lead with your
  focal/tour species (flagged), and a focused site lists its focal/tour first. Species
  found at only one site on the trip get an **"only here"** tag as a highlight cue.
  (The abundance Venn multi-select from PR-A already covers "show just the rare ones.")
- **Tour speed (T3).** **← / →** slow down / speed up the playing tour; an on-screen
  **🐢 3.2s 🐇** control in the tour bar does the same. Range 0.8–6.0 s per stop.
- **Selectable map layers + zoom (T4).** The map exposes **Basic · Terrain ·
  Satellite** again (baked offline for the Cape and Lowveld views) and a **＋ / −**
  zoom with drag-to-pan. Switching region/focus resets the zoom.
- Tests extended (mark cycle, pinning + unpin, layer switch, zoom controls, tour
  speed, marks survive reload). `sw` cache v5 → v6.

Deferred: **⌘-click multi-site compare** (needs the single-focus model to become
multi-focus) — a focused follow-up rather than bundling more risk into this PR.

## 1.0.26 — Grinnell Field Journal overhaul (Shannon's field review, PR-B)

Second of three review PRs. Rewrites the journal from a static export into a
working, per-day field journal in the Grinnell form. No data changes.

- **Per-day Grinnell page (J1).** Page masthead reads **Observer: S. Bennett & SA
  Explore Team · 2026**; each day leads with the **Location** and the **Date**
  beneath it (mirrors the Trachte 2017 journal). Body flows **weather → narrative
  → species accounts → the day's checklist**. The day picker scopes to one day;
  **print each day** to PDF (the checklist reflows to **two columns** in print and
  all edit chrome is hidden).
- **Species accounts = only species you wrote about (J1/J2).** A species is
  promoted to an account only once it has a field note — the checklist still lists
  everything detected, so accounts stay short.
- **Two-way, single-copy notes (J2).** A species note is editable from both the
  explorer drawer and the journal, backed by one stored value. **Tap any checklist
  row** to open its note tray inline; typing promotes it to the accounts section.
- **Auto-expanding note boxes (J3).** The narrative and every note grow to fit
  their text (also applied to the drawer note).
- **Link your eBird checklists (J4).** Paste an eBird checklist URL per day; it
  shows at the top of that day's page and travels in the export. Offline-safe — the
  URL is stored and opens when you're back online.
- **Add species not in the offline DB (J5).** "＋ add a species not in the list"
  per day. **Online** it matches the name against the **GBIF backbone** (fills the
  scientific name + key); **offline** it saves a plain-text **stub** you can
  **resolve on GBIF** later. Stubs and their notes survive JSON export/import.
- Tests extended (account promotion, checklist trays, stub add + reload, eBird link
  reload). `sw` cache v4 → v5.

Open question for Shannon (non-blocking): eBird linking is per-day **checklist
URLs** for now — say the word if you'd rather import an eBird **trip report** or
pull lists live.

## 1.0.25 — round-2 quick wins & voice pass (Shannon's field review, PR-A)

First of three review PRs on the landed redesign. Fixes and small features; no
data changes.

- **Abundance is now a multi-select, not a floor.** The five mini abundance chips
  each toggle independently (rare · scarce · uncommon · frequent · common) — pick
  any subset, e.g. "just rare." Selecting none means no abundance filter. Replaces
  the old "minimum N" slider behavior, which could not isolate a single class and
  whose high end never bound. (Addresses B2 abundance + the core of T2.)
- **Focus hides absent species instead of graying them.** Focusing a site now hides
  species with no record there (the dimmed, non-actionable rows are gone —
  especially noisy on a phone). A one-tap **"only at <site>" / "all sites shown"**
  chip on the at-hand strip flips between the focused checklist and the full
  distribution. Default is hidden. (B4 + Shannon's grayed-rows note.)
- **Text-size control for phones.** A new `A+` button (top-right, beside the theme
  toggle) steps through three reading sizes and remembers the choice. Scales the
  explorer and the journal.
- **At-hand strip gains taxa All / None** and groups the multi-select controls on
  the left. (B3.)
- **Mobile: the specimen-year slider gets room.** Taller track and full-width labels
  under ~480px so the year min/max clear the thumbs. (B1.)
- **Voice pass (V).** Removed "buff" and the load-bearing wording; trimmed the
  references heading to **"References & sources"**; plain **"Checked against the
  IUCN Red List…"**; added the four data-source base URLs — **GBIF · BOLD ·
  iNaturalist · eBird** — above the numbered footnotes; the journal page reads
  **"Grinnell Field Journal"**; and a sweep of marketing/AI phrasing back to plain
  field-guide voice.

Deferred to later PRs (noted here so nothing is lost): ⌘-click multi-site compare
needs multi-focus plumbing → folded into PR-C (map/tour); the highlight picker and
focal/tour tiers → PR-C.

## 1.0.24 — the "funnel → workbench" redesign + observer notebook

Ground-up reimplementation of `app.js` on the imported design pass
(claude.ai/design → `Species Explorer.dc.html`), bound to the real ~2,780-organism
corpus. The app is now a **narrative funnel that becomes a workbench**.

- **Eight `▾/▸` disclosure sections** (South Africa → the two regions → the trip →
  the sites → the groups → filters & evidence → the results → export). Independent
  per-section triangles, persisted in `localStorage` — you "graduate by collapsing"
  from orienting to fluent mode without changing screens.
- **Region is the master filter.** Whole trip / Cape / Lowveld cascades to the site
  chips, the map view and the checklist columns. Region is grouped by
  `SMETA.sites.region === 'Cape Town'` → Cape / else Lowveld, **fixing the old
  literal-"Lowveld" substring bug** (Lowveld now correctly selects all 5
  Lowveld/Kruger sites).
- **"Filters at hand" sticky strip** (taxa · search · site chips · ★ late Jul + a
  live N/total count and a ✓-seen tally), bound to the same state as the funnel.
- **Checklist matrix** on the full corpus: taxon rail · photo · name/crumb ·
  evidence glyphs · one cell per site (presence dot / green ✓). Sightings float to
  the top, newest first, under a live "✓ Seen this trip" header.
- **Shared 3-column map** on the real baked `MAPIMG` tiles: focused site's Grinnell
  account on the left, the map with focus-pulse markers in the centre, species
  highlights on the right — plus the itinerary bar and Play tour. Sites focus
  identically from four surfaces (chips · markers · itinerary · column headers).
- **Detail drawer**: evidence band with real GBIF/iNat/eBird deep links, photo,
  season sparkline, per-site "seen" chips (sync the matrix), an iNat-observation
  slot, and autosaving species notes.
- **Observer notebook (the Grinnell method's authored half):** a printable
  field-journal export — per site-day, buff paper, editable weather + journal
  narrative → species accounts with the leader's notes → the day's checklist;
  choose one day or the whole trip. **JSON export/import** of all field notes
  ("export is the save mechanism" — fully offline).
- **Embedded, cited reference section** by the footer: the app's load-bearing
  claims verified against IUCN, SANBI, BirdLife, UNESCO, SANParks & CEPF, with
  corrections flagged (e.g. African Penguin now IUCN Critically Endangered;
  Kirstenbosch the *first*, not "only", botanic garden in a natural WHS).
- Fix: `seen` (a Set) now persists via `Array.from` — checks previously vanished
  across reloads. Tests rewritten to the new DOM + a notebook reload round-trip.

Offline PWA, no dependencies. `node tests/render-test.js` → ALL PASS.

---

## 1.0.23 — declutter the control block (2026-07-10)
- **Reorganized, not redesigned** (implements the *Control-block declutter* design spec). The header dropped from a tall stack to **four always-visible primary rows** — `Sites · Match · Season · Taxa` — plus the status line. Everything set-and-forget folds into **one collapsed disclosure** labelled **“More filters, sorting & the evidence basis.”**
- **One panel, not two.** Per the spec, the existing `details.methods` element gains a `refine` class and the set-and-forget rows are inserted *above* its Venn/how-to, so the filters and the evidentiary basis share a single disclosure: Abundance + Specimen yr, Seen lately, Sort + Text-size + absent-toggle, then the evidence Venn + how-to (unchanged). (The legacy Evidence/Groups rows were already `display:none`'d by `buildVenn()`, so they're left untouched.)
- **No control removed, nothing re-wired.** The reorder IIFE now *re-parents* existing `.row` nodes rather than appending them all to `.controls`; wiring is by class/id, so every hook (`#rLo #yLo #reset #q #tripwin #allyr .smode .seenw .chip.sort .fsb .cmpT .chip.site .chip.tax`) keeps working. `Refine`’s open/closed state is remembered in `localStorage` (`sa5_refine`).
- **★ late Jul** (leftmost in the Season row) now has a real **pressed state** — filled blue while Jul + Aug is the active window (its default on load), reverting to an outline when you tap **all yr** or pick a different season/month.
- Re-implemented **on top of** v1.0.22 (the design package was branched from v1.0.21) — the genomic-flag restore, end-to-end taxonomic sort, ★-late-Jul default, filtered matrix count, and mobile polish all persist. Offline PWA intact — pure CSS/DOM, no new dependencies. `node --check app.js` passes; `node tests/render-test.js` → **ALL PASS (15/15)**.

## 1.0.22 — genomic restored + grab-bag fixes (2026-07-10)
- **Genomic evidence restored.** The v1.0.19 data pass silently dropped the `g` flag from `src` while keeping the genomic counts — so the *genomic* column in Methods and the badges went blank even though 210 organisms carry genomic records. Re-flagged all 210; the column and glyphs light up again.
- **Genomic link no longer 404s.** The genomic glyph pointed at BOLD's dead pre-v5 URL. Repointed to a working GBIF `MATERIAL_SAMPLE` occurrence search on the backbone `taxonKey`.
- **Taxonomic sort now follows the authority end-to-end**: class → order → family → **scientific name** (genus, then species), instead of stopping at family and tie-breaking on common name. Genera now cluster correctly (e.g. within Laridae the *Chroicocephalus* gulls and *Sterna*/*Thalasseus* terns each group together rather than mixing by English name).
- **★ late Jul** moved to the **left** of the Season row and is now the **default** on load (Jul + Aug); one tap on **all yr** clears it.
- **Pinned matrix header** shows the **filtered** organism count (“species 1,576”), not the fixed total.
- Mobile polish: drawer close **×** clears the iOS status-bar/notch (safe-area inset) so it isn’t obscured in full screen; dual sliders get more vertical room on narrow screens so the rare/common labels stop colliding.

## 1.0.21 — seen-lately filter + fixes (2026-07-10)
- **"Seen lately" filter** now exists (its own row): `any · ≤1yr · ≤3mo · ≤1mo` on the most-recent iNat/eBird record date (uses the `ld` field from the data pass; 500 organisms in the last 30 days, 1,323 in a year).
- **Site-account expander** no longer collapses the moment you scroll — it stays open until you've scrolled *past* it (its bottom leaves the viewport), so you can read the card.
- Fixed the off-looking **Taxa** row label (now matches the other control-row labels).

## 1.0.20 — backbone tidy (2026-07-10)
- Post-enrichment backbone check: birds mis-filed as non-Aves = 0, non-bird eBird = 0. Reclassified *Erica tristis* (a fynbos heath) from "Other" to **Plantae / Ericaceae**. Six blank-class records remain by design — velvet worms (Peripatopsidae), a phylum-level museum specimen, and three obscure names that need a live GBIF lookup; left as "Other" rather than guessed.
- Added a **Backbone integrity audit** appendix to `DATA_PASS.md` (self-contained follow-up `/goal`) for future sweeps.

## 1.0.19 — data pass: iNaturalist + museum evidence, photos, recency (2026-07-10)
- **Birds ↔ iNaturalist**: attached research-grade iNaturalist evidence to birds at every site (matched by scientific name). Birds carrying an `i` source went **0 → 474** (of 585); 30 also gained GBIF `PRESERVED_SPECIMEN` museum vouchers.
- **All groups enriched uniformly**: iNaturalist (`i`) and museum (`m`) layers merged into every group's per-site evidence from iNat `species_counts` + GBIF preserved-specimen boxes (tight per-site boxes, human-observation excluded from the museum layer).
- **Missing photos filled**: organisms with no photo dropped **1,448 → 270** using only CC / CC0 / public-domain images — iNaturalist taxon default photos first, then a **Wikimedia Commons** fallback (license verified per image via Commons `imageinfo`; all-rights-reserved skipped).
- **"Seen lately" dates (Part C)**: added a top-level `ld:"YYYY-MM-DD"` most-recent-observation field to **1,420** organisms (from the iNaturalist date-desc pass), ready to power a recency filter.
- Enriched **in place** — no schema change, no rebuild; `MAPIMG` tiles and Grinnell site accounts untouched. `node tests/render-test.js` → **ALL PASS (15/15)**.

## 1.0.18 — map zoom & pan (2026-07-09)
- Map **+ / − zoom** (scales the baked image *and* its markers together, 1×–4×) and **click-drag / touch pan** — fully offline, no tiles.

## 1.0.17 — match row, multi-select, tour info (2026-07-09)
- **Match** moved to its own row (`Sites · Match · Abundance · Season · Sort · Taxa`) so its controls are actually visible.
- **⌘/Ctrl-click** multi-selects site chips (plain click still focuses one).
- The tour auto-shows each site's Grinnell account alongside the map as it steps.

## 1.0.16 — site set-logic (2026-07-09)
- **Match mode** `any · all · only 1` over the selected sites + **Cape / Lowveld / all** region presets ("at every Cape stop", "Cape specialties", …).
- Fixed the ↓ nav-pill button to reliably reach the bottom.

## 1.0.15 — mobile usability (2026-07-09)
- Fixed iPhone scrolling (matrix un-bounds below 600 px); reliable background-tap dismiss on old iOS Safari; chip-wrap toggle (⤢) + jump-to-top/bottom pill.
- Control order to **Sites · Match · Abundance · Season · Sort · Taxa**; year slider now filters (`apply()` was missing) and resets; **★ unique-to-1-site** filter; drawer photo no longer crops bird heads.

## 1.0.14 — evidence → real records (2026-07-09)
- Top evidence glyphs became **links to actual records** — iNat observations, eBird species-at-hotspot, GBIF `PRESERVED_SPECIMEN`, BOLD genomic — filtered to the focused site.
- GBIF links fixed to precise `taxonKey` + `geometry` (camelCase). Matrix scrolls in its own bounded pane with a nav pill. *(folds in 1.0.13: backbone-key GBIF links.)*

## 1.0.12 — clickable evidence glyphs (2026-07-09)
- First pass making the evidence band clickable through to each source.

## 1.0.11 — site-account expander (2026-07-09)
- ▸/▾ "site account" on the Sites row reveals each site's Grinnell account inline and auto-collapses on scroll.

## 1.0.10 — taxonomy-aware search (2026-07-09)
- Search understands `butterfly`, `moth`, `snake`, `beetle`, `fish`, plus any order/family (`Lepidoptera`, `Nymphalidae`); "butterfly" 2 → 92 hits. Stale footer date removed.

## 1.0.9 — controls reorder (2026-07-09)
- Control rows reordered; search moved onto the Taxa line.

## 1.0.8 — accounts recovered (2026-07-09)
- Recovered the ten Grinnell site accounts into `data.js`; methods how-to reordered (Narrowing → Worked example → Evidentiary) and widened; account card carries the site colour.

## 1.0.7 — colour system (2026-07-09)
- Site chips coloured by **winter rainfall** (dry → wet); season chips by **austral climate** (Summer red → Winter blue → Spring purple); colours carried into account chips.

## 1.0.6 — service worker & legend (2026-07-09)
- Removed the disruptive SW auto-reload (was wiping filters mid-scroll); footer legend puts iNat before eBird.

## 1.0.5 — site chips (2026-07-09)
- Click a focused site again to deselect back to all; unselected chips dimmed; version footer added.

## 1.0.4 — taxa placement + data fixes (2026-07-09)
- Taxa chips above methods; no-wrap control rows; scroll fix.
- Data: relabelled **57 mis-classified fish** (blank GBIF class); fixed **3 eBird birds** filed as plants/other via genus homonyms (larks → the palm *Corypha*; a plover → kingdom *Animalia*).

## 1.0.3 — restore & polish (2026-07-08) *(pre-footer)*
- Season / month filter + **★ late-July** trip window restored as a primary control; itinerary made the headline with sources demoted to a collapsible **Methods** panel.
- Grab-bag: taxon filter + clickable Venn row-labels; corrected evidence-badge order; sticky location columns; drawer per-site check-marks; working site tour; compress-absent-rows; plain-language status line; **network-first service worker**; jsdom render-test harness.

## 1.0.2 — file-based build & PWA (2026-07-08) *(pre-footer)*
- Split into `index.html` + `data.js` + `app.js` for diffable, git-tracked editing (ending in-browser context-rot); offline PWA (`sw.js`, `manifest.json`, `icon.svg`).
- Site focus: tap a chip/dot to focus the map and collapse the matrix to that column.

## 1.0.1 — unified model & museum layer (2026-07-08) *(pre-footer)*
- One organism per row on the **GBIF Backbone** (2,780 organisms, 99.8 % matched); evidence **Venn** (source × taxon group, OR/AND); dual abundance + specimen-year sliders.
- GBIF `PRESERVED_SPECIMEN` layer in tight per-site boxes (collection-based only).

## 1.0.0 — foundations (2026-07-07) *(pre-footer)*
- Ten localities resolved (Cape Town cluster + Lowveld/Kruger): coordinates, iNaturalist places, eBird hotspots.
- eBird species lists + bar-chart seasonality/rarity and iNaturalist occurrence records pulled per site; all names resolved to the GBIF Backbone.
- Species × site checklist matrix; Grinnell-style site accounts authored; initial rich HTML study file + compact field checklist.

---

*This project ran as a rapid-iteration research preview; versions 1.0.4+ carry an
in-app footer stamp, earlier numbers are a retrospective of the build phases.*
