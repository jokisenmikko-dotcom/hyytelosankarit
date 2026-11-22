// palikka.js (1.8) – Palikkamaa: kuutiomaailma jossa voi rikkoa ja rakentaa palikoita, kaivos malmeineen,
// hakut, palikkapuut ja harmiton Hiipijä-hyytelö. Kaikki grafiikka piirretään koodissa (ei ulkopuolisia kuvia).
// Ohjaus alueella jalan: F / 1 / RT = hakkaa, E / 2 / X = rakenna, G / 8 / RB = vaihda palikkaa.
(function () {
  const H = window.HYYTE;
  const OX = -160, OZ = -180, NX = 80, NZ = 68, NY = 36; // 2.2: ~8× pinta-ala, korkea malmivuori
  const PADZ = OZ - 8; // padit eteläpuolella
  const T = () => H.THREE;
  // ---------- palikat ----------
  // tiles: [ylä, sivu, ala] atlas-ruutuina; hp = iskuja hakulla 1; tier = vaadittu hakku
  const B = {
    1: { n: 'Nurmi', t: [0, 1, 2], hp: 2, drop: 2 },
    2: { n: 'Multa', t: [2, 2, 2], hp: 2, drop: 2 },
    3: { n: 'Kivi', t: [3, 3, 3], hp: 4, tier: 1, drop: 3 },
    4: { n: 'Puu', t: [5, 4, 5], hp: 3, drop: 4 },
    5: { n: 'Lehvät', t: [6, 6, 6], hp: 1, drop: 5 },
    6: { n: 'Hiili', t: [7, 7, 7], hp: 5, tier: 1, ore: 'hiili' },
    7: { n: 'Rauta', t: [8, 8, 8], hp: 6, tier: 1, ore: 'rauta' },
    8: { n: 'Kulta', t: [9, 9, 9], hp: 7, tier: 2, ore: 'kulta' },
    9: { n: 'Kristalli', t: [10, 10, 10], hp: 9, tier: 2, ore: 'kristalli' },
    10: { n: 'Lankku', t: [11, 11, 11], hp: 3, drop: 10 },
    11: { n: 'Hyytelö', t: [12, 12, 12], hp: 1, drop: 11 },
    12: { n: 'Lasi', t: [13, 13, 13], hp: 1, drop: 12, glass: true },
    13: { n: 'Tiili', t: [14, 14, 14], hp: 5, tier: 1, drop: 13 },
    14: { n: 'Kivijalka', t: [15, 15, 15], hp: 99, tier: 9 }, // pohjakerros: ei rikottavissa
  };
  const PLACE = [2, 3, 4, 5, 10, 12, 13, 11];
  const ORES = { hiili: { n: 'Hiili', ic: '⚫', v: 1 }, rauta: { n: 'Rauta', ic: '🟤', v: 2 }, kulta: { n: 'Kulta', ic: '🟡', v: 4 }, kristalli: { n: 'Kristalli', ic: '💎', v: 8 } };
  const PICKS = [
    { n: 'Paljaat kädet', pow: 0.5, tier: 0 },
    { n: 'Kivihakku', pow: 1, tier: 1, price: 0, col: 0x8b8f96 },
    { n: 'Rautahakku', pow: 1.8, tier: 2, price: 15, col: 0xdfe3e8 },
    { n: 'Kristallihakku', pow: 3.2, tier: 3, price: 40, col: 0x4de3ff },
  ];
  const SHOP = [ { id: 10, n: 'Lankku', k: 10, p: 3 }, { id: 12, n: 'Lasi', k: 10, p: 4 }, { id: 13, n: 'Tiili', k: 10, p: 4 }, { id: 11, n: 'Hyytelö', k: 5, p: 5 } ];
  const KEYS = [{ f: 'F', e: 'E', g: 'G' }, { f: '1', e: '2', g: '8' }];

  const grid = new Uint8Array(NX * NY * NZ);
  const I = (x, y, z) => x + NX * (z + NZ * y);
  const inG = (x, y, z) => x >= 0 && x < NX && z >= 0 && z < NZ && y >= 0 && y < NY;
  const get = (x, y, z) => (inG(x, y, z) ? grid[I(x, y, z)] : 0);
  const set = (x, y, z, v) => { if (inG(x, y, z)) grid[I(x, y, z)] = v; };

  // ---------- maailman luonti ----------
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function generate(seed = (Math.random() * 1e9) | 0) {
    grid.fill(0); const R = rng(seed);
    // 2.2: laaja tasanko + todella korkea malmivuori pohjoisreunalla (z pieni = vuori)
    const peakX = (NX * 0.48) | 0, peakZ = 6;
    for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) {
      const edge = Math.min(x, NX - 1 - x, z, NZ - 1 - z);
      const dx = (x - peakX) / 18, dz = (z - peakZ) / 14;
      const dist = Math.sqrt(dx * dx + dz * dz);
      // huippu ~34 korkea, rinteet, etelässä matala nurmi
      let h;
      if (z < 28) {
        h = Math.round(34 * Math.max(0, 1 - dist * 0.72) + 2.5 + 1.4 * Math.sin(x * 0.21 + seed % 9) + R() * 0.7);
        h = Math.max(2, Math.min(NY - 1, h));
      } else {
        h = Math.round(2 + (R() < 0.04 ? 1 : 0) + 0.4 * Math.sin(x * 0.3 + z * 0.2));
        h = Math.max(1, Math.min(4, h));
      }
      if (edge < 1) h = Math.min(h, 2);
      for (let y = 0; y < h; y++) {
        let id = 3;
        if (y === h - 1) id = z < 26 && h > 6 ? 3 : 1; // huipulla kivi, muuten nurmi
        else if (y >= h - 3) id = 2;
        set(x, y, z, id);
      }
    }
    // malmit pesäkkeinä vuoreen (enemmän koska isompi)
    const vein = (id, n, ymax, size) => {
      for (let k = 0; k < n; k++) {
        let x = (R() * NX) | 0, y = (R() * (ymax + 1)) | 0, z = (R() * 26) | 0;
        for (let s = 0; s < size; s++) {
          if (get(x, y, z) === 3) set(x, y, z, id);
          const d = (R() * 6) | 0; d === 0 ? x++ : d === 1 ? x-- : d === 2 ? y++ : d === 3 ? y-- : d === 4 ? z++ : z--;
          if (y > ymax) y = ymax;
        }
      }
    };
    vein(6, 48, 28, 6); vein(7, 36, 22, 5); vein(8, 22, 16, 4); vein(9, 14, 12, 3);
    // tunneli ja kammio vuoren sisään
    const tx0 = peakX - 1, tx1 = peakX + 1;
    for (let z = 4; z < 22; z++) for (let x = tx0; x <= tx1; x++) for (let y = 0; y <= 3; y++) set(x, y, z, 0);
    for (let z = 3; z <= 10; z++) for (let x = peakX - 6; x <= peakX + 6; x++) for (let y = 0; y <= 4; y++) if (!(y === 4 && (x === peakX - 6 || x === peakX + 6))) set(x, y, z, 0);
    // aarteet kammion seinille
    for (let k = 0; k < 14; k++) {
      const x = peakX - 5 + (k % 7), y = (k % 3), z = 4 + ((k * 3) % 6);
      if (get(x, y, z)) set(x, y, z, k < 3 ? 9 : k < 7 ? 8 : k < 11 ? 7 : 6);
    }
    for (let y = 0; y <= 3; y++) { set(peakX - 2, y, 20, 4); set(peakX + 2, y, 20, 4); }
    for (let x = peakX - 2; x <= peakX + 2; x++) set(x, 4, 20, 10);
    // palikkapuut eteläiseen rakennusalueeseen
    [[8, 40], [20, 44], [35, 48], [50, 42], [65, 50], [12, 55], [40, 58], [60, 60]].forEach(([x, z], k) => tree(x, z, 4 + (k % 3)));
    return seed;
  }
  function tree(x, z, h) {
    for (let y = 0; y < h; y++) set(x, y, z, 4);
    for (let y = h - 2; y <= h + 1; y++) {
      const r = y >= h ? 1 : 2;
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (y === h + 1 && Math.abs(dx) + Math.abs(dz) > 1) continue;
        if (!get(x + dx, y, z + dz)) set(x + dx, y, z + dz, 5);
      }
    }
  }
  // ---------- tallennus (RLE) ----------
  const WKEY = 'palikka-maailma-v22';
  function saveWorld() {
    const out = []; let v = grid[0], n = 0;
    for (let k = 0; k < grid.length; k++) { if (grid[k] === v) n++; else { out.push(v + ':' + n); v = grid[k]; n = 1; } }
    out.push(v + ':' + n); H.save(WKEY, { v: 1, nx: NX, ny: NY, nz: NZ, d: out.join(',') });
  }
  function loadWorld() {
    const s = H.load(WKEY, null);
    if (!s || s.v !== 1 || s.nx !== NX || s.ny !== NY || s.nz !== NZ || typeof s.d !== 'string') return false;
    let k = 0;
    for (const part of s.d.split(',')) { const [v, n] = part.split(':').map(Number); if (!(v in B) && v !== 0) return false; for (let j = 0; j < n && k < grid.length; j++) grid[k++] = v; }
    return k === grid.length;
  }
  let saveT = -1;
  const dirty = () => { saveT = 2; };

  // ---------- tekstuuriatlas ----------
  let atlas = null, crackTex = [];
  function makeAtlas() {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const R = rng(1234);
    const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const noise = (tx, ty, base, cols, p = 0.35) => { g.fillStyle = base; g.fillRect(tx, ty, 16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (R() < p) px(tx + x, ty + y, cols[(R() * cols.length) | 0]); };
    const T0 = k => [(k % 4) * 16, ((k / 4) | 0) * 16];
    const stone = (tx, ty) => { noise(tx, ty, '#8d9299', ['#7b8087', '#a1a6ad', '#6f747b'], 0.45); };
    const ore = (k, cols) => { const [tx, ty] = T0(k); stone(tx, ty); [[3, 3], [9, 5], [5, 10], [11, 11], [2, 7]].forEach(([x, y]) => { g.fillStyle = cols[0]; g.fillRect(tx + x, ty + y, 3, 2); g.fillStyle = cols[1]; g.fillRect(tx + x, ty + y, 1, 1); g.fillRect(tx + x + 1, ty + y + 1, 2, 1); }); };
    let [x, y] = T0(0); noise(x, y, '#5fb44c', ['#4f9e3e', '#6fc65a', '#58a946'], 0.5);
    [x, y] = T0(2); noise(x, y, '#8a5a36', ['#6e4528', '#a06c43', '#7c4f2f'], 0.45);
    [x, y] = T0(1); noise(x, y, '#8a5a36', ['#6e4528', '#a06c43', '#7c4f2f'], 0.45);
    for (let i = 0; i < 16; i++) { const d = 3 + ((R() * 3) | 0); g.fillStyle = '#5fb44c'; g.fillRect(x + i, y, 1, d); g.fillStyle = '#4f9e3e'; g.fillRect(x + i, y + d - 1, 1, 1); }
    [x, y] = T0(3); stone(x, y);
    [x, y] = T0(4); g.fillStyle = '#6b4a2b'; g.fillRect(x, y, 16, 16); for (let i = 0; i < 16; i += 1) { g.fillStyle = R() < 0.5 ? '#5a3c22' : '#7d5733'; g.fillRect(x + i, y, 1, 16); } for (let k = 0; k < 10; k++) px(x + ((R() * 16) | 0), y + ((R() * 16) | 0), '#3f2a17');
    [x, y] = T0(5); g.fillStyle = '#b8894f'; g.fillRect(x, y, 16, 16); g.strokeStyle = '#8f6a3b'; g.lineWidth = 1; [6.5, 4.5, 2.5].forEach(r => g.strokeRect(x + 8 - r, y + 8 - r, r * 2, r * 2)); g.fillStyle = '#6b4a2b'; g.fillRect(x, y, 16, 1); g.fillRect(x, y + 15, 16, 1); g.fillRect(x, y, 1, 16); g.fillRect(x + 15, y, 1, 16);
    [x, y] = T0(6); noise(x, y, '#2f7d32', ['#256628', '#3e9a41', '#1d5220', '#4caf50'], 0.6);
    ore(7, ['#1c1c1f', '#3a3a40']); ore(8, ['#d8a27a', '#f1c9a8']); ore(9, ['#f6c445', '#fff1a6']); ore(10, ['#2fd3f5', '#c7fbff']);
    [x, y] = T0(11); g.fillStyle = '#c08a4e'; g.fillRect(x, y, 16, 16); for (let k = 0; k < 16; k++) for (let j = 0; j < 16; j++) if (R() < 0.18) px(x + j, y + k, '#b07a40'); g.fillStyle = '#8f6236'; [3, 7, 11, 15].forEach(r => g.fillRect(x, y + r, 16, 1)); [[5, 0], [12, 4], [3, 8], [9, 12]].forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 3));
    [x, y] = T0(12); g.fillStyle = '#6fdc6f'; g.fillRect(x, y, 16, 16); g.fillStyle = '#9af09a'; g.fillRect(x + 1, y + 1, 14, 2); g.fillRect(x + 1, y + 1, 2, 14); g.fillStyle = '#3fae46'; g.fillRect(x + 4, y + 4, 8, 8); g.fillStyle = '#58c75c'; g.fillRect(x + 5, y + 5, 6, 6); g.fillStyle = '#2e8d35'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16);
    [x, y] = T0(13); g.clearRect(x, y, 16, 16); g.fillStyle = 'rgba(210,240,255,0.35)'; g.fillRect(x, y, 16, 16); g.fillStyle = '#e8f8ff'; g.fillRect(x, y, 16, 1); g.fillRect(x, y + 15, 16, 1); g.fillRect(x, y, 1, 16); g.fillRect(x + 15, y, 1, 16); [[3, 3], [4, 4], [5, 5], [10, 3], [11, 4]].forEach(([a, b]) => px(x + a, y + b, '#ffffff'));
    [x, y] = T0(14); g.fillStyle = '#b9b2a6'; g.fillRect(x, y, 16, 16); for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const o = (r % 2) * 4; g.fillStyle = ['#a7453a', '#b8503f', '#9a3e34'][(R() * 3) | 0]; g.fillRect(x + ((o + k * 8) % 16), y + r * 4, 7, 3); if (o) { g.fillRect(x, y + r * 4, 3, 3); } }
    [x, y] = T0(15); noise(x, y, '#3b3d42', ['#2b2d31', '#4b4e54', '#222428'], 0.55);
    const tex = new (T().CanvasTexture)(c); tex.magFilter = 1003; tex.minFilter = 1003; tex.generateMipmaps = false; tex.colorSpace = T().SRGBColorSpace;
    // halkeamat ja reunaviiva valintalaatikolle
    for (let s = 0; s < 5; s++) {
      const cc = document.createElement('canvas'); cc.width = cc.height = 32; const q = cc.getContext('2d');
      q.strokeStyle = 'rgba(0,0,0,0.85)'; q.lineWidth = 2; q.strokeRect(1, 1, 30, 30);
      const r2 = rng(77); q.fillStyle = 'rgba(15,10,5,0.8)';
      for (let k = 0; k < s * 7; k++) { let cx = 16, cy = 16; const a = r2() * Math.PI * 2; for (let j = 0; j < 4 + s * 2; j++) { cx += Math.cos(a + (r2() - 0.5)) * 2; cy += Math.sin(a + (r2() - 0.5)) * 2; q.fillRect(cx | 0, cy | 0, 2, 2); } }
      const ct = new (T().CanvasTexture)(cc); ct.magFilter = 1003; ct.minFilter = 1003; ct.generateMipmaps = false; crackTex.push(ct);
    }
    return tex;
  }
  const tileUV = k => { const c = k % 4, r = (k / 4) | 0, e = 0.002; return [c / 4 + e, 1 - (r + 1) / 4 + e, (c + 1) / 4 - e, 1 - r / 4 - e]; };

  // ---------- mesh ----------
  const FACES = [
    { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], s: 0.82, t: 1 },
    { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], s: 0.82, t: 1 },
    { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], s: 1, t: 0 },
    { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: 0.55, t: 2 },
    { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], s: 0.72, t: 1 },
    { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], s: 0.72, t: 1 },
  ];
  const AO = [1, 0.8, 0.64, 0.5];
  const opaqueAt = (x, y, z) => { const v = get(x, y, z); return v && !B[v].glass; };
  let meshes = null;
  function buildGeo(glassPass) {
    const P = [], N = [], U = [], C = [], X = [];
    for (let y = 0; y < NY; y++) for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) {
      const v = grid[I(x, y, z)]; if (!v) continue; const b = B[v];
      if (!!b.glass !== glassPass) continue;
      for (const f of FACES) {
        const nx = x + f.n[0], ny = y + f.n[1], nz = z + f.n[2], nb = get(nx, ny, nz);
        if (nb && (!B[nb].glass || glassPass)) continue;
        if (ny < 0) continue;
        const [u0, v0, u1, v1] = tileUV(b.t[f.t]), base = P.length / 3, ao = [];
        const ax = [0, 1, 2].filter(a => f.n[a] === 0);
        f.c.forEach((c, k) => {
          P.push(OX + x + c[0], y + c[1], OZ + z + c[2]); N.push(...f.n);
          const uv = f.t === 1 ? [[0, 0], [1, 0], [1, 1], [0, 1]][k] : [[0, 1], [1, 1], [1, 0], [0, 0]][k];
          U.push(u0 + (u1 - u0) * uv[0], v0 + (v1 - v0) * uv[1]);
          const o1 = [nx, ny, nz], o2 = [nx, ny, nz];
          o1[ax[0]] += c[ax[0]] ? 1 : -1; o2[ax[1]] += c[ax[1]] ? 1 : -1;
          const o3 = [o1[0] + o2[0] - nx, o1[1] + o2[1] - ny, o1[2] + o2[2] - nz];
          const s1 = opaqueAt(...o1) ? 1 : 0, s2 = opaqueAt(...o2) ? 1 : 0, s3 = opaqueAt(...o3) ? 1 : 0;
          const a = s1 && s2 ? 3 : s1 + s2 + s3; ao.push(a);
          const l = f.s * AO[a]; C.push(l, l, l);
        });
        if (ao[0] + ao[2] > ao[1] + ao[3]) X.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
        else X.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
    }
    const g = new (T().BufferGeometry)();
    g.setAttribute('position', new (T().BufferAttribute)(new Float32Array(P), 3));
    g.setAttribute('normal', new (T().BufferAttribute)(new Float32Array(N), 3));
    g.setAttribute('uv', new (T().BufferAttribute)(new Float32Array(U), 2));
    g.setAttribute('color', new (T().BufferAttribute)(new Float32Array(C), 3));
    g.setIndex(new (T().BufferAttribute)(P.length / 3 > 65535 ? new Uint32Array(X) : new Uint16Array(X), 1));
    g.computeBoundingSphere(); return g;
  }
  let rebuildQ = false;
  function rebuild() {
    if (!meshes) return;
    for (const [m, glass] of [[meshes.solid, false], [meshes.glass, true]]) { m.geometry.dispose(); m.geometry = buildGeo(glass); }
    rebuildQ = false;
  }

  // ---------- tila ----------
  let active = false, world = null, inv = [null, null], st = [], mob = null, pads = [], hi = [], pickM = [];
  const blankInv = () => ({ v: 1, pick: 0, blocks: { 2: 0 }, ores: { hiili: 0, rauta: 0, kulta: 0, kristalli: 0 }, sel: 2 });
  function loadInv(i) {
    const d = H.load('palikka-p' + (i + 1), null), b = blankInv();
    if (d && typeof d === 'object') {
      b.pick = Math.max(0, Math.min(3, d.pick | 0));
      for (const k in d.blocks || {}) if (PLACE.includes(+k)) b.blocks[k] = Math.max(0, Math.min(999, d.blocks[k] | 0));
      for (const k in b.ores) b.ores[k] = Math.max(0, d.ores?.[k] | 0);
      if (PLACE.includes(d.sel)) b.sel = d.sel;
    }
    return b;
  }
  const saveInv = i => inv[i] && H.save('palikka-p' + (i + 1), inv[i]);
  const inZone = (q, m = 0) => q.x > OX - m && q.x < OX + NX + m && q.z > OZ - m && q.z < OZ + NZ + m;
  const onFoot = p => p.car == null && !p.rocket && (!p.air || p.air === 'none');

  // ---------- törmäyskoukut game.js:lle ----------
  function colTop(cx, cz, y) { if (cx < 0 || cz < 0 || cx >= NX || cz >= NZ) return 0; for (let cy = Math.min(NY - 1, Math.floor(y - 0.65)); cy >= 0; cy--) if (grid[I(cx, cy, cz)]) return cy + 1; return 0; }
  const OFF = [[0, 0], [0.22, 0.22], [-0.22, 0.22], [0.22, -0.22], [-0.22, -0.22]];
  H.voxGround = (x, z, y = 0) => {
    if (!active || x < OX - 1 || x > OX + NX + 1 || z < OZ - 1 || z > OZ + NZ + 1) return 0;
    let top = 0; for (const [dx, dz] of OFF) top = Math.max(top, colTop(Math.floor(x + dx - OX), Math.floor(z + dz - OZ), y)); return top;
  };
  H.voxBlock = (x, z, y = 0, r = 0.3) => {
    if (!active || x < OX - 2 || x > OX + NX + 2 || z < OZ - 2 || z > OZ + NZ + 2) return false;
    const y0 = Math.floor(y - 0.65) + 1, y1 = Math.ceil(y + 1.7) - 1;
    for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) {
      const cx = Math.floor(x + dx - OX), cz = Math.floor(z + dz - OZ);
      if (cx < 0 || cz < 0 || cx >= NX || cz >= NZ) continue;
      for (let cy = Math.max(0, y0); cy <= Math.min(NY - 1, y1); cy++) if (grid[I(cx, cy, cz)]) return true;
    }
    return false;
  };
  H.noFire = p => active && inZone(p.pos, 0.5) && onFoot(p);
  H.noSwap = H.noFire;
  // kamera ei mene palikoiden sisään: palauttaa uuden pisteen tai null
  H.camClamp = (hx, hy, hz, cx, cy, cz) => {
    if (!active || !inZone({ x: hx, z: hz }, 22)) return null;
    const dx = cx - hx, dy = cy - hy, dz = cz - hz, L = Math.hypot(dx, dy, dz); if (L < 0.01) return null;
    const steps = Math.ceil(L / 0.2);
    for (let s = 1; s <= steps; s++) {
      const t = s / steps, x = hx + dx * t, y = hy + dy * t, z = hz + dz * t;
      if (get(Math.floor(x - OX), Math.floor(y), Math.floor(z - OZ))) { const k = Math.max(0.05, t - 0.4 / L); return { x: hx + dx * k, y: hy + dy * k, z: hz + dz * k }; }
    }
    return null;
  };

  // 1.9: paksu kamerasäde – vapaa matka pisteestä suuntaan (dx,dy,dz yksikkövektori) korkeintaan L.
  // Näytteitä 5 rinnakkaista sädettä (keskus + 4 sivua 0.3 m), joten yksittäinen palikan kulma ei aiheuta nykimistä.
  H.camRay = (hx, hy, hz, dx, dy, dz, L) => {
    if (!active || !inZone({ x: hx, z: hz }, 22)) return L;
    // sivuvektorit
    let sx = -dz, sz = dx; const sl = Math.hypot(sx, sz) || 1; sx /= sl; sz /= sl;
    const R = 0.3, offs = [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R]];
    let best = L;
    for (const [a, b] of offs) {
      const ox = hx + sx * a, oy = hy + b, oz = hz + sz * a;
      // aloitus omasta sisältä ei lasketa: jos lähtöpiste on palikassa, ohitetaan tämä säde
      if (get(Math.floor(ox - OX), Math.floor(oy), Math.floor(oz - OZ))) continue;
      for (let t = 0.15; t < best; t += 0.15) {
        const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
        if (get(Math.floor(x - OX), Math.floor(y), Math.floor(z - OZ))) { best = Math.min(best, Math.max(0.3, t - 0.35)); break; }
      }
    }
    return best;
  };

  // ---------- 3D-osat ----------
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.8, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0, transparent: !!o.op, opacity: o.op ?? 1, depthWrite: !o.op });
  const box = (w, h, d, m, x = 0, y = 0, z = 0, p) => { const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  function blockCube(id, s = 0.7) {
    const g = new (T().BoxGeometry)(s, s, s), b = B[id], uv = g.attributes.uv;
    // BoxGeometry: ryhmät +x,-x,+y,-y,+z,-z, 4 kärkeä kukin
    [1, 1, 0, 2, 1, 1].forEach((t, f) => { const [u0, v0, u1, v1] = tileUV(b.t[t]); for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, u0 + (u1 - u0) * uv.getX(i), v0 + (v1 - v0) * uv.getY(i)); } });
    const m = new (T().Mesh)(g, new (T().MeshStandardMaterial)({ map: atlas, roughness: 0.9, transparent: !!b.glass })); m.castShadow = true; return m;
  }
  function makePick(tier) {
    const g = new (T().Group)(), col = PICKS[tier].col;
    box(0.07, 0.75, 0.07, M(0x7a5230), 0, 0.2, 0, g);
    const hm = M(col, { r: 0.4, e: tier === 3 ? 0x1fb8d8 : 0, ei: tier === 3 ? 0.6 : 0 });
    box(0.56, 0.1, 0.1, hm, 0, 0.56, 0, g);
    const a = box(0.18, 0.08, 0.08, hm, 0.3, 0.5, 0, g); a.rotation.z = -0.5;
    const b = box(0.18, 0.08, 0.08, hm, -0.3, 0.5, 0, g); b.rotation.z = 0.5;
    g.traverse(o => (o.castShadow = true));
    return g;
  }
  function makeMob() {
    const g = new (T().Group)(), body = new (T().Group)(); g.add(body);
    const outer = box(1, 1, 1, M(0x66d65a, { r: 0.25, op: 0.72, e: 0x123f10, ei: 0.4 }), 0, 0.5, 0, body);
    box(0.62, 0.62, 0.62, M(0x2f8f3a, { r: 0.6 }), 0, 0.45, 0, body);
    const face = M(0x153d17, { r: 0.9 });
    box(0.16, 0.2, 0.04, face, -0.2, 0.66, 0.51, body); box(0.16, 0.2, 0.04, face, 0.2, 0.66, 0.51, body);
    box(0.08, 0.08, 0.04, M(0xffffff), -0.17, 0.72, 0.53, body); box(0.08, 0.08, 0.04, M(0xffffff), 0.23, 0.72, 0.53, body);
    box(0.3, 0.06, 0.04, face, 0, 0.42, 0.51, body); box(0.06, 0.06, 0.04, face, -0.15, 0.46, 0.51, body); box(0.06, 0.06, 0.04, face, 0.15, 0.46, 0.51, body);
    const l = H.makeLabel('Hiipijä', { scale: 2.2, size: 60, bg: '#1f5a24' }); l.position.y = 1.7; g.add(l);
    return { g, body, outer, x: 0, z: 0, y: 0, tx: 0, tz: 0, hop: 0, fuse: 0, dead: 0, yaw: 0, wait: 0 };
  }

  // 2.2: blocky lampaat ja lehmät (vaeltavat nurmella)
  let critters = [];
  function makeSheep() {
    const g = new (T().Group)();
    box(0.7, 0.55, 0.9, M(0xf8f9fa), 0, 0.45, 0, g);
    box(0.32, 0.32, 0.32, M(0x868e96), 0, 0.55, 0.52, g);
    box(0.1, 0.22, 0.1, M(0x495057), -0.22, 0.12, 0.25, g);
    box(0.1, 0.22, 0.1, M(0x495057), 0.22, 0.12, 0.25, g);
    box(0.1, 0.22, 0.1, M(0x495057), -0.22, 0.12, -0.25, g);
    box(0.1, 0.22, 0.1, M(0x495057), 0.22, 0.12, -0.25, g);
    return g;
  }
  function makeCow() {
    const g = new (T().Group)();
    box(0.85, 0.65, 1.2, M(0xffffff), 0, 0.55, 0, g);
    box(0.35, 0.2, 0.55, M(0x212529), 0.15, 0.7, 0.1, g);
    box(0.4, 0.4, 0.4, M(0xffffff), 0, 0.7, 0.7, g);
    box(0.08, 0.08, 0.18, M(0xffa8a8), 0, 0.55, 0.9, g);
    for (const [x,z] of [[-0.28,0.35],[0.28,0.35],[-0.28,-0.35],[0.28,-0.35]]) box(0.12, 0.35, 0.12, M(0x495057), x, 0.18, z, g);
    return g;
  }
  function spawnCritters() {
    critters.forEach(c => H.removeObject?.(c.g));
    critters = [];
    const place = (kind, n) => {
      for (let k = 0; k < n; k++) {
        const gx = 5 + ((Math.random() * (NX - 10)) | 0), gz = 32 + ((Math.random() * (NZ - 38)) | 0);
        let gy = 0; for (let y = NY - 1; y >= 0; y--) if (get(gx, y, gz)) { gy = y + 1; break; }
        const g = kind === 'sheep' ? makeSheep() : makeCow();
        H.addObject(g, OX + gx + 0.5, gy, OZ + gz + 0.5);
        critters.push({ kind, g, x: OX + gx + 0.5, z: OZ + gz + 0.5, y: gy, yaw: Math.random() * 6, wait: Math.random() * 2, tx: 0, tz: 0 });
      }
    };
    place('sheep', 10); place('cow', 6);
  }
  function updCritters(dt) {
    for (const c of critters) {
      c.wait -= dt;
      if (c.wait <= 0) {
        c.wait = 1.5 + Math.random() * 3;
        const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 5;
        c.tx = Math.max(OX + 2, Math.min(OX + NX - 2, c.x + Math.cos(a) * r));
        c.tz = Math.max(OZ + 30, Math.min(OZ + NZ - 2, c.z + Math.sin(a) * r));
        c.yaw = Math.atan2(c.tx - c.x, c.tz - c.z);
      }
      const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
      if (d > 0.15) {
        const sp = (c.kind === 'sheep' ? 1.6 : 1.2) * dt;
        c.x += (dx / d) * sp; c.z += (dz / d) * sp;
        const top = H.voxGround(c.x, c.z, c.y + 2) || c.y;
        c.y = top;
        if (c.g) { c.g.position.set(c.x, c.y, c.z); c.g.rotation.y = c.yaw; }
      }
    }
  }

  function pad(x, z, col, text, extra) {
    const p = new (T().Mesh)(new (T().CylinderGeometry)(1.35, 1.35, 0.1, 6), M(col, { e: col, ei: 0.25 })); p.receiveShadow = true;
    H.addObject(p, x, 0.06, z);
    const l = H.makeLabel(text, { scale: 2.7, size: 46 }); H.addObject(l, x, 2.7, z);
    extra && H.addObject(extra, x, 1.5, z);
    const o = { x, z, l, extra }; pads.push(o); return o;
  }

  function build() {
    if (!atlas) atlas = makeAtlas();
    const solid = new (T().Mesh)(new (T().BufferGeometry)(), new (T().MeshStandardMaterial)({ map: atlas, vertexColors: true, roughness: 0.95 }));
    solid.castShadow = solid.receiveShadow = true;
    const glass = new (T().Mesh)(new (T().BufferGeometry)(), new (T().MeshStandardMaterial)({ map: atlas, vertexColors: true, roughness: 0.1, transparent: true, depthWrite: false }));
    glass.receiveShadow = true; glass.renderOrder = 2;
    meshes = { solid, glass }; H.addObject(solid); H.addObject(glass); rebuild();
    // nimikyltti alueen yllä (näkyy kauas)
    const sign = H.makeLabel('⛏ PALIKKAMAA', { scale: 13, size: 74, bg: '#2f5d1e', border: '#ffe08a' }); H.addObject(sign, OX + NX / 2, 22, OZ + NZ / 2);
    // opaste ja nuoli lähtöpaikan lähellä
    const post = new (T().Group)(); box(0.18, 2.6, 0.18, M(0x7a5230), 0, 1.3, 0, post);
    const arrowG = new (T().Group)(); box(1.4, 0.4, 0.12, M(0xffd43b, { e: 0x664400, ei: 0.3 }), -0.2, 0, 0, arrowG);
    const tip = new (T().Mesh)(new (T().ConeGeometry)(0.42, 0.6, 4), M(0xffd43b, { e: 0x664400, ei: 0.3 })); tip.rotation.z = Math.PI / 2; tip.position.x = -1.15; arrowG.add(tip);
    arrowG.position.y = 2.4; post.add(arrowG); const sx = -16, sz = -32;
    // 2.1: kärki (paikallinen -X) osoittaa kohti Palikkamaan keskustaa
    { const tx = OX + NX / 2 - sx, tz = OZ + NZ / 2 - sz; arrowG.rotation.y = Math.atan2(tz, -tx); }
    const pl = H.makeLabel('⛏ Palikkamaa', { scale: 3.6, size: 58, bg: '#2f5d1e' }); pl.position.y = 3.4; post.add(pl);
    H.addObject(post, sx, 0, sz);
    // alustat
    // 2.3: padit selvästi alueen sisällä (ei näkymättömän rajan takana)
    pad(OX + 4, PADZ + 2, 0x8d99ae, '⛏ Hakkukoju', makePick(1));
    pad(OX + 10, PADZ + 2, 0xf6c445, '💰 Malmikauppa', blockCube(8, 0.6));
    SHOP.forEach((s, k) => { const o = pad(OX + 15.5 + k * 4, PADZ + 2, 0xc08a4e, `🧱 ${s.n} ×${s.k}`, blockCube(s.id, 0.6)); o.shop = s; });
    pad(OX + NX - 6, PADZ + 2, 0x845ef7, '🔄 Uusi kaivos');
    pads[0].kind = 'pick'; pads[1].kind = 'sell'; pads[pads.length - 1].kind = 'reset';
    // valintalaatikot ja hakut
    for (let i = 0; i < Math.max(2, H.players.length); i++) {
      const m = new (T().Mesh)(new (T().BoxGeometry)(1.012, 1.012, 1.012), new (T().MeshStandardMaterial)({ map: crackTex[0], transparent: true, depthWrite: false, roughness: 1, color: 0x222222, polygonOffset: true, polygonOffsetFactor: -2 }));
      m.visible = false; m.renderOrder = 3; H.addObject(m); hi[i] = m;
    }
    mob = makeMob(); H.addObject(mob.g); spawnMob();
    spawnCritters();
  }
  function spawnMob() {
    for (let k = 0; k < 40; k++) {
      const x = OX + 2 + Math.random() * (NX - 4), z = OZ + 13 + Math.random() * (NZ - 15);
      if (!H.voxBlock(x, z, 0, 0.55)) { Object.assign(mob, { x, z, y: 0, tx: x, tz: z, fuse: 0, dead: 0, wait: 1 }); mob.g.visible = true; mob.g.position.set(x, 0, z); return; }
    }
  }
  function updPick(p, i, show) {
    const tier = inv[i].pick;
    if (pickM[i] && pickM[i].tier !== tier) { pickM[i].g.parent && pickM[i].g.parent.remove(pickM[i].g); pickM[i] = null; }
    if (!pickM[i] && tier > 0 && p.group) {
      const g = makePick(tier), w = p.weaponGroup;
      g.position.set(0.38, 0.75, 0.15); g.scale.setScalar(0.9);
      if (w) g.traverse(o => (o.layers.mask = w.layers.mask));
      p.group.add(g); pickM[i] = { g, tier };
    }
    if (pickM[i]) pickM[i].g.visible = show;
    if (p.weaponGroup) p.weaponGroup.visible = !show;
  }

  // ---------- kohdistus ----------
  // kohde: ensin rinnan korkeudella edessä, sitten jalkojen tasolla, lopuksi edessä alhaalla (kaivaa alas)
  function aim(p) {
    // 2.1: 3D-säde kameran pitchillä – voi hakata myös ylempiä palikoita
    const v = H.game.dirVectors(p.yaw);
    const pitch = (typeof p.pitch === 'number') ? p.pitch : -0.15;
    const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const ox = p.pos.x, oy = p.pos.y + 1.35, oz = p.pos.z;
    const dx = v.fx * cosP, dy = sinP, dz = v.fz * cosP;
    let best = null, bestT = 9;
    for (let t = 0.25; t <= 4.2; t += 0.08) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      const cx = Math.floor(x - OX), cy = Math.floor(y), cz = Math.floor(z - OZ);
      if (cx < 0 || cz < 0 || cx >= NX || cz >= NZ || cy < 0 || cy >= NY) continue;
      if (get(cx, cy, cz)) { best = [cx, cy, cz]; bestT = t; break; }
    }
    if (best) return { hit: best };
    // fallback: vanha eteen-taso
    const y = p.pos.y, ch = Math.floor(y + 1.1), ft = Math.floor(y + 0.3);
    for (let t = 0.3; t <= 2.6; t += 0.1) {
      const cx = Math.floor(p.pos.x + v.fx * t - OX), cz = Math.floor(p.pos.z + v.fz * t - OZ);
      for (let cy of [ch, ft, ch + 1, ch + 2, ft + 1]) if (cy >= 0 && cy < NY && get(cx, cy, cz)) return { hit: [cx, cy, cz] };
    }
    const cx = Math.floor(p.pos.x + v.fx * 0.75 - OX), cz = Math.floor(p.pos.z + v.fz * 0.75 - OZ), dn = Math.floor(y - 0.5);
    if (dn >= 0 && get(cx, dn, cz)) return { hit: [cx, dn, cz] };
    return { hit: null };
  }
  function placeCell(p) {
    const v = H.game.dirVectors(p.yaw), x = p.pos.x + v.fx * 1.45, z = p.pos.z + v.fz * 1.45;
    const cx = Math.floor(x - OX), cz = Math.floor(z - OZ);
    if (cx < 0 || cz < 0 || cx >= NX || cz >= NZ) return null;
    let cy = Math.max(0, Math.round(p.pos.y));
    if (get(cx, cy, cz)) { let k = 0; while (get(cx, cy, cz) && k++ < 3) cy++; if (get(cx, cy, cz)) return null; }
    else { let k = 0; while (cy > 0 && !get(cx, cy - 1, cz) && k++ < 3) cy--; }
    if (cy >= NY) return null;
    return [cx, cy, cz];
  }
  const overlapsPlayer = ([cx, cy, cz]) => H.players.some(q => { if (q.car != null) return false; const x0 = OX + cx, z0 = OZ + cz; return q.pos.x + 0.32 > x0 && q.pos.x - 0.32 < x0 + 1 && q.pos.z + 0.32 > z0 && q.pos.z - 0.32 < z0 + 1 && q.pos.y + 1.75 > cy && q.pos.y < cy + 1; })
    || (mob && !mob.dead && Math.abs(mob.x - (OX + cx + 0.5)) < 1 && Math.abs(mob.z - (OZ + cz + 0.5)) < 1 && cy < 1.2);

  // ---------- toiminnot ----------
  function breakBlock(i, c) {
    const [x, y, z] = c, v = get(x, y, z), b = B[v], s = inv[i];
    set(x, y, z, 0); rebuildQ = true; dirty();
    const wx = OX + x + 0.5, wz = OZ + z + 0.5;
    H.fx?.burst('debris', wx, y + 0.5, wz, { n: 14, color: debrisCol(v), speed: 3, up: 3, life: 0.9, spread: 0.4 });
    H.beep(180 + Math.random() * 60, 0.07, 'square', 0.04);
    H.emit('mine', i, 'broken', 1);
    if (b.ore) { s.ores[b.ore]++; H.emit('mine', i, 'ores', 1); H.toast(i, `${ORES[b.ore].ic} +1 ${ORES[b.ore].n} – myy Malmikaupassa`); H.beep(990, 0.1, 'triangle', 0.05); }
    else if (b.drop && !(v === 5 && Math.random() < 0.4)) { s.blocks[b.drop] = Math.min(999, (s.blocks[b.drop] || 0) + 1); if (!(s.blocks[s.sel] > 0)) s.sel = b.drop; }
    if (v === 5 && Math.random() < 0.12) { H.money.add(i, 1); H.toast(i, '🍎 Lehvistä putosi omena: +1 🪙'); }
    saveInv(i);
  }
  const DCOL = { 1: 0x5fb44c, 2: 0x8a5a36, 3: 0x8d9299, 4: 0x6b4a2b, 5: 0x2f7d32, 6: 0x2a2a2e, 7: 0xd8a27a, 8: 0xf6c445, 9: 0x2fd3f5, 10: 0xc08a4e, 11: 0x6fdc6f, 12: 0xdaf3ff, 13: 0xa7453a };
  const debrisCol = v => DCOL[v] ?? 0x888888;
  function place(i, p) {
    const s = inv[i], id = s.sel;
    if (!(s.blocks[id] > 0)) { const nx = PLACE.find(k => s.blocks[k] > 0); if (!nx) { H.toast(i, 'Ei palikoita – riko ensin jotain tai osta palikkakaupasta!', true); return; } s.sel = nx; }
    const c = placeCell(p);
    if (!c) { H.toast(i, 'Siihen ei voi rakentaa', true); return; }
    if (overlapsPlayer(c)) { H.toast(i, 'Joku on tiellä!', true); return; }
    set(...c, s.sel); s.blocks[s.sel]--; rebuildQ = true; dirty(); saveInv(i);
    H.fx?.burst('dust', OX + c[0] + 0.5, c[1] + 0.2, OZ + c[2] + 0.5, { n: 6, life: 0.5 });
    H.beep(300, 0.06, 'triangle', 0.05); H.emit('mine', i, 'placed', 1);
  }
  function cycle(i) {
    const s = inv[i], have = PLACE.filter(k => s.blocks[k] > 0);
    if (!have.length) { H.toast(i, 'Ei palikoita vielä – riko multaa, kiveä tai puuta', true); return; }
    const k = have.indexOf(s.sel); s.sel = have[(k + 1) % have.length]; saveInv(i);
    H.toast(i, `🧱 ${B[s.sel].n} (${s.blocks[s.sel]})`); H.beep(520, 0.05, 'square', 0.03);
  }
  function usePad(i, pd) {
    const s = inv[i];
    if (pd.kind === 'pick') {
      const next = PICKS[s.pick + 1];
      if (!next) { H.toast(i, '💎 Sinulla on jo paras hakku!'); return; }
      if (next.price && !H.money.spend(i, next.price)) { H.toast(i, `${next.n} maksaa ${next.price} 🪙 – kaiva malmeja ja myy ne!`, true); return; }
      s.pick++; saveInv(i); H.toast(i, `⛏ Sait: ${next.n}!`); H.beep(660, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(990, 0.14, 'triangle', 0.06), 110);
    } else if (pd.kind === 'sell') {
      let sum = 0, n = 0; for (const k in s.ores) { sum += s.ores[k] * ORES[k].v; n += s.ores[k]; s.ores[k] = 0; }
      if (!n) { H.toast(i, 'Ei malmeja myytävänä – kaiva kaivoksesta ⛏', true); return; }
      H.money.add(i, sum); H.emit('mine', i, 'sold', sum); saveInv(i);
      H.toast(i, `💰 Myit ${n} malmia: +${sum} 🪙`); H.beep(880, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(1320, 0.15, 'triangle', 0.06), 120);
    } else if (pd.shop) {
      const o = pd.shop;
      if (!H.money.spend(i, o.p)) { H.toast(i, `${o.n} ×${o.k} maksaa ${o.p} 🪙`, true); return; }
      s.blocks[o.id] = Math.min(999, (s.blocks[o.id] || 0) + o.k); s.sel = o.id; saveInv(i);
      H.toast(i, `🧱 +${o.k} ${o.n} (${o.p} 🪙)`); H.beep(700, 0.08, 'triangle', 0.05);
    } else if (pd.kind === 'reset') {
      // 2.1: yksi painallus riittää
      if (H.players.some(q => inZone(q.pos, 0.3) && onFoot(q))) { H.toast(i, 'Kaikkien pitää ensin tulla pois Palikkamaasta', true); return; }
      st[i].resetArm = 0; generate(); rebuildQ = true; saveWorld(); H.toast(i, '🔄 Uusi kaivos luotu – malmeja on taas!'); H.beep(440, 0.2, 'sine', 0.06);
    }
  }
  function popMob(by) {
    mob.dead = 20; mob.g.visible = false; mob.fuse = 0;
    H.fx?.burst('confetti', mob.x, 0.8, mob.z, { n: 50, speed: 5, up: 5, life: 1.4 });
    H.fx?.burst('soft', mob.x, 0.6, mob.z, { n: 10, color: 0x9af09a, life: 0.8 });
    H.beep(160, 0.18, 'sawtooth', 0.06); setTimeout(() => H.beep(900, 0.12, 'triangle', 0.05), 90);
    H.players.forEach((q, k) => {
      if (q.car != null) return; const dx = q.pos.x - mob.x, dz = q.pos.z - mob.z, d = Math.hypot(dx, dz);
      if (d < 3.2) { if (q.grounded !== false) { q.vy = 6; q.grounded = false; } st[k].push = { x: dx / (d || 1) * 4, z: dz / (d || 1) * 4, t: 0.3 }; if (by == null) H.toast(k, '💥 Poks! Hiipijä räjähti konfetiksi 🎉'); }
    });
    if (by != null) {
      H.money.add(by, 3); inv[by].blocks[11] = (inv[by].blocks[11] || 0) + 1; saveInv(by);
      H.emit('mine', by, 'pops', 1); H.toast(by, '🟩 Poksautit Hiipijän: +3 🪙 ja hyytelöpalikka (pomppii!)');
    }
  }
  function updMob(dt) {
    if (!mob) return;
    if (mob.dead > 0) { mob.dead -= dt; if (mob.dead <= 0) spawnMob(); return; }
    let near = null, nd = 99;
    H.players.forEach(q => { if (q.car != null || !onFoot(q)) return; const d = Math.hypot(q.pos.x - mob.x, q.pos.z - mob.z); if (d < nd && Math.abs(q.pos.y - mob.y) < 2) { nd = d; near = q; } });
    if (mob.fuse > 0) {
      if (nd > 4.5) { mob.fuse = 0; mob.body.scale.setScalar(1); mob.outer.material.emissive.setHex(0x123f10); }
      else {
        mob.fuse += dt; const k = mob.fuse / 1.5;
        mob.body.scale.set(1 + k * 0.4 + Math.sin(mob.fuse * 30) * 0.04 * k, 1 + k * 0.35, 1 + k * 0.4);
        mob.outer.material.emissive.setHex(Math.sin(mob.fuse * 18) > 0 ? 0xffffff : 0x123f10); mob.outer.material.emissiveIntensity = 0.4 + k * 0.4;
        if (Math.random() < dt * 8) H.beep(1200 + k * 600, 0.03, 'sine', 0.02);
        if (mob.fuse >= 1.5) { mob.body.scale.setScalar(1); mob.outer.material.emissive.setHex(0x123f10); mob.outer.material.emissiveIntensity = 0.4; popMob(null); }
        return;
      }
    }
    if (near && nd < 2.2) { mob.fuse = 0.001; H.beep(300, 0.25, 'sawtooth', 0.03); return; }
    // vaeltelu: hyppii kohti kohdetta tai pelaajaa
    let tx = mob.tx, tz = mob.tz;
    if (near && nd < 9) { tx = near.pos.x; tz = near.pos.z; }
    else if (Math.hypot(tx - mob.x, tz - mob.z) < 0.5 || mob.wait < 0) {
      mob.tx = OX + 1 + Math.random() * (NX - 2); mob.tz = OZ + 12.5 + Math.random() * (NZ - 13); mob.wait = 6;
    }
    mob.wait -= dt;
    const d = Math.hypot(tx - mob.x, tz - mob.z);
    mob.hop += dt * 3.2; const ph = mob.hop % 1, air = ph < 0.55;
    if (d > 0.3 && air) {
      const sp = (near && nd < 9 ? 2.6 : 1.4) * dt, nx = mob.x + (tx - mob.x) / d * sp, nz = mob.z + (tz - mob.z) / d * sp;
      if (!H.voxBlock(nx, nz, mob.y, 0.5) && !H.game.isBlocked(nx, nz)) { mob.x = nx; mob.z = nz; } else mob.wait = -1;
      mob.yaw = Math.atan2(tx - mob.x, tz - mob.z);
    }
    const hy = air ? Math.sin(ph / 0.55 * Math.PI) * 0.6 : 0, sq = air ? 1 : 1 - Math.sin((ph - 0.55) / 0.45 * Math.PI) * 0.22;
    mob.y = H.voxGround(mob.x, mob.z, mob.y + 1.2) || 0;
    mob.g.position.set(mob.x, mob.y + hy, mob.z); mob.g.rotation.y = mob.yaw;
    mob.body.scale.set(1 + (1 - sq) * 0.6, sq, 1 + (1 - sq) * 0.6);
    if (!air && ph < 0.6 && !mob.landed) { mob.landed = true; if (Math.random() < 0.5) H.fx?.burst('dust', mob.x, mob.y + 0.05, mob.z, { n: 3, life: 0.4 }); } else if (air) mob.landed = false;
  }

  function hudFor(i, p, near, here) {
    const KL = a => (H.keyLabel ? H.keyLabel(i, a) : a), s = inv[i], k = { f: KL('fire'), e: KL('interact'), g: KL('swap') }, pad = false;
    if (!here && !near) { H.hud(i, '', 'palikka'); return; }
    if (near) {
      let t;
      const key = pad ? `${k.e} / 🎮X` : k.e;
      if (near.kind === 'pick') { const nx = PICKS[s.pick + 1]; t = nx ? `${key} = ${nx.price ? `osta ${nx.n} (${nx.price} 🪙)` : `ota ilmainen ${nx.n}`}` : 'Sinulla on paras hakku 💎'; }
      else if (near.kind === 'sell') { let sum = 0; for (const o in s.ores) sum += s.ores[o] * ORES[o].v; t = sum ? `${key} = myy malmit (+${sum} 🪙)` : 'Ei malmeja – kaiva kaivoksessa'; }
      else if (near.shop) t = `${key} = osta ${near.shop.n} ×${near.shop.k} (${near.shop.p} 🪙)`;
      else t = `${key} = uusi kaivos`;
      H.hud(i, `<div class="palikka-hud">⛏ ${t}</div>`, 'palikka'); return;
    }
    const ores = Object.entries(s.ores).filter(([, n]) => n > 0).map(([o, n]) => `${ORES[o].ic}${n}`).join(' ');
    const cnt = s.blocks[s.sel] || 0;
    H.hud(i, `<div class="palikka-hud"><b>⛏ ${PICKS[s.pick].n}</b> · 🧱 ${B[s.sel].n} ×${cnt}${ores ? ' · ' + ores : ''}<br><small>${k.f}${pad ? '/RT' : ''} = hakkaa · ${k.e}${pad ? '/X' : ''} = rakenna · ${k.g}${pad ? '/RB' : ''} = vaihda palikka</small></div>`, 'palikka');
  }

  H.onStart(() => {
    active = false; pads = []; hi = []; pickM = [null, null, null, null]; st = [{}, {}, {}, {}]; mob = null; meshes = null;
    if (H.challenge) return;
    if (!loadWorld()) { generate(20261027); saveWorld(); }
    inv = [loadInv(0), loadInv(1), loadInv(2), loadInv(3)];
    build(); active = true;
  });
  H.onStop(() => {
    if (active) { saveWorld(); [0, 1, 2, 3].forEach(saveInv); }
    critters.forEach(c => { try { H.removeObject?.(c.g); } catch {} }); critters = [];
    active = false; meshes = null; mob = null;
  });
  H.onUpdate(dt => {
    if (!active) return;
    if (saveT > 0 && (saveT -= dt) <= 0) saveWorld();
    const t = H.time;
    pads.forEach(pd => { if (pd.extra) { pd.extra.rotation.y = t * 1.2; pd.extra.position.y = 1.5 + Math.sin(t * 2 + pd.x) * 0.12; } });
    H.players.forEach((p, i) => {
      if (!inv[i]) return;
      const s = st[i] ||= {};
      const foot = onFoot(p), here = foot && inZone(p.pos, 0.5);
      // 2.1: irti jumista ilman pystysuuntaista teleporttia – työnnä vaakasuoraan, step-up vain pieni
      if (foot && inZone(p.pos, 1) && H.voxBlock(p.pos.x, p.pos.z, p.pos.y, 0.15)) {
        let freed = false;
        for (let n = 1; n <= 10 && !freed; n++) {
          const r = n * 0.28;
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2, nx = p.pos.x + Math.cos(a) * r, nz = p.pos.z + Math.sin(a) * r;
            if (!H.voxBlock(nx, nz, p.pos.y, 0.15) && !H.game.isBlocked(nx, nz)) { p.pos.x = nx; p.pos.z = nz; freed = true; break; }
          }
        }
        if (!freed) {
          // step-up vain jos katto on lähellä (≤1.2 m), ei koskaan NY+1-katolle
          const localTop = H.voxGround(p.pos.x, p.pos.z, p.pos.y + 1.4);
          if (localTop > p.pos.y && localTop - p.pos.y <= 1.25) { p.pos.y = localTop; p.vy = 0; }
        }
      }
      if (s.push) { s.push.t -= dt; const nx = p.pos.x + s.push.x * dt, nz = p.pos.z + s.push.z * dt; if (!H.voxBlock(nx, nz, p.pos.y) && !H.game.isBlocked(nx, nz)) { p.pos.x = nx; p.pos.z = nz; } if (s.push.t <= 0) s.push = null; }
      // hyytelöpalikka pomppaa
      if (foot && p.grounded && p.vy <= 0.01) {
        const cx = Math.floor(p.pos.x - OX), cz = Math.floor(p.pos.z - OZ), cy = Math.round(p.pos.y) - 1;
        if (Math.abs(p.pos.y - Math.round(p.pos.y)) < 0.06 && get(cx, cy, cz) === 11) { p.vy = 11; p.grounded = false; H.beep(260, 0.12, 'sine', 0.06); setTimeout(() => H.beep(520, 0.12, 'sine', 0.05), 60); H.fx?.burst('soft', p.pos.x, p.pos.y, p.pos.z, { n: 5, color: 0x9af09a, life: 0.5 }); }
      }
      updPick(p, i, here && inv[i].pick > 0);
      const nearPad = foot && !here ? pads.find(pd => Math.hypot(p.pos.x - pd.x, p.pos.z - pd.z) < 1.6 && p.pos.y < 1.5) : null;
      if (nearPad && H.pressed(i, 'interact')) usePad(i, nearPad);
      // kohdistus ja hakkaaminen
      const a = here ? aim(p) : { hit: null };
      const h = hi[i];
      if (a.hit) {
        h.visible = true; h.position.set(OX + a.hit[0] + 0.5, a.hit[1] + 0.5, OZ + a.hit[2] + 0.5);
        const key = a.hit.join(',');
        if (s.key !== key) { s.key = key; s.dmg = 0; }
      } else { h.visible = false; s.key = null; s.dmg = 0; }
      if (here) {
        const inp = H.input(i);
        s.swing = Math.max(0, (s.swing || 0) - dt);
        if (inp.fire && s.swing <= 0) {
          s.swing = 0.28; s.anim = 0.25;
          const v = H.game.dirVectors(p.yaw);
          if (!mob.dead && mob.g.visible && Math.hypot(mob.x - (p.pos.x + v.fx), mob.z - (p.pos.z + v.fz)) < 1.3 && Math.abs(mob.y - p.pos.y) < 1.5) popMob(i);
          else if (a.hit) {
            const id = get(...a.hit), b = B[id], pk = PICKS[inv[i].pick];
            if ((b.tier || 0) > pk.tier) {
              if (H.time - (s.warn || -9) > 2) { s.warn = H.time; H.toast(i, id === 14 ? 'Kivijalkaa ei voi rikkoa' : pk.tier === 0 ? '⛏ Tarvitset hakun! Hae ilmainen Kivihakku Hakkukojusta' : `⛏ ${b.n} vaatii paremman hakun (Rautahakku)`, true); }
              H.beep(120, 0.05, 'square', 0.03);
            } else {
              s.dmg += pk.pow; H.beep(220 + s.dmg * 30, 0.03, 'square', 0.025);
              H.fx?.burst('debris', h.position.x, h.position.y, h.position.z, { n: 3, color: debrisCol(id), speed: 1.5, up: 1.5, life: 0.4, spread: 0.5 });
              if (s.dmg >= b.hp) { breakBlock(i, a.hit); s.key = null; s.dmg = 0; h.visible = false; }
            }
          }
        }
        if (a.hit && s.key) { const b = B[get(...a.hit)]; const stg = b ? Math.min(4, Math.ceil((s.dmg / b.hp) * 4)) : 0; if (h.material.map !== crackTex[stg]) { h.material.map = crackTex[stg]; h.material.needsUpdate = true; } }
        if (pickM[i]) { s.anim = Math.max(0, (s.anim || 0) - dt); const k = s.anim > 0 ? Math.sin((1 - s.anim / 0.25) * Math.PI) : 0; pickM[i].g.rotation.x = -k * 1.4 + 0.15; }
        if (H.pressed(i, 'interact') && !H.cars.some(c => Math.hypot(c.pos.x - p.pos.x, c.pos.z - p.pos.z) < 4.6)) place(i, p);
        if (H.pressed(i, 'swap')) cycle(i);
      }
      hudFor(i, p, nearPad, here);
    });
    updMob(dt);
    if (rebuildQ) rebuild();
    if (active) updCritters(dt);
  });
  // testeille
  H.palikka = { get _st() { return st; }, get critters() { return critters; }, B, PICKS, ORES, OX, OZ, NX, NY, NZ, get, set: (x, y, z, v) => { set(x, y, z, v); rebuildQ = true; dirty(); }, inv: i => inv[i], generate: s => { generate(s); rebuildQ = true; saveWorld(); }, get mob() { return mob; }, get active() { return active; }, pads: () => pads, aim, popMob };
})();
