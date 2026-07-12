# The Name Backbone — a union index for a global field companion

> Prototyped on the Southern Africa two-biome trip; **designed as a global model.**
> Core rule, from Durrell: **Union, never exclude. Narrowness is a filter, not a
> database wall.** Everything stays in the data; views narrow what you see.

## Why

Field naturalists carry several books that disagree on names (Roberts vs Sinclair
vs eBird vs iNaturalist vs the local/indigenous name). Data sources (GBIF, iNat,
eBird, BOLD) disagree too, and taxonomic backbones drift across versions
(*Bubulcus*↔*Ardea ibis*, *Dessonornis*≡*Cossypha caffra*, *Icthyophaga*↔*Haliaeetus
vocifer*). Trying to **reconcile-then-collapse** those into one "correct" name is an
open problem and — worse — it *throws away* the exact names a user might look up.

So we don't reconcile to exclude. We **union and keep every name**, matched by OR.

## The record (one node)

| field | meaning |
|---|---|
| `key` | authoritative id/name — GBIF accepted usageKey + canonical, **preferred**. If none can be chosen confidently, the key may hold **two** names. Two names beat none. |
| `names[]` | every name we've ever seen for this taxon, each tagged with **source**: `{name, source, rank, srcKey?}` — e.g. `gbif`, `inat`, `ebird`, `bold`, `book:roberts`, `book:sinclair`, `local:isiZulu`. Sits **to the right** of the key. |
| `accepted` | GBIF accepted usageKey when known (best-effort; may be absent). |
| `altKeys[]` | synonym / source / prior-version keys — provenance, not identity. |
| `origin` | `native \| endemic \| introduced \| invasive \| unknown` — a **filter facet**, never an exclusion (from GRIIS-SA / iNat establishment_means). |
| `plausibility` | per-region occurrence score from the geographic envelope (drives foreground vs background ranking). `spuh`/higher-taxon allowed, tagged by `rank`. |
| `seeAlso[]` | cross-links to nodes that **might be the same** (concept conflicts). Surfaced, never merged. These are the "self-directed links in the graph." |
| `tier` | `foreground` (curated corpus) \| `background` (possible-here envelope). A **view flag** — both live in the same union. |

### Matching & merge — non-destructive
- **OR-match:** a query hits a node if it matches the key **or any** `names[]` entry.
- **Merge only when confident** (same GBIF accepted key **or** shared vernacular): fold
  the incoming source's name into the node's `names[]`. 
- **When unsure, keep both nodes** and add a `seeAlso` edge. Never mutate away a name;
  never drop a row. (HIERARCHICAL_SYNTHETIC_KEYS: don't treat a versioned key as
  identity; surface conflicts, don't silently resolve them.)

## Views are filters over the one union

Nothing below removes data — each only narrows the *view*:

- **`possible here` toggle** (left of `rare` on the abundance row, **default off**):
  off = the curated foreground; on = the whole regional envelope joins the list.
- **Search failover:** a query always OR-matches the full union; if the only hits are
  `background`, they show flagged "possible · not on our list."
- **`origin` category** (native / introduced / invasive) — new filter facet **and** a
  failover category; introduced species are **kept and labelled**, never dropped.
- **"Top surprises / keep an eye out" is a FILTER, not a baked list** — it is simply
  `background` **sorted by `plausibility` (× notability)**, computed live over the
  union. Nothing is hand-curated or frozen; change the region or the threshold and the
  set recomputes. No shortlist artifact ships.
- **taxa · abundance (Venn) · region · season · evidence** — existing filters.
- **focal / tour** — user marks; pin to top.
- **name-expander** — per species, shows every `names[]` entry with its source, so the
  user can match whichever book/app they're holding.

## Pipeline (all additive)

```
union  =  shipped corpus (2,780, foreground)
        ∪ regional envelope candidates  (GBIF/iNat facet over per-sub-region 2σ ellipse; ALL taxa)
        ∪ book / checklist crosswalks   (name columns; e.g. Roberts, Sinclair)
        ∪ user + got-connection adds     (online match → compact record → import)
best-effort alias merge (confident only) → else seeAlso
origin ← GRIIS-SA / iNat establishment
plausibility ← per-region envelope occurrence, percentile-normalised
```

Every input is a **union**, every narrowing is a **filter**, every name is **kept**.

## Export / import (global-ready)

The compact record carries the **whole node** (key + all `names[]` + `altKeys` +
`origin` + provenance), so any user's additions, any book's crosswalk, or any other
region unions into the same backbone. Marks (focal/tour) key by the node id and ride
the same JSON. The SA trip is one instance; the format is the global contract.
