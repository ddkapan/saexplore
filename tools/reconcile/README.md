# tools/reconcile — GBIF name reconciliation (name-backbone pipeline)

Build-time helpers behind `docs/NAME_BACKBONE.md`. **Dev tooling — not shipped in the
PWA** (the app only loads `index.html` · `data.js` · `app.js` · `sw.js`).

## What's here

| file | what |
|---|---|
| `match.js` | resolve a list of field names → corpus records (by scientific/common), report hits/misses. Used to build `samples/saexplore-favorites.json`. |
| `build.js` | assemble the favorites preload (`marks` keyed by corpus key). |
| `build_aliases.js` | from the GBIF species cache, build `idmap` (every corpus key → GBIF **accepted** key) + `idmeta` (per-accepted metadata). |
| `build_names.js` | from the vernacular + synonym caches (`vcache/`, `scache/`), build the shipped **`../../names.js`** sidecar (`window.NAMES`): per corpus key `s[]` synonyms, `v[]` English vernaculars, `l{}` SA local-language names. Union, never exclude. |
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

## Next (per NAME_BACKBONE.md)
Add **eBird + BOLD + book** name columns (`v`/`s` already carry GBIF's), pull the
per-sub-region **envelope candidate pool** (2σ ellipse → GBIF/iNat facet, all taxa), and
add `origin` (GRIIS-SA / iNat establishment). These extend the same `names.js` sidecar.
