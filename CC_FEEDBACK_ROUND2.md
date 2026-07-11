# CC_FEEDBACK_ROUND2.md — Shannon's review of the landed redesign

**Source:** Dr. Shannon Bennett's field review of the pushed redesign (**v1.0.23**),
tested full-screen on Mac and on **iPhone 16 Pro**.
**Base:** current `main` (v1.0.23 + `DESIGN_BRIEF.md` / `BUILD_SPEC.md`). This is
concrete round-2 feedback *on top of* the funnel/notebook direction in those docs —
read them for intent; this file is the punch list.

**Rules of engagement (unchanged):** single-file `app.js`, offline PWA, no new deps,
string-patch in place, jsdom tests must pass, **never push to `main`**, branch → PR →
review. Consult any design reference for look only; reimplement natively.

---

## VOICE & CONTENT RULES — apply to every string you write or touch
- **Never use the word "loadbearing"** in any text written for this user. (Standing rule.)
- **Remove "buff"** everywhere — especially the Grinnell journal description. It is not
  a "buff nature journal."
- **AI-language sweep:** do a large pass and strip any AI-generated / marketing phrasing.
  Plain field-guide voice only.
- **Trim the provenance line:** "References & sources" is enough. **Delete** lines like
  "the claims above verified in 2026" — too much.
- **IUCN phrasing:** just say **"Checked against the IUCN Red List…"** (plain, short).
- **Footnotes:** before footnotes 1–10, list the **base URL for each data source**, in
  this order: **1 = GBIF, 2 = BOLD, 3 = iNaturalist, 4 = eBird.**
- **Journal page title:** **"Grinnell Field Journal"** (not "export").

---

## SUGGESTED COMMIT / PR GROUPING
Each **bucket = one commit** (message prefix in brackets). Recommend **three PRs** so
review stays reviewable:

- **PR-A — Quick wins & fixes:** B1, B2, B3, B4, + the Voice pass (V).
- **PR-B — Notebook / Grinnell journal overhaul:** J1, J2, J3, J4, J5.
- **PR-C — Tour, highlights, map:** T1, T2, T3, T4.

Bump `app.js` footer + `CHANGELOG.md` once per PR. Never merge to main from the run.

---

## PR-A — QUICK WINS & FIXES

