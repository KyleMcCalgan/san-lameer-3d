// Builds the villa: structure, openings, stairs, roofs, furnishing and garden.
// See LAYOUT_ASSUMPTIONS.md for the evidence behind every dimension.
import { THREE, M, box, bmm, cyl, quad, vPoly, hRect, surface, wall, addCollider, solid } from './builder.js';
import * as F from './furniture.js';
import { STAIR, LANDING, UPPER, GRADE, RIDGE_X, RIDGE_Y, LOFT_WALL_Y, CEIL_G, VAULT_X0 } from './layout.js';

const { place, FACE } = F;
const EXT = 0.2, INT = 0.12;
let root;

// ---- vertical profile of the vaulted living ceiling and loft ceiling ----
const yVault = x => CEIL_G + (x - VAULT_X0) * ((RIDGE_Y - CEIL_G) / (RIDGE_X - VAULT_X0)); // lounge: low at the dining side
// patio: lean-to timber ceiling, high against the lounge wall, falling to an edge beam (patio-1, patio-2)
const PATIO_E = 14.0, PATIO_HI = 4.0, PATIO_LO = 2.35, DECK_E = 17.5;
const yPatio = x => PATIO_HI - (x - RIDGE_X) * ((PATIO_HI - PATIO_LO) / (PATIO_E - RIDGE_X));
const yLoft = x => RIDGE_Y - (x - RIDGE_X) * ((RIDGE_Y - LOFT_WALL_Y) / (14.3 - RIDGE_X)); // loft: low at its east wall

// ---------------------------------------------------------------- openings
// u = position along the wall, d = offset across the wall from its centre line.
function seg(along, c, u0, u1, y0, y1, d0, d1, mat) {
  return along === 'x'
    ? bmm(u0, y0, c + d0, u1, y1, c + d1, mat, root)
    : bmm(c + d0, y0, u0, c + d1, y1, u1, mat, root);
}

function windowFrame(along, c, a, b, yb, yt, t, o) {
  const f = 0.05, d = t / 2 + 0.015;
  seg(along, c, a, a + f, yb, yt, -d, d, M.timber);
  seg(along, c, b - f, b, yb, yt, -d, d, M.timber);
  seg(along, c, a, b, yt - f, yt, -d, d, M.timber);
  seg(along, c, a - 0.02, b + 0.02, yb, yb + f, -d - 0.02, d + 0.02, M.timber);
  const n = Math.max(1, Math.round((b - a) / 0.75));
  for (let i = 1; i < n; i++) {
    const u = a + ((b - a) * i) / n;
    seg(along, c, u - 0.025, u + 0.025, yb, yt, -0.04, 0.04, M.timber);
  }
  if (o.transom) seg(along, c, a, b, yt - 0.42, yt - 0.37, -0.04, 0.04, M.timber);
  seg(along, c, a + f, b - f, yb + f, yt - f, -0.006, 0.006, o.frosted ? M.frosted : M.glass);
}

function doorFrame(along, c, a, b, yb, yt, t, o) {
  const f = 0.06, d = t / 2 + 0.02;
  seg(along, c, a, a + f, yb, yt, -d, d, M.timber);
  seg(along, c, b - f, b, yb, yt, -d, d, M.timber);
  seg(along, c, a, b, yt - f, yt, -d, d, M.timber);
  if (o.style === 'none') return;
  const w = b - a - 2 * f;
  const hu = o.hinge === 'b' ? b - f - 0.025 : a + f + 0.025;
  const s = o.swing || 1;
  const d0 = s > 0 ? t / 2 : -t / 2 - w, d1 = s > 0 ? t / 2 + w : -t / 2;
  const top = yt - f;
  if (o.style === 'frosted') {
    seg(along, c, hu - 0.022, hu + 0.022, yb, yb + 0.85, d0, d1, M.doorWood);
    seg(along, c, hu - 0.022, hu + 0.022, top - 0.1, top, d0, d1, M.doorWood);
    seg(along, c, hu - 0.012, hu + 0.012, yb + 0.85, top - 0.1, d0 + 0.08, d1 - 0.08, M.frosted);
    seg(along, c, hu - 0.022, hu + 0.022, yb + 0.85, top - 0.1, d0, d0 + 0.08, M.doorWood);
    seg(along, c, hu - 0.022, hu + 0.022, yb + 0.85, top - 0.1, d1 - 0.08, d1, M.doorWood);
  } else {
    seg(along, c, hu - 0.022, hu + 0.022, yb, top, d0, d1, o.style === 'white' ? M.whitePaint : M.doorWood);
  }
}

function slidingFrame(along, c, a, b, yb, yt, t) {
  const f = 0.06, d = t / 2 + 0.02;
  seg(along, c, a, a + f, yb, yt, -d, d, M.timber);
  seg(along, c, b - f, b, yb, yt, -d, d, M.timber);
  seg(along, c, a, b, yt - f, yt, -d, d, M.timber);
  const pw = (b - a) / 4;
  const panel = (u0, dd) => {
    seg(along, c, u0, u0 + pw, yb, yt - f, dd - 0.02, dd + 0.02, M.timber);
    seg(along, c, u0 + 0.05, u0 + pw - 0.05, yb + 0.08, yt - f - 0.05, dd - 0.025, dd + 0.025, M.glass);
  };
  // two panels stacked at each end, centre left open
  panel(a, -0.03); panel(a + 0.04, 0.03);
  panel(b - pw, -0.03); panel(b - pw - 0.04, 0.03);
  if (along === 'x') {
    addCollider(a, a + pw + 0.05, yb, yt, c - 0.08, c + 0.08);
    addCollider(b - pw - 0.05, b, yb, yt, c - 0.08, c + 0.08);
  } else {
    addCollider(c - 0.08, c + 0.08, yb, yt, a, a + pw + 0.05);
    addCollider(c - 0.08, c + 0.08, yb, yt, b - pw - 0.05, b);
  }
}

// Wall + decorate its openings.
function W(spec) {
  spec.t = spec.t ?? INT;
  spec.y0 = spec.y0 ?? 0;
  spec.y1 = spec.y1 ?? CEIL_G;
  spec.ops = spec.ops ?? [];
  spec.mats = spec.mats ?? [M.wall, M.wall];
  wall(root, spec);
  for (const o of spec.ops) {
    const yb = spec.y0 + (o.y0 || 0), yt = spec.y0 + o.y1;
    if (o.kind === 'window') windowFrame(spec.along, spec.c, o.a, o.b, yb, yt, spec.t, o);
    else if (o.kind === 'door') doorFrame(spec.along, spec.c, o.a, o.b, yb, yt, spec.t, o);
    else if (o.kind === 'slide') slidingFrame(spec.along, spec.c, o.a, o.b, yb, yt, spec.t);
    else if (o.kind === 'open') doorFrame(spec.along, spec.c, o.a, o.b, yb, yt, spec.t, { style: 'none' });
  }
}

