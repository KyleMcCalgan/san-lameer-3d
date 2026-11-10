// Procedural furniture modelled on the listing photographs.
// Each builder returns a THREE.Group in local space: origin on the floor at the
// item's centre, "front" facing local +z.  Use place() to position + orient.
import { THREE, M, box, bmm, cyl, sphere, solid } from './builder.js';

export const FACE = { S: 0, E: Math.PI / 2, N: Math.PI, W: -Math.PI / 2 };

export function place(parent, g, x, y, z, rot = 0, collide = true) {
  g.position.set(x, y, z);
  g.rotation.y = rot;
  parent.add(g);
  if (collide) solid(g);
  return g;
}

// ---------------- bedroom ----------------
function spindleHeadboard(g, w, z, h = 1.05) {
  const m = M.whitePaint;
  cyl(0.035, 0.035, h, m, -w / 2, h / 2, z, g, 8);
  cyl(0.035, 0.035, h, m, w / 2, h / 2, z, g, 8);
  sphere(0.045, m, -w / 2, h + 0.03, z, g);
  sphere(0.045, m, w / 2, h + 0.03, z, g);
  box(w, 0.06, 0.04, m, 0, h - 0.08, z, g);
  box(w, 0.05, 0.04, m, 0, 0.62, z, g);
  const n = Math.round(w / 0.1);
  for (let i = 1; i < n; i++) box(0.025, h - 0.72, 0.025, m, -w / 2 + (i * w) / n, 0.62 + (h - 0.72) / 2, z, g);
}

function towels(g, x, y, z, n = 2) {
  for (let i = 0; i < n; i++) {
    const t = cyl(0.06, 0.06, 0.32, M.linen, x - 0.08 + i * 0.16, y + 0.06, z, g, 10);
    t.rotation.x = Math.PI / 2;
  }
}

export function singleBed({ stripes = true, cushion = true } = {}) {
  const g = new THREE.Group();
  const W = 0.95, L = 1.95;
  bmm(-W / 2, 0.05, -L / 2, W / 2, 0.42, L / 2, M.baseBlack, g);
  bmm(-W / 2 + 0.01, 0.42, -L / 2 + 0.02, W / 2 - 0.01, 0.6, L / 2, M.linen, g);
  // duvet drapes over sides
  bmm(-W / 2 - 0.03, 0.3, -L / 2 + 0.45, W / 2 + 0.03, 0.62, L / 2 + 0.03, M.linen, g);
  box(0.62, 0.13, 0.36, M.linen, 0, 0.68, -L / 2 + 0.25, g);
  if (cushion) {
    const c = box(0.42, 0.4, 0.12, M.suzani, 0, 0.8, -L / 2 + 0.42, g);
    c.rotation.x = -0.35;
  }
  if (stripes) bmm(-W / 2 - 0.04, 0.32, L / 2 - 0.6, W / 2 + 0.04, 0.635, L / 2 - 0.15, M.stripes, g);
  towels(g, 0, 0.62, L / 2 - 0.4);
  spindleHeadboard(g, W + 0.06, -L / 2 - 0.03);
  return g;
}

export function kingBed() {
  const g = new THREE.Group();
  const W = 1.85, L = 2.05;
  bmm(-W / 2, 0.05, -L / 2, W / 2, 0.42, L / 2, M.baseBlack, g);
  bmm(-W / 2 - 0.04, 0.32, -L / 2 + 0.02, W / 2 + 0.04, 0.64, L / 2 + 0.04, M.linen, g);
  bmm(-W / 2 - 0.06, 0.25, L / 2 - 1.15, W / 2 + 0.06, 0.66, L / 2 + 0.07, M.blueThrow, g);
  for (const sx of [-0.45, 0.45]) {
    box(0.75, 0.15, 0.4, M.linen, sx, 0.72, -L / 2 + 0.28, g);
    const c = box(0.5, 0.48, 0.13, M.suzani, sx, 0.92, -L / 2 + 0.45, g);
    c.rotation.x = -0.3;
  }
  towels(g, -0.3, 0.66, 0.35);
  towels(g, 0.35, 0.66, 0.15);
  // upholstered white headboard
  bmm(-W / 2 - 0.05, 0.3, -L / 2 - 0.08, W / 2 + 0.05, 1.25, -L / 2, M.whiteWash, g);
  return g;
}

