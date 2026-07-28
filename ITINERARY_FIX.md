# ITINERARY_FIX.md — URGENT: make the app match the real itinerary (+ protect saved notes)

**For:** Claude Code (Opus 5). **Priority:** run this **before** the round-2 buckets
(`CC_FEEDBACK_ROUND2.md`). **Why:** the app currently encodes a *fabricated*
one-site-per-day schedule (dates authored inline in `app.js`; `data.js` has no date
field). Dr. Bennett flagged it doesn't follow the actual program. Ground truth is the
trip spreadsheet, transcribed into §1 below.

**Two hard requirements:**
1. **Match the real itinerary** — dates, order, multi-site days, four regions, all
   South-Africa localities.
2. **Never lose Dr. Bennett's saved notes.** She has data in a working copy. Ship an
   **automatic backup → reimport → realign → fix** migration (Part C) *in the same PR*
   as the re-key, so the change can't stomp her notes.

**Rules of engagement (unchanged):** single-file `app.js`, offline PWA, **no new deps**,
string-patch in place, jsdom tests pass, **never push to `main`**, branch → PR → review.

---

## LOCKED DECISIONS (from Durrell)
- **(a)** Drop the international transit (Berlin→Istanbul, Istanbul→Cape Town arrival,
  the JNB/Newark/SFO departure days). **All in-country SA stops are required.** Where a
  day differs but runs out of the **same lodge**, represent it as a distinct day.
- **(b)** **Four regions.** Get **all localities**. Match the itinerary as closely as
  the data allows.
- Change **everything** the itinerary drives — including the **tour** and the **per-stop
  highlights** (they need reshuffling to the corrected day/site mapping).
- **Double-check every dependency** (Part D) and run a **full post-fix audit** (Part E),
  making sure the fix **does not break the good parts** (offline photos, offline load,
  evidence links, the restored genomic flag, her checkmarks, the map).

---

## §1 GROUND TRUTH — the real day-by-day (SA program only, Days 3–11)

| Day | Date | Region | Sites that day |
|---|---|---|---|
| 3 | Wed 22 Jul | Cape Town | Cape Town city tour; **Green Point Urban Park** (optional) |
| 4 | Thu 23 Jul | Cape Town | **Hout Bay Harbour** → **Duiker/Seal Island** cruise → **Chapman's Peak** → **Cape Point / Cape of Good Hope** → **Simon's Town** → **Boulders Beach** |
| 5 | Fri 24 Jul | Cape Town | **Table Mountain** (AM) → **Kirstenbosch** (PM) → **SANCCOB / Table View**; (V&A Waterfront — dinner, marginal) |
| 6 | Sat 25 Jul | Lowveld | Fly to **Hoedspruit** → **Moholoholo Rehab Centre** → **Moholoholo Lodge / Mariepskop foothills** |
| 7 | Sun 26 Jul | Lowveld | **Moholoholo Lodge** (early bush walk) → **Karongwe Reserve** (Shiduli Lodge) |
| 8 | Mon 27 Jul | Kruger | **Kruger NP: Phalaborwa Gate → Letaba** (Elephant Museum). Overnight Shiduli |
| 9 | Tue 28 Jul | Kruger | **Kruger NP central** (Olifants/Satara/Letaba) + local community. Overnight Shiduli |
| 10 | Wed 29 Jul | Escarpment → Kruger | **Blyde River Canyon** → **Bourke's Luck Potholes** → **God's Window** → transfer to **Mdluli concession** (SW Kruger); sunset drive |
| 11 | Thu 30 Jul | Kruger | **Kruger SW full day** (Pretoriuskop / Skukuza) — Mdluli |

Notes: several sites share a day (Day 4 has six). Same-lodge multi-day is normal
(Shiduli = Days 7–9; Mdluli = Days 10–11). Moholoholo appears on Day 6 **and** Day 7 AM.

## §2 THE FOUR REGIONS + LOCALITY TABLE

