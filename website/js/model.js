// Interactive 3D model ("doll's house") view: orbit around the villa, cut it open
// floor by floor, see where you are, and drop back into the walkthrough anywhere.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { rooms, roomAt, floorHeight, spawnHeight } from './layout.js';

const $ = id => document.getElementById(id);
const EYE = 1.68;
const CENTER = new THREE.Vector3(9.8, 1.2, 3.6);
// Cutaway heights: everything of the villa above this height is hidden.
const LEVELS = {
  all: { cut: 1000, label: 'Whole house' },
  upper: { cut: 5.0, label: 'Upper floor' },
  ground: { cut: 2.5, label: 'Ground floor' },
};
// The cutaway only applies inside this box, so trees, neighbours and sky stay whole.
const BOX = { x0: -1, x1: 21, z0: -5.5, z1: 12 };
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class ModelView {
  constructor({ camera, renderer, scene, walker, ui, canvas, invalidate }) {
    Object.assign(this, { camera, renderer, scene, walker, ui, canvas, invalidate });
    this.active = false;
    this.level = 'ground';
    this.tween = null;
    this.walkFov = camera.fov;

    // ----- clipping: a box-limited horizontal cut (intersection of 5 half-spaces) -----
    this.cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);
    this.planes = [
      this.cutPlane,
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), BOX.x0),
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -BOX.x1),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), BOX.z0),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -BOX.z1),
    ];
    renderer.localClippingEnabled = true;
    scene.traverse(o => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) {
        m.clippingPlanes = this.planes;
        m.clipIntersection = true;
        m.clipShadows = true;
        m.needsUpdate = true;
      }
    });

    // ----- orbit controls -----
    const c = this.controls = new OrbitControls(camera, canvas);
    c.enabled = false;
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.minDistance = 6;
    c.maxDistance = 55;
    c.maxPolarAngle = Math.PI * 0.47;
    c.autoRotateSpeed = 0.6;
    c.target.copy(CENTER);
    c.addEventListener('start', () => this.hideWalkHere());

    // ----- "you are here" pin, drawn on top of everything -----
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xd9774a, depthTest: false, transparent: true });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    this.pin = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 16), pinMat);
    cone.rotation.x = Math.PI; cone.position.y = 0.6;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), pinMat);
    ball.position.y = 1.1;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 32), ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03;
    this.pin.add(cone, ball, ring);
    this.pin.traverse(o => { o.renderOrder = 10; });
    this.pin.visible = false;
    scene.add(this.pin);

    // a smaller marker where the "walk in here" bubble points
    this.target = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.34, 32), ringMat.clone());
    this.target.material.color.set(0xd9774a);
    this.target.rotation.x = -Math.PI / 2;
    this.target.renderOrder = 10;
    this.target.visible = false;
    scene.add(this.target);

    this.buildLabels();
    this.bindUI();
  }

  // ---------------------------------------------------------------- UI
  buildLabels() {
    const box = $('modelLabels');
    this.labels = [];
    for (const r of rooms) {
      if (r.id === 'stairs' || r.id === 'entry') continue;
      const [x0, z0, x1, z1] = r.rects[0];
      const b = document.createElement('button');
      b.className = 'mlabel';
      b.textContent = r.short || r.name.replace(/\s*\(.*\)$/, '');
      b.title = `Walk into ${r.name}`;
      b.addEventListener('click', e => { e.stopPropagation(); this.walkInto(r); });
      box.appendChild(b);
      this.labels.push({ el: b, room: r, pos: new THREE.Vector3((x0 + x1) / 2, spawnHeight(r) + 0.25, (z0 + z1) / 2) });
    }
  }

  bindUI() {
    document.querySelectorAll('[data-cut]').forEach(b => b.addEventListener('click', () => this.setLevel(b.dataset.cut)));
    $('modelSpin').addEventListener('click', () => {
      this.controls.autoRotate = !this.controls.autoRotate;
      $('modelSpin').classList.toggle('active', this.controls.autoRotate);
    });
    $('modelExit').addEventListener('click', () => this.exit());
    $('walkHere').addEventListener('click', e => { e.stopPropagation(); if (this.pick) this.walkTo(this.pick); });

    // click (not drag) on the model: offer to walk in at that spot
    let down = null;
    this.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    this.canvas.addEventListener('pointerup', e => {
      if (!this.active || this.tween || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved < 6) this.pickAt(e.clientX, e.clientY);
    });
  }

  setLevel(level) {
    this.level = level;
    document.querySelectorAll('[data-cut]').forEach(b => b.classList.toggle('active', b.dataset.cut === level));
    this.applyCut();
    this.hideWalkHere();
    $('roomBadge').textContent = LEVELS[level].label;
    this.updateLabels(true);
  }

  applyCut() {
    this.cutPlane.constant = this.active ? LEVELS[this.level].cut : 1000;
    this.renderer.shadowMap.needsUpdate = true;
    this.invalidate();
  }

  // ---------------------------------------------------------------- enter / exit
  toggle() { this.active ? this.exit() : this.enter(); }

  enter() {
    if (this.active || this.tween) return;
    this.active = true;
    this.walker.enabled = false;
    this.walker.unlock();
    this.ui.togglePanel('mapPanel', false);
    this.ui.togglePanel('photosPanel', false);
    document.body.classList.add('model');
    $('resumeHint').hidden = true;
    $('roomName').textContent = '3D model';
    this.setLevel(this.level);

    // fly out from the eye to an orbit pose looking over the house from the walker's side
    const cam = this.camera;
    const fromPos = cam.position.clone();
    const fromTgt = fromPos.clone().add(new THREE.Vector3(0, 0, -4).applyQuaternion(cam.quaternion));
    const dir = new THREE.Vector3(this.walker.x - CENTER.x, 0, this.walker.z - CENTER.z);
    if (dir.lengthSq() < 4) dir.set(0.6, 0, 1);
    dir.normalize();
    const far = cam.aspect < 1 ? 1.75 : 1;                  // portrait phones need to stand further back
    const toPos = CENTER.clone().addScaledVector(dir, 20 * far).add(new THREE.Vector3(0, 17 * far, 0));
    this.pin.position.set(this.walker.x, this.walker.feet, this.walker.z);
    this.pin.visible = true;
    this.startTween(fromPos, fromTgt, toPos, CENTER.clone(), 50, 1.4, () => {
      this.controls.target.copy(CENTER);
      this.controls.enabled = true;
      this.controls.update();
    });
  }

  // leave the model view and stand where the walker currently is
  exit() {
    if (!this.active || this.tween) return;
    this.walkTo({ x: this.walker.x, z: this.walker.z, feet: this.walker.feet, yaw: this.walker.yaw, pitch: 0 });
  }

  walkInto(room) {
    const [x, z, yaw] = room.spawn;
    this.walkTo({ x, z, feet: spawnHeight(room) + 0.01, yaw: (yaw * Math.PI) / 180, pitch: 0 });
  }

  // fly down into first person at a spot, then hand control back to the walker
  walkTo({ x, z, feet, yaw, pitch }) {
    if (!this.active || this.tween) return;
    this.hideWalkHere();
    this.controls.enabled = false;
    this.controls.autoRotate = false;
    $('modelSpin').classList.remove('active');
    const w = this.walker;
    w.teleport(x, z, feet, (yaw * 180) / Math.PI, (pitch * 180) / Math.PI);
    const eye = new THREE.Vector3(w.x, w.feet + EYE, w.z);
    const look = eye.clone().add(new THREE.Vector3(-Math.sin(w.yaw) * Math.cos(w.pitch), Math.sin(w.pitch), -Math.cos(w.yaw) * Math.cos(w.pitch)).multiplyScalar(4));
    const cam = this.camera;
    const fromTgt = this.controls.target.clone();
    this.startTween(cam.position.clone(), fromTgt, eye, look, this.walkFov, 1.3, () => {
      this.active = false;
      this.pin.visible = false;
      document.body.classList.remove('model');
      this.applyCut();
      this.updateLabels(true);
      cam.rotation.set(w.pitch, w.yaw, 0, 'YXZ');
      w.apply();
      w.enabled = true;
      this.ui.current = null;               // refresh the HUD room name
      if (!w.isTouch) $('resumeHint').hidden = false;
    });
  }

  startTween(fromPos, fromTgt, toPos, toTgt, toFov, dur, done) {
    this.tween = { t: 0, dur, fromPos, fromTgt, toPos, toTgt, fromFov: this.camera.fov, toFov, done };
  }

  // ---------------------------------------------------------------- picking
  pickAt(cx, cy) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1), this.camera);
    const cut = LEVELS[this.level].cut;
    const hits = ray.intersectObjects(this.scene.children, false);
    for (const h of hits) {
      const p = h.point;
      if (!h.object.material || h.object === this.target || h.object.material.side === THREE.BackSide) continue;
      if (p.y > cut && p.x > BOX.x0 && p.x < BOX.x1 && p.z > BOX.z0 && p.z < BOX.z1) continue; // clipped away
      // stand on the nearest walkable floor at that spot
      const feet = floorHeight(p.x, p.z, p.y + 0.3);
      if (p.y - feet > 1.2 || feet - p.y > 0.5) { this.hideWalkHere(); return; } // a wall top / furniture: ignore
      const [x, z] = this.walker.resolve(p.x, p.z, feet);
      const r = roomAt(x, z, feet);
      const yaw = Math.atan2(-(CENTER.x - this.camera.position.x), -(CENTER.z - this.camera.position.z));
      this.pick = { x, z, feet: feet + 0.01, yaw, pitch: 0 };
      this.target.position.set(x, feet + 0.04, z);
      this.target.visible = true;
      $('walkHereRoom').textContent = r.name;
      $('walkHere').hidden = false;
      this.placeWalkHere();
      this.invalidate();
      return;
    }
    this.hideWalkHere();
  }

  placeWalkHere() {
    if ($('walkHere').hidden) return;
    const v = this.target.position.clone().project(this.camera);
    const el = $('walkHere');
    el.style.transform = `translate(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px) translate(-50%, calc(-100% - 14px))`;
  }

  hideWalkHere() {
    $('walkHere').hidden = true;
    if (this.target.visible) { this.target.visible = false; this.invalidate(); }
    this.pick = null;
  }

  // ---------------------------------------------------------------- per frame
  updateLabels(force) {
    const show = this.active && !this.tween && this.level !== 'all';
    for (const l of this.labels) {
      const r = l.room;
      const onLevel = this.level === 'upper' ? r.level === 'U' : r.level === 'G';
      if (!show || !onLevel) { if (force || l.shown) { l.el.style.display = 'none'; l.shown = false; } continue; }
      const v = l.pos.clone().project(this.camera);
      if (v.z > 1) { l.el.style.display = 'none'; l.shown = false; continue; }
      l.el.style.display = '';
      l.shown = true;
      l.el.style.transform = `translate(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px) translate(-50%, -50%)`;
    }
  }

  // returns true while this view owns the camera
  update(dt) {
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + dt / tw.dur);
      const k = ease(tw.t);
      const cam = this.camera;
      cam.position.lerpVectors(tw.fromPos, tw.toPos, k);
      cam.lookAt(new THREE.Vector3().lerpVectors(tw.fromTgt, tw.toTgt, k));
      cam.fov = tw.fromFov + (tw.toFov - tw.fromFov) * k;
      cam.updateProjectionMatrix();
      if (tw.t >= 1) { this.tween = null; tw.done(); this.updateLabels(true); }
      return true;
    }
    if (!this.active) return false;
    this.controls.update();
    // keep the orbit centre near the house
    const t = this.controls.target;
    t.x = Math.max(-2, Math.min(22, t.x)); t.z = Math.max(-6, Math.min(13, t.z)); t.y = Math.max(0, Math.min(5, t.y));
    this.updateLabels();
    this.placeWalkHere();
    return true;
  }
}

