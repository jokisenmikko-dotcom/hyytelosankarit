// jobs.js – töitä rahaa vastaan (Vapaa leikki): Pizzalähetti ja Ilmapallojahti.
(function () {
  const H = window.HYYTE;
  const PIZZERIA = { x: 40, z: -64 }, PIZZA_PAD = { x: 40, z: -58 };
  const HOUSES = [
    { x: -95, z: -70, c: 0x74c0fc }, { x: -112, z: 22, c: 0xffa94d }, { x: -70, z: 72, c: 0xb197fc },
    { x: 95, z: -95, c: 0x8ce99a }, { x: 112, z: 30, c: 0xfcc2d7 }, { x: 62, z: -122, c: 0xffe066 },
  ];
  const BALLOON_STAND = { x: -85, z: -42 }, FIELD = { x: -85, z: -18, r: 20 };
  const HUNT_TIME = 45, BALLOONS = 14;
  const PCOL = [0xff5a36, 0x3aa0ff];
  const KEY = H.KEYS('interact');
  let active = false, jobs = [], houses = [], balloons = [], hunt = null, standLabel = null;
  const T = () => H.THREE;

  // ---------- rakennukset ----------
  function box(w, h, d, c) { const m = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), new (T().MeshStandardMaterial)({ color: c, roughness: 0.8 })); m.castShadow = m.receiveShadow = true; return m; }
  function roof(w, d, h, c) { const m = new (T().Mesh)(new (T().ConeGeometry)(Math.hypot(w, d) / 2, h, 4), new (T().MeshStandardMaterial)({ color: c, roughness: 0.7 })); m.rotation.y = Math.PI / 4; m.castShadow = true; return m; }
  function pad(r, c) { const m = new (T().Mesh)(new (T().CylinderGeometry)(r, r, 0.12, 28), new (T().MeshStandardMaterial)({ color: c, emissive: c, emissiveIntensity: 0.45, roughness: 0.5 })); m.receiveShadow = true; return m; }

  function buildPizzeria() {
    const g = new (T().Group)();
    const b = box(9, 5, 7, 0xfff3e0); b.position.y = 2.5; g.add(b);
    const r = roof(9, 7, 2.6, 0xd9480f); r.position.y = 6.3; g.add(r);
    const door = box(1.8, 3, 0.2, 0x8d5524); door.position.set(0, 1.5, 3.55); g.add(door);
    const awn = box(9.4, 0.3, 1.6, 0x2f9e44); awn.position.set(0, 3.6, 4.1); g.add(awn);
    const sign = H.makeLabel('🍕 PIZZERIA', { bg: '#d9480f', scale: 7 }); sign.position.set(0, 8.6, 0); g.add(sign);
    H.addObject(g, PIZZERIA.x, 0, PIZZERIA.z);
    H.addObstacle(PIZZERIA.x, PIZZERIA.z, 4.8);
    const p = pad(1.8, 0xff922b); H.addObject(p, PIZZA_PAD.x, 0.06, PIZZA_PAD.z);
    const l = H.makeLabel('Hae pizza tästä!', { scale: 4, size: 54 }); H.addObject(l, PIZZA_PAD.x, 2.6, PIZZA_PAD.z);
  }
  function buildHouses() {
    houses = HOUSES.map((h, k) => {
      const g = new (T().Group)();
      const b = box(6, 4, 6, h.c); b.position.y = 2; g.add(b);
      const r = roof(6, 6, 2.6, 0x9c3d26); r.position.y = 5.3; g.add(r);
      const ang = Math.atan2(-h.x, -h.z);            // ovi kohti kartan keskustaa
      g.rotation.y = ang;
      const door = box(1.4, 2.4, 0.2, 0x5c3a1e); door.position.set(0, 1.2, 3.05); g.add(door);
      const num = H.makeLabel('Talo ' + (k + 1), { scale: 3.4, size: 60 }); num.position.set(0, 7.6, 0); g.add(num);
      H.addObject(g, h.x, 0, h.z);
      H.addObstacle(h.x, h.z, 4.1);
      const dx = Math.sin(ang), dz = Math.cos(ang);
      return { x: h.x, z: h.z, door: { x: h.x + dx * 5.2, z: h.z + dz * 5.2 }, n: k + 1 };
    });
  }

  // ---------- pizzalähetti ----------
  /** Juomarahakäyrä: nopea toimitus = iso tippi, hidas = ei tippiä tai pieni vähennys. Palkka ei koskaan alle 5. */
  function pizzaPay(time, total, pi) {
    const frac = Math.max(0, Math.min(1, time / total));
    let tip = frac >= 0.25 ? Math.round(25 * Math.pow((frac - 0.25) / 0.75, 1.4)) : frac < 0.1 ? -4 : 0;
    const luck = (pi != null && window.HYYTE?.v22?.luckMul?.(pi)) || 1;
    if (luck > 1 && tip > 0) tip = Math.round(tip * luck);
    return { pay: Math.max(5, Math.round((10 + tip) * (luck > 1 && tip <= 0 ? 1 : 1))), tip, frac };
  }
  function newJob(p) {
    const j = jobs[p.index];
    let choices = houses.filter(h => h !== j.lastHouse);
    const h = choices[(Math.random() * choices.length) | 0];
    const dist = Math.hypot(h.door.x - PIZZA_PAD.x, h.door.z - PIZZA_PAD.z);
    Object.assign(j, { state: 'carry', house: h, total: Math.round(20 + dist / 5), lastHouse: h, late: false });
    j.time = j.total;
    j.box.visible = true;
    j.beam.position.set(h.door.x, 0, h.door.z); j.beam.visible = true;
    H.toast(p.index, `Vie pizza taloon ${h.n}! 🍕`);
    H.beep(660, 0.12, 'triangle', 0.06);
  }
  function endJob(p, ok) {
    const j = jobs[p.index];
    j.state = 'idle'; j.box.visible = false; j.beam.visible = false; j.needLeave = true;
    if (ok && j.late) {
      // 1.8: myöhässä mutta perillä – pieni palkka, ei koskaan tyhjin käsin
      j.late = false; j.done++; j.lastTip = -7;
      H.money.add(p.index, 3, 'Kylmä pizza perillä… +3 🪙 (nopeammin ensi kerralla!)'); H.emit?.('job', p.index, 'pizza', 3);
      H.beep(660, 0.1, 'triangle', 0.05);
    } else if (ok) {
      const { pay, tip, frac } = pizzaPay(j.time, j.total, p.index);
      j.done++; j.lastTip = tip;
      const msg = tip > 0 ? `Pizza perillä! ${frac > 0.6 ? 'Salamannopea! ⚡ ' : ''}Juomaraha +${tip} 🪙`
        : tip < 0 ? `Pizza perillä, mutta myöhässä… ${tip} 🪙 (yht. +${pay})` : `Pizza perillä! Ei juomarahaa – nopeammin ensi kerralla!`;
      H.money.add(p.index, pay, msg); H.emit?.('job', p.index, 'pizza', pay);
      H.beep(880, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(1175, 0.15, 'triangle', 0.06), 110);
    } else {
      j.late = false; H.emit?.('jobfail', p.index, 'pizza');
      H.toast(p.index, 'Voi ei, pizza jäähtyi! Hae uusi pizzeriasta.', true);
      H.beep(220, 0.3, 'sawtooth', 0.04);
    }
  }
  function arrowTo(p, x, z) {
    const q = H.posOf(p), v = H.game.dirVectors(p.yaw);
    const dx = x - q.x, dz = z - q.z;
    const a = Math.atan2(dx * v.rx + dz * v.rz, dx * v.fx + dz * v.fz);
    return ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'][((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
  }
  function updateJobs(dt) {
    for (const p of H.players) {
      const j = jobs[p.index], q = H.posOf(p);
      const onPad = Math.hypot(q.x - PIZZA_PAD.x, q.z - PIZZA_PAD.z) < 2.4 && q.y < 3;
      if (j.state === 'idle') {
        if (!onPad) j.needLeave = false;
        else if (!j.needLeave && !p.rocket) newJob(p);
        H.hud(p.index, '', 'job');
      } else {
        j.time -= dt;
        const d = Math.hypot(q.x - j.house.door.x, q.z - j.house.door.z);
        if (d < (p.car != null ? 4 : 3) && q.y < 4) { endJob(p, true); continue; }
        if (j.time <= 0 && !j.late) { j.late = true; j.time = 45; H.toast(p.index, '⏰ Aika loppui – vie pizza silti perille, saat 3 🪙', true); }
        else if (j.time <= 0) { endJob(p, false); continue; }
        if (j.late) { H.hud(p.index, `🍕 Talo ${j.house.n} ${arrowTo(p, j.house.door.x, j.house.door.z)} ${Math.round(d)} m · ❄️ pizza jäähtyy ${Math.ceil(j.time)} s · +3 🪙`, 'job'); j.box.position.set(q.x, q.y + (p.car != null ? 2.2 : 2.9), q.z); j.box.rotation.y = p.yaw; j.beam.material.opacity = 0.35 + Math.sin(H.time * 5) * 0.15; continue; }
        H.hud(p.index, `🍕 Talo ${j.house.n} ${arrowTo(p, j.house.door.x, j.house.door.z)} ${Math.round(d)} m · ⏱ ${Math.ceil(j.time)} s · tippi ${(t => t >= 0 ? '+' + t : t)(pizzaPay(j.time, j.total, p.index).tip)}`, 'job');
        // pizzalaatikko pään / auton päällä
        j.box.position.set(q.x, q.y + (p.car != null ? 2.2 : 2.9), q.z);
        j.box.rotation.y = p.yaw;
      }
      j.beam.material.opacity = 0.35 + Math.sin(H.time * 5) * 0.15;
    }
  }

  // ---------- ilmapallojahti ----------
  let balloonGeo, stringGeo, goldMat;
  function makeBalloon() {
    const gold = Math.random() < 0.15;
    const colors = [0xff6b6b, 0x4dabf7, 0x69db7c, 0xda77f2, 0xffa94d, 0xf783ac];
    const m = gold ? goldMat : new (T().MeshStandardMaterial)({ color: colors[(Math.random() * colors.length) | 0], roughness: 0.25, metalness: 0.05 });
    const g = new (T().Group)();
    const s = new (T().Mesh)(balloonGeo, m); s.scale.set(1, 1.2, 1); s.castShadow = true; g.add(s);
    const str = new (T().Mesh)(stringGeo, new (T().MeshStandardMaterial)({ color: 0x000000, emissive: 0xeeeeee , emissiveIntensity: 1})); str.position.y = -1.15; g.add(str);
    const a = Math.random() * Math.PI * 2, r = 5 + Math.random() * FIELD.r;
    const b = { g, gold, x: FIELD.x + Math.cos(a) * r, z: FIELD.z + Math.sin(a) * r, baseY: 1.2 + Math.random() * 1.6, ph: Math.random() * 6, alive: true };
    if (gold) g.scale.setScalar(1.15);
    H.addObject(g, b.x, b.baseY, b.z);
    return b;
  }
  function startHunt() {
    hunt = { time: HUNT_TIME, score: [0, 0, 0, 0], coins: [0, 0, 0, 0] };
    for (let k = 0; k < BALLOONS; k++) balloons.push(makeBalloon());
    H.players.forEach(p => H.toast(p.index, 'Ilmapallojahti alkoi! Ammu tai lyö palloja 🎈'));
    H.beep(523, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(784, 0.18, 'triangle', 0.06), 120);
  }
  function endHunt() {
    balloons.forEach(b => H.removeObject(b.g)); balloons = [];
    const s = hunt.score; hunt = null; standLock = true;
    H.players.forEach(p => { H.toast(p.index, `Jahti ohi! Sait ${s[p.index]} palloa 🎈`); if (s[p.index] > 0) H.emit?.('job', p.index, 'pallo', s[p.index]); });
  }
  function pop(b, owner) {
    if (!b.alive) return;
    b.alive = false; H.removeObject(b.g);
    const pay = b.gold ? 10 : 2;
    if (owner != null && H.players[owner]) {
      hunt.score[owner]++; hunt.coins[owner] += pay;
      H.money.add(owner, pay, b.gold ? 'Kultainen pallo! +10 🪙' : null);
    }
    H.beep(b.gold ? 1400 : 900, 0.06, 'square', 0.05);
    if (hunt) balloons.push(makeBalloon());
  }
  let standLock = false;
  function updateHunt(dt) {
    let anyOn = false;
    for (const p of H.players) {
      const q = H.posOf(p);
      const onStand = Math.hypot(q.x - BALLOON_STAND.x, q.z - BALLOON_STAND.z) < 2.4 && q.y < 3;
      if (!hunt && onStand && !standLock) startHunt();
      anyOn = anyOn || onStand;
    }
    if (!anyOn) standLock = false;
    if (!hunt) { H.players.forEach(p => H.hud(p.index, '', 'hunt')); return; }
    hunt.time -= dt;
    const g = H.game;
    for (const b of balloons) {
      if (!b.alive) continue;
      b.ph += dt;
      const y = b.baseY + Math.sin(b.ph * 1.3) * 0.35;
      b.g.position.set(b.x + Math.sin(b.ph * 0.7) * 0.4, y, b.z);
      const bx = b.g.position.x;
      const R = b.gold ? 1.05 : 0.9;
      for (const pr of g.projectiles) {
        const m = pr.mesh && pr.mesh.position; if (!m) continue;
        if (Math.hypot(m.x - bx, m.y - y, m.z - b.z) < R + (pr.radius || 0.3)) { pop(b, pr.owner); break; }
      }
      if (!b.alive) continue;
      for (const lb of g.laserBolts) {
        const lx = lb.x ?? lb.mesh?.position.x, ly = lb.y ?? lb.mesh?.position.y, lz = lb.z ?? lb.mesh?.position.z;
        if (Math.hypot(lx - bx, ly - y, lz - b.z) < R + 0.5) { pop(b, lb.owner); break; }
      }
      if (!b.alive) continue;
      for (const p of H.players) {
        const q = H.posOf(p);
        const dx = bx - q.x, dz = b.z - q.z, hd = Math.hypot(dx, dz);
        // osuma kehoon (hyppy tai auto)
        if (hd < 1.3 && y > q.y && y < q.y + 3.2) { pop(b, p.index); break; }
        // lyönti/ase edessä
        if (p.__swingHit && hd < 3.4 && y > q.y - 0.5 && y < q.y + 3.6) {
          const v = g.dirVectors(p.yaw);
          if ((dx * v.fx + dz * v.fz) / (hd || 1) > 0.3) { pop(b, p.index); break; }
        }
      }
    }
    balloons = balloons.filter(b => b.alive);
    if (hunt.time <= 0) { endHunt(); H.players.forEach(p => H.hud(p.index, '', 'hunt')); return; }
    H.players.forEach(p => H.hud(p.index, `🎈 Jahti ${Math.ceil(hunt.time)} s · ${hunt.score[p.index]} palloa`, 'hunt'));
  }
  function updateSwings() {
    for (const p of H.players) {
      const s = p.swing || 0;
      p.__swingHit = s > 0.9 && (p.__lastSwing ?? 0) < s - 0.05;
      p.__lastSwing = s;
    }
  }
  function buildStand() {
    const g = new (T().Group)();
    const post1 = box(0.3, 4, 0.3, 0x8d5524); post1.position.set(-2.4, 2, 0); g.add(post1);
    const post2 = post1.clone(); post2.position.x = 2.4; g.add(post2);
    const top = box(5.4, 0.5, 0.6, 0xf783ac); top.position.y = 4; g.add(top);
    standLabel = H.makeLabel('🎈 ILMAPALLOJAHTI', { bg: '#c2255c', scale: 7 }); standLabel.position.y = 5.4; g.add(standLabel);
    H.addObject(g, BALLOON_STAND.x, 0, BALLOON_STAND.z - 2.2);
    const p = pad(1.8, 0xf06595); H.addObject(p, BALLOON_STAND.x, 0.06, BALLOON_STAND.z);
    const l = H.makeLabel('Seiso tässä: aloita!', { scale: 4, size: 50 }); H.addObject(l, BALLOON_STAND.x, 2.6, BALLOON_STAND.z);
  }

  H.onStart(() => {
    active = !H.challenge; jobs = []; balloons = []; hunt = null;
    if (!active) return;
    balloonGeo = balloonGeo || new (T().SphereGeometry)(0.7, 18, 14);
    stringGeo = stringGeo || new (T().CylinderGeometry)(0.02, 0.02, 1.2, 4);
    goldMat = goldMat || new (T().MeshStandardMaterial)({ color: 0xffd43b, metalness: 0.85, roughness: 0.15, emissive: 0xb37400, emissiveIntensity: 0.6 });
    buildPizzeria(); buildHouses(); buildStand();
    for (const p of H.players) {
      const bx = box(1.1, 0.25, 1.1, 0xf8f0e3);
      const top = new (T().Mesh)(new (T().CircleGeometry)(0.35, 16), new (T().MeshStandardMaterial)({ color: 0x000000, emissive: 0xd9480f , emissiveIntensity: 1}));
      top.rotation.x = -Math.PI / 2; top.position.y = 0.13; bx.add(top);
      bx.visible = false; H.addObject(bx);
      const beam = new (T().Mesh)(new (T().CylinderGeometry)(1.6, 1.6, 60, 20, 1, true),
        new (T().MeshStandardMaterial)({ color: 0x000000, emissive: PCOL[p.index], emissiveIntensity: 1, transparent: true, opacity: 0.4, depthWrite: false, side: 2 }));
      beam.geometry.translate(0, 30, 0); beam.visible = false; H.addObject(beam);
      jobs[p.index] = { state: 'idle', box: bx, beam, done: 0, needLeave: false };
    }
    setTimeout(() => H.players.forEach(p => H.toast(p.index, 'Uutta: kolikot, pizzat, ilmapallot ja kauppa!')), 1200);
  });
  H.onStop(() => { active = false; hunt = null; balloons = []; jobs = []; });
  H.onUpdate(dt => {
    if (!active) return;
    updateSwings(); updateJobs(dt); updateHunt(dt);
  });

  H.jobs = {
    PIZZA_PAD, pizzaPay, BALLOON_STAND, houses: () => houses,
    state: () => ({ jobs: jobs.map(j => j && { state: j.state, house: j.house?.n, door: j.house?.door, time: j.time, done: j.done }),
      hunt: hunt && { time: hunt.time, score: hunt.score.slice(), coins: hunt.coins.slice(), balloons: balloons.map(b => ({ x: b.g.position.x, y: b.g.position.y, z: b.z, gold: b.gold })) } }),
    popBalloon(k, owner) { const b = balloons[k]; if (b) pop(b, owner); },   // testikoukku
    _setTime(i, t) { if (jobs[i]) jobs[i].time = t; },                       // testikoukku
    _late: i => !!jobs[i]?.late,
  };
})();