// Place a group against a wall. inward = +1 / -1 (side of the wall the item faces).
function onWall(g, along, c, u, y, inward, off, collide = false) {
  if (along === 'x') { g.position.set(u, y, c + inward * off); g.rotation.y = inward > 0 ? 0 : Math.PI; }
  else { g.position.set(c + inward * off, y, u); g.rotation.y = inward > 0 ? Math.PI / 2 : -Math.PI / 2; }
  root.add(g);
  if (collide) solid(g);
  return g;
}

// Bathroom tile lining. faces = inner wall faces; holes per side {a,b,y0,y1}.
function tileRoom(x0, z0, x1, z1, y0, y1, holes = {}) {
  surface('z', z0 + 0.002, x0, x1, y0, y1, holes.n || [], M.bathWall, root);
  surface('z', z1 - 0.002, x0, x1, y0, y1, holes.s || [], M.bathWall, root);
  surface('x', x0 + 0.002, z0, z1, y0, y1, holes.w || [], M.bathWall, root);
  surface('x', x1 - 0.002, z0, z1, y0, y1, holes.e || [], M.bathWall, root);
}

// Glass corner shower in world coords; glass on the listed open sides.
function showerAt(x0, z0, x1, z1, y, sides) {
  bmm(x0, y, z0, x1, y + 0.08, z1, M.porcelain, root);
  const h = y + 2.0;
  if (sides.includes('x0')) bmm(x0 - 0.01, y + 0.08, z0, x0 + 0.01, h, z1, M.glass, root);
  if (sides.includes('x1')) bmm(x1 - 0.01, y + 0.08, z0, x1 + 0.01, h, z1, M.glass, root);
  if (sides.includes('z0')) bmm(x0, y + 0.08, z0 - 0.01, x1, h, z0 + 0.01, M.glass, root);
  if (sides.includes('z1')) bmm(x0, y + 0.08, z1 - 0.01, x1, h, z1 + 0.01, M.glass, root);
  const cx = sides.includes('x0') ? x0 : x1, cz = sides.includes('z0') ? z0 : z1;
  bmm(cx - 0.02, y, cz - 0.02, cx + 0.02, h, cz + 0.02, M.chrome, root);
  bmm(cx - 0.03, y + 0.9, cz - 0.03, cx + 0.03, y + 1.25, cz + 0.03, M.chrome, root);
  addCollider(x0, x1, y, h, z0, z1);
}

function railing(x0, z0, x1, z1, y, h = 1.0, style = 'cross') {
  const along = Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 'x' : 'z';
  const L = along === 'x' ? x1 - x0 : z1 - z0;
  const n = Math.max(1, Math.round(L / 1.4));
  const P = (u, w, yy0, yy1, dd) => along === 'x'
    ? bmm(x0 + u - w, yy0, z0 - dd, x0 + u + w, yy1, z0 + dd, M.timberDark, root)
    : bmm(x0 - dd, yy0, z0 + u - w, x0 + dd, yy1, z0 + u + w, M.timberDark, root);
  for (let i = 0; i <= n; i++) P((L * i) / n, 0.05, y, y + h, 0.05);
  P(L / 2, L / 2, y + h - 0.07, y + h, 0.06);
  P(L / 2, L / 2, y + 0.05, y + 0.12, 0.04);
  if (style === 'cross') {
    for (let i = 0; i < n; i++) {
      const u0 = (L * i) / n, u1 = (L * (i + 1)) / n, len = Math.hypot(u1 - u0, h - 0.2);
      const ang = Math.atan2(h - 0.2, u1 - u0);
      for (const sgn of [1, -1]) {
        const b = box(len, 0.06, 0.04, M.timberDark);
        b.position.set(0, 0, 0);
        const gg = new THREE.Group();
        gg.add(b);
        const uc = (u0 + u1) / 2;
        if (along === 'x') { gg.position.set(x0 + uc, y + h / 2, z0); gg.rotation.z = sgn * ang; }
        else { gg.position.set(x0, y + h / 2, z0 + uc); gg.rotation.set(0, Math.PI / 2, sgn * ang, 'YXZ'); }
        root.add(gg);
      }
    }
    // safety netting
    if (along === 'x') quad([x0, y + 0.1, z0 + 0.06], [x1, y + 0.1, z0 + 0.06], [x1, y + h, z0 + 0.06], [x0, y + h, z0 + 0.06], M.netting, root);
    else quad([x0 + 0.06, y + 0.1, z0], [x0 + 0.06, y + 0.1, z1], [x0 + 0.06, y + h, z1], [x0 + 0.06, y + h, z0], M.netting, root);
  }
  if (along === 'x') addCollider(x0, x1, y - 1, y + 1.7, z0 - 0.08, z0 + 0.08);
  else addCollider(x0 - 0.08, x0 + 0.08, y - 1, y + 1.7, z0, z1);
}

// Spindle balustrade (stairs and loft edge) between two points, rising from y0 to y1.
function balustrade(x0, z0, x1, z1, yb0, yb1, h = 0.95) {
  const L = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.round(L / 0.13);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, yb = yb0 + (yb1 - yb0) * t;
    bmm(x - 0.017, yb, z - 0.017, x + 0.017, yb + h, z + 0.017, M.timber, root);
  }
  const rail = box(Math.hypot(L, yb1 - yb0), 0.06, 0.07, M.timber);
  rail.position.set((x0 + x1) / 2, (yb0 + yb1) / 2 + h, (z0 + z1) / 2);
  rail.rotation.order = 'YZX';
  rail.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  rail.rotation.z = Math.atan2(yb1 - yb0, L);
  root.add(rail);
  const base = rail.clone();
  base.position.y -= h - 0.05;
  root.add(base);
}

// ---------------------------------------------------------------- structure
const wlM = () => M.wall;
const pwM = () => M.patioWall;
const LOFT_E = 14.3;           // east wall of the loft (clerestory)

