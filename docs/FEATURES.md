# Feature checklist — everything the app does (v1.0.55)

Tick through this on the phone. It is the **inventory**; `docs/REHEARSAL.md` is the **procedure**
(upgrade → offline → a day's work → backup). Use them together.

**Scale:** 2,780 species · 10 sites · **every species has an image** (2,602 photos + 178 CC0
silhouettes) · 1,819 species barcoded · 2,559 with alias names · 11 shipped lists.

> **The three that end the trip if they fail** — check these hardest:
> 1. **Photos still there offline, after a phone reboot.**
> 2. **Notes survive closing the app completely and reopening.**
> 3. **The backup file actually lands somewhere you can find, and imports back.**

---

## Global — top of screen, everywhere

- [ ] **◐ dark / light** — flips the whole app; remembered next time.
- [ ] **A+ text size** — three steps.
- [ ] Both buttons sit **clear of the Dynamic Island** (not under it).
- [ ] Scroll **down** → they slide away. Scroll **up** → they come back.
- [ ] **Offline pill** — "Save photos for offline", with a real count (**N / 2,675**).
- [ ] **"Use it offline" card** — four steps: save photos · Add to Home Screen · notes &
      reference · **back it up every day**. Dismissible.

## 1–4 · Orientation

- [ ] **§1 The frame** — what this is; the summary paragraph.
- [ ] **§2 The two regions** — Cape winter vs Lowveld dry season; each on its own clock.
- [ ] **§3 The trip** — itinerary + the **shared map**, 10 markers.
- [ ] **Guided tour** — ▶ play / pause, ← → step, speed 🐢 🐇 (0.8–6s).
- [ ] **Map layers** — Basic / Terrain / **Satellite** (satellite is the default).
- [ ] **Map zoom (＋/−) and drag-pan** — and it **all works offline** (tiles are baked in).
- [ ] **§4 The ten sites** — each with a field account and its own highlights.

## 5–6 · Narrowing things down

- [ ] **Groups** — 10 taxa chips, with **all / none**.
- [ ] **Abundance** — multi-select (rare → common), not a floor.
- [ ] **Specimen year** — dual-ended slider.
- [ ] **Season** — **★ late Jul** (ON by default) · all year · the four seasons.
- [ ] **Sort** — A→Z · Z→A · taxonomic · **my lists** (your curated species first).
- [ ] **Evidence legend** — museum voucher · DNA barcode · iNaturalist · eBird.

## 7 · The results — the working checklist

- [ ] **Search across every name** — common, scientific, **synonyms**, the **10 SA languages**,
      and **eBird codes**. (Try `kolgans` → Egyptian Goose; `blagos1` → Black Sparrowhawk.)
- [ ] **Site chips** — focus a site; its column isolates. "All" clears it.
- [ ] **List chips** — ★ Focal · ⚑ Tour · 🦁 Big Five · ✓ Seen · **＋ list**.
- [ ] A site's own list chip appears **when you focus that site**.
- [ ] **＋ list** — freezes whatever is on screen into a new named list.
- [ ] **Sources in view** — a live breakdown of the evidence behind the species you are looking
      at; it **recomputes as you filter** (narrow to Birds → eBird climbs to ~100%).
- [ ] **Rows** — photo · common + scientific name · **evidence glyphs** · a presence dot per site.
- [ ] **☆ star** on each row — cycles **★ focal → ⚑ tour → off**.
- [ ] Curated species **pin to the top** under a ★ header (toggleable).
- [ ] The **count** sits at the bottom, where a result belongs.

## The species page (tap any row)

- [ ] **Photo** with correct attribution — and a **silhouette says it is a silhouette**, never
      passed off as a photo of the animal.
- [ ] **"Also known as"** — every alias we know, grouped by language.
- [ ] **Evidence band** — voucher · barcode · iNat · eBird, each linking out.
- [ ] **DNA barcodes** — how many records, **how many from South Africa**, **who holds them**,
      and a link to the actual records.
- [ ] **Season sparkline** — is it around in late July?
- [ ] **Where on this trip** — which sites.
- [ ] **Account text** (Wikipedia), cached for offline.
- [ ] **Links out** — GBIF · iNaturalist · eBird · Barcodes · Wikipedia.
- [ ] **Your note** on this species.
- [ ] **Seen ticks, per site.**
- [ ] **★ / ⚑ buttons, and every other list** — add it to any list from here.
- [ ] **iNaturalist observation** — paste a URL *or just the number*; it then shows on the
      species account and in the day's checklist.

## 8 · The field journal

- [ ] **One page per day**, in the Grinnell form: **narrative** on top, **species accounts** in
      the middle, the **day's checklist** at the bottom.
- [ ] Writing a note on a species **promotes it to a full account** on the day page.
- [ ] **Add a species that isn't in the corpus** — matched to GBIF online, saved as a stub
      offline to resolve later.
- [ ] **eBird checklist URLs** for the day.
- [ ] **Print** → a clean PDF for the day.
- [ ] **← Back to explorer** stays pinned and clear of the island.
- [ ] **Journal honours dark mode** (print still comes out white).

## Backup, sharing and lists (§8)

- [ ] **Export notes (JSON)** — the whole notebook. **Private.**
- [ ] **Export lists ◆** — your picks and site lists, **with none of your field notes**.
- [ ] **Import…** — merges as a **union**: it *adds*, it never overwrites what you have.
- [ ] **⚠ unsaved changes** appears when you have written anything since your last export —
      with a **Back up now** button. It clears once you have backed up.
- [ ] **Editing** an existing note brings the warning back (it watches content, not counts).
- [ ] **Lists manager** — every list: **filter · rename · delete**. Including the shipped ones —
      the site specials are yours to change.

---

## Known boundaries (not bugs)

- **25 species have no barcode data** — GBIF's backbone has no species record for them, and every
  fallback would have returned a genus-wide number. Under-reporting beats inventing.
- **178 species have a silhouette, not a photo** — no CC-licensed photo of them exists anywhere.
  They are labelled as drawings.
- **The country-level map has no satellite tile** — it falls back to streets. The two regional
  maps do have satellite.
- **eBird only speaks for birds** (585 of 2,780). **iNat covers 2,148.** That is why the
  iNaturalist import comes first — see `docs/INGEST_PLAN.md`.
