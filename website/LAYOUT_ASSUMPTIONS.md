# Layout assumptions: San Lameer 3 Bedroom Classic 10307

This reconstruction was built from the 17 listing photographs and the listing text at
<https://www.stayatsanlameer.co.za/our-villas/3-bedroom-classic-10307>. No floor plan was
available. Everything below explains which parts are **seen** in the photos, which are
**inferred**, and how confident the inference is.

## 1. Facts taken from the listing text

| Fact | Source |
|---|---|
| 219 m² | listing |
| Sleeps 8: **1 king + 6 singles** | listing |
| 3 bedrooms, each with an **en-suite with bath and shower**, plus air-con in every bedroom | listing |
| **Loft area with 2 single beds** | listing |
| Open-plan kitchen, dining and lounge opening onto a large patio with a **charcoal braai** | listing |
| Interior stairs **and** exterior stairs; "access to grass" | facilities list |
| Washing machine, tumble dryer, dishwasher, ceiling fans, inverter | facilities list |

Bed count check: king (main bedroom) + 2 + 2 (bedrooms 2 and 3) + 2 (loft) = 1 king + 6 singles. This matches the listing.

## 2. Photographs grouped by room

The source screenshots contained 20 images, 3 of them duplicates (1 = 19, 2 = 20, 11 = 12).
The 17 unique photos are stored in `assets/references/<room>/`.

| Room | Photos | Same room, different angles? |
|---|---|---|
| Living room | `living-1` (towards kitchen/stairs), `living-2` (towards TV/patio doors) | Yes: the seating swaps sides between them, so they are taken facing opposite directions |
| Kitchen | `kitchen-1`, and the background of `dining-1` | Yes: same granite peninsula, window and microwave niche |
| Dining | `dining-1` | Also shows the kitchen and fridge |
| Patio | `patio-1`, `patio-2`, `patio-3` | Yes: same braai, frosted door, X-braced railing with netting |
| Garden | `garden-1` | Lawn and trees; the exact position is unknown |
| Main bedroom | `main-bedroom-1` | Only king bed in the set |
| Main en-suite | `main-ensuite-1` | The only bathroom with a bidet |
| Bedroom 2 | `bedroom-2-1` | Mirror image of the main bedroom (same window, frosted door and dressing table) |
| En-suite 2 | `ensuite-2-1` | Mirror image of the main en-suite |
| Bedroom 3 | `bedroom-3-1`, `bedroom-3-2` | Yes: same wardrobes, beds and lamp; the window is elevated above the treetops |
| En-suite 3 | `ensuite-3-1` | Different layout from the other two (no bidet) |
| Loft | `loft-1`, `loft-2` | Yes: same red timber floor, clerestory windows and roman blinds |

## 3. How the layout was deduced (key evidence)

1. **Flow from the patio.** Photo 5 is taken from the patio sliders looking back into the house:
   the 3-seater faces you, with the dining table and kitchen beyond it, and the front door and the
   stair rising along the front wall on the right. So the sequence from outside is patio, lounge,
   dining, kitchen.
2. **Kitchen shape (photos 4, 5, 13).** A wide U across the whole end of the open plan:
   - the far (west) wall has the sink run, with a full row of white wall cupboards and the microwave
     niche above it; this wall has no window;
   - the oven and hob run is on the right, ending in the fridge beside the entrance;
   - a long granite peninsula is fixed to the flat left (south) wall, with white stools on the
     dining side;
   - you get in through the gap by the oven run.
3. **One flat south wall.** The wall that carries the TV runs straight on behind the dining table
   to the kitchen, with no step. The console and harbour painting hang on it beside the dining
   table (photo 13). The table runs along the room, with three chairs on each side.
4. **Entrance.** The front door opens into a narrow hall between the outside wall (behind the fridge)
   and the foot of the stair, with no unused space beside it.
5. **Lounge seating (photos 5 & 6).** The seating forms a U around the coffee table, open towards
   the TV on the south wall:
   - the 3-seater is on the dining side, facing the patio glass;
   - the two recliners are on the stair side, angled in towards the table;
   - the 2-seater is backed onto the glass near the TV corner.
6. **Patio table (photo 7).** It runs from the glass corner towards the braai wall, with benches on
   both long sides, chairs at the ends and the loungers along the far railing.
7. **Stair, loft and bedroom wing** are unchanged from the previous version.

## 4. Estimated dimensions (metres)

