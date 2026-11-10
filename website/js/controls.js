// First-person walkthrough controller: pointer-lock mouse look, WASD, touch
// joystick + drag-look, collision against axis-aligned boxes, stair following.
import { floorHeight, BOUNDS } from './layout.js';

const EYE = 1.68;           // eye height (m)
const RADIUS = 0.24;        // body radius (m)
const WALK = 1.8;           // m/s – brisk walking pace
const FAST = 3.6;           // m/s – with Shift
const STEP = 0.35;          // obstacles lower than this above the feet are ignored
const HEAD = 1.8;

export class Walker {
  constructor(camera, dom, colliders) {
    this.camera = camera;
    this.dom = dom;
    this.x = 0; this.z = 0; this.feet = 0;
    this.yaw = 0; this.pitch = 0;
    this.keys = new Set();
    this.joy = { x: 0, y: 0 };
    this.enabled = false;
    this.locked = false;
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    camera.rotation.order = 'YXZ';
    this.buildGrid(colliders);
    this.bindKeyboard();
    this.bindMouse();
    if (this.isTouch) this.bindTouchLook();
  }

  // ---------- spatial hash for colliders ----------
  buildGrid(colliders) {
    this.cell = 2;
    this.grid = new Map();
    colliders.forEach((c, i) => {
      for (let gx = Math.floor(c.minX / this.cell); gx <= Math.floor(c.maxX / this.cell); gx++)
        for (let gz = Math.floor(c.minZ / this.cell); gz <= Math.floor(c.maxZ / this.cell); gz++) {
          const k = gx + ',' + gz;
          if (!this.grid.has(k)) this.grid.set(k, []);
          this.grid.get(k).push(c);
        }
    });
  }

