# San Lameer Villa: 3D walkthrough

A lightweight, browser-based first-person walkthrough of **3 Bedroom Classic 10307** at San Lameer
(KwaZulu-Natal). It was reconstructed from the listing photographs so you can get a feel for
the layout, room sizes and furniture before the holiday.

> This is an approximate reconstruction, not a survey. See
> [`website/LAYOUT_ASSUMPTIONS.md`](website/LAYOUT_ASSUMPTIONS.md) for what is known and what is inferred.

## Run locally

ES modules require an HTTP server; opening `index.html` directly from disk will not work.

```bash
cd website
python -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve website`, VS Code Live Server, …). Three.js 0.160.0 is
loaded from the jsDelivr CDN through an import map, so an internet connection is needed on first load.

## Controls

| Desktop | Action |
|---|---|
| **W A S D** / arrow keys | Walk |
| Mouse (click the view to capture it) | Look around |
| **Shift** | Walk faster |
| **Esc** | Release the mouse |
| **M** | Floor plan (click a room to jump there) |
| **P** | Original photos of the current room |
| **R** | Reset to the entrance hall |

On phones and tablets, use the joystick (bottom-left) to walk and drag anywhere else to look.
The Floor plan, Photos and Reset buttons are at the bottom-right.

In the **Photos** panel, each listing photo has a *"Stand where the photo was taken"* button.
It moves you to the approximate camera position, so you can compare the model with the real room.

## Deploy to GitHub Pages

**Option A (simplest):** push the repo and enable Pages for the `main` branch, root folder.
The tour is then served at `https://<user>.github.io/<repo>/website/`. All paths are relative,
so it works from a subdirectory.

**Option B (tour at the site root):** use the included workflow
`.github/workflows/pages.yml`, which publishes only the `website/` folder. In the repo settings,
choose **Settings → Pages → Source: GitHub Actions**.

## Project structure

```text
website/
├── index.html               UI shell, import map, start screen
├── LAYOUT_ASSUMPTIONS.md    evidence, dimensions, uncertainties
├── css/style.css            HUD, panels, joystick, responsive layout
├── js/
│   ├── main.js              renderer, lighting, sky, geometry merging, loop
│   ├── layout.js            room data, photo↔room mapping, viewpoints, floor heights
│   ├── villa.js             walls/openings, vaulted ceilings, stairs, loft, roofs, furnishing, garden
│   ├── furniture.js         procedural furniture modelled on the photos
│   ├── builder.js           geometry helpers, materials, collision registry
│   ├── textures.js          procedural canvas textures (timber, tiles, carpet, granite…)
│   ├── controls.js          first-person controller, collisions, touch joystick
│   └── ui.js                floor-plan map, room selector, photo viewer
└── assets/references/<room>/  the 17 unique listing photos, grouped by room
```

## Technical notes

- No build step, no frameworks, no backend. The only dependency is Three.js (pinned to 0.160.0).
- All geometry and textures are procedural. The photos are only shown in the comparison panel and are never used as fake textures.
- About 1,500 static meshes are merged per material into about 60 draw calls, with one shadow-casting sun light. This keeps it smooth on average phones.
- Collision uses axis-aligned boxes with a spatial hash. Stairs and the exterior steps are smooth ramps for the camera.
- `window.__villa` exposes the walker and UI for debugging.
