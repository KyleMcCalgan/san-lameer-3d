// Geometry helpers, shared materials and the collision registry.
// Units are metres. World axes: +x = east, +z = south, +y = up.
import * as THREE from 'three';
import { createTextures, patternTexture } from './textures.js';

export const colliders = []; // axis-aligned boxes {minX,maxX,minY,maxY,minZ,maxZ}

export function addCollider(minX, maxX, minY, maxY, minZ, maxZ) {
  colliders.push({
    minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX),
    minY: Math.min(minY, maxY), maxY: Math.max(minY, maxY),
    minZ: Math.min(minZ, maxZ), maxZ: Math.max(minZ, maxZ),
  });
}

const _box3 = new THREE.Box3();
export function solid(obj, shrink = 0.02) {
  obj.updateWorldMatrix(true, true);
  _box3.setFromObject(obj);
  addCollider(_box3.min.x + shrink, _box3.max.x - shrink, _box3.min.y, _box3.max.y,
    _box3.min.z + shrink, _box3.max.z - shrink);
  return obj;
}

// ---------- materials ----------
export let T = null; // textures
export const M = {};

function std(color, rough = 0.85, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
}

export function initMaterials() {
  T = createTextures();
  const DS = THREE.DoubleSide;
  Object.assign(M, {
    wall: std(0xffffff, 0.95, { map: T.plaster, side: DS }),
    render: std(0xffffff, 0.95, { map: T.render, side: DS }),
    patioWall: std(0xd1916a, 0.95, { side: DS }),
    woodCeil: std(0xffffff, 0.7, { map: T.woodCeil ?? T.woodCeiling, side: DS }),
    ceilWhite: std(0xf6f4f0, 0.95, { side: DS }),
    floorTile: std(0xffffff, 0.55, { map: T.floorTile }),
    bathFloor: std(0xffffff, 0.5, { map: T.bathFloor }),
    terracotta: std(0xffffff, 0.75, { map: T.terracotta }),
    woodTileDark: std(0xffffff, 0.6, { map: T.woodTileDark }),
    woodFloorRed: std(0xffffff, 0.35, { map: T.woodFloorRed }),
    carpet: std(0xffffff, 1.0, { map: T.carpet }),
    bathWall: std(0xffffff, 0.35, { map: T.bathWall, side: DS }),
    splash: std(0xffffff, 0.45, { map: T.splash, side: DS }),
    granite: std(0xffffff, 0.3, { map: T.granite }),
    lawn: std(0xffffff, 1.0, { map: T.lawn }),
    roof: std(0xffffff, 0.9, { map: T.roofTile, side: DS }),
    plinth: std(0x8e5b40, 0.95),
    timber: std(0xa4532a, 0.55),        // window / door frames, balustrades
    timberDark: std(0x6b3a20, 0.6),
    doorWood: std(0x8a4524, 0.5),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe6f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, side: DS, depthWrite: false }),
    frosted: new THREE.MeshStandardMaterial({ color: 0xf2f4f2, roughness: 0.6, transparent: true, opacity: 0.88, side: DS }),
    whitePaint: std(0xf3f1ec, 0.6),
    whiteWash: std(0xe9e4dc, 0.8),     // distressed white bedroom furniture
    teak: std(0xa85f30, 0.45),
    navyLeather: std(0x1e2638, 0.42),
    linen: std(0xf8f8f5, 0.9),
    baseBlack: std(0x23262b, 0.9),
    steel: std(0xa9adb2, 0.35, { metalness: 0.35 }),
    chrome: std(0xd4d8dc, 0.25, { metalness: 0.35 }),
    mirror: std(0xc6d2d8, 0.08, { metalness: 0.15 }),
    black: std(0x1a1a1a, 0.5),
    porcelain: std(0xfbfbfa, 0.15),
    lampShade: std(0x8d7a66, 0.9),
    orangeWood: std(0xc8662a, 0.5),
    blueThrow: std(0xa9bfd2, 0.95),
    cushionMustard: std(0xd9a53b, 0.9),
    cushionTeal: std(0x2c8c8c, 0.9),
    cushionGrey: std(0x9aa5ad, 0.9),
    curtain: std(0xf0e6cf, 0.95, { side: DS }),
    blind: std(0x9aa086, 0.95),
    loungerFabric: std(0x8d8f87, 0.9),
    netting: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 1, transparent: true, opacity: 0.35, side: DS, depthWrite: false }),
    leaf: std(0x4f8a2e, 0.9),
    leafLight: std(0x7fae3a, 0.9),
    palmLeaf: std(0x8a9a3a, 0.9),
    trunk: std(0x7a6a55, 0.95),
    neighbour: std(0xa65f3e, 0.95),
    suzani: std(0xffffff, 0.9, { map: patternTexture('suzani') }),
    stripes: std(0xffffff, 0.9, { map: patternTexture('stripes') }),
    tropical: std(0xffffff, 0.9, { map: patternTexture('tropical') }),
    seascape: std(0xffffff, 0.7, { map: patternTexture('seascape') }),
    birds: std(0xffffff, 0.7, { map: patternTexture('birds') }),
    monstera: std(0xffffff, 0.7, { map: patternTexture('monstera') }),
    tvScreen: std(0xffffff, 0.2, { map: patternTexture('tv') }),
    blueBin: std(0x2563c9, 0.5),
    basket: std(0xb38a52, 0.95),
    appliance: std(0xf4f4f2, 0.4),
    redExt: std(0xc0262a, 0.4),
  });
  // world-unit UVs: texture repeat already encodes metres
  return M;
}

