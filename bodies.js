// bodies.js – peili, teleportti, aurinkokunta, kuumönkijät, pöly, Milky Way, kaivos, arcade.
(function () {
  const H = window.HYYTE;
  if (!H) return;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.65, metalness: o.m ?? 0,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1, side: o.side ?? 0, fog: o.fog !== false,
  });
  const box = (w, h, d, m, x, y, z, p) => {
    const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m);
    o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o;
  };
  const cyl = (rt, rb, h, m, x, y, z, p, seg = 12) => {
    const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), m);
    o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o;
  };
  const sph = (r, m, x, y, z, p) => {
    const o = new (T().Mesh)(new (T().SphereGeometry)(r, 12, 10), m);
    o.position.set(x, y, z); p && p.add(o); return o;
  };

  H.movableObjects = H.movableObjects || [];
  H.registerMovable = (obj) => { if (obj && !H.movableObjects.includes(obj)) H.movableObjects.push(obj); return obj; };
  const obsMeshes = []; // 3.3: observatoriot, näkyviin vain lähellä


  // ---------- aurinkokunnan kappaleet (lazy) ----------
  // MZ-offsetit erillään Kuusta (1600) — jokainen maailma ~400 m välein Z:ssä
  const BODIES = {
    moon:     { id: 'moon', name: 'Kuu', emoji: '🌙', grav: 0.165, mx: 0, mz: 1600, R: 120, sky: '#02030a', ground: 0x9aa0a8, thick: 1, rings: false, sun: false, unique: 'lippu + tukikohta' },
    mercury:  { id: 'mercury', name: 'Merkurius', emoji: '☿️', grav: 0.38, mx: 0, mz: 2200, R: 90, sky: '#0a0a12', ground: 0x8a7f72, thick: 1, accent: 0xffd43b, unique: 'kraatterikenttä' },
    venus:    { id: 'venus', name: 'Venus', emoji: '♀️', grav: 0.9, mx: 0, mz: 2800, R: 100, sky: '#2a1808', ground: 0xc9a26b, thick: 1.1, fog: 0xd4a373, unique: 'keltainen usva' },
    mars:     { id: 'mars', name: 'Mars', emoji: '♂️', grav: 0.38, mx: 0, mz: 3400, R: 110, sky: '#1a0808', ground: 0xb35c3a, thick: 1, accent: 0xff6b4a, unique: 'punainen hiekka + Olympus' },
    jupiter:  { id: 'jupiter', name: 'Jupiter', emoji: '♃', grav: 2.5, mx: 0, mz: 4000, R: 130, sky: '#0a0c18', ground: 0xc48a3a, thick: 1.55, accent: 0xe8590c, unique: 'kaikki paksua + kova painovoima' },
    saturn:   { id: 'saturn', name: 'Saturnus', emoji: '♄', grav: 1.06, mx: 0, mz: 4600, R: 120, sky: '#0c1018', ground: 0xd4b483, thick: 1.15, rings: true, accent: 0xffd8a8, unique: 'renkaat taivaalla + rengasteema' },
    uranus:   { id: 'uranus', name: 'Uranus', emoji: '♅', grav: 0.89, mx: 0, mz: 5200, R: 100, sky: '#061018', ground: 0x7ec8c8, thick: 1, accent: 0x66d9e8, unique: 'jääiset rakennukset' },
    neptune:  { id: 'neptune', name: 'Neptunus', emoji: '♆', grav: 1.14, mx: 0, mz: 5800, R: 100, sky: '#040820', ground: 0x3b5bdb, thick: 1.05, accent: 0x748ffc, unique: 'sininen myrsky' },
    europa:   { id: 'europa', name: 'Europa (Jupiter)', emoji: '🧊', grav: 0.13, mx: 400, mz: 4000, R: 70, sky: '#050814', ground: 0xdbe4ee, thick: 1, unique: 'jäinen kuori' },
    titan:    { id: 'titan', name: 'Titan (Saturnus)', emoji: '🟠', grav: 0.14, mx: 400, mz: 4600, R: 80, sky: '#1a1008', ground: 0xc18c5d, thick: 1, fog: 0xaa7744, unique: 'oranssi usva' },
    sun:      { id: 'sun', name: 'Aurinko', emoji: '☀️', grav: 8, mx: 0, mz: 6400, R: 140, sky: '#1a0a00', ground: 0xff922b, thick: 1.2, sun: true, accent: 0xffe066, unique: 'naurettavat aurinkolasit' },
  };
  const builtWorlds = Object.create(null);
  let destPicker = null;
  let pendingDest = 'moon';

  function themeFor(body) {
    const thick = body.thick || 1;
    const wallC = body.ground || 0xc5ccd6;
    const acc = body.accent || 0x74c0fc;
    return {
      wall: M(wallC, { m: 0.25, r: 0.5, e: acc, ei: 0.12 }),
      roof: M(acc, { m: 0.35, e: acc, ei: 0.3 }),
      glow: M(acc, { e: acc, ei: 1.0 }),
      ground: M(wallC, { r: 0.92 }),
      accent: M(acc, { e: acc, ei: 0.7 }),
      dome: M(0xa5d8ff, { m: 0.15, r: 0.25, e: acc, ei: 0.3, op: 0.5 }),
      thick,
      rings: !!body.rings,
      sun: !!body.sun,
    };
  }


  function buildObservatory(G, root, x, yBase, z, d, mats, opts) {
    opts = opts || {};
    const g = new G.Group();
    cyl(d.r * 0.85, d.r * 0.95, d.h * 0.7, mats.wall, 0, d.h * 0.35, 0, g, 20);
    const dome = new G.Mesh(new G.SphereGeometry(d.r * 0.95, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mats.dome);
    dome.position.y = d.h * 0.7; g.add(dome);
    const tube = cyl(0.35, 0.45, d.r * 1.6, mats.accent, d.r * 0.2, d.h * 0.85, 0, g, 10);
    tube.rotation.z = -0.55;
    try {
      const lab = H.makeLabel('🔭 OBSERVATORIO', { bg: '#212529', scale: 3.8 });
      lab.position.set(0, d.h + 1.4, 0); g.add(lab);
    } catch (_) {}
    g.position.set(x, yBase, z); root.add(g);
    const wx = opts.worldX != null ? opts.worldX : x;
    const wz = opts.worldZ != null ? opts.worldZ : z;
    H.addObstacle?.(wx, wz, d.r * 0.55, d.h);
    if (!root.userData.observatories) root.userData.observatories = [];
    root.userData.observatories.push({ x: wx, z: wz, r: opts.enterR != null ? opts.enterR : Math.max(3.5, d.r * 1.15) });
    g.userData.obsWX = wx; g.userData.obsWZ = wz;
    obsMeshes.push(g);
    return g;
  }

  function layoutDefs(body) {
    const t = body.thick || 1;
    const base = [
      // kupoli sivussa — ei spawn-pisteen päällä
      { kind: 'dome', x: -12, z: 18, r: 7 * t, h: 5 * t },
      { kind: 'shop', x: -16, z: 8, w: 6.5 * t, d: 4.5 * t, h: 3.2 * t, label: 'KAUPPA' },
      { kind: 'shop', x: 16, z: 8, w: 6.5 * t, d: 4.5 * t, h: 3.2 * t, label: 'KAHVILA' },
      { kind: 'pad', x: -9, z: -12, label: 'TYÖ' },
      { kind: 'pad', x: 9, z: -12, label: 'TEHTÄVÄ' },
      { kind: 'park', x: 0, z: 16, r: 5.5 },
      { kind: 'tower', x: 0, z: -20, h: 8 * t },
      { kind: 'dome', x: -24, z: 14, r: 4 * t, h: 3 * t },
      { kind: 'dome', x: 24, z: 14, r: 4 * t, h: 3 * t },
      { kind: 'observatory', x: 22, z: -28, r: 4.2 * t, h: 5.5 * t },
    ];
    if (body.rings) {
      base.push({ kind: 'ringArch', x: 0, z: -8 });
      base.push({ kind: 'shop', x: -8, z: 22, w: 8 * t, d: 3 * t, h: 2.5 * t, label: 'RENGAS' });
    }
    if (body.id === 'jupiter') {
      base.push({ kind: 'shop', x: -22, z: -8, w: 10 * t, d: 8 * t, h: 5 * t, label: 'PAINO' });
    }
    if (body.id === 'mars') {
      base.push({ kind: 'tower', x: -18, z: -18, h: 14 });
    }
    if (body.sun) {
      base.push({ kind: 'shop', x: 0, z: 24, w: 9, d: 6, h: 4, label: 'LASIT' });
    }
    if (body.id === 'neptune') {
      base.push({ kind: 'park', x: 18, z: -14, r: 7 });
    }
    return base;
  }

  function buildBodyWorld(body) {
    if (builtWorlds[body.id]) return builtWorlds[body.id];
    const G = T();
    const mats = themeFor(body);
    const root = new G.Group();
    root.name = 'v24-world-' + body.id;
    const MX = body.mx, MZ = body.mz, R = body.R;
    // ground disc
    const ground = new G.Mesh(new G.CylinderGeometry(R, R, 1.2, 48), mats.ground);
    ground.position.set(MX, -0.4, MZ); ground.receiveShadow = true; root.add(ground);
    // soft hills
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2, rr = R * (0.35 + (k % 3) * 0.15);
      const hill = new G.Mesh(new G.SphereGeometry(6 + (k % 4), 10, 8), mats.ground);
      hill.position.set(MX + Math.cos(a) * rr, 1.5, MZ + Math.sin(a) * rr);
      hill.scale.y = 0.35; root.add(hill);
    }
    const defs = layoutDefs(body);
    const yBase = 0.2;
    for (const d of defs) {
      const x = MX + d.x, z = MZ + d.z;
      if (d.kind === 'dome') {
        const dome = new G.Mesh(new G.SphereGeometry(d.r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mats.dome);
        dome.position.set(x, yBase, z); root.add(dome);
        cyl(d.r * 1.02, d.r * 1.02, 0.18, mats.accent, x, yBase + 0.1, z, root, 20);
        H.addObstacle?.(x, z, d.r * 0.8, d.h * 0.5);
      } else if (d.kind === 'shop') {
        const g = new G.Group();
        box(d.w, d.h, d.d, mats.wall, 0, d.h / 2, 0, g);
        box(d.w + 0.35, 0.22, d.d + 0.35, mats.roof, 0, d.h + 0.08, 0, g);
        if (mats.rings) {
          // rengasteema: vaakasuoria renkaita kattoon
          for (let i = 0; i < 3; i++) {
            const ring = cyl(d.w * 0.55 + i * 0.35, d.w * 0.55 + i * 0.35, 0.08, mats.accent, 0, d.h + 0.35 + i * 0.2, 0, g, 24);
            ring.scale.y = 0.4;
          }
        }
        const lab = H.makeLabel((body.emoji || '') + ' ' + d.label, { bg: '#212529', scale: 3.6 });
        lab.position.set(0, d.h + 1.1, 0); g.add(lab);
        g.position.set(x, yBase, z); root.add(g);
        H.addObstacle?.(x, z, Math.max(d.w, d.d) * 0.45, d.h);
      } else if (d.kind === 'pad') {
        cyl(1.4, 1.4, 0.12, mats.glow, x, yBase + 0.08, z, root, 20);
        const lab = H.makeLabel(d.label, { scale: 3, size: 36 }); lab.position.set(x, yBase + 2, z); root.add(lab);
      } else if (d.kind === 'park') {
        cyl(d.r, d.r, 0.08, mats.ground, x, yBase + 0.04, z, root, 24);
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          cyl(0.14, 0.18, 1.5 * (mats.thick || 1), mats.accent, x + Math.cos(a) * d.r * 0.5, yBase + 0.75, z + Math.sin(a) * d.r * 0.5, root, 8);
        }
      } else if (d.kind === 'tower') {
        box(1.5 * (mats.thick || 1), d.h, 1.5 * (mats.thick || 1), mats.wall, x, yBase + d.h / 2, z, root);
        sph(0.35, mats.glow, x, yBase + d.h + 0.3, z, root);
        H.addObstacle?.(x, z, 1.1, d.h);
      } else if (d.kind === 'observatory') {
        buildObservatory(G, root, x, yBase, z, d, mats);
      } else if (d.kind === 'ringArch') {
        for (let i = 0; i < 5; i++) {
          const ring = cyl(5 + i * 1.2, 5 + i * 1.2, 0.12, mats.accent, x, yBase + 3 + i * 0.15, z, root, 32);
          ring.rotation.x = Math.PI / 2.4;
        }
      }
    }
    // return pad
    const padX = MX + 8, padZ = MZ - 18;
    cyl(2.2, 2.2, 0.15, mats.glow, padX, yBase + 0.1, padZ, root, 24);
    const plab = H.makeLabel('🚀 PALUU', { bg: '#c92a2a', scale: 4.5 }); plab.position.set(padX, yBase + 2.6, padZ); root.add(plab);
    // sky / milky way + optional rings
    const sky = new G.Group();
    sky.name = 'v24-sky-' + body.id;
    // milky way band
    try {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
      const ctx = c.getContext('2d');
      const grd = ctx.createLinearGradient(0, 0, 1024, 0);
      grd.addColorStop(0, 'rgba(20,24,48,0)');
      grd.addColorStop(0.2, 'rgba(180,200,255,0.15)');
      grd.addColorStop(0.45, 'rgba(255,240,255,0.55)');
      grd.addColorStop(0.55, 'rgba(200,220,255,0.45)');
      grd.addColorStop(0.8, 'rgba(160,180,255,0.18)');
      grd.addColorStop(1, 'rgba(20,24,48,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 1024, 256);
      for (let i = 0; i < 600; i++) {
        const x = Math.random() * 1024, y = 40 + Math.random() * 176;
        const a = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      const tex = new G.CanvasTexture(c); if (G.SRGBColorSpace) tex.colorSpace = G.SRGBColorSpace;
      const band = new G.Mesh(new G.SphereGeometry(380, 32, 16, 0, Math.PI * 2, 0.15, 1.0),
        new G.MeshStandardMaterial({ map: tex, side: 1, transparent: true, depthWrite: false, fog: false, emissive: 0xffffff, emissiveIntensity: 0.35, metalness: 0, roughness: 1 }));
      band.rotation.z = 0.4; sky.add(band);
    } catch (_) {}
    // stars
    {
      const c = document.createElement('canvas'); c.width = 512; c.height = 512;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`; ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1); }
      const tex = new G.CanvasTexture(c);
      const stars = new G.Mesh(new G.SphereGeometry(420, 24, 16), new G.MeshStandardMaterial({ map: tex, side: 1, depthWrite: false, fog: false, emissive: 0xffffff, emissiveIntensity: 0.55, metalness: 0, roughness: 1 }));
      sky.add(stars);
    }
    if (body.rings) {
      const ringMat = M(0xffe8cc, { e: 0xffd8a8, ei: 0.55, op: 0.65, side: 2 });
      // RingGeometry may be missing in stripped THREE — use flat torus/cylinder disks
      let ringGeo;
      if (G.RingGeometry) ringGeo = new G.RingGeometry(80, 160, 64);
      else if (G.TorusGeometry) ringGeo = new G.TorusGeometry(120, 18, 8, 48);
      else ringGeo = new G.CylinderGeometry(160, 160, 2, 48, 1, false);
      const ring = new G.Mesh(ringGeo, ringMat);
      ring.rotation.x = G.TorusGeometry && !G.RingGeometry ? 0.35 : Math.PI / 2.3;
      ring.position.set(0, 40, -120); sky.add(ring);
    }
    if (body.sun) {
      const sunBall = sph(28, M(0xffe066, { e: 0xff922b, ei: 2.2, fog: false }), 0, 60, -100, sky);
    }
    sky.visible = false;
    sky.onBeforeRender = (r, s, cam) => { sky.position.copy(cam.position); sky.updateMatrixWorld(); };
    root.add(sky);
    H.scene.add(root);
    const info = {
      body, root, sky, pad: { x: padX, z: padZ }, MX, MZ, R,
      observatories: (root.userData.observatories || []).slice(),
      spawn: { x: MX + 12, z: MZ - 14 }, // avoin alue, ei kupolissa
    };
    builtWorlds[body.id] = info;
    return info;
  }

  function ensureWorld(id) {
    const body = BODIES[id] || BODIES.moon;
    if (id === 'moon') return { body: BODIES.moon, existing: true }; // moon.js builds moon
    return buildBodyWorld(body);
  }

  // ---------- destination picker ----------
  function showDestPicker(player, opts) {
    hideDestPicker();
    const onPick = opts && opts.onPick;
    const wrap = document.createElement('div');
    wrap.className = 'v24-dest';
    wrap.innerHTML = `<div class="v24-dest-card"><h2>🚀 Minne matkustetaan?</h2>
      <div class="v24-dest-grid">${Object.values(BODIES).map(b =>
        `<button type="button" data-body="${b.id}">${b.emoji} <b>${b.name}</b><small>${b.unique || ''}</small></button>`
      ).join('')}</div>
      <p class="hint">${onPick ? 'Valitse kohde — matka alkaa heti.' : 'Valinta tallentuu. Kiertoradalla matka käynnistyy automaattisesti (tai hyppää).'}</p>
      <button type="button" class="v24-dest-close">Sulje</button></div>`;
    Object.assign(wrap.style, {
      position: 'fixed', inset: '0', zIndex: '80', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(4,10,20,.72)', fontFamily: 'inherit',
    });
    const style = document.createElement('style');
    style.textContent = `.v24-dest-card{background:#102430;border:3px solid #f6c445;border-radius:18px;padding:18px 20px;max-width:720px;width:92%;color:#fff6e8}
      .v24-dest-card h2{margin:0 0 10px;text-align:center}
      .v24-dest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;max-height:50vh;overflow:auto}
      .v24-dest-grid button{background:#1b3a4a;border:2px solid #3aa0ff;border-radius:12px;color:#fff;padding:10px 8px;cursor:pointer;font:inherit;text-align:left}
      .v24-dest-grid button:hover,.v24-dest-grid button.on{background:#2f7de1}
      .v24-dest-grid small{display:block;opacity:.8;font-size:11px;margin-top:2px}
      .v24-dest-close{margin-top:12px;width:100%;padding:10px;border-radius:12px;border:0;background:#f6c445;color:#102430;font-weight:900;cursor:pointer}`;
    wrap.appendChild(style);
    document.body.appendChild(wrap);
    destPicker = wrap;
    wrap.querySelectorAll('[data-body]').forEach(btn => {
      if (btn.dataset.body === pendingDest) btn.classList.add('on');
      btn.onclick = () => {
        pendingDest = btn.dataset.body;
        if (player) player._destBody = pendingDest;
        H._rocketDest = pendingDest;
        wrap.querySelectorAll('[data-body]').forEach(b => b.classList.toggle('on', b.dataset.body === pendingDest));
        H.toast?.(player?.index ?? 0, `${BODIES[pendingDest].emoji} Kohde: ${BODIES[pendingDest].name}`);
        hideDestPicker();
        if (typeof onPick === 'function') {
          try { onPick(pendingDest, player); } catch (e) { console.warn(e); }
        }
      };
    });
    wrap.querySelector('.v24-dest-close').onclick = hideDestPicker;
    // 3.0: ohjain siirtyy listalle
    if (H.menuPad && player) {
      const bodies = Object.values(BODIES);
      H.menuPad.show({
        owner: player.index,
        title: '🚀 Minne matkustetaan?',
        grid: true, cols: 3,
        items: bodies.map(b => ({ id: b.id, html: `${b.emoji} <b>${b.name}</b><br><small>${b.unique || ''}</small>` })),
        onSelect: (it) => {
          pendingDest = it.id;
          player._destBody = pendingDest;
          H._rocketDest = pendingDest;
          H.toast?.(player.index, `${BODIES[pendingDest].emoji} Kohde: ${BODIES[pendingDest].name}`);
          hideDestPicker();
          if (typeof onPick === 'function') {
            try { onPick(pendingDest, player); } catch (e) { console.warn(e); }
          }
        },
        onClose: () => { hideDestPicker(); },
      });
      // piilota vanha hiirikortti – menuPad näyttää oman
      wrap.style.display = 'none';
    }
  }
  /** Kotiraketti / suora lähtö: näytä valitsin ja lennä heti valinnan jälkeen. */
  function requestTravel(player) {
    if (!player || player.lock || player.moon) return;
    showDestPicker(player, {
      onPick: (id, p) => {
        if (id === 'moon') H.toMoon?.(p);
        else H.toBody(p, id);
      },
    });
  }
  function hideDestPicker() {
    if (destPicker) { destPicker.remove(); destPicker = null; }
    if (H.menuPad && H.menuPad.open) try { H.menuPad.close(); } catch (e) {}
  }

  // wrap enterRocket / toMoon
  function patchRocketFlow() {
    H.onStart(() => {
      pendingDest = 'moon';
      H._rocketDest = 'moon';
      // intercept boarding: show picker
      const g = H.game;
      if (!g || g._v24rocket) return;
      g._v24rocket = true;
      const origEnter = g.enterRocket?.bind(g);
      if (typeof g.enterRocket === 'function') {
        // enterRocket may not be exported — hook via players watching
      }
    });
  }

  H.toBody = (p, destId) => {
    const id = destId || p._destBody || H._rocketDest || 'moon';
    if (id === 'moon') {
      // kutsu alkuperäistä / wrappia — varmista moon-polku
      const tm = H.toMoon;
      if (tm && tm._v24orig) return tm._v24orig(p);
      return H.toMoon?.(p);
    }
    const body = BODIES[id];
    if (!body || !p) return;
    const trips = H._v24trips || (H._v24trips = []);
    if (trips.some(q => q.p === p)) return; // jo matkalla
    // nouse sohvalta / vapauta lock matkaa varten
    p.lock = true; p.lockHint = `🚀 Matka: ${body.name}…`;
    p._destBody = id; H._rocketDest = id;
    ensureWorld(id);
    trips.push({ p, kind: 'up', t: 0, dur: 3.2, body: id });
    // fly overlay
    const vp = document.querySelector(`.vp.v${p.index}`);
    if (vp) {
      let d = vp.querySelector('.moon-fly'); if (!d) { d = document.createElement('div'); d.className = 'moon-fly'; vp.appendChild(d); }
      d.innerHTML = `<div class="mf-stars"></div><b>${body.emoji} Matka: ${body.name}…</b><i style="animation-duration:3.2s"></i>`;
      d.style.display = 'flex';
    }
    H.beep?.(100, 0.4, 'sawtooth', 0.05);
  };

  function clearArrivalState(p) {
    if (!p) return;
    try { H.homes?.stand?.(p.index); } catch (_) {}
    try { H.game.exitRocket?.(p); } catch (_) {}
    // poistu autosta jos jumissa
    if (p.car != null && H.cars && H.cars[p.car]) {
      try { H.cars[p.car].occupied = null; } catch (_) {}
      p.car = null;
    }
    p.rocket = false;
    p.lock = false;
    p.lockHint = null;
    p.tvActive = false;
    p.enterLock = 0.2;
    p.firstPerson = false;
    p.vy = 0;
    p.air = 'none';
    p.grounded = true;
    p.speed = 0;
    p._v24scaled = false;
    p._orbitDepartT = null;
    if (p.group) { p.group.visible = true; p.group.scale.setScalar(1.35); }
    if (p.disc) p.disc.visible = true;
    if (p.chute) p.chute.visible = false;
    if (p.seat) p.seat.visible = false;
  }

  function safeBodySpawn(body, index) {
    const MX = body.mx, MZ = body.mz;
    // avoin alue: etelä/itä, kaukana kupoleista (siirretty layoutissa)
    const spots = [
      { x: 12, z: -14 },
      { x: 16, z: -10 },
      { x: 8, z: -18 },
      { x: -8, z: -18 },
      { x: 0, z: -26 },
    ];
    const s = spots[index % spots.length];
    return { x: MX + s.x, y: 1.25, z: MZ + s.z };
  }

  function arriveBody(p, id) {
    const body = BODIES[id] || BODIES.mars;
    const w = ensureWorld(id);
    clearArrivalState(p);
    const sp = (w && w.spawn) ? { x: w.spawn.x + p.index * 1.6, y: 1.25, z: w.spawn.z }
      : safeBodySpawn(body, p.index);
    p.pos.set(sp.x, sp.y, sp.z);
    p.yaw = Math.PI; p.pitch = 0; p.camS = null; p.camK = null;
    p.moon = true; // reuse moon gravity/flag plumbing
    p._bodyId = id;
    p._bodyGrav = body.grav;
    // varmista vielä kerran (v26 voi ehtiä lukita sohvan)
    clearArrivalState(p);
    attachSunglasses(p, !!body.sun);
    const vp = document.querySelector(`.vp.v${p.index}`)?.querySelector('.moon-fly');
    if (vp) vp.style.display = 'none';
    if (w && w.sky) w.sky.visible = true;
    H.toast?.(p.index, `${body.emoji} Tervetuloa: ${body.name}! Painovoima ×${body.grav.toFixed(2)}`);
    H.emit?.('moon', p.index, true);
  }

  function returnToEarth(p) {
    if (!p) return;
    const id = p._bodyId;
    const w = id && builtWorlds[id];
    clearArrivalState(p);
    p._bodyId = null; p._bodyGrav = null; p._destBody = null;
    attachSunglasses(p, false);
    p.moon = false; p.lock = false; p.lockHint = null;
    p.vy = 0; p.air = 'none'; p.grounded = true;
    p.rocket = false; p.group && (p.group.visible = true); p.disc && (p.disc.visible = true);
    p.group && p.group.scale.setScalar(1.35);
    const ri = H.game?.rocketInfo?.() || { x: -1.2, z: 2.35 };
    p.pos.set(ri.x + 2.8, 0, ri.z + (p.index - 1.5) * 1.8);
    p.yaw = Math.PI / 2; p.enterLock = 0.2;
    const vp = document.querySelector(`.vp.v${p.index}`)?.querySelector('.moon-fly');
    if (vp) vp.style.display = 'none';
    if (w && w.sky) w.sky.visible = false;
    H.toast?.(p.index, '🌍 Takaisin Maassa!');
    H.emit?.('moon', p.index, false);
  }

  function attachSunglasses(p, on) {
    if (!p.group) return;
    let g = p.group.getObjectByName('v24-sun-glasses');
    if (!on) { if (g) g.visible = false; return; }
    if (!g) {
      const G = T();
      g = new G.Group(); g.name = 'v24-sun-glasses';
      const frame = M(0x212529, { m: 0.4 });
      const lens = M(0x111111, { m: 0.8, r: 0.1, e: 0x000000, ei: 0, op: 0.92, side: 2 });
      // naurettavan paksut ja isot
      box(1.35, 0.55, 0.18, frame, 0, 1.55, 0.42, g);
      box(0.55, 0.42, 0.12, lens, -0.32, 1.55, 0.5, g);
      box(0.55, 0.42, 0.12, lens, 0.32, 1.55, 0.5, g);
      box(0.12, 0.12, 0.5, frame, -0.7, 1.55, 0.15, g);
      box(0.12, 0.12, 0.5, frame, 0.7, 1.55, 0.15, g);
      // "paksuus" - ekstra kerrokset
      box(1.4, 0.65, 0.35, M(0x343a40, { m: 0.5 }), 0, 1.55, 0.28, g);
      p.group.add(g);
    }
    g.visible = true;
  }

  // wrap H.toMoon so orbit jump uses selected dest
  function wrapToMoon() {
    const orig = H.toMoon;
    if (!orig || orig._v24) return;
    const wrapped = function (p) {
      const dest = (p && p._destBody) || H._rocketDest || 'moon';
      if (dest && dest !== 'moon') return H.toBody(p, dest);
      const r = orig(p);
      // spawn S-bots / LRV once moon world exists (toMoon is async)
      setTimeout(() => { try { H.vehicles?.spawnMoonVehicles?.(); } catch (e) { console.warn(e); } }, 400);
      setTimeout(() => { try { H.vehicles?.spawnMoonVehicles?.(); } catch (e) { console.warn(e); } }, 1200);
      setTimeout(() => { try { H.vehicles?.spawnMoonVehicles?.(); } catch (e) { console.warn(e); } }, 2500);
      return r;
    };
    wrapped._v24 = true;
    wrapped._v24orig = orig;
    H.toMoon = wrapped;
  }

// (mirror → weapons.js, vehicles → vehicles.js)\n  // ---------- horseshoes as movable demo on earth ----------
  function spawnHorseshoes() {
    const G = T();
    const spots = [{ x: 40, z: 40 }, { x: -50, z: 30 }, { x: 90, z: -60 }, { x: -80, z: -40 }];
    for (const s of spots) {
      const g = new G.Group();
      const m = M(0xadb5bd, { m: 0.7, r: 0.35 });
      const t = new G.Mesh(new G.TorusGeometry(0.45, 0.1, 8, 16, Math.PI * 1.3), m);
      t.rotation.x = Math.PI / 2; g.add(t);
      g.position.set(s.x, 0.15, s.z);
      H.scene.add(g);
      H.registerMovable({ group: g, pos: g.position, x: s.x, y: 0.15, z: s.z, kind: 'horseshoe' });
    }
  }

  // ---------- Palikkamaa: selkeämpi kaivosvuoreen ----------
  function enhanceMine() {
    // palikka.js already has a tunnel; add a visible mouth + sign on mountain face
    try {
      const OX = -160, OZ = -180, NX = 80;
      const peakX = OX + ((NX * 0.48) | 0) + 0.5;
      const mouthZ = OZ + 12;
      const G = T();
      const g = new G.Group();
      const dark = M(0x212529, { r: 0.9 });
      const wood = M(0x8d6e63, { r: 0.8 });
      box(5.2, 3.6, 1.2, dark, 0, 1.8, 0, g);
      box(0.4, 3.6, 0.4, wood, -2.4, 1.8, 0.5, g);
      box(0.4, 3.6, 0.4, wood, 2.4, 1.8, 0.5, g);
      box(5.2, 0.35, 0.4, wood, 0, 3.7, 0.5, g);
      // rails into mine
      box(0.12, 0.08, 8, M(0x868e96, { m: 0.6 }), -0.5, 0.08, -4, g);
      box(0.12, 0.08, 8, M(0x868e96, { m: 0.6 }), 0.5, 0.08, -4, g);
      const lab = H.makeLabel('⛏ KAIVOS', { bg: '#5c3a21', scale: 5 });
      lab.position.set(0, 4.4, 0.8); g.add(lab);
      H.addObject(g, peakX, 0, mouthZ);
    } catch (e) { console.warn('mine', e); }
  }

  // ---------- arcade physics simplification ----------
  function arcadeTick(dt) {
    if (!window.__arcadePhys) return;
    for (const c of H.cars || []) {
      // damp spin/oil/sliding instantly
      c.spin = 0; c.oil = 0; c.sliding = false;
      // snap velocity to facing * speed (no sideways drift)
      if (Math.abs(c.speed) > 0.2) {
        const d = H.game.dirVectors(c.yaw);
        c.vx = d.fx * c.speed;
        c.vz = d.fz * c.speed;
      }
    }
    for (const p of H.players) {
      if (p.spin) p.spin = 0;
    }
  }

  // ---------- gravity per body ----------
  function bodyGravityTick(dt) {
    for (const p of H.players) {
      if (!p.moon || !p._bodyId || p._bodyId === 'moon') continue;
      const gMul = (p._bodyGrav || 1) / 0.165; // relative to moon baseline already applied
      // moon.js already reduces gravity; for high-g worlds pull down harder
      if (gMul > 1.2 && !p.grounded && p.car == null) {
        p.vy -= 18 * (gMul - 1) * dt;
      }
      // show correct sky for this body
      const w = builtWorlds[p._bodyId];
      if (w && w.sky) {
        w.sky.visible = true;
        // hide other body skies
        for (const id of Object.keys(builtWorlds)) {
          if (id !== p._bodyId && builtWorlds[id].sky) builtWorlds[id].sky.visible = false;
        }
      }
      // return pad
      if (w && H.pressed?.(p.index, 'interact')) {
        const pad = w.pad;
        if (Math.hypot(p.pos.x - pad.x, p.pos.z - pad.z) < 5) {
          returnToEarth(p);
        }
      }
    }
    // milky way for classic moon too: enhance moon sky is already stars; add band once
  }

  // ---------- rocket boarding: show dest picker ----------
  const boarded = new Set();
  const orbitArmed = new Set();
  function watchRocketBoard(dt) {
    const scale = (typeof H._rocketTimeScale === 'number' && H._rocketTimeScale > 0) ? H._rocketTimeScale : 1;
    const phase = H.game?.rocketInfo?.()?.phase || H.game?.rocketState?.()?.phase;
    for (const p of H.players) {
      if (p.rocket && !boarded.has(p.index)) {
        boarded.add(p.index);
        // älä ylikirjoita jo valittua kohdetta
        if (!p._destBody) p._destBody = H._rocketDest || 'moon';
        showDestPicker(p); // museo-raketti: valinta → odota kiertorataa
      }
      if (!p.rocket) {
        boarded.delete(p.index);
        orbitArmed.delete(p.index);
        p._orbitDepartT = null;
      } else if (phase === 'orbit') {
        // auto-lähtö valittuun kohteeseen kiertoradalla (ei tarvitse muistaa hypätä)
        if (!orbitArmed.has(p.index)) {
          orbitArmed.add(p.index);
          p._orbitDepartT = 0.85; // lyhyt viive, hyppy ohittaa
          H.toast?.(p.index, `🚀 Kohde ${BODIES[p._destBody || H._rocketDest || 'moon']?.name || 'Kuu'} — matka alkaa…`);
        }
        if (p._orbitDepartT != null) {
          p._orbitDepartT -= dt * scale;
          const jump = !!(H.input?.(p.index)?.jump || H.pressed?.(p.index, 'jump'));
          if (p._orbitDepartT <= 0 || jump) {
            p._orbitDepartT = null;
            H.toMoon?.(p);
          }
        }
      }
    }
  }

  // also home rockets in v20 → show picker then toBody
  H.onStart(() => {
    wrapToMoon();
    setTimeout(() => {
      try { spawnHorseshoes(); } catch (_) {}
      try { enhanceMine(); } catch (_) {}
      try { H.vehicles?.spawnMoonVehicles?.(); } catch (e) { console.warn('moon vehicles', e); }
    }, 400);
    // expose Ge if not
    try {
      if (H.game && !H.game.Ge) {
        // Ge is local — blaster falls back silently
      }
    } catch (_) {}
  });

  H.onStop(() => {
    obsMeshes.length = 0;
    hideDestPicker();
    for (const id of Object.keys(builtWorlds)) {
      const w = builtWorlds[id];
      if (w.root && w.root.parent) w.root.parent.remove(w.root);
      delete builtWorlds[id];
    }
    H.vehicles?.reset?.();
    H.movableObjects = [];
  });

  H.onUpdate((dt) => {
    // 3.3: näytä observatorio vain kun joku pelaaja on lähellä
    if (obsMeshes.length) {
      const ps = H.players || [];
      for (let i = 0; i < obsMeshes.length; i++) {
        const g = obsMeshes[i]; if (!g) continue;
        const wx = g.userData.obsWX, wz = g.userData.obsWZ;
        let near = false;
        for (let k = 0; k < ps.length; k++) {
          const p = ps[k]; if (!p || !p.pos) continue;
          if (Math.hypot(p.pos.x - wx, p.pos.z - wz) < 90) { near = true; break; }
        }
        if (g.visible !== near) g.visible = near;
      }
    }
    const scale = (typeof H._rocketTimeScale === 'number' && H._rocketTimeScale > 0) ? H._rocketTimeScale : 1;
    watchRocketBoard(dt);
    arcadeTick(dt);
    bodyGravityTick(dt);
    // trips to non-moon bodies (aika-accel testeille)
    const trips = H._v24trips || [];
    for (const q of trips.slice()) {
      q.t += dt * scale;
      if (q.kind === 'up' && q.t >= q.dur) {
        trips.splice(trips.indexOf(q), 1);
        arriveBody(q.p, q.body);
      }
    }
    // vehicles.js handles moon vehicles
    // return pad hint for body worlds
    for (const p of H.players) {
      if (!p._bodyId || p._bodyId === 'moon') continue;
      const w = builtWorlds[p._bodyId];
      if (!w) continue;
      if (Math.hypot(p.pos.x - w.pad.x, p.pos.z - w.pad.z) < 6) {
        H.hud?.(p.index, `🚀 ${H.keyLabel?.(p.index, 'interact') || 'E'} = palaa Maahan`, 'bodypad');
      }
    }
  });

  // Milky Way for moon viewers looking up: inject band into moon sky once
  H.onStart(() => {
    setTimeout(() => {
      try {
        const G = T();
        let moonSky = null;
        H.scene.traverse(o => { if (!moonSky && o.name === 'moon-sky') moonSky = o; });
        // moon.js sky may be unnamed — find large sphere with stars
        if (!moonSky) {
          H.scene.traverse(o => {
            if (moonSky) return;
            if (o.isGroup && o.children?.some(c => c.isMesh && c.geometry?.type === 'SphereGeometry' && c.geometry.parameters?.radius > 200)) {
              moonSky = o;
            }
          });
        }
        if (moonSky && !moonSky.userData.mw) {
          moonSky.userData.mw = true;
          const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
          const ctx = c.getContext('2d');
          const grd = ctx.createLinearGradient(0, 0, 1024, 0);
          grd.addColorStop(0, 'rgba(0,0,0,0)');
          grd.addColorStop(0.4, 'rgba(220,230,255,0.5)');
          grd.addColorStop(0.6, 'rgba(255,240,255,0.55)');
          grd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grd; ctx.fillRect(0, 0, 1024, 256);
          for (let i = 0; i < 500; i++) {
            ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`;
            ctx.fillRect(Math.random() * 1024, 30 + Math.random() * 180, 1.5, 1.5);
          }
          const tex = new G.CanvasTexture(c);
          const band = new G.Mesh(new G.SphereGeometry(360, 24, 12, 0, Math.PI * 2, 0.2, 0.9),
            new G.MeshStandardMaterial({ map: tex, side: 1, transparent: true, depthWrite: false, fog: false, emissive: 0xffffff, emissiveIntensity: 0.35, metalness: 0, roughness: 1 }));
          band.rotation.z = 0.35; moonSky.add(band);
        }
      } catch (e) { console.warn('mw', e); }
    }, 600);
  });


  // Expose for tests
  H.bodies = {
    list: BODIES,
    bodies: BODIES,
    ensureWorld,
    toBody: H.toBody,
    arriveBody,
    clearArrivalState,
    safeBodySpawn,
    showDestPicker,
    requestTravel,
    returnToEarth,
    movable: () => H.movableObjects,
    moonVehicles: () => (H.vehicles?.list?.() || []),
    spawnMoonVehicles: () => H.vehicles?.spawnMoonVehicles?.(),
    built: () => Object.keys(builtWorlds),
    buildObservatory,
  };
  H.define?.('bodies', H.bodies);

  H.v24 = {
    bodies: BODIES,
    ensureWorld,
    toBody: H.toBody,
    arriveBody,
    clearArrivalState,
    safeBodySpawn,
    showDestPicker,
    requestTravel,
    returnToEarth,
    movable: () => H.movableObjects,
    moonVehicles: () => (H.vehicles?.list?.() || []),
    spawnMoonVehicles: () => H.vehicles?.spawnMoonVehicles?.(),
    built: () => Object.keys(builtWorlds),
  };

})();
