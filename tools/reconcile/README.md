# tools/reconcile — GBIF name reconciliation (name-backbone pipeline)

Build-time helpers behind `docs/NAME_BACKBONE.md`. **Dev tooling — not shipped in the
PWA** (the app only loads `index.html` · `data.js` · `app.js` · `sw.js`).

## What's here

| file | what |
|---|---|
| `match.js` | resolve a list of field names → corpus records (by scientific/common), report hits/misses. Used to build `samples/saexplore-favorites.json`. |
| `build.js` | assemble the favorites preload (`marks` keyed by corpus key). |
| `build_aliases.js` | from the GBIF species cache, build `idmap` (every corpus key → GBIF **accepted** key) + `idmeta` (per-accepted metadata). |
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

## Next (per NAME_BACKBONE.md)
Enrich each accepted node with **iNat + eBird + book** names (`nm[]`), pull the
per-sub-region **envelope candidate pool** (2σ ellipse → GBIF/iNat facet, all taxa), and
add `origin` (GRIIS-SA / iNat establishment). These feed the app's union sidecar.
