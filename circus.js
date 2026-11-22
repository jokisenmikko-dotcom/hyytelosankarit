// circus.js – 3.0: sirkusteltta (sisätila isompi), trapetsi, nuoralla kävelijät, yleisö,
// klovnit, jonglööri, kanuuna+verkko, trampoliini, eläinesitys, valot, rumpuvisual.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.6, metalness: o.m ?? 0,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1, side: o.side ?? 0,
  });
  // ulkona teltta
  const OUT = { x: 120, z: -40 };
  // sisätila kaukana (isompi)
  const IN = { x: 620, z: 0, R: 28 };

  let active = false, inside = [], rootOut = null, rootIn = null;
  let acts = { trapeze: [], rope: [], clowns: [], juggler: null, animals: [], spots: [], drums: null };
  let cannon = null, tramp = null, net = null, stall = null;
  let snackCd = Array(12).fill(-999);

  function stripedTent(R, Hgt, stripes) {
    const g = new (T().Group)();
    const segs = 24;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
      const col = stripes[i % stripes.length];
      const shape = new (T().Shape)();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, R, a0, a1, false);
      // approx panel as box bent via rotation
      const panel = new (T().Mesh)(new (T().BoxGeometry)((R * 2 * Math.PI) / segs * 1.05, Hgt, 0.12), M(col, { r: 0.9 }));
      const mid = (a0 + a1) / 2;
      panel.position.set(Math.sin(mid) * R, Hgt / 2, Math.cos(mid) * R);
      panel.rotation.y = mid;
      g.add(panel);
    }
    // katto-kartio
    const cone = new (T().Mesh)(new (T().ConeGeometry)(R * 1.05, Hgt * 0.7, segs), M(0xe03131, { r: 0.85 }));
    cone.position.y = Hgt + Hgt * 0.35; g.add(cone);
    const cone2 = new (T().Mesh)(new (T().ConeGeometry)(R * 0.55, Hgt * 0.35, segs), M(0xfff3bf));
    cone2.position.y = Hgt + Hgt * 0.7 + 0.2; g.add(cone2);
    const pole = new (T().Mesh)(new (T().CylinderGeometry)(0.12, 0.12, Hgt * 1.9, 8), M(0xf8f9fa));
    pole.position.y = Hgt * 0.95; g.add(pole);
    const flag = new (T().Mesh)(new (T().BoxGeometry)(0.6, 0.35, 0.04), M(0xfcc419));
    flag.position.set(0.35, Hgt * 1.9, 0); g.add(flag);
    return g;
  }

  function makePerson(col, scale = 1) {
    const g = new (T().Group)();
    const body = new (T().Mesh)(new (T().CapsuleGeometry)(0.22 * scale, 0.4 * scale, 4, 8), M(col));
    body.position.y = 0.55 * scale; g.add(body);
    const head = new (T().Mesh)(new (T().SphereGeometry)(0.2 * scale, 10, 8), M(0xffe0c2));
    head.position.y = 1.05 * scale; g.add(head);
    return g;
  }

  function buildExterior() {
    rootOut = new (T().Group)();
    const tent = stripedTent(7, 5.5, [0xe03131, 0xfff3bf]);
    rootOut.add(tent);
    // oviaukko merkki
    const door = new (T().Mesh)(new (T().BoxGeometry)(2.4, 3.2, 0.2), M(0x212529));
    door.position.set(0, 1.6, 7.05); rootOut.add(door);
    const lbl = H.makeLabel('🎪 Sirkus – sisään', { scale: 4.5, bg: '#c92a2a' });
    lbl.position.set(0, 6.8, 0); rootOut.add(lbl);
    H.addObject(rootOut, OUT.x, 0, OUT.z);
    H.obstacle(OUT.x, OUT.z, 6.5, 2);
    // jätä oviaukko vapaaksi – pehmeä trigger
  }

  function buildInterior() {
    rootIn = new (T().Group)();
    const R = IN.R, Hgt = 14;
    // lattia
    const floor = new (T().Mesh)(new (T().CircleGeometry)(R, 48), M(0x8f5420, { r: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; rootIn.add(floor);
    // sahanpururengas
    // vendor-buildista puuttuu RingGeometry – torus käy sahanpururenkaaksi
    const ring = new (T().Mesh)(new (T().TorusGeometry)(9.5, 1.5, 8, 48), M(0xe8590c, { r: 1 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; rootIn.add(ring);
    // teltan seinät (korkeat)
    const walls = stripedTent(R, Hgt, [0xe03131, 0xfff3bf, 0x1c7ed6]);
    rootIn.add(walls);
    // katsomo
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 28; k++) {
        const a = (k / 28) * Math.PI * 1.5 - Math.PI * 0.75;
        const rr = 14 + row * 2.2;
        const seat = new (T().Mesh)(new (T().BoxGeometry)(1.1, 0.35, 0.7), M(0x1c7ed6));
        seat.position.set(Math.sin(a) * rr, 0.4 + row * 0.55, Math.cos(a) * rr);
        seat.rotation.y = a; rootIn.add(seat);
        if (k % 2 === row % 2) {
          const aud = makePerson([0xff8787, 0x74c0fc, 0xffd43b, 0xda77f2][(k + row) % 4], 0.85);
          aud.position.copy(seat.position); aud.position.y += 0.55;
          aud.rotation.y = a + Math.PI; rootIn.add(aud);
        }
      }
    }
    // trapetsi
    const barY = 9;
    [-8, 8].forEach((x) => {
      const pole = new (T().Mesh)(new (T().CylinderGeometry)(0.12, 0.12, barY + 1, 8), M(0x868e96, { m: 0.5 }));
      pole.position.set(x, (barY + 1) / 2, 0); rootIn.add(pole);
    });
    const bar = new (T().Mesh)(new (T().CylinderGeometry)(0.06, 0.06, 16, 8), M(0xfcc419, { m: 0.6 }));
    bar.rotation.z = Math.PI / 2; bar.position.set(0, barY, 0); rootIn.add(bar);
    for (let k = 0; k < 2; k++) {
      const swing = new (T().Group)();
      const ropeL = new (T().Mesh)(new (T().CylinderGeometry)(0.02, 0.02, 3.2, 4), M(0x212529));
      ropeL.position.set(-0.4, -1.6, 0); swing.add(ropeL);
      const ropeR = ropeL.clone(); ropeR.position.x = 0.4; swing.add(ropeR);
      const grip = new (T().Mesh)(new (T().CylinderGeometry)(0.04, 0.04, 0.9, 6), M(0x8f5420));
      grip.rotation.z = Math.PI / 2; grip.position.y = -3.2; swing.add(grip);
      const perf = makePerson(0xe03131); perf.position.y = -3.9; swing.add(perf);
      swing.position.set(k ? 3 : -3, barY, 0);
      rootIn.add(swing);
      acts.trapeze.push({ g: swing, phase: k * Math.PI, amp: 0.7 });
    }
    // pitkä nuora
    const ropeY = 5.5;
    const tight = new (T().Mesh)(new (T().CylinderGeometry)(0.04, 0.04, 36, 6), M(0xfff3bf));
    tight.rotation.z = Math.PI / 2; tight.position.set(0, ropeY, -6); rootIn.add(tight);
    [-18, 18].forEach((x) => {
      const p = new (T().Mesh)(new (T().CylinderGeometry)(0.15, 0.2, ropeY + 0.5, 8), M(0x495057));
      p.position.set(x, (ropeY + 0.5) / 2, -6); rootIn.add(p);
    });
    for (let k = 0; k < 3; k++) {
      const walker = makePerson(0xbe4bdb);
      walker.position.set(-12 + k * 8, ropeY + 0.9, -6);
      rootIn.add(walker);
      acts.rope.push({ g: walker, t: k * 2.2, dir: 1, x0: -14, x1: 14 });
    }
    // klovnit
    for (let k = 0; k < 3; k++) {
      const c = makePerson([0xff6b6b, 0x4dabf7, 0x69db7c][k]);
      // nenä
      const nose = new (T().Mesh)(new (T().SphereGeometry)(0.1, 8, 6), M(0xe03131));
      nose.position.set(0, 1.05, 0.22); c.add(nose);
      const hat = new (T().Mesh)(new (T().ConeGeometry)(0.25, 0.5, 10), M(0xfcc419));
      hat.position.y = 1.45; c.add(hat);
      c.position.set(-4 + k * 3, 0, 5); rootIn.add(c);
      acts.clowns.push({ g: c, phase: k });
    }
    // jonglööri
    {
      const j = makePerson(0x7950f2);
      j.position.set(5, 0, 3); rootIn.add(j);
      const balls = [];
      for (let k = 0; k < 3; k++) {
        const b = new (T().Mesh)(new (T().SphereGeometry)(0.12, 10, 8), M([0xe03131, 0xfcc419, 0x1c7ed6][k]));
        rootIn.add(b); balls.push(b);
      }
      acts.juggler = { g: j, balls, t: 0 };
    }
    // eläimet (ystävällisiä)
    const animalDefs = [
      { name: '🐘', col: 0x868e96, s: 1.6 },
      { name: '🦁', col: 0xf08c00, s: 1.2 },
      { name: '🐎', col: 0x8f5420, s: 1.3 },
    ];
    animalDefs.forEach((a, k) => {
      const g = new (T().Group)();
      const body = new (T().Mesh)(new (T().CapsuleGeometry)(0.4 * a.s, 0.7 * a.s, 4, 8), M(a.col));
      body.position.y = 0.7 * a.s; body.rotation.z = Math.PI / 2; g.add(body);
      const head = new (T().Mesh)(new (T().SphereGeometry)(0.35 * a.s, 10, 8), M(a.col));
      head.position.set(0.7 * a.s, 0.9 * a.s, 0); g.add(head);
      const lbl = H.makeLabel(a.name, { scale: 2.4, size: 64 }); lbl.position.y = 2.2 * a.s; g.add(lbl);
      g.position.set(-10 + k * 5, 0, -2); rootIn.add(g);
      acts.animals.push({ g, phase: k * 1.7 });
    });
    // trampoliini
    tramp = new (T().Group)();
    const mat = new (T().Mesh)(new (T().CylinderGeometry)(2.2, 2.2, 0.12, 24), M(0x1c7ed6, { e: 0x1c7ed6, ei: 0.15 }));
    mat.position.y = 0.35; tramp.add(mat);
    const rim = new (T().Mesh)(new (T().TorusGeometry)(2.2, 0.1, 8, 24), M(0xfcc419));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.4; tramp.add(rim);
    tramp.position.set(-8, 0, 8); rootIn.add(tramp);
    // kanuuna
    cannon = new (T().Group)();
    const base = new (T().Mesh)(new (T().BoxGeometry)(1.6, 0.6, 1.2), M(0x343a40));
    base.position.y = 0.3; cannon.add(base);
    const barrel = new (T().Mesh)(new (T().CylinderGeometry)(0.35, 0.45, 2.4, 12), M(0x212529, { m: 0.4 }));
    barrel.rotation.z = -0.55; barrel.position.set(0.9, 1.0, 0); cannon.add(barrel);
    cannon.position.set(10, 0, 6); cannon.rotation.y = -0.8; rootIn.add(cannon);
    // verkko
    net = new (T().Group)();
    const netM = new (T().Mesh)(new (T().PlaneGeometry)(8, 5), M(0x40c057, { op: 0.45, r: 1, side: 2 }));
    netM.rotation.x = -0.4; netM.position.y = 1.5; net.add(netM);
    for (let i = -3; i <= 3; i++) {
      const p = new (T().Mesh)(new (T().CylinderGeometry)(0.08, 0.08, 3, 6), M(0x868e96));
      p.position.set(i * 1.2, 1.5, 0); net.add(p);
    }
    net.position.set(-6, 0, 14); rootIn.add(net);
    // valonheittimet: vendor-buildissa ei ole SpotLightia – 2 pistettä, ei varjoja
    const nSpots0 = (H.gfx === 'matala' || H.gfx === 'mobiili') ? 0 : H.gfx === 'korkea' ? 1 : 2;
    for (let k = 0; k < nSpots0; k++) {
      const a = (k / Math.max(1, nSpots0)) * Math.PI * 2;
      const spot = new (T().PointLight)(0xfff3bf, 1.5, 32, 2);
      spot.castShadow = false;
      spot.position.set(Math.sin(a) * 12, 8, Math.cos(a) * 12);
      rootIn.add(spot);
      acts.spots.push(spot);
    }
    // rumpuvisual (ei ääntä) – aaltoilevat renkaat
    acts.drums = new (T().Group)();
    for (let k = 0; k < 3; k++) {
      const r = new (T().Mesh)(new (T().TorusGeometry)(1.5 + k * 0.7, 0.05, 6, 32), M(0xfcc419, { e: 0xfcc419, ei: 0.6, op: 0.7 }));
      r.rotation.x = Math.PI / 2; r.position.y = 0.2; acts.drums.add(r);
    }
    acts.drums.position.set(0, 0.1, 0); rootIn.add(acts.drums);
    // uloskäynti
    const exit = new (T().Mesh)(new (T().BoxGeometry)(3, 3.5, 0.3), M(0x212529));
    exit.position.set(0, 1.75, R - 0.2); rootIn.add(exit);
    const exitLbl = H.makeLabel('🚪 Ulos sirkuksesta', { scale: 3.5, bg: '#343a40' });
    exitLbl.position.set(0, 4.2, R - 0.5); rootIn.add(exitLbl);

    try { decorateTent(R); } catch (e) { console.warn('circus decorate', e); }

    H.addObject(rootIn, IN.x, 0, IN.z);
    // 3.3: sisätila ja valonheittimet pois kun kukaan ei ole teltassa
    rootIn.visible = false;
    (acts.spots || []).forEach((s) => { s.visible = false; s.castShadow = false; s.intensity = 0; });
  }

  function enter(p) {
    inside[p.index] = true;
    // sirkus on Maan sisätila — nollaa planeetta-/kuutila jos jostain syystä vielä päällä
    p.moon = false; p._bodyId = null; p.rocket = false; p.lock = false;
    p.pos.set(IN.x, 0.1, IN.z + 6); // lähemmäs keskustaa, ei exit-seinää vasten
    p.vx = p.vz = 0; p.vy = 0; p.grounded = true; p.air = 'none';
    if (rootIn) {
      rootIn.visible = true;
      const nSpots = (H.gfx === 'matala' || H.gfx === 'mobiili') ? 1 : H.gfx === 'korkea' ? 2 : 4;
      (acts.spots || []).forEach((s, k) => {
        const on = k < nSpots;
        s.visible = on; s.castShadow = false; s.intensity = on ? 2.2 : 0;
      });
    }
    H.toast(p.index, '🎪 Tervetuloa sirkukseen! (sisätila on isompi)');
    H.beep(523, 0.1, 'triangle', 0.05);
  }
  function leave(p) {
    inside[p.index] = false;
    // 3.4: juuri oven eteen (teltta R=7, ovi z=7.05), kamera ei jää sisätilaan
    p.pos.set(OUT.x, 0.1, OUT.z + 8.4);
    p.yaw = 0;
    p.vx = p.vz = p.vy = 0; p.speed = 0;
    p.camS = null; p.moon = false; p._bodyId = null;
    H.toast(p.index, 'Poistuit sirkuksesta');
  }

  function fireCannon(p) {
    // ammu pelaaja verkkoon
    p.pos.set(cannon.position.x + IN.x + 1, 2.5, cannon.position.z + IN.z);
    p.vy = 14; p.vx = -8; p.vz = 6;
    H.toast(p.index, '💥 Kanuuna! Lentorata verkkoon!');
    H.beep(120, 0.25, 'sawtooth', 0.08);
  }

  H.onStart(() => {
    active = !H.challenge; inside = []; stall = null; snackCd = Array(12).fill(-999);
    acts = { trapeze: [], rope: [], clowns: [], juggler: null, animals: [], spots: [], drums: null };
    if (!active) return;
    buildExterior();
    buildInterior();
  });
  H.onStop(() => { active = false; inside = []; rootOut = rootIn = null; });

  function anyoneInside() {
    const ps = H.players || [];
    for (let k = 0; k < ps.length; k++) { if (ps[k] && inside[ps[k].index]) return true; }
    return false;
  }
  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    const t = H.time;
    const live = anyoneInside();
    if (rootIn && rootIn.visible !== live) {
      rootIn.visible = live;
      const nSpots = (H.gfx === 'matala' || H.gfx === 'mobiili') ? 1 : H.gfx === 'korkea' ? 2 : 4;
      (acts.spots || []).forEach((s, k) => {
        const on = live && k < nSpots;
        s.visible = on; s.castShadow = false; s.intensity = on ? 2.2 : 0;
      });
    }
    if (live) {
    // animaatiot
    acts.trapeze.forEach((tr) => {
      tr.g.rotation.z = Math.sin(t * 1.4 + tr.phase) * tr.amp;
    });
    acts.rope.forEach((w) => {
      w.t += dt * w.dir * 1.1;
      let x = w.x0 + ((Math.sin(w.t) * 0.5 + 0.5) * (w.x1 - w.x0));
      w.g.position.x = x;
      w.g.position.y = 5.5 + 0.9 + Math.abs(Math.sin(t * 6)) * 0.05;
      w.g.rotation.y = w.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    });
    acts.clowns.forEach((c, k) => {
      c.g.position.x = -4 + k * 3 + Math.sin(t * 2 + c.phase) * 1.5;
      c.g.position.z = 5 + Math.cos(t * 1.5 + c.phase) * 1.2;
      c.g.rotation.y = t * 2 + c.phase;
      c.g.position.y = Math.abs(Math.sin(t * 5 + c.phase)) * 0.35;
    });
    if (acts.juggler) {
      acts.juggler.t += dt;
      acts.juggler.g.rotation.y = Math.sin(t) * 0.3;
      acts.juggler.balls.forEach((b, k) => {
        const ph = acts.juggler.t * 3 + k * 2.1;
        b.position.set(5 + Math.sin(ph) * 0.6, 1.4 + Math.abs(Math.sin(ph)) * 1.8, 3 + Math.cos(ph) * 0.3);
      });
    }
    acts.animals.forEach((a) => {
      a.g.position.x += Math.sin(t * 0.7 + a.phase) * 0.01;
      a.g.rotation.y = Math.sin(t * 0.5 + a.phase) * 0.4;
    });
    if (acts.drums) {
      acts.drums.children.forEach((r, k) => {
        const s = 1 + Math.sin(t * 8 + k) * 0.08;
        r.scale.set(s, s, s);
        r.material.opacity = 0.35 + Math.sin(t * 8 + k) * 0.25;
      });
    }
    acts.spots.forEach((s, k) => {
      if (!s.visible) return;
      s.intensity = 1.3 + Math.sin(t * 3 + k) * 0.25;
    });
    }

    for (const p of H.players) {
      if (p.car != null || p.rocket) continue;
      const i = p.index, key = H.KEYS('interact')[i];
      if (inside[i]) {
        // trampoliini
        if (tramp && Math.hypot(p.pos.x - (IN.x + tramp.position.x), p.pos.z - (IN.z + tramp.position.z)) < 2.4) {
          if (p.pos.y < 0.6 && (p.vy || 0) <= 0) { p.vy = 11; H.beep(440, 0.05, 'triangle', 0.03); }
          H.hud(i, '🤸 Trampoliini!', 'circus');
        }
        // kanuuna
        else if (cannon && Math.hypot(p.pos.x - (IN.x + cannon.position.x), p.pos.z - (IN.z + cannon.position.z)) < 2.2) {
          H.hud(i, `💥 Kanuuna · ${key} = ammu verkkoon`, 'circus');
          if (H.pressed(i, 'interact')) fireCannon(p);
        }
        // popcorn / karkki
        else if (stall && Math.hypot(p.pos.x - (IN.x + stall.position.x), p.pos.z - (IN.z + stall.position.z)) < 2.6) {
          H.hud(i, `🍿 Popcorn ja karkki · ${key} = osta herkku`, 'circus');
          if (H.pressed(i, 'interact')) buySnack(p);
        }
        // jonglöörin pallot (kokeile)
        else if (acts.juggler && Math.hypot(p.pos.x - (IN.x + 5), p.pos.z - (IN.z + 3)) < 2.2) {
          H.hud(i, '🤹 Jonglööri harjoittelee – katso palloja!', 'circus');
        }
        // ulos
        else if (Math.hypot(p.pos.x - IN.x, p.pos.z - (IN.z + IN.R - 1)) < 3.5) {
          H.hud(i, `🚪 ${key} = poistu sirkuksesta`, 'circus');
          if (H.pressed(i, 'interact')) leave(p);
        } else {
          H.hud(i, '🎪 Sirkus · trapetsi · nuora · klovnit · kanuuna · trampoliini · popcorn', 'circus');
        }
        // pidä pelaaja sisäalueella
        const dx = p.pos.x - IN.x, dz = p.pos.z - IN.z;
        if (Math.hypot(dx, dz) > IN.R - 1) {
          const a = Math.atan2(dx, dz);
          p.pos.x = IN.x + Math.sin(a) * (IN.R - 1.2);
          p.pos.z = IN.z + Math.cos(a) * (IN.R - 1.2);
        }
      } else {
        if (Math.hypot(p.pos.x - OUT.x, p.pos.z - (OUT.z + 7)) < 2.8 && p.pos.y < 2.5) {
          H.hud(i, `🎪 Sirkus · ${key} = sisään (isompi sisältä!)`, 'circus');
          if (H.pressed(i, 'interact')) enter(p);
        } else H.hud(i, '', 'circus');
      }
    }
  });


  function decorateTent(R) {
    const cols = [0xe03131, 0xfcc419, 0x1c7ed6, 0x2f9e44, 0xf76707, 0xcc5de8];
    // koju ensin, jotta API toimii vaikka koristeet kaatuisivat
    stall = new (T().Group)();
    const desk = new (T().Mesh)(new (T().BoxGeometry)(3.2, 1.1, 1.4), M(0xe8590c));
    desk.position.y = 0.55; stall.add(desk);
    const roof = new (T().Mesh)(new (T().BoxGeometry)(3.4, 0.12, 1.8), M(0xe03131, { e: 0xe03131, ei: 0.15 }));
    roof.position.y = 2.15; stall.add(roof);
    try {
      const slab0 = H.makeLabel('🍿 Popcorn ja karkki', { scale: 2.4, bg: '#c92a2a' });
      slab0.position.set(0, 2.55, 0); stall.add(slab0);
    } catch (e) {}
    stall.position.set(-16, 0, 10); rootIn.add(stall);

    // viirit teltan ympäri (ei lisävaloja)
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      const flag = new (T().Mesh)(new (T().BoxGeometry)(0.7, 0.4, 0.04), M(cols[k % cols.length], { r: 0.9 }));
      flag.position.set(Math.sin(a) * (R - 1.2), 9.2, Math.cos(a) * (R - 1.2));
      flag.rotation.y = a;
      rootIn.add(flag);
    }
    // valoketju (emissiiviset pallot, ei PointLight)
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const bulb = new (T().Mesh)(new (T().SphereGeometry)(0.12, 6, 6), M(cols[k % cols.length], { e: cols[k % cols.length], ei: 0.85, r: 1 }));
      bulb.position.set(Math.sin(a) * 16, 7.4, Math.cos(a) * 16);
      bulb.castShadow = false; rootIn.add(bulb);
    }
    // lisäkatsomo kehän laidalle
    for (let row = 0; row < 2; row++) {
      for (let k = 0; k < 10; k++) {
        const a = -0.9 + (k / 9) * 1.8;
        const rad = 16 + row * 1.4;
        const seat = new (T().Mesh)(new (T().BoxGeometry)(1.2, 0.35, 0.7), M(row ? 0xe03131 : 0xfcc419));
        seat.position.set(Math.sin(a) * rad, 0.4 + row * 0.55, Math.cos(a) * rad);
        seat.rotation.y = a; rootIn.add(seat);
      }
    }
    // koju on jo lisätty; viimeistele pylväät ja herkut
    const poleL = new (T().Mesh)(new (T().CylinderGeometry)(0.07, 0.07, 2.1, 6), M(0xf8f9fa));
    poleL.position.set(-1.5, 1.15, 0.6); stall.add(poleL);
    const poleR = poleL.clone(); poleR.position.x = 1.5; stall.add(poleR);
    for (let k = 0; k < 4; k++) {
      const box = new (T().Mesh)(new (T().BoxGeometry)(0.28, 0.35, 0.28), M(k % 2 ? 0xffffff : 0xe03131));
      box.position.set(-0.9 + k * 0.55, 1.28, 0.15); stall.add(box);
    }
    const candy = new (T().Mesh)(new (T().SphereGeometry)(0.16, 8, 6), M(0xcc5de8, { e: 0xcc5de8, ei: 0.3 }));
    candy.position.set(0.9, 1.35, 0.2); stall.add(candy);

    // ystävälliset eläinkoristeet (norsu + hylje), eivät kävele
    const elephant = new (T().Group)();
    const body = new (T().Mesh)(new (T().SphereGeometry)(1.1, 10, 8), M(0xadb5bd));
    body.scale.set(1.3, 0.9, 0.9); body.position.y = 1.15; elephant.add(body);
    const head = new (T().Mesh)(new (T().SphereGeometry)(0.55, 8, 8), M(0xadb5bd));
    head.position.set(1.2, 1.35, 0); elephant.add(head);
    const trunk = new (T().Mesh)(new (T().CylinderGeometry)(0.12, 0.18, 1.1, 6), M(0x868e96));
    trunk.position.set(1.7, 0.85, 0); trunk.rotation.z = 0.6; elephant.add(trunk);
    const ear = new (T().Mesh)(new (T().SphereGeometry)(0.35, 6, 6), M(0x868e96));
    ear.scale.set(0.3, 1, 0.8); ear.position.set(1.15, 1.45, 0.5); elephant.add(ear);
    elephant.position.set(14, 0, -8); elephant.rotation.y = -0.8; rootIn.add(elephant);
    const elab = H.makeLabel('🐘 Norsu Elli', { scale: 2.0, bg: '#495057' });
    elab.position.set(14, 2.8, -8); rootIn.add(elab);

    const seal = new (T().Group)();
    const sb = new (T().Mesh)(new (T().SphereGeometry)(0.55, 8, 7), M(0x495057));
    sb.scale.set(1.5, 0.7, 0.8); sb.position.y = 0.45; seal.add(sb);
    const sh = new (T().Mesh)(new (T().SphereGeometry)(0.28, 8, 7), M(0x343a40));
    sh.position.set(0.7, 0.55, 0); seal.add(sh);
    seal.position.set(16, 0, -4); rootIn.add(seal);
    const slab2 = H.makeLabel('🦭 Hylje Hilla', { scale: 1.8, bg: '#343a40' });
    slab2.position.set(16, 1.8, -4); rootIn.add(slab2);

    // julisteita pylväissä
    for (const [x, z, col, txt] of [[-12, -16, 0x1c7ed6, '🤹 Jonglööri'], [12, -16, 0xe8590c, '🤡 Klovni']]) {
      const post = new (T().Mesh)(new (T().BoxGeometry)(0.12, 2.6, 0.12), M(0x5c4033));
      post.position.set(x, 1.3, z); rootIn.add(post);
      const sign = new (T().Mesh)(new (T().BoxGeometry)(1.6, 1.0, 0.08), M(col, { e: col, ei: 0.15 }));
      sign.position.set(x, 2.2, z + 0.08); rootIn.add(sign);
      const lab = H.makeLabel(txt, { scale: 1.8, bg: '#212529' });
      lab.position.set(x, 2.2, z + 0.2); rootIn.add(lab);
    }
  }

  function buySnack(p) {
    const i = p.index;
    const t = H.time || 0;
    if (t < (snackCd[i] || 0) + 8) { H.toast(i, 'Nami vielä maistuu!', true); return false; }
    snackCd[i] = t;
    try { H.hunger?.feed?.(i, 8); } catch (e) {}
    H.toast(i, '🍿 Nam! Popcorn ja hapankarkki!');
    H.beep(784, 0.08, 'triangle', 0.04);
    return true;
  }

  // OOB-poikkeus: sisätilassa (IN) liikkuminen sallittu vaikka x=620 > earthLimit

  H.circusOut = (x, z) => {
    const d = Math.hypot(x - IN.x, z - IN.z);
    if (d <= IN.R + 6) return d > IN.R; // sisällä = ei OOB; kehän ulkopuolella = OOB
    return null;
  };

  H.circus = {
    OUT, IN,
    inside: i => !!inside[i],
    enter, leave,
    buySnack,
    stall: () => stall ? { x: IN.x + stall.position.x, z: IN.z + stall.position.z } : null,
  };
})();
