# tools/reconcile — GBIF name reconciliation (name-backbone pipeline)

Build-time helpers behind `docs/NAME_BACKBONE.md`. **Dev tooling — not shipped in the
PWA** (the app only loads `index.html` · `data.js` · `app.js` · `sw.js`).

## What's here

| file | what |
|---|---|
| `match.js` | resolve a list of field names → corpus records (by scientific/common), report hits/misses. Used to build `samples/saexplore-favorites.json`. |
| `build.js` | assemble the favorites preload (`marks` keyed by corpus key). |
| `build_aliases.js` | from the GBIF species cache, build `idmap` (every corpus key → GBIF **accepted** key) + `idmeta` (per-accepted metadata). |
| `build_names.js` | from the vernacular + synonym caches (`vcache/`, `scache/`), build the shipped **`../../names.js`** sidecar (`window.NAMES`): per corpus key `s[]` synonyms, `v[]` English vernaculars, `l{}` SA local-language names — plus `sp`/`spii` from `genus_fix.json`. Union, never exclude. |
| `genus_fix.json` | resolution crosswalk for records matched to a GBIF **genus** key (o.s a bare genus) or whose iNat id (`o.ii`) is a genus / wrong species. `sp` = species name the app prefers for display + links; `spii` = correct species iNat id for the account. A DATA_PASS should bake these into `data.js` at source. |
| `pull_ebird.js` | fetch the eBird/Clements taxonomy (one call, needs `EBIRD_API_TOKEN`) and reduce to our codes → `ebird_taxonomy.json`. Birds are canonicalised on eBird so exports join eBird data. |
| `ebird_codes.json` | corpus key → eBird species code (the join key; extracted from the corpus site data). |
| `ebird_taxonomy.json` | eBird code → `{com, sci, family, order}` for our 585 codes. Taxonomy © Cornell Lab / eBird. |
| `idmap.json` | `{idmap: {corpusKey → acceptedKey}, acceptedList: [...]}` — 2,775 corpus keys → 2,771 accepted. The identity spine. |
| `idmeta.json` | per-accepted-key: `{acc, gbif canonical, rank, kingdom, class, field name, ourKeys[]}`. |

## Key finding (why union-by-name, not dedup-by-key)

GBIF *occurrence* keys are frozen against the backbone version they were ingested under;
the current backbone may hold a **different accepted key** for the same taxon
(*Bubulcus*↔*Ardea ibis*, *Icthyophaga*↔*Haliaeetus vocifer*, *Dessonornis*≡*Cossypha
caffra*). So key-diff both mis-merges and manufactures false "surprises." The spine is
**union every name, OR-match, keep all aliases** — see `docs/NAME_BACKBONE.md` and the
`union-not-exclusion` project memory.

## Regenerate the GBIF cache (the 11 MB raw pull is git-ignored)

```sh
# 1. corpus usageKeys
node -e 'const fs=require("fs"),vm=require("vm");const c={window:{},console};vm.createContext(c);
  vm.runInContext(fs.readFileSync("../../data.js","utf8"),c);
  fs.writeFileSync("corpus_keys.txt",[...new Set(c.window.UNIC.map(o=>String(o.k).replace(/^k/,"")).filter(k=>/^\d+$/.test(k)))].join("\n"))'
# 2. resolve each to its GBIF species record (parallel, resumable)
mkdir -p gcache
cat corpus_keys.txt | xargs -P 12 -I{} sh -c 'f="gcache/{}.json"; [ -s "$f" ] || curl -s "https://api.gbif.org/v1/species/{}" -o "$f"'
# 3. rebuild idmap / idmeta
node build_aliases.js
```

## Regenerate the name sidecar (`names.js`) — vernaculars + synonyms
The `vcache/` and `scache/` pulls are git-ignored (17 MB + 24 MB). To rebuild:

```sh
node -e '...corpus_keys.txt...'   # step 1 above, if missing
mkdir -p vcache scache
cat corpus_keys.txt | xargs -P 12 -I{} sh -c 'f="vcache/{}.json"; [ -s "$f" ] || curl -s "https://api.gbif.org/v1/species/{}/vernacularNames?limit=100" -o "$f"'
cat corpus_keys.txt | xargs -P 12 -I{} sh -c 'f="scache/{}.json"; [ -s "$f" ] || curl -s "https://api.gbif.org/v1/species/{}/synonyms?limit=100" -o "$f"'
node build_names.js               # → ../../names.js  (shipped, precached by sw.js)
```

`build_names.js` ships English vernaculars (`v`) + the 10 SA official languages (`l`);
other foreign-language vernaculars stay in the cache. To widen the union, edit the `SA`
whitelist in `build_names.js` and rebuild — nothing is lost, only what's *shipped* changes.

### Genus-collapse fix + o.ii audit (`genus_fix.json`)
Two failure modes where a record doesn't end up at a species:

