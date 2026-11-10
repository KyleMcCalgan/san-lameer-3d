// Spatial model of the villa: rooms, floor heights, photos and viewpoints.
// Coordinates in metres. +x = east, +z = south (garden side), y = up.
// Rect = [x0, z0, x1, z1].  Yaw in degrees: 0 = north, -90 = east, 180 = south, 90 = west.
// See LAYOUT_ASSUMPTIONS.md for the reasoning behind every number here.

export const GROUND = 0;
export const UPPER = 2.8;       // upstairs finished floor level
export const GRADE = -0.9;      // lawn level around the raised villa
export const CEIL_G = 2.6;      // ground-floor ceiling
export const RIDGE_X = 10.5;    // ridge of the vaulted lounge / loft roof (east side of the lounge)
export const RIDGE_Y = 6.2;
export const LOFT_WALL_Y = 5.2; // top of the loft clerestory wall / upstairs ceilings
export const VAULT_X0 = 4.2;    // the lounge vault starts at the kitchen/dining line

// Straight timber stair against the front (north) wall, starting beside the
// front door and rising EAST to a landing that opens onto the loft.
export const STAIR = { axis: 'x', x0: 5.6, x1: 9.35, z0: 0.12, z1: 1.1, risers: 16 };
export const LANDING = [9.35, 0.12, 10.5, 1.6];
const L_PASS = [9.35, 0.12, 10.5, 1.6];   // passage under the landing, door on its south side

const P = 'assets/references/';