export function nightstand() {
  const g = new THREE.Group();
  bmm(-0.22, 0, -0.2, 0.22, 0.58, 0.2, M.whitePaint, g);
  bmm(-0.18, 0.4, 0.2, 0.18, 0.52, 0.21, M.whiteWash, g);
  cyl(0.06, 0.08, 0.04, M.orangeWood, 0, 0.6, 0, g, 10);
  cyl(0.025, 0.035, 0.32, M.orangeWood, 0, 0.78, 0, g, 8);
  cyl(0.11, 0.17, 0.2, M.lampShade, 0, 1.03, 0, g, 14);
  return g;
}

export function dressingTable(w = 1.5, mirror = 'wide') {
  const g = new THREE.Group();
  const m = M.whiteWash;
  bmm(-w / 2, 0.74, -0.24, w / 2, 0.79, 0.24, m, g);
  bmm(-w / 2 + 0.02, 0.6, -0.22, w / 2 - 0.02, 0.74, 0.22, m, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bmm(sx * (w / 2 - 0.06) - 0.03, 0, sz * 0.18 - 0.03, sx * (w / 2 - 0.06) + 0.03, 0.6, sz * 0.18 + 0.03, m, g);
  if (mirror === 'wide') {
    bmm(-w / 2 + 0.05, 0.85, -0.27, w / 2 - 0.05, 1.65, -0.22, m, g);
    bmm(-w / 2 + 0.12, 0.92, -0.215, w / 2 - 0.12, 1.58, -0.205, M.mirror, g);
  } else {
    bmm(-0.03, 0.79, -0.12, 0.03, 1.2, -0.08, M.whitePaint, g);
    const mm = cyl(0.17, 0.17, 0.02, M.mirror, 0, 1.14, -0.09, g, 20);
    mm.rotation.x = Math.PI / 2;
  }
  // stool
  bmm(-0.22, 0, 0.3, 0.22, 0.42, 0.62, m, g);
  bmm(-0.23, 0.42, 0.29, 0.23, 0.5, 0.63, M.linen, g);
  return g;
}

export function tubChair() {
  const g = new THREE.Group();
  bmm(-0.36, 0, -0.34, 0.36, 0.42, 0.34, M.linen, g);
  bmm(-0.38, 0.42, -0.36, 0.38, 0.8, -0.2, M.linen, g);
  bmm(-0.38, 0.42, -0.36, -0.26, 0.65, 0.34, M.linen, g);
  bmm(0.26, 0.42, -0.36, 0.38, 0.65, 0.34, M.linen, g);
  const c = box(0.36, 0.28, 0.1, M.cushionGrey, 0, 0.58, -0.12, g);
  c.rotation.x = -0.2;
  return g;
}

export function wardrobe(w = 2.0, h = 2.3) {
  const g = new THREE.Group();
  bmm(-w / 2, 0, -0.3, w / 2, h, 0.3, M.whitePaint, g);
  const n = Math.round(w / 0.5);
  for (let i = 0; i < n; i++) {
    const x0 = -w / 2 + (i * w) / n + 0.04, x1 = -w / 2 + ((i + 1) * w) / n - 0.04;
    bmm(x0, 0.12, 0.3, x1, h - 0.3, 0.315, M.whiteWash, g);
    sphere(0.025, M.cushionMustard, i % 2 ? x0 + 0.06 : x1 - 0.06, 1.2, 0.33, g);
  }
  return g;
}

export function airCon() {
  const g = new THREE.Group();
  bmm(-0.45, -0.15, -0.1, 0.45, 0.15, 0.1, M.appliance, g);
  bmm(-0.4, -0.15, 0.1, 0.4, -0.11, 0.105, M.black, g);
  return g;
}

export function painting(w, h, mat, frame = M.orangeWood) {
  const g = new THREE.Group();
  bmm(-w / 2, -h / 2, -0.02, w / 2, h / 2, 0.01, frame, g);
  bmm(-w / 2 + 0.05, -h / 2 + 0.05, 0.01, w / 2 - 0.05, h / 2 - 0.05, 0.015, mat, g);
  return g;
}

// Curtain pair + rod for a window opening of width w (local x), top at y.
export function curtains(w, y, drop = 2.2) {
  const g = new THREE.Group();
  cyl(0.015, 0.015, w + 0.5, M.chrome, 0, y + 0.1, 0.08, g, 6).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) bmm(s * (w / 2 + 0.05) - 0.18, y + 0.1 - drop, 0.04, s * (w / 2 + 0.05) + 0.18, y + 0.08, 0.13, M.curtain, g);
  return g;
}

