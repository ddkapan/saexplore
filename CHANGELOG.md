# Changelog â Southern Africa Species Explorer

Field guide for the California Academy of Sciences South Africa itinerary with
Dr. Shannon Bennett (20 Jul â 1 Aug 2026). One organism per row on the GBIF
Backbone, merged across eBird Â· iNaturalist Â· museum vouchers Â· genomic samples.

Newest first. Each version corresponds to a merged pull request; the footer of the
app shows the running version. Versions 1.0.0â1.0.3 predate the in-app version
footer and are reconstructed from the pre-versioning development phases.

---

## 1.0.39 â share your tour: one-tap marks-only export

The tour/focal marks already rode the full field-notes JSON, but the only export dumped
everything. Added an **"Export tour ⚡"** button (section 08) that downloads a clean
**marks-only** file (your focal/tour picks + their eBird codes) â the same shape as the
bundled favorites preload. Hand it to another user; importing merges the pins and leaves
their notes/checklist/journal untouched.

## 1.0.38 â phone: focusing a site isolates its column

On a phone, focusing a site still showed the full wide table, so you had to scroll sideways
to find that site's presence dots. Now focusing a site collapses the matrix to just that
column â one presence dot per row, no horizontal scrolling â and lists only the species
recorded there. The "only at <site>" toggle in the strip flips back to the full table
(all sites). Tied to the existing hide-absent toggle, so it's one clear control.

## 1.0.37 â restore "Also known as" for the split species

The genus-collapse cleanup in 1.0.31 dropped the synonym/vernacular block from records keyed
to a GBIF genus â which stripped "Also known as" from the recently-split species. Restored by
pulling the **resolved species'** aliases (their old-genus binomials + vernaculars):

- **Black Goshawk** â also *Accipiter melanoleucus*, **Black Sparrowhawk**, Afrikaans
  *Swartsperwer*; **African Goshawk** â *Accipiter tachiro*; **Little Bittern** â *Ixobrychus
  minutus*; plus Black-backed Jackal, Rusty-spotted Genet, Flappet Lark, Natal Acraea, African
  Veined White. The old scientific name (often what field guides still print) is now a synonym.
- The 17 remaining genus-collapsed records are obscure inverts/plants with no other names in
  GBIF; they show their species name and are searchable. (Tracked in BACKLOG.)

Built by `tools/reconcile/pull_aka.js` â `aka_fix.json`, folded in by `build_names.js`.

## 1.0.36 â journal back-nav reachable (Dynamic Island / one-hand)

The field journal opened as a full-screen overlay with its "â Back to explorer" button at
the very top â tucked under the iPhone Dynamic Island, hard to hit, and scrolled away once
you moved down the page.

- The journal now respects the **top safe-area inset**, so the bar clears the Island/notch.
- The top bar (back Â· day-picker Â· print) is **sticky** â always reachable, however far you
  scroll.
- The **back button is larger and bolder** (a proper tap target).

## 1.0.35 â real dark mode (light text on dark, easy on the eye)

The â toggle already flipped a `data-theme=dark` palette, but only elements using CSS
variables changed â the **species list, strip, and drawer were built from a JS colour
object baked to light values**, so they stayed bright (and 1.0.33's safety fix had pinned
the page to light). Now:

- The colour object points at the **live CSS variables**, so every one of the ~97 inline
  styles flips with the theme instantly â **the species list is now light text on a dark
  background**, and so are the filters, drawer, highlights, and map markers.
- `color-scheme` **follows the app's own toggle** (light by default, dark when you switch),
  so iOS auto-dark still can't render note-field text invisible, but a deliberate switch to
  dark now themes the whole app.
- Toggle it with **â** (top-right); the choice is remembered.
  (Follow-ups: the Grinnell journal is still a light "paper" surface by design â print-
  friendly â and a few hardcoded tertiary grays; tracked in BACKLOG.)

## 1.0.34 â "Filters at hand" redesigned: search-first, consistent all/none

