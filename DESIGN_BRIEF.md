# DESIGN_BRIEF.md — Southern Africa Species Explorer (design pass)

**For:** a design-trained agent. **Deliverable:** a visual + interaction reference
(prototype, frames, or screens — any format). The engineering team will **consult
this for look/flow/feel and reimplement natively** — so don't worry about our code,
frameworks, offline constraints, or exact markup. Design freely; we port the intent,
not the code.

**Audience of the app:** the **trip leader** (an expert naturalist — Dr. Shannon
Bennett, Cal Academy South Africa trip, 20 Jul–1 Aug 2026). It's a power tool; a
degree of density/complexity is fine and expected. Participants are welcome to use
it, but design for the expert, not the lowest common denominator.

**What the app is:** an offline field guide + field notebook. One organism per row,
merged from museum vouchers · genomic samples · iNaturalist · eBird, across ten
localities from the Cape winter to the Kruger dry season.

---

## 1. The core idea: a narrative funnel that becomes a tool
The top of the app should **flow from the trip down to the organisms and their
details** — macro to micro — and then let a fluent user work fast. Two modes:

- **Orienting (novice / first runs):** you read *down* the funnel and learn the logic.
- **Fluent (expert):** the funnel is collapsed; you work at the list with filters at hand.

The same gesture moves between them: **as sections collapse (▸), the list rises and
the compact controls become the whole interface.** You "graduate by collapsing."

## 2. The funnel (top → bottom), each a ▸/▾ disclosure section
1. **South Africa** — the frame (why here).
2. **The two regions** — Cape (winter-rain fynbos) vs Lowveld (summer-rain savanna). The organizing axis of the whole trip; also the top filter.
3. **The trip** — the itinerary: ordered stops, dates, the tour animation, highlights.
4. **The sites** — the ten localities, each with a Grinnell-style account.
5. **The groups** — taxa (birds, mammals, …): the first, most visual cut on the organisms.
6. **Filters & evidence** — how you narrow (abundance, season, seen-lately, specimen year) and why you can trust it (museum/genomic/iNat/eBird).
7. **The results** — a dynamic checklist with detail drawers and a place to take notes.
8. **Export** — a saveable Grinnell field-journal page.

Sections 1–4 are a **WHERE** funnel; 5–7 a **WHAT** funnel; they hinge on **region**.
The **map is the shared canvas for 2–4** (regions, tour, sites all draw on one map).

## 3. One consistent disclosure idiom
Every collapsible uses the **same triangle affordance** (▸ collapsed, ▾ expanded) —
no mix of buttons, links, and panels. Opening one section may gently collapse its
siblings (accordion) so there's always a single focus.

## 4. "Filters at hand" — the fluent surface
A compact strip pinned **just above the list** carrying only the high-frequency
filters: **taxa/groups · search · site-focus · the late-July/season toggle.**
Lower-frequency controls (abundance, specimen-year) stay up in the funnel.

The strip and the funnel controls are the **same state on two surfaces** — change one,
both move. The checklist matrix itself is part of the fluent interface:
**columns = sites, rows = organisms.** Sites appear in three linked places —
**chips** (dimmed = unselected, one click to switch or restore), **map markers**, and
**column headers** — all behaving identically.

The loop to optimize for: *spot → tap a group → list narrows → open the row → read →
note → back.* Make that feel effortless.

## 5. The Grinnell field-journal export (design the page)
A saveable page a leader can print/hand out, in the spirit of the buff Grinnell
field journal. Per day it reads: **journal narrative (top) → species accounts with the
leader's own notes (middle) → the day's checklist (bottom).** Make this page beautiful
and legible on paper — this is a keepsake, not a CSV.

## 6. States to mock (the ask)
1. Funnel **expanded** (orienting) — the story reading top to bottom, map in play.
2. Funnel **collapsed** — list + the at-hand filter strip as the whole UI (fluent mode).
3. A **focused site** — one column, dimmed site chips, map zoomed.
4. A checklist **row + detail drawer open with a note field** being typed into.
5. The **Grinnell export page**.

## 7. Palette & type (so mocks feel on-brand)
"Tufte + safari," serif-forward, warm paper.
- paper `#f4efe4` · raised `#fbf7ee` · ink `#2b2723` · soft `#6b6459` · rule `#cfc5b2`
- acacia (primary/green) `#5e7249` · terra (accent) `#b5623c`
- evidence: museum `#9c7a2f` · genomic `#7a5aa6` · (iNat/eBird use greens/teals)
- site chips tinted by winter rainfall (dry sand `rgb(176,120,52)` → wet teal `rgb(45,110,126)`)
- season chips by austral climate: Summer `#c0392b` · Autumn `#cf7d3a` · Winter `#3f6fb0` · Spring `#8e6fb0`; late-July trip window `#2f4f86`
- headings serif ("Iowan Old Style"/Palatino/Georgia); controls/labels system-ui sans.

## Out of scope for this pass
Data, persistence, wiring, exact markup, offline mechanics — all handled in the
separate build spec. Focus on **layout, hierarchy, the disclosure feel, the two modes,
and the journal page.**