export function romanBlind(w) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) bmm(-w / 2, -0.12 * (i + 1), 0, w / 2, -0.12 * i, 0.06 + i * 0.015, M.blind, g);
  return g;
}

export function julietRail(w, h = 1.0) {
  const g = new THREE.Group();
  box(w, 0.06, 0.08, M.timber, 0, h, 0, g);
  box(w, 0.05, 0.06, M.timber, 0, 0.12, 0, g);
  const n = Math.round(w / 0.13);
  for (let i = 0; i <= n; i++) box(0.035, h - 0.12, 0.035, M.timber, -w / 2 + (i * w) / n, (h + 0.12) / 2, 0, g);
  return g;
}

// ---------------- living ----------------
function leatherSeat(g, w, d = 0.95) {
  const L = M.navyLeather;
  bmm(-w / 2, 0.08, -d / 2, w / 2, 0.45, d / 2, L, g);           // base
  bmm(-w / 2, 0.45, -d / 2, w / 2, 1.0, -d / 2 + 0.28, L, g);     // back
  bmm(-w / 2, 0.45, -d / 2, -w / 2 + 0.22, 0.7, d / 2, L, g);      // arms
  bmm(w / 2 - 0.22, 0.45, -d / 2, w / 2, 0.7, d / 2, L, g);
  const n = Math.max(1, Math.round((w - 0.44) / 0.62));
  const sw = (w - 0.44) / n;
  for (let i = 0; i < n; i++) bmm(-w / 2 + 0.22 + i * sw + 0.01, 0.45, -d / 2 + 0.28, -w / 2 + 0.22 + (i + 1) * sw - 0.01, 0.56, d / 2 - 0.02, L, g);
  bmm(-w / 2 + 0.05, 0, -d / 2 + 0.05, w / 2 - 0.05, 0.08, d / 2 - 0.05, M.black, g);
}

export function sofa(w, cushionMat = M.tropical, cushions = 2) {
  const g = new THREE.Group();
  leatherSeat(g, w);
  for (let i = 0; i < cushions; i++) {
    const x = cushions === 1 ? 0 : -w / 4 + (i * w) / 2 / (cushions - 1) * 1;
    const c = box(0.45, 0.42, 0.13, cushionMat, cushions === 1 ? 0 : (i ? 1 : -1) * (w / 2 - 0.5), 0.75, -0.2, g);
    c.rotation.x = -0.25;
  }
  return g;
}

export function recliner() {
  const g = new THREE.Group();
  leatherSeat(g, 1.0, 1.0);
  const c = box(0.42, 0.4, 0.12, M.cushionMustard, 0, 0.75, -0.2, g);
  c.rotation.x = -0.25;
  return g;
}

export function coffeeTable(w = 1.2, d = 0.8) {
  const g = new THREE.Group();
  bmm(-w / 2, 0.38, -d / 2, w / 2, 0.44, d / 2, M.teak, g);
  const f = M.whitePaint, t = 0.025;
  for (const sx of [-1, 1]) {
    bmm(sx * w / 2 - t, 0, -d / 2, sx * w / 2, 0.38, -d / 2 + t, f, g);
    bmm(sx * w / 2 - t, 0, d / 2 - t, sx * w / 2, 0.38, d / 2, f, g);
    bmm(sx * w / 2 - t, 0, -d / 2, sx * w / 2, t, d / 2, f, g);
  }
  bmm(-0.2, 0.44, -0.14, 0.2, 0.5, 0.14, M.orangeWood, g); // wooden tray
  return g;
}

