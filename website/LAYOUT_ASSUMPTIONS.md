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


## Patio, braai wall and roof correction

The earlier model gave the patio a flat 2.6 m ceiling, placed the braai in the middle of the
end wall and roofed the whole deck. The patio photos contradict all three:

- **Raked ceiling (seen).** In `patio-1` the timber ceiling meets the wall above the lounge
  sliders far above the 2.35 m sliders, at roughly 4 m. It then falls away from the house; the
  top edge of the end wall slopes down in `patio-1` and `patio-2`. At the outer edge the ceiling
  sits on a dark timber beam whose underside is at about the height of the door head (≈2.1 m).
  Modelled as a lean-to rising from 2.35 m at the edge beam to 4.0 m at the slider wall.
- **Braai wall order (seen).** Starting from the slider corner: a chimney breast with the
  braai over an open wood store and a tiled ledge, running up through the roof as the chimney;
  then a tiled shelf niche with a plug point; then a rendered pillar about 2.3 m tall; and
  directly behind the pillar, the frosted door to the main bedroom. In `patio-2` the pillar
  hides most of the door, which is why the door looks so narrow there.
- **Door position (seen in two rooms).** In `main-bedroom-1` the frosted door is about 0.35 m
  from the corner with the dressing-table wall, and the Juliet window sits further along the
  same wall. The door and window have been moved to match. The tub chair now sits between them.
- **Uncovered sun deck (seen, extent inferred).** In `patio-3` the loungers stand in the sun
  past the roof edge. A rendered pillar and a timber post mark the roof corner, and the railing
  carries on past it. The deck now continues about 2.6 m beyond the edge beam. Its exact size is
  an estimate.

Still uncertain: in `patio-2` a railing seems to continue in line with the braai wall beyond
the pier. That could mean the bedroom wall steps back past the door. The model keeps a straight
bedroom wall (medium-low confidence). The roof heights are photo estimates (±0.3 m).


## Bedroom-wing entrance under the landing

In `living-1` the doorway to the bedroom wing is at the far right of the photo. It sits in the white
wall under the high end of the stair, not in the lounge's back wall. That doorway is now in the
wall under the landing. It opens into a short passage beneath the landing, and the passage turns
east into the bedroom hall. To give that turn a full-width opening, the wall between the hall and
bedroom 2 moved 0.4 m north, and bedroom 2's door moved to the east end of that wall.
The lounge's back wall under the loft is now solid.

No photo or listing fact supported the inferred laundry, so it has been removed. The hall now ends
just past the main-bedroom door (z = 2.5). The leftover space behind the braai is closed off as a
void. The passage under the landing opens full width into the hall, and the under-stair door is
0.95 m wide. These hall dimensions are inferred; no photo shows them.


## Main bedroom rearrangement (owner's direction)

This section follows the owner's description of the room and supersedes the "Door position"
note in the patio section above. Walking in from the hall, the king bed's head is on the left
(north) wall. The frosted patio door is at the far end of the right (south) wall, and that
wall has no window. The back (east) wall has glazed sliding doors onto a small covered balcony
with a timber railing. The balcony occupies the strip where the en-suite used to be. The
dressing table stands on the right wall, west of the patio door.

From the photo viewpoint this matches `main-bedroom-1` closely: the glazed doors with the
railing outside are on the left, the frosted door is on the far wall, and the dressing table
is on the right. The sun deck now extends to x = 17.5 so the patio door opens onto it.

The main en-suite moved into the space behind the braai (≈1.6 × 2.3 m inside). Its door is
on the bedroom's entrance wall. The bath runs along the lounge-side wall, with a corner
shower beyond it and the toilet and bidet beside the door. `main-ensuite-1` shows an
outside window, but this position only meets the outside on the braai wall, and the patio
photos show none there. So no window is modelled. The bathroom is tighter than the photo
suggests, and its position is inferred (low–medium confidence).


## Bedroom 3 and en-suite 3 (upstairs) rebuilt

The doorway at the far end of the loft's left wall in `loft-1` shows a single bed with its
head on the far wall and its foot towards the loft. So the beds in bedroom 3 point back at
the loft door. Combining `bedroom-3-1` and `bedroom-3-2`:

- the beds' heads are on the north wall, under the air-con, with a nightstand between them;
- the built-in wardrobes are on the left (west) wall, and the en-suite doorway is beside
  them, nearer the loft;
- the big window with a timber balcony railing is on the right (east) wall;
- the dressing table and prints are on the loft-door wall.

The room now spans x 12.6–16.6 (≈3.8 × 3.3 m). The en-suite moved to the west side
(≈2.0 × 3.2 m): the bath runs along the outside wall, the toilet sits under a frosted
window in the north wall, the shower is in the corner, and the basin is beside the door.
The east window is modelled as glazed sliding doors onto a small balcony (≈1 × 2.1 m) on
the roof of en-suite 2 below. Its size is inferred; the photo only shows the railing
directly outside. Medium confidence in the arrangement, low in the exact dimensions.
