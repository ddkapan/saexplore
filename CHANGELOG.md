# Changelog — Southern Africa Species Explorer

Field guide for the California Academy of Sciences South Africa itinerary with
Dr. Shannon Bennett (20 Jul – 1 Aug 2026). One organism per row on the GBIF
Backbone, merged across eBird · iNaturalist · museum vouchers · genomic samples.

Newest first. Each version corresponds to a merged pull request; the footer of the
app shows the running version. Versions 1.0.0–1.0.3 predate the in-app version
footer and are reconstructed from the pre-versioning development phases.

---

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