export function tvUnit() {
  const g = new THREE.Group();
  bmm(-0.8, 0.08, -0.22, 0.8, 0.6, 0.22, M.whiteWash, g);
  bmm(-0.75, 0, -0.2, 0.75, 0.08, 0.2, M.whiteWash, g);
  bmm(-0.6, 0.62, -0.05, 0.6, 1.32, -0.02, M.black, g);
  bmm(-0.58, 0.64, -0.02, 0.58, 1.3, -0.015, M.tvScreen, g);
  bmm(-0.15, 0.6, -0.1, 0.15, 0.62, 0.05, M.black, g);
  // lighthouse ornament
  cyl(0.04, 0.05, 0.3, M.whitePaint, -0.68, 0.75, 0, g, 8);
  // floating shelf with frames above
  bmm(-0.5, 1.68, -0.22, 0.5, 1.71, -0.02, M.whitePaint, g);
  const p1 = painting(0.24, 0.3, M.tropical); p1.position.set(0, 1.86, -0.18); g.add(p1);
  const p2 = painting(0.16, 0.2, M.monstera, M.whitePaint); p2.position.set(-0.35, 1.81, -0.18); g.add(p2);
  const p3 = painting(0.16, 0.18, M.tropical, M.orangeWood); p3.position.set(0.36, 1.8, -0.18); g.add(p3);
  return g;
}

// White slatted chair with riempie (woven) seat.
export function diningChair() {
  const g = new THREE.Group();
  const m = M.whitePaint;
  for (const sx of [-0.2, 0.2]) for (const sz of [-0.2, 0.2]) cyl(0.022, 0.022, 0.45, m, sx, 0.225, sz, g, 6);
  bmm(-0.22, 0.43, -0.22, 0.22, 0.48, 0.22, M.teak, g);
  for (const sx of [-0.2, 0.2]) cyl(0.022, 0.022, 0.55, m, sx, 0.75, -0.2, g, 6);
  bmm(-0.22, 0.98, -0.22, 0.22, 1.02, -0.18, m, g);
  for (let i = -2; i <= 2; i++) bmm(i * 0.07 - 0.015, 0.5, -0.215, i * 0.07 + 0.015, 0.98, -0.195, m, g);
  return g;
}

export function diningTable(w = 0.95, l = 2.0) {
  const g = new THREE.Group();
  bmm(-w / 2, 0.72, -l / 2, w / 2, 0.77, l / 2, M.teak, g);
  bmm(-w / 2 + 0.05, 0.62, -l / 2 + 0.05, w / 2 - 0.05, 0.72, l / 2 - 0.05, M.whitePaint, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.045, 0.035, 0.72, M.whitePaint, sx * (w / 2 - 0.1), 0.36, sz * (l / 2 - 0.1), g, 10);
  return g;
}

export function console_() {
  const g = new THREE.Group();
  bmm(-0.7, 0.78, -0.18, 0.7, 0.82, 0.18, M.teak, g);
  bmm(-0.68, 0.64, -0.16, 0.68, 0.78, 0.16, M.whitePaint, g);
  bmm(-0.62, 0.1, -0.14, 0.62, 0.13, 0.14, M.whitePaint, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.035, 0.03, 0.78, M.whitePaint, sx * 0.64, 0.39, sz * 0.13, g, 8);
  return g;
}

export function barStool() {
  const g = new THREE.Group();
  cyl(0.19, 0.19, 0.06, M.whitePaint, 0, 0.66, 0, g, 18);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const l = cyl(0.02, 0.025, 0.66, M.whitePaint, Math.cos(a) * 0.12, 0.33, Math.sin(a) * 0.12, g, 6);
    l.rotation.z = Math.cos(a) * 0.12; l.rotation.x = -Math.sin(a) * 0.12;
  }
  return g;
}