// photo.view = approximate photographer position [x, eyeY, z, yawDeg, pitchDeg]
export const rooms = [
  {
    id: 'living', name: 'Living Room', level: 'G', evidence: 'photographed',
    rects: [[5.7, 3.4, 10.5, 11.0], [3.6, 0, 10.5, 3.4]],
    spawn: [10.3, 7.6, 70],
    photos: [
      { src: P + 'living/living-1.jpg', caption: 'Lounge from the patio opening: sofa, kitchen and dining beyond, stairs to the right', view: [10.3, 1.45, 7.6, 70, 3] },
      { src: P + 'living/living-2.jpg', caption: 'Lounge towards the TV wall and the wide patio doors', view: [7.4, 1.45, 4.6, -150, -3] },
      { src: P + 'patio/patio-1.jpg', caption: 'Looking in from the patio', view: [13.6, 1.5, 10.5, 22, 2] },
    ],
  },
  {
    id: 'kitchen', name: 'Kitchen', level: 'G', evidence: 'photographed',
    rects: [[0, 4.1, 3.6, 11.0]],
    spawn: [1.35, 5.5, 180],
    photos: [
      { src: P + 'kitchen/kitchen-1.jpg', caption: 'U-shaped kitchen: cupboards and microwave on the far wall, oven run on the right, peninsula with stools', view: [4.0, 1.4, 7.7, 84, -12] },
      { src: P + 'dining/dining-1.jpg', caption: 'Kitchen seen past the dining table, fridge on the right', view: [6.1, 1.5, 9.5, 90, -6] },
    ],
  },
  {
    id: 'dining', name: 'Dining Area', level: 'G', evidence: 'photographed',
    rects: [[3.6, 4.1, 5.7, 11.0]],
    spawn: [6.1, 9.5, 90],
    photos: [
      { src: P + 'dining/dining-1.jpg', caption: 'Dining table pointing at the kitchen; console and harbour painting on the left wall', view: [6.1, 1.5, 9.5, 90, -6] },
    ],
  },
  {
    id: 'entry', short: 'Entry', name: 'Entrance Hall', level: 'G', evidence: 'partly visible',
    rects: [[4.2, 0, 5.6, 2.2]],
    spawn: [4.95, 0.6, 180],
    photos: [
      { src: P + 'living/living-1.jpg', caption: 'Front door (centre) right beside the foot of the stairs', view: [10.3, 1.45, 7.6, 70, 3] },
    ],
  },
  {
    id: 'stairs', short: 'Stairs', name: 'Staircase', level: 'G', evidence: 'photographed',
    rects: [[STAIR.x0, STAIR.z0, STAIR.x1, STAIR.z1]],
    spawn: [5.1, 0.62, -90],
    photos: [
      { src: P + 'living/living-1.jpg', caption: 'Timber staircase rising along the front wall to the loft', view: [10.3, 1.45, 7.6, 70, 3] },
    ],
  },
  {
    id: 'patio', short: 'Patio & Braai', name: 'Patio & Braai', level: 'G', evidence: 'photographed',
    rects: [[10.5, 5.0, 17.5, 11.0]],
    spawn: [11.2, 10.3, -12],
    photos: [
      { src: P + 'patio/patio-1.jpg', caption: 'Lounge sliders under the tall raked ceiling; braai, shelves and bedroom door on the end wall', view: [13.6, 1.5, 10.5, 22, 2] },
      { src: P + 'patio/patio-2.jpg', caption: 'Braai at the slider corner, shelf niche, pillar and bedroom door; roof falls to the edge beam', view: [11.2, 1.5, 10.3, -12, 2] },
      { src: P + 'patio/patio-3.jpg', caption: 'Loungers on the open sun deck past the roof edge', view: [16.2, 1.5, 6.0, 165, -10] },
      { src: P + 'garden/garden-1.jpg', caption: 'Lawn and trees below the villa (exact viewpoint unknown)', view: [9.0, GRADE + 1.6, 24, 10, 6] },
    ],
  },
  {
    id: 'lobby', short: 'Hall', name: 'Bedroom Hall', level: 'G', evidence: 'inferred',
    rects: [[10.5, 0.6, 12.2, 2.5], [L_PASS[0], L_PASS[1], L_PASS[2], L_PASS[3]]],
    spawn: [11.3, 1.2, 180],
    photos: [],
  },
  {
    id: 'main', name: 'Main Bedroom (King)', level: 'G', evidence: 'photographed',
    rects: [[12.2, 1.0, 17.4, 5.0]],
    spawn: [12.7, 1.75, -90],
    photos: [
      { src: P + 'main-bedroom/main-bedroom-1.jpg', caption: 'King bed, dressing table, glazed doors to the balcony and the patio door', view: [12.7, 1.5, 1.6, -125, -8] },
    ],
  },
  {
    id: 'ensuite1', short: 'En-suite 1', name: 'Main En-suite', level: 'G', evidence: 'photographed',
    rects: [[10.5, 2.5, 12.2, 5.0]],
    spawn: [11.95, 2.95, 110],
    photos: [
      { src: P + 'main-ensuite/main-ensuite-1.jpg', caption: 'Bath, bidet, toilet and shower', view: [12.05, 1.5, 3.05, 115, -15] },
    ],
  },
  {
    id: 'balcony', short: 'Balcony', name: 'Main Bedroom Balcony', level: 'G', evidence: 'railing seen from the bedroom; extent inferred',
    rects: [[17.4, 1.0, 19.8, 5.0]],
    spawn: [18.6, 3.0, -90],
    photos: [],
  },
  {
    id: 'bed2', name: 'Bedroom 2 (Twin)', level: 'G', evidence: 'photographed',
    rects: [[10.5, -3.4, 12.2, 0.6], [12.2, -3.4, 15.0, 1.0]],
    spawn: [13.6, 0.55, 12],
    photos: [
      { src: P + 'bedroom-2/bedroom-2-1.jpg', caption: 'Twin beds, dressing table, garden door and window', view: [13.6, 1.5, 0.55, 12, -10] },
    ],
  },
  {
    id: 'ensuite2', short: 'En-suite 2', name: 'Bedroom 2 En-suite', level: 'G', evidence: 'photographed',
    rects: [[15.0, -3.4, 17.4, 1.0]],
    spawn: [15.7, 0.55, -5],
    photos: [
      { src: P + 'ensuite-2/ensuite-2-1.jpg', caption: 'Shower, toilet and bath', view: [15.7, 1.5, 0.55, -5, -10] },
    ],
  },
  {
    id: 'loft', name: 'Loft (2 Singles)', level: 'U', evidence: 'photographed',
    rects: [[10.5, 0, 14.3, 5.0], LANDING],
    spawn: [10.0, 0.85, -90],
    photos: [
      { src: P + 'loft/loft-1.jpg', caption: 'Loft beds under the clerestory windows; bedroom 3 doorway beyond', view: [10.9, 4.3, 4.6, -40, -10] },
      { src: P + 'loft/loft-2.jpg', caption: 'Loft desk at the balustrade overlooking the lounge', view: [13.5, 4.3, 0.55, 168, -14] },
    ],
  },
  {
    id: 'bed3', short: 'Bedroom 3 (Twin)', name: 'Bedroom 3 (Twin, upstairs)', level: 'U', evidence: 'photographed; position inferred',
    rects: [[12.6, -3.4, 16.6, 0], [16.6, -2.7, 17.7, -0.6]],
    spawn: [13.6, -0.45, 0],
    photos: [
      { src: P + 'bedroom-3/bedroom-3-1.jpg', caption: 'Twin beds pointing back at the loft door, built-in wardrobes and air-conditioner', view: [14.5, 4.3, -0.3, 22, -8] },
      { src: P + 'bedroom-3/bedroom-3-2.jpg', caption: 'Glazed doors to the balcony, dressing table and prints', view: [13.0, 4.3, -0.75, -70, -8] },
    ],
  },
  {
    id: 'ensuite3', short: 'En-suite 3', name: 'Bedroom 3 En-suite', level: 'U', evidence: 'photographed; position inferred',
    rects: [[10.5, -3.4, 12.6, 0]],
    spawn: [12.2, -0.5, 10],
    photos: [
      { src: P + 'ensuite-3/ensuite-3-1.jpg', caption: 'Bath, toilet and shower', view: [12.2, 4.3, -0.5, 10, -12] },
    ],
  },
];

