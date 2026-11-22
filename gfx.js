// gfx.js (1.8) – kauniimpi grafiikka: taivaskupu ja pilvet, kaukaiset kukkulat, nurmikko, terävämmät varjot
// pelaajien ympärillä sekä hiukkasefektit (pöly, driftisavu, kipinät, palikanmurut, konfetti).
// Laatu valitaan aulassa: HYYTE.gfx = 'korkea' | 'matala'. Matalalla kevyemmät asetukset ja vähemmän hiukkasia.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  let dome = null, clouds = [], sky = null, sun = null, frame = 0, low = false, fxSys = null, prev = [];
  const HORIZON = '#cfe8f5', ZENITH = '#3f8fdc';

  function canvasTex(w, h, draw, nearest) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new (T().CanvasTexture)(c); t.colorSpace = T().SRGBColorSpace;
    if (nearest) { t.magFilter = t.minFilter = 1003; t.generateMipmaps = false; }
    return t;
  }
  const radial = (stops) => canvasTex(64, 64, (g, w, h) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); stops.forEach(([o, c]) => r.addColorStop(o, c)); g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // ---------- taivas ----------
  function buildSky(scene) {
    const G = T();
    const grad = canvasTex(4, 256, (g, w, h) => {
      const L = g.createLinearGradient(0, 0, 0, h);
      L.addColorStop(0, '#2c74c9'); L.addColorStop(0.32, ZENITH); L.addColorStop(0.47, '#9fd0ef'); L.addColorStop(0.5, HORIZON); L.addColorStop(0.56, '#b9d9c2'); L.addColorStop(1, '#7fae84');
      g.fillStyle = L; g.fillRect(0, 0, w, h);
    });
    const m = new G.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: grad, side: 1, fog: false, depthWrite: false, roughness: 1, metalness: 0 });
    dome = new G.Mesh(new G.SphereGeometry(440, 32, 16), m);
    dome.frustumCulled = false; dome.renderOrder = -10; dome.userData.noMerge = true;
    dome.onBeforeRender = (r, s, cam) => { dome.position.copy(cam.position); dome.updateMatrixWorld(); };
    H.addObject(dome);
    // aurinko
    const sunTex = radial([[0, 'rgba(255,255,240,1)'], [0.18, 'rgba(255,246,200,0.95)'], [0.4, 'rgba(255,230,160,0.35)'], [1, 'rgba(255,220,150,0)']]);
    sun = new G.Sprite(new G.SpriteMaterial({ map: sunTex, fog: false, depthWrite: false, transparent: true }));
    sun.scale.set(110, 110, 1); sun.renderOrder = -9; sun.frustumCulled = false;
    sun.onBeforeRender = (r, s, cam) => { const L = H.__sun; const d = L ? L.position.clone().sub(L.target.position).normalize() : new G.Vector3(0.5, 0.8, 0.3); sun.position.copy(cam.position).addScaledVector(d, 400); sun.updateMatrixWorld(); };
    H.addObject(sun);
    // pilvet
    const R = rng(7), n = low ? 0 : 16;
    const cloudTex = canvasTex(256, 128, (g) => {
      for (let k = 0; k < 18; k++) {
        const x = 40 + Math.random() * 176, y = 50 + Math.random() * 40 - Math.abs(x - 128) * 0.15, r = 22 + Math.random() * 26;
        const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(255,255,255,0.95)'); rg.addColorStop(0.6, 'rgba(250,252,255,0.75)'); rg.addColorStop(1, 'rgba(240,246,255,0)');
        g.fillStyle = rg; g.fillRect(0, 0, 256, 128);
      }
    });
    clouds = [];
    for (let k = 0; k < n; k++) {
      const s = new G.Sprite(new G.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, transparent: true, opacity: 0.9 }));
      const a = R() * Math.PI * 2, d = 140 + R() * 190, w = 60 + R() * 70;
      s.position.set(Math.cos(a) * d, 70 + R() * 45, Math.sin(a) * d); s.scale.set(w, w * 0.42, 1); s.renderOrder = -8;
      s.userData.v = 1.2 + R() * 1.5; H.addObject(s); clouds.push(s);
    }
    // kaukaiset kukkulat ja maa kartan ulkopuolella (yhdistetään yhdeksi piirroksi)
    const hills = new G.Group(), hm = new G.MeshStandardMaterial({ color: '#5d9367', roughness: 1, flatShading: true }), hm2 = new G.MeshStandardMaterial({ color: '#4f7f60', roughness: 1, flatShading: true });
    for (let k = 0; k < 34; k++) {
      const a = k / 34 * Math.PI * 2 + R() * 0.1, d = 300 + R() * 60, h = 24 + R() * 46, r = 40 + R() * 40;
      const c = new G.Mesh(new G.ConeGeometry(r, h, 7, 1), k % 2 ? hm : hm2); c.position.set(Math.cos(a) * d, h / 2 - 2, Math.sin(a) * d); c.rotation.y = R() * 3; hills.add(c);
    }
    const outer = new G.Mesh(new G.PlaneGeometry(1100, 1100), new G.MeshStandardMaterial({ color: '#4a8a4f', roughness: 1 }));
    outer.rotation.x = -Math.PI / 2; outer.position.y = -0.25; hills.add(outer);
    H.mergeStatic(hills); H.addObject(hills);
    // sumu ja taustaväri horisontin värisiksi
    if (scene.fog) { scene.fog.color.set(HORIZON); scene.fog.near = 170; scene.fog.far = 560; }
    if (scene.background && scene.background.isColor) scene.background.set(HORIZON);
    sky = scene.background;
  }

  // ---------- nurmikko ----------
  function improveGround(scene) {
    const G = T(); let ground = null;
    scene.children.forEach(o => { if (o.isMesh && o.geometry?.type === 'PlaneGeometry' && o.geometry.parameters.width === 324) ground = o; });
    if (!ground) return;
    const tex = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#3f9a4b'; g.fillRect(0, 0, w, h);
      const R = rng(3);
      for (let k = 0; k < 9000; k++) { const x = R() * w, y = R() * h, l = 2 + R() * 5, c = R(); g.fillStyle = c < 0.33 ? '#4cae58' : c < 0.66 ? '#358a41' : '#56b862'; g.fillRect(x, y, 1.4, l); }
      for (let k = 0; k < 60; k++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(255,220,80,0.6)'; g.fillRect(R() * w, R() * h, 2, 2); }   // pikku kukkia
    });
    tex.wrapS = tex.wrapT = G.RepeatWrapping; tex.repeat.set(81, 81); tex.anisotropy = 4;
    // isot vaaleammat ja tummemmat nurmikkolaikut vertex-väreillä
    const geo = new G.PlaneGeometry(324, 324, 48, 48), pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k), y = pos.getY(k);
      const n = Math.sin(x * 0.045 + 1.3) * Math.cos(y * 0.052 - 0.4) * 0.5 + Math.sin(x * 0.11 + y * 0.07) * 0.3 + Math.sin(y * 0.17 - x * 0.03) * 0.2;
      const v = 0.92 + n * 0.1; col[k * 3] = v * 0.97; col[k * 3 + 1] = v; col[k * 3 + 2] = v * 0.94;
    }
    geo.setAttribute('color', new G.BufferAttribute(col, 3));
    const m = ground.material.clone(); m.map = tex; m.vertexColors = true; m.color.set('#ffffff'); m.roughness = 0.97;
    ground.geometry.dispose(); ground.geometry = geo; ground.material = m;
  }

  // ---------- varjot ----------
  function setupShadows(scene) {
    let L = null; scene.traverse(o => { if (o.isDirectionalLight && o.castShadow) L = o; });
    H.__sun = L; if (!L) return;
    L.userData.off = L.position.clone().sub(L.target.position).normalize().multiplyScalar(140);
    L.shadow.camera.near = 1; L.shadow.camera.far = 420; L.shadow.normalBias = 0.02;
    const r = H.game.renderer; if (r) { r.shadowMap.autoUpdate = false; r.shadowMap.needsUpdate = true; }
  }
  function updShadows() {
    const L = H.__sun; if (!L) return;
    const r = H.game.renderer;
    // varjokartta lasketaan kerran ruudussa (ei erikseen kummallekin jaetun ruudun puolikkaalle); matalalla joka toinen
    // 1.9: automaattinen laadunlasku (H.perfLevel ≥ 2) päivittää varjot harvemmin
    if (r) r.shadowMap.needsUpdate = (H.perfLevel || 0) >= 2 ? frame % 3 === 0 : !low || (frame & 1) === 0;
    // 1.9: 1–4 pelaajaa; varjo keskitetään Maan pelaajiin (tai Kuuhun jos kaikki ovat siellä)
    const earth = H.players.filter(p => !p.moon), grp = earth.length ? earth : H.players;
    const P = grp.map(p => H.posOf(p)); if (!P.length) return;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const q of P) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); }
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const d = Math.hypot(x1 - x0, z1 - z0);
    const half = Math.max(95, Math.min(175, d / 2 + 85));
    const cam = L.shadow.camera, size = L.shadow.mapSize.x, texel = (half * 2) / size;
    let tx = Math.round(cx / texel) * texel, tz = Math.round(cz / texel) * texel;
    if (half >= 175 && earth.length) { tx = 0; tz = 0; }
    L.target.position.set(tx, 0, tz); L.target.updateMatrixWorld();
    L.position.set(tx + L.userData.off.x, L.userData.off.y, tz + L.userData.off.z);
    if (cam.right !== half) { cam.left = cam.bottom = -half; cam.right = cam.top = half; cam.updateProjectionMatrix(); }
  }

  // ---------- hiukkaset ----------
  function makeSys(max, opt) {
    const G = T(), geo = new G.BufferGeometry();
    const pos = new Float32Array(max * 3), col = new Float32Array(max * 3);
    geo.setAttribute('position', new G.BufferAttribute(pos, 3)); geo.setAttribute('color', new G.BufferAttribute(col, 3)); geo.setDrawRange(0, 0);
    const m = new G.PointsMaterial({ size: opt.size, vertexColors: true, transparent: !!opt.map || opt.add, opacity: opt.opacity ?? 1, depthWrite: false, map: opt.map || null, blending: opt.add ? 2 : 1, sizeAttenuation: true });
    const pts = new G.Points(geo, m); pts.frustumCulled = false; pts.userData.noMerge = true;
    for (let k = 10; k < 14; k++) pts.layers.enable(k);
    H.addObject(pts);
    return { pts, pos, col, max, n: 0, P: [] };
  }
  function buildFx() {
    const soft = radial([[0, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
    fxSys = {
      cube: makeSys(low ? 220 : 700, { size: 0.16 }),
      soft: makeSys(low ? 120 : 400, { size: 0.9, map: soft, opacity: 0.55 }),
      glow: makeSys(low ? 80 : 260, { size: 0.32, map: soft, add: true }),
    };
  }
  const COL = new Map();
  function rgb(c) { let v = COL.get(c); if (!v) { const k = new (T().Color)(c); v = [k.r, k.g, k.b]; COL.set(c, v); } return v; }
  /** Hiukkaspurske: kind 'dust' | 'smoke' | 'debris' | 'confetti' | 'sparkle'. */
  function burst(kind, x, y, z, o = {}) {
    if (!fxSys) return;
    const n0 = o.n ?? 10, n = Math.max(1, Math.round(low ? n0 * 0.45 : n0));
    const S = kind === 'debris' || kind === 'confetti' ? fxSys.cube : kind === 'sparkle' ? fxSys.glow : fxSys.soft;
    const conf = ['#ff5a36', '#f6c445', '#3aa0ff', '#5be07a', '#ff7ad9', '#ffffff'];
    for (let k = 0; k < n && S.P.length < S.max; k++) {
      const sp = o.speed ?? (kind === 'dust' ? 1.4 : kind === 'smoke' ? 0.8 : 3.5);
      const a = Math.random() * Math.PI * 2, u = Math.random();
      const c = kind === 'confetti' ? conf[(Math.random() * conf.length) | 0] : Array.isArray(o.color) ? o.color[(Math.random() * o.color.length) | 0] : o.color || (kind === 'smoke' ? '#d9dde2' : kind === 'dust' ? '#c9b48a' : kind === 'sparkle' ? '#ffe680' : '#888');
      S.P.push({ x: x + (Math.random() - 0.5) * (o.spread ?? 0.4), y: y + Math.random() * 0.2, z: z + (Math.random() - 0.5) * (o.spread ?? 0.4),
        vx: Math.cos(a) * sp * u + (o.vx || 0), vy: (o.up ?? (kind === 'debris' || kind === 'confetti' ? 4 : kind === 'sparkle' ? 2.5 : 0.8)) * (0.6 + Math.random() * 0.8), vz: Math.sin(a) * sp * u + (o.vz || 0),
        g: kind === 'debris' || kind === 'confetti' ? (kind === 'confetti' ? 7 : 16) : kind === 'sparkle' ? 2 : -0.6,
        life: (o.life ?? (kind === 'confetti' ? 1.6 : kind === 'smoke' ? 1.1 : 0.8)) * (0.7 + Math.random() * 0.6), t: 0, c: rgb(c), fade: kind === 'sparkle' });
    }
  }
  function updFx(dt) {
    if (!fxSys) return;
    for (const S of Object.values(fxSys)) {
      let w = 0;
      for (let k = 0; k < S.P.length; k++) {
        const p = S.P[k]; p.t += dt; if (p.t >= p.life) continue;
        p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.g > 3 && p.y < 0.05) { p.y = 0.05; p.vy *= -0.3; p.vx *= 0.6; p.vz *= 0.6; }
        if (p.g < 0) { p.vx *= 0.96; p.vz *= 0.96; }
        const f = p.fade ? 1 - p.t / p.life : 1;
        S.pos[w * 3] = p.x; S.pos[w * 3 + 1] = p.y; S.pos[w * 3 + 2] = p.z;
        S.col[w * 3] = p.c[0] * f; S.col[w * 3 + 1] = p.c[1] * f; S.col[w * 3 + 2] = p.c[2] * f;
        S.P[w++] = p;
      }
      S.P.length = w; S.n = w;
      const g = S.pts.geometry; g.setDrawRange(0, w);
      if (w) { g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; }
    }
  }
  // automaattiset efektit: hypyn laskeutuminen, juoksupöly, driftisavu, rahan kimallus
  function autoFx(dt) {
    H.players.forEach((p, i) => {
      const s = prev[i] || (prev[i] = { g: true, vy: 0, run: 0 });
      if (p.car == null && !p.rocket) {
        if (p.grounded && !s.g && s.vy < -5) burst('dust', p.pos.x, p.pos.y + 0.05, p.pos.z, { n: 10, speed: 2.2, up: 0.6 });
        s.run += dt;
        if (!low && p.grounded && p.speed > 4 && s.run > 0.22) { s.run = 0; const v = H.game.dirVectors(p.yaw); burst('dust', p.pos.x - v.fx * 0.3, p.pos.y + 0.05, p.pos.z - v.fz * 0.3, { n: 2, speed: 0.6, up: 0.5, life: 0.6 }); }
      } else if (p.car != null) {
        const c = H.cars[p.car];
        if (c && c.sliding && Math.abs(c.speed) > 3) {
          s.run += dt;
          if (s.run > (low ? 0.12 : 0.05)) { s.run = 0; const v = H.game.dirVectors(c.yaw); const rx = -v.fz, rz = v.fx;
            for (const side of [-1, 1]) burst('smoke', c.pos.x - v.fx * 1.3 + rx * side * 0.8, (c.y || 0) + 0.2, c.pos.z - v.fz * 1.3 + rz * side * 0.8, { n: 1, speed: 0.6, up: 0.9, life: 0.9 }); }
        }
      }
      s.g = p.grounded; s.vy = p.vy;
    });
  }


  // 3.3: F3-suorituskykynäyttö (pois päältä oletuksena) – FPS, draw-kutsut, kolmiot
  let hudOn = false, hudEl = null, hudAcc = 0, hudFrames = 0, hudFps = 0;
  function ensureHud() {
    if (hudEl && hudEl.isConnected) return hudEl;
    hudEl = document.createElement('div');
    hudEl.id = 'hyyte-perf';
    hudEl.setAttribute('aria-hidden', 'true');
    hudEl.style.cssText = 'display:none;position:fixed;left:8px;bottom:8px;z-index:99999;font:12px/1.4 ui-monospace,Menlo,monospace;background:rgba(0,0,0,.72);color:#d8f5c8;padding:6px 9px;border-radius:8px;pointer-events:none;white-space:pre;letter-spacing:.02em;border:1px solid #3a5a3a';
    document.body.appendChild(hudEl);
    return hudEl;
  }
  function toggleHud(on) {
    hudOn = on == null ? !hudOn : !!on;
    ensureHud().style.display = hudOn ? 'block' : 'none';
    if (hudOn) { hudAcc = 0; hudFrames = 0; }
    return hudOn;
  }
  function updHud(dt) {
    if (!hudOn) return;
    hudAcc += dt; hudFrames++;
    if (hudAcc < 0.25) return;
    hudFps = hudFrames / hudAcc; hudAcc = 0; hudFrames = 0;
    const r = H.game && H.game.renderer;
    const i = r && r.info && r.info.render;
    const mem = r && r.info && r.info.memory;
    ensureHud().textContent =
      'FPS ' + hudFps.toFixed(0) +
      '\nDraw ' + (i ? i.calls : '?') +
      '\nTri ' + (i ? i.triangles : '?') +
      '\nPR ' + ((r && r.getPixelRatio && r.getPixelRatio().toFixed(2)) || '?') +
      '\nGFX ' + (H.gfx || '?') +
      (mem ? '\nGeo ' + mem.geometries : '');
  }
  window.addEventListener('keydown', (e) => {
    if (e.code === 'F3' || e.key === 'F3') { e.preventDefault(); toggleHud(); }
  });
  H.perfHud = { toggle: toggleHud, get on() { return hudOn; }, get fps() { return hudFps; } };

  H.fx = { burst, get count() { return fxSys ? Object.values(fxSys).reduce((a, S) => a + S.n, 0) : 0; } };
  H.skyNight = (night) => {
    if (dome) dome.visible = !night; if (sun) sun.visible = !night;
    for (const c of clouds) c.visible = !night;
  };

  // Hitaan koneen vinkki: jos Korkea pyörii pitkään alle ~28 ruutua/s, ehdotetaan Matalaa (kerran pelikerrassa).
  let perf = { t0: 0, n: 0, told: false };
  function perfWatch() {
    if (low || perf.told || window.__noPerfTip) return;
    const now = performance.now(); if (!perf.t0) perf.t0 = now; perf.n++;
    const el = now - perf.t0;
    if (el > 12000) {
      const fps = perf.n * 1000 / el;
      if (fps < 28) { perf.told = true; H.players.forEach(p => H.toast(p.index, `🐢 Hidasta (${Math.round(fps)} r/s) – kokeile aulassa Grafiikka: Matala ⚡`, true)); }
      perf.t0 = now; perf.n = 0;
    }
  }
  H.onStart(() => {
    low = H.gfx === 'matala' || H.gfx === 'mobiili'; ultra = H.gfx === 'ultra'; frame = 0; prev = []; perf = { t0: 0, n: 0, told: false };
    const scene = H.scene;
    try { setupShadows(scene); } catch (e) { console.warn('varjot', e); }
    if (!low) { try { buildSky(scene); } catch (e) { console.warn('taivas', e); } try { improveGround(scene); } catch (e) { console.warn('nurmikko', e); } }
    else { dome = null; sun = null; clouds = []; }
    buildFx();
  });
  H.onStop(() => { dome = null; sun = null; clouds = []; fxSys = null; H.__sun = null; if (hudEl) { hudEl.remove(); hudEl = null; } hudOn = false; });
  H.onUpdate(dt => {
    frame++; perfWatch(); updHud(dt);
    updShadows();
    for (const c of clouds) { c.position.x += c.userData.v * dt; if (c.position.x > 330) c.position.x = -330; }
    autoFx(dt); updFx(dt);
  });
  H.on('earn', (i, n) => { const p = H.players[i]; if (!p || !fxSys) return; const q = H.posOf(p); burst('sparkle', q.x, (p.car != null ? 1 : p.pos.y) + 1.6, q.z, { n: Math.min(24, 6 + n), speed: 1.6, up: 2.2, life: 0.9, color: ['#ffe680', '#fff3b0', '#ffd23f'] }); });
})();