**Regions** (by program area, not province): **Cape Town** (ZA-WC) · **Lowveld**
(ZA-LP, Limpopo private reserves) · **Kruger** (the park; spans ZA-LP north & ZA-MP SW) ·
**Escarpment** (ZA-MP, Panorama Route). Region presets become
**Cape Town · Lowveld · Kruger · Escarpment · all** (this also fixes bug #54).

**Localities** — **keep the 10 existing site keys unchanged** (so existing checkmarks
survive); **add** the new ones. Resolution hints (search terms / expectation / note)
are from the sheet's spot tab for the Part-B data pass.

| key | new? | region | day(s) / date | resolve hint |
|---|---|---|---|---|
| greenpoint | NEW | Cape Town | 3 / 22 Jul | "Green Point" urban park+wetland; optional |
| houtbay | keep | Cape Town | 4 / 23 Jul | Hout Bay Harbour; exact-or-nearest |
| duikerisland | NEW | Cape Town | 4 / 23 Jul | "Duiker Island\|Seal Island\|Hout Bay pelagic"; nearest-uncertain |
| chapmanspeak | NEW | Cape Town | 4 / 23 Jul | "Chapman's Peak"; scenic, nearest |
| capepoint | keep | Cape Town | 4 / 23 Jul | "Cape of Good Hope\|Cape Point"; exact-multi (TMNP) |
| simonstown | NEW | Cape Town | 4 / 23 Jul | "Simon's Town"; sewage works hotspot nearby |
| boulders | keep | Cape Town | 4 / 23 Jul | Boulders Beach penguin colony; exact |
| tablemtn | keep | Cape Town | 5 / 24 Jul | Table Mountain upper cableway/summit; exact-multi |
| kirstenbosch | keep | Cape Town | 5 / 24 Jul | Kirstenbosch NBG; exact |
| sanccob | NEW | Cape Town | 5 / 24 Jul | "SANCCOB\|Table View\|Rietvlei"; nearest-uncertain |
| (vawaterfront) | NEW? | Cape Town | 5 / 24 Jul | V&A Waterfront; **marginal** — see VERIFY |
| hoedspruit | NEW | Lowveld | 6 / 25 Jul | "Hoedspruit"; town/airport gateway |
| moholoholo | keep | Lowveld | 6 / 25 Jul & 7 AM | "Mariepskop\|Moholoholo"; escarpment foothills, birdy |
| karongwe | keep | Lowveld | 7 / 26 Jul | Karongwe Private GR (Shiduli); nearest |
| kruger_letaba | keep | Kruger | 8 / 27 Jul | "Phalaborwa\|Letaba"; enter 06:00; exact-multi |
| kruger_central | NEW | Kruger | 9 / 28 Jul | "Olifants\|Satara\|Letaba"; multi-uncertain |
| kruger_mdluli | keep | Kruger | 10–11 / 29–30 Jul | "Mdluli\|Numbi\|Pretoriuskop\|Skukuza"; multi-nearest |
| blyde | keep | Escarpment | 10 / 29 Jul | Blyde River Canyon; exact (moves late — was wrongly early) |
| bourkesluck | NEW | Escarpment | 10 / 29 Jul | "Bourke's Luck Potholes"; exact |
| godswindow | NEW | Escarpment | 10 / 29 Jul | "God's Window"; mist-belt forest; exact |

All new spots fall within the existing baked `MAPIMG` extents (Cape + Lowveld), so no new
map image is needed — only new markers/coords.

---

## §2b eBird hotspot resolutions (sleuthed — use these for the Part-B data pass)
Concrete targets for the uncertain spots (verify exact `L#######` on eBird when pulling):

**Cape Town**
- **houtbay** → eBird **"Hout Bay Harbour"** (L5558352) — harbour/quay birds.
- **duikerisland** (the seal cruise) → eBird **"Hout Bay Pelagic — Harbour to Cape Pt."**
  (pelagic hotspot; note: harbour birds are logged separately at Hout Bay Harbour).
- **capepoint** → **Cape of Good Hope Nature Reserve** / Cape Point (TMNP) — exact-multi.
- **boulders** → **Boulders Beach** (African Penguin colony) — exact.
- **simonstown** → light en-route stop; nearest Simon's Town hotspot. (The famous Cape
  waterbird site *Strandfontein Sewage Works* is **not on this itinerary** — do **not**
  add it.)
