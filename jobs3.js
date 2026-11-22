// jobs3.js – 2.1: kahdeksan uutta palkkatyötä.
(function () {
  const H = window.HYYTE;
  const KEY = H.KEYS('interact');
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.7, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0, transparent: !!o.op, opacity: o.op ?? 1 });
  const box = (w, h, d, m, x, y, z, p) => { const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  const cyl = (rt, rb, h, m, x, y, z, p, seg = 16) => { const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  function arrow(p, x, z) {
    const q = H.posOf(p), v = H.game.dirVectors(p.yaw), dx = x - q.x, dz = z - q.z;
    const a = Math.atan2(dx * v.rx + dz * v.rz, dx * v.fx + dz * v.fz);
    return ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'][((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
  }
  function pad(x, z, c, text) {
    H.addObject(cyl(1.35, 1.35, 0.1, M(c, { e: 0x111111, ei: 0.25 }), 0, 0, 0, null, 28), x, 0.2, z);
    const l = H.makeLabel(text, { scale: 4.0, size: 46 }); H.addObject(l, x, 2.8, z);
  }
  function pay(i, n, why) { H.money.add(i, n, why); H.beep(880, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(1175, 0.12, 'triangle', 0.05), 100); }
  function freeNear(cx, cz, r0, r1) {
    for (let k = 0; k < 50; k++) {
      const a = Math.random() * Math.PI * 2, r = r0 + Math.random() * (r1 - r0), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (Math.abs(x) > 220 || Math.abs(z) > 220) continue;
      if (H.game.isBlocked(x, z) || Math.abs(H.game.groundHeight(x, z)) > 0.35) continue;
      return { x, z };
    }
    return { x: cx + r0, z: cz };
  }

  // ---------- paikat ----------
  const LOC = {
    photo:   { x: 48,  z: 78,  pad: { x: 42, z: 72 } },
    fish:    { x: -88, z: 28,  pad: { x: -80, z: 22 } },
    garden:  { x: 64,  z: -78, pad: { x: 58, z: -70 } },
    drone:   { x: -70, z: -78, pad: { x: -64, z: -70 } },
    build:   { x: 118, z: 20,  pad: { x: 110, z: 14 } },
    electric:{ x: -110,z: 70,  pad: { x: -102, z: 62 } },
    ice:     { x: 72,  z: 148, pad: { x: 66, z: 140 } },
    news:    { x: -20, z: 90,  pad: { x: -14, z: 82 } },
  };

  let active = false, st = [], targets = { photo: [], fish: [], garden: [], drone: [], build: [], electric: [], ice: [], news: [] };

  function blank() { return { job: null, time: 0, done: 0, needLeave: false, carry: 0 }; }

  function stopJob(i) {
    const s = st[i]; if (!s || !s.job) return;
    const id = s.job;
    (targets[id] || []).forEach(t => { if (t.g) H.removeObject(t.g); });
    targets[id] = (targets[id] || []).filter(t => t.owner !== i);
    s.job = null; s.time = 0; s.done = 0; s.carry = 0; s.needLeave = true;
    H.hud(i, '', 'job3');
  }

  function startHud(p, text) { H.hud(p.index, text, 'job3'); }

  // ---------- rakennukset ----------
  function buildWorld() {
    const G = T();
    // Valokuvaamo
    let g = new G.Group();
    box(8, 4, 6, M(0xf8f9fa), 0, 2, 0, g); box(8.4, 0.3, 6.4, M(0x212529), 0, 4.15, 0, g);
    box(1.5, 2.2, 0.15, M(0x495057), 0, 1.1, 3.05, g);
    const cam = cyl(0.35, 0.4, 0.8, M(0x343a40), 0, 0, 0, g); cam.rotation.z = Math.PI / 2; cam.position.set(0, 2.2, 3.4);
    const pl = H.makeLabel('📷 VALOKUVAAMO', { bg: '#495057', scale: 5.5 }); pl.position.set(0, 5.2, 0); g.add(pl);
    H.addObject(g, LOC.photo.x, 0, LOC.photo.z);
    for (const x of [-2.5, 2.5]) for (const z of [-2, 2]) H.addObstacle(LOC.photo.x + x, LOC.photo.z + z, 1.6);
    pad(LOC.photo.pad.x, LOC.photo.pad.z, 0x868e96, '📷 Valokuvaaja');

    // Kalasatama
    g = new G.Group();
    box(10, 0.25, 8, M(0x868e96), 0, 0.12, 0, g);
    box(1.2, 3.5, 1.2, M(0x495057), -4, 1.75, -3, g);
    box(0.15, 2.5, 6, M(0xadb5bd), 4.5, 1.25, 0, g);
    const fl = H.makeLabel('🎣 KALASATAMA', { bg: '#1c7ed6', scale: 5.5 }); fl.position.set(0, 3.5, 0); g.add(fl);
    H.addObject(g, LOC.fish.x, 0, LOC.fish.z);
    for (let x = -3; x <= 3; x += 3) H.addObstacle(LOC.fish.x + x, LOC.fish.z - 2, 1.2);
    pad(LOC.fish.pad.x, LOC.fish.pad.z, 0x1c7ed6, '🎣 Kalastaja');

    // Puutarha
    g = new G.Group();
    box(9, 3.5, 7, M(0x2f9e44), 0, 1.75, 0, g); box(9.4, 0.3, 7.4, M(0xf08c00), 0, 3.65, 0, g);
    const gl = H.makeLabel('🌻 PUUTARHA', { bg: '#2b8a3e', scale: 5.5 }); gl.position.set(0, 4.8, 0); g.add(gl);
    H.addObject(g, LOC.garden.x, 0, LOC.garden.z);
    for (const x of [-3, 3]) for (const z of [-2, 2]) H.addObstacle(LOC.garden.x + x, LOC.garden.z + z, 1.5);
    pad(LOC.garden.pad.x, LOC.garden.pad.z, 0x82c91e, '🌻 Puutarhuri');

    // Droneasema
    g = new G.Group();
    box(7, 3.2, 7, M(0x228be6), 0, 1.6, 0, g);
    const disc = new (T().Mesh)(new (T().CylinderGeometry)(2.2, 2.2, 0.15, 24), M(0xdee2e6, { e: 0x74c0fc, ei: 0.4 }));
    disc.position.y = 3.5; g.add(disc);
    const dl = H.makeLabel('🛸 DRONEASEMA', { bg: '#1864ab', scale: 5.5 }); dl.position.set(0, 4.6, 0); g.add(dl);
    H.addObject(g, LOC.drone.x, 0, LOC.drone.z);
    for (const x of [-2.5, 2.5]) H.addObstacle(LOC.drone.x + x, LOC.drone.z, 1.8);
    pad(LOC.drone.pad.x, LOC.drone.pad.z, 0x339af0, '🛸 Dronekuski');

    // Työmaa
    g = new G.Group();
    box(12, 0.2, 10, M(0xf59f00), 0, 0.1, 0, g);
    box(2, 4, 2, M(0xffd43b), -4, 2, -3, g); box(2, 5.5, 2, M(0xffd43b), 3, 2.75, 2, g);
    const bl = H.makeLabel('🧱 TYÖMAA', { bg: '#e67700', scale: 5.5 }); bl.position.set(0, 4, 0); g.add(bl);
    H.addObject(g, LOC.build.x, 0, LOC.build.z);
    for (let x = -4; x <= 4; x += 4) H.addObstacle(LOC.build.x + x, LOC.build.z - 3, 1.4);
    pad(LOC.build.pad.x, LOC.build.pad.z, 0xf59f00, '🧱 Rakennusmies');

    // Sähköasema
    g = new G.Group();
    box(8, 4.5, 6, M(0x212529), 0, 2.25, 0, g);
    box(0.3, 6, 0.3, M(0xffd43b, { e: 0xffd43b, ei: 0.8 }), -3, 3, 0, g);
    box(0.3, 6, 0.3, M(0xffd43b, { e: 0xffd43b, ei: 0.8 }), 3, 3, 0, g);
    const el = H.makeLabel('⚡ SÄHKÖASEMA', { bg: '#fab005', scale: 5.5 }); el.position.set(0, 5.5, 0); g.add(el);
    H.addObject(g, LOC.electric.x, 0, LOC.electric.z);
    for (const x of [-2.5, 2.5]) H.addObstacle(LOC.electric.x + x, LOC.electric.z, 1.6);
    pad(LOC.electric.pad.x, LOC.electric.pad.z, 0xfcc419, '⚡ Sähköasentaja');

    // Jäätelökioski
    g = new G.Group();
    box(6, 3.2, 5, M(0xffc9c9), 0, 1.6, 0, g); box(6.4, 0.4, 5.4, M(0xff6b6b), 0, 3.4, 0, g);
    const cone = new (T().Mesh)(new (T().ConeGeometry)(1.2, 2.2, 12), M(0xffd43b)); cone.position.y = 5.2; g.add(cone);
    const il = H.makeLabel('🍦 JÄÄTELÖ', { bg: '#fa5252', scale: 5 }); il.position.set(0, 6.8, 0); g.add(il);
    H.addObject(g, LOC.ice.x, 0, LOC.ice.z);
    for (const x of [-2, 2]) H.addObstacle(LOC.ice.x + x, LOC.ice.z, 1.4);
    pad(LOC.ice.pad.x, LOC.ice.pad.z, 0xff8787, '🍦 Jäätelökuski');

    // Uutisstudio
    g = new G.Group();
    box(9, 4, 7, M(0x4c6ef5), 0, 2, 0, g); box(9.4, 0.3, 7.4, M(0x364fc7), 0, 4.15, 0, g);
    box(2.5, 1.6, 0.1, M(0x212529, { e: 0x74c0fc, ei: 0.5 }), 0, 2.2, 3.55, g);
    const nl = H.makeLabel('📰 UUTISET', { bg: '#364fc7', scale: 5.5 }); nl.position.set(0, 5.2, 0); g.add(nl);
    H.addObject(g, LOC.news.x, 0, LOC.news.z);
    for (const x of [-3, 3]) for (const z of [-2, 2]) H.addObstacle(LOC.news.x + x, LOC.news.z + z, 1.5);
    pad(LOC.news.pad.x, LOC.news.pad.z, 0x748ffc, '📰 Reportteri');
  }

  // ---------- työn aloitus ----------
  function mkTargets(id, i, n, cx, cz, r0, r1, color, emoji) {
    const arr = [];
    for (let k = 0; k < n; k++) {
      const p = freeNear(cx, cz, r0, r1);
      const g = new (T().Group)();
      const m = cyl(0.45, 0.45, 0.12, M(color, { e: color, ei: 0.35 }), 0, 0.06, 0, g, 16);
      const lab = H.makeLabel(emoji, { scale: 2.2, size: 48, bg: '#00000000' }); lab.position.y = 1.2; g.add(lab);
      H.addObject(g, p.x, 0, p.z);
      arr.push({ x: p.x, z: p.z, g, owner: i, ok: false, emoji });
    }
    targets[id] = (targets[id] || []).concat(arr);
    return arr;
  }

  function startPhoto(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'photo', time: 90, done: 0, needLeave: false, carry: 0 };
    mkTargets('photo', i, 5, 30, 60, 8, 35, 0xffd43b, '📸');
    H.toast(i, '📷 Kuvaa 5 kohdetta (E lähellä)!');
  }
  function startFish(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'fish', time: 80, done: 0, needLeave: false, carry: 0 };
    mkTargets('fish', i, 6, -90, 40, 6, 28, 0x74c0fc, '🐟');
    H.toast(i, '🎣 Vie 6 kalaa satamaan!');
  }
  function startGarden(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'garden', time: 85, done: 0, needLeave: false, carry: 0 };
    mkTargets('garden', i, 6, 70, -90, 5, 25, 0x69db7c, '🌷');
    H.toast(i, '🌻 Kastele 6 kukkaa!');
  }
  function startDrone(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'drone', time: 75, done: 0, needLeave: false, carry: 0 };
    mkTargets('drone', i, 5, -60, -60, 10, 40, 0x339af0, '📦');
    H.toast(i, '🛸 Toimita 5 pakettia droneasemalle!');
  }
  function startBuild(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'build', time: 90, done: 0, needLeave: false, carry: 0 };
    mkTargets('build', i, 5, 100, 30, 6, 30, 0xffd43b, '🧱');
    H.toast(i, '🧱 Kerää 5 tiilipinoa työmaalle!');
  }
  function startElectric(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'electric', time: 80, done: 0, needLeave: false, carry: 0 };
    mkTargets('electric', i, 5, -100, 50, 8, 32, 0xffd43b, '⚡');
    H.toast(i, '⚡ Korjaa 5 sähkövikaa!');
  }
  function startIce(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'ice', time: 70, done: 0, needLeave: false, carry: 0 };
    mkTargets('ice', i, 6, 40, 100, 8, 35, 0xff8787, '🏠');
    H.toast(i, '🍦 Toimita jäätelöä 6 kotiin!');
  }
  function startNews(p) {
    const i = p.index; stopJob(i);
    st[i] = { job: 'news', time: 85, done: 0, needLeave: false, carry: 0 };
    mkTargets('news', i, 5, 0, 70, 10, 40, 0x748ffc, '🎤');
    H.toast(i, '📰 Haastattele 5 kohdetta!');
  }

  const PADS = [
    { id: 'photo',    at: LOC.photo.pad,    name: 'Valokuvaaja',   info: 'kuvaa 5 kohdetta', start: startPhoto },
    { id: 'fish',     at: LOC.fish.pad,     name: 'Kalastaja',     info: 'vie 6 kalaa', start: startFish },
    { id: 'garden',   at: LOC.garden.pad,   name: 'Puutarhuri',    info: 'kastele 6 kukkaa', start: startGarden },
    { id: 'drone',    at: LOC.drone.pad,    name: 'Dronekuski',    info: 'toimita 5 pakettia', start: startDrone },
    { id: 'build',    at: LOC.build.pad,    name: 'Rakennusmies',  info: 'kerää 5 tiiltä', start: startBuild },
    { id: 'electric', at: LOC.electric.pad, name: 'Sähköasentaja', info: 'korjaa 5 vikaa', start: startElectric },
    { id: 'ice',      at: LOC.ice.pad,      name: 'Jäätelökuski',  info: 'toimita 6 jäätelöä', start: startIce },
    { id: 'news',     at: LOC.news.pad,     name: 'Reportteri',    info: 'haastattele 5', start: startNews },
  ];

  const NEED = { photo: 5, fish: 6, garden: 6, drone: 5, build: 5, electric: 5, ice: 6, news: 5 };
  const PAY = { photo: 4, fish: 3, garden: 3, drone: 5, build: 4, electric: 5, ice: 3, news: 4 };
  const BONUS = { photo: 10, fish: 8, garden: 8, drone: 12, build: 10, electric: 12, ice: 8, news: 10 };
  const EMOJI = { photo: '📷', fish: '🎣', garden: '🌻', drone: '🛸', build: '🧱', electric: '⚡', ice: '🍦', news: '📰' };
  const HOME = {
    photo: LOC.photo, fish: LOC.fish, garden: LOC.garden, drone: LOC.drone,
    build: LOC.build, electric: LOC.electric, ice: LOC.ice, news: LOC.news,
  };

  function updJob(p, dt) {
    const i = p.index, s = st[i]; if (!s || !s.job) return;
    s.time -= dt;
    const id = s.job, q = H.posOf(p);
    const mine = (targets[id] || []).filter(t => t.owner === i && !t.ok);
    const near = mine.sort((a, b) => dist(q, a) - dist(q, b))[0];
    if (near && dist(q, near) < 1.6 && H.pressed(i, 'interact')) {
      near.ok = true; if (near.g) H.removeObject(near.g); near.g = null;
      s.done++; pay(i, PAY[id], `${EMOJI[id]} +${PAY[id]} 🪙`);
      if (s.done >= NEED[id]) {
        stopJob(i); pay(i, BONUS[id], `${EMOJI[id]} Valmis! Bonus +${BONUS[id]} 🪙`);
        H.emit?.('job', i, id); return;
      }
    }
    if (s.time <= 0) {
      const left = mine.length; stopJob(i);
      H.emit?.('jobfail', i, id);
      H.toast(i, `${EMOJI[id]} Aika loppui – teit ${s.done}/${NEED[id]}.`, true);
      return;
    }
    const goal = near || HOME[id].pad;
    startHud(p, `${EMOJI[id]} ${s.done}/${NEED[id]} · ${arrow(p, goal.x, goal.z)} ${Math.round(dist(q, goal))} m · ⏱ ${Math.ceil(s.time)} s`);
  }

  H.onStart(() => {
    active = !H.challenge;
    st = [blank(), blank(), blank(), blank()];
    targets = { photo: [], fish: [], garden: [], drone: [], build: [], electric: [], ice: [], news: [] };
    if (!active) return;
    buildWorld();
  });
  H.onStop(() => {
    active = false;
    Object.keys(targets).forEach(k => { (targets[k] || []).forEach(t => t.g && H.removeObject(t.g)); targets[k] = []; });
  });
  H.onUpdate(dt => {
    if (!active) return;
    for (const p of H.players) {
      const i = p.index, s = st[i], q = H.posOf(p);
      if (s.job) { updJob(p, dt); continue; }
      const near = p.car == null && !p.rocket ? PADS.find(pd => dist(q, pd.at) < 1.6 && q.y < 2) : null;
      if (s.needLeave && !near) s.needLeave = false;
      if (near && !s.needLeave) {
        startHud(p, `${EMOJI[near.id] || '💼'} ${near.name}: ${near.info} · ${KEY[i]} = aloita`);
        if (H.pressed(i, 'interact')) near.start(p);
      } else startHud(p, '');
    }
  });

  H.jobs3 = {
    LOC, PADS: PADS.map(p => ({ id: p.id, ...p.at, name: p.name })),
    state: () => st.map(s => ({ job: s.job, time: s.time, done: s.done })),
    start: (i, id) => { const p = H.players[i]; const pd = PADS.find(x => x.id === id); if (p && pd) pd.start(p); },
    stop: i => stopJob(i),
  };
})();
