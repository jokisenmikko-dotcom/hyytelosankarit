// hatch.js – 3.3: autotallin salaluukku ja Indiana Jones -henkinen maanalainen seikkailu
// (kivikäytävät, kammiot, köysisilta, lyhdyt, aarre, kirjahylly, arkku, vipupalapeli). Lämmin, ei pelottava.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1, side: o.side ?? 0,
  });
  const IN = { x: 850, z: -180, y: 0, R: 32 };
  const TREASURE_CD = 60;
  const KEY = (i) => H.KEYS('interact')[i];

  let active = false, levers = [], inside = [], returnTo = [], lanterns = [], lights = [];
  let treasureCd = Array(12).fill(-999);
  let holdI = Array(12).fill(false);
  let rootIn = null;
  let props = { chest: null, book: null, puzzle: null, alcove: null };
  const PUZZLE = [true, false, true]; // laitimet ylös, keski alas


  function box(w, h, d, mat, x, y, z, p) {
    const m = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = false; m.receiveShadow = true;
    if (p) p.add(m); return m;
  }
  function cyl(rt, rb, h, mat, x, y, z, p, seg = 8) {
    const m = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), mat);
    m.position.set(x, y, z); m.castShadow = false;
    if (p) p.add(m); return m;
  }

  function leverLocal(h) {
    // 3.4: sivuseinä (vasen), ettei luukun kohdalla tule vahinkoklikkauksia
    const gx0 = h.gx0 ?? 7, gz0 = h.gz0 ?? -5;
    return { x: h.x + gx0 + 0.22, y: 1.15, z: h.z + gz0 + 3.2 };
  }
  function hatchLocal(h) {
    const gx0 = h.gx0 ?? 7, gx1 = h.gx1 ?? 19, gz0 = h.gz0 ?? -5;
    return { x: h.x + (gx0 + gx1) / 2, y: 0.04, z: h.z + gz0 + 1.6 };
  }

  function makeLever() {
    const g = new (T().Group)();
    box(0.28, 0.55, 0.08, M(0x1a1512), 0, 0, 0, g);           // taustalevy
    const arm = cyl(0.03, 0.035, 0.45, M(0x2b2118), 0, 0.12, 0.12, g, 6);
    arm.rotation.x = -0.55;
    const knob = cyl(0.055, 0.05, 0.07, M(0x3d2b1f), 0, 0.28, 0.26, g, 6);
    g.userData.arm = arm; g.userData.knob = knob;
    return g;
  }
  function makeDoor() {
    const g = new (T().Group)();
    box(1.4, 0.06, 1.2, M(0x3e3428), 0, 0, 0, g);
    box(1.36, 0.02, 0.04, M(0x2b241c), 0, 0.04, 0, g);
    box(0.04, 0.02, 1.16, M(0x2b241c), 0, 0.04, 0, g);
    return g;
  }

  function attachToHomes() {
    levers = [];
    const list = H.homes?.list?.() || [];
    list.forEach((h) => {
      const lp = leverLocal(h), hp = hatchLocal(h);
      const lev = makeLever();
      H.addObject(lev, lp.x, lp.y, lp.z);
      // vipu katsoo talliin päin (sivuseinästä +x)
      lev.rotation.y = Math.PI / 2;
      const door = makeDoor();
      H.addObject(door, hp.x, hp.y, hp.z);
      const hole = box(1.15, 0.02, 0.95, M(0x0d0b09), 0, 0, 0, null);
      hole.visible = false;
      H.addObject(hole, hp.x, 0.01, hp.z);
      levers.push({ homeI: h.i, h, lp, hp, lev, door, hole, open: false });
    });
  }

  function buildInterior() {
    const G = T();
    rootIn = new G.Group();
    const stone = M(0x8d7b68), stoneD = M(0x6f5d4c), wood = M(0x8f5420), woodD = M(0x5c4033);
    const sand = M(0xc2a882), gold = M(0xfcc419, { e: 0xf59f00, ei: 0.25, m: 0.4 });
    // lattia / katto
    box(28, 0.3, 42, stoneD, 0, -0.15, 0, rootIn);
    box(28, 0.25, 42, stoneD, 0, 4.3, 0, rootIn);
    // ulkoseinät (matala käytävä)
    box(28, 4.2, 0.5, stone, 0, 2.1, 21, rootIn);
    box(28, 4.2, 0.5, stone, 0, 2.1, -21, rootIn);
    box(0.5, 4.2, 42, stone, 14, 2.1, 0, rootIn);
    box(0.5, 4.2, 42, stone, -14, 2.1, 0, rootIn);

    // sisäänkäyntikammio (pohjoinen) + tikkaat kattoon
    box(2.2, 4.0, 0.35, stone, -2.9, 2.0, 12, rootIn);
    box(2.2, 4.0, 0.35, stone, 2.9, 2.0, 12, rootIn);
    // oviaukko käytävään
    box(0.35, 4.0, 9, stone, -4, 2.0, 16.5, rootIn);
    box(0.35, 4.0, 9, stone, 4, 2.0, 16.5, rootIn);
    const shaft = box(1.6, 0.2, 1.6, M(0x1a1512), 0, 4.15, 17.5, rootIn);
    const ladder = new (T().Group)();
    cyl(0.04, 0.04, 4.2, wood, -0.28, 2.1, 0, ladder, 6);
    cyl(0.04, 0.04, 4.2, wood, 0.28, 2.1, 0, ladder, 6);
    for (let k = 0; k < 8; k++) box(0.62, 0.05, 0.07, woodD, 0, 0.35 + k * 0.5, 0, ladder);
    ladder.position.set(0, 0, 17.5); rootIn.add(ladder);
    const upLbl = H.makeLabel('🪜 Takaisin talliin', { scale: 2.6, size: 44, bg: '#3e3428' });
    upLbl.position.set(0, 3.4, 17.2); rootIn.add(upLbl);

    // käytävä etelään (3.4: leveämpi, ettei jää jumiin)
    box(0.4, 3.6, 12, stone, -3.2, 1.8, 5, rootIn);
    box(0.4, 3.6, 12, stone, 3.2, 1.8, 5, rootIn);
    // puupalkit
    for (let z = 10; z >= 0; z -= 3.2) {
      box(6.6, 0.22, 0.22, wood, 0, 3.55, z, rootIn);
      cyl(0.1, 0.12, 3.5, woodD, -3.0, 1.75, z, rootIn, 6);
      cyl(0.1, 0.12, 3.5, woodD, 3.0, 1.75, z, rootIn, 6);
    }

    // kammio A (länsi) – pölyä, seittiä, lyhtyjä
    box(0.35, 3.8, 8, stone, -6, 1.9, 0, rootIn);
    box(8, 3.8, 0.35, stone, -10, 1.9, -4, rootIn);
    box(8, 3.8, 0.35, stone, -10, 1.9, 4, rootIn);
    box(0.35, 3.8, 8, stone, -14, 1.9, 0, rootIn);
    // seitti (ohuet tasot)
    const web = M(0xe9ecef, { op: 0.28, r: 1 });
    box(1.6, 0.02, 1.2, web, -10, 3.4, 2.2, rootIn);
    box(1.1, 0.02, 0.9, web, -8.5, 3.5, -1.5, rootIn);
    // pölypalloja
    for (let k = 0; k < 6; k++) {
      const d = cyl(0.08 + k * 0.02, 0.1, 0.03, M(0xd0c4b0, { r: 1 }), -9 + (k % 3) * 1.4, 0.08, -1 + ((k / 3) | 0) * 2, rootIn, 6);
      d.rotation.x = 0.2;
    }

    // rotko + köysisilta
    const pit = box(8, 6, 5.5, M(0x1a1512), 5, -3.1, -8, rootIn);
    // sillan lankut
    for (let k = 0; k < 9; k++) {
      box(0.85, 0.08, 2.2, wood, 2 + k * 0.7, 0.12, -8, rootIn);
    }
    // köydet
    for (const side of [-1.15, 1.15]) {
      const rope = cyl(0.025, 0.025, 6.4, M(0xc9a227), 5, 1.15, -8 + side, rootIn, 5);
      rope.rotation.z = Math.PI / 2;
    }
    cyl(0.07, 0.08, 1.4, woodD, 1.6, 0.7, -8.45, rootIn, 6);
    cyl(0.07, 0.08, 1.4, woodD, 8.4, 0.7, -8.45, rootIn, 6);
    cyl(0.07, 0.08, 1.4, woodD, 1.6, 0.7, -7.55, rootIn, 6);
    cyl(0.07, 0.08, 1.4, woodD, 8.4, 0.7, -7.55, rootIn, 6);

    // aarrekammio idoli + karttapöytä
    box(0.4, 3.8, 10, stone, 13.5, 1.9, -8, rootIn);
    box(8, 3.8, 0.4, stone, 10, 1.9, -14, rootIn);
    box(8, 3.8, 0.4, stone, 10, 1.9, -3, rootIn);
    const ped = box(0.9, 0.7, 0.9, stoneD, 11.2, 0.35, -11, rootIn);
    const idol = cyl(0.18, 0.28, 0.7, gold, 11.2, 1.05, -11, rootIn, 8);
    const head = new (T().Mesh)(new (T().SphereGeometry)(0.22, 10, 8), gold);
    head.position.set(11.2, 1.55, -11); rootIn.add(head);
    const tlab = H.makeLabel('🗿 Onnenpatsas', { scale: 2.4, size: 44, bg: '#5c4033' });
    tlab.position.set(11.2, 2.3, -11); rootIn.add(tlab);
    // karttapöytä
    box(1.8, 0.12, 1.1, wood, 8.5, 0.85, -5.2, rootIn);
    cyl(0.07, 0.08, 0.85, woodD, 7.8, 0.42, -4.8, rootIn, 6);
    cyl(0.07, 0.08, 0.85, woodD, 9.2, 0.42, -4.8, rootIn, 6);
    cyl(0.07, 0.08, 0.85, woodD, 7.8, 0.42, -5.6, rootIn, 6);
    cyl(0.07, 0.08, 0.85, woodD, 9.2, 0.42, -5.6, rootIn, 6);
    box(1.5, 0.02, 0.85, M(0xe9d8c2), 8.5, 0.93, -5.2, rootIn);
    const mlab = H.makeLabel('🗺️ Vanha kartta', { scale: 2.2, size: 42, bg: '#5c4033' });
    mlab.position.set(8.5, 1.7, -5.2); rootIn.add(mlab);

    // lyhdyt (emissiivisiä, 2 oikeaa pistettä)
    lanterns = [];
    const lanternAt = [
      [0, 2.6, 17.2], [0, 2.6, 6], [-10, 2.5, 0], [5, 2.4, -6.2], [11, 2.5, -8],
    ];
    lanternAt.forEach(([x, y, z], k) => {
      const L = new (T().Group)();
      cyl(0.05, 0.05, 0.25, woodD, 0, 0.2, 0, L, 6);
      const bulb = new (T().Mesh)(new (T().SphereGeometry)(0.14, 8, 6), M(0xffe066, { e: 0xffc078, ei: 0.85 }));
      bulb.position.y = 0; L.add(bulb);
      L.position.set(x, y, z); rootIn.add(L);
      lanterns.push({ g: L, bulb, phase: k * 1.3 });
    });
    const p1 = new (T().PointLight)(0xffc078, 1.35, 18, 2);
    p1.position.set(0, 2.8, 10); rootIn.add(p1);
    const p2 = new (T().PointLight)(0xffe066, 1.1, 16, 2);
    p2.position.set(9, 2.6, -9); rootIn.add(p2);
    lights = [p1, p2];

    // lämmin lattian sävy sisäänkäynnissä
    box(6, 0.04, 6, sand, 0, 0.02, 16, rootIn);

    decorateRooms(wood, woodD, stone, stoneD, gold);

    H.addObject(rootIn, IN.x, IN.y, IN.z);
    const keep = new Set([p1, p2, ...lanterns.map(l => l.g), upLbl, tlab, mlab, idol, head, ...(props._keep || [])]);
    try { H.mergeStatic?.(rootIn, keep); } catch (e) {}
    registerHatchWalls();
    // 3.3: piilota sisätila ja valot kun kukaan ei ole maan alla (suorituskyky)
    rootIn.visible = false;
    lights.forEach((L) => { L.visible = false; L.intensity = 0; });
  }


  function pay(i, n, reason) {
    if (H.coop && typeof H.coop.pay === 'function') return H.coop.pay(i, n, reason);
    H.money?.add?.(i, n, reason);
    return n;
  }
  function tryReward(i, n, reason, okMsg) {
    const t = H.time || 0;
    if (t < (treasureCd[i] || 0) + TREASURE_CD) {
      H.toast(i, 'Aarre lepää vielä hetken… odota hetki.', true);
      return false;
    }
    treasureCd[i] = t;
    pay(i, n, reason);
    if (okMsg) H.toast(i, okMsg);
    H.beep(784, 0.12, 'triangle', 0.05);
    return true;
  }

  function crate(x, y, z, sx, sy, sz, parent) {
    const woodC = M(0x9c6b3c), band = M(0x5c4033);
    const g = new (T().Group)();
    box(sx, sy, sz, woodC, 0, sy / 2, 0, g);
    box(sx + 0.04, 0.06, sz + 0.04, band, 0, sy * 0.25, 0, g);
    box(sx + 0.04, 0.06, sz + 0.04, band, 0, sy * 0.75, 0, g);
    g.position.set(x, y, z); parent.add(g); return g;
  }
  function torchAt(x, y, z, parent) {
    const g = new (T().Group)();
    cyl(0.04, 0.05, 0.55, M(0x5c4033), 0, 0, 0, g, 6);
    const flame = new (T().Mesh)(new (T().SphereGeometry)(0.1, 6, 6), M(0xffc078, { e: 0xff922b, ei: 0.9 }));
    flame.position.y = 0.35; g.add(flame);
    g.position.set(x, y, z); parent.add(g);
    lanterns.push({ g, bulb: flame, phase: x + z });
    return g;
  }

  function decorateRooms(wood, woodD, stone, stoneD, gold) {
    props = { chest: null, book: null, puzzle: null, alcove: null };
    // sisäänkäynti: laatikot + soihtu
    crate(-2.4, 0, 15.2, 0.8, 0.55, 0.7, rootIn);
    crate(-1.7, 0, 15.6, 0.55, 0.4, 0.5, rootIn);
    torchAt(3.4, 2.2, 16.2, rootIn);
    const elab = H.makeLabel('📦 Vanhat arkut', { scale: 2.0, size: 40, bg: '#3e3428' });
    elab.position.set(-2.0, 1.7, 15.0); rootIn.add(elab);

    // käytävä: seinäsoihtuja
    torchAt(2.0, 2.3, 8, rootIn);
    torchAt(-2.0, 2.3, 3, rootIn);

    // länsikammio: kirjahylly + salainen kirja
    const shelf = new (T().Group)();
    box(2.6, 2.4, 0.28, woodD, 0, 1.2, 0, shelf);
    for (let k = 0; k < 4; k++) box(2.5, 0.06, 0.4, wood, 0, 0.3 + k * 0.7, 0.08, shelf);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 1 && c === 3) continue; // aukko salaiselle kirjalle
        const col = [0x862e9c, 0x1c7ed6, 0xc92a2a, 0x2f9e44, 0xe67700, 0x495057, 0x5c4033][(r * 3 + c) % 7];
        box(0.22, 0.5, 0.18, M(col), -1.05 + c * 0.32, 0.62 + r * 0.7, 0.12, shelf);
      }
    }
    const book = box(0.22, 0.5, 0.18, M(0xfcc419, { e: 0xf59f00, ei: 0.2 }), 0, 1.32, 0.12, shelf);
    shelf.position.set(-10, 0, -3.35); shelf.rotation.y = Math.PI; rootIn.add(shelf);
    const blab = H.makeLabel('📚 Kirjahylly', { scale: 2.1, size: 40, bg: '#3e3428' });
    blab.position.set(-10, 2.7, -3.1); rootIn.add(blab);
    props.book = { mesh: book, open: false, lab: blab };

    // rotkon toinen pää: avautuva aarrearkku
    const chest = new (T().Group)();
    box(1.1, 0.55, 0.7, woodD, 0, 0.28, 0, chest);
    const lid = box(1.14, 0.12, 0.74, wood, 0, 0.62, 0, chest);
    box(0.16, 0.18, 0.04, gold, 0, 0.45, 0.38, chest);
    chest.position.set(8.6, 0, -8); rootIn.add(chest);
    const clab = H.makeLabel('🎁 Aarrearkku', { scale: 2.0, size: 40, bg: '#5c4033' });
    clab.position.set(8.6, 1.5, -8); rootIn.add(clab);
    props.chest = { g: chest, lid, open: false, lab: clab };

    // vipupalapeli aarrekammion seinällä
    const puzzle = { levers: [], solved: false };
    const cols = [0xe03131, 0x2f9e44, 0x1c7ed6];
    const names = ['vasen', 'keski', 'oikea'];
    for (let k = 0; k < 3; k++) {
      const L = new (T().Group)();
      box(0.18, 0.5, 0.12, M(0x343a40), 0, 0, 0, L);
      const arm = box(0.06, 0.45, 0.06, M(cols[k], { e: cols[k], ei: 0.25 }), 0, 0.28, 0, L);
      arm.position.y = 0.15; arm.rotation.x = -0.55;
      L.position.set(8.2 + k * 1.15, 1.3, -13.5); rootIn.add(L);
      puzzle.levers.push({ g: L, arm, up: false, name: names[k] });
    }
    const plab = H.makeLabel('🎚️ Vipupalapeli', { scale: 2.0, size: 40, bg: '#5c4033' });
    plab.position.set(9.3, 2.3, -13.2); rootIn.add(plab);
    // pieni kätkö, avautuu kun palapeli ratkeaa
    const door = box(1.4, 2.0, 0.2, stone, 13.2, 1.1, -11, rootIn);
    const gem = new (T().Mesh)(new (T().OctahedronGeometry)(0.22), gold);
    gem.position.set(13.55, 1.1, -11); gem.visible = false; rootIn.add(gem);
    props.puzzle = puzzle;
    props.alcove = { door, gem, open: false, lab: plab };

    props._keep = [elab, blab, book, chest, lid, clab, plab, door, gem, ...puzzle.levers.map(v => v.g)];
  }



  function lw(x1, z1, x2, z2, h) {
    H.addWallSeg(IN.x + x1, IN.z + z1, IN.x + x2, IN.z + z2, h || 4.2, 0.45, 'hatch');
  }
  function registerHatchWalls() {
    H.clearWalls('hatch');
    // ulkoseinät
    lw(-14, 21, 14, 21); lw(-14, -21, 14, -21);
    lw(-14, -21, -14, 21); lw(14, -21, 14, 21);
    // sisäänkäyntikammio
    lw(-4, 12, -1.6, 12); lw(1.6, 12, 4, 12);
    lw(-4, 12, -4, 21); lw(4, 12, 4, 21);
    // leveä käytävä
    lw(-3.2, -1, -3.2, 12); lw(3.2, -1, 3.2, 12);
    // länsikammio (ovi keskellä itäseinässä)
    lw(-6, -4, -6, -1.5); lw(-6, 1.5, -6, 4);
    lw(-14, -4, -6, -4); lw(-14, 4, -6, 4);
    lw(-14, -4, -14, 4);
    // aarrekammion seinät
    lw(6, -14, 14, -14); lw(6, -3, 14, -3);
    lw(13.5, -14, 13.5, -3);
  }

  function pull(i, homeI) {
    const L = levers.find(v => v.homeI === homeI);
    if (!L) return false;
    L.open = !L.open;
    if (L.door) L.door.rotation.x = L.open ? -1.15 : 0;
    if (L.hole) L.hole.visible = !!L.open;
    if (L.lev && L.lev.userData.arm) L.lev.userData.arm.rotation.x = L.open ? 0.4 : -0.55;
    H.beep(L.open ? 280 : 220, 0.12, 'square', 0.04);
    H.toast(i, L.open ? 'Salaluukku avautui! 🪜' : 'Luukku sulkeutui');
    return L.open;
  }

  function enter(p, homeI) {
    const L = levers.find(v => v.homeI === (homeI ?? p.index));
    if (!L || !L.open) { H.toast(p.index, 'Luukku on kiinni', true); return false; }
    inside[p.index] = true;
    returnTo[p.index] = { x: L.hp.x, y: 0.15, z: L.hp.z + 1.2, homeI: L.homeI };
    p.lock = false; p.rocket = false; p.car = null; p.speed = 0; p.vy = 0;
    p.pos.set(IN.x, 0.15, IN.z + 17.5);
    p.grounded = true; p.air = 'none';
    p.firstPerson = true; p._forceFP = true;
    if (rootIn) {
      rootIn.visible = true;
      lights.forEach((L, k) => { L.visible = true; L.intensity = k ? 1.1 : 1.35; });
    }
    H.toast(p.index, '🕯️ Laskeuduit maan alle… lämmin lyhtyvalo!');
    H.beep(392, 0.1, 'triangle', 0.04);
    return true;
  }
  function leave(p) {
    const back = returnTo[p.index] || { x: 0, y: 0.15, z: 0 };
    inside[p.index] = false;
    p._forceFP = false;
    p.pos.set(back.x, back.y, back.z);
    p.speed = 0; p.vy = 0; p.grounded = true;
    H.toast(p.index, 'Palasit autotalliin');
    return true;
  }
  function exitTo(p, homeI) {
    const L = levers.find(v => v.homeI === homeI);
    const back = L ? { x: L.hp.x, y: 0.15, z: L.hp.z + 1.2 } : (returnTo[p.index] || { x: 0, y: 0.15, z: 0 });
    inside[p.index] = false;
    p._forceFP = false;
    p.pos.set(back.x, back.y, back.z);
    p.speed = 0; p.vy = 0; p.grounded = true;
    returnTo[p.index] = { ...back, homeI };
    H.toast(p.index, 'Nousit naapurin autotalliin');
    return true;
  }

  function takeTreasure(i) {
    const t = H.time || 0;
    if (t < (treasureCd[i] || 0) + TREASURE_CD) {
      H.toast(i, 'Patsas lepää vielä hetken…', true);
      return false;
    }
    treasureCd[i] = t;
    try {
      if (H.cooking?.grantLuck) H.cooking.grantLuck(i, 25);
      else if (H.v22?.setLuck) H.v22.setLuck(i, 25);
    } catch (e) {}
    pay(i, 3, '🗿 Löysit pienen aarteen! +3 🪙');
    H.toast(i, '🗿 Onnenpatsas hymyilee – onnea 25 s!');
    H.beep(784, 0.12, 'triangle', 0.05);
    return true;
  }
  function openTreasure(p) {
    if (H.menuPad?.open) return;
    const ready = (H.time || 0) >= (treasureCd[p.index] || 0) + TREASURE_CD;
    H.menuPad.show({
      owner: p.index,
      title: '🗿 Onnenpatsas',
      items: [
        { id: 'take', disabled: !ready, html: ready ? '✨ Kosketa patsasta (onni + pieni aarre)' : '⏳ Patsas lepää vielä' },
        { id: 'leave', html: 'Jätä rauhaan' },
      ],
      onSelect: (it) => { if (it.id === 'take') takeTreasure(p.index); },
    });
  }


  function readMap(p) {
    H.toast(p.index, '🗺️ Kartta kuiskaa: laitimet ylös, keski alas.');
    H.beep(523, 0.08, 'triangle', 0.04);
  }
  function pullBook(p) {
    if (!props.book) return;
    props.book.open = !props.book.open;
    if (props.book.mesh) props.book.mesh.position.z = props.book.open ? 0.36 : 0.12;
    H.beep(props.book.open ? 392 : 330, 0.08, 'square', 0.03);
    if (props.book.open) {
      H.toast(p.index, '📚 Kirjan välistä putosi lappu: "Katso karttaa."');
    }
  }
  function toggleChest(p) {
    if (!props.chest) return;
    props.chest.open = !props.chest.open;
    if (props.chest.lid) props.chest.lid.rotation.x = props.chest.open ? -1.05 : 0;
    H.beep(props.chest.open ? 300 : 220, 0.1, 'square', 0.04);
    if (props.chest.open) tryReward(p.index, 2, '🎁 Arkusta löytyi kolikoita! +2 🪙', '🎁 Arkku aukesi!');
    else H.toast(p.index, 'Arkku sulkeutui');
  }
  function pullPuzzle(p) {
    const pz = props.puzzle; if (!pz || pz.solved) return false;
    // käännä lähin vipu
    let best = 0, bd = 99;
    for (let k = 0; k < pz.levers.length; k++) {
      const L = pz.levers[k];
      const d = Math.hypot(p.pos.x - (IN.x + L.g.position.x), p.pos.z - (IN.z + L.g.position.z));
      if (d < bd) { bd = d; best = k; }
    }
    const L = pz.levers[best];
    L.up = !L.up;
    if (L.arm) L.arm.rotation.x = L.up ? 0.45 : -0.55;
    H.beep(L.up ? 440 : 330, 0.07, 'square', 0.03);
    const ok = pz.levers.every((v, k) => v.up === PUZZLE[k]);
    if (ok) {
      pz.solved = true;
      if (props.alcove) {
        props.alcove.open = true;
        if (props.alcove.door) props.alcove.door.rotation.y = 1.2;
        if (props.alcove.gem) props.alcove.gem.visible = true;
      }
      H.toast(p.index, '✅ Kiviovi avautui! Kätkö paljastui.');
      H.beep(660, 0.15, 'triangle', 0.05);
    }
    return true;
  }
  function takeAlcove(p) {
    if (!props.alcove || !props.alcove.open) return false;
    return tryReward(p.index, 3, '💎 Kätköstä löytyi jalokivi! +3 🪙', '💎 Löysit kätkön!');
  }

  H.hatchOut = (x, z) => {

    const d = Math.hypot(x - IN.x, z - IN.z);
    if (d <= IN.R + 8) return d > IN.R;
    return null;
  };

  H.onStart(() => {
    active = !H.challenge; inside = []; returnTo = []; levers = []; lanterns = []; lights = [];
    treasureCd = Array(12).fill(-999); holdI = Array(12).fill(false); rootIn = null;
    props = { chest: null, book: null, puzzle: null, alcove: null };
    if (!active) return;
    setTimeout(() => { if (active) { try { attachToHomes(); buildInterior(); } catch (e) { console.warn('hatch', e); } } }, 280);
  });
  H.onStop(() => { active = false; levers = []; lanterns = []; lights = []; rootIn = null; inside = []; });

  function anyoneInside() {
    const ps = H.players || [];
    for (let k = 0; k < ps.length; k++) { if (ps[k] && inside[ps[k].index]) return true; }
    return false;
  }
  function setInteriorLive(on) {
    if (rootIn && rootIn.visible !== !!on) rootIn.visible = !!on;
    lights.forEach((L, k) => {
      if (!L) return;
      L.visible = !!on;
      if (!on) L.intensity = 0;
      else if (!L.intensity) L.intensity = k ? 1.1 : 1.35;
    });
  }

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    const t = H.time || 0;
    const live = anyoneInside();
    setInteriorLive(live);
    if (live) {
      lanterns.forEach((L) => {
        const s = 0.75 + Math.sin(t * 5.2 + L.phase) * 0.18 + Math.sin(t * 11 + L.phase) * 0.06;
        if (L.bulb && L.bulb.material) L.bulb.material.emissiveIntensity = s;
      });
      lights.forEach((p, k) => { if (p && p.visible) p.intensity = (k ? 1.1 : 1.35) + Math.sin(t * 4.5 + k) * 0.12; });
    }

    // pidä pelaaja sisäalueella
    for (const p of (H.players || [])) {
      if (!p || !inside[p.index]) continue;
      const dx = p.pos.x - IN.x, dz = p.pos.z - IN.z;
      if (Math.hypot(dx, dz) > IN.R - 1) {
        const a = Math.atan2(dx, dz);
        p.pos.x = IN.x + Math.sin(a) * (IN.R - 1.2);
        p.pos.z = IN.z + Math.cos(a) * (IN.R - 1.2);
      }
      // älä tipu rotkoon pelottavasti: jos y liian matala, nosta sillan alkuun
      if (p.pos.y < -0.8) {
        p.pos.set(IN.x + 1.8, 0.2, IN.z - 8);
        p.vy = 0; H.toast(p.index, 'Otit tukea köydestä 🪢');
      }
    }

    for (const p of (H.players || [])) {
      if (!p || p.rocket || p.car != null) continue;
      const i = p.index, key = KEY(i);
      if (H.menuPad?.open && H.menuPad.owner === i) continue;
      if (inside[i]) {
        const wantIn = !!(H.input(i) && H.input(i).interact);
        if (Math.hypot(p.pos.x - IN.x, p.pos.z - (IN.z + 17.5)) < 2.2) {
          H.hud(i, `🪜 ${key} = kiipeä takaisin talliin`, 'hatch');
          if (wantIn && !holdI[i]) leave(p);
          holdI[i] = wantIn;
        } else if (Math.hypot(p.pos.x - (IN.x + 11.2), p.pos.z - (IN.z - 11)) < 1.8) {
          H.hud(i, `🗿 ${key} = onnenpatsas`, 'hatch');
          if (wantIn && !holdI[i]) openTreasure(p);
          holdI[i] = wantIn;
        } else if (Math.hypot(p.pos.x - (IN.x + 8.5), p.pos.z - (IN.z - 5.2)) < 1.6) {
          H.hud(i, `🗺️ Vanha kartta · ${key} = lue vinkki`, 'hatch');
          if (wantIn && !holdI[i]) readMap(p);
          holdI[i] = wantIn;
        } else if (Math.hypot(p.pos.x - (IN.x - 10), p.pos.z - (IN.z - 3.35)) < 1.8) {
          H.hud(i, `📚 Kirjahylly · ${key} = vedä kirjaa`, 'hatch');
          if (wantIn && !holdI[i]) pullBook(p);
          holdI[i] = wantIn;
        } else if (props.chest && Math.hypot(p.pos.x - (IN.x + 8.6), p.pos.z - (IN.z - 8)) < 1.7) {
          H.hud(i, `🎁 Arkku · ${key} = ${props.chest.open ? 'sulje' : 'avaa'}`, 'hatch');
          if (wantIn && !holdI[i]) toggleChest(p);
          holdI[i] = wantIn;
        } else if (props.puzzle && Math.hypot(p.pos.x - (IN.x + 9.3), p.pos.z - (IN.z - 13.5)) < 2.4) {
          H.hud(i, props.puzzle.solved ? '✅ Palapeli ratkesi!' : `🎚️ Vipupalapeli · ${key} = käännä vipua`, 'hatch');
          if (wantIn && !holdI[i] && !props.puzzle.solved) pullPuzzle(p);
          holdI[i] = wantIn;
        } else if (props.alcove && props.alcove.open && Math.hypot(p.pos.x - (IN.x + 13.3), p.pos.z - (IN.z - 11)) < 1.6) {
          H.hud(i, `💎 ${key} = ota kätkö`, 'hatch');
          if (wantIn && !holdI[i]) takeAlcove(p);
          holdI[i] = wantIn;
        } else {
          H.hud(i, '🕯️ Maanalainen käytävä · lyhdyt välkkyvät lämpimästi', 'hatch');
          holdI[i] = false;
        }
        continue;
      }
      // vipu / luukku autotallissa
      // oma reunalaukaisu: jos E on jo pohjassa kun saavutaan, silti laukeaa
      const want = !!(H.input(i) && H.input(i).interact);
      const nearH = levers.find(v => v.open && Math.hypot(p.pos.x - v.hp.x, p.pos.z - v.hp.z) < 1.4 && p.pos.y < 2.2);
      if (nearH) {
        H.hud(i, `🪜 ${key} = laskeudu maan alle`, 'hatch');
        if (want && !holdI[i]) enter(p, nearH.homeI);
        holdI[i] = want;
        continue;
      }
      const nearL = levers.find(v => Math.hypot(p.pos.x - v.lp.x, p.pos.z - v.lp.z) < 1.6 && p.pos.y < 2.5);
      if (nearL) {
        H.hud(i, nearL.open ? `🕯️ ${key} = sulje vipu` : `${key} = vedä vipua`, 'hatch');
        if (want && !holdI[i]) pull(i, nearL.homeI);
        holdI[i] = want;
        continue;
      }
      holdI[i] = false;
      H.hud(i, '', 'hatch');
    }
  });

  H.hatch = {
    IN, R: IN.R,
    levers: () => levers.map(v => ({ homeI: v.homeI, open: v.open, lp: v.lp, hp: v.hp })),
    pull, enter, leave, inside: (i) => !!inside[i],
    takeTreasure, openTreasure,
    pullBook, toggleChest, pullPuzzle, takeAlcove, readMap,
    props: () => props,
    spots: () => ({
      book: { x: IN.x - 10, z: IN.z - 3.35 },
      chest: { x: IN.x + 8.6, z: IN.z - 8 },
      map: { x: IN.x + 8.5, z: IN.z - 5.2 },
      puzzle: { x: IN.x + 9.3, z: IN.z - 13.5 },
      statue: { x: IN.x + 11.2, z: IN.z - 11 },
      alcove: { x: IN.x + 13.3, z: IN.z - 11 },
    }),
    exitTo, leave,
    leverPos: (homeI) => { const v = levers.find(x => x.homeI === homeI); return v ? { ...v.lp } : null; },
    hatchPos: (homeI) => { const v = levers.find(x => x.homeI === homeI); return v ? { ...v.hp } : null; },
    isOpen: (homeI) => !!(levers.find(x => x.homeI === homeI)?.open),
  };
  H.define?.('hatch', H.hatch);
})();
