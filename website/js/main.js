import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { initMaterials, colliders, M } from './builder.js';
import { buildVilla } from './villa.js';
import { Walker } from './controls.js';
import { UI } from './ui.js';
import { ModelView } from './model.js';

const status = document.getElementById('loadStatus');
const setStatus = t => { if (status) status.textContent = t; };
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));

async function init() {
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch && devicePixelRatio < 1.5, powerPreference: 'high-performance' });
  // Render resolution: capped, then adapted to the measured frame rate (see loop below).
  const maxRatio = Math.min(devicePixelRatio || 1, isTouch ? 1.25 : 1.5);
  let ratio = maxRatio;
  renderer.setPixelRatio(ratio);
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;   // the villa is static: render the shadow map once

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd8e8f2, 45, 140);
  const camera = new THREE.PerspectiveCamera(isTouch ? 75 : 70, innerWidth / innerHeight, 0.05, 400);

  setStatus('Preparing materials…');
  await nextFrame();
  initMaterials();

  // ---------- sky ----------
  const skyGeo = new THREE.SphereGeometry(300, 24, 12);
  const cols = [], top = new THREE.Color(0x6fa8dc), hor = new THREE.Color(0xe4f0f7), gnd = new THREE.Color(0x9fb78a);
  const p = skyGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const h = p.getY(i) / 300;
    const c = h > 0 ? hor.clone().lerp(top, Math.pow(h, 0.6)) : hor.clone().lerp(gnd, Math.min(1, -h * 4));
    cols.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  scene.add(new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));

  // ---------- lighting: soft daylight + warm interior fill ----------
  // No point lights: they cost per-pixel work on every surface. A warm ambient term stands in for them.
  scene.add(new THREE.HemisphereLight(0xeaf3ff, 0xc9a27e, 1.7));
  scene.add(new THREE.AmbientLight(0xffe6c8, 0.55));
  // KZN south coast is in the southern hemisphere: the sun sits to the north.
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sun.position.set(2, 22, -12);
  sun.target.position.set(8.5, 0, 6.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  setStatus('Building the villa…');
  await nextFrame();
  const { villa, garden } = buildVilla(scene);

  setStatus('Optimising geometry…');
  await nextFrame();
  mergeStatic(scene, [villa, garden]);
  scene.matrixAutoUpdate = false;
  scene.traverse(o => { if (o !== camera) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
  scene.updateMatrixWorld(true);
  renderer.shadowMap.needsUpdate = true;

  // ---------- controls + UI ----------
  const walker = new Walker(camera, canvas, colliders);
  const ui = new UI(walker);
  ui.reset();
  walker.enabled = false;

  let dirty = true;
  const model = new ModelView({ camera, renderer, scene, walker, ui, canvas, invalidate: () => { dirty = true; } });
  ui.model = model;
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    dirty = true;
  });

  // gentle idle orbit of the view behind the start screen
  const clock = new THREE.Clock();
  let firstFrame = true;
  const lastPose = new Float64Array(5);
  let slowTime = 0, fastTime = 0, frames = 0, acc = 0;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!ui.started) walker.yaw += dt * 0.05;
    if (!model.update(dt)) { walker.update(dt); ui.update(); }
    // Only redraw when the view actually changed (saves GPU/battery while standing still).
    const pose = [camera.position.x, camera.position.y, camera.position.z, camera.rotation.x, camera.rotation.y];
    let moved = dirty;
    for (let i = 0; i < 5; i++) if (Math.abs(pose[i] - lastPose[i]) > 1e-5) { moved = true; lastPose[i] = pose[i]; }
    if (!moved) return;
    dirty = false;
    renderer.render(scene, camera);
    // Adaptive resolution: drop the pixel ratio when frames are slow, restore it when fast.
    frames++; acc += dt;
    if (acc > 1) {
      const fps = frames / acc;
      frames = 0; acc = 0;
      if (fps < 40) { slowTime++; fastTime = 0; } else if (fps > 57) { fastTime++; slowTime = 0; }
      if (slowTime >= 1 && ratio > 0.6) { ratio = Math.max(0.6, ratio - 0.2); renderer.setPixelRatio(ratio); slowTime = 0; dirty = true; }
      else if (fastTime >= 4 && ratio < maxRatio) { ratio = Math.min(maxRatio, ratio + 0.1); renderer.setPixelRatio(ratio); fastTime = 0; dirty = true; }
    }
    if (firstFrame) {
      firstFrame = false;
      document.getElementById('loading').classList.add('done');
      document.getElementById('enterBtn').disabled = false;
      document.getElementById('modelBtn').disabled = false;
    }
  });

  // debugging / automated testing hook
  window.__villa = { walker, ui, scene, renderer, camera, colliders, model };
}

// Merge all static meshes per material to cut draw calls (~1500 meshes -> ~60).
function mergeStatic(scene, groups) {
  const buckets = new Map();
  const add = (mat, geo) => {
    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(geo);
  };
  const clean = g => {
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals();
    g.clearGroups();
    return g;
  };
  for (const root of groups) {
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if (!o.isMesh) return;
      const geo = o.geometry;
      if (Array.isArray(o.material)) {
        for (const gr of geo.groups) {
          const sub = new THREE.BufferGeometry();
          for (const k of ['position', 'normal', 'uv']) sub.setAttribute(k, geo.attributes[k]);
          sub.setIndex(Array.from(geo.index.array.slice(gr.start, gr.start + gr.count)));
          const ni = clean(sub.toNonIndexed());
          ni.applyMatrix4(o.matrixWorld);
          add(o.material[gr.materialIndex], ni);
        }
      } else {
        const ni = clean(geo.index ? geo.toNonIndexed() : geo.clone());
        ni.applyMatrix4(o.matrixWorld);
        add(o.material, ni);
      }
    });
    scene.remove(root);
  }
  for (const [mat, list] of buckets) {
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mat);
    const transparent = mat.transparent;
    mesh.castShadow = !transparent && mat !== M.lawn;
    mesh.receiveShadow = !transparent;
    if (transparent) mesh.renderOrder = 2;
    scene.add(mesh);
    list.forEach(g => g.dispose());
  }
}

init().catch(err => {
  console.error(err);
  setStatus('Sorry – the 3D view failed to load: ' + err.message);
});