1. **`o.s` is a bare genus** — GBIF matched the species to a genus key. Scan:
   `node -e '…UNIC…'` for single-word `o.s`; resolve each via iNat id / iNat search →
   `sp` (+`spii` where the iNat id was itself a genus). 26 found; 25 resolved, 1 phylum flagged.
2. **`o.s` is fine but `o.ii` is a genus / wrong species** (bad account, photo, links).
   Audit *all* iNat ids in batches of 30:
   ```sh
   node -e '…extract ids → ii_chunks.json, mkdir iicache…'
   node -e '…GET api.inaturalist.org/v1/taxa/{30 ids} per batch → iicache/batchN.json…'
   node -e '…compare rank + species epithet vs o.s; flag genus / mismatch…'
   ```
   Of 2,148 ids: 2 genuine fixes (Thrush Nightingale genus id; *Passerina filiformis*
   pulling *P. corymbosa*) → `spii`; the rest were synonyms or spelling variants.

### Regenerate the eBird layer (birds canonical on eBird)
```sh
node -e '…extract corpus Aves eBird codes → ebird_codes.json…'   # from data.js site data
export EBIRD_API_TOKEN=xxxx     # https://ebird.org/api/keygen
node pull_ebird.js             # → ebird_taxonomy.json (one call, filtered to our codes)
node build_names.js            # folds ebk + eBird-canonical sci into ../../names.js
```
`build_names.js` attaches `ebk` (the join key) to every bird and makes the eBird
scientific name canonical (old form → synonym). Common names already track eBird.

### Regenerate the DNA-barcode layer (`bold.js`)
```sh
node pull_bold.js       # → boldcache/<key>.json, one GBIF call per species (resumable)
node build_bold.js      # → ../../bold.js   { corpusKey: [records, fromSA, topInstitution?] }
```
Source is **BOLD's specimens as published to GBIF by iBOL** (dataset `040c5662…`), *not*
BOLD's own API — BOLD v4 quotas at ~300 calls and its record endpoints are offline. Full
reasoning in the header of `pull_bold.js`; read it before "improving" this.

⚠️ **Two traps this script exists to avoid.** (1) A failed fetch must NEVER be cached — BOLD
answers a quota breach with a *plain-text* sentence, and an earlier version stored 259 species
as "0 barcodes". Failures here are simply not written, so re-running retries them. (2) 28 corpus
keys are GBIF **genus** keys (see `genus_fix.json`); passing one as `taxonKey` counts the whole
genus, so they're resolved to species keys first.

### Backfill species photos (`data.js` `o.p`)
```sh
node pull_photos.js     # → photocache/<key>.json  (GBIF media → Wikimedia → PhyloPic silhouette)
node apply_photos.js    # folds them into ../../data.js  (never overwrites an existing photo)
node gen_precache.js    # → ../../precache-list.js   ← ALWAYS run after ANY photo change
```
Chain: **GBIF occurrence media** (richest — iNat observation photos the taxon-default-photo pass
missed) → **Wikimedia Commons** → **PhyloPic** CC0 silhouette so nothing is ever blank offline.
Silhouettes set `o.sil=1` and the app labels them as drawings, never as photos.

⚠️ **Three traps.** (1) **Species-exact only** — a genus/kingdom taxonKey returns photos of the
WRONG ANIMAL; the same `rankcache.json` guard as `pull_bold.js` applies. (2) **CORS-only hosts** —
the offline precache fetches with `cors`, so an image from a host without `Access-Control-Allow-
Origin` caches as a *blank*; only whitelisted hosts are accepted. (3) **Commons free-text search
returns other species** — a hit is accepted only if the filename carries a name we know for this
species (accepted / resolved / GBIF-confirmed synonym). A wrong photo is worse than no photo.

### Rebuild the shipped lists (`lists.js`) — curation as data
```sh
node build_lists.js     # → ../../lists.js   { id: {n,g,c,site,it:[corpusKey]} }
```
The per-site "specials" (Big Five, penguins, endemics) used to be a hardcoded object in `app.js`,
matched to the corpus by **common-name string at boot**. They are now **shipped lists**: the
curated names live in `build_lists.js` (edit there), and are resolved to corpus **keys at build
time** through the union name index — so synonyms resolve, and a name that matches nothing is
**reported**, not silently dropped.

The build also refuses to put a species on a site list if the corpus has **no record of it at
that site** (currently 2: Cape Grysbok @ Kirstenbosch, Blue Wildebeest @ Blyde) — a curated
species that isn't recorded there would be a lie on the site page.

Shipped lists are **defaults, not law**: they seed into the user's list store on first run, after
which they're editable, renameable, deletable and shareable like any other list. A list the user
deletes is **tombstoned** so a later build doesn't silently re-seed it.

## Next (per NAME_BACKBONE.md)
Add **eBird + BOLD + book** name columns (`v`/`s` already carry GBIF's), pull the
per-sub-region **envelope candidate pool** (2σ ellipse → GBIF/iNat facet, all taxa), and
add `origin` (GRIIS-SA / iNat establishment). These extend the same `names.js` sidecar.