export const outsideRoom = {
  id: 'outside', name: 'Garden (outside)', level: 'O', evidence: 'photographed', rects: [],
  spawn: [9.0, 24, 10],
  photos: [
    { src: P + 'garden/garden-1.jpg', caption: 'Estate lawn and trees (exact viewpoint unknown)', view: [9.0, GRADE + 1.6, 24, 10, 6] },
    { src: P + 'patio/patio-3.jpg', caption: 'Garden seen from the sun deck', view: [16.2, 1.5, 6.0, 165, -10] },
  ],
};

// ---------- walkable floor model ----------
const groundRects = [
  [3.6, 0, 10.5, 11.0],           // entrance, stair, lounge, dining
  [0, 4.1, 3.6, 11.0],            // kitchen
  [10.5, -3.4, 17.4, 1.0],        // bedroom 2 + en-suite 2
  [10.5, 0.6, 12.2, 5.0],         // bedroom hall + main en-suite
  [12.2, 1.0, 19.8, 5.0],         // main bedroom, en-suite 1
  [10.5, 5.0, 17.5, 11.0],        // patio + sun deck
  [4.3, -1.5, 5.6, 0],            // front entrance landing
  [11.0, -4.6, 12.4, -3.4],       // landing outside bedroom 2's garden door
];
const upperRects = [[10.5, -3.4, 16.6, 0], [10.5, 0, 14.3, 5.0], LANDING, [16.6, -2.7, 17.7, -0.6]]; // + bedroom 3 balcony
export const extSteps = [
  { r: [4.4, -2.85, 5.5, -1.5], top: -1.5, bottom: -2.85 },
  { r: [11.15, -5.95, 12.25, -4.6], top: -4.6, bottom: -5.95 },
];

const inR = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
const inStair = (x, z) => inR([STAIR.x0, STAIR.z0, STAIR.x1, STAIR.z1], x, z);

export const BOUNDS = [-16, -18, 36, 34];

export function floorHeight(x, z, feet) {
  if (inStair(x, z)) {
    const t = (x - STAIR.x0) / (STAIR.x1 - STAIR.x0);
    return Math.max(0, Math.min(1, t)) * UPPER;
  }
  if (feet > 1.4 && upperRects.some(r => inR(r, x, z))) return UPPER;
  if (groundRects.some(r => inR(r, x, z))) return GROUND;
  for (const s of extSteps) {
    if (inR(s.r, x, z)) {
      const t = (z - s.top) / (s.bottom - s.top);
      return GROUND + (GRADE - GROUND) * Math.max(0, Math.min(1, t));
    }
  }
  return GRADE;
}

export function roomAt(x, z, feet) {
  if (inStair(x, z)) return rooms.find(r => r.id === 'stairs');
  const lvl = feet > 1.4 ? 'U' : (feet < -0.3 ? 'O' : 'G');
  for (const r of rooms) {
    if (r.level !== lvl || r.id === 'stairs') continue;
    if (r.rects.some(rc => inR(rc, x, z))) return r;
  }
  return outsideRoom;
}

export function spawnHeight(room) {
  return room.level === 'U' ? UPPER : room.level === 'O' ? GRADE : GROUND;
}
