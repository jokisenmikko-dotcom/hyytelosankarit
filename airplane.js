// airplane.js – 3.3: yhteinen lentokone ja pienet matkakohteet (Kiina pakollinen).
// Kohde ladataan vain kun joku on siellä. Matala poly, ei varjovaloja.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.7, metalness: o.m ?? 0,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1, side: o.side ?? 0,
  });
  const KEY = (i) => H.KEYS('interact')[i];

  const HOME = { id: 'koti', name: 'Koti', emoji: '🏠', x: -88, z: -92, R: 30 };
  const DESTS = {
    kiina:  { id: 'kiina',  name: 'Kiina', emoji: '🇨🇳', x: 2200, z: 0,    R: 70, hint: 'Pitkä muuri, pagodi ja panda' },
    egypti: { id: 'egypti', name: 'Egypti', emoji: '🇪🇬', x: 2200, z: 420,  R: 70, hint: 'Pyramidit ja sfinksi' },
    japani: { id: 'japani', name: 'Japani', emoji: '🇯🇵', x: 2200, z: -420, R: 70, hint: 'Torii, fuji ja kello' },
    usa:    { id: 'usa',    name: 'Yhdysvallat', emoji: '🇺🇸', x: 2600, z: 0,    R: 70, hint: 'Vapaudenpatsas' },
    ruotsi: { id: 'ruotsi', name: 'Ruotsi', emoji: '🇸🇪', x: 2600, z: 420,  R: 70, hint: 'Taalainmaan hevonen' },
  };

  let active = false, plane = null, strip = null, destRoot = null;
  let destId = 'koti', flying = false, flyT = 0, flyTo = null, holdI = Array(12).fill(false);
  let aboard = [], acts = [];

  const box = (w, h, d, m, x, y, z, p) => {
    const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m);
    o.position.set(x, y, z); o.castShadow = false; p && p.add(o); return o;
  };
  const cyl = (rt, rb, h, m, x, y, z, p, seg = 8) => {
    const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), m);
    o.position.set(x, y, z); o.castShadow = false; p && p.add(o); return o;
  };

  function padOf(id) {
    if (!id || id === 'koti') return HOME;
    return DESTS[id] || HOME;
  }

  function buildPlane() {
    // 3.4: realistisempi, silti halpa (muutama materiaali, yksinkertainen geometria)
    const g = new (T().Group)();
    const body = M(0xf1f3f5, { r: 0.42, m: 0.12 });
    const blue = M(0x1864ab, { r: 0.5, m: 0.08 });
    const navy = M(0x0b3d66, { r: 0.5 });
    const glass = M(0x4dabf7, { r: 0.12, m: 0.25, e: 0x1864ab, ei: 0.22, op: 0.85 });
    const metal = M(0x868e96, { r: 0.35, m: 0.55 });
    const tire = M(0x212529, { r: 0.85 });
    const yellow = M(0xfcc419, { r: 0.5 });

    const fuse = cyl(0.72, 0.8, 9.2, body, 0, 1.55, 0.15, g, 12);
    fuse.rotation.x = Math.PI / 2;
    const rear = cyl(0.42, 0.72, 1.9, body, 0, 1.55, 5.35, g, 10);
    rear.rotation.x = Math.PI / 2;
    const nose = new (T().Mesh)(new (T().ConeGeometry)(0.72, 1.65, 12), body);
    nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.55, -5.35); g.add(nose);

    box(0.95, 0.44, 0.08, glass, 0, 1.98, -4.4, g);
    box(0.08, 0.44, 0.52, glass, 0.48, 1.98, -4.15, g);
    box(0.08, 0.44, 0.52, glass, -0.48, 1.98, -4.15, g);
    box(0.88, 0.16, 1.15, body, 0, 2.22, -3.9, g);

    for (let k = -2; k <= 3; k++) {
      box(0.06, 0.26, 0.38, glass, 0.78, 1.74, k * 0.85 - 0.35, g);
      box(0.06, 0.26, 0.38, glass, -0.78, 1.74, k * 0.85 - 0.35, g);
    }
    box(1.62, 0.12, 8.6, blue, 0, 1.22, 0.1, g);

    const wingL = box(6.5, 0.13, 2.05, body, -3.85, 1.28, 0.6, g);
    wingL.rotation.y = 0.3;
    const wingR = box(6.5, 0.13, 2.05, body, 3.85, 1.28, 0.6, g);
    wingR.rotation.y = -0.3;
    box(0.85, 0.15, 1.55, blue, -6.7, 1.3, 1.4, g);
    box(0.85, 0.15, 1.55, blue, 6.7, 1.3, 1.4, g);

    function engine(x, z) {
      const pod = cyl(0.32, 0.28, 1.55, metal, x, 0.85, z, g, 8);
      pod.rotation.x = Math.PI / 2;
      const lip = cyl(0.34, 0.34, 0.16, navy, x, 0.85, z - 0.72, g, 8);
      lip.rotation.x = Math.PI / 2;
      const ex = cyl(0.2, 0.26, 0.18, tire, x, 0.85, z + 0.72, g, 8);
      ex.rotation.x = Math.PI / 2;
    }
    engine(-2.65, 0.55); engine(2.65, 0.55);

    box(0.12, 1.9, 1.55, body, 0, 2.75, 5.2, g);
    box(0.13, 0.85, 0.55, blue, 0, 3.2, 5.4, g);
    box(3.5, 0.1, 1.2, body, 0, 2.18, 5.3, g);
    box(0.14, 0.36, 0.36, yellow, 0, 3.2, 5.2, g);

    cyl(0.05, 0.05, 0.7, metal, 0, 0.55, -3.25, g, 6);
    const nw = cyl(0.16, 0.16, 0.12, tire, 0, 0.18, -3.25, g, 8);
    nw.rotation.z = Math.PI / 2;
    for (const sx of [-1.15, 1.15]) {
      cyl(0.05, 0.05, 0.65, metal, sx, 0.52, 0.75, g, 6);
      const w = cyl(0.18, 0.18, 0.14, tire, sx, 0.16, 0.75, g, 8);
      w.rotation.z = Math.PI / 2;
    }

    const lab = H.makeLabel('✈️ Yhteinen lentokone', { scale: 3.2, bg: '#1864ab' });
    lab.position.set(0, 4.05, 0); g.add(lab);
    plane = g;
    H.addObject(plane, HOME.x, 0, HOME.z);
  }

  function buildStrip() {
    strip = new (T().Group)();
    box(16, 0.08, 40, M(0x495057, { r: 0.95 }), 0, 0.02, 0, strip);
    for (let k = -4; k <= 4; k++) box(0.35, 0.04, 2.2, M(0xf8f9fa), 0, 0.08, k * 4, strip);
    box(1.2, 3.2, 0.16, M(0xf8f9fa), 9, 1.6, -16, strip);
    box(1.6, 1.0, 0.08, M(0x2f9e44, { e: 0x2f9e44, ei: 0.2 }), 9, 2.7, -15.9, strip);
    const lab = H.makeLabel('🛫 Lentokenttä', { scale: 3.4, bg: '#212529' });
    lab.position.set(0, 4.2, -18); strip.add(lab);
    H.addObject(strip, HOME.x, 0, HOME.z);
  }

  function clearDest() {
    if (destRoot && destRoot.parent) destRoot.parent.remove(destRoot);
    destRoot = null; acts = [];
  }

  function addAct(id, x, z, r, label, fn) {
    acts.push({ id, x, z, r, label, fn });
  }

  function buildDest(id) {
    clearDest();
    if (!id || id === 'koti') return;
    const d = DESTS[id]; if (!d) return;
    const g = new (T().Group)();
    destRoot = g;
    const grass = M(0x8ce99a, { r: 1 });
    const sand = M(0xf3d19c, { r: 1 });
    if (id === 'kiina') {
      box(90, 0.2, 90, grass, 0, -0.05, 0, g);
      // muuri
      for (let k = -6; k <= 6; k++) {
        box(5.5, 3.2, 1.4, M(0xb08968), k * 5.2, 1.6, -18, g);
        if (k % 2 === 0) box(1.2, 1.1, 1.6, M(0x9c6b3c), k * 5.2, 3.7, -18, g);
      }
      const wallLab = H.makeLabel('🧱 Pitkä muuri', { scale: 3.0, bg: '#7a4f2a' });
      wallLab.position.set(0, 5.2, -18); g.add(wallLab);
      // pagodi
      for (let k = 0; k < 4; k++) {
        const w = 4.2 - k * 0.7;
        box(w, 1.3, w, M(0xe03131), 16, 0.7 + k * 1.55, 8, g);
        box(w + 0.8, 0.16, w + 0.8, M(0xfcc419), 16, 1.3 + k * 1.55, 8, g);
      }
      const pag = H.makeLabel('🏯 Pagodi', { scale: 2.4, bg: '#c92a2a' });
      pag.position.set(16, 7.4, 8); g.add(pag);
      // panda
      const panda = new (T().Group)();
      const body = new (T().Mesh)(new (T().SphereGeometry)(0.7, 10, 8), M(0xf8f9fa));
      body.position.y = 0.75; panda.add(body);
      const head = new (T().Mesh)(new (T().SphereGeometry)(0.45, 10, 8), M(0xf8f9fa));
      head.position.set(0.7, 1.15, 0); panda.add(head);
      const earL = new (T().Mesh)(new (T().SphereGeometry)(0.16, 6, 6), M(0x212529));
      earL.position.set(0.6, 1.5, 0.28); panda.add(earL);
      const earR = earL.clone(); earR.position.z = -0.28; panda.add(earR);
      const eyeL = new (T().Mesh)(new (T().SphereGeometry)(0.1, 6, 6), M(0x212529));
      eyeL.position.set(1.0, 1.2, 0.18); panda.add(eyeL);
      const eyeR = eyeL.clone(); eyeR.position.z = -0.18; panda.add(eyeR);
      panda.position.set(-12, 0, 10); g.add(panda);
      const plab = H.makeLabel('🐼 Panda Panda', { scale: 2.2, bg: '#212529' });
      plab.position.set(-12, 2.3, 10); g.add(plab);
      addAct('panda', d.x - 12, d.z + 10, 2.2, '🐼 Silitä pandaa', (p) => {
        H.toast(p.index, '🐼 Panda murisee tyytyväisenä ja syö bambua!');
        H.beep(392, 0.12, 'triangle', 0.04);
      });
      addAct('wall', d.x, d.z - 18, 6, '🧱 Kävele muurilla', (p) => {
        H.toast(p.index, '🧱 Näköala muurin päältä on huikea!');
        H.beep(523, 0.08, 'triangle', 0.03);
      });
    } else if (id === 'egypti') {
      box(90, 0.2, 90, sand, 0, -0.05, 0, g);
      const pyr = new (T().Mesh)(new (T().ConeGeometry)(10, 12, 4), M(0xe6c07b));
      pyr.position.set(-10, 6, -8); pyr.rotation.y = Math.PI / 4; g.add(pyr);
      const pyr2 = new (T().Mesh)(new (T().ConeGeometry)(6, 7, 4), M(0xd9b56a));
      pyr2.position.set(10, 3.5, -14); pyr2.rotation.y = Math.PI / 4; g.add(pyr2);
      // sfinksi
      const sphinx = new (T().Group)();
      box(5.5, 1.6, 2.2, M(0xd9b56a), 0, 0.8, 0, sphinx);
      const hd = new (T().Mesh)(new (T().SphereGeometry)(0.9, 8, 8), M(0xe6c07b));
      hd.position.set(2.6, 2.0, 0); sphinx.add(hd);
      sphinx.position.set(8, 0, 10); g.add(sphinx);
      const slab = H.makeLabel('🦁 Sfinksi', { scale: 2.4, bg: '#c92a2a' });
      slab.position.set(8, 3.4, 10); g.add(slab);
      const camel = new (T().Group)();
      box(2.2, 1.1, 0.7, M(0xc9a227), 0, 1.1, 0, camel);
      box(0.6, 1.2, 0.6, M(0xc9a227), 1.1, 2.0, 0, camel);
      camel.position.set(-16, 0, 8); g.add(camel);
      addAct('sphinx', d.x + 8, d.z + 10, 3, '🦁 Katso sfinksiä', (p) => {
        H.toast(p.index, '🦁 Sfinksi hymyilee arvoituksellisesti.');
        H.beep(300, 0.15, 'triangle', 0.04);
      });
    } else if (id === 'japani') {
      box(90, 0.2, 90, M(0xa9e34b, { r: 1 }), 0, -0.05, 0, g);
      // fuji
      const fuji = new (T().Mesh)(new (T().ConeGeometry)(12, 16, 10), M(0x868e96));
      fuji.position.set(-16, 8, -16); g.add(fuji);
      const snow = new (T().Mesh)(new (T().ConeGeometry)(4.2, 5, 10), M(0xf8f9fa));
      snow.position.set(-16, 14.2, -16); g.add(snow);
      // torii
      box(0.35, 4.2, 0.35, M(0xe03131), -2, 2.1, 8, g);
      box(0.35, 4.2, 0.35, M(0xe03131), 2, 2.1, 8, g);
      box(5.2, 0.28, 0.4, M(0xc92a2a), 0, 4.3, 8, g);
      box(4.4, 0.16, 0.3, M(0xc92a2a), 0, 3.7, 8, g);
      const tlab = H.makeLabel('⛩️ Torii', { scale: 2.2, bg: '#c92a2a' });
      tlab.position.set(0, 5.4, 8); g.add(tlab);
      // kello
      cyl(0.5, 0.55, 1.1, M(0xfcc419, { m: 0.5, e: 0xf59f00, ei: 0.15 }), 8, 1.4, 6, g, 10);
      const blab = H.makeLabel('🔔 Temppelin kello', { scale: 2.0, bg: '#5c4033' });
      blab.position.set(8, 2.6, 6); g.add(blab);
      // sakura (pallo)
      cyl(0.18, 0.22, 2.2, M(0x8f5420), 12, 1.1, 12, g, 6);
      const sak = new (T().Mesh)(new (T().SphereGeometry)(1.3, 8, 6), M(0xffa8d1, { r: 1 }));
      sak.position.set(12, 2.6, 12); g.add(sak);
      addAct('bell', d.x + 8, d.z + 6, 2, '🔔 Soita kelloa', (p) => {
        H.toast(p.index, '🔔 Gong! Temppelin kello kaiuttaa.');
        H.beep(220, 0.4, 'sine', 0.08);
      });
    } else if (id === 'usa') {
      box(90, 0.2, 90, M(0x74c0fc, { r: 1 }), 0, -0.08, 0, g); // vesi / nurmi
      box(30, 0.22, 30, M(0x8ce99a), 0, 0.02, 0, g);
      // vapaudenpatsas (yksinkertaistettu)
      cyl(0.9, 1.1, 4.5, M(0x2f9e44), 0, 3.4, 0, g, 10);
      const robe = new (T().Mesh)(new (T().SphereGeometry)(1.1, 8, 8), M(0x37b24d));
      robe.scale.set(1, 1.3, 1); robe.position.y = 6.2; g.add(robe);
      const head = new (T().Mesh)(new (T().SphereGeometry)(0.55, 8, 8), M(0x37b24d));
      head.position.y = 7.6; g.add(head);
      box(0.15, 1.6, 0.15, M(0xfcc419), 0.7, 7.8, 0, g);
      const sl = H.makeLabel('🗽 Vapaudenpatsas', { scale: 2.8, bg: '#1864ab' });
      sl.position.set(0, 9.2, 0); g.add(sl);
      // pieni kanjoni
      box(10, 2.2, 4, M(0xd9480f), 16, 1.1, -10, g);
      box(10, 1.2, 4, M(0xc92a2a), 16, 2.8, -10, g);
      addAct('liberty', d.x, d.z, 4, '🗽 Ota kuva', (p) => {
        H.toast(p.index, '📸 Naps! Hieno matkakuva patsasta.');
        H.beep(880, 0.08, 'square', 0.04);
      });
    } else if (id === 'ruotsi') {
      box(90, 0.2, 90, M(0x8ce99a, { r: 1 }), 0, -0.05, 0, g);
      // lippu
      box(0.12, 5.2, 0.12, M(0xf8f9fa), -8, 2.6, 6, g);
      box(1.8, 1.1, 0.08, M(0x1c7ed6), -7.0, 4.6, 6, g);
      box(1.8, 0.22, 0.09, M(0xfcc419), -7.0, 4.6, 6.02, g);
      box(0.22, 1.1, 0.09, M(0xfcc419), -7.0, 4.6, 6.02, g);
      // linna
      box(8, 4, 6, M(0xdee2e6), 8, 2, -6, g);
      box(1.6, 2.2, 1.6, M(0xced4da), 4.5, 5.1, -3.5, g);
      box(1.6, 2.2, 1.6, M(0xced4da), 11.5, 5.1, -3.5, g);
      const cl = H.makeLabel('🏰 Linna', { scale: 2.4, bg: '#495057' });
      cl.position.set(8, 6.6, -6); g.add(cl);
      // daalahevonen
      const horse = new (T().Group)();
      box(1.8, 1.1, 0.5, M(0xe03131), 0, 1.0, 0, horse);
      box(0.5, 1.3, 0.45, M(0xe03131), -0.8, 1.8, 0, horse);
      box(0.18, 1.0, 0.18, M(0xf8f9fa), -0.55, 0.5, 0.22, horse);
      box(0.18, 1.0, 0.18, M(0xf8f9fa), 0.55, 0.5, 0.22, horse);
      box(0.18, 1.0, 0.18, M(0xf8f9fa), -0.55, 0.5, -0.22, horse);
      box(0.18, 1.0, 0.18, M(0xf8f9fa), 0.55, 0.5, -0.22, horse);
      horse.position.set(-4, 0, 10); g.add(horse);
      const hl = H.makeLabel('🐴 Dalahevonen', { scale: 2.2, bg: '#c92a2a' });
      hl.position.set(-4, 2.5, 10); g.add(hl);
      addAct('horse', d.x - 4, d.z + 10, 2.2, '🐴 Silitä hevosta', (p) => {
        H.toast(p.index, '🐴 Dalahevonen keinuu iloisesti!');
        H.beep(523, 0.1, 'triangle', 0.04);
      });
    }
    // kohteen pieni kiitorata + kyltti
    box(10, 0.08, 24, M(0x495057), 0, 0.03, 22, g);
    const back = H.makeLabel(d.emoji + ' ' + d.name + ' · ✈️ kotiin koneella', { scale: 3.2, bg: '#1864ab' });
    back.position.set(0, 4.0, 22); g.add(back);
    H.addObject(g, d.x, 0, d.z);
    try { H.mergeStatic?.(g, new Set()); } catch (e) {}
  }

  function placePlane(id) {
    const pad = padOf(id);
    if (plane) plane.position.set(pad.x, flying ? 8 : 0, pad.z);
  }

  function seatPlayers() {
    let n = 0;
    for (const p of aboard) {
      if (!p || !plane) continue;
      const off = (n - (aboard.length - 1) / 2) * 0.7;
      p.pos.set(plane.position.x + off, flying ? 9 : 1.2, plane.position.z);
      p.vx = p.vz = p.vy = 0; p.speed = 0; p.lock = true; p.grounded = true;
      n++;
    }
  }

  function board(p, quiet) {
    if (!p || flying) return false;
    if (aboard.includes(p)) return true;
    p.plane = true; p.car = null; p.rocket = false; p.lock = true;
    p.moon = false; p._bodyId = null;
    aboard.push(p);
    seatPlayers();
    if (!quiet) { H.toast(p.index, '✈️ Nousit koneeseen!'); H.beep(523, 0.08, 'triangle', 0.04); }
    return true;
  }

  function deplaneAll(pad) {
    pad = pad || padOf(destId);
    aboard.forEach((p, k) => {
      if (!p) return;
      p.plane = false; p.lock = false;
      p.pos.set(pad.x + (k - 1) * 1.4, 0.15, pad.z + 8);
      p.vx = p.vz = 0; p.grounded = true;
    });
    aboard = [];
  }

  function leave(p) {
    if (!p || flying) return false;
    const ix = aboard.indexOf(p);
    if (ix < 0) return false;
    aboard.splice(ix, 1);
    p.plane = false; p.lock = false;
    const pad = padOf(destId);
    p.pos.set(pad.x, 0.15, pad.z + 8);
    H.toast(p.index, 'Laskeuduit kentälle');
    return true;
  }

  function gatherNearby() {
    const pad = padOf(destId);
    for (const p of (H.players || [])) {
      if (!p || p.car != null || p.rocket) continue;
      if (aboard.includes(p)) continue;
      if (Math.hypot(p.pos.x - pad.x, p.pos.z - pad.z) < 10) board(p, true);
    }
  }

  function fly(id, opts) {
    opts = opts || {};
    if (flying) return false;
    if (id !== 'koti' && !DESTS[id]) return false;
    if (id === destId && !opts.force) { H.toast(aboard[0]?.index || 0, 'Olet jo täällä!', true); return false; }
    gatherNearby();
    if (!aboard.length && opts.pilot != null) {
      const p = H.players[opts.pilot]; if (p) board(p, true);
    }
    if (!aboard.length) return false;
    flying = true; flyT = opts.instant ? 99 : 0; flyTo = id;
    aboard.forEach(p => H.toast(p.index, '✈️ Lentoon! Matka kohteeseen ' + (id === 'koti' ? 'Koti' : DESTS[id].name) + '…'));
    H.beep(392, 0.2, 'sine', 0.05);
    if (opts.instant) finishFly();
    return true;
  }

  function finishFly() {
    const id = flyTo; flyTo = null; flying = false; flyT = 0;
    destId = id || 'koti';
    buildDest(destId);
    placePlane(destId);
    if (plane) { plane.rotation.z = 0; plane.position.y = 0; }
    const pad = padOf(destId);
    deplaneAll(pad);
    (H.players || []).forEach(p => {
      if (!p) return;
      if (Math.hypot(p.pos.x - pad.x, p.pos.z - pad.z) < 14) {
        H.toast(p.index, destId === 'koti' ? '🏠 Laskeuduitte kotiin!' : ('🗺️ Tervetuloa: ' + pad.name + '!'));
      }
    });
  }

  function openMenu(p) {
    if (!H.menuPad || flying) return;
    const items = [];
    if (destId !== 'koti') items.push({ id: 'koti', html: '🏠 Lento kotiin' });
    Object.values(DESTS).forEach((d) => {
      items.push({
        id: d.id,
        disabled: d.id === destId,
        html: d.id === destId ? (d.emoji + ' ' + d.name + ' (olet täällä)') : (d.emoji + ' ' + d.name + ' — ' + d.hint),
      });
    });
    items.push({ id: 'out', html: '🚪 Jää kentälle' });
    H.menuPad.show({
      owner: p.index,
      title: '✈️ Minne lennetään?',
      items,
      onSelect: (it) => {
        if (it.id === 'out') leave(p);
        else fly(it.id, { pilot: p.index });
      },
    });
  }

  H.planeOut = (x, z) => {
    for (const d of [HOME, ...Object.values(DESTS)]) {
      const dist = Math.hypot(x - d.x, z - d.z);
      if (dist <= d.R + 8) return dist > d.R;
    }
    return null;
  };

  H.onStart(() => {
    active = !H.challenge; destId = 'koti'; flying = false; flyTo = null;
    aboard = []; acts = []; holdI = Array(12).fill(false);
    plane = null; strip = null; destRoot = null;
    if (!active) return;
    try { buildStrip(); buildPlane(); } catch (e) { console.warn('plane', e); }
  });
  H.onStop(() => {
    active = false; clearDest(); plane = null; strip = null; aboard = []; flying = false;
  });

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    if (flying) {
      flyT += dt;
      if (plane) {
        plane.position.y = Math.min(18, flyT * 12);
        plane.rotation.z = Math.sin(flyT * 3) * 0.05;
      }
      seatPlayers();
      if (flyT > 1.6) finishFly();
      return;
    }
    const pad = padOf(destId);
    if (plane && !flying) plane.position.y = 0;

    for (const p of (H.players || [])) {
      if (!p || p.car != null || p.rocket) continue;
      const i = p.index, key = KEY(i);
      if (H.menuPad?.open && H.menuPad.owner === i) continue;
      const want = !!(H.input(i) && H.input(i).interact);

      if (aboard.includes(p)) {
        H.hud(i, `✈️ Koneessa · ${key} = kohde tai poistu`, 'plane');
        if (want && !holdI[i]) openMenu(p);
        holdI[i] = want;
        continue;
      }

      // kohteen aktiviteetti
      let used = false;
      for (const a of acts) {
        if (Math.hypot(p.pos.x - a.x, p.pos.z - a.z) < a.r) {
          H.hud(i, `${a.label} · ${key}`, 'plane');
          if (want && !holdI[i]) a.fn(p);
          holdI[i] = want; used = true; break;
        }
      }
      if (used) continue;

      const dPlane = Math.hypot(p.pos.x - pad.x, p.pos.z - pad.z);
      if (dPlane < 5 && p.pos.y < 3.5) {
        const where = destId === 'koti' ? 'maailmalle' : 'kotiin tai muualle';
        H.hud(i, `✈️ Lentokone · ${key} = nouse kyytiin (${where})`, 'plane');
        if (want && !holdI[i]) board(p);
        holdI[i] = want;
      } else {
        holdI[i] = false;
        H.hud(i, '', 'plane');
      }
    }
  });

  H.plane = {
    HOME, DESTS,
    dest: () => destId,
    flying: () => flying,
    aboard: () => aboard.map(p => p.index),
    board, leave, fly, openMenu,
    pad: () => padOf(destId),
    acts: () => acts.map(a => ({ id: a.id, x: a.x, z: a.z, r: a.r, label: a.label })),
    at: (id) => destId === id && !flying && (id === 'koti' || !!destRoot),
  };
  H.define?.('plane', H.plane);
})();
