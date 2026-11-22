// moon.js (1.9) – Raketilla Kuuhun (pelaajakohtainen).
// Raketin kiertoradalla hyppy-näppäin vie pelaajan Kuuhun (H.toMoon). Muut pelaajat jäävät Maahan.
// Kuu on oma alueensa kaukana Maan kartasta (z ≈ 1600): regoliitti, kraatterit, futuristinen tukikohta,
// tähtitaivas ja Maa taivaalla. Painovoima on pieni (game.js: 0.3×). Paluu: Kuun raketti laskeutumisalustalla.
(function () {
  const H = window.HYYTE;
  const MX = 0, MZ = 1600, R = 120;
  const T = () => H.THREE;
  const CRATERS = [
    { x: -40, z: 30, r: 14, d: 1.0, rim: 0.7 }, { x: 46, z: -28, r: 18, d: 1.1, rim: 0.8 }, { x: 52, z: 44, r: 9, d: 0.9, rim: 0.5 },
    { x: -58, z: -40, r: 11, d: 0.9, rim: 0.6 }, { x: 10, z: 62, r: 12, d: 1.0, rim: 0.6 }, { x: -20, z: -62, r: 8, d: 0.8, rim: 0.45 },
    { x: 74, z: 8, r: 7, d: 0.7, rim: 0.4 }, { x: -78, z: 10, r: 10, d: 0.9, rim: 0.5 }, { x: 28, z: -70, r: 6, d: 0.6, rim: 0.35 },
    { x: -34, z: 70, r: 6, d: 0.6, rim: 0.35 }, { x: 84, z: -60, r: 13, d: 1.0, rim: 0.6 }, { x: -86, z: 64, r: 12, d: 1.0, rim: 0.6 },
  ];
  const PAD = { x: 0, z: -16 };                 // laskeutumisalusta (suhteessa keskipisteeseen)
  const SPAWN = { x: 0, z: -24 };
  const BASE_R = 30;                            // tukikohdan tasainen alue
  let root = null, sky = null, earth = null, hemi = null, hemiSave = null, beacon = null, mRocket = null, rockets = [];
  let trips = [], active = false, overlay = [];

  const inArea = (x, z) => z > 400 && Math.hypot(x - MX, z - MZ) < R + 40;
  function moonH(x, z) {
    const lx = x - MX, lz = z - MZ;
    let h = 1.2 + 0.12 * Math.sin(lx * 0.21) * Math.cos(lz * 0.17) + 0.07 * Math.sin(lx * 0.53 + lz * 0.41);
    for (const c of CRATERS) {
      const d = Math.hypot(lx - c.x, lz - c.z) / c.r;
      if (d < 1) h -= c.d * (1 - d * d);
      if (d > 0.7 && d < 1.6) h += c.rim * Math.exp(-(((d - 1) / 0.22) ** 2));
    }
    const b = Math.hypot(lx, lz);
    if (b < BASE_R) { const k = Math.max(0, (b - BASE_R + 8) / 8); h = 1.2 + (h - 1.2) * k; }
    return Math.max(0.05, h);
  }
  H.moonArea = inArea;
  // 2.9: Kuun OOB + body-disc (H.bodies.list, rekisteröidään bodies.js:ssä)
  H.moonOut = (x, z) => {
    const bodies = (H.bodies && (H.bodies.list || H.bodies.bodies)) || (H.v24 && H.v24.bodies);
    if (bodies) {
      for (const id of Object.keys(bodies)) {
        if (id === 'moon') continue;
        const b = bodies[id];
        const d = Math.hypot(x - b.mx, z - b.mz);
        if (d < (b.R || 100) + 40) return d > (b.R || 100);
      }
    }
    if (!inArea(x, z)) return false;
    return Math.hypot(x - MX, z - MZ) > R || obstacles.some(o => (x - o.x) ** 2 + (z - o.z) ** 2 < o.r * o.r);
  };
  H.moonH = moonH;
  let obstacles = [];
  // Palikkamaan voxGround laajennetaan: Kuun alueella maan korkeus = Kuun pinta
  const wrapGround = () => {
    const prev = H.voxGround;
    if (prev && prev.__moon) return;
    const f = (x, z, y) => (z > 400 && inArea(x, z) ? moonH(x, z) : prev ? prev(x, z, y) : 0);
    f.__moon = true; H.voxGround = f;
  };

  function canvasTex(w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new (T().CanvasTexture)(c); t.colorSpace = T().SRGBColorSpace;
    if (rep) { t.wrapS = t.wrapT = T().RepeatWrapping; t.repeat.set(rep, rep); }
    t.anisotropy = 8; return t;
  }
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const M = (o) => new (T().MeshStandardMaterial)(o);

  function regolith() {
    const r = rng(7);
    return canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#8d8b88'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { const v = 100 + r() * 80 | 0; g.fillStyle = `rgba(${v},${v},${v - 4},${0.25 + r() * 0.35})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
      for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, rr = 3 + r() * 16; const gr = g.createRadialGradient(x, y, 0, x, y, rr);
        gr.addColorStop(0, 'rgba(60,60,62,0.45)'); gr.addColorStop(0.75, 'rgba(90,90,92,0.15)'); gr.addColorStop(0.9, 'rgba(200,200,200,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
    }, 18);
  }
  function earthTex() {
    const r = rng(42);
    return canvasTex(512, 256, (g, w, h) => {
      const L = g.createLinearGradient(0, 0, 0, h); L.addColorStop(0, '#1b4f9c'); L.addColorStop(0.5, '#2f7fd8'); L.addColorStop(1, '#1b4f9c');
      g.fillStyle = L; g.fillRect(0, 0, w, h);
      const blob = (x, y, s, col) => { g.fillStyle = col; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, q = s * (0.6 + r() * 0.6); g.lineTo(x + Math.cos(a) * q * 1.4, y + Math.sin(a) * q); } g.fill(); };
      for (let i = 0; i < 12; i++) { const x = r() * w, y = 50 + r() * 150, s = 14 + r() * 30; blob(x, y, s, '#3d8b3d'); blob(x + 6, y + 4, s * 0.6, '#7a9a4a'); }
      g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 16, w, 16);
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.4})`; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 34, 3 + r() * 6, r() * 0.5, 0, 7); g.fill(); }
    });
  }
  function glowTex(c0, c1) {
    return canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, c0); gr.addColorStop(0.45, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  }
  function signTex(t1, t2, bg = '#0b1830', fg = '#7fe7ff') {
    return canvasTex(1024, 320, (g) => {
      g.fillStyle = bg; g.fillRect(0, 0, 1024, 320); g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(14, 14, 996, 292);
      g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
      const fit = (s, px, wt) => { g.font = `${wt} ${px}px sans-serif`; const m = g.measureText(s).width; if (m > 940) g.font = `${wt} ${Math.floor(px * 940 / m)}px sans-serif`; };
      fit(t1, 120, 800); g.fillText(t1, 512, t2 ? 125 : 160); if (t2) { g.fillStyle = '#ffffff'; fit(t2, 64, 700); g.fillText(t2, 512, 240); }
    });
  }

  function add(o, x, y, z, parent = root) { o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; }
  function block(x, z, r, h) { const o = { x: MX + x, z: MZ + z, r, h: h != null ? h : 1.2 }; obstacles.push(o); const g = H.obstacle(MX + x, MZ + z, r); if (g) g.h = o.h; }

  function build() {
    const G = T();
    root = new G.Group(); root.position.set(MX, 0, MZ); root.userData.noMerge = true;
    // maasto
    const geo = new G.PlaneGeometry(2 * R + 70, 2 * R + 70, 160, 160); geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position, col = new Float32Array(pa.count * 3);
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), z = pa.getZ(i), dist = Math.hypot(x, z);
      let y = moonH(MX + x, MZ + z); if (dist > R + 4) y += Math.min(9, (dist - R - 4) * 0.35);  // reunan vuoret
      pa.setY(i, y);
      const s = 0.82 + (y - 1.2) * 0.18 + Math.sin(x * 0.07 + z * 0.05) * 0.04; col[i * 3] = s; col[i * 3 + 1] = s; col[i * 3 + 2] = s * 1.02;
    }
    geo.setAttribute('color', new G.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const ground = new G.Mesh(geo, M({ map: regolith(), vertexColors: true, roughness: 1, metalness: 0, color: '#d8d6d2' }));
    ground.receiveShadow = true; root.add(ground);
    // kivet
    const rr = rng(3), rockGeo = new G.OctahedronGeometry(1, 1), rockM = M({ color: '#7a7875', roughness: 1, flatShading: true });
    for (let i = 0; i < 90; i++) {
      const a = rr() * 6.283, d = BASE_R + 4 + rr() * (R - BASE_R - 8), x = Math.cos(a) * d, z = Math.sin(a) * d, s = 0.25 + rr() ** 3 * 1.6;
      const m = new G.Mesh(rockGeo, rockM); m.scale.set(s * (0.8 + rr() * 0.6), s * (0.5 + rr() * 0.4), s * (0.8 + rr() * 0.6)); m.rotation.set(rr() * 3, rr() * 3, rr() * 3);
      add(m, x, moonH(MX + x, MZ + z) + s * 0.15, z); if (s > 0.9) block(x, z, s * 0.9);
    }
    // ---- tukikohta ----
    const white = M({ color: '#eef2f6', roughness: 0.35, metalness: 0.35 }), steel = M({ color: '#9aa4b0', roughness: 0.4, metalness: 0.7 });
    const glass = M({ color: '#8fd8ff', roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.38, emissive: '#1a6f9a', emissiveIntensity: 0.35, depthWrite: false });
    const neon = M({ color: '#7fe7ff', emissive: '#3ee0ff', emissiveIntensity: 1.8 }), neonPink = M({ color: '#ff8de1', emissive: '#ff4fd2', emissiveIntensity: 1.5 });
    const Y = 1.2;
    const dome = (x, z, r, green) => {
      add(new G.Mesh(new G.CylinderGeometry(r + 0.4, r + 0.6, 0.6, 40), white), x, Y + 0.3, z);
      const g = add(new G.Mesh(new G.SphereGeometry(r, 40, 20, 0, 6.283, 0, Math.PI / 2), glass), x, Y + 0.6, z); g.castShadow = false;
      add(new G.Mesh(new G.TorusGeometry(r + 0.42, 0.09, 8, 64), neon), x, Y + 0.62, z).rotation.x = Math.PI / 2;
      for (let k = 0; k < 6; k++) { const rib = add(new G.Mesh(new G.TorusGeometry(r + 0.03, 0.06, 6, 40, Math.PI), steel), x, Y + 0.6, z); rib.rotation.y = k / 6 * Math.PI; }
      if (green) { // kasvihuone: puita sisällä
        add(new G.Mesh(new G.CylinderGeometry(r * 0.8, r * 0.8, 0.3, 32), M({ color: '#3b2a1c', roughness: 1 })), x, Y + 0.75, z);
        for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, q = r * 0.5;
          add(new G.Mesh(new G.ConeGeometry(0.8, 2.4, 10), M({ color: '#4caf50', emissive: '#1d6b22', emissiveIntensity: 0.5, roughness: 0.8 })), x + Math.cos(a) * q, Y + 2.1, z + Math.sin(a) * q); }
      } else {
        add(new G.Mesh(new G.CylinderGeometry(1.2, 1.2, r * 0.9, 20), neonPink), x, Y + 0.6 + r * 0.45, z);
      }
      block(x, z, r + 0.6);
    };
    dome(-15, 8, 7, true); dome(15, 12, 5.5, false); dome(-2, 26, 4.5, false);
    // putkikäytävät kupolien välillä
    const tube = (x1, z1, x2, z2) => { const len = Math.hypot(x2 - x1, z2 - z1), m = new G.Mesh(new G.CylinderGeometry(0.9, 0.9, len, 18), white);
      m.rotation.z = Math.PI / 2; m.rotation.y = -Math.atan2(z2 - z1, x2 - x1); add(m, (x1 + x2) / 2, Y + 1.1, (z1 + z2) / 2);
      for (let k = 1; k < 4; k++) { const t = k / 4, ring = new G.Mesh(new G.TorusGeometry(0.93, 0.05, 6, 24), neon); ring.rotation.y = Math.PI / 2 - Math.atan2(z2 - z1, x2 - x1); add(ring, x1 + (x2 - x1) * t, Y + 1.1, z1 + (z2 - z1) * t); }
      for (let k = 0; k <= 6; k++) { const t = k / 6; block(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, 1.0, 0.85); } };
    tube(-8, 10, 9.5, 12); tube(-12, 14.5, -5, 23);
    // torni
    add(new G.Mesh(new G.CylinderGeometry(1.4, 2.2, 16, 16), white), 22, Y + 8, 30);
    for (let k = 0; k < 5; k++) add(new G.Mesh(new G.CylinderGeometry(1.75 - k * 0.1, 1.75 - k * 0.1, 0.25, 24), neon), 22, Y + 2.5 + k * 2.8, 30);
    add(new G.Mesh(new G.SphereGeometry(2.6, 24, 12), M({ color: '#cfe8ff', metalness: 0.6, roughness: 0.2, emissive: '#2a6f9a', emissiveIntensity: 0.5 })), 22, Y + 17, 30);
    add(new G.Mesh(new G.CylinderGeometry(0.06, 0.06, 6, 6), steel), 22, Y + 22, 30);
    beacon = add(new G.Mesh(new G.SphereGeometry(0.35, 12, 8), M({ color: '#ff3b3b', emissive: '#ff2020', emissiveIntensity: 3 })), 22, Y + 25, 30);
    block(22, 30, 2.4);
    // antennilautanen
    const dish = add(new G.Mesh(new G.SphereGeometry(3, 24, 10, 0, 6.283, 0, 1.0), M({ color: '#f4f6f8', side: 2, metalness: 0.3, roughness: 0.4 })), -26, Y + 4.4, 26);
    dish.rotation.x = -2.2; add(new G.Mesh(new G.CylinderGeometry(0.3, 0.5, 3.4, 10), steel), -26, Y + 1.7, 26); block(-26, 26, 1.2);
    // aurinkopaneelit
    const panelTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#0d2a6b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6f9cff'; g.lineWidth = 2;
      for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
    const panelM = M({ map: panelTex, metalness: 0.7, roughness: 0.25, emissive: '#0a1d55', emissiveIntensity: 0.4 });
    for (let row = 0; row < 2; row++) for (let k = 0; k < 5; k++) {
      const x = -34 + k * 4.2, z = -6 - row * 5;
      add(new G.Mesh(new G.CylinderGeometry(0.1, 0.1, 1.6, 6), steel), x, Y + 0.8, z);
      const p = add(new G.Mesh(new G.BoxGeometry(3.6, 0.08, 2.2), panelM), x, Y + 1.7, z); p.rotation.x = -0.5; block(x, z, 0.6);
    }
    // laskeutumisalusta + Kuun raketti
    const padTex = canvasTex(512, 512, (g) => { g.fillStyle = '#2b2f36'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#ffd60a'; g.lineWidth = 18; g.beginPath(); g.arc(256, 256, 220, 0, 7); g.stroke();
      g.fillStyle = '#ffffff'; g.font = '800 300px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', 256, 270); });
    add(new G.Mesh(new G.CylinderGeometry(6.2, 6.6, 0.3, 48), M({ map: padTex, roughness: 0.7, metalness: 0.2 })), PAD.x, Y + 0.15, PAD.z);
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; add(new G.Mesh(new G.SphereGeometry(0.16, 8, 6), k % 2 ? neon : neonPink), PAD.x + Math.cos(a) * 6.3, Y + 0.35, PAD.z + Math.sin(a) * 6.3); }
    mRocket = buildRocket(); mRocket.position.set(PAD.x + 3.2, Y + 0.3, PAD.z + 2.5); root.add(mRocket); block(PAD.x + 3.2, PAD.z + 2.5, 1.5);
    // kyltit
    const sign = (t1, t2, x, z, ry, w = 5) => { const m = new G.Mesh(new G.PlaneGeometry(w, w * 0.31), M({ map: signTex(t1, t2), emissive: '#ffffff', emissiveMap: null, emissiveIntensity: 0.05, roughness: 0.4 }));
      m.material.emissiveMap = m.material.map; m.material.emissiveIntensity = 0.9; const back = new G.Mesh(new G.BoxGeometry(w + 0.2, w * 0.31 + 0.2, 0.12), steel);
      const g = new G.Group(); g.add(back); m.position.z = 0.07; g.add(m); for (const sx of [-w / 2 + 0.3, w / 2 - 0.3]) { const po = new G.Mesh(new G.CylinderGeometry(0.07, 0.07, 1.6, 6), steel); po.position.set(sx, -w * 0.155 - 0.8, 0); g.add(po); }
      g.position.set(x, Y + 1.6 + w * 0.155, z); g.rotation.y = ry; root.add(g); return g; };
    sign('KUUTUKIKOHTA HYYTELÖ-1', 'Tervetuloa Kuuhun! 🌙', -7, -21, 0);
    sign('PALUU MAAHAN', 'raketti alustalla', 8.5, -16, -Math.PI / 2, 3.6);
    // Suomen lippu
    add(new G.Mesh(new G.CylinderGeometry(0.05, 0.05, 4, 6), steel), -2, Y + 2, -22);
    const flagTex = canvasTex(180, 110, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 180, 110); g.fillStyle = '#003580'; g.fillRect(50, 0, 30, 110); g.fillRect(0, 40, 180, 30); });
    add(new G.Mesh(new G.PlaneGeometry(1.8, 1.1), M({ map: flagTex, side: 2 })), -1.1, Y + 3.4, -22);
    // observatorio (lähellä laskeutumista) – 3.2: jaettu bodies.buildObservatory, sama paikka
    {
      const ox = 14, oz = -22;
      const mats = { wall: white, dome: glass, accent: steel };
      const d = { r: 4.2, h: 5.5 };
      const build = H.bodies && H.bodies.buildObservatory;
      if (build) {
        build(G, root, ox, Y, oz, d, mats, { worldX: MX + ox, worldZ: MZ + oz, enterR: 4.5 });
      } else {
        const obs = new G.Group();
        add(new G.Mesh(new G.CylinderGeometry(3.4, 3.8, 4.2, 24), white), 0, 2.1, 0, obs);
        const dome = new G.Mesh(new G.SphereGeometry(3.6, 20, 12, 0, 6.283, 0, Math.PI / 2), glass);
        dome.position.y = 4.2; obs.add(dome);
        const tube = new G.Mesh(new G.CylinderGeometry(0.28, 0.38, 5.5, 12), steel);
        tube.position.set(1.2, 5.0, 0); tube.rotation.z = -0.55; obs.add(tube);
        obs.position.set(ox, Y, oz); root.add(obs); block(ox, oz, 2.2, 4);
        const olab = H.makeLabel('🔭 OBSERVATORIO', { bg: '#212529', scale: 3.6 });
        olab.position.set(ox, Y + 7.2, oz); root.add(olab);
        if (!root.userData.observatories) root.userData.observatories = [];
        root.userData.observatories.push({ x: MX + ox, z: MZ + oz, r: 4.5 });
      }
    }
    // kuumönkijä
    const rover = new G.Group(); add(new G.Mesh(new G.BoxGeometry(2.6, 0.6, 1.6), white), 0, 0.9, 0, rover);
    add(new G.Mesh(new G.BoxGeometry(1.0, 0.5, 1.2), glass), -0.3, 1.45, 0, rover);
    for (let k = 0; k < 6; k++) { const w = add(new G.Mesh(new G.CylinderGeometry(0.38, 0.38, 0.3, 14), M({ color: '#333', roughness: 0.9 })), -0.9 + (k % 3) * 0.9, 0.4, k < 3 ? -0.9 : 0.9, rover); w.rotation.x = Math.PI / 2; }
    add(new G.Mesh(new G.SphereGeometry(0.12, 8, 6), neon), 1.35, 1.0, 0, rover);
    rover.position.set(-12, Y, -12); rover.rotation.y = 0.6; root.add(rover); block(-12, -12, 1.6);
    // jalanjälkiä polulla
    const fp = M({ color: '#5e5c59', roughness: 1 });
    for (let k = 0; k < 14; k++) { const m = new G.Mesh(new G.PlaneGeometry(0.22, 0.34), fp); m.rotation.x = -Math.PI / 2; add(m, (k % 2 ? 0.25 : -0.25) + Math.sin(k * 0.5) * 0.4, Y + 0.02, -28 + k * 0.9); m.castShadow = false; }
    H.addObject(root);

    // ---- taivas: tähdet, Maa, Aurinko (seuraavat kameraa, näkyvät vain Kuun näkymissä) ----
    sky = new G.Group(); sky.userData.noMerge = true;
    const N = 2200, pos = new Float32Array(N * 3), sc = rng(11), cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const u = sc() * 2 - 1, a = sc() * 6.283, s = Math.sqrt(1 - u * u), d = 280;
      pos[i * 3] = Math.cos(a) * s * d; pos[i * 3 + 1] = Math.abs(u) * d * (u < -0.15 ? -1 : 1); pos[i * 3 + 2] = Math.sin(a) * s * d;
      const w = 0.7 + sc() * 0.3, tint = sc(); cols[i * 3] = w * (tint > 0.85 ? 1 : 0.9); cols[i * 3 + 1] = w * 0.92; cols[i * 3 + 2] = w * (tint < 0.2 ? 0.75 : 1); }
    const sg = new G.BufferGeometry(); sg.setAttribute('position', new G.BufferAttribute(pos, 3)); sg.setAttribute('color', new G.BufferAttribute(cols, 3));
    const stars = new G.Points(sg, new G.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false }));
    stars.frustumCulled = false; sky.add(stars);
    const eDir = new G.Vector3(0.28, 0.36, 0.89).normalize();
    earth = new G.Mesh(new G.SphereGeometry(20, 48, 24), new G.MeshStandardMaterial({ map: earthTex(), emissive: '#ffffff', emissiveMap: null, emissiveIntensity: 0, roughness: 0.6, fog: false }));
    earth.material.emissiveMap = earth.material.map; earth.material.emissiveIntensity = 0.55; earth.position.copy(eDir).multiplyScalar(250); earth.rotation.z = 0.4; sky.add(earth);
    const glow = new G.Sprite(new G.SpriteMaterial({ map: glowTex('rgba(140,200,255,0.9)', 'rgba(60,140,255,0.35)'), blending: 2, transparent: true, depthWrite: false, fog: false }));
    glow.scale.set(62, 62, 1); glow.position.copy(earth.position).multiplyScalar(1.01); sky.add(glow);
    const sunS = new G.Sprite(new G.SpriteMaterial({ map: glowTex('rgba(255,255,240,1)', 'rgba(255,230,160,0.35)'), blending: 2, transparent: true, depthWrite: false, fog: false }));
    sunS.scale.set(48, 48, 1); sunS.position.set(-150, 160, -160); sky.add(sunS);
    sky.visible = false; sky.renderOrder = -5;
    stars.onBeforeRender = (r, s, cam) => { sky.position.copy(cam.position); sky.updateMatrixWorld(); };
    H.addObject(sky);
  }
  function buildRocket() {
    const G = T(), g = new G.Group();
    const w = M({ color: '#f5f7fa', metalness: 0.3, roughness: 0.35 }), red = M({ color: '#e03131', roughness: 0.5 });
    const body = new G.Mesh(new G.CylinderGeometry(0.9, 1.05, 7, 24), w); body.position.y = 4.4; g.add(body);
    const nose = new G.Mesh(new G.ConeGeometry(0.9, 2.4, 24), red); nose.position.y = 9.1; g.add(nose);
    const win = new G.Mesh(new G.CircleGeometry(0.35, 20), M({ color: '#7fe7ff', emissive: '#3ee0ff', emissiveIntensity: 1.2 })); win.position.set(0, 6.2, 0.93); g.add(win);
    for (let k = 0; k < 4; k++) { const f = new G.Mesh(new G.BoxGeometry(0.12, 1.8, 1.4), red); const a = k / 4 * 6.283; f.position.set(Math.cos(a) * 1.15, 1.6, Math.sin(a) * 1.15); f.rotation.y = -a; g.add(f); }
    const flame = new G.Mesh(new G.ConeGeometry(0.75, 2.6, 16, 1, true), new G.MeshStandardMaterial({ color: '#000000', emissive: '#ffb347', emissiveIntensity: 2.2, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
    flame.rotation.x = Math.PI; flame.position.y = 0.0; flame.visible = false; g.add(flame); g.userData.flame = flame;
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }

  // ---- matkat ----
  function vpEl(i) { return document.querySelector(`.vp.v${i}`); }
  function showFly(i, text, sec) {
    const vp = vpEl(i); if (!vp) return;
    let d = vp.querySelector('.moon-fly'); if (!d) { d = document.createElement('div'); d.className = 'moon-fly'; vp.appendChild(d); }
    d.innerHTML = `<div class="mf-stars"></div><b>${text}</b><i style="animation-duration:${sec}s"></i>`; d.style.display = 'flex';
  }
  function hideFly(i) { const d = vpEl(i)?.querySelector('.moon-fly'); if (d) d.style.display = 'none'; }

  H.toMoon = (p) => {
    if (!active || !root || !p || p.moon || trips.some(t => t.p === p)) return;
    p.lock = true; p.lockHint = '🚀 Matka Kuuhun…';
    trips.push({ p, kind: 'up', t: 0, dur: 3.5 });
    showFly(p.index, '🚀 Matka Kuuhun…', 3.5); H.beep(110, 0.5, 'sawtooth', 0.06);
  };
  function arriveMoon(p) {
    try { (H.bodies?.clearArrivalState || H.v24?.clearArrivalState)?.(p); } catch (e) {}
    try { H.homes?.stand?.(p.index); } catch (e) {}
    try { H.game.exitRocket?.(p); } catch (e) {}
    p.rocket = false; p.group.visible = true; p.disc && (p.disc.visible = true); p.group.scale.setScalar(1.35);
    p.firstPerson = false; p.vy = 0; p.air = 'none'; p.grounded = true; p.chute && (p.chute.visible = false); p.seat && (p.seat.visible = false);
    p.tvActive = false; p.speed = 0; p._bodyId = 'moon'; p._bodyGrav = 0.165;
    if (p.car != null && H.cars && H.cars[p.car]) { try { H.cars[p.car].occupied = null; } catch (_) {} p.car = null; }
    const k = p.index;
    // avoin spawn etelään padista (ei raketin/esteiden sisällä)
    const sx = MX + SPAWN.x + (k - 1.5) * 1.6, sz = MZ + SPAWN.z - 2;
    p.pos.set(sx, moonH(sx, sz) + 0.05, sz);
    p.yaw = Math.PI; p.pitch = 0; p.camS = null; p.camK = null; p.moon = true;
    p.lock = false; p.lockHint = null; p.enterLock = 0.2;
    hideFly(k);
    H.toast(k, '🌙 Tervetuloa Kuuhun! Painovoima on pieni – hyppää korkealle. Paluu: raketti laskeutumisalustalla.');
    H.emit('moon', k, true);
    try { (H.vehicles?.spawnMoonVehicles || H.v24?.spawnMoonVehicles)?.(); } catch (_) {}
  }
  function launchHome(p) {
    p.lock = true; p.lockHint = '🚀 Paluu Maahan: 3…';
    trips.push({ p, kind: 'down', t: 0, dur: 3.2 });
    H.beep(90, 0.3, 'sawtooth', 0.06);
  }
  function arriveEarth(p) {
    const ri = H.game.rocketInfo?.() || { x: -1.2, z: 2.35 }, k = p.index;
    p.moon = false; p.lock = false; p.lockHint = null; p.vy = 0; p.air = 'none'; p.grounded = true; p.camS = null; p.camK = null; p.enterLock = 0.8;
    p.pos.set(ri.x + 2.8, 0, ri.z + (k - 1.5) * 1.8); p.yaw = Math.PI / 2;
    hideFly(k); if (mRocket) { mRocket.position.y = 1.5; mRocket.userData.flame.visible = false; }
    H.toast(k, '🌍 Takaisin Maassa! Tervetuloa kotiin.');
    H.emit('moon', k, false);
  }
  const nearPad = (p) => Math.hypot(p.pos.x - (MX + PAD.x + 3.2), p.pos.z - (MZ + PAD.z + 2.5)) < 5;
  H.moonHint = (p) => {
    const t = trips.find(q => q.p === p); if (t) return p.lockHint;
    return nearPad(p) ? `🚀 ${H.keyLabel(p.index, 'interact')} = lennä takaisin Maahan` : `🌙 Kuu · pieni painovoima · ${H.keyLabel(p.index, 'jump')} hyppää · paluuraketti laskeutumisalustalla`;
  };

  // Näkymäkohtainen maailma: Kuun näkymissä musta tähtitaivas, ei sumua, harmaa valo
  H.viewWorld = (p, cam) => {
    if (!root) return;
    const moon = !!p.moon && !p.rocket;
    if (sky) sky.visible = moon;
    if (moon) {
      const sc = H.scene; sc.background = blackC; sc.fog = null; H.skyNight?.(true);
      if (hemi) { hemi.intensity = hemiSave.i * 0.45; hemi.color.set('#d9dce6'); hemi.groundColor.set('#3a3a40'); }
    } else if (hemi) { hemi.intensity = hemiSave.i; hemi.color.copy(hemiSave.c); hemi.groundColor.copy(hemiSave.g); }
  };
  let blackC = null;

  H.onStart(() => {
    wrapGround();
    trips = []; obstacles = []; active = true;
    blackC = new (T().Color)('#02030a');
    try { build(); } catch (e) { console.warn('moon build', e); root = null; }
    hemi = null; H.scene.traverse(o => { if (!hemi && o.isHemisphereLight) hemi = o; });
    if (hemi) hemiSave = { i: hemi.intensity, c: hemi.color.clone(), g: hemi.groundColor.clone() };
    H.players.forEach(p => { p.moon = false; });
  });
  H.onStop(() => { active = false; root = null; sky = null; trips = []; if (hemi && hemiSave) { hemi.intensity = hemiSave.i; } hemi = null; });

  H.onUpdate((dt) => {
    if (!active || !root) return;
    const t0 = H.time;
    if (beacon) beacon.material.emissiveIntensity = (Math.sin(t0 * 4) > 0.3) ? 3 : 0.2;
    if (earth) earth.rotation.y += dt * 0.05;
    const scale = (typeof H._rocketTimeScale === 'number' && H._rocketTimeScale > 0) ? H._rocketTimeScale : 1;
    for (const q of trips.slice()) {
      q.t += dt * scale; const p = q.p;
      if (q.kind === 'up') { if (q.t >= q.dur) { trips.splice(trips.indexOf(q), 1); arriveMoon(p); } }
      else {
        const left = Math.ceil(q.dur - q.t);
        p.lockHint = left > 0 ? `🚀 Paluu Maahan: ${left}…` : '🚀 Lähtö!';
        if (mRocket) { mRocket.userData.flame.visible = true; mRocket.userData.flame.scale.setScalar(0.8 + Math.random() * 0.4); mRocket.position.y = 1.5 + Math.max(0, q.t - 1.6) ** 2 * 3; }
        if (q.t > 2.2 && !q.fly) { q.fly = true; showFly(p.index, '🌍 Paluu Maahan…', 1.2); }
        if (q.t >= q.dur) { trips.splice(trips.indexOf(q), 1); arriveEarth(p); }
      }
    }
    H.players.forEach((p, i) => {
      if (!p.moon || p.lock || trips.some(q => q.p === p)) return;
      // v24 muut planeetat käyttävät p.moon-lippua painovoimaan — älä nykäise niitä Kuuhun
      if (p._bodyId && p._bodyId !== 'moon') return;
      if (H.pressed(i, 'interact') && nearPad(p)) launchHome(p);
      // pudonnut kraatterin pohjan alle / ulos alueelta → takaisin tukikohtaan
      if (!inArea(p.pos.x, p.pos.z)) { p.pos.set(MX + SPAWN.x, moonH(MX, MZ + SPAWN.z), MZ + SPAWN.z); }
    });
  });
  H.moon = {
    center: { x: MX, z: MZ },
    pad: () => ({ x: MX + PAD.x + 3.2, z: MZ + PAD.z + 2.5 }),
    height: moonH,
    players: () => H.players.filter(p => p.moon).map(p => p.index),
    observatories: () => (root && root.userData.observatories) || [],
  };
})();
