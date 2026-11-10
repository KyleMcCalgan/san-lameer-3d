// HUD, floor-plan map, room selector and reference-photo viewer.
import { rooms, outsideRoom, roomAt, spawnHeight, STAIR } from './layout.js';

const $ = id => document.getElementById(id);

export class UI {
  constructor(walker, onStart) {
    this.w = walker;
    this.current = null;
    this.mapLevel = 'G';
    this.isTouch = walker.isTouch;
    document.body.classList.toggle('touch', this.isTouch);

    // ----- start / pause -----
    $('enterBtn').addEventListener('click', () => this.start());
    $('resumeHint').addEventListener('click', () => this.w.lock());
    walker.onLockChange = locked => {
      $('resumeHint').hidden = locked || !this.started || this.panelOpen() || this.isTouch;
      document.body.classList.toggle('locked', locked);
    };

    // ----- buttons -----
    $('btnMap').addEventListener('click', () => this.toggleMap());
    $('btnPhotos').addEventListener('click', () => this.togglePhotos());
    $('btnReset').addEventListener('click', () => this.reset());
    $('mapClose').addEventListener('click', () => this.toggleMap(false));
    $('photosClose').addEventListener('click', () => this.togglePhotos(false));
    $('lightbox').addEventListener('click', () => { $('lightbox').hidden = true; });
    document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
      this.mapLevel = b.dataset.level; this.drawMap();
    }));

    // ----- room selector -----
    const sel = $('roomSelect');
    const groups = { G: 'Ground floor', U: 'Upper floor', O: 'Outside' };
    for (const lvl of ['G', 'U', 'O']) {
      const og = document.createElement('optgroup');
      og.label = groups[lvl];
      for (const r of [...rooms, outsideRoom].filter(r => r.level === lvl && r.id !== 'stairs')) {
        const o = document.createElement('option');
        o.value = r.id;
        o.textContent = r.name + (r.evidence === 'inferred' ? ' (inferred)' : '');
        og.appendChild(o);
      }
      sel.appendChild(og);
    }
    sel.addEventListener('change', () => {
      const r = [...rooms, outsideRoom].find(r => r.id === sel.value);
      if (r) this.goToRoom(r);
      sel.blur();
    });

    // ----- keyboard -----
    addEventListener('keydown', e => {
      if (!this.started || e.repeat) return;
      if (e.target && e.target.tagName === 'SELECT') return;
      if (e.code === 'KeyM') this.toggleMap();
      else if (e.code === 'KeyR') this.reset();
      else if (e.code === 'KeyP') this.togglePhotos();
      else if (e.code === 'Escape') { this.toggleMap(false); this.togglePhotos(false); $('lightbox').hidden = true; }
    });

    // ----- map -----
    this.canvas = $('mapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.addEventListener('click', e => this.mapClick(e));
    addEventListener('resize', () => this.drawMap());

    if (this.isTouch) walker.attachJoystick($('joyBase'), $('joyKnob'));
    this.onStart = onStart;
  }

  panelOpen() { return !$('mapPanel').hidden || !$('photosPanel').hidden; }

  start() {
    this.started = true;
    $('startScreen').hidden = true;
    document.body.classList.add('started');
    this.w.enabled = true;
    this.w.lock();
    this.onStart && this.onStart();
  }

  reset() {
    this.goToRoom(rooms.find(r => r.id === 'entry'));
  }

  goToRoom(r) {
    const [x, z, yaw] = r.spawn;
    this.w.teleport(x, z, spawnHeight(r) + 0.01, yaw, 0);
    this.flash(r.name);
  }

  goToView(v) {
    const [x, eye, z, yaw, pitch] = v;
    this.w.teleport(x, z, eye - 1.5, yaw, pitch);
    this.togglePhotos(false);
    this.toggleMap(false);
    this.flash('Photo viewpoint');
  }

  flash(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), 1400);
  }

  togglePanel(id, force) {
    const p = $(id);
    const open = force === undefined ? p.hidden : force;
    p.hidden = !open;
    if (open) {
      this.w.unlock();
      $('resumeHint').hidden = true;
    } else if (this.started && !this.panelOpen() && !this.isTouch) {
      $('resumeHint').hidden = this.w.locked;
    }
    return open;
  }

  toggleMap(force) {
    if (this.togglePanel('mapPanel', force)) {
      this.togglePanel('photosPanel', false);
      this.mapLevel = this.w.feet > 1.4 ? 'U' : 'G';
      this.drawMap();
    }
  }

  togglePhotos(force) {
    if (this.togglePanel('photosPanel', force)) {
      this.togglePanel('mapPanel', false);
      this.renderPhotos();
    }
  }

  renderPhotos() {
    const r = this.current || outsideRoom;
    $('photosTitle').textContent = r.name;
    const list = $('photosList');
    list.innerHTML = '';
    if (!r.photos.length) {
      list.innerHTML = `<p class="muted">No listing photograph shows this space. Its size and position are inferred. Open <b>LAYOUT_ASSUMPTIONS.md</b> for the reasoning.</p>`;
      return;
    }
    for (const p of r.photos) {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = p.src; img.alt = p.caption; img.loading = 'lazy';
      img.addEventListener('click', () => { $('lightboxImg').src = p.src; $('lightboxCap').textContent = p.caption; $('lightbox').hidden = false; });
      const cap = document.createElement('figcaption');
      cap.textContent = p.caption;
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = 'Stand where the photo was taken';
      btn.addEventListener('click', () => this.goToView(p.view));
      fig.append(img, cap, btn);
      list.appendChild(fig);
    }
  }

  // ---------- map ----------
  mapTransform() {
    const c = this.canvas, dpr = Math.min(devicePixelRatio || 1, 2);
    const cw = c.clientWidth, ch = c.clientHeight;
    if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) {
      c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr);
    }
    const bx0 = -0.6, bz0 = -6.3, bx1 = 20.4, bz1 = 11.9;
    const s = Math.min(cw / (bx1 - bx0), ch / (bz1 - bz0));
    const ox = (cw - (bx1 - bx0) * s) / 2 - bx0 * s, oz = (ch - (bz1 - bz0) * s) / 2 - bz0 * s;
    return { s, ox, oz, dpr };
  }

  drawMap() {
    if ($('mapPanel').hidden) return;
    document.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('active', b.dataset.level === this.mapLevel));
    const { s, ox, oz, dpr } = this.T = this.mapTransform();
    const g = this.ctx, X = x => ox + x * s, Z = z => oz + z * s;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    const css = getComputedStyle(document.documentElement);
    const col = n => css.getPropertyValue(n).trim();

    // ghost of the other floor
    for (const r of rooms) {
      if (r.level === this.mapLevel || r.id === 'stairs') continue;
      g.strokeStyle = col('--map-ghost'); g.lineWidth = 1; g.setLineDash([3, 3]);
      for (const [x0, z0, x1, z1] of r.rects) g.strokeRect(X(x0), Z(z0), (x1 - x0) * s, (z1 - z0) * s);
    }
    g.setLineDash([]);
    for (const r of rooms) {
      if (r.level !== this.mapLevel) continue;
      const here = this.current && this.current.id === r.id;
      const inferred = r.evidence === 'inferred';
      r.rects.forEach(([x0, z0, x1, z1], i) => {
        g.fillStyle = here ? col('--map-here') : inferred ? col('--map-inferred') : r.id === 'patio' ? col('--map-patio') : col('--map-room');
        g.fillRect(X(x0), Z(z0), (x1 - x0) * s, (z1 - z0) * s);
        if (i === 0) { g.strokeStyle = col('--map-wall'); g.lineWidth = 1.5; g.strokeRect(X(x0), Z(z0), (x1 - x0) * s, (z1 - z0) * s); }
      });
      if (r.id === 'stairs') {
        g.strokeStyle = col('--map-wall'); g.lineWidth = 1;
        for (let x = STAIR.x0; x < STAIR.x1; x += 0.25) { g.beginPath(); g.moveTo(X(x), Z(STAIR.z0)); g.lineTo(X(x), Z(STAIR.z1)); g.stroke(); }
        continue;
      }
      const big = r.rects.reduce((a, b) => (b[2] - b[0]) * (b[3] - b[1]) > (a[2] - a[0]) * (a[3] - a[1]) ? b : a);
      const cx = X((big[0] + big[2]) / 2), cz = Z((big[1] + big[3]) / 2);
      const words = (r.short || r.name).replace(' (inferred)', '').split(' (');
      g.fillStyle = col('--map-text');
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const maxW = (big[2] - big[0]) * s * 0.9;
      let fs = Math.max(9, Math.min(13, s * 0.36));
      g.font = `600 ${fs}px system-ui, sans-serif`;
      while (g.measureText(words[0]).width > maxW && fs > 7) { fs -= 0.5; g.font = `600 ${fs}px system-ui, sans-serif`; }
      g.fillText(words[0], cx, cz - (words[1] ? fs * 0.55 : 0));
      if (words[1]) { g.font = `${fs * 0.85}px system-ui, sans-serif`; g.fillText('(' + words[1], cx, cz + fs * 0.6); }
      if (inferred) { g.font = `italic ${fs * 0.8}px system-ui, sans-serif`; g.fillText('inferred', cx, cz + fs * 1.5); }
    }
    if (this.mapLevel === 'G') {
      g.fillStyle = col('--map-text'); g.font = `11px system-ui, sans-serif`; g.textAlign = 'center';
      g.fillText('▲ Front door & steps', X(4.95), Z(-2.4));
      g.fillText('Garden ▼', X(13.2), Z(11.6)); g.fillText('▲ Garden door & steps', X(11.7), Z(-5.6));
    } else {
      g.fillStyle = col('--map-text'); g.font = `11px system-ui, sans-serif`; g.textAlign = 'center';
      g.fillText('Open to lounge below', X(8.0), Z(5.6)); g.fillText('(vaulted ceiling)', X(8.0), Z(6.4));
    }
    // player
    const lvl = this.w.feet > 1.4 ? 'U' : 'G';
    if (lvl === this.mapLevel || (this.mapLevel === 'G' && this.w.feet < 0)) {
      const px = X(this.w.x), pz = Z(this.w.z);
      const a = -this.w.yaw - Math.PI / 2; // world -z is "up" on the map
      g.fillStyle = col('--accent-soft');
      g.beginPath(); g.moveTo(px, pz);
      g.arc(px, pz, 26, a - 0.55, a + 0.55); g.closePath(); g.fill();
      g.fillStyle = col('--accent');
      g.beginPath(); g.arc(px, pz, 5.5, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
    }
  }

  mapClick(e) {
    const b = this.canvas.getBoundingClientRect();
    const { s, ox, oz } = this.T || this.mapTransform();
    const x = (e.clientX - b.left - ox) / s, z = (e.clientY - b.top - oz) / s;
    const r = rooms.find(r => r.level === this.mapLevel && r.rects.some(([x0, z0, x1, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1));
    if (r) {
      this.goToRoom(r);
      this.toggleMap(false);
    }
  }

  // ---------- per frame ----------
  update() {
    const r = roomAt(this.w.x, this.w.z, this.w.feet);
    if (r !== this.current) {
      this.current = r;
      $('roomName').textContent = r.name;
      const badge = $('roomBadge');
      const inferred = r.evidence === 'inferred';
      badge.textContent = inferred ? 'Inferred space' : r.photos.length ? `${r.photos.length} photo${r.photos.length > 1 ? 's' : ''}` : '';
      badge.className = 'badge' + (inferred ? ' inferred' : '');
      $('btnPhotos').classList.toggle('dim', !r.photos.length);
      if (r.id !== 'stairs') $('roomSelect').value = r.id;
      if (!$('photosPanel').hidden) this.renderPhotos();
    }
    if (!$('mapPanel').hidden) this.drawMap();
  }
}