function buildStructure() {
  const wl = M.wall, rn = M.render, pw = M.patioWall, v = RIDGE_Y, R = RIDGE_X;
  const S = STAIR, L = LANDING;
  const y56 = yVault(S.x0);

  // ---------- plinth (the villa sits ~0.9 m above the lawn) ----------
  for (const [x0, z0, x1, z1] of [[3.5, -0.1, 10.5, 11.1], [-0.1, 4.0, 3.6, 11.1], [10.5, -3.5, 17.5, 1.0], [10.5, 1.0, 19.9, 5.0], [10.5, 5.0, DECK_E + 0.1, 11.1]]) {
    bmm(x0, GRADE, z0, x1, -0.01, z1, M.plinth, root);
    addCollider(x0, x1, GRADE - 0.5, 0, z0, z1);
  }

  // ---------- floors ----------
  hRect(3.6, 0, 10.5, 11, 0, M.floorTile, root);                // entrance, dining, lounge
  hRect(0, 4.1, 3.6, 11, 0, M.floorTile, root);                 // kitchen
  bmm(5.75, 0, 3.3, 10.4, 0.012, 10.9, M.carpet, root);         // fitted lounge carpet
  hRect(10.5, 0.6, 12.2, 2.5, 0, M.floorTile, root);            // bedroom hall
  hRect(12.2, 1.0, 17.4, 5.0, 0, M.woodTileDark, root);         // main bedroom
  hRect(17.4, 1.0, 19.8, 5.0, 0, M.terracotta, root);           // main-bedroom balcony
  hRect(10.5, 2.5, 12.2, 5.0, 0, M.bathFloor, root);            // en-suite 1 (behind the braai)
  hRect(10.5, -3.4, 12.2, 0.6, 0, M.woodTileDark, root);        // bedroom 2
  hRect(12.2, -3.4, 15.0, 1.0, 0, M.woodTileDark, root);
  hRect(15.0, -3.4, 17.4, 1.0, 0, M.bathFloor, root);           // en-suite 2
  hRect(10.5, 5.0, DECK_E, 11.0, 0, M.terracotta, root);         // patio + sun deck

  // ---------- flat ceilings ----------
  hRect(0, 4.1, VAULT_X0, 11, CEIL_G, M.woodCeil, root, true);   // kitchen + dining (low flat timber)
  hRect(3.6, 0, VAULT_X0, 4.1, CEIL_G, M.woodCeil, root, true);
  hRect(VAULT_X0, 0, S.x0, 2.2, CEIL_G, M.woodCeil, root, true); // entrance hall
  hRect(10.5, -3.4, 17.4, 5.0, CEIL_G, M.ceilWhite, root, true); // bedroom wing
  hRect(17.4, 1.0, 19.8, 5.0, CEIL_G, M.ceilWhite, root, true);  // balcony soffit

  // ---------- open plan: kitchen / dining / lounge ----------
  W({ along: 'x', c: 0, from: 3.5, to: 10.5, t: EXT, mats: [rn, wl], ops: [
    { a: 4.5, b: 5.4, y0: 0, y1: 2.1, kind: 'door', style: 'wood', hinge: 'a', swing: 1 },  // front door
  ] });
  W({ along: 'z', c: 3.6, from: -0.1, to: 4.1, t: EXT, mats: [rn, wl] });                  // entrance west wall
  W({ along: 'x', c: 4.1, from: -0.1, to: 3.5, t: EXT, mats: [rn, wl] });                  // kitchen back (north) wall
  W({ along: 'z', c: 0, from: 4.0, to: 11.1, t: EXT, mats: [rn, wl] });                    // kitchen far wall (cupboards, no window)
  W({ along: 'x', c: 11, from: -0.1, to: 10.6, t: EXT, mats: [wl, rn] });                  // flat south wall: kitchen, dining, TV
  // closed space under the stair landing
  W({ along: 'z', c: L[0], from: S.z1, to: L[3] });
  // door under the landing (living-1, far right) into a short passage that turns east to the bedroom hall
  W({ along: 'x', c: L[3], from: L[0], to: R, ops: [{ a: 9.45, b: 10.4, y0: 0, y1: 2.05, kind: 'door', style: 'white', hinge: 'a', swing: -1 }] });
  // east side of the lounge: solid below the loft, then the wide patio sliders
  W({ along: 'z', c: R, from: 0, to: 5.0, ops: [{ a: 0.6, b: 1.6, y0: 0, y1: 2.3, kind: 'open' }] });   // passage opens full width into the hall
  W({ along: 'z', c: R, from: 5.0, to: 11.0, t: EXT, mats: [wl, pw], ops: [{ a: 5.3, b: 10.7, y0: 0, y1: 2.35, kind: 'slide' }] });

  // ---------- bedroom wing ----------
  W({ along: 'x', c: -3.4, from: 10.4, to: 17.5, t: EXT, mats: [rn, wl], ops: [
    { a: 11.2, b: 12.0, y0: 0, y1: 2.1, kind: 'door', style: 'frosted', hinge: 'a', swing: 1 }, // bedroom 2 garden door
    { a: 12.5, b: 14.0, y0: 0.5, y1: 2.2, kind: 'window' },                                     // bedroom 2 Juliet window
    { a: 15.6, b: 16.6, y0: 1.3, y1: 2.1, kind: 'window', frosted: true }] });                // en-suite 2
  W({ along: 'z', c: 10.5, from: -3.4, to: 0, t: EXT, mats: [rn, wl] });
  W({ along: 'z', c: 17.4, from: -3.4, to: 1.0, t: EXT, mats: [wl, rn] });
  W({ along: 'x', c: 0.6, from: 10.5, to: 12.26, ops: [{ a: 11.2, b: 12.0, y0: 0, y1: 2.05, kind: 'door', style: 'white', hinge: 'b', swing: -1 }] });
  W({ along: 'z', c: 12.2, from: 0.6, to: 1.0 });
  W({ along: 'x', c: 1.0, from: 12.2, to: 17.4 });
  W({ along: 'x', c: 2.5, from: 10.5, to: 12.2 });                                         // hall ends just past the main-bedroom door
  W({ along: 'z', c: 15.0, from: -3.4, to: 1.0, ops: [{ a: -0.2, b: 0.6, y0: 0, y1: 2.05, kind: 'door', style: 'frosted', hinge: 'b', swing: 1 }] });
  W({ along: 'z', c: 12.2, from: 1.0, to: 5.0, ops: [
    { a: 1.4, b: 2.15, y0: 0, y1: 2.05, kind: 'door', style: 'white', hinge: 'a', swing: 1 },   // from the hall
    { a: 2.7, b: 3.45, y0: 0, y1: 2.05, kind: 'door', style: 'white', hinge: 'a', swing: 1 }] }); // to the en-suite
  W({ along: 'z', c: 17.4, from: 0.9, to: 5.1, t: EXT, mats: [wl, rn], ops: [{ a: 2.2, b: 4.3, y0: 0, y1: 2.2, kind: 'slide' }] }); // glazed doors onto the balcony
  W({ along: 'x', c: 5.0, from: 10.5, to: 17.5, t: EXT, mats: [wl, pw], ops: [
    { a: 16.35, b: 17.15, y0: 0, y1: 2.1, kind: 'door', style: 'frosted', hinge: 'a', swing: -1 }] }); // patio door at the far end of the bedroom

  // ---------- vaulted lounge (ridge along x = 10.5 over the loft edge) ----------
  quad([VAULT_X0, CEIL_G, 0], [R, v, 0], [R, v, 11], [VAULT_X0, CEIL_G, 11], M.woodCeil, root);
  vPoly('z', 2.2, [[VAULT_X0, CEIL_G], [S.x0, CEIL_G], [S.x0, y56]], wl, root);           // bulkhead over the entry
  vPoly('x', S.x0, [[0, CEIL_G], [2.2, CEIL_G], [2.2, y56], [0, y56]], wl, root);
  vPoly('z', 0, [[VAULT_X0, CEIL_G], [R, CEIL_G], [R, v]], wl, root);                     // north gable
  vPoly('z', -0.11, [[VAULT_X0, CEIL_G], [R, CEIL_G], [R, v]], rn, root);
  vPoly('z', 11, [[VAULT_X0, CEIL_G], [R, CEIL_G], [R, v]], wl, root);                    // south gable
  vPoly('z', 11.11, [[VAULT_X0, CEIL_G], [R + 0.1, CEIL_G], [R + 0.1, v]], rn, root);
  vPoly('x', R, [[5.0, CEIL_G], [11, CEIL_G], [11, v], [5.0, v]], wl, root);              // tall wall over the sliders
  vPoly('x', R + 0.1, [[5.0, CEIL_G], [11.1, CEIL_G], [11.1, v], [5.0, v]], rn, root);
  bmm(R - 0.12, v - 0.24, -0.1, R + 0.12, v, 11.1, M.timberDark, root);                    // ridge beam
  addCollider(R - 0.06, R + 0.06, CEIL_G, v, 5.0, 11);
  addCollider(VAULT_X0, R, CEIL_G, v, -0.1, 0.1);

  // ---------- staircase: rises east along the front wall ----------
  const n = S.risers - 1, run = (S.x1 - S.x0) / n, rise = UPPER / S.risers;
  for (let i = 0; i < n; i++) {
    const x0 = S.x0 + i * run, top = (i + 1) * rise;
    bmm(x0, 0, S.z0, x0 + run, top - 0.035, S.z1 - 0.04, wl, root);
    bmm(x0 - 0.02, top - 0.035, S.z0, x0 + run, top, S.z1, M.teak, root);
  }
  // closed white side under the stair (bird print hangs here, photo 5)
  quad([S.x0, 0, S.z1 - 0.035], [S.x1, 0, S.z1 - 0.035], [S.x1, UPPER - 0.2, S.z1 - 0.035], [S.x0 + run, rise, S.z1 - 0.035], wl, root);
  quad([S.x0, 0.05, 0.115], [S.x1, UPPER - 0.1, 0.115], [S.x1, UPPER + 0.15, 0.115], [S.x0, 0.3, 0.115], M.timber, root);
  bmm(L[0], CEIL_G, L[1], L[2], UPPER - 0.01, L[3], M.timber, root);
  hRect(L[0], L[1], L[2], L[3], UPPER, M.woodFloorRed, root);
  bmm(S.x0 - 0.05, 0, S.z1 - 0.05, S.x0 + 0.05, 1.1, S.z1 + 0.05, M.timber, root);        // newel by the front door
  balustrade(S.x0 + 0.05, S.z1, S.x1, S.z1, rise, UPPER);
  balustrade(S.x1, S.z1, L[0], L[3], UPPER, UPPER);
  balustrade(L[0], L[3], R, L[3], UPPER, UPPER);
  addCollider(S.x0 + 0.4, S.x1 + 0.05, -0.5, UPPER + 1.2, S.z1 - 0.06, S.z1 + 0.06);
  addCollider(L[0] - 0.06, L[0] + 0.06, -0.5, UPPER + 1.2, S.z1, L[3]);
  addCollider(L[0], R, CEIL_G, UPPER + 1.2, L[3] - 0.06, L[3] + 0.06);

  // ---------- loft (mezzanine over the bedroom hall, open to the lounge) ----------
  hRect(R, 0, LOFT_E, 5.0, UPPER, M.woodFloorRed, root);
  bmm(R - 0.06, CEIL_G, L[3], R + 0.06, UPPER, 5.0, M.timber, root);                       // floor edge
  quad([R, v, 0], [LOFT_E, LOFT_WALL_Y, 0], [LOFT_E, LOFT_WALL_Y, 5.0], [R, v, 5.0], M.woodCeil, root);
  balustrade(R, L[3], R, 5.0, UPPER, UPPER);
  addCollider(R - 0.06, R + 0.06, CEIL_G, UPPER + 1.2, L[3], 5.0);
  W({ along: 'z', c: LOFT_E, from: 0, to: 5.0, y0: CEIL_G, y1: LOFT_WALL_Y, t: EXT, mats: [wl, rn], ops: [
    { a: 1.7, b: 2.45, y0: 1.45, y1: 2.3, kind: 'window' },
    { a: 2.75, b: 3.5, y0: 1.45, y1: 2.3, kind: 'window' },
    { a: 3.8, b: 4.55, y0: 1.45, y1: 2.3, kind: 'window' }] });
  vPoly('z', 4.94, [[R, CEIL_G], [LOFT_E, CEIL_G], [LOFT_E, LOFT_WALL_Y], [R, v]], wl, root); // loft south gable
  vPoly('z', 5.07, [[R, CEIL_G], [LOFT_E + 0.1, CEIL_G], [LOFT_E + 0.1, LOFT_WALL_Y], [R, v]], rn, root);
  addCollider(R, LOFT_E, UPPER, LOFT_WALL_Y, 4.88, 5.1);

  // ---------- upstairs: en-suite 3 (west) + bedroom 3 (east), north of the loft ----------
  // From the loft door the beds point straight back at you (loft-1); wardrobes and the
  // en-suite door are on the left, the big window and balcony on the right (bedroom-3-1/2).
  const B3W = 12.6;
  hRect(10.5, -3.4, B3W, 0, UPPER, M.bathFloor, root);
  hRect(B3W, -3.4, 16.6, 0, UPPER, M.woodTileDark, root);
  hRect(10.5, -3.4, 16.6, 0, LOFT_WALL_Y, M.ceilWhite, root, true);
  W({ along: 'x', c: -3.4, from: 10.4, to: 16.7, y0: CEIL_G, y1: LOFT_WALL_Y, t: EXT, mats: [rn, wl], ops: [
    { a: 10.75, b: 11.65, y0: 1.6, y1: 2.4, kind: 'window', frosted: true }] });             // en-suite 3, over the toilet
  W({ along: 'z', c: 10.5, from: -3.4, to: 0, y0: CEIL_G, y1: LOFT_WALL_Y, t: EXT, mats: [rn, wl] });
  W({ along: 'z', c: 16.6, from: -3.4, to: 0.1, y0: CEIL_G, y1: LOFT_WALL_Y, t: EXT, mats: [wl, rn], ops: [
    { a: -2.35, b: -0.95, y0: UPPER - CEIL_G, y1: UPPER - CEIL_G + 2.1, kind: 'slide' }] });            // bedroom 3 glazed doors to the balcony
  W({ along: 'x', c: 0, from: LOFT_E, to: 16.7, y0: CEIL_G, y1: LOFT_WALL_Y, t: EXT, mats: [wl, rn] });
  W({ along: 'x', c: 0, from: 10.5, to: LOFT_E, y0: UPPER, y1: LOFT_WALL_Y, ops: [
    { a: 13.2, b: 14.0, y0: 0, y1: 2.05, kind: 'door', style: 'white', hinge: 'b', swing: 1 }] });
  vPoly('z', 0, [[R, LOFT_WALL_Y], [LOFT_E, LOFT_WALL_Y], [R, v]], wl, root);
  W({ along: 'z', c: B3W, from: -3.4, to: 0, y0: UPPER, y1: LOFT_WALL_Y, ops: [
    { a: -0.9, b: -0.15, y0: 0, y1: 2.05, kind: 'door', style: 'frosted', hinge: 'b', swing: -1 }] });
  // small balcony off bedroom 3, sitting on the en-suite 2 roof (railing seen in bedroom-3-2)
  bmm(16.7, CEIL_G + 0.2, -2.75, 17.75, UPPER + 0.06, -0.55, M.terracotta, root);
  railing(17.75, -2.75, 17.75, -0.55, UPPER + 0.06, 1.0, 'plain');
  railing(16.7, -2.75, 17.75, -2.75, UPPER + 0.06, 1.0, 'plain');
  railing(16.7, -0.55, 17.75, -0.55, UPPER + 0.06, 1.0, 'plain');

  // ---------- bathroom tiling + kitchen splashback ----------
  tileRoom(10.56, 2.56, 12.14, 4.9, 0, CEIL_G, { e: [{ a: 2.7, b: 3.45, y0: 0, y1: 2.05 }] });
  tileRoom(15.06, -3.3, 17.3, 0.94, 0, CEIL_G, {
    n: [{ a: 15.6, b: 16.6, y0: 1.3, y1: 2.1 }], w: [{ a: -0.2, b: 0.6, y0: 0, y1: 2.05 }] });
  tileRoom(10.56, -3.3, 12.54, -0.06, UPPER, LOFT_WALL_Y, {
    n: [{ a: 10.75, b: 11.65, y0: CEIL_G + 1.6, y1: CEIL_G + 2.4 }], e: [{ a: -0.9, b: -0.15, y0: UPPER, y1: UPPER + 2.05 }] });
  surface('x', 0.102, 4.2, 10.9, 0.9, 1.5, [], M.splash, root);                                    // far wall, between counter and cupboards
  surface('z', 4.202, 0.1, 3.0, 0.9, 1.5, [], M.splash, root);                                       // oven-run wall

  // ---------- patio ----------
  // Covered braai area under a lean-to (x = R .. PATIO_E), then an open sun deck to DECK_E (patio-3).
  const yP = yPatio, xw = R + 0.1, bz = 5.1, yX = RIDGE_X + (PATIO_HI - CEIL_G) / ((PATIO_HI - PATIO_LO) / (PATIO_E - RIDGE_X));
  quad([xw, yP(xw), bz], [PATIO_E, PATIO_LO, bz], [PATIO_E, PATIO_LO, 11.0], [xw, yP(xw), 11.0], M.woodCeil, root);
  vPoly('x', xw + 0.005, [[bz, CEIL_G], [11.0, CEIL_G], [11.0, yP(xw)], [bz, yP(xw)]], pw, root);   // tall wall over the sliders
  vPoly('z', bz + 0.005, [[xw, CEIL_G], [yX, CEIL_G], [xw, yP(xw)]], pw, root);                     // braai wall up to the rake
  bmm(PATIO_E - 0.11, PATIO_LO - 0.28, bz, PATIO_E + 0.11, PATIO_LO + 0.02, 11.05, M.timberDark, root); // edge beam
  quad([xw, yP(xw) - 0.22, 11.06], [PATIO_E + 0.4, PATIO_LO - 0.42, 11.06], [PATIO_E + 0.4, PATIO_LO - 0.02, 11.06], [xw, yP(xw) + 0.22, 11.06], M.timberDark, root); // raked fascia
  bmm(PATIO_E - 0.16, 0, 10.72, PATIO_E + 0.16, PATIO_LO - 0.28, 11.04, pw, root);               // rendered corner pillar
  bmm(PATIO_E + 0.22, 0, 10.88, PATIO_E + 0.3, PATIO_LO - 0.28, 10.96, M.timberDark, root);     // timber post beside it
  addCollider(PATIO_E - 0.16, PATIO_E + 0.3, 0, PATIO_LO, 10.72, 11.04);
  railing(xw, 11.0, DECK_E, 11.0, 0);
  railing(DECK_E, bz, DECK_E, 11.0, 0);

  // Braai wall (patio-1, patio-2), from the slider corner: chimney breast with braai over a
  // wood store, tiled shelf niche, rendered pillar, then the frosted door to the main bedroom.
  const t = M.terracotta, pm = pw.clone();
  pm.color.multiplyScalar(0.9);                                   // projecting masonry reads a shade deeper in shadow
  bmm(10.6, 0, bz, 10.72, 1.5, 5.7, pm, root);                    // breast jambs
  bmm(11.53, 0, bz, 11.65, 1.5, 5.7, pm, root);
  bmm(10.72, 0, bz, 11.53, 0.72, 5.32, pm, root);                 // back of the wood store
  bmm(10.58, 0.72, bz, 11.67, 0.8, 5.78, t, root);                // tiled ledge
  bmm(10.72, 0.8, bz, 11.53, 1.5, 5.3, M.black, root);            // firebox
  bmm(10.72, 0.8, 5.3, 10.75, 1.5, 5.7, M.black, root);
  bmm(11.5, 0.8, 5.3, 11.53, 1.5, 5.7, M.black, root);
  bmm(10.78, 0.98, 5.32, 11.47, 1.0, 5.66, M.steel, root);        // grid
  bmm(10.78, 0.86, 5.64, 11.47, 0.9, 5.68, M.steel, root);        // front rail
  bmm(10.6, 1.5, bz, 11.65, 4.9, 5.7, pm, root);                  // breast up through the roof as the chimney
  cyl(0.06, 0.06, 0.02, M.black, 11.12, 2.2, 5.71, root).rotation.x = Math.PI / 2; // vent
  addCollider(10.6, 11.65, 0, 4.9, 5.0, 5.78);
  bmm(11.65, 0, bz, 12.25, 0.85, 5.45, pm, root);                 // niche base
  bmm(11.65, 0.85, bz, 12.25, 0.92, 5.5, t, root);                // tiled counter
  for (const y of [1.32, 1.72]) bmm(11.65, y, bz, 12.25, y + 0.05, 5.42, t, root);
  bmm(11.9, 1.06, bz, 11.98, 1.14, bz + 0.015, M.porcelain, root); // plug point
  addCollider(11.65, 12.25, 0, 0.92, 5.0, 5.5);
  bmm(12.25, 0, bz, 12.5, 2.3, 5.6, pm, root);                    // pillar
  addCollider(12.25, 12.5, 0, 2.3, 5.0, 5.6);
  // terracotta tile skirting along every face of the braai wall (patio-1, patio-2)
  for (const [x0, z0, x1, z1] of [[10.6, 5.7, 11.65, 5.73], [11.65, 5.45, 12.25, 5.48], [12.25, 5.6, 12.5, 5.63],
    [11.65, 5.45, 11.68, 5.7], [12.22, 5.45, 12.25, 5.6], [12.5, bz, 12.53, 5.6], [12.5, bz, 12.6, bz + 0.03], [13.4, bz, PATIO_E, bz + 0.03],
    [xw, bz, xw + 0.03, 5.3], [xw, 10.7, xw + 0.03, 11.0]]) bmm(x0, 0, z0, x1, 0.09, z1, t, root);

  // ---------- main-bedroom balcony (where the old en-suite was) ----------
  railing(17.5, 1.0, 19.8, 1.0, 0, 1.0, 'plain');
  railing(19.8, 1.0, 19.8, 5.0, 0, 1.0, 'plain');
  railing(17.5, 5.0, 19.8, 5.0, 0, 1.0, 'plain');
  for (const z of [1.08, 4.92]) bmm(19.66, 0, z - 0.08, 19.82, CEIL_G, z + 0.08, M.timberDark, root);
  bmm(17.5, CEIL_G - 0.2, 0.95, 19.85, CEIL_G, 1.05, M.timberDark, root);
  bmm(17.5, CEIL_G - 0.2, 4.95, 19.85, CEIL_G, 5.05, M.timberDark, root);
  bmm(19.7, CEIL_G - 0.2, 0.95, 19.85, CEIL_G, 5.05, M.timberDark, root);

  // ---------- entrance landings & exterior stairs ----------
  bmm(4.3, GRADE, -1.5, 5.6, 0, 0, M.terracotta, root);
  for (let i = 0; i < 4; i++) bmm(4.4, GRADE, -1.5 - (i + 1) * 0.27, 5.5, -0.18 * (i + 1), -1.5 - i * 0.27, M.terracotta, root);
  bmm(4.2, GRADE, -2.85, 4.35, 0.15, 0, M.plinth, root);
  bmm(5.55, GRADE, -2.85, 5.7, 0.15, 0, M.plinth, root);
  addCollider(4.18, 4.37, GRADE, 1.8, -2.85, 0);
  addCollider(5.53, 5.72, GRADE, 1.8, -2.85, 0);
  bmm(11.0, GRADE, -4.6, 12.4, 0, -3.4, M.terracotta, root);
  for (let i = 0; i < 4; i++) bmm(11.15, GRADE, -4.6 - (i + 1) * 0.27, 12.25, -0.18 * (i + 1), -4.6 - i * 0.27, M.terracotta, root);
  railing(10.95, -4.6, 10.95, -3.4, 0, 1.0, 'plain');
  railing(12.45, -4.6, 12.45, -3.4, 0, 1.0, 'plain');
  addCollider(11.0, 12.4, GRADE, 0, -4.6, -3.4);

  // ---------- roofs ----------
  const off = 0.16;
  quad([VAULT_X0, CEIL_G + 0.05, -0.3], [R, v + off, -0.3], [R, v + off, 11.3], [VAULT_X0, CEIL_G + 0.05, 11.3], M.roof, root);
  quad([R, v + off, -0.15], [LOFT_E + 0.2, LOFT_WALL_Y + off - 0.05, -0.15], [LOFT_E + 0.2, LOFT_WALL_Y + off - 0.05, 5.2], [R, v + off, 5.2], M.roof, root);
  bmm(-0.3, CEIL_G + 0.03, 3.85, VAULT_X0, CEIL_G + 0.25, 11.3, M.roof, root);
  bmm(3.35, CEIL_G + 0.03, -0.3, VAULT_X0, CEIL_G + 0.25, 3.85, M.roof, root);
  bmm(10.35, LOFT_WALL_Y + 0.03, -3.65, 16.85, LOFT_WALL_Y + 0.23, -0.07, M.roof, root);
  bmm(16.6, CEIL_G + 0.03, -3.65, 17.65, CEIL_G + 0.25, 1.0, M.roof, root);
  bmm(LOFT_E + 0.06, CEIL_G + 0.03, 0.06, 16.6, CEIL_G + 0.25, 1.0, M.roof, root);
  bmm(LOFT_E + 0.06, CEIL_G + 0.03, 1.0, 20.05, CEIL_G + 0.25, 5.2, M.roof, root);
  { // lean-to over the patio, falling from the lounge wall to just past the edge beam
    const yr = x => yPatio(x) + 0.2, xe = PATIO_E + 0.4;
    quad([R + 0.1, yr(R + 0.1), 4.95], [xe, yr(xe), 4.95], [xe, yr(xe), 11.3], [R + 0.1, yr(R + 0.1), 11.3], M.roof, root);
  }
}

