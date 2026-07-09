# Southern Africa Species Explorer

An offline field guide for the California Academy of Sciences South Africa
itinerary with Dr. Shannon Bennett (20 Jul – 1 Aug 2026). Ten localities from
the Cape winter to the Kruger dry season: browse species by **site** and
**season**, tap a site for its Grinnell-style field account, and tick off what
you see. Installs to an iPad/phone home screen and works offline.

The itinerary is the headline; the evidence sources (eBird, iNaturalist, museum
vouchers, genomic samples, all reconciled on the GBIF Backbone) sit under a
collapsible **methods** panel.

## Files

| File | What it is |
|---|---|
| `index.html` | Thin shell — loads `data.js` then `app.js`, registers the service worker. |
| `data.js` | The data: ~2,780 organisms (one row each) + baked offline map tiles. Rarely changes. |
| `app.js` | All UI + logic (CSS, layout, filters, map, drawer, checklist). **Edit this to change behaviour.** |
| `precache-list.js` | ~1,315 thumbnail URLs the service worker caches for offline use (regenerated from `data.js`). |
| `sw.js` | Service worker: precaches the shell + thumbnails, runtime-caches drawer photos/accounts. Bump `CACHE` when `data.js`/`app.js` change. |
| `manifest.json` | Web-app manifest (name, icon, standalone display). |
| `icon.svg` | Home-screen icon. |

All files sit in the **same folder** and must be served over **https** (a
service worker will not run from `file://`). GitHub Pages is the easiest host.

## Deploy on GitHub Pages

```bash
cd saexplore
git init && git add . && git commit -m "SA species explorer PWA"
git branch -M main
git remote add origin git@github.com:<you>/saexplore.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` /
root → Save.** Your URL appears at the top, e.g.
`https://<you>.github.io/saexplore/`.

## Install on the iPad (per person)

1. Open the URL in **Safari** while online (all iOS browsers use WebKit).
2. Let it sit ~30–60 s so the service worker caches the thumbnails.
3. **Share → Add to Home Screen.**
4. It now launches full-screen and works **offline**. Check-marks and notes save
   automatically. AirDrop the *link* to the group; each person installs once.

## Editing

- Change behaviour/appearance in `app.js`, reload. No build step — `index.html`
  links the files directly.
- After editing, bump `CACHE = 'sa-explorer-vN'` in `sw.js` so installed devices
  pick up the new code.
- `data.js` is regenerated from the source pipeline (browser); `precache-list.js`
  is regenerated from `data.js`.

## Data notes

- Every name is resolved to the GBIF Backbone (~99.8% matched); external lookups
  (photos, Wikipedia) key off the **scientific name**, not the common name.
- Museum specimens are GBIF `PRESERVED_SPECIMEN` records inside tight per-site
  boxes (approximate; flagged in-app). Community observations are excluded from
  the museum layer by definition.
- Photos are Creative-Commons / public-domain, credited in the species drawer.
