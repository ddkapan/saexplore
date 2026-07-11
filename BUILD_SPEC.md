# BUILD_SPEC.md — Southern Africa Species Explorer (build pass)

**For:** Claude Code, implementing in this repo. **Companion:** a design reference
(link supplied at run time) + `DESIGN_BRIEF.md`.

> **Consult, don't port.** Treat the linked design as reference for **look / flow /
> interaction only**. Reimplement natively in `app.js` using our own tokens and
> string-patch style. **Do NOT copy the design tool's markup, CSS, or framework** —
> its scaffolding assumes an architecture we don't have and has broken us before.
> Behavior and data are governed by *this* file, not the design.

**Primary user:** the trip leader (expert). Density/complexity is acceptable.

## 0. Ground rules (unchanged from prior passes)
- Single-file **`app.js`** (CSS string + `window.APP5` shell + `window.__wire5`
  render/wire). `index.html` loads `data.js` then `app.js`. Offline PWA — **no CDNs,
  no new dependencies.** Edit in place with unique string anchors; do not rebuild.
- Verify with the jsdom harness: `node tests/render-test.js` → **ALL PASS**, and
  `node --check app.js`.
- **Never push to `main`** (protected). New uniquely-named branch → PR → review.
  Bump the `app.js` footer version and add a `## 1.0.N` block to `CHANGELOG.md`.
- Don't touch `data.js`, `MAPIMG`, the map image, or the ten Grinnell site accounts
  except where this spec calls for reading them.

## 1. State architecture — one state, many bound views
All filter surfaces edit **one shared state object**; editing any surface updates all.
Sites are the exemplar and already do this — generalize the pattern.
- **At-hand strip** (pinned just above the list) carries: **taxa/groups · search ·
  site-focus · late-July/season toggle.** These mirror the funnel controls (same state).
- **Sites** have three bound surfaces with **identical interaction + selected-state
  styling**: chips (dimmed = unselected; one click switches focus, "all" restores) ·
  map markers · column headers. Keep chips reachable during list work (their dimmed
  state *is* the restore mechanism — do **not** hide them behind a collapsed section,
  and do **not** add a separate header-restore control).
- **Columns = sites, rows = organisms.** Focusing a site collapses the matrix to its
  column; restore = reselect all (existing 'sa'/all-sites state) via a dim chip.

## 2. The funnel → DOM
Each funnel section (§2 of DESIGN_BRIEF) becomes a **`▸/▾` disclosure** (reuse the
existing `details`/site-account expander idiom; one triangle affordance everywhere).
Order: South Africa · regions · trip · sites · groups · filters&evidence · results ·
export. **Collapse-to-graduate:** as sections collapse, the list rises and the at-hand
strip becomes the working UI. Persist open/closed state in `localStorage`.

**DECISION TO CONFIRM — region as master filter.** Recommended: selecting a region up
top *cascades* (narrows sites → checklist), so the reading order and the filter state
are one object. If confirmed, demote/merge the current Sites/Match/region-preset bar
into the region + sites disclosures rather than keeping a separate global bar.

## 3. The Grinnell field notebook (the new build)
This is the substantive new functionality. It adds the **observer-authored** half of
the Grinnell method (the app currently only has received knowledge). Four parts:

### 3a. Journal — BY DATE
Dated entries, **keyed per site-day** (`{date, siteKey}`), linked to that site's
details page. Free-text typed notes for the leader's field jots: what happened, who we
met, conditions/effort. Single-author (leader) by default.

### 3b. Species notes — BY SPECIES (not dated)
A per-organism note attached to the species (keyed by organism `k`), **accumulating —
not a dated log.** Editable inline on the checklist row and in the detail drawer.
This is the classic species-account layer.

### 3c. Catalog — the fused checklist
Each catalog row = the organism **+ evidence checkmarks from our data (eBird · iNat ·
museum; genomic where present) + the user's own check-off + the user's species note +
an iNat-observation placeholder** (a slot to paste/attach an iNat observation URL/id —
the modern "specimen"). Surface the existing per-site user check-offs here.

### 3d. Persistence
Offline PWA, **no backend.** Notes live in `localStorage` under namespaced keys
(e.g. `sa5_journal`, `sa5_spnotes`, `sa5_checks`, `sa5_inatobs`). **Export is the save
mechanism** — make that explicit in the UI (no cloud sync; clearing the browser or
switching devices loses unexported notes → "export early, export often"). Provide a
**JSON export/import** for backup/transfer *in addition to* the rendered Grinnell page.

## 4. The Grinnell export (render)
Generate a saveable, printable page (self-contained HTML; printable to PDF via the
browser — no new libs). **Per day:**
1. **Journal narrative** (top) — the site-day entry.
2. **Species accounts** (middle) — the day's species with their details + the leader's
   species notes.
3. **Catalog list** (bottom) — the final list of what was recorded that day.
Also offer a **whole-trip** export (all days concatenated). Lay it out in the buff
field-journal aesthetic per the design reference. This closes the loop: the app
already frames sites in Grinnell terms; the output should be a Grinnell journal.

## 5. Fold-in fixes (from the review pass)
- **#54 Lowveld preset:** region presets match `s.region===r` on the literal
  "Lowveld", but Lowveld/Kruger sites carry "Lowveld / Limpopo", "Lowveld / Mpumalanga",
  "Kruger NP (north-central/south-west)". Match by substring/prefix (or add a normalized
  `regGroup:'cape'|'lowveld'` and match on that; also fixes `focusSite`'s
  region==='Cape Town'?'cape':'low').
- **#56 chip-wrap:** on narrow screens chips slide off-right. Make **wrap the default**
  under ~600px (media query, or default `.controls` to the existing `wrapon` class on
  small viewports), keeping the ⤢ toggle for horizontal scroll.
- **#55 gutter:** the expanded "More filters" panel loses its left padding in narrow
  mode — add a horizontal gutter to the section container.
- **#53 slider labels:** dual-slider end labels ("rare/common", year min/max) crowd the
  thumbs on desktop (>600px); the v1.0.22 fix was scoped to <600px only. Give `.dual`
  more height / move `.end` labels clear at all widths.

## 6. Completion promise (definition of done)
Stop only when a check prints `BUILD DONE ✅`:
- `node --check app.js` passes; `node tests/render-test.js` → **ALL PASS**.
- **Structural parity** (not code identity): the funnel sections exist as `▸/▾`
  disclosures in order; the at-hand strip contains taxa + search + site + season;
  every prior control still resolves.
- **Notebook round-trip:** a journal entry, a species note, and a check written to
  `localStorage` survive a reload (headless assertion); the Grinnell export renders the
  three-part (journal → accounts → catalog) document.
- **Fixes verified:** Lowveld preset selects the 5 Lowveld/Kruger sites; chips wrap
  under 600px; slider labels clear the thumbs.
- A branch is pushed and a **PR opened for review** (never merged to main by the run);
  a `## 1.0.N` CHANGELOG entry is added.

## 7. Decisions to confirm before/at build
1. **Region as master filter** (cascades to sites → checklist) vs narrative-only. (Rec: master filter.)
2. **Journal granularity:** one entry per **site-day** (rec) vs per-day.
3. **Species notes:** single-author (leader) — confirmed leader tool; per-observer is out of scope for now.
4. **Export scope:** per-day + whole-trip (rec) vs per-day only.

*Source of truth for locked decisions: task #57 (design-direction ledger).*