// ---------------------------------------------------------------- furnishing
function furnish() {
  const P = (g, x, y, z, r = 0, c = true) => place(root, g, x, y, z, r, c);
  const U = UPPER, cab = M.whitePaint, gr = M.granite;

  // ---------- kitchen (photos 4, 5 & 13) ----------
  // A wide U seen from the lounge (looking west): the far wall carries the sink
  // run with a full row of white wall cupboards and the microwave niche above it
  // (no window); the oven / hob run is on the right ending in the fridge by the
  // entrance; a long granite peninsula is fixed to the flat left (south) wall with
  // white stools on the dining side. The way in is the gap by the oven run.
  bmm(0.1, 0, 4.2, 0.7, 0.86, 10.9, cab, root); bmm(0.1, 0.86, 4.2, 0.73, 0.9, 10.9, gr, root); // sink run
  bmm(0.7, 0, 4.2, 2.93, 0.86, 4.8, cab, root); bmm(0.7, 0.86, 4.2, 2.93, 0.9, 4.83, gr, root); // oven run
  addCollider(0.1, 0.73, 0, 0.9, 4.2, 10.9); addCollider(0.7, 2.95, 0, 0.9, 4.2, 4.83);
  bmm(0.2, 0.86, 7.25, 0.62, 0.905, 7.95, M.steel, root);                       // sink
  bmm(0.12, 0.9, 7.57, 0.17, 1.15, 7.63, M.chrome, root);
  // wall cupboards along the far wall, with an open microwave niche
  bmm(0.1, 1.5, 4.55, 0.45, 2.35, 8.6, cab, root);
  bmm(0.1, 1.75, 8.6, 0.45, 2.35, 9.4, cab, root);                              // microwave niche
  bmm(0.1, 1.42, 8.6, 0.45, 1.47, 9.4, cab, root);
  bmm(0.12, 1.47, 8.7, 0.44, 1.72, 9.3, M.appliance, root);                     // microwave
  bmm(0.44, 1.5, 8.75, 0.45, 1.69, 9.1, M.black, root);
  bmm(0.1, 1.5, 9.4, 0.45, 2.35, 10.9, cab, root);
  for (let z = 4.85; z < 10.8; z += 0.6) if (z < 8.6 || z > 9.4) bmm(0.45, 1.56, z - 0.06, 0.465, 1.58, z + 0.06, M.orangeWood, root);
  for (let z = 4.55; z <= 10.91; z += 0.6) if (z < 8.55 || z > 9.45) bmm(0.45, 1.52, z - 0.006, 0.456, 2.33, z + 0.006, M.steel, root); // door joints
  bmm(0.1, 1.48, 4.55, 0.46, 1.5, 10.9, M.steel, root);                         // shaded cupboard underside
  bmm(1.45, 0.12, 4.8, 2.05, 0.72, 4.815, M.black, root);                       // oven
  bmm(1.47, 0.62, 4.81, 2.03, 0.7, 4.82, M.steel, root);
  bmm(1.5, 0.9, 4.3, 2.0, 0.91, 4.72, M.black, root);                           // hob
  bmm(1.47, 1.55, 4.2, 2.03, 1.64, 4.62, M.steel, root);                        // extractor
  bmm(0.7, 1.5, 4.2, 1.45, 2.35, 4.55, cab, root);                              // wall units
  bmm(2.05, 1.5, 4.2, 2.95, 2.35, 4.55, cab, root);
  P(F.fridge(), 3.27, 0, 4.53, FACE.S);                                         // fridge ends the run, beside the entrance
  for (let x = 0.95; x < 2.9; x += 0.6) bmm(x - 0.06, 0.74, 4.8, x + 0.06, 0.765, 4.83, M.orangeWood, root);
  for (let z = 4.5; z < 10.8; z += 0.6) bmm(0.7, 0.74, z - 0.06, 0.73, 0.765, z + 0.06, M.orangeWood, root);
  bmm(2.4, 0.9, 4.3, 2.65, 1.12, 4.5, M.appliance, root);                       // kettle
  bmm(0.25, 0.9, 9.6, 0.55, 1.08, 9.95, M.chrome, root);                        // toaster
  bmm(2.05, 0, 6.6, 2.6, 0.86, 10.9, wlM(), root);                              // peninsula, fixed to the south wall
  bmm(2.0, 0.86, 6.5, 2.85, 0.9, 10.9, gr, root);
  addCollider(2.0, 2.85, 0, 0.9, 6.5, 10.9);
  for (const z of [7.0, 7.6, 8.2, 8.8]) P(F.barStool(), 3.1, 0, z, 0, false);
  onWall(F.trackLight(), 'z', 1.35, 7.4, CEIL_G, 1, 0, false);

  // ---------- entrance ----------
  cyl(0.07, 0.07, 0.45, M.redExt, 3.73, 1.25, 1.8, root, 10);                  // fire extinguisher (photo 5)
  bmm(4.45, 2.25, 0.1, 5.45, 2.5, 0.12, M.appliance, root);                    // vent grille above door

  // ---------- dining (photo 13): table points at the kitchen, console on the left wall ----------
  P(F.diningTable(0.95, 2.0), 4.65, 0, 8.95);
  for (const z of [8.3, 8.95, 9.6]) {
    P(F.diningChair(), 3.93, 0, z, FACE.E, false);
    P(F.diningChair(), 5.37, 0, z, FACE.W, false);
  }
  P(F.console_(), 4.65, 0, 10.72, FACE.N);
  onWall(F.painting(1.25, 0.95, M.seascape, M.cushionMustard), 'x', 11, 4.65, 1.75, -1, 0.11);

  // Viewed from the patio, the sofa fronts the kitchen and dining area;
  // the two recliners sit to its right, with the staircase beyond them.
  // Seating U around the coffee table, open towards the TV (photos 5 & 6):
  // 3-seater on the dining side facing the patio glass, two recliners on the
  // stair side angled in towards the table, 2-seater backed onto the glass
  // near the TV corner.
  // 3-seater on the dining side facing the glass, 2-seater in front of the glass
  // (fully inside the room, angled slightly at the table), two recliners side by
  // side on the stair side facing the TV, coffee table centred in the U (living-2).
  P(F.sofa(2.2), 6.4, 0, 8.25, FACE.E);
  P(F.sofa(1.65, M.tropical, 2), 9.8, 0, 9.2, FACE.W - 0.12);
  P(F.recliner(), 7.5, 0, 6.35, FACE.S + 0.12);
  P(F.recliner(), 8.75, 0, 6.35, FACE.S - 0.12);
  P(F.coffeeTable(1.2, 0.8), 8.1, 0, 8.35, FACE.S);
  P(F.tvUnit(), 8.1, 0, 10.67, FACE.N);
  onWall(F.painting(0.9, 0.6, M.birds, M.timberDark), 'x', S_Z1(), 8.4, 1.3, 1, 0.03);
  onWall(F.curtains(0.3, 2.4, 2.4), 'z', RIDGE_X, 5.4, 0, -1, 0.11);
  onWall(F.curtains(0.3, 2.4, 2.4), 'z', RIDGE_X, 10.48, 0, -1, 0.11); // stays inside the TV-corner wall

  const fan = F.ceilingFan(); fan.position.set(6.5, yVault(6.5), 8.6); root.add(fan);
  onWall(F.trackLight(), 'x', 6.0, 8.0, yVault(8.0), 1, 0, false);

  // ---------- patio (photos 7, 8 & 14) ----------
  // Table runs from the glass corner towards the braai wall (photo 7), benches
  // either side, chairs at the ends; loungers along the far railing (photo 14).
  P(F.patioTable(2.6), 12.4, 0, 7.85, FACE.E);
  P(F.bench(2.4), 11.67, 0, 7.85, FACE.E);
  P(F.bench(2.4), 13.13, 0, 7.85, FACE.E);
  P(F.diningChair(), 12.4, 0, 6.15, FACE.S, false);
  P(F.diningChair(), 12.4, 0, 9.55, FACE.N, false);
  for (const x of [15.0, 15.8, 16.6]) P(F.lounger(), x, 0, 9.9, FACE.N); // in the sun past the roof edge (patio-3)

  // ---------- main bedroom (photo 2) ----------
  // Entering from the hall: bed head on the left (north) wall, patio door at the far end of the
  // right wall, glazed doors to the balcony on the back wall.
  P(F.kingBed(), 15.05, 0, 2.12, FACE.S);
  P(F.nightstand(), 13.8, 0, 1.3, FACE.S);
  P(F.nightstand(), 16.3, 0, 1.3, FACE.S);
  P(F.dressingTable(1.5), 13.9, 0, 4.64, FACE.N);
  P(F.tubChair(), 12.8, 0, 4.4, FACE.N + 0.6);
  onWall(F.curtains(2.1, 2.25), 'z', 17.4, 3.25, 0, -1, 0.11);
  onWall(F.painting(0.4, 0.5, M.tropical), 'z', 12.2, 4.3, 1.5, 1, 0.07);
  onWall(F.airCon(), 'x', 1.0, 16.75, 2.25, 1, 0.07);
  onWall(F.trackLight(), 'x', 3.0, 14.6, CEIL_G, 1, 0, false);

  // ---------- main en-suite (photo 3) ----------
  // tucked behind the braai: bath along the lounge-side wall, shower in the far corner,
  // toilet and bidet beside the door
  P(F.bathtub(1.45), 10.98, 0, 3.34, Math.PI / 2);
  showerAt(10.56, 4.12, 11.4, 4.9, 0, ['x1', 'z0']);
  P(F.toilet(), 11.8, 0, 4.58, FACE.N);
  P(F.bidet(), 11.88, 0, 3.85, FACE.W);
  P(F.bin(), 11.95, 0, 4.15, 0, false);

  onWall(F.trackLight(), 'x', 2.0, 11.35, CEIL_G, 1, 0, false);

  // ---------- bedroom 2 (photo 10) ----------
  P(F.singleBed(), 13.95, 0, -2.55, FACE.W);
  P(F.singleBed(), 13.95, 0, -1.15, FACE.W);
  P(F.nightstand(), 14.7, 0, -1.85, FACE.W);
  P(F.dressingTable(1.1), 10.82, 0, -1.4, FACE.E);
  P(F.tubChair(), 12.25, 0, -2.95, FACE.S + 0.4);
  bmm(10.65, 0, 0.0, 10.95, 0.3, 0.3, M.basket, root);
  onWall(F.curtains(1.5, 2.3), 'x', -3.4, 13.25, 0, 1, 0.11);
  onWall(F.julietRail(1.5), 'x', -3.4, 13.25, 0.35, -1, 0.16);
  onWall(F.painting(0.55, 0.45, M.monstera), 'z', 10.5, -2.6, 1.65, 1, 0.11);
  onWall(F.airCon(), 'z', 15.0, -1.85, 2.25, -1, 0.17);
  onWall(F.trackLight(), 'x', -1.2, 12.8, CEIL_G, 1, 0, false);

  // ---------- en-suite 2 (photo 11) ----------
  showerAt(15.06, -3.3, 15.9, -2.45, 0, ['x1', 'z1']);
  P(F.toilet(), 16.35, 0, -3.0, FACE.S);
  P(F.bathtub(1.75), 16.88, 0, -1.6, FACE.E);
  P(F.basin(), 16.4, 0, 0.68, FACE.N);
  P(F.bin(), 15.8, 0, -3.1, 0, false);

  // ---------- loft (photos 1 & 18) ----------
  P(F.singleBed(), 13.3, U, 2.35, FACE.W);
  P(F.singleBed(), 13.3, U, 4.1, FACE.W);
  P(F.nightstand(), 14.05, U, 3.22, FACE.W);
  for (const z of [2.07, 3.12, 4.17]) onWall(F.romanBlind(0.8), 'z', LOFT_E, z, U + 2.35, -1, 0.12);
  const desk = new THREE.Group();
  bmm(-0.28, 0.72, -0.5, 0.28, 0.76, 0.5, M.whitePaint, desk);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.03, 0.025, 0.72, M.whitePaint, sx * 0.23, 0.36, sz * 0.45, desk, 8);
  P(desk, 10.9, U, 4.2);
  P(F.diningChair(), 11.45, U, 4.2, FACE.W, false);
  onWall(F.painting(0.8, 0.55, M.tropical), 'x', 4.94, 12.4, U + 1.6, -1, 0.02);
  const lfan = F.ceilingFan(); lfan.position.set(12.2, yLoft(12.2), 2.8); root.add(lfan);

  // ---------- bedroom 3, upstairs (photos 15 & 16) ----------
  // heads on the north wall under the air-con, beds pointing back at the loft door
  P(F.singleBed(), 14.05, U, -2.27, FACE.S);
  P(F.singleBed(), 15.55, U, -2.27, FACE.S);
  P(F.nightstand(), 14.8, U, -3.05, FACE.S);
  P(F.wardrobe(2.0, 2.25), 12.98, U, -2.2, FACE.E);                 // west wall, beside the en-suite door
  P(F.dressingTable(0.9, 'small'), 15.2, U, -0.3, FACE.N);          // loft-door wall, with the prints
  P(F.tubChair(), 16.05, U, -0.55, FACE.N - 0.6);
  onWall(F.airCon(), 'x', -3.4, 14.8, U + 2.05, 1, 0.17);
  onWall(F.curtains(1.4, U + 2.25, 2.1), 'z', 16.6, -1.65, 0, -1, 0.11);
  onWall(F.painting(0.5, 0.42, M.monstera), 'x', 0, 14.55, U + 1.55, -1, 0.07);
  onWall(F.painting(0.6, 0.45, M.monstera), 'x', 0, 15.75, U + 1.6, -1, 0.07);

  // ---------- en-suite 3, upstairs (photo 17) ----------
  // bath along the left (west) wall, toilet under the window, shower beside the door (ensuite-3-1)
  P(F.bathtub(1.6), 11.02, U, -1.0, Math.PI / 2);
  P(F.toilet(), 11.2, U, -3.0, FACE.S);
  showerAt(11.69, -3.3, 12.54, -2.45, U, ['x0', 'z1']);
  P(F.basin(), 12.29, U, -1.55, FACE.W);
  P(F.bin(), 10.8, U, -2.3, 0, false);
}
const S_Z1 = () => STAIR.z1 - 0.035;