### B1 `[fix] mobile: squished labels in expanded filters (iPhone 16 Pro)`
When "More filters, sorting & evidence" is expanded on iPhone, the text under
**Abundance** and **Specimen yr** is squished/overlapping. (The v1.0.22 spacing fix was
scoped <600px but still crowds; desktop crowding was logged as #53.)
**Do:** give the dual-slider `.end` labels room at all widths — more `.dual` height,
labels clear of the thumbs; verify on a ~390px viewport.
**Accept:** on iPhone-width, "rare/common" and the year min/max sit clear of the thumbs,
not overlapping.

### B2 `[fix] control bugs: abundance "common" toggle + cmd-click multi-select`
- The **"common" (high-end) toggle on Abundance does not work** — the upper handle /
  common end doesn't apply. Fix the high-end binding.
- **⌘-click multi-select** on chips "didn't seem to work" (Shannon will retry, but
  verify): plain click focuses one; ⌘/Ctrl-click should toggle-add without losing the
  others. Confirm it works on Mac Safari/Chrome.
**Accept:** dragging/toggling the common end filters the list; ⌘-click adds a second
site/taxon without dropping the first.

### B3 `[layout] multi-select controls left-aligned + All/None on the at-hand strip`
- **Move all multi-selection controls to the LEFT:** Match any/all/only-1, select-all,
  taxa all/none — left-aligned, not pushed right.
- **Add the All / None (taxa) buttons to the "filters at hand" strip** so the at-hand
  taxa control is actually useful (one tap to clear, one to focus a single taxon —
  Shannon specifically likes all-vs-none for fast single-taxon focus).
**Accept:** the at-hand strip has working All/None for taxa; multi-select controls
group on the left.

### B4 `[feature] hide-absent-at-focus toggle (restore old behavior)`
Old app: when focused on one location you could **toggle off species not recorded at
that location** to cut clutter. The new focus list shows the whole distribution at once
(good — keep that), but add an optional toggle to **hide species absent from the
chip-focused location**. Both modes allowed (no guarantee a species truly isn't there,
so it's a view toggle, not a claim).
**Accept:** with a site focused via a chip, a toggle hides/show rows with no record at
that site; default = show all (current behavior).

---

## PR-B — NOTEBOOK / GRINNELL JOURNAL OVERHAUL
Reference the attached Grinnell journal photo (N. Trachte 2017) for the page model.

### J1 `[journal] page = "Grinnell Field Journal page", per-day, Grinnell layout`
- Rename the page from "export" → **"Grinnell Field Journal page."** Remove "buff";
  plainer metadata line. A **savable page per day.**
- **Header, LEFT block** (mirror the Trachte journal's left margin):
  - **Observer:** S. Bennett & SA Explore Team
  - **Year:** 2026
  - then each entry: **Location name**, with the **Date on the left, underneath the
    location name.**
- **Body per day:** (1) **daily narrative** of the trip, (2) **species accounts** —
  *only for species we wrote details/notes about*, (3) a **checklist of all species
  detected** that day.
- **Compact the day checklist** so a day fits in fewer pages.
- **Printable daily** (browser → PDF; no new libs) — recommend printing each day.
**Accept:** the page renders Observer/Year/Location+Date header, narrative → not: species
accounts → full checklist; prints cleanly per day.

### J2 `[journal] field-note entry reachable from the journal + species pages (two-way)`
Problem: on the journal page there's **no access to field-note input** — it's only on
the species page. Grinnell keeps *species accounts* for a few focal species but the
*checklist* for all.
- Make a species note **enterable/editable in both places** and kept in sync (one copy
  of the data, two edit surfaces).
- On the **day's checklist, clicking a species opens its tray** to add/edit details,
  then pop back — a live "add details" affordance on each day's species row. (Clicking
  the species row is the preferred trigger.)
- **Only species that have a note get promoted** into the day's species-accounts
  section (don't render every species as an account — we'll run out of room).
**Accept:** entering a note on the species tray shows it in the journal's species
accounts and vice-versa; editing either updates the single stored note; only noted
species appear as accounts.

### J3 `[journal] auto-expanding note box`
The journal / note textarea should **grow to fit its content** (auto-height), not a
fixed small box.
**Accept:** typing a long entry expands the field to show all of it.

### J4 `[journal] link user-made eBird lists on the journal page`
New function: let the user **attach/link the eBird checklists they create** for a day
(paste the eBird checklist URL). Show the eBird link **at the top of that day's journal
page** as part of the header. (Offline-safe: store the URL string; it opens when online.)
**Accept:** a day can hold one or more eBird checklist URLs, shown at the page top and
in the export.

### J5 `[data] JSON import/export + add species not in the offline DB`
- **JSON export** already exists and is liked; **JSON import** works too — keep both,
  make the round-trip clean (export → re-import restores notes/checks/journal). Export
  format should be **good for re-importing** (Shannon will share files at trip's end).
- **Add species not in the offline database:**
  - **When online:** allow looking up / adding a species not in the ~offline set (the
    fynbos alone has ~7,000 plant species; we can't ship all).
  - **When offline:** allow **plain-text entry to create a blank species note** (a
    placeholder record) that can be **reconciled/synced later** when back online.
**Accept:** a user can add an off-database species (online lookup or offline plain-text
stub); stubs survive export/import and can be resolved later.

---

## PR-C — TOUR, HIGHLIGHTS, MAP

### T1 `[tour] focal → tour species: build the tour from chosen species`
- Add a way to **mark species as focal** from the full list, and **promote focal →
  tour species** so the tour is populated with the species we choose (e.g., the large
  mammals and where we'll see them).
- Keep the labeling **lightweight — don't clutter the app** (a small star/flag on a row;
  a "focal" tier and a "tour" tier).
- Bonus: **suggest** rare / cool / unique-to-a-spot species as highlight candidates.
**Accept:** a user can flag a species focal, elevate it to tour, and the tour steps
through the chosen species per site without visual clutter.

### T2 `[highlights] better highlight picker with Venn/category abundance selection`
- Better way to **pick highlights**: the standard ones **plus** ones we deem special.
- The current **abundance control can't select "just rare"** or arbitrary
  combinations. Give abundance **Venn-style category multi-select** (pick one or more of
  the abundance classes), like the evidence Venn — so "show only the rare things" works.
**Accept:** abundance can filter to just rare (or any subset of classes); highlight
picker combines standard + user-chosen specials.

### T3 `[tour] speed toggle via arrow keys + icon`
Tour speed should be adjustable: **slower / faster with keyboard ← / →**, with a small
on-screen icon to slow down / speed up.
**Accept:** ←/→ change tour step speed; a small speed icon reflects/controls it.

### T4 `[map] restore selectable map layers with zoom`
We **lost the different map layers** — people are interested in them. Restore the
ability to **switch layers and zoom in** on them. (Keep it offline-safe; if layers need
tiles, gate behind connectivity or bake what's feasible.)
**Accept:** the map exposes layer options again and zoom works on them.

---

## V — VOICE PASS `[content] plain-voice + provenance cleanup sweep`
Apply the **VOICE & CONTENT RULES** above across the whole app in one commit: remove
"buff", strip AI/marketing phrasing, trim the provenance line to "References & sources",
plain "Checked against the IUCN Red List…", add the four base URLs before the footnotes
(GBIF, BOLD, iNaturalist, eBird), and confirm the word "loadbearing" appears nowhere.
**Accept:** grep finds no "buff", no "loadbearing", no "verified in 2026"-style line;
footnotes are preceded by the four base URLs in order.

---

## COMPLETION PROMISE (per PR)
Stop only when: `node --check app.js` passes; `node tests/render-test.js` → **ALL
PASS**; the bucket's **Accept** criteria hold; a `## 1.0.N` CHANGELOG entry is added;
and a **PR is opened for review** (not merged to main).

## OPEN QUESTIONS FOR SHANNON (flag in the PR, don't block)
1. "eBird lists we make" — confirm it's **pasting the eBird checklist URL** (offline-safe),
   not a live API pull.
[]eBird checklists or []eBird trip reports (global import or daily)
   
2. Focal vs tour tiers — is **focal** a personal shortlist and **tour** the shared
   itinerary highlights? Confirm the two-tier model.

[ ]focal is what I am interested; tour is the promoted highlights to share and talk about … both can be sorted to the top of the species lists so we can keep those in mind (make them sticky with a hide option)
   
3. Off-database species when online — acceptable to hit **GBIF/iNat live lookup**, or
   plain-text stub only for now?
[ ]do it, make it live lookup able … any source
   
4. Map layers — which layers specifically (terrain, satellite, rainfall)? Some may need
   online tiles and break the offline promise; confirm the trade-off.

Terrain and satellite in addition to basic

And this focal / tour taxon is literally the value add from Shannon, she’ll populate that as she prepares for the trip and it will be on her phone (b/c she can import the json from her computer export) in the field!

1-more thing, try renders on web browser, iPad browser and iPhone 16 pro (not the max) simulations if you can.