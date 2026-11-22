// window.HYYTE – laajennusrajapinta moduuleille (money.js, jobs.js, shop.js …).
// game.js kutsuu _attach() pelin alkaessa, _tick(dt) joka ruudulla ja _detach() valikkoon palatessa.
(function () {
  const updateHooks = new Set(), startHooks = new Set(), stopHooks = new Set();
  const added = [];
  let walls = [];
  let hudRoots = Array(12).fill(null);
  // 1.9: näppäimistö riittää kahdelle pelaajalle: 'wasd'-sarja ja 'arrows'-sarja (KeyboardEvent.code)
  const KB = {
    wasd: { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], jump: ['Space'], fire: ['KeyF'], interact: ['KeyE'],
      camera: ['KeyC'], camIn: ['KeyZ'], camOut: ['KeyX'], camUp: ['KeyR'], camDown: ['KeyT'], drift: ['KeyQ'], swap: ['KeyG'],
      eat: ['KeyV'], run: ['ShiftLeft'], buy: ['KeyB'], wallet: ['KeyB'] },
    arrows: { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['Numpad0', 'Digit0'],
      fire: ['Digit1', 'Numpad1'], interact: ['Digit2', 'Numpad2'], camera: ['Digit3', 'Numpad3'], camIn: ['Digit4', 'Numpad4'],
      camOut: ['Digit5', 'Numpad5'], camUp: ['Digit7', 'Numpad7'], camDown: ['Digit6', 'Numpad6'], drift: ['Digit9', 'Numpad9'],
      swap: ['Digit8', 'Numpad8'], eat: ['Period', 'NumpadAdd', 'NumpadDecimal'], run: ['ShiftRight', 'NumpadSubtract'], buy: ['Minus', 'Slash'], wallet: ['Minus', 'Slash'] },
  };
  const KB_LABEL = {
    wasd: { up: 'W', down: 'S', left: 'A', right: 'D', jump: 'Välilyönti', fire: 'F', interact: 'E', camera: 'C', camIn: 'Z', camOut: 'X',
      camUp: 'R', camDown: 'T', drift: 'Q', swap: 'G', eat: 'V', run: 'Vasen Shift', buy: 'B', wallet: 'B' },
    arrows: { up: '↑', down: '↓', left: '←', right: '→', jump: '0', fire: '1', interact: '2', camera: '3', camIn: '4', camOut: '5',
      camUp: '7', camDown: '6', drift: '9', swap: '8', eat: '.', run: 'Oikea Shift', buy: '-', wallet: '-' },
  };
  const H = {
    THREE: null, game: null, players: [], cars: [], scene: null, museum: null,
    challenge: false, time: 0, KB, KB_LABEL, PLAYER_COLORS: ['#ff5a36','#3aa0ff','#40c057','#f59f00','#be4bdb','#e64980','#15aabf','#82c91e','#fab005','#fd7e14','#7950f2','#12b886'],
    /** 1.9: pelaajien laitteet [{kb:'wasd'|'arrows'|null, pad: ohjainpaikka|null}] (aula asettaa). */
    devices: [{ kb: 'wasd', pad: 0 }, { kb: 'arrows', pad: 1 }],
    /** Napin nimi pelaajalle (näppäin tai ohjaimen nappi), esim. keyLabel(0,'interact') = 'E'. */
    keyLabel(i, action) {
      const d = H.devices[i] || {}, out = [];
      if (d.kb && KB_LABEL[d.kb]) out.push(KB_LABEL[d.kb][action] ?? action);
      const P = window.HYYTE_PAD;
      if (d.pad != null && P && P.connected && P.connected(i)) out.push(P.label(d.pad, action));
      return out.length ? out.join('/') : (KB_LABEL[i % 2 ? 'arrows' : 'wasd'][action] ?? action);
    },
    /** Taulukkomainen näkymä: KEYS('interact')[i] = pelaajan i nimi napille. */
    KEYS(action) { return new Proxy([], { get: (t, k) => (k === 'length' ? H.players.length || 2 : /^\d+$/.test(k) ? H.keyLabel(+k, action) : t[k]) }); },
    /** Onko pelaajan i näppäimistösarjan nappi alhaalla (lisätoiminnot kuten 'buy'). */
    kbDown(i, action) { const d = H.devices[i]; const L = d && d.kb && KB[d.kb][action]; return !!L && L.some(c => H.game && H.game.isKeyDown(c)); },
    /** Painettiinko pelaajan i näppäimistösarjan nappia tällä ruudulla. */
    kbHit(i, action) { const d = H.devices[i]; const L = d && d.kb && KB[d.kb][action]; return !!L && L.some(c => keyHits.has(c)); },
    get running() { return !!H.game; },
    /** fn(dt, HYYTE) joka ruudulla. Palauttaa poistofunktion. */
    onUpdate(fn) { updateHooks.add(fn); return () => updateHooks.delete(fn); },
    /** fn(HYYTE) kun peli alkaa (myös jos jo käynnissä). */
    onStart(fn) { startHooks.add(fn); if (H.game) safe(fn, H); return () => startHooks.delete(fn); },
    /** fn(HYYTE) kun peli loppuu. */
    onStop(fn) { stopHooks.add(fn); return () => stopHooks.delete(fn); },
    /** Lisää 3D-objektin; siivotaan automaattisesti pelin loppuessa. */
    addObject(obj, x, y, z) {
      if (!H.scene) throw new Error('HYYTE: peli ei ole käynnissä');
      if (x != null) obj.position.set(x, y ?? 0, z ?? 0);
      H.scene.add(obj); added.push(obj); return obj;
    },
    removeObject(obj) {
      obj.parent && obj.parent.remove(obj);
      const i = added.indexOf(obj); if (i >= 0) added.splice(i, 1);
      obj.traverse && obj.traverse(o => { o.geometry && o.geometry.dispose(); });
    },
    /** Lisää kiinteän esteen (ympyrä) johon pelaajat ja autot törmäävät. */
    addObstacle(x, z, r, h) { if (H.game) H.game.obstacles.push({ x, z, r, h: h != null ? h : 1.35, hyyte: true }); },
    /** Poistaa addObstacle-esteen (palauttaa true jos löytyi). */
    removeObstacle(o) { const L = H.game && H.game.obstacles; const i = L ? L.indexOf(o) : -1; if (i >= 0) L.splice(i, 1); return i >= 0; },
    /** Lisää esteen ja palauttaa sen olion (removeObstacle varten). */
    obstacle(x, z, r, h) { const o = { x, z, r, h: h != null ? h : 1.35, hyyte: true }; if (H.game) H.game.obstacles.push(o); return o; },
    /** 3.4: akselin suuntainen seinä (AABB). Palauttaa olion, jonka voi poistaa removeWallilla. */
    addWall(x0, z0, x1, z1, h, tag) {
      const w = { minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1), h: h != null ? h : 3.2, tag: tag || null };
      walls.push(w); return w;
    },
    /** Ohut seinäjakso (x1,z1)–(x2,z2), paksuus th. */
    addWallSeg(x1, z1, x2, z2, h, th, tag) {
      th = th == null ? 0.32 : th;
      const alongX = Math.abs(z1 - z2) < 1e-4;
      return alongX
        ? H.addWall(Math.min(x1, x2), z1 - th / 2, Math.max(x1, x2), z1 + th / 2, h, tag)
        : H.addWall(x1 - th / 2, Math.min(z1, z2), x1 + th / 2, Math.max(z1, z2), h, tag);
    },
    removeWall(w) { const i = walls.indexOf(w); if (i >= 0) walls.splice(i, 1); return i >= 0; },
    clearWalls(tag) {
      if (tag == null) { walls.length = 0; return; }
      for (let i = walls.length - 1; i >= 0; i--) if (walls[i].tag === tag) walls.splice(i, 1);
    },
    walls: () => walls.slice(),
    /** Törmääkö piste säteellä r seinään (y = lattian korkeus; yli seinän saa hypätä jos matala). */
    wallHit(x, z, r, y) {
      r = r == null ? 0.45 : r;
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (y != null && y + 0.12 >= (w.h || 3.2)) continue;
        if (x > w.minX - r && x < w.maxX + r && z > w.minZ - r && z < w.maxZ + r) return w;
      }
      return null;
    },
    /** Yleinen esto-testi testeille ja teleportille. */
    blocked(x, z, y, r) {
      r = r == null ? 0.45 : r; y = y == null ? 0 : y;
      if (H.wallHit(x, z, r, y)) return true;
      try {
        if (H.game && H.game.outOfBounds && H.game.outOfBounds(x, z)) return true;
      } catch (e) {}
      const L = H.game && H.game.obstacles;
      if (L) {
        for (let i = 0; i < L.length; i++) {
          const n = L[i], dx = x - n.x, dz = z - n.z, rr = (n.r || 0) + r;
          if (dx * dx + dz * dz < rr * rr) {
            const h = n.h != null ? n.h : 1.35;
            if (y + 0.12 < h) return true;
          }
        }
      }
      return false;
    },
    /** Voiko kohtaan kävellä (kartalla, ei seinässä). */
    isWalkable(x, z) {
      try {
        if (H.game && H.game.outOfBounds && H.game.outOfBounds(x, z)) return false;
      } catch (e) {}
      return !H.blocked(x, z, 0, 0.5);
    },
    /** Lisänäppäimet (KeyboardEvent.code): true vain sillä ruudulla kun painettiin. */
    keyPressed(code) { const v = keyHits.has(code); return v; },
    /** Pelaajan tai hänen autonsa sijainti (Vector3). */
    posOf(p) { return p.car != null ? H.cars[p.car].pos : p.pos; },
    /** HUD-rivi pelaajalle (0 vasen/ylä, 1 oikea/ala). slot erottaa rivit toisistaan. Tyhjä = piilota. */
    hud(player, html, slot = 'main') {
      const stage = document.querySelector('.stage'); if (!stage) return;
      let root = hudRoots[player];
      if (!root || !root.isConnected) {
        root = hudRoots[player] = document.createElement('div');
        root.className = 'hyyte-hud p' + player; (stage.querySelector('.vp.v' + player) || stage).appendChild(root);
      }
      let el = root.querySelector(`[data-slot="${slot}"]`);
      if (!el) { el = document.createElement('div'); el.dataset.slot = slot; el.className = slot; root.appendChild(el); }
      const v = html ?? '';
      if (el.innerHTML !== v) el.innerHTML = v;
    },
    /** Lyhyt ilmoitus pelaajan ruudun keskelle (bad = punainen). */
    toast(player, text, bad) {
      const stage = document.querySelector('.stage'); if (!stage) return;
      const el = document.createElement('div');
      el.className = 'hyyte-toast p' + player + (bad ? ' bad' : ''); el.textContent = text;
      (stage.querySelector('.vp.v' + player) || stage).appendChild(el); setTimeout(() => el.remove(), 2500);
    },
    beep(freq, dur, type, vol) { H.game && H.game.beep(freq, dur, type, vol); },
    /** Pelaajan syöte (näppäimet + kosketus): {f, turn, jump, fire, interact, …}. */
    input(i) { return H.game ? H.game.input(i) : {}; },
    /** Palauttaa true vain sillä ruudulla kun nappi painetaan alas (key = 'interact', 'fire'…). */
    pressed(i, key) {
      const id = i + ':' + key;
      if (!(id in edge)) { edge[id] = { cur: !!H.input(i)[key], prev: true }; return false; }
      return edge[id].cur && !edge[id].prev;
    },
    /** Tallennus localStorageen (JSON). */
    load(key, def) { try { const v = localStorage.getItem('hyyte-' + key); return v == null ? def : JSON.parse(v); } catch { return def; } },
    save(key, val) { try { localStorage.setItem('hyyte-' + key, JSON.stringify(val)); } catch {} },
    /** Tekstikyltti (Sprite) canvas-tekstuurista. */
    makeLabel(text, opt = {}) {
      const T = H.THREE, c = document.createElement('canvas'), w = opt.w || 512, h = opt.h || 128;
      c.width = w; c.height = h; const g = c.getContext('2d');
      g.fillStyle = opt.bg || '#102430'; roundRect(g, 4, 4, w - 8, h - 8, 28); g.fill();
      g.lineWidth = 8; g.strokeStyle = opt.border || '#fff6e8'; g.stroke();
      g.fillStyle = opt.color || '#fff'; g.font = `900 ${opt.size || 64}px system-ui,sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4);
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
      const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthWrite: false }));
      const sc = opt.scale || 4; s.scale.set(sc, sc * h / w, 1);
      // 1.8: kyltti haalenee kun kamera on aivan sen vieressä (ei peitä näkymää jaetulla ruudulla)
      const lo = Math.max(2, sc * 0.6), span = Math.max(3, sc * 0.6), wp = new T.Vector3();
      s.onBeforeRender = (r, sc2, cam) => { s.getWorldPosition(wp); const d = wp.distanceTo(cam.position); s.material.opacity = Math.min(1, Math.max(0, (d - lo) / span)); };
      return s;
    },
    /** 1.8: tapahtumaväylä moduulien välille (tilastot ym.): H.on('job', (i, data) => …), H.emit('job', i, data). */
    on(evt, fn) { (bus[evt] ||= new Set()).add(fn); return () => bus[evt].delete(fn); },
    emit(evt, ...a) { const L = bus[evt]; if (L) for (const f of L) safe(f, ...a); },
    /** 2.0/3.5: grafiikan laatu 'ultra' | 'korkea' | 'matala' | 'mobiili' (localStorage hyyte-gfx). */
    get gfx() {
      const v = H.load('gfx', 'ultra');
      return v === 'matala' || v === 'korkea' || v === 'ultra' || v === 'mobiili' ? v : 'ultra';
    },
    set gfx(v) {
      const ok = v === 'matala' || v === 'korkea' || v === 'ultra' || v === 'mobiili';
      H.save('gfx', ok ? v : 'ultra');
    },
    /**
     * 1.8 suorituskyky: yhdistää ryhmän staattiset meshit materiaalin mukaan yhdeksi meshiksi per materiaali
     * (vähemmän piirtokutsuja). keep = Set olioista joita (tai joiden lapsia) ei yhdistetä. Palauttaa yhdistettyjen määrän.
     */
    mergeStatic(root, keep = new Set()) {
      const T = H.THREE; root.updateMatrixWorld(true);
      const inv = root.matrixWorld.clone().invert(), groups = new Map(), list = [];
      const kept = o => { for (let q = o; q && q !== root; q = q.parent) if (keep.has(q) || q.visible === false) return true; return false; };
      root.traverse(o => {
        if (!o.isMesh || o.isSprite || Array.isArray(o.material) || o.userData.noMerge || kept(o)) return;
        const g = o.geometry, m = o.material; if (!g || !g.attributes.position || g.morphAttributes?.position) return;
        const attrs = Object.keys(g.attributes).sort().join(',');
        const key = [m.type, m.color?.getHex(), m.emissive?.getHex(), m.emissiveIntensity, m.roughness, m.metalness, m.opacity, m.transparent, m.side,
          m.map?.uuid, m.emissiveMap?.uuid, m.vertexColors, m.depthWrite, m.flatShading, o.castShadow, o.receiveShadow, o.layers.mask, attrs].join('|');
        let L = groups.get(key); if (!L) groups.set(key, L = []); L.push(o);
      });
      let merged = 0;
      for (const L of groups.values()) {
        if (L.length < 2) continue;
        const parts = L.map(o => { const mtx = inv.clone().multiply(o.matrixWorld); const g = o.geometry.clone().applyMatrix4(mtx); return g.index ? g : (g.setIndex([...Array(g.attributes.position.count).keys()]), g); });
        const names = Object.keys(parts[0].attributes); let vtx = 0, idx = 0;
        parts.forEach(g => { vtx += g.attributes.position.count; idx += g.index.count; });
        const out = new T.BufferGeometry(), I = vtx > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
        for (const n of names) {
          const is = parts[0].attributes[n].itemSize, A = new Float32Array(vtx * is); let off = 0;
          parts.forEach(g => { const a = g.attributes[n]; for (let k = 0; k < a.count; k++) for (let c = 0; c < is; c++) A[off++] = a.array[k * is + c]; });
          out.setAttribute(n, new T.BufferAttribute(A, is));
        }
        let vo = 0, io = 0; parts.forEach(g => { const a = g.index.array; for (let k = 0; k < a.length; k++) I[io++] = a[k] + vo; vo += g.attributes.position.count; g.dispose(); });
        out.setIndex(new T.BufferAttribute(I, 1)); out.computeBoundingSphere(); out.computeBoundingBox();
        const f = L[0], mesh = new T.Mesh(out, f.material);
        mesh.castShadow = f.castShadow; mesh.receiveShadow = f.receiveShadow; mesh.layers.mask = f.layers.mask; mesh.userData.merged = L.length;
        L.forEach(o => o.parent && o.parent.remove(o)); root.add(mesh); merged += L.length;
      }
      return merged;
    },
    _attach(g) {
      walls = [];
      Object.assign(H, { THREE: window.THREE_R186, game: g, players: g.players, cars: g.cars, scene: g.scene,
        museum: g.museum, challenge: !!g.challenge, time: 0 });
      for (const k in edge) delete edge[k];
      startHooks.forEach(f => safe(f, H));
    },
    _tick(dt) {
      H.time += dt;
      const inp = H.players.map((p, i) => H.input(i));
      for (const id in edge) { const [i, k] = id.split(':'); edge[id].prev = edge[id].cur; edge[id].cur = !!(inp[i] && inp[i][k]); }
      for (const f of updateHooks) safe(f, dt, H);
      keyHits.clear(); },
    _detach() {
      walls = [];
      stopHooks.forEach(f => safe(f, H));
      added.splice(0).forEach(o => o.parent && o.parent.remove(o));
      hudRoots = Array(12).fill(null);
      Object.assign(H, { game: null, players: [], cars: [], scene: null, museum: null });
    },
  };
  const edge = {}, bus = {};
  const keyHits = new Set();
  window.addEventListener('keydown', e => { if (!e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) keyHits.add(e.code); }, true);
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  let errCount = 0;
  function safe(f, ...a) { try { f(...a); } catch (e) { if (errCount++ < 5) console.error('HYYTE-koukku kaatui:', e); } }
  // 3.2: modulit rekisteröivät itsensä nimellä – ei haurasta <script>-järjestystä
  const defined = {}, waiters = {};
  H.define = function (name, api) {
    defined[name] = api;
    const q = waiters[name]; if (q) { waiters[name] = []; q.forEach(fn => safe(fn, api)); }
  };
  H.when = function (name, fn) {
    if (Object.prototype.hasOwnProperty.call(defined, name)) { safe(fn, defined[name]); return () => {}; }
    (waiters[name] ||= []).push(fn);
    return () => { const L = waiters[name]; if (!L) return; const i = L.indexOf(fn); if (i >= 0) L.splice(i, 1); };
  };
  H.defined = (name) => Object.prototype.hasOwnProperty.call(defined, name);
  H.THREE = window.THREE_R186;
  window.HYYTE = H;
})();