export function ceilingFan() {
  const g = new THREE.Group();
  cyl(0.015, 0.015, 0.35, M.whitePaint, 0, -0.17, 0, g, 6);
  cyl(0.09, 0.09, 0.1, M.whitePaint, 0, -0.38, 0, g, 12);
  for (let i = 0; i < 3; i++) {
    const b = box(0.62, 0.012, 0.11, M.whitePaint, 0, -0.38, 0);
    const p = new THREE.Group(); p.add(b); b.position.x = 0.38; p.rotation.y = (i * 2 * Math.PI) / 3; g.add(p);
  }
  return g;
}

export function trackLight(n = 3) {
  const g = new THREE.Group();
  bmm(-0.35, -0.03, -0.03, 0.35, 0, 0.03, M.whitePaint, g);
  for (let i = 0; i < n; i++) {
    const s = cyl(0.04, 0.045, 0.12, M.whitePaint, -0.25 + i * 0.25, -0.08, 0.04, g, 8);
    s.rotation.x = 0.6;
  }
  return g;
}

// ---------------- patio ----------------
export function patioTable(l = 2.6) {
  const g = new THREE.Group();
  bmm(-l / 2, 0.72, -0.48, l / 2, 0.78, 0.48, M.teak, g);
  bmm(-l / 2 + 0.06, 0.62, -0.42, l / 2 - 0.06, 0.72, 0.42, M.whiteWash, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bmm(sx * (l / 2 - 0.12) - 0.05, 0, sz * 0.36 - 0.05, sx * (l / 2 - 0.12) + 0.05, 0.72, sz * 0.36 + 0.05, M.whiteWash, g);
  return g;
}

export function bench(l = 2.4) {
  const g = new THREE.Group();
  bmm(-l / 2, 0.42, -0.19, l / 2, 0.47, 0.19, M.teak, g);
  for (const sx of [-1, 1]) bmm(sx * (l / 2 - 0.12) - 0.04, 0, -0.15, sx * (l / 2 - 0.12) + 0.04, 0.42, 0.15, M.whiteWash, g);
  bmm(-l / 2 + 0.1, 0.12, -0.03, l / 2 - 0.1, 0.17, 0.03, M.whiteWash, g);
  return g;
}

export function lounger() {
  const g = new THREE.Group();
  const s = M.steel;
  for (const sx of [-0.3, 0.3]) {
    bmm(sx - 0.015, 0.3, -0.95, sx + 0.015, 0.33, 0.6, s, g);
    bmm(sx - 0.015, 0, 0.5, sx + 0.015, 0.33, 0.53, s, g);
    bmm(sx - 0.015, 0, -0.62, sx + 0.015, 0.33, -0.59, s, g);
  }
  bmm(-0.3, 0.32, -0.95, 0.3, 0.34, 0.25, M.loungerFabric, g);
  const back = bmm(-0.3, 0, 0, 0.3, 0.02, 0.75, M.loungerFabric);
  const p = new THREE.Group(); p.position.set(0, 0.33, 0.25); p.rotation.x = -0.75; p.add(back); g.add(p);
  return g;
}

// ---------------- kitchen ----------------
export function fridge() {
  const g = new THREE.Group();
  bmm(-0.33, 0, -0.32, 0.33, 1.82, 0.32, M.steel, g);
  bmm(-0.32, 1.18, 0.32, 0.32, 1.19, 0.33, M.black, g);
  bmm(0.25, 0.4, 0.33, 0.27, 1.1, 0.36, M.chrome, g);
  return g;
}

export function washer(top = false) {
  const g = new THREE.Group();
  bmm(-0.3, 0, -0.3, 0.3, 0.85, 0.3, M.appliance, g);
  const d = cyl(0.2, 0.2, 0.03, top ? M.black : M.chrome, 0, 0.45, 0.31, g, 18);
  d.rotation.x = Math.PI / 2;
  return g;
}

// ---------------- bathroom ----------------
export function bathtub(l = 1.7) {
  const g = new THREE.Group();
  bmm(-l / 2 - 0.05, 0, -0.42, l / 2 + 0.05, 0.5, 0.42, M.bathWall, g); // tiled surround
  bmm(-l / 2 + 0.05, 0.5, -0.36, l / 2 - 0.05, 0.56, 0.36, M.porcelain, g);
  bmm(-l / 2 + 0.12, 0.3, -0.3, l / 2 - 0.12, 0.555, 0.3, M.porcelain, g);
  bmm(-l / 2 + 0.14, 0.42, -0.28, l / 2 - 0.14, 0.565, 0.28, M.appliance, g);
  bmm(-0.25, 0.6, 0.28, 0.25, 0.62, 0.3, M.chrome, g);
  bmm(l / 2 - 0.2, 0.56, -0.05, l / 2 - 0.12, 0.72, 0.05, M.chrome, g);
  return g;
}

export function toilet() {
  const g = new THREE.Group();
  bmm(-0.19, 0.4, -0.3, 0.19, 0.8, -0.12, M.porcelain, g);         // cistern
  cyl(0.13, 0.11, 0.4, M.porcelain, 0, 0.2, 0.05, g, 14);
  const s = cyl(0.19, 0.19, 0.04, M.porcelain, 0, 0.42, 0.06, g, 18); s.scale.z = 1.25;
  return g;
}

export function bidet() {
  const g = new THREE.Group();
  cyl(0.15, 0.12, 0.38, M.porcelain, 0, 0.19, 0, g, 14).scale.z = 1.3;
  bmm(-0.03, 0.38, -0.2, 0.03, 0.45, -0.14, M.chrome, g);
  return g;
}

export function basin() {
  const g = new THREE.Group();
  bmm(-0.45, 0, -0.25, 0.45, 0.84, 0.25, M.whitePaint, g);
  bmm(-0.47, 0.84, -0.26, 0.47, 0.88, 0.26, M.porcelain, g);
  bmm(-0.4, 1.0, -0.27, 0.4, 1.75, -0.25, M.mirror, g);  // mirror
  return g;
}

export function shower(w = 0.9, d = 0.9, h = 2.0) {
  // Corner shower: local origin at the open corner, glass on +x and +z sides
  const g = new THREE.Group();
  bmm(0, 0, 0, w, 0.06, d, M.porcelain, g);
  bmm(0, 0.06, d - 0.01, w, h, d + 0.01, M.glass, g);
  bmm(w - 0.01, 0.06, 0, w + 0.01, h, d, M.glass, g);
  bmm(w - 0.02, 0.06, d - 0.02, w + 0.02, h, d + 0.02, M.chrome, g);
  bmm(w - 0.03, 0.9, d * 0.5, w + 0.03, 1.2, d * 0.5 + 0.02, M.chrome, g);
  return g;
}

export function bin() {
  const g = new THREE.Group();
  cyl(0.12, 0.1, 0.3, M.blueBin, 0, 0.15, 0, g, 12);
  return g;
}

// ---------------- garden ----------------
export function palm(h = 7) {
  const g = new THREE.Group();
  const t = cyl(0.16, 0.25, h, M.trunk, 0, h / 2, 0, g, 8);
  t.rotation.z = 0.04;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const f = new THREE.Group();
    const leaf = box(2.6, 0.04, 0.5, i % 2 ? M.palmLeaf : M.leafLight, 1.3, 0, 0);
    f.add(leaf);
    f.position.set(0, h, 0);
    f.rotation.set(0, a, -0.35 - (i % 3) * 0.25);
    g.add(f);
  }
  return g;
}

export function broadTree(h = 7, r = 3.5) {
  const g = new THREE.Group();
  cyl(0.18, 0.3, h * 0.55, M.trunk, 0, h * 0.27, 0, g, 7);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.7;
    sphere(r * (0.55 + (i % 3) * 0.12), i % 2 ? M.leaf : M.leafLight,
      Math.cos(a) * r * 0.45, h * 0.6 + (i % 3) * r * 0.25, Math.sin(a) * r * 0.45, g, 1, 0.55, 1, 9);
  }
  return g;
}

export function shrub(r = 0.7) {
  const g = new THREE.Group();
  sphere(r, M.leaf, 0, r * 0.6, 0, g, 1, 0.8, 1, 8);
  return g;
}
