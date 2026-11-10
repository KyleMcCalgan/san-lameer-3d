// Procedural canvas textures (no external image assets).
// Every texture is drawn to represent `metres` x `metres` of real surface,
// and geometry UVs are expressed in metres, so repeat = 1 / metres.
import * as THREE from 'three';

let seed = 1337;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function make(size, metres, draw, { srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / metres, 1 / metres);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `rgb(${r|0},${g|0},${b|0})`;
}

function noise(g, s, alpha, count) {
  for (let i = 0; i < count; i++) {
    const v = rand() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${alpha * rand()})`;
    g.fillRect(rand() * s, rand() * s, 1 + rand() * 2, 1 + rand() * 2);
  }
}

// Planks running along U. plankW = plank width in metres.
function planks(base, metres, plankW, plankL, spread, line, grain = true) {
  return make(512, metres, (g, s) => {
    const rows = Math.round(metres / plankW);
    const h = s / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rand() * s;
      while (x < s) {
        const len = (plankL / metres) * s * (0.6 + rand() * 0.8);
        g.fillStyle = shade(base, (rand() - 0.5) * spread);
        g.fillRect(x, r * h, len, h);
        if (grain) {
          for (let k = 0; k < 6; k++) {
            g.strokeStyle = `rgba(60,25,5,${0.05 + rand() * 0.08})`;
            g.beginPath();
            const yy = r * h + rand() * h;
            g.moveTo(x, yy);
            g.bezierCurveTo(x + len * 0.3, yy + (rand() - 0.5) * 3, x + len * 0.6, yy + (rand() - 0.5) * 3, x + len, yy);
            g.stroke();
          }
        }
        g.fillStyle = line;
        g.fillRect(x, r * h, 1.5, h);
        x += len;
      }
      g.fillStyle = line;
      g.fillRect(0, r * h, s, 1.5);
    }
  });
}

function tiles(base, grout, metres, nx, ny, spread, speckle = 0) {
  return make(512, metres, (g, s) => {
    g.fillStyle = grout;
    g.fillRect(0, 0, s, s);
    const w = s / nx, h = s / ny;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      g.fillStyle = shade(base, (rand() - 0.5) * spread);
      g.fillRect(i * w + 1.5, j * h + 1.5, w - 3, h - 3);
      if (speckle) {
        for (let k = 0; k < speckle; k++) {
          g.fillStyle = `rgba(120,90,60,${rand() * 0.12})`;
          g.beginPath();
          g.arc(i * w + rand() * w, j * h + rand() * h, 2 + rand() * 6, 0, 7);
          g.fill();
        }
      }
    }
    noise(g, s, 0.05, 3000);
  });
}

export function createTextures() {
  return {
    // Tongue-and-groove pine ceiling (narrow orange planks) – living, kitchen, patio, loft.
    woodCeiling: planks('#b8622a', 1.2, 0.085, 2.4, 40, 'rgba(70,30,8,0.55)'),
    // Glossy red-brown loft floorboards.
    woodFloorRed: planks('#93391b', 1.2, 0.12, 2.0, 30, 'rgba(50,15,5,0.6)'),
    // Weathered wood-look tiles in the ground-floor and upstairs bedrooms.
    woodTileDark: planks('#6e5a48', 2.4, 0.2, 1.2, 46, 'rgba(30,20,10,0.6)'),
    // 40 cm beige ceramic floor tiles – living / kitchen / dining / passage.
    floorTile: tiles('#e2d3bc', '#cbbba3', 1.2, 3, 3, 14),
    // Bathroom floor: 33 cm beige tiles.
    bathFloor: tiles('#e4d8c6', '#c9bba6', 1.0, 3, 3, 10),
    // Patio terracotta tiles.
    terracotta: tiles('#d58a66', '#b8725a', 1.2, 4, 4, 22),
    // Bathroom wall tiles (cream, 25 x 33 cm).
    bathWall: tiles('#e8ddd0', '#d6c9b9', 1.0, 4, 3, 8),
    // Kitchen splashback: mottled 15 cm beige tiles.
    splash: tiles('#ddcfb6', '#c5b498', 0.9, 6, 6, 26, 4),
    granite: make(256, 0.6, (g, s) => {
      g.fillStyle = '#8f8783';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 4500; i++) {
        const c = ['#5d5552', '#b5aaa4', '#a07d72', '#d8d0ca', '#3e3836'][Math.floor(rand() * 5)];
        g.fillStyle = c;
        g.fillRect(rand() * s, rand() * s, 1 + rand() * 3, 1 + rand() * 3);
      }
    }),
    carpet: make(256, 1.0, (g, s) => {
      g.fillStyle = '#7d7f80';
      g.fillRect(0, 0, s, s);
      noise(g, s, 0.25, 9000);
    }),
    lawn: make(256, 4.0, (g, s) => {
      g.fillStyle = '#6f9a33';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 6000; i++) {
        g.fillStyle = shade('#6f9a33', (rand() - 0.5) * 60);
        g.fillRect(rand() * s, rand() * s, 1, 2 + rand() * 3);
      }
    }),
    roofTile: make(256, 2.0, (g, s) => {
      g.fillStyle = '#6a5a52';
      g.fillRect(0, 0, s, s);
      const rows = 7, cols = 7;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        g.fillStyle = shade('#7a6a60', (rand() - 0.5) * 40);
        const off = (r % 2) * (s / cols / 2);
        g.fillRect(c * s / cols + off, r * s / rows, s / cols - 2, s / rows - 3);
      }
    }),
    plaster: make(256, 1.0, (g, s) => {
      g.fillStyle = '#f2efe9';
      g.fillRect(0, 0, s, s);
      noise(g, s, 0.05, 5000);
    }),
    render: make(256, 1.5, (g, s) => {
      g.fillStyle = '#b5704d';
      g.fillRect(0, 0, s, s);
      noise(g, s, 0.12, 7000);
    }),
  };
}

// Small decorative canvas used for cushions / artworks.
export function patternTexture(kind) {
  return make(256, 1, (g, s) => {
    if (kind === 'suzani') {
      // Teal + orange medallion cushions seen in every bedroom.
      g.fillStyle = '#e9dcae';
      g.fillRect(0, 0, s, s);
      const cols = ['#1f7f86', '#e1662b', '#2a9aa0', '#e8b53a'];
      for (let i = 0; i < 7; i++) {
        const x = rand() * s, y = rand() * s, r = 18 + rand() * 30;
        for (let k = 3; k > 0; k--) {
          g.fillStyle = cols[(i + k) % cols.length];
          g.beginPath();
          g.arc(x, y, (r * k) / 3, 0, 7);
          g.fill();
        }
      }
      g.strokeStyle = '#1f7f86';
      g.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.arc(rand() * s, rand() * s, 30 + rand() * 30, 0, 4);
        g.stroke();
      }
    } else if (kind === 'stripes') {
      // Striped throw blankets (yellow / grey / teal / coral).
      const cols = ['#f6f3ea', '#e9cf55', '#f6f3ea', '#8e9399', '#f6f3ea', '#6cc0c8', '#f6f3ea', '#ee8c6a'];
      const h = s / cols.length;
      cols.forEach((c, i) => {
        g.fillStyle = c;
        g.fillRect(0, i * h, s, h);
      });
    } else if (kind === 'tropical') {
      g.fillStyle = '#d9e4e0';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 14; i++) {
        g.fillStyle = ['#e48a3a', '#4f8a7a', '#e2b04a', '#6aa69a'][i % 4];
        g.beginPath();
        g.ellipse(rand() * s, rand() * s, 40, 12, rand() * 3, 0, 7);
        g.fill();
      }
    } else if (kind === 'seascape') {
      // Greek-harbour painting above the dining console.
      const grd = g.createLinearGradient(0, 0, 0, s);
      grd.addColorStop(0, '#6aa6d8');
      grd.addColorStop(0.45, '#2f6fb3');
      grd.addColorStop(1, '#1d4f8a');
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
      g.fillStyle = '#f2efe6';
      for (let i = 0; i < 8; i++) g.fillRect(s * 0.55 + i * 14, s * 0.25 + (i % 3) * 10, 12, 40);
      g.fillStyle = '#d9c9a8';
      g.fillRect(s * 0.5, s * 0.55, s * 0.5, s * 0.08);
      g.fillStyle = '#f5f5f5';
      g.beginPath();
      g.ellipse(s * 0.28, s * 0.72, 50, 12, 0, 0, 7);
      g.fill();
    } else if (kind === 'birds') {
      g.fillStyle = '#f2efe6';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 60; i++) {
        g.fillStyle = ['#c44', '#e93', '#37a', '#3a5', '#222', '#a7c'][i % 6];
        g.beginPath();
        g.ellipse(14 + (i % 10) * 24, 20 + Math.floor(i / 10) * 40, 8, 5, 0.4, 0, 7);
        g.fill();
      }
    } else if (kind === 'monstera') {
      g.fillStyle = '#dff0f0';
      g.fillRect(0, 0, s, s);
      g.fillStyle = '#3aa7a3';
      g.beginPath();
      g.ellipse(s / 2, s / 2, s * 0.32, s * 0.38, 0.5, 0, 7);
      g.fill();
      g.strokeStyle = '#dff0f0';
      g.lineWidth = 6;
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.moveTo(s / 2, s / 2);
        g.lineTo(s / 2 + Math.cos(i) * s * 0.4, s / 2 + Math.sin(i) * s * 0.4);
        g.stroke();
      }
    } else if (kind === 'tv') {
      g.fillStyle = '#121416';
      g.fillRect(0, 0, s, s);
      const grd = g.createLinearGradient(0, 0, s, s);
      grd.addColorStop(0, 'rgba(255,255,255,0.08)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
    }
  });
}