  nearby(x, z) {
    const out = new Set();
    const gx = Math.floor(x / this.cell), gz = Math.floor(z / this.cell);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const l = this.grid.get(gx + i + ',' + (gz + j));
      if (l) l.forEach(c => out.add(c));
    }
    return out;
  }

  resolve(x, z, feet) {
    const lo = feet + STEP, hi = feet + HEAD;
    const list = this.nearby(x, z);
    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const c of list) {
        if (c.maxY <= lo || c.minY >= hi) continue;
        const px = Math.max(c.minX, Math.min(x, c.maxX));
        const pz = Math.max(c.minZ, Math.min(z, c.maxZ));
        let dx = x - px, dz = z - pz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= RADIUS * RADIUS) continue;
        if (d2 > 1e-10) {
          const d = Math.sqrt(d2), push = RADIUS - d;
          x += (dx / d) * push; z += (dz / d) * push;
        } else {
          // centre inside the box: push out along the shallowest axis
          const ex = [c.minX - RADIUS - x, c.maxX + RADIUS - x], ez = [c.minZ - RADIUS - z, c.maxZ + RADIUS - z];
          const bx = Math.abs(ex[0]) < Math.abs(ex[1]) ? ex[0] : ex[1];
          const bz = Math.abs(ez[0]) < Math.abs(ez[1]) ? ez[0] : ez[1];
          if (Math.abs(bx) < Math.abs(bz)) x += bx; else z += bz;
        }
        moved = true;
      }
      if (!moved) break;
    }
    return [x, z];
  }

  // ---------- input ----------
  bindKeyboard() {
    addEventListener('keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      this.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) && this.enabled) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  bindMouse() {
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      this.onLockChange && this.onLockChange(this.locked);
    });
    document.addEventListener('mousemove', e => {
      if (!this.locked) return;
      // ignore the occasional huge spike some browsers report when the pointer is locked
      if (Math.abs(e.movementX) > 250 || Math.abs(e.movementY) > 250) return;
      this.look(e.movementX * 0.0022, e.movementY * 0.0022);
    });
    // drag-to-look fallback when the pointer is not locked (desktop)
    let drag = null;
    this.dom.addEventListener('mousedown', e => {
      if (this.locked || !this.enabled) return;
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
    });
    addEventListener('mousemove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.x = e.clientX; drag.y = e.clientY;
      this.look(dx * 0.004, dy * 0.004);
    });
    addEventListener('mouseup', () => {
      if (drag && drag.moved < 4 && this.enabled && !this.isTouch) this.lock();
      drag = null;
    });
  }

  bindTouchLook() {
    let id = null, lx = 0, ly = 0;
    this.dom.addEventListener('touchstart', e => {
      if (id !== null) return;
      const t = e.changedTouches[0];
      id = t.identifier; lx = t.clientX; ly = t.clientY;
    }, { passive: true });
    this.dom.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) if (t.identifier === id) {
        this.look((t.clientX - lx) * 0.006, (t.clientY - ly) * 0.006);
        lx = t.clientX; ly = t.clientY;
      }
      e.preventDefault();
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) if (t.identifier === id) id = null; };
    this.dom.addEventListener('touchend', end);
    this.dom.addEventListener('touchcancel', end);
  }

  // Virtual joystick element (bottom-left on touch devices).
  attachJoystick(base, knob) {
    let id = null, cx = 0, cy = 0;
    const R = () => base.clientWidth / 2;
    const set = (px, py) => {
      let dx = px - cx, dy = py - cy;
      const r = R(), d = Math.hypot(dx, dy);
      if (d > r) { dx *= r / d; dy *= r / d; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joy.x = dx / r; this.joy.y = dy / r;
    };
    base.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      id = t.identifier;
      const b = base.getBoundingClientRect();
      cx = b.left + b.width / 2; cy = b.top + b.height / 2;
      set(t.clientX, t.clientY);
    }, { passive: false });
    base.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === id) set(t.clientX, t.clientY);
    }, { passive: false });
    const end = e => {
      for (const t of e.changedTouches) if (t.identifier === id) {
        id = null; this.joy.x = this.joy.y = 0; knob.style.transform = '';
      }
    };
    base.addEventListener('touchend', end);
    base.addEventListener('touchcancel', end);
  }

  lock() {
    if (this.isTouch) return;
    const p = this.dom.requestPointerLock && this.dom.requestPointerLock();
    if (p && p.catch) p.catch(() => {});
  }
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); }

  look(dx, dy) {
    if (!this.enabled) return;
    this.yaw -= dx;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy));
  }

  teleport(x, z, feet, yawDeg = 0, pitchDeg = 0) {
    this.x = x; this.z = z;
    this.feet = floorHeight(x, z, feet);
    this.yaw = (yawDeg * Math.PI) / 180;
    this.pitch = (pitchDeg * Math.PI) / 180;
    this.apply();
  }

  // ---------- per-frame ----------
  update(dt) {
    if (this.enabled) {
      let f = 0, s = 0;
      const k = this.keys;
      if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
      if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
      if (k.has('KeyA')) s -= 1;
      if (k.has('KeyD')) s += 1;
      if (k.has('ArrowLeft')) this.yaw += 1.8 * dt;
      if (k.has('ArrowRight')) this.yaw -= 1.8 * dt;
      let speed = k.has('ShiftLeft') || k.has('ShiftRight') ? FAST : WALK;
      if (this.joy.x || this.joy.y) {
        f = -this.joy.y; s = this.joy.x;
        speed = WALK * 1.25;
      }
      const len = Math.hypot(f, s);
      if (len > 1) { f /= len; s /= len; }
      if (len > 0.02) {
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
        const vx = (-sin * f + cos * s) * speed, vz = (-cos * f - sin * s) * speed;
        const steps = Math.ceil((Math.hypot(vx, vz) * dt) / 0.08) || 1;
        for (let i = 0; i < steps; i++) {
          let nx = this.x + (vx * dt) / steps, nz = this.z + (vz * dt) / steps;
          // refuse moves onto ground that is much higher than us (walls of plinths etc.)
          const h = floorHeight(nx, nz, this.feet);
          if (h - this.feet > 0.45) { nx = this.x; nz = this.z; }
          [nx, nz] = this.resolve(nx, nz, this.feet);
          nx = Math.max(BOUNDS[0], Math.min(BOUNDS[2], nx));
          nz = Math.max(BOUNDS[1], Math.min(BOUNDS[3], nz));
          this.x = nx; this.z = nz;
        }
      }
    }
    // follow floor smoothly (stairs, steps)
    const target = floorHeight(this.x, this.z, this.feet);
    const diff = target - this.feet;
    this.feet += Math.abs(diff) < 0.002 ? diff : diff * Math.min(1, dt * 14);
    this.apply();
  }

  apply() {
    this.camera.position.set(this.x, this.feet + EYE, this.z);
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
