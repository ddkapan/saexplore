# Field rehearsal — run this on a real iPhone before the freeze

**Why this exists.** Offline has broken **twice** on this app (a cache wipe, then a stale precache
list), and both times it was a human noticing, not a test. jsdom and headless Chrome cannot tell
you whether this works in a game reserve. Nothing in `tests/` can replace the twenty minutes below.

**Do it on a phone that already has an older version installed** — the upgrade path is the risky
part, and Shannon's phone will be in exactly that state.

---

## A · Upgrade (the risky one — do it first)

The phone already has v1.0.5x with real notes on it.

- [ ] Before upgrading, note what is on it: how many ★/⚑ picks, one note you can recognise, one
      journal day.
- [ ] Open the app **on wifi**. Wait ~10s, then close and reopen (the service worker updates on
      the *second* load).
- [ ] Footer shows the **new version**.
- [ ] **Your picks are still there** (they became the ★ Focal / ⚑ Tour lists).
- [ ] **Your note is still there.** **Your journal day is still there.**
- [ ] Section 08 now lists **Focal, Tour, the ten site lists, Big Five**.
- [ ] The photos did **not** have to re-download (the media cache survives a shell upgrade —
      that's the whole point of the split cache).

> If picks or notes are missing, **stop**. Do not let her upgrade. The old data is still in
> `localStorage` (`sa5_marks`, `sa5_notes`) and is recoverable — say so immediately.

## B · Offline, for real

- [ ] On wifi: tap **Save photos for offline**. Let it finish — it should reach **2,675 / 2,675**.
      Keep the app open while it runs.
- [ ] **Reboot the phone.** (This is the step people skip. It's the one that catches a service
      worker that only *seems* installed.)
- [ ] **Airplane mode on.** Open the app from the Home Screen.
- [ ] The list renders — **2,780 species**.
- [ ] **Photos appear**, including for obscure things (search *Cephalelus* — you should see
      silhouettes, not blanks).
- [ ] Search works. Filters work. A site focus works.
- [ ] Open a species: photo, account text, evidence glyphs, barcode block.
- [ ] The **map** shows (baked tiles).
- [ ] Open the **field journal**. It renders.

## C · A day's work, offline

- [ ] Tick a species as **seen** at a site.
- [ ] Write a **note** on a species.
- [ ] Add a **journal narrative** for the day.
- [ ] Add a species **not in the corpus** (the off-DB stub path).
- [ ] Paste an **iNat observation** URL on a species → it appears **on the account and in the
      day's checklist**.
- [ ] Close the app **completely** (swipe it away), reopen offline: **everything is still there.**

## D · Backup — prove it round-trips

A backup you cannot restore is not a backup.

- [ ] After writing something, section 08 shows **⚠ unsaved changes**.
- [ ] Tap **Back up now** → **Export notes (JSON)**.
- [ ] **Where did the file actually go?** Confirm you can find it in **Files / iCloud**. Do not
      assume — look.
- [ ] The warning is now **gone**.
- [ ] **Edit** an existing note. The warning **comes back** (it fingerprints content, not counts).
- [ ] Import that file back (on a second device, or after clearing) → notes, ticks, journal and
      lists all return.

## E · The phone-in-the-sun test

- [ ] Outdoors, one-handed. Can you read the list at arm's length? Are the taps big enough?
- [ ] **Dark mode** (◐) — is the species list comfortable?
- [ ] Scroll down: the **◐ / A+** buttons slide away. Scroll up: they come back, **clear of the
      Dynamic Island**.

---

## If anything here fails

Write down **exactly what you did and what you saw** — then stop and report it. Do not "fix it and
carry on": the whole value of this pass is knowing the truth about the build she is going to fly
with.

**After a clean pass → FREEZE.** No schema, no storage, no service-worker changes. Copy and CSS
only. A migration bug in the Lowveld is unrecoverable: no signal, no laptop, no rollback.