- **tablemtn** → Table Mountain upper cableway / summit (TMNP). **kirstenbosch** →
  Kirstenbosch NBG.
- **sanccob** → **Table Bay Nature Reserve (Rietvlei, Table View)** — the *Cape Town*
  wetland. ⚠️ Do **not** use eBird's top-ranked "Rietvlei Nature Reserve" — that one is in
  **Gauteng**, a different Rietvlei.
- **greenpoint** → **Green Point Urban Park** (real hotspot; urban park + wetland) — keep
  as an optional/light Cape stop.

**Lowveld / Escarpment**
- **moholoholo** → **Mariepskop** (very birdy escarpment) + Moholoholo foothills.
- **karongwe** / **hoedspruit** → private reserve / town; sparse eBird — use nearest.
- **blyde** → Blyde River Canyon (Motlatse). **bourkesluck** → Bourke's Luck Potholes.
  **godswindow** → God's Window (mist-belt forest). All three are established hotspots.

**Kruger**
- **kruger_letaba** (Day 8) → **Letaba Rest Camp** + Phalaborwa Gate road — exact-multi.
- **kruger_central** (Day 9, from Shiduli) → **Olifants** + **Letaba** area (they re-enter
  via Phalaborwa) — multi-uncertain; Satara is further south, use Olifants/Letaba.
- **kruger_mdluli** (Day 10–11) → **"Kruger NP — Pretoriuskop to Numbi Gate / H1-1"**
  (Napi Road, 250+ spp) + Pretoriuskop Rest Camp; Skukuza via the S1/Doispane road.

**VERIFY answers (resolved):**
1. **V&A Waterfront** = dinner/leisure, not a birding site → **omit** as a locality (or
   mark non-birding). **Green Point Urban Park** is a real hotspot → **keep** (optional).
2. **Mdluli SW Kruger = Pretoriuskop / Numbi Gate (+ Skukuza), NOT Berg-en-Dal.** Mdluli's
   concession sits at Numbi Gate; the Napi Road (H1-1) Pretoriuskop↔Numbi hotspot is the
   match. Berg-en-Dal is far SW — drop it.
3. **Kruger central (Day 9) → Olifants + Letaba** (nearest to the Phalaborwa re-entry).

## §3 THE WORK

### Part A — Itinerary structure (`app.js`)
1. Replace the authored per-site date map with a **day-indexed itinerary** derived from
   §1: `Day → {date, region, siteKeys[]}` (a site may appear on >1 day). Give each site
   its correct **date(s)** and **region**.
2. **Reorder `SITES`** (data.js) into true itinerary order (drives tour + column order):
   greenpoint, houtbay, duikerisland, chapmanspeak, capepoint, simonstown, boulders,
   tablemtn, kirstenbosch, sanccob, (vawaterfront), hoedspruit, moholoholo, karongwe,
   kruger_letaba, kruger_central, kruger_mdluli, blyde, bourkesluck, godswindow.
3. **Four-region model:** update region chips/presets, `mapView` (`cape`/`low`/`sa` →
   `cape`/`lowveld`/`kruger`/`escarp`/`sa`), the region-filter (`SI[k].rk!==S.region`),
   and the account-header region+date strings. Map zoom groups by the 4 regions.
4. **Tour:** step through **days** (3→11), showing that day's site(s) + region + real
   date. Keep the play + prev/next + the new speed toggle (round-2 T3). Order and dates
   must match §1.
