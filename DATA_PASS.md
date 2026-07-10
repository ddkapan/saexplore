# DATA_PASS.md — enrichment spec for the SA Species Explorer data

**Audience:** an agent/process with full network access (Claude Code, a script, etc.)
running on the repo. Your job is to **enrich `data.js` in place** — add missing
evidence and photos to existing organism rows — **without changing the schema or
rebuilding from scratch.** The app (`app.js`) reads this exact shape; break it and
the app breaks.

Run everything on a feature branch and PR into `main` (main is protected). Bump the
footer version in `app.js` and re-run `node tests/render-test.js` when done.

---

## 0. Golden rules

1. **Enrich, don't rebuild.** Load the existing `window.UNIC` / `window.SMETA` /
   `window.SITES` / `window.MAPIMG` / `window.BB`, mutate rows, write back in the
   **same 5-line format** (see §5). Never regenerate the taxonomy/backbone from zero.
2. **Match organisms by GBIF Backbone / scientific name**, never by common name
   (common names disagree across sources — that's why birds broke before).
3. **Museum layer = GBIF `PRESERVED_SPECIMEN` only**, inside the **tight per-site
   boxes** below. Exclude human-observation / community-science from the museum layer.
   Community observations belong to the iNaturalist (`i`) layer.
4. **Don't invent data.** If a source returns nothing for an organism at a site,
   leave that slot empty. No placeholders.
5. Keep boxes tight (they're deliberately small to represent each locality, not the
   whole province).

---

## 1. The data file: `data.js`

Five globals, one per line:

```
window.UNIC=[ ...2780 organism objects... ];
window.SMETA={ gbifYears:[1838,2026], sites:[ ...10 site objects with accounts... ] };
window.SITES=[ ...10 site objects (what the UI reads for accounts) ... ];
window.MAPIMG={ cape:{...}, low:{...}, sa:{...} };   // baked map tiles — DO NOT TOUCH
window.BB={ ...GBIF backbone match cache... };
```

### 1a. Organism object (`window.UNIC[i]`)

```js
{
  k:  "k2498252",              // stable id
  c:  "Egyptian Goose",         // common name
  s:  "Alopochen aegyptiaca",   // scientific name (THE match key)
  g:  "Aves",                   // GROUP = class-based bucket (see §1c)
  cl: "Aves",                   // GBIF class
  o:  "Anseriformes",           // order
  f:  "Anatidae",               // family
  p:  ["<squareUrl>","<licenseCode>","<attribution>"] | 0,   // photo, or 0 if none
  src:"e",                      // evidence letters present: any of e,i,m,g
  ii: 72486,                    // iNaturalist TAXON id (for links + photo)
  st: { "<siteKey>": { e:[...], i:[...], m:[...] }, ... }     // per-site evidence
}
```

- `src` is a string containing the union of evidence letters across sites:
  `e`=eBird, `i`=iNaturalist, `m`=museum voucher, `g`=genomic. **Recompute `src`
  after enrichment** = the set of letters that appear in any `st[site]`.
- `g` (group) is derived from `cl` (class). Mapping in §1c. If a fish comes back
  with blank class, set `cl` to the real class and map `g` accordingly (this is how
  the 57 fish and the 3 mis-filed birds were fixed).

### 1b. Per-site evidence entries (`st[siteKey]`)

```
e (eBird)     : [pk, tr, months[], monthly[12], nHot, [hotspotNames], nh, "ebirdCode", iiTaxon]
i (iNaturalist): [nObs, months[], nHot?, iNatObsOrTaxonId]
m (museum)    : [nSpecimens, nGenomic, [["INST", count], ...], [minYear,maxYear], [yrLo,yrHi], calAcademyFlag]
```

Examples currently in the file:
```
e: [1,0.8,[0,1,2,3,4,5,6,7,8,9,10,11],[0.74,0.69,...,0.73],5,["Kirstenbosch Botanical Garden", ...],8,"egygoo",72486]
i: [290,[0,1,2,3,4,5,6,7,8,9,10,11],5,560519]
m: [2,0,[["PEM",2]],[2018,2019],[2018,2019],0]
```
- months arrays are 0–11 (Jan=0). Presence, not abundance.
- For a NEW `i` entry: `[nObs, monthsPresentArray, 0, iNatTaxonId]` is sufficient.
- For a NEW `m` entry: `[nSpecimens, nGenomic, institutionCounts, [minYr,maxYr], [minYr,maxYr], calAcademy?1:0]`.

### 1c. Group mapping (`cl` → `g`)

`Aves→Aves`, `Mammalia→Mammalia`, `Reptilia→Reptilia`, `Amphibia→Amphibia`,
`Actinopterygii→Actinopterygii` (Fish), `Insecta→Insecta`, `Arachnida→Arachnida`,
`Mollusca→Mollusca`, `Plantae→…Plantae` (all plant classes: Magnoliopsida, Liliopsida,
Pinopsida, Polypodiopsida, Bryopsida, etc. → `Plantae`); everything else → `Other`.
(Fish orders like Perciformes/Cypriniformes with blank class → set `cl="Actinopterygii"`, `g="Actinopterygii"`.)

---

## 2. Site reference (place-ids & tight boxes)

`window.SITES[i]` keys and how to query each. Boxes are `[swLat, swLng, neLat, neLng]`.

| key | region | iNat place_id | GBIF/iNat bbox [swLat,swLng,neLat,neLng] |
|---|---|---|---|
| kirstenbosch   | Cape Town | 129550 | — (use place_id) |
| tablemtn       | Cape Town | 71668  | — |
| capepoint      | Cape Town | 160199 | — |
| boulders       | Cape Town | —      | [-34.21, 18.44, -34.19, 18.47] |
| houtbay        | Cape Town | —      | [-34.07, 18.31, -34.03, 18.37] |
| moholoholo     | Lowveld   | —      | [-24.62, 30.80, -24.45, 30.95] |
| blyde          | Lowveld   | 188926 | — |
| karongwe       | Lowveld   | —      | [-24.27, 30.52, -24.10, 30.70] |
| kruger_letaba  | Lowveld   | —      | [-23.99, 31.10, -23.80, 31.62] |
| kruger_mdluli  | Lowveld   | —      | [-25.25, 31.10, -25.05, 31.35] |

Where a `place_id` exists, prefer it; otherwise use the bbox
(`nelat/nelng/swlat/swlng` params).

---

## 3. What to gather (priority order)

### Pass A — Birds ↔ iNaturalist + museum/genomic  (task #29, highest value)
All 585 birds currently have **eBird only** (`birds w/iNat = 0`). For each site,
attach the iNaturalist and museum evidence that exists:

- **iNat for birds:** for each site, `GET https://api.inaturalist.org/v1/observations`
  with `taxon_id=3` (Aves), `place_id=<pid>` **or** `nelat/nelng/swlat/swlng=<box>`,
  `quality_grade=research`, `per_page=200`, paginating. Group by `taxon.name`
  (scientific). For each observed species that matches a bird in `UNIC` (by `s`),
  add/merge an `i` entry to that bird's `st[site]` = `[nObs, monthsPresent, 0, taxonId]`,
  and set the bird's top-level `ii` if missing. Add `i` to `src`.
- **Museum for birds:** `GET https://api.gbif.org/v1/occurrence/search` with
  `basisOfRecord=PRESERVED_SPECIMEN`, `taxonKey=<Aves classKey 212>`, the site box
  (`decimalLatitude`/`decimalLongitude` via `geometry` WKT or the lat/lng range),
  `year=1838,2026`. Group by species; for matches, add an `m` entry
  `[nSpecimens, 0, institutionCounts, [minYr,maxYr], [minYr,maxYr], calAcademy?]`.
  `calAcademy` = 1 if any `institutionCode`/`collectionCode` is CAS / California
  Academy of Sciences.

Apply the same iNat+museum logic **uniformly to every group** (mammals, herps,
insects, plants, fish) so evidence is consistent — many non-bird rows are missing
one or two layers too.

### Pass B — Fill missing photos  (task #26; 1448 rows have `p:0`)
For each organism with `p:0`, in order:
1. **iNaturalist taxon default photo:** `GET https://api.inaturalist.org/v1/taxa?q=<sciName>`
   (or `/taxa/<ii>` if `ii` set) → `default_photo` → use `square_url`, `license_code`,
   `attribution`. Set `p=[squareUrl, licenseCode, attribution]`. Only CC/PD/CC0 —
   skip `all rights reserved`.
2. **Wikimedia Commons** fallback (the user's example — *African woolly-necked stork*,
   `Ciconia microscelis`): `GET https://en.wikipedia.org/api/rest_v1/page/summary/<Title>`
   resolved from the sci name → `thumbnail.source`; get license via the Commons
   `imageinfo` API (`action=query&prop=imageinfo&iiprop=extmetadata`, `origin=*`).
   Store `[thumbUrl, licenseShortName, artist]`. Only open licenses.
3. **eBird / Macaulay Library** (optional, birds only): media are copyright by default,
   but a subset carry a Creative-Commons license (contributor opt-in), so only assets
   whose license is CC BY / BY-SA / CC0 are usable — check per photo. Low yield and
   extra work; **skip unless a bird still lacks a photo after 1–2**, because Pass A
   gives each bird an iNat taxon id → a CC default photo for most.
4. If none yields an open image, leave `p:0` (specimen-only species legitimately
   have no CC photo).

### Pass C (optional) — "Seen lately" dates  (task #38)
To power a real recency filter, capture the most-recent observation date per
organism: from the iNat calls above, keep `max(observed_on)`; from eBird recent
obs (`/data/obs/<region>/recent`, needs the API token `ri2o7d9aoj9`) keep the last
date. Store as a new top-level field `ld:"YYYY-MM-DD"` (the app can add the filter
later; adding the field now is harmless).

---

## 4. APIs (all CORS-open / key-free except eBird)

- iNaturalist: `https://api.inaturalist.org/v1/` — observations, taxa. No key. Be
  polite: ~1 req/sec, `per_page=200`.
- GBIF: `https://api.gbif.org/v1/occurrence/search` and `/species/match`. No key.
- Wikipedia/Commons: `https://en.wikipedia.org/api/rest_v1/` + `w/api.php` imageinfo.
- eBird (only for Pass C): header `X-eBirdApiToken: ri2o7d9aoj9`.

---

## 5. Writing back (preserve format exactly)

```js
const fs=require('fs'); global.window={};
eval(fs.readFileSync('data.js','utf8'));
const W=global.window;
// ... mutate W.UNIC rows: add st[site].i / .m, set p, recompute src, fix cl/g ...
fs.writeFileSync('data.js',
  "window.UNIC="+JSON.stringify(W.UNIC)+";\n"+
  "window.SMETA="+JSON.stringify(W.SMETA)+";\n"+
  "window.SITES="+JSON.stringify(W.SITES)+";\n"+
  "window.MAPIMG="+JSON.stringify(W.MAPIMG)+";\n"+
  "window.BB="+JSON.stringify(W.BB)+";");
```

After each row's evidence changes, **recompute `src`**:
```js
o.src = ['e','i','m','g'].filter(L => Object.values(o.st).some(s => s[L])).join('');
```

---

## 6. Verify before PR

```bash
node --check data.js
npm i jsdom   # once
node tests/render-test.js         # must print ALL PASS (15 checks)
node -e 'global.window={};eval(require("fs").readFileSync("data.js","utf8"));const U=window.UNIC;
  console.log("birds w/iNat:",U.filter(o=>o.g==="Aves"&&o.src.includes("i")).length,"(was 0)");
  console.log("no-photo:",U.filter(o=>!o.p).length,"(was 1448)");
  console.log("non-bird eBird:",U.filter(o=>o.g!=="Aves"&&o.src.includes("e")).length,"(must stay 0)");'
```

Then bump the footer version in `app.js` (`v1.0.N` + date), commit `data.js`
(+ `app.js` if you touched it) on a branch, and PR into `main`.

---

## 7. Completion promise (definition of done)

**Do not consider this task finished until every check below passes.** Run this
script; stop only when it prints `DONE ✅`, *or* when you have written the actual
numbers you achieved into the PR description and flagged what could not be met.
**Never merge to `main`** (it is protected) — open a PR and stop.

```bash
node --check data.js || { echo "FAIL: data.js is not valid JS"; exit 1; }
npm ls jsdom >/dev/null 2>&1 || npm i jsdom
node tests/render-test.js | grep -q "ALL PASS" || { echo "FAIL: render tests"; exit 1; }
node -e '
global.window={};eval(require("fs").readFileSync("data.js","utf8"));const U=window.window?window.window.UNIC:window.UNIC;
const birdsI=U.filter(o=>o.g==="Aves"&&(o.src||"").includes("i")).length;
const noPhoto=U.filter(o=>!o.p).length;
const badE=U.filter(o=>o.g!=="Aves"&&(o.src||"").includes("e")).length;
let ok=true;function chk(n,c){console.log((c?"  ok   ":"  FAIL ")+n);if(!c)ok=false;}
chk("birds with iNaturalist evidence >= 300 (was 0):  "+birdsI, birdsI>=300);
chk("organisms with no photo < 500 (was 1448):        "+noPhoto, noPhoto<500);
chk("non-bird eBird records == 0 (regression guard):  "+badE, badE===0);
process.exit(ok?0:1);
' && echo "DONE ✅ — now commit on a branch and open the PR" || echo "NOT DONE — keep going"
```

In words, the goal is met when:
1. `node --check data.js` passes.
2. `node tests/render-test.js` prints **ALL PASS** (15/15) — the app still renders.
3. **Birds carry iNaturalist evidence** — `Aves` rows with `i` in `src` ≥ 300 (was 0); museum/genomic attached wherever GBIF returns specimens in the site boxes.
4. **Missing photos filled** — `p:0` count drops below 500 (from 1,448), using only CC / CC0 / public-domain images (iNat default photo, Wikimedia fallback).
5. **No regressions** — non-bird organisms with an eBird source stay at 0.
6. A **feature branch is pushed and a PR opened against `main`**, and a `## 1.0.N` block is prepended to `CHANGELOG.md`.

If a threshold is genuinely unreachable (a source is down, few CC photos exist),
that is acceptable — record the real numbers in the PR body and leave it for human
review rather than forcing or fabricating data.

---

## 8. Don'ts
- Don't touch `window.MAPIMG` (baked offline tiles) or `window.SMETA.sites[].a`
  (the Grinnell accounts — already authored and recovered).
- Don't widen the site boxes.
- Don't add museum records from human observation.
- Don't lowercase/normalize `s` (scientific names are the match key and must stay canonical).
- Don't reorder or drop existing `UNIC` rows; only enrich them (you may add new rows
  only if a species is genuinely new to a site and you want it represented — keep the
  same schema and set a fresh `k`).
