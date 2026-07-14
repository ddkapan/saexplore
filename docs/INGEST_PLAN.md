# Ingest plan — the iNat project & the eBird trip list feed the journal

**Status:** DRAFT for review (Durrell, 2026-07-14). **Not built.** Post-freeze, on a dev fork.
Written because this touches ingest, the journal schema and storage — so it gets a plan first.

---

## 1. The idea, in one line

**The day is the join.** Shannon's records already exist — in the **iNat project** and in her
**eBird checklists**. The app shouldn't compete with them; it should **pull the day in** and be the
place she *reviews* it: her species, against our photos, evidence, barcodes, accounts and her notes.

> Durrell: *"the iNat project (and the eBird trip list) might be the super way to bring in those
> data into the overall journal, including memo append from eBird, species lists populated from
> eBird and iNat."*

## 2. Why this is now cheap (the joins already exist)

| source | join key | already in the corpus | coverage |
|---|---|---|---|
| iNaturalist | `taxon.id` → `o.ii` / `NAMES[k].spii` | yes | **2,148 / 2,780** species |
| eBird | `speciesCode` → `NAMES[k].ebk` | yes (PR #33) | **584 / 585** birds |
| the day | `journal[YYYY-MM-DD]` | yes | every day |
| the set | **a day-scoped list** (PR-K) | yes | no new store needed |

These are **exact ID joins**, not fuzzy name matching. PR #33 built the eBird key and PR-K built
the container — neither knowing this is what they were for.

⚠️ Only **4 of 10 sites** carry an iNat `place_id`, so scope the day by **project + date**, never
by place.

## 3. The two dead hooks this finally makes real

Both already exist, and both currently do nothing:

- **`inatobs[species]`** — the drawer takes an iNat observation URL, stores it, exports it, and
  (until v1.0.54) **never rendered it back**. "There is a place for it but it didn't do anything."
- **`journal[day].ebird`** — the day page takes eBird checklist URLs, renders them as links, and
  **pulls nothing**.

They were placeholders for exactly this.

## 4. What a "pull the day" produces

For a given journal day, from either source:

1. **A day-scoped list** (PR-K) — `iNat · 21 Jul` / `eBird · 21 Jul`. Reviewable in the app with our
   photos, evidence glyphs, barcode data and accounts. Toggleable as a filter, exportable, deletable.
2. **Seen ticks** — offered, not forced (see §6).
3. **Memo append** — an eBird checklist has a **checklist comment** and **per-species comments**;
   an iNat observation has a **description**. These append to the day's narrative and to species
   notes, **attributed** (*"from eBird checklist S123…"*).
4. **Her own photos** on the species account — from her iNat observations, in place of the CC stock
   image. This is the payoff: **a Grinnell account with her animal, in her words.**

## 5. Getting the data in — the honest matrix

| route | auth | works offline? | gives |
|---|---|---|---|
| **iNat API** `/v1/observations?project_id=&d1=&d2=` | none | ❌ needs wifi | taxon ids, photos, descriptions, coords |
| **eBird API** `/v2/product/checklist/view/{subId}` | **token** | ❌ needs wifi | speciesCode, counts, checklist + species comments |
| **eBird CSV** ("Download My Data" / trip report export) | none | ✅ **works on a plane** | speciesCode, date, location, comments |
| **paste a URL** (already there) | none | ✅ | nothing yet — the handle we pull on |

**Design consequence:** the pulls are an **evening-at-the-lodge, on-wifi** activity. The rest of the
app stays fully offline. **CSV import is the airplane-safe path and must exist** — it is the only
route that needs neither a token nor a signal.

*(Housekeeping: the eBird API token pasted into an earlier session transcript should be regenerated.)*

## 6. The one non-negotiable rule

**Imported text never overwrites her writing.** It **appends, attributed**, and she can accept or
discard. Her narrative is hers.

This is the same union-not-exclusion principle as the name backbone: *add, never clobber*. It is
also why the import merges as a **union** (PR-K) rather than replacing.

Corollaries:
- Seen ticks from an import are **offered** (a "tick all N" action), not applied silently — an eBird
  checklist can contain birds *someone else* on the trip identified.
- A species in the checklist but **not in the corpus** falls to the existing **off-DB stub** path.
- An import is **idempotent**: pulling the same day twice must not duplicate memos or list members.

## 7. Schema (the only persisted change — hence plan-mode)

```js
journal[day] = {
  narr, extras, ebird,               // unchanged
  memos: [                           // NEW — appended, attributed, never merged into narr
    { src:'ebird'|'inat', ref:'S123…', at:<epoch>, text:'…' }
  ],
  pulled: { ebird:{S123:<epoch>}, inat:{<projectId>:<epoch>} }   // NEW — idempotency guard
}
```
Day lists are ordinary PR-K lists (`site:''`, id `day-inat-2026-07-21`) — **no new store**.
Export goes to **v4**, still emitting v3/v2 fields. Migration is additive (absent `memos` → `[]`).

## 8. Scope boundary — what this is NOT

- **Not an eBird client.** This app was never designed for it. Outbound (app → eBird) stays a maybe;
  eBird submission belongs in eBird.
- **eBird speaks only for birds** — 2,195 of 2,780 organisms are not birds. It can never be the
  corpus's ingest path.
- **iNat is the richer spine** (2,148 species, photos, any taxon) — hence the **project** as the
  leader's journal, with saexplore as the offline reading surface.

## 9. Testing — NOT on Shannon's phone

⚠️ **`localStorage` is scoped per ORIGIN, not per path.** A dev build at
`ddkapan.github.io/saexplore-dev/` would read and write **the same `sa5_*` keys** as her install.
A half-finished migration could silently destroy real field notes.

The dev fork must therefore do **both**:
1. **A different origin** (Netlify/Cloudflare preview, or a separate Pages *user* site), and
2. **Namespaced storage + SW cache** in the dev build (`sa5dev_*`, `sa-shell-dev-vN`).

## 10. Sequence

> **CORRECTION (2026-07-14).** I earlier called creating the iNat project *time-sensitive*. **It is
> not** — provided it is a **collection project**, which is a *saved query*, not a bucket: it
> auto-includes every observation matching its filters (place, date range, members), **including
> past ones**. So it can be created **after the trip** and will sweep the whole thing up.
> (A **traditional** project is the one that needs observations added by hand — don't use that.)
> Durrell will create it on his return. Nothing is lost by waiting.
>
> **Priority also corrected:** **iNaturalist import is primary** (it covers 2,148 species, any
> taxon, and carries her photos). **eBird import is secondary and optional** — she may not even
> use eBird lists.

| when | what |
|---|---|
| **after the field** (Durrell) | Create the iNat **collection project** — filters: place + date range 20 Jul–1 Aug + members. It back-fills automatically. |
| **now** (done, v1.0.54) | Durability (persist + backup nudge) · the iNat link finally renders |
| **by 17 Jul** | Real-device offline rehearsal → **freeze** |
| **20 Jul – 1 Aug** | The trip. She *generates* the data this feature consumes. |
| **during/after, on the fork** | Phase 1: **eBird CSV import** (no token, works anywhere) → day list + memos. Phase 2: **iNat project pull** (open API) → day list + her photos on accounts. Phase 3: seen-tick offer, idempotency, polish. |

**Revised order (Durrell, 2026-07-14): iNaturalist first.** It is the richer spine — 2,148 species,
any taxon, her own photos — and its API is open, needing no token. **eBird is the secondary,
optional half**: it speaks only for birds, and she may not use eBird lists at all. Build the
day-list + memo pipeline against iNat; eBird (CSV first, no token, plane-safe) then reuses it.