5. **Highlights / Focal per stop:** reshuffle so each site's highlights attach to the
   correct site/day; author highlights for the new localities (use §2 hints + the pulled
   data). Don't leave a new site with another site's highlights.
6. **Header lede:** "ten localities" → the real count; keep the Cape-winter→Kruger-dry
   framing.

### Part B — Data expansion (data pass; needs network)
The new localities have **no evidence data** yet. Resolve and enrich them following
`DATA_PASS.md` methodology (eBird token `ri2o7d9aoj9`; iNat + GBIF), using the §2 resolve
hints:
- eBird hotspot(s), iNat `place_id`/bbox, coordinates, museum (GBIF PRESERVED_SPECIMEN)
  box per new site; merge per-organism `st[siteKey]` evidence exactly like the existing
  sites. **Do not alter existing sites' data, photos, or the backbone.**
- If a spot is uncertain (Duiker pelagic, SANCCOB, Kruger central), use the nearest
  hotspot and record it in the site note; don't fabricate.
> If a full network data pass isn't feasible in this run, still ship Part A + C, add the
> new sites as **columns with empty evidence** (they still take checkmarks/notes), and
> open a follow-up for the enrichment. Never block the itinerary correctness on the data.

### Part C — Automatic note-migration subroutine (SHIP WITH PART A)
Because the itinerary/keys/dates change, guard Dr. Bennett's saved data. Keeping the 10
existing site keys stable means most data passes through untouched — but build the safety
net anyway, run automatically on first load of the new version:
1. **Detect:** store a `sa5_schema` version; if the stored version is older (or her data
   predates it), enter migration.
2. **Back up first (non-destructive):** gather **all** app-owned `localStorage` keys
   (checks, species notes, journal, focal/tour picks, eBird links, added-species stubs,
   prefs), serialize to a timestamped JSON, stash it under `sa5_backup_<old>_<ts>`, **and
   auto-download a copy** so she has an off-device backup. Abort migration if backup fails.
3. **Realign (key remap):** apply an explicit **old→new** map. Existing site keys are
   unchanged → checks keyed by (organism × site) pass through. Any data keyed by
   **date/day** is remapped via the §1 table. Ambiguous entries go to a `sa5_review`
   bucket (kept + flagged), **never dropped**.
4. **Fix / validate:** assert `out_count ≥ in_count` (nothing lost); write the new
   `sa5_schema`; show a small notice: "Migrated N items · backup saved · M need review."
5. **Version-aware import:** the JSON **import** path detects the file's schema and runs
   the same realign — so re-importing her old export into the new app also migrates.
6. **Idempotent:** gated by `sa5_schema`; re-running is a no-op.