The at-hand filter strip was a single wrap of mixed controls. Rebuilt as three stacked
rows with a clear hierarchy:

- **Row 1 â search leads.** Search is the most-used action, so it's the widest, most
  obvious control, with the live count beside it. Placeholder now says it matches **any
  name, eBird code, or type, in every language**.
- **Row 2 â Groups.** `all` / `none` sit on the **left**, then the taxonomic group chips.
- **Row 3 â Sites.** `all` (show every site) on the left, then the site chips, then the
  `â late Jul` season toggle.

`all` / `none` now occupy the **same leading position on every row** for muscle memory.
(Follow-ups tracked in BACKLOG: harmonising the section-6 filter controls to match,
â-click set-union across chips, and collapsing the funnel's teaching duplicates.)

## 1.0.33 â quick wins: title, satellite map, photo border, dark-mode text

- **"South Africa"** (was "Southern Africa") in the header, page title, and manifest â the
  trip is South Africa specifically.
- **Map defaults to satellite** where a satellite tile exists (Cape / Lowveld); the country
  overview still falls back to the basic tile (no satellite tile baked for it yet).
- **Darker gray border** on the drawer photo for definition against the parchment.
- **Dark-mode fix:** note/input text was rendering white-on-light (invisible) on dark-mode
  devices; the app now pins `color-scheme: light` so its fixed parchment palette renders
  consistently. A full dark theme is tracked separately.

## 1.0.32 â offline rescue (the app survives updates + airplane mode)

The service worker was keeping the app shell **and** ~1,300 bird photos in a single
versioned cache that `activate` deleted on every update â so each new version wiped
everything and re-downloaded from scratch, and if the device went offline mid-refresh the
content vanished. Rewritten for reliability:

- **Two caches:** a small **versioned shell cache** (index.html, data.js, names.js, app.js,
  manifest, icon) and a **stable media cache** for photos/accounts that is **never wiped on
  a version bump** â bird photos persist across updates and don't re-download.
- **Resilient install:** the shell is cached item-by-item (one bad URL can't reject the whole
  install), and the worker only takes over **after** the shell is safely stored. Photo
  precache is chunked, best-effort, and never blocks or fails the install.
- **Offline-readiness pill:** a small indicator shows whether the app is saved for offline,
  with a **"save photos for offline"** action + progress â so you can confirm it's ready
  before a flight. Shell cache â `sa-shell-v11`; media cache `sa-media-v1` (stable).

## 1.0.31 â eBird is canonical for birds (join key + names)

Birds are indexed on **eBird/Clements**, so an exported file joins straight to eBird
checklists and trip reports. iNaturalist stays as a synonym.

- **eBird species code on every bird (the join key).** It was already in the corpus
  (per-site data) â now surfaced: **584/585 Aves** carry `ebk`, it's **searchable**
  (type `blagos1`), it links to the eBird species page, and it's written into the
  favorites/journal **export** (`ebird: {corpusKey â code}` for referenced species).
- **eBird scientific names are canonical.** 15 birds adopt eBird's binomial â the split
  hawks (*Astur / Aerospiza / Tachyspiza*, already resolved in 1.0.30) plus genus moves
  eBird tracks (White-fronted Plover *Charadrius* â *Anarhynchus*, Rufous-naped Lark
  *Mirafra* â *Corypha*) and spelling fixes (*burchellii*, *corusca*). The previous
  iNat/GBIF form drops to a synonym in "Also known as". **Common names already matched
  eBird** (0 of 585 changed).
- **Dropped coarse-key vernacular noise.** A handful of records are keyed to a
  higher-rank GBIF node (a plover keyed to *Animalia*), which had leaked "Animals" /
  genus-level "â¦and Allies" into the synonym list. The sidecar no longer attaches GBIF
  synonyms/vernaculars pulled against a kingdomâgenus key.
- Built by `tools/reconcile/pull_ebird.js` (one call to the eBird taxonomy) +
  `build_names.js`; `ebird_codes.json` / `ebird_taxonomy.json` retained for reproducible
  builds. sw cache â v10. Taxonomy Â© Cornell Lab / eBird.

## 1.0.30 â genus-collapse fix: prefer the resolved species, never fail to genus

Follow-up to the name index. Some corpus records were matched to a GBIF **genus** key
during the build (recent splits: *Accipiter* â *Aerospiza* / *Astur* / *Tachyspiza*,
etc.), so the scientific name shown was a bare genus and the account/Wikipedia pulled the
*genus* article â hiding the species. Rule applied (Shannon's): **prefer the species-level
name even when it's a synonym; a collision must never fail over to the genus.**

- **25 genus-collapsed records resolved to species** (`names.js` `sp`), e.g. Black Goshawk
  â *Astur melanoleucus*, African Goshawk â *Aerospiza tachiro*, Little Sparrowhawk â
  *Tachyspiza minulla*, Black-backed Jackal â *Lupulella mesomelas*, Common Protea â
  *Protea afra*. The table, drawer header, species accounts, journal, search, and the
  GBIF/iNat/Wikipedia links all prefer the species now. The genus stays in the search
  haystack â union, never exclude.
- **Whole-corpus iNat-id audit** (all 2,148 ids, 30/call). Beyond `o.s`, the id behind the
  "Normally" account + photo could itself be a **genus** (African Goshawk, Flappet Lark,
  Thrush Nightingale) or a **different species** (*Passerina filiformis* was pulling
  *P. corymbosa*). Those are re-pointed to the correct species id (`sp` `spii`); the fetch
  and links use it. Verified two other flags were only synonyms/spelling variants (no
  change). One bare-phylum record (*Tracheophyta*) is flagged for DATA_PASS review.
- Built by `tools/reconcile/build_names.js` from `genus_fix.json` (the resolution
  crosswalk, so a future DATA_PASS can bake it into `data.js` at source). sw cache â v9.

## 1.0.29 â union name index: OR-search across every name + name-expander

First working slice of the name backbone (`docs/NAME_BACKBONE.md`). The principle is
**union, never exclude**: every alias we can find is kept and placed "to the right" of
the corpus name as provenance â narrowing is a filter, never a data wall.

- **Union name sidecar (`names.js`).** A build-time pull of GBIF **synonyms** +
  **vernacular names** (multilingual), keyed by corpus usageKey, folded into
  `window.NAMES` â 2,550 of 2,780 taxa now carry aliases (2,016 with scientific
  synonyms, 1,922 with alternate English names, 1,470 with **South African local
  names**: Afrikaans, isiZulu, isiXhosa, Setswana, Sepedi, Sesotho, siSwati,
  Tshivená¸a, Xitsonga, isiNdebele). Built by `tools/reconcile/build_names.js`; the
  full multilingual union is a one-line whitelist change away (cache retained).
- **OR-search across all names.** A query now hits a species via its key **or any
  alias** â search *kolgans* (Afrikaans) â Egyptian Goose, *isibululu* (isiZulu) â
  Puff Adder, an eBird 4-letter code, or a superseded scientific name. Shannon's books
  each use different names; now they all resolve to the same row.
- **Per-species name-expander.** The detail drawer gains a collapsible **"Also known
  as"** block listing other scientific names, alternate English names, and local names
  grouped by language, each source-labelled.
- Loaded before `app.js` and precached by the service worker (`sa-explorer-v8`);
  degrades gracefully if the sidecar is absent (search falls back to corpus names).

## 1.0.28 â favorites preload + name-backbone design

A small, testable step toward the shared "value-add" workflow and the naming spine.

- **Favorites preload (`samples/saexplore-favorites.json`).** A marks-only JSON that
  pins 47 focal/tour species from the Cal Academy itinerary (29 tour + 18 focal),
  matched to the corpus by scientific name. **Import is non-destructive** â it sets the
  focal/tour pins and leaves notes / checklist / journal untouched â so it's a clean way
  to test the JSON round-trip and to seed a device from a laptop-prepared list.
- **Fix:** importing a JSON now **repaints the focal/tour strip chip** (previously the
  pins applied and rows floated, but the `â N focal/tour` chip stayed hidden until the
  next interaction).
- **Design note `docs/NAME_BACKBONE.md`.** Captures the naming architecture we're
  prototyping on this two-biome trip but designing globally: **union every name, never
  exclude; authoritative name as the key with all other names (GBIF Â· iNat Â· eBird Â·
  BOLD Â· field-guide books Â· local/indigenous) to the right; OR-match; keep both names
  when a source disagrees; cross-link concept conflicts rather than merging them.**
  Narrowing (possible-here toggle, origin native/introduced/invasive, top-surprises,
  taxa/abundance/region) is always a **filter over the one union, not a data wall.**
  Investigated live against GBIF/iNat: confirmed backbone-version key drift
  (*Bubulcus*â*Ardea ibis*, *Icthyophaga*â*Haliaeetus vocifer*) is why union-by-name,
  not dedup-by-key, is the right spine.

## 1.0.27 â focal/tour tiers, highlights, tour & map (Shannon's field review, PR-C)

Third of three review PRs. The trip-planning value-add: mark the species you care
about, build the tour from them, and get the map layers back. No data changes.

- **Focal / tour tiers (T1).** A small **â** sits on every species row; tap it to
  cycle **â focal** (your interest) â **â tour** (a shared highlight) â off. The
  detail drawer has the same two buttons. Marked species **pin to the top** of the
  checklist under a **â Focal & tour** header; a **â N focal/tour** chip on the
  at-hand strip toggles the pin on/off (the "sticky with a hide option"). Marks are
  saved and **travel in the JSON export/import** â populate them on a laptop, import
  on your phone in the field.
- **Highlights surface your picks (T2).** The map's Trip Highlights lead with your
  focal/tour species (flagged), and a focused site lists its focal/tour first. Species
  found at only one site on the trip get an **"only here"** tag as a highlight cue.
  (The abundance Venn multi-select from PR-A already covers "show just the rare ones.")
- **Tour speed (T3).** **â / â** slow down / speed up the playing tour; an on-screen
  **ð¢ 3.2s ð** control in the tour bar does the same. Range 0.8â6.0 s per stop.
- **Selectable map layers + zoom (T4).** The map exposes **Basic Â· Terrain Â·
  Satellite** again (baked offline for the Cape and Lowveld views) and a **ï¼ / â**
  zoom with drag-to-pan. Switching region/focus resets the zoom.
- Tests extended (mark cycle, pinning + unpin, layer switch, zoom controls, tour
  speed, marks survive reload). `sw` cache v5 â v6.

Deferred: **â-click multi-site compare** (needs the single-focus model to become
multi-focus) â a focused follow-up rather than bundling more risk into this PR.

## 1.0.26 â Grinnell Field Journal overhaul (Shannon's field review, PR-B)

Second of three review PRs. Rewrites the journal from a static export into a
working, per-day field journal in the Grinnell form. No data changes.

- **Per-day Grinnell page (J1).** Page masthead reads **Observer: S. Bennett & SA
  Explore Team Â· 2026**; each day leads with the **Location** and the **Date**
  beneath it (mirrors the Trachte 2017 journal). Body flows **weather â narrative
  â species accounts â the day's checklist**. The day picker scopes to one day;
  **print each day** to PDF (the checklist reflows to **two columns** in print and
  all edit chrome is hidden).
- **Species accounts = only species you wrote about (J1/J2).** A species is
  promoted to an account only once it has a field note â the checklist still lists
  everything detected, so accounts stay short.
- **Two-way, single-copy notes (J2).** A species note is editable from both the
  explorer drawer and the journal, backed by one stored value. **Tap any checklist
  row** to open its note tray inline; typing promotes it to the accounts section.
- **Auto-expanding note boxes (J3).** The narrative and every note grow to fit
  their text (also applied to the drawer note).
- **Link your eBird checklists (J4).** Paste an eBird checklist URL per day; it
  shows at the top of that day's page and travels in the export. Offline-safe â the
  URL is stored and opens when you're back online.
- **Add species not in the offline DB (J5).** "ï¼ add a species not in the list"
  per day. **Online** it matches the name against the **GBIF backbone** (fills the
  scientific name + key); **offline** it saves a plain-text **stub** you can
  **resolve on GBIF** later. Stubs and their notes survive JSON export/import.
- Tests extended (account promotion, checklist trays, stub add + reload, eBird link
  reload). `sw` cache v4 â v5.

Open question for Shannon (non-blocking): eBird linking is per-day **checklist
URLs** for now â say the word if you'd rather import an eBird **trip report** or
pull lists live.

## 1.0.25 â round-2 quick wins & voice pass (Shannon's field review, PR-A)

First of three review PRs on the landed redesign. Fixes and small features; no
data changes.

- **Abundance is now a multi-select, not a floor.** The five mini abundance chips
  each toggle independently (rare Â· scarce Â· uncommon Â· frequent Â· common) â pick
  any subset, e.g. "just rare." Selecting none means no abundance filter. Replaces
  the old "minimum N" slider behavior, which could not isolate a single class and
  whose high end never bound. (Addresses B2 abundance + the core of T2.)
- **Focus hides absent species instead of graying them.** Focusing a site now hides
  species with no record there (the dimmed, non-actionable rows are gone â
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
  IUCN Red Listâ¦"**; added the four data-source base URLs â **GBIF Â· BOLD Â·
  iNaturalist Â· eBird** â above the numbered footnotes; the journal page reads
  **"Grinnell Field Journal"**; and a sweep of marketing/AI phrasing back to plain
  field-guide voice.

Deferred to later PRs (noted here so nothing is lost): â-click multi-site compare
needs multi-focus plumbing â folded into PR-C (map/tour); the highlight picker and
focal/tour tiers â PR-C.

## 1.0.24 â the "funnel â workbench" redesign + observer notebook

Ground-up reimplementation of `app.js` on the imported design pass
(claude.ai/design â `Species Explorer.dc.html`), bound to the real ~2,780-organism
corpus. The app is now a **narrative funnel that becomes a workbench**.

- **Eight `â¾/â¸` disclosure sections** (South Africa â the two regions â the trip â
  the sites â the groups â filters & evidence â the results â export). Independent
  per-section triangles, persisted in `localStorage` â you "graduate by collapsing"
  from orienting to fluent mode without changing screens.
- **Region is the master filter.** Whole trip / Cape / Lowveld cascades to the site
  chips, the map view and the checklist columns. Region is grouped by
  `SMETA.sites.region === 'Cape Town'` â Cape / else Lowveld, **fixing the old
  literal-"Lowveld" substring bug** (Lowveld now correctly selects all 5
  Lowveld/Kruger sites).
- **"Filters at hand" sticky strip** (taxa Â· search Â· site chips Â· â late Jul + a
  live N/total count and a â-seen tally), bound to the same state as the funnel.
- **Checklist matrix** on the full corpus: taxon rail Â· photo Â· name/crumb Â·
  evidence glyphs Â· one cell per site (presence dot / green â). Sightings float to
  the top, newest first, under a live "â Seen this trip" header.
- **Shared 3-column map** on the real baked `MAPIMG` tiles: focused site's Grinnell
  account on the left, the map with focus-pulse markers in the centre, species
  highlights on the right â plus the itinerary bar and Play tour. Sites focus
  identically from four surfaces (chips Â· markers Â· itinerary Â· column headers).
- **Detail drawer**: evidence band with real GBIF/iNat/eBird deep links, photo,
  season sparkline, per-site "seen" chips (sync the matrix), an iNat-observation
  slot, and autosaving species notes.
- **Observer notebook (the Grinnell method's authored half):** a printable
  field-journal export â per site-day, buff paper, editable weather + journal
  narrative â species accounts with the leader's notes â the day's checklist;
  choose one day or the whole trip. **JSON export/import** of all field notes
  ("export is the save mechanism" â fully offline).
- **Embedded, cited reference section** by the footer: the app's load-bearing
  claims verified against IUCN, SANBI, BirdLife, UNESCO, SANParks & CEPF, with
  corrections flagged (e.g. African Penguin now IUCN Critically Endangered;
  Kirstenbosch the *first*, not "only", botanic garden in a natural WHS).
- Fix: `seen` (a Set) now persists via `Array.from` â checks previously vanished
  across reloads. Tests rewritten to the new DOM + a notebook reload round-trip.

Offline PWA, no dependencies. `node tests/render-test.js` â ALL PASS.

---

## 1.0.23 â declutter the control block (2026-07-10)
- **Reorganized, not redesigned** (implements the *Control-block declutter* design spec). The header dropped from a tall stack to **four always-visible primary rows** â `Sites Â· Match Â· Season Â· Taxa` â plus the status line. Everything set-and-forget folds into **one collapsed disclosure** labelled **âMore filters, sorting & the evidence basis.â**
- **One panel, not two.** Per the spec, the existing `details.methods` element gains a `refine` class and the set-and-forget rows are inserted *above* its Venn/how-to, so the filters and the evidentiary basis share a single disclosure: Abundance + Specimen yr, Seen lately, Sort + Text-size + absent-toggle, then the evidence Venn + how-to (unchanged). (The legacy Evidence/Groups rows were already `display:none`'d by `buildVenn()`, so they're left untouched.)
- **No control removed, nothing re-wired.** The reorder IIFE now *re-parents* existing `.row` nodes rather than appending them all to `.controls`; wiring is by class/id, so every hook (`#rLo #yLo #reset #q #tripwin #allyr .smode .seenw .chip.sort .fsb .cmpT .chip.site .chip.tax`) keeps working. `Refine`âs open/closed state is remembered in `localStorage` (`sa5_refine`).
- **â late Jul** (leftmost in the Season row) now has a real **pressed state** â filled blue while Jul + Aug is the active window (its default on load), reverting to an outline when you tap **all yr** or pick a different season/month.
- Re-implemented **on top of** v1.0.22 (the design package was branched from v1.0.21) â the genomic-flag restore, end-to-end taxonomic sort, â-late-Jul default, filtered matrix count, and mobile polish all persist. Offline PWA intact â pure CSS/DOM, no new dependencies. `node --check app.js` passes; `node tests/render-test.js` â **ALL PASS (15/15)**.

## 1.0.22 â genomic restored + grab-bag fixes (2026-07-10)
- **Genomic evidence restored.** The v1.0.19 data pass silently dropped the `g` flag from `src` while keeping the genomic counts â so the *genomic* column in Methods and the badges went blank even though 210 organisms carry genomic records. Re-flagged all 210; the column and glyphs light up again.
- **Genomic link no longer 404s.** The genomic glyph pointed at BOLD's dead pre-v5 URL. Repointed to a working GBIF `MATERIAL_SAMPLE` occurrence search on the backbone `taxonKey`.
- **Taxonomic sort now follows the authority end-to-end**: class â order â family â **scientific name** (genus, then species), instead of stopping at family and tie-breaking on common name. Genera now cluster correctly (e.g. within Laridae the *Chroicocephalus* gulls and *Sterna*/*Thalasseus* terns each group together rather than mixing by English name).
- **â late Jul** moved to the **left** of the Season row and is now the **default** on load (Jul + Aug); one tap on **all yr** clears it.
- **Pinned matrix header** shows the **filtered** organism count (âspecies 1,576â), not the fixed total.
- Mobile polish: drawer close **Ã** clears the iOS status-bar/notch (safe-area inset) so it isnât obscured in full screen; dual sliders get more vertical room on narrow screens so the rare/common labels stop colliding.

## 1.0.21 â seen-lately filter + fixes (2026-07-10)
- **"Seen lately" filter** now exists (its own row): `any Â· â¤1yr Â· â¤3mo Â· â¤1mo` on the most-recent iNat/eBird record date (uses the `ld` field from the data pass; 500 organisms in the last 30 days, 1,323 in a year).
- **Site-account expander** no longer collapses the moment you scroll â it stays open until you've scrolled *past* it (its bottom leaves the viewport), so you can read the card.
- Fixed the off-looking **Taxa** row label (now matches the other control-row labels).

## 1.0.20 â backbone tidy (2026-07-10)
- Post-enrichment backbone check: birds mis-filed as non-Aves = 0, non-bird eBird = 0. Reclassified *Erica tristis* (a fynbos heath) from "Other" to **Plantae / Ericaceae**. Six blank-class records remain by design â velvet worms (Peripatopsidae), a phylum-level museum specimen, and three obscure names that need a live GBIF lookup; left as "Other" rather than guessed.
- Added a **Backbone integrity audit** appendix to `DATA_PASS.md` (self-contained follow-up `/goal`) for future sweeps.

## 1.0.19 â data pass: iNaturalist + museum evidence, photos, recency (2026-07-10)
- **Birds â iNaturalist**: attached research-grade iNaturalist evidence to birds at every site (matched by scientific name). Birds carrying an `i` source went **0 â 474** (of 585); 30 also gained GBIF `PRESERVED_SPECIMEN` museum vouchers.
- **All groups enriched uniformly**: iNaturalist (`i`) and museum (`m`) layers merged into every group's per-site evidence from iNat `species_counts` + GBIF preserved-specimen boxes (tight per-site boxes, human-observation excluded from the museum layer).
- **Missing photos filled**: organisms with no photo dropped **1,448 â 270** using only CC / CC0 / public-domain images â iNaturalist taxon default photos first, then a **Wikimedia Commons** fallback (license verified per image via Commons `imageinfo`; all-rights-reserved skipped).
- **"Seen lately" dates (Part C)**: added a top-level `ld:"YYYY-MM-DD"` most-recent-observation field to **1,420** organisms (from the iNaturalist date-desc pass), ready to power a recency filter.
- Enriched **in place** â no schema change, no rebuild; `MAPIMG` tiles and Grinnell site accounts untouched. `node tests/render-test.js` â **ALL PASS (15/15)**.

## 1.0.18 â map zoom & pan (2026-07-09)
- Map **+ / â zoom** (scales the baked image *and* its markers together, 1Ãâ4Ã) and **click-drag / touch pan** â fully offline, no tiles.

## 1.0.17 â match row, multi-select, tour info (2026-07-09)
- **Match** moved to its own row (`Sites Â· Match Â· Abundance Â· Season Â· Sort Â· Taxa`) so its controls are actually visible.
- **â/Ctrl-click** multi-selects site chips (plain click still focuses one).
- The tour auto-shows each site's Grinnell account alongside the map as it steps.

## 1.0.16 â site set-logic (2026-07-09)
- **Match mode** `any Â· all Â· only 1` over the selected sites + **Cape / Lowveld / all** region presets ("at every Cape stop", "Cape specialties", â¦).
- Fixed the â nav-pill button to reliably reach the bottom.

## 1.0.15 â mobile usability (2026-07-09)
- Fixed iPhone scrolling (matrix un-bounds below 600 px); reliable background-tap dismiss on old iOS Safari; chip-wrap toggle (â¤¢) + jump-to-top/bottom pill.
- Control order to **Sites Â· Match Â· Abundance Â· Season Â· Sort Â· Taxa**; year slider now filters (`apply()` was missing) and resets; **â unique-to-1-site** filter; drawer photo no longer crops bird heads.

## 1.0.14 â evidence â real records (2026-07-09)
- Top evidence glyphs became **links to actual records** â iNat observations, eBird species-at-hotspot, GBIF `PRESERVED_SPECIMEN`, BOLD genomic â filtered to the focused site.
- GBIF links fixed to precise `taxonKey` + `geometry` (camelCase). Matrix scrolls in its own bounded pane with a nav pill. *(folds in 1.0.13: backbone-key GBIF links.)*

## 1.0.12 â clickable evidence glyphs (2026-07-09)
- First pass making the evidence band clickable through to each source.

## 1.0.11 â site-account expander (2026-07-09)
- â¸/â¾ "site account" on the Sites row reveals each site's Grinnell account inline and auto-collapses on scroll.

## 1.0.10 â taxonomy-aware search (2026-07-09)
- Search understands `butterfly`, `moth`, `snake`, `beetle`, `fish`, plus any order/family (`Lepidoptera`, `Nymphalidae`); "butterfly" 2 â 92 hits. Stale footer date removed.

## 1.0.9 â controls reorder (2026-07-09)
- Control rows reordered; search moved onto the Taxa line.

## 1.0.8 â accounts recovered (2026-07-09)
- Recovered the ten Grinnell site accounts into `data.js`; methods how-to reordered (Narrowing â Worked example â Evidentiary) and widened; account card carries the site colour.

## 1.0.7 â colour system (2026-07-09)
- Site chips coloured by **winter rainfall** (dry â wet); season chips by **austral climate** (Summer red â Winter blue â Spring purple); colours carried into account chips.

## 1.0.6 â service worker & legend (2026-07-09)
- Removed the disruptive SW auto-reload (was wiping filters mid-scroll); footer legend puts iNat before eBird.

## 1.0.5 â site chips (2026-07-09)
- Click a focused site again to deselect back to all; unselected chips dimmed; version footer added.

## 1.0.4 â taxa placement + data fixes (2026-07-09)
- Taxa chips above methods; no-wrap control rows; scroll fix.
- Data: relabelled **57 mis-classified fish** (blank GBIF class); fixed **3 eBird birds** filed as plants/other via genus homonyms (larks â the palm *Corypha*; a plover â kingdom *Animalia*).

## 1.0.3 â restore & polish (2026-07-08) *(pre-footer)*
- Season / month filter + **â late-July** trip window restored as a primary control; itinerary made the headline with sources demoted to a collapsible **Methods** panel.
- Grab-bag: taxon filter + clickable Venn row-labels; corrected evidence-badge order; sticky location columns; drawer per-site check-marks; working site tour; compress-absent-rows; plain-language status line; **network-first service worker**; jsdom render-test harness.

## 1.0.2 â file-based build & PWA (2026-07-08) *(pre-footer)*
- Split into `index.html` + `data.js` + `app.js` for diffable, git-tracked editing (ending in-browser context-rot); offline PWA (`sw.js`, `manifest.json`, `icon.svg`).
- Site focus: tap a chip/dot to focus the map and collapse the matrix to that column.

## 1.0.1 â unified model & museum layer (2026-07-08) *(pre-footer)*
- One organism per row on the **GBIF Backbone** (2,780 organisms, 99.8 % matched); evidence **Venn** (source Ã taxon group, OR/AND); dual abundance + specimen-year sliders.
- GBIF `PRESERVED_SPECIMEN` layer in tight per-site boxes (collection-based only).

## 1.0.0 â foundations (2026-07-07) *(pre-footer)*
- Ten localities resolved (Cape Town cluster + Lowveld/Kruger): coordinates, iNaturalist places, eBird hotspots.
- eBird species lists + bar-chart seasonality/rarity and iNaturalist occurrence records pulled per site; all names resolved to the GBIF Backbone.
- Species Ã site checklist matrix; Grinnell-style site accounts authored; initial rich HTML study file + compact field checklist.

---

*This project ran as a rapid-iteration research preview; versions 1.0.4+ carry an
in-app footer stamp, earlier numbers are a retrospective of the build phases.*