// ---------------------------------------------------------------- garden
function garden(scene) {
  const g = new THREE.Group();
  g.add(hRect(-60, -60, 80, 80, GRADE - 0.005, M.lawn));
  const r = s => { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); };
  const palms = [[4, 15], [10, 17], [18, 14], [-3, 13], [22, 9], [23, -2], [-4, 3], [13, 25], [-6, 22], [3, -7]];
  palms.forEach(([x, z], i) => { const p = F.palm(6 + r(i) * 4); p.position.set(x, GRADE, z); p.rotation.y = r(i + 9) * 6; g.add(p); addCollider(x - 0.3, x + 0.3, GRADE, 10, z - 0.3, z + 0.3); });
  const trees = [[7, 22, 8, 4.5], [20, 20, 9, 5], [-8, 8, 8, 4], [25, 5, 7, 4], [14, -9, 7, 4], [-6, -6, 6, 3.5], [28, 16, 8, 5], [0, 29, 9, 5]];
  trees.forEach(([x, z, h, rr]) => { const t = F.broadTree(h, rr); t.position.set(x, GRADE, z); g.add(t); addCollider(x - 0.4, x + 0.4, GRADE, 10, z - 0.4, z + 0.4); });
  for (const [x, z] of [[2, 12.4], [19.1, 6.7], [21, 3], [-0.9, 5], [8, -1.6], [18.5, -2.5], [1.8, 1.8], [-1.3, 9.6]]) {
    const s = F.shrub(0.6 + r(x) * 0.5); s.position.set(x, GRADE, z); g.add(s);
  }
  for (const [x, z, w, d] of [[28, -8, 9, 8], [-15, -4, 8, 9], [33, 12, 8, 10], [-16, 18, 9, 8]]) {
    bmm(x - w / 2, GRADE, z - d / 2, x + w / 2, GRADE + 3.2, z + d / 2, M.neighbour, g);
    const roofM = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 2.4, 4, 1), M.roof);
    roofM.position.set(x, GRADE + 4.4, z);
    roofM.rotation.y = Math.PI / 4;
    roofM.scale.set((w / Math.hypot(w, d)) * 1.4, 1, (d / Math.hypot(w, d)) * 1.4);
    g.add(roofM);
    addCollider(x - w / 2, x + w / 2, GRADE, 5, z - d / 2, z + d / 2);
  }
  scene.add(g);
  return g;
}

export function buildVilla(scene) {
  root = new THREE.Group();
  root.name = 'villa';
  buildStructure();
  furnish();
  scene.add(root);
  const gardenGroup = garden(scene);
  return { villa: root, garden: gardenGroup };
}
