# DESIGN_HANDOFF.md — declutter the control block

**Audience:** a design-capable agent (Claude Code) editing this repo. Goal: make the
header **control block** less clunky without removing any control or breaking its
wiring. This is a *reorganization*, not a redesign of the visual language — keep the
"Tufte + safari" look, the colour tokens, and every existing behaviour.

Run on a feature branch, PR into `main` (protected — never push to main). Bump the
`app.js` footer version and add a `## 1.0.N` block to `CHANGELOG.md`.

---

## 0. The problem
The controls are now **7 rows + a Methods panel**, stacked full-width — it eats the
whole first screen on iPad/iPhone before you reach the map or the species. It reads
as clunky. Nothing is *wrong*; it's just too tall and undifferentiated.

## 1. The app (how it's built — read before editing)
- Single file **`app.js`** (~40 KB): CSS injected as a string, then `window.APP5`
  (builds the shell markup) and `window.__wire5` (renders + wires). `index.html`
  loads `data.js` then `app.js`. Offline PWA — **no external libraries, no CDNs**.
- **Edit in place, string-patch** with unique anchors; verify with the jsdom test
  harness (`node tests/render-test.js`, needs `npm i jsdom` once). Do NOT rebuild.
- **Control rows** live in `.controls`; each is a `<div class="row"><b>Label:</b>…</div>`.
  A reorder IIFE (search `_rbl(` / `.row.matchrow`) orders them by label text and by
  class. Chips are `.chip` (+ `.on`); the design tokens are CSS vars:
  `--paper --raised --ink --soft --rule --acacia --terra --museum --genomic`, taxon
  colours `--tc` via `.tx-*`, plus rainfall/season chip colours set inline in JS.

## 2. Current control inventory (do not drop any of these)
| Row / element | What it does | Wiring hooks (keep working) |
|---|---|---|
| **Sites:** | site chips (focus / ⌘-click multi) + `all` + `▸ site account` | `.chip.site` `#siteAll` `.acctT` |
| **Match:** | any/all/only over selected sites + Cape/Lowveld/all presets | `.row.matchrow` `.smode` `.preg` |
| **Abundance:** | rare↔common dual slider + **Specimen yr** dual slider + `reset` + count | `#rLo/#rHi/#yLo/#yHi` `#reset` `#count` |
| **Season:** | Summer/Autumn/Winter/Spring + 12 months + `★ late Jul` + `all yr` | `.chip.season` `.mo` `#tripwin` `#allyr` |
| **Seen lately:** | any/≤1yr/≤3mo/≤1mo (most-recent record) | `.row.seenrow` `.seenw` |
| **Sort:** | A→Z/Z→A/taxonomic + **Text** A−/A/A+ + `absent hidden (n)` | `.chip.sort` `.fsb` `.cmpT` |
| **Taxa:** | taxon chips + all/none + **search** box | `.row.taxrow` `.chip.tax` `.taxAll/.taxNone` `#q` |
| **Methods ▸** | collapsed `<details>`: evidence Venn + how-to prose | `details.methods` |
| status line | "N of 2,780 organisms — …" sentence | `#statusline` |

## 3. The goal
Halve the visible control height by **splitting primary from set-and-forget**:

- **Always-visible (primary), in this order:** Sites · Match · Season · Taxa.
  These are what a user touches constantly while planning a stop.
- **Collapse into a single `Refine ▸` `<details>`** (same pattern/ः styling as the
  existing `details.methods`, collapsed by default): **Abundance, Specimen year,
  Seen lately, Sort, Text-size, absent-toggle**. One tap reveals them.
- Keep the **status line** always visible (it's the feedback for every filter).
- Leave **Methods ▸** as its own collapsible below (unchanged).
- Keep the intro lede; consider tightening it to one line.

Result: primary controls (4 rows) + status line visible; everything else one tap away.

### How to move rows without breaking wiring
Wiring is by **class/id, not DOM position** — so *relocating* a `.row` element into a
`<details>` keeps all handlers intact. In the reorder IIFE, instead of appending the
set-and-forget rows to `.controls`, append them into a new `details.refine` element
(create it once, insert it after the Taxa row). Do **not** re-create the rows or
re-wire; just re-parent the existing `.row` nodes.

## 4. Constraints
- **No control or behaviour removed.** Every hook in §2 still works after.
- **No new dependencies** (offline PWA). Pure CSS/DOM.
- Respect the tokens/aesthetic; reuse `.chip`, `details.methods` styling for `.refine`.
- Mobile: rows already `flex-wrap:nowrap; overflow-x:auto` with a wrap toggle (⤢) and
  a `<600px` media query — keep those working.
- Don't touch `data.js`, `MAPIMG`, the map, the drawer, or the site accounts.

## 5. Completion promise (definition of done)
Stop only when this prints `DESIGN DONE ✅`:

```bash
node --check app.js || { echo "FAIL: app.js"; exit 1; }
npm ls jsdom >/dev/null 2>&1 || npm i jsdom
node tests/render-test.js | grep -q "ALL PASS" || { echo "FAIL: render tests"; exit 1; }
node -e '
const {JSDOM}=require("jsdom"),fs=require("fs"),vm=require("vm");
const dom=new JSDOM("<!DOCTYPE html><body><div id=app></div>",{runScripts:"outside-only",pretendToBeVisual:true,url:"https://l/saexplore/"});
const c=dom.getInternalVMContext();vm.runInContext(fs.readFileSync("data.js","utf8"),c);vm.runInContext(fs.readFileSync("app.js","utf8"),c);
const d=dom.window.document;let ok=true;function chk(n,x){console.log((x?"  ok   ":"  FAIL ")+n);if(!x)ok=false;}
const primary=[].slice.call(d.querySelectorAll(".controls > .row")).length; // rows NOT inside a details
chk("primary rows (outside any <details>) <= 4: "+primary, primary<=4);
chk("Refine details exists", !!d.querySelector("details.refine"));
chk("every control still present", ["#rLo","#yLo","#reset","#q","#tripwin","#allyr",".smode",".seenw",".chip.sort",".fsb",".cmpT",".chip.site",".chip.tax"].every(s=>d.querySelector(s)));
chk("status line present", !!d.getElementById("statusline"));
process.exit(ok?0:1);
' && echo "DESIGN DONE ✅ — commit on a branch and open the PR" || echo "NOT DONE — keep going"
```

In words: `node --check` passes; render-tests **ALL PASS**; **≤ 4 primary rows** remain
outside any `<details>`; a **`details.refine`** exists holding the set-and-forget
controls; **every** wiring hook from §2 still resolves; the status line stays visible;
a branch is pushed and a PR opened with a `## 1.0.N` CHANGELOG entry.

## 6. Nice-to-haves (only if §5 stays green)
- Tighten the intro to a single line.
- Give `Refine ▸` / `Methods ▸` matching disclosure styling.
- Optionally remember the open/closed state of `Refine` in `localStorage`.