| Space | Size (approx.) | Basis |
|---|---|---|
| Kitchen | 3.6 × 6.9 | 600 mm runs, ~1.3 m aisle, 4.4 m peninsula, 4 stools |
| Dining | 2.1 wide, beside the peninsula | 2.0 m six-seater table + console on the south wall |
| Lounge (vaulted) | ~5 × 11 incl. stair | sofa, 2 recliners, 2-seater, coffee table, TV wall |
| Patio | 5.5 × 6.0 | table + benches, braai, loungers |

## 5. Inferred or uncertain features

| Feature | Confidence |
|---|---|
| Patio, lounge, dining, kitchen sequence | **High** (photo 5) |
| Kitchen U layout and fridge position | **High** (photos 4, 5, 13) |
| Lounge seating arrangement | **High** (photos 5 and 6 agree) |
| Patio table orientation | **Medium–high** (photo 7) |
| Where the bedroom wing connects, laundry, en-suite pairings | **Low–medium** |
| Exterior massing, roofs, plinth height | **Low** |

## 6. What could not be reconstructed reliably

- **Exact wall positions and room sizes.** All are estimates (±0.5 m). Check the real villa before relying on, for example, whether a cot fits.
- **The bedroom passage, laundry and any storage/linen cupboards.** None appear in a photo.
- **Exact window counts and sizes**, especially on walls that were never photographed.
- **Which way each door swings.** Doors are modelled open, mostly for convenience.
- **The exterior.** The facade, roof and how the villa sits within the estate are not shown in the listing. `garden-1` shows only lawn, palms and the edge of a building.
- **Small décor.** Cushions, artworks and appliances are simplified stand-ins.

The original photographs were **not** used as textures. All surfaces are procedural, so the
"View original photos" panel gives an honest side-by-side comparison.


## 7. Photo review and remaining uncertainty (November 2026)

A fresh review of all 17 reference images prompted a partial correction. In `kitchen-1`,
the breakfast counter projects out from the sink side of the kitchen and the stools line
its long outside edge. In `dining-1`, the long dimension of the dining table crosses the
view toward the kitchen. The earlier model placed the stools across the end of the kitchen
and turned the table lengthways into the kitchen. The peninsula and table have been rotated
to reflect those relationships. Their exact position relative to the entrance remains uncertain.

In `main-bedroom-1` the head of the king bed is on a wall perpendicular to the window and
frosted door; the dressing table is on the opposite side. The bed has been rotated accordingly.
The bathroom opening was moved to clear the bed; its position is an inference, not a feature
visible in the photo. The invented laundry door and main bathroom door leaf were removed; the
openings and the laundry itself are still convenient assumptions, not confirmed features.
The similarly arranged twin room is not proof that the rooms are mirrored or neighbours.

The bedroom wing, third bedroom's level, outside stairs and actual size of the open plan remain
unverified. The loft doorway does not establish what room lies beyond it. The photographs do
not prove compass directions or a 0.9 m plinth. These alternatives need an actual floor plan
or further photographs; this model should not be treated as a measured reconstruction.

The agency's current villa index calls 10307 a Superior villa and lists 219 m? and eight guests;
the older detailed listing URL could not be accessed during this review. The previous detailed
listing facts above are retained from the handoff and could not be independently rechecked.
No visual render, viewpoint comparison, or walking-route test was possible in this review because
the computer preview service was unavailable. The changes therefore require visual and collision
validation before they can be considered complete.


## Lounge alignment correction

In `living-1`, the kitchen and dining area are visible directly behind the main sofa,
while the stair is to the right. An earlier attempt incorrectly placed the kitchen around the corner and treated the TV wall as the camera position. The kitchen has been rotated onto the wall opposite the patio, with dining between it and the sofa; the recorded viewpoint is at the patio opening. The stair remains to the right in that view. The dimensions and precise positions remain
estimates and still require an in-browser comparison and walking test.


The interpretation immediately above supersedes the earlier estimate that the kitchen
occupies the north-west corner and that the first lounge photo was taken beside the TV.
The absolute compass directions are model coordinates only. This reconstruction still needs
rendered comparison: rotating the kitchen is a spatial inference from the patio sightline,
not a surveyed floor plan.


## Kitchen counter correction

`kitchen-1` shows a broad, deep granite peninsula rather than a narrow strip. Its
long outside edge accommodates four stools, and a clear entrance remains on the
stove and fridge side. The peninsula has been widened and its stools moved outside
the overhanging edge. The exact dimensions and circulation remain approximate.
