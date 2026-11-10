# Handoff prompt: refine the San Lameer villa walkthrough

You are taking over a small, working browser project: a first-person 3D walkthrough of a
holiday villa (San Lameer "3 Bedroom Classic 10307", KwaZulu-Natal, South Africa). It was
reconstructed from listing photographs. The owner likes the concept but is not convinced by the
**layout and scale**. Your job is to form your **own** reading of the evidence and reshape the
villa until moving through it feels like the real place.

Treat the current layout as one previous attempt, not as the answer. Keep, move, resize or
discard any room, wall, opening or piece of furniture as your interpretation demands.

## The evidence

- `website/assets/references/<room>/*.jpg`: the 17 unique listing photographs. The folder names
  are the previous agent's guess at which room each photo shows; you may regroup them.
- The listing page: https://www.stayatsanlameer.co.za/our-villas/3-bedroom-classic-10307
  (room and bed counts, floor area, facilities). Facts stated there should be honoured.
- `website/LAYOUT_ASSUMPTIONS.md`: the previous agent's reasoning and confidence levels. Read it
  critically. Where you disagree, change both the model and that document.

Study every photo yourself before deciding anything. Use what the photos let you infer about:
- which photos show the same space;
- what is visible through doorways, glazing and balustrades;
- where light comes from;
- floor and ceiling materials as clues to room boundaries;
- furniture and fittings of known real-world size as scale references.

Pay particular attention to overall proportion. The previous attempts were criticised for spaces
and openings that felt too small, and for circulation that did not match the photos.

## The system you are working with

It is a static site: HTML, CSS and ES modules, with Three.js pinned via an import map. There is
no build step and no backend, and it must keep working from a GitHub Pages subdirectory.

- `website/js/layout.js` is the **data model**:
  - global constants: floor levels, ceiling and ridge heights, stair geometry;
  - the list of rooms, each with level, footprint rectangles, spawn point, evidence label, and
    linked photos with an approximate photographer viewpoint;
  - the walkable-floor function, which decides floor height (ground, upper, stairs, exterior
    steps) at any point;
  - room lookup for the HUD.

  The floor-plan map, room selector, photo panel and "stand where the photo was taken" feature
  all read from this file.
- `website/js/villa.js` builds the architecture (walls with door and window openings, vaulted and
  flat ceilings, stairs, landings, roofs, exterior steps), places the furniture, and adds the
  garden. Walls register collision boxes automatically, and helpers exist for openings, railings,
  balustrades, wall-mounted items and tiled bathrooms.
- `website/js/furniture.js` contains procedural furniture builders (local space, front facing +z),
  sized to real-world dimensions.
- `website/js/builder.js` contains geometry primitives, shared materials and the collision registry.
  `textures.js` holds the procedural canvas textures.
- `website/js/controls.js` is the first-person controller: walking, pointer lock and touch,
  collision against boxes, and following stairs and floors.
- `website/js/ui.js` holds the HUD, floor-plan map, room selector and photo viewer.
- `website/js/main.js` handles the renderer, lighting, geometry merging and a performance-conscious
  render loop. Shadows are rendered once, rendering happens on demand, and resolution adapts to
  frame rate.
- `window.__villa` exposes the walker, UI, scene and renderer for scripted testing.

You may restructure these files, change the coordinate conventions, or replace helpers if your
approach needs it. Keep the project lightweight and dependency-free beyond Three.js.

## What "done" looks like

- The overall arrangement of spaces, the circulation between them, and their relative and
  absolute scale are consistent with **all** the photographs and the listing facts, as you
  interpret them.
- Standing at each photo's recorded viewpoint gives a recognisably similar composition to the
  real photo. Update the viewpoints to suit your model.
- Every room is reachable by walking. You can't pass through walls, railings or large furniture,
  stairs work in both directions, and nothing lets you fall through a floor.
- Performance stays smooth on an ordinary laptop and phone.
- `LAYOUT_ASSUMPTIONS.md` honestly reflects your final reasoning: what is seen, what is inferred,
  how confident you are, and what you could not determine. Keep `README.md` accurate.

## How to work

- Run it with any static server from `website/`, for example `python -m http.server`.
- Verify by actually rendering it: take screenshots from the photo viewpoints and compare them
  side by side with the originals. Walk the routes between rooms with scripted input, and check
  for console errors. Iterate until the comparisons convince you.
- When the evidence is ambiguous, choose the interpretation that explains the most photos at
  once, and record the alternative you rejected.
- Don't use the listing photos as textures, and don't add rooms or storeys the evidence does not
  support.
