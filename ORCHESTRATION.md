# ORCHESTRATION.md — overnight run plan (PRs ready by morning, not merged)

**Goal:** one long Claude Code (Opus 5) session does all pending work overnight and
leaves **reviewable, self-verified PRs** open for morning review. **CC never merges to
`main`.** The per-chunk **completion-promise scripts are the overnight gate** — a chunk's
PR opens only when its check prints ✅.

## Run order (dependency-sorted)
1. **PR-0 — `ITINERARY_FIX.md`** (real itinerary, 4 regions, all localities, tour +
   highlights reshuffle, **note-migration**). *Everything else depends on this.*
2. **PR-A — `CC_FEEDBACK_ROUND2.md` quick wins:** B1, B2, B3, B4 + Voice pass (V).
3. **PR-B — Journal/notebook:** J1–J5. *(Keys journal per site-day → needs PR-0.)*
4. **PR-C — Tour/highlights/map:** T1–T4. *(Tour + highlights → needs PR-0.)*

> **PR-0 also commits the handoff docs** (`ITINERARY_FIX.md`, `CC_FEEDBACK_ROUND2.md`,
> `ORCHESTRATION.md`, `DESIGN_BRIEF.md`, `BUILD_SPEC.md`) and the updated `.gitignore`
> (which ignores the stray `hexlog-do-next.pdf`) so they land in history. `git add` them
> explicitly — never `git add .` (the hexlog PDF is ignored, but stay explicit anyway).

## Branch stacking (so deps hold without merging to protected main overnight)
Base each branch on the **previous** one, and set each PR's **base** to that branch so
GitHub shows only the chunk's delta:
```
main
 └─ fix/itinerary-1024        (PR-0, base: main)
     └─ feat/quickwins-1025   (PR-A, base: fix/itinerary-1024)
         └─ feat/journal-1026 (PR-B, base: feat/quickwins-1025)
             └─ feat/tour-map-1027 (PR-C, base: feat/journal-1026)
```
Morning merge order = 0 → A → B → C (retarget/auto-forward as each lands on main).

## Per-chunk protocol (repeat for each PR)
1. Implement the chunk on its branch.
2. Run that chunk's **completion-promise** (ITINERARY_FIX §4; each round-2 bucket's
   **Accept**; `node tests/render-test.js` → ALL PASS; `node --check`).
3. **Only if it prints ✅**, open the PR (base = previous branch).
4. If it **fails**, do **not** force it: open a **draft** PR with the failing output and a
   note, then continue to the next *independent* chunk. Better 3 solid PRs than 1 broken
   merge.
5. **Never** push to `main`; **never** merge. Bump `app.js` footer + a `## 1.0.N`
   CHANGELOG block per PR.

## Each PR description must include
- **Summary** of the chunk.
- **Completion-promise output** (the ✅ block).
- **Changed / did-NOT-touch** — explicitly list the *good parts left intact* (offline
  photos, `sw.js`/precache offline load, evidence links, genomic `g`=210, existing site
  keys + checkmarks, `MAPIMG`).
- **VERIFY** questions for Durrell (don't block on them).

## Hard safety rails (do not violate overnight)
- **Note-migration must ship in PR-0** and **back up before it touches anything** (auto
  JSON download + stashed copy); assert **zero note loss**.
- **Do not** re-drop the genomic flag (`g`=210), delete photos, or change existing site
  keys.
- **Offline must still boot** (service worker + precache); update `precache-list.js` if
  assets are added.
- Network data pass (PR-0 Part B): if it can't complete, ship the new sites as **empty
  columns** and open a follow-up — never block itinerary correctness on the enrichment.

## Morning review (human + Cowork, ~15 min)
For each PR in order 0→A→B→C: read the diff, run the completion-promise script, confirm
the good-parts list, merge, let the next PR forward onto main. Cowork can drive the
review (read diff, run audit) but the **merge is yours**.

---
### Kickoff `/goal` (paste into Claude Code)
```
/goal Read ORCHESTRATION.md, ITINERARY_FIX.md, CC_FEEDBACK_ROUND2.md, DESIGN_BRIEF.md and BUILD_SPEC.md in this repo. Execute the work in ORCHESTRATION.md run order as STACKED branches (PR-0 itinerary+migration → PR-A quick wins+voice → PR-B journal → PR-C tour/highlights/map), each branch based on the previous. For each chunk: implement, then run its completion-promise / Accept checks and `node tests/render-test.js`; open the PR ONLY when the check prints its ✅ (base = the previous branch). If a chunk fails its gate, open a DRAFT PR with the failing output and continue to the next independent chunk. NEVER push to or merge into main. Preserve the good parts: offline photos, offline/PWA boot (update precache if needed), evidence links, genomic g=210, existing site keys + Dr. Bennett's saved checkmarks (the PR-0 note-migration must back up before touching anything and assert zero loss). Bump the app.js footer + a 1.0.N CHANGELOG entry per PR. Put the completion-promise output and a "changed / did-NOT-touch good parts" summary in each PR description, plus any VERIFY questions. Do not stop until all four PRs are open (or draft-with-notes on failure).
```