### Part D — Dependency double-check (touchpoints the re-key ripples into)
Verify each still works after the change:
- authored date map → day-indexed itinerary; **tour** order + dates; **Highlights/Focal**
  per site; region chips/**presets** (now 4 + all); `mapView` zoom groups; region-filter
  `SI[k].rk!==S.region`; **site-account header** (region + date lines); **map markers**
  (new coords, within extent) + drag/zoom; **checklist columns** (more columns, short
  names, sticky-column CSS, focus-collapse); **status-line** region wording; header lede
  count; **render tests** (column-count assertions — update to match, don't weaken);
  the **at-hand site strip** + dimmed-chip restore; **journal per-site-day** keying
  (BUILD_SPEC) now uses the real days.

### Part E — FULL POST-FIX AUDIT (Opus 5) — don't break the good parts
After the fix, run a full self-check. **These must still hold:**
- **Offline photos:** every organism's `o.p[0]` still resolves; no photo dropped;
  `data.js` photo count unchanged from pre-fix.
- **Offline load / PWA:** `sw.js` still serves the shell offline; if any asset was added,
  `precache-list.js` is updated; app boots with the network off.
- **Evidence links:** genomic → GBIF `MATERIAL_SAMPLE`, iNat, eBird, museum
  `PRESERVED_SPECIMEN` all build correctly (v1.0.22 behavior).
- **Genomic flag:** organisms with `g` in `src` still **= 210** (don't re-drop it).
- **Checkmarks & notes:** a seeded pre-fix save survives migration with **zero loss**.
- **Map:** baked `MAPIMG` renders; all markers (old + new) plot; zoom/pan work.
- **Filters:** late-July default, season, abundance, seen-lately, taxa, and the
  taxonomic sort (class→order→family→sci-name) all still work; pinned filtered count OK.
- **Backbone:** no birds mis-filed as non-Aves; no non-bird eBird.
- **Voice:** no "buff", no "loadbearing", no leftover AI-generated phrasing.
- **Tests:** `node tests/render-test.js` → **ALL PASS** (updated for new column counts).

---

## §4 COMPLETION PROMISE — stop only when this prints `ITINERARY FIX ✅`
```bash
set -e
node --check app.js || { echo FAIL app.js; exit 1; }
node --check data.js || { echo FAIL data.js; exit 1; }
node tests/render-test.js | grep -q "ALL PASS" || { echo FAIL tests; exit 1; }
node -e '
const fs=require("fs");global.window={};eval(fs.readFileSync("data.js","utf8"));
const U=global.window.UNIC,S=global.window.SITES;
let ok=true;const chk=(n,x)=>{console.log((x?"ok   ":"FAIL ")+n);if(!x)ok=false;};
// genomic flag not re-dropped
chk("genomic g==210", U.filter(o=>(o.src||"").includes("g")).length===210);
// offline photos preserved (expect >= the known count; set BASELINE from pre-fix)
const withPhoto=U.filter(o=>o.p&&o.p[0]).length; chk("photos present ("+withPhoto+")", withPhoto>2500);
// four regions + all localities
const regs=new Set(S.map(s=>s.region)); chk("4 regions", ["Cape Town","Lowveld","Kruger","Escarpment"].every(r=>[...regs].some(x=>String(x).indexOf(r)>=0)));
chk("locality count >=20", S.length>=20);
// existing keys preserved (checkmark safety)
["kirstenbosch","tablemtn","capepoint","boulders","houtbay","moholoholo","blyde","karongwe","kruger_letaba","kruger_mdluli"].forEach(k=>chk("kept "+k, S.some(s=>s.key===k)));
// dates match the itinerary (spot-check the ones that were most wrong)
const dOf=k=>{const s=S.find(s=>s.key===k);return s&&(s.date||"");};
chk("kirstenbosch 24 Jul", /24 Jul/.test(dOf("kirstenbosch")));
chk("blyde 29 Jul (moved late)", /29 Jul/.test(dOf("blyde")));
chk("kruger_letaba 27 Jul", /27 Jul/.test(dOf("kruger_letaba")));
process.exit(ok?0:1);'
grep -qi "buff" app.js && { echo "FAIL: buff present"; exit 1; } || true
grep -qi "loadbearing" app.js && { echo "FAIL: loadbearing present"; exit 1; } || true
echo "ITINERARY FIX ✅ — open the PR for review"
```
Plus (not scriptable, verify by hand/headless): tour steps Days 3→11 in order with
correct dates; region presets select the right sites; a seeded pre-fix `localStorage`
save round-trips through the migration with **zero lost entries** and a backup file is
produced; app boots offline.

## §5 VERIFY WITH DURRELL (flag in the PR, don't block)
1. **V&A Waterfront** and **Green Point** — include as (marginal/optional) localities or
   omit? (Recommend include, marked marginal/optional.)
2. **Mdluli SW Kruger** hotspot — sheet's draft named **Berg-en-Dal**, but Mdluli sits
   nearer **Pretoriuskop/Skukuza**; confirm which for the data pass.
3. **Kruger central (Day 9)** — no exact area stated; OK to resolve to
   Olifants/Satara/Letaba as the nearest camps?