// ---------- primitive helpers ----------
function scaleBoxUV(geo, w, h, d) {
  const uv = geo.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i;
    uv.setXY(k, uv.getX(k) * dims[f][0], uv.getY(k) * dims[f][1]);
  }
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent = null) {
  const g = new THREE.BoxGeometry(w, h, d);
  scaleBoxUV(g, w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}

// Box given by min / max corners.
export function bmm(x0, y0, z0, x1, y1, z1, mat, parent) {
  return box(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), mat,
    (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent);
}

export function cyl(rTop, rBot, h, mat, x, y, z, parent, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}

export function sphere(r, mat, x, y, z, parent, sx = 1, sy = 1, sz = 1, seg = 12) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.6 | 0)), mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  if (parent) parent.add(m);
  return m;
}

// Arbitrary quad (p0..p3 in order), uv in metres.
export function quad(p0, p1, p2, p3, mat, parent) {
  const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1), c = new THREE.Vector3(...p2), d = new THREE.Vector3(...p3);
  const lu = a.distanceTo(b), lv = a.distanceTo(d);
  const pos = [a, b, c, a, c, d].flatMap(v => [v.x, v.y, v.z]);
  const uv = [0, 0, lu, 0, lu, lv, 0, 0, lu, lv, 0, lv];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  if (parent) parent.add(m);
  return m;
}

// Flat polygon in a vertical plane. plane 'z': constant z, pts are [x, y].
// plane 'x': constant x, pts are [z, y].
export function vPoly(plane, c, pts, mat, parent) {
  const s = new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, v)));
  const g = new THREE.ShapeGeometry(s);
  const m = new THREE.Mesh(g, mat);
  if (plane === 'z') m.position.z = c;
  else { m.rotation.y = -Math.PI / 2; m.position.x = c; }
  if (parent) parent.add(m);
  return m;
}

// Horizontal rectangle (floor / ceiling), facing up (or down when `down`).
export function hRect(x0, z0, x1, z1, y, mat, parent, down = false) {
  const w = x1 - x0, d = z1 - z0;
  const g = new THREE.PlaneGeometry(w, d);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w + x0, uv.getY(i) * d + z0);
  const m = new THREE.Mesh(g, mat);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2;
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  if (parent) parent.add(m);
  return m;
}

// Wall-surface overlay with rectangular holes (e.g. bathroom tiles over a wall).
// plane 'z' => constant z, u = x ; plane 'x' => constant x, u = z.
export function surface(plane, c, u0, u1, y0, y1, holes, mat, parent) {
  const s = new THREE.Shape();
  s.moveTo(u0, y0); s.lineTo(u1, y0); s.lineTo(u1, y1); s.lineTo(u0, y1); s.lineTo(u0, y0);
  for (const h of holes) {
    const a = Math.max(h.a, u0 + 0.001), b = Math.min(h.b, u1 - 0.001);
    if (b <= a) continue;
    const lo = Math.max(h.y0, y0 + 0.001), hi = Math.min(h.y1, y1 - 0.001);
    if (hi <= lo) continue;
    const p = new THREE.Path();
    p.moveTo(a, lo); p.lineTo(a, hi); p.lineTo(b, hi); p.lineTo(b, lo); p.lineTo(a, lo);
    s.holes.push(p);
  }
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  if (plane === 'z') m.position.z = c;
  else { m.rotation.y = -Math.PI / 2; m.position.x = c; }
  if (parent) parent.add(m);
  return m;
}

// ---------- walls ----------
// along 'x' : wall runs along x (from..to) at z = c.  along 'z' : runs along z at x = c.
// ops: openings [{a, b, y0 (bottom, relative), y1 (top, relative), kind:'door'|'window'|'open'}]
// mats: [negativeSideMaterial, positiveSideMaterial]
export function wall(parent, { along, c, from, to, y0 = 0, y1 = 2.6, t = 0.12, ops = [], mats, collide = true }) {
  const [mNeg, mPos] = mats;
  // ends and top of an exterior wall take the outside finish, so no white plaster shows outdoors
  const cap = [mNeg, mPos].find(m => m === M.render || m === M.patioWall) ?? mNeg;
  const faceMats = along === 'x'
    ? [cap, cap, cap, cap, mPos, mNeg]
    : [mPos, mNeg, cap, cap, cap, cap];
  const piece = (a, b, ya, yb) => {
    if (b - a < 0.005 || yb - ya < 0.005) return;
    const L = b - a, H = yb - ya;
    const m = along === 'x'
      ? box(L, H, t, faceMats, (a + b) / 2, (ya + yb) / 2, c, parent)
      : box(t, H, L, faceMats, c, (ya + yb) / 2, (a + b) / 2, parent);
    return m;
  };
  const coll = (a, b, ya, yb) => {
    if (!collide) return;
    if (along === 'x') addCollider(a, b, ya, yb, c - t / 2, c + t / 2);
    else addCollider(c - t / 2, c + t / 2, ya, yb, a, b);
  };
  const sorted = [...ops].sort((p, q) => p.a - q.a);
  let cur = from;
  for (const o of sorted) {
    piece(cur, o.a, y0, y1);
    coll(cur, o.a, y0, y1);
    piece(o.a, o.b, y0, y0 + (o.y0 || 0));
    piece(o.a, o.b, y0 + o.y1, y1);
    if (o.kind === 'window') coll(o.a, o.b, y0, y1);
    else coll(o.a, o.b, y0 + o.y1, y1);
    cur = o.b;
  }
  piece(cur, to, y0, y1);
  coll(cur, to, y0, y1);
}

export { THREE };
