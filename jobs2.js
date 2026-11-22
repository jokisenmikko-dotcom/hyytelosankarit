// jobs2.js – Uudet ammatit (1.7): Postinkantaja, Palomies, Lammasfarmari ja Roskakuski.
// Jokaisella on oma alusta (E / 2 aloittaa), suomenkieliset ohjeet ja palkka kolikoina.
(function () {
  const H = window.HYYTE;
  const POST = { x: -12, z: -72, pad: { x: -12, z: -65 } };
  const FIRE = { x: 86, z: -42, pad: { x: 80, z: -34 }, truck: { x: 92, z: -33 } };
  const FARM = { x: 108, z: 84, pad: { x: 104, z: 92 }, pen: { x0: 116, x1: 130, z0: 96, z1: 108, gateZ: 102 }, meadow: { x: 92, z: 122, r: 14 } };
  const DUMP = { x: -36, z: 46, pad: { x: -30, z: 53 }, bin: { x: -36, z: 51 } };
  const KEY = H.KEYS('interact');
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.7, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0, transparent: !!o.op, opacity: o.op ?? 1, depthWrite: o.op ? false : true });
  const box = (w, h, d, m, x, y, z, p) => { const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p && p.add(o); return o; };
  const cyl = (rt, rb, h, m, x, y, z, p, seg = 16) => { const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  let active = false, mailboxes = [], fires = [], sheep = [], trash = [], st = [], beams = [], sprays = [], fireT = 0, trucks = new Set();

  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  function arrow(p, x, z) {
    const q = H.posOf(p), v = H.game.dirVectors(p.yaw), dx = x - q.x, dz = z - q.z;
    const a = Math.atan2(dx * v.rx + dz * v.rz, dx * v.fx + dz * v.fz);
    return ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'][((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
  }
  function pad(x, z, c, text) {
    H.addObject(cyl(1.4, 1.4, 0.1, M(c, { e: 0x111111, ei: 0.25 }), 0, 0, 0, null, 28), x, 0.2, z);
    const l = H.makeLabel(text, { scale: 4.4, size: 50 }); H.addObject(l, x, 3, z);
  }
  function beam(c) { const b = cyl(0.9, 0.9, 30, M(0x000000, { e: c, ei: 1, op: 0.35 }), 0, 15, 0, null, 16); b.castShadow = false; b.visible = false; H.addObject(b, 0, 15, 0); return b; }
  function pay(i, n, why) { H.money.add(i, n, why); H.beep(880, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(1175, 0.15, 'triangle', 0.06), 110); }
  function freeNear(cx, cz, r0, r1) {
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * Math.PI * 2, r = r0 + Math.random() * (r1 - r0), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (Math.abs(x) > 148 || Math.abs(z) > 148) continue;
      if (H.game.isBlocked(x, z) || Math.abs(H.game.groundHeight(x, z)) > 0.3) continue;
      if (H.game.obstacles.some(o => (o.x - x) ** 2 + (o.z - z) ** 2 < (o.r + 1.5) ** 2)) continue;
      return { x, z };
    }
    return { x: cx + r0, z: cz };
  }

  // ---------- rakennukset ----------
  function build() {
    const G = T();
    // posti
    let g = new G.Group();
    box(10, 4.2, 7, M(0xffd43b), 0, 2.1, 0, g); box(10.6, 0.4, 7.6, M(0x1971c2), 0, 4.4, 0, g);
    box(1.6, 2.4, 0.2, M(0x1864ab), 0, 1.2, 3.55, g);
    const pl = H.makeLabel('📮 POSTI', { bg: '#1971c2', scale: 6 }); pl.position.set(0, 5.8, 0); g.add(pl);
    H.addObject(g, POST.x, 0, POST.z); for (let x = -4; x <= 4; x += 2.6) for (const z of [-2, 1.5]) H.addObstacle(POST.x + x, POST.z + z, 2);
    pad(POST.pad.x, POST.pad.z, 0x1c7ed6, '📮 Postinkantaja');
    // paloasema
    g = new G.Group();
    box(14, 5, 9, M(0xc92a2a), 0, 2.5, 0, g); box(14.6, 0.4, 9.6, M(0x343a40), 0, 5.2, 0, g);
    for (const x of [-3.5, 3.5]) box(4, 3.6, 0.2, M(0xf1f3f5), x, 1.8, 4.55, g);
    box(1.4, 8, 1.4, M(0xa61e4d), 6, 4, -3.5, g);
    const fl = H.makeLabel('🚒 PALOASEMA', { bg: '#c92a2a', scale: 7 }); fl.position.set(0, 6.6, 0); g.add(fl);
    H.addObject(g, FIRE.x, 0, FIRE.z); for (let x = -5.5; x <= 5.5; x += 2.75) for (const z of [-2.5, 2]) H.addObstacle(FIRE.x + x, FIRE.z + z, 2.2);
    pad(FIRE.pad.x, FIRE.pad.z, 0xe03131, '🧯 Palomies');
    H.addObject(cyl(2.2, 2.2, 0.08, M(0xff6b6b, { e: 0x550000, ei: 0.4 }), 0, 0, 0, null, 28), FIRE.truck.x, 0.18, FIRE.truck.z);
    const tl = H.makeLabel('🚒 Aja auto tähän = paloauto', { scale: 5, size: 40, w: 640 }); H.addObject(tl, FIRE.truck.x, 2.6, FIRE.truck.z);
    // maatila + aitaus
    g = new G.Group();
    box(10, 5, 8, M(0xa61e1e), 0, 2.5, 0, g);
    const roof = new G.Mesh(new G.CylinderGeometry(4.2, 4.2, 10.4, 3, 1), M(0x495057)); roof.rotation.z = Math.PI / 2; roof.rotation.x = Math.PI / 6; roof.position.y = 6.1; g.add(roof);
    box(3, 3.4, 0.2, M(0xffffff), 0, 1.7, 4.05, g);
    const bl = H.makeLabel('🐑 MAATILA', { bg: '#5c940d', scale: 6 }); bl.position.set(0, 9, 0); g.add(bl);
    H.addObject(g, FARM.x, 0, FARM.z); for (let x = -3.6; x <= 3.6; x += 2.4) for (const z of [-2, 2]) H.addObstacle(FARM.x + x, FARM.z + z, 2);
    pad(FARM.pad.x, FARM.pad.z, 0x82c91e, '🐑 Lammasfarmari');
    const P = FARM.pen, fm = M(0xf8f0e3);
    const fence = (x1, z1, x2, z2) => { const L = Math.hypot(x2 - x1, z2 - z1), n = Math.ceil(L / 2);
      for (let k = 0; k <= n; k++) { const x = x1 + (x2 - x1) * k / n, z = z1 + (z2 - z1) * k / n; H.addObject(box(0.2, 1.2, 0.2, fm, 0, 0, 0), x, 0.6, z); H.addObstacle(x, z, 0.35); }
      for (const y of [0.5, 1.0]) { const r = box(L, 0.1, 0.08, fm, 0, 0, 0); r.rotation.y = -Math.atan2(z2 - z1, x2 - x1); H.addObject(r, (x1 + x2) / 2, y, (z1 + z2) / 2); } };
    fence(P.x0, P.z0, P.x1, P.z0); fence(P.x0, P.z1, P.x1, P.z1); fence(P.x1, P.z0, P.x1, P.z1);
    fence(P.x0, P.z0, P.x0, P.gateZ - 2.5); fence(P.x0, P.gateZ + 2.5, P.x0, P.z1);
    const penL = H.makeLabel('Aitaus – aja lampaat tänne!', { scale: 5, size: 40, w: 640 }); H.addObject(penL, (P.x0 + P.x1) / 2, 3, (P.z0 + P.z1) / 2);
    H.addObject(new G.Mesh(new G.BoxGeometry(P.x1 - P.x0, 0.04, P.z1 - P.z0), M(0x94d82d)), (P.x0 + P.x1) / 2, 0.03, (P.z0 + P.z1) / 2);
    // jäteasema
    g = new G.Group();
    box(9, 0.2, 6, M(0x868e96), 0, 0.1, 0, g);
    [[0x2f9e44, -3], [0x1971c2, 0], [0xf08c00, 3]].forEach(([c, x]) => { box(2.4, 1.8, 1.8, M(c), x, 1.0, -1.6, g); box(2.5, 0.15, 1.9, M(0x343a40), x, 1.95, -1.6, g); });
    const dl = H.makeLabel('♻️ JÄTEASEMA', { bg: '#2b8a3e', scale: 6 }); dl.position.set(0, 3.8, -1.6); g.add(dl);
    H.addObject(g, DUMP.x, 0, DUMP.z); for (const x of [-3, 0, 3]) H.addObstacle(DUMP.x + x, DUMP.z - 1.6, 1.3);
    pad(DUMP.pad.x, DUMP.pad.z, 0x40c057, '🗑️ Roskakuski');
    // postilaatikot: talojen ovien viereen + kotien laatikot
    mailboxes = [];
    (H.jobs?.houses() || []).forEach(h => {
      const ax = h.door.x - h.x, az = h.door.z - h.z, L = Math.hypot(ax, az) || 1;
      const x = h.door.x + (-az / L) * 3 + ax / L * 1.5, z = h.door.z + (ax / L) * 3 + az / L * 1.5;
      const mb = new G.Group(); box(0.12, 1.1, 0.12, M(0x495057), 0, 0.55, 0, mb); box(0.55, 0.45, 0.75, M(0xfab005), 0, 1.3, 0, mb);
      box(0.05, 0.3, 0.12, M(0xe03131), 0.3, 1.6, 0.2, mb); H.addObject(mb, x, 0, z);
      mailboxes.push({ x, z, name: 'Talo ' + h.n });
    });
    (H.homes?.list() || []).forEach(h => mailboxes.push({ x: h.mail.x, z: h.mail.z, name: `P${h.i + 1}:n koti` }));
  }

  // ---------- tila per pelaaja ----------
  function blank() { return { job: '', time: 0, targets: [], carry: 0, done: 0, needLeave: false, tool: 0, truck: false }; }
  function startHud(p, txt) { H.hud(p.index, txt, 'job2'); }
  function stopJob(i) { const s = st[i]; s.job = ''; s.targets = []; beams[i].forEach(b => b.visible = false); s.needLeave = true; }

  // Posti
  function startPost(p) {
    const s = st[p.index], pool = mailboxes.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    Object.assign(s, { job: 'post', time: 150, targets: pool.map(m => ({ ...m, ok: false })), done: 0 });
    H.toast(p.index, '📮 Vie 3 pakettia postilaatikoihin! Autolla tai raketista pudottamalla.');
    H.beep(660, 0.12, 'triangle', 0.06);
  }
  function updPost(p, dt) {
    const i = p.index, s = st[i], q = H.posOf(p);
    s.time -= dt;
    const left = s.targets.filter(t => !t.ok);
    left.forEach((t, k) => { const b = beams[i][k]; b.visible = true; b.position.set(t.x, 15, t.z); });
    for (let k = left.length; k < 3; k++) beams[i][k].visible = false;
    const flying = p.rocket || (p.air && p.air !== 'none');
    for (const t of left) {
      const d = dist(q, t);
      const r = flying ? 9 : p.car != null ? 4.5 : 2.4;
      if (d < r && (flying || q.y < 3)) {
        t.ok = true; s.done++;
        dropParcel(flying ? q : null, t);
        pay(i, flying ? 12 : 8, flying ? `Ilmapudotus osui! 🪂 +12 🪙` : `Paketti perillä (${t.name})! +8 🪙`);
      }
    }
    if (s.targets.every(t => t.ok)) {
      stopJob(i); pay(i, 6, 'Kaikki paketit jaettu! Bonus +6 🪙 ja lahjapaketti 🎁'); H.emit?.('job', i, 'post'); H.hunger?.addToBag(i, 'paketti', true); return;
    }
    if (s.time <= 0) { stopJob(i); H.emit?.('jobfail', i, 'post'); H.toast(i, 'Postin jakoaika loppui. Hae uudet paketit postista.', true); return; }
    const n = left.sort((a, b) => dist(q, a) - dist(q, b))[0];
    startHud(p, `📮 ${s.targets.filter(t => !t.ok).length} pakettia · ${n.name} ${arrow(p, n.x, n.z)} ${Math.round(dist(q, n))} m · ⏱ ${Math.ceil(s.time)} s`);
  }
  const drops = [];
  function dropParcel(from, t) {
    const it = H.hunger ? H.hunger.makeItem('paketti') : box(0.4, 0.4, 0.4, M(0xe64980), 0, 0, 0);
    it.scale.setScalar(1.6);
    const y0 = from ? Math.max(2, from.y) : 1.5;
    H.addObject(it, from ? from.x : t.x, y0, from ? from.z : t.z);
    drops.push({ o: it, t, y0, k: 0, sx: from ? from.x : t.x, sz: from ? from.z : t.z });
  }

  // Palomies
  function startFire(p) {
    const s = st[p.index];
    Object.assign(s, { job: 'fire', time: 180, tool: 1, done: 0 });
    H.toast(p.index, '🧯 Palomiesvuoro! Pidä tulinappia painettuna sammuttaaksesi. Paloauto ruiskuttaa itse.');
    H.beep(520, 0.12, 'square', 0.04);
    if (fires.length < 2) spawnFire();
  }
  function spawnFire() {
    const houses = H.jobs?.houses() || [];
    const used = new Set(fires.map(f => f.key));
    const opts = [...houses.map(h => ({ key: 'h' + h.n, x: h.x, z: h.z, name: 'Talo ' + h.n, house: true })),
      ...H.game.trees.filter(t => Math.abs(t.x) < 140 && Math.abs(t.z) < 140).map((t, k) => ({ key: 't' + k, x: t.x, z: t.z, name: 'Puu', tree: t }))]
      .filter(o => !used.has(o.key));
    if (!opts.length) return;
    const o = opts[(Math.random() * opts.length) | 0];
    const f = { ...o, hp: 100, life: 100, g: null };
    if (o.tree) { o.tree.fire = 999; o.tree.flames.visible = true; }
    else {
      const g = new (T().Group)();
      for (let k = 0; k < 7; k++) {
        const c = new (T().Mesh)(new (T().ConeGeometry)(0.9, 3, 10), M(0x000000, { e: k % 2 ? 0xffa94d : 0xff4b2b, ei: 1.2 }));
        const a = k / 7 * Math.PI * 2; c.position.set(Math.sin(a) * 2.6, 6.2, Math.cos(a) * 2.6); g.add(c);
      }
      for (let k = 0; k < 4; k++) { const s = new (T().Mesh)(new (T().SphereGeometry)(1.2, 10, 8), M(0x555555, { op: 0.45 })); s.position.set(0, 8 + k * 1.6, 0); s.userData.smoke = k; g.add(s); }
      H.addObject(g, o.x, 0, o.z); f.g = g;
    }
    fires.push(f);
    H.players.forEach(p => H.toast(p.index, `🔥 Tulipalo: ${f.name}! Palomiehet apuun!`, true));
    H.beep(300, 0.4, 'sawtooth', 0.03);
  }
  function endFire(f, byWho) {
    if (f.tree) { f.tree.fire = 0.01; }
    if (f.g) H.removeObject(f.g);
    fires.splice(fires.indexOf(f), 1);
    if (byWho != null) {
      pay(byWho, 15, `Palo sammutettu! 🚒 +15 🪙`); H.emit?.('job', byWho, 'fire');
      const s = st[byWho]; s.done++;
      if (s.done === 1 && H.hunger && !H.hunger.bag(byWho).includes('kypara')) H.hunger.addToBag(byWho, 'kypara', true);
    }
  }
  function updFireJob(p, dt) {
    const i = p.index, s = st[i], q = H.posOf(p);
    s.time -= dt;
    const car = p.car != null ? H.cars[p.car] : null;
    if (car && dist(car.pos, FIRE.truck) < 3 && !trucks.has(car)) makeTruck(car, i);
    const isTruck = car && trucks.has(car);
    let target = null;
    const inp = H.input(i);
    for (const f of fires) {
      const d = dist(q, f), reach = (f.house ? 4.5 : 1.5) + (isTruck ? 9 : 7);
      if (d > reach) continue;
      if (isTruck) { target = f; break; }
      if (car || !inp.fire) continue;
      const v = H.game.dirVectors(p.yaw), dot = ((f.x - q.x) * v.fx + (f.z - q.z) * v.fz) / (d || 1);
      if (dot > 0.35 || d < 3) { target = f; break; }
    }
    const sp = sprays[i];
    if (target) {
      target.hp -= (isTruck ? 70 : 45) * dt;
      sp.visible = true; animSpray(sp, q, target, dt, isTruck);
      if (target.hp <= 0) endFire(target, i);
    } else sp.visible = !car && inp.fire && s.tool;
    if (sp.visible && !target) { const v = H.game.dirVectors(p.yaw); animSpray(sp, q, { x: q.x + v.fx * 6, z: q.z + v.fz * 6, house: false }, dt, false); }
    if (s.time <= 0) { stopJob(i); sp.visible = false; H.toast(i, `Palomiesvuoro päättyi – sammutit ${s.done} paloa. 🚒`); return; }
    const n = fires.slice().sort((a, b) => dist(q, a) - dist(q, b))[0];
    startHud(p, n ? `🔥 ${n.name} ${arrow(p, n.x, n.z)} ${Math.round(dist(q, n))} m · palo ${Math.max(0, Math.ceil(n.hp))}% · ${isTruck ? '🚒 paloauto' : '🧯 ' + ['F', '1'][i] + ' = ruiskuta'} · ⏱ ${Math.ceil(s.time)} s`
      : `🚒 Ei paloja juuri nyt – odota hälytystä · ⏱ ${Math.ceil(s.time)} s`);
  }
  function makeTruck(car, i) {
    trucks.add(car);
    const g = new (T().Group)(); g.name = 'firetruck';
    box(1.6, 0.5, 2.4, M(0xe03131), 0, 1.6, -0.4, g);
    const lad = box(0.5, 0.12, 3.2, M(0xdee2e6), 0, 1.95, -0.2, g); lad.rotation.x = 0.08;
    box(0.4, 0.2, 0.3, M(0x000000, { e: 0x4dabf7, ei: 1.5 }), 0.35, 2.0, 0.9, g); box(0.4, 0.2, 0.3, M(0x000000, { e: 0xff3b3b, ei: 1.5 }), -0.35, 2.0, 0.9, g);
    car.group.add(g); car.__truck = g;
    H.toast(i, '🚒 Autosi on nyt paloauto! Aja palon viereen, niin se ruiskuttaa vettä.');
    H.beep(988, 0.12, 'square', 0.04); setTimeout(() => H.beep(784, 0.12, 'square', 0.04), 160);
  }
  function makeSpray() {
    const N = 40, g = new (T().BufferGeometry)(), pos = new Float32Array(N * 3);
    g.setAttribute('position', new (T().BufferAttribute)(pos, 3));
    const pts = new (T().Points)(g, new (T().PointsMaterial)({ color: 0x74c0fc, size: 0.35, transparent: true, opacity: 0.85 }));
    pts.frustumCulled = false; pts.visible = false; pts.userData.t = Array.from({ length: N }, () => Math.random());
    H.addObject(pts, 0, 0, 0); return pts;
  }
  function animSpray(sp, q, f, dt, big) {
    const a = sp.geometry.attributes.position, ts = sp.userData.t, y0 = q.y + (big ? 2.2 : 1.2), ty = f.house ? 4.5 : 2.5;
    for (let k = 0; k < ts.length; k++) {
      ts[k] = (ts[k] + dt * 1.6) % 1; const t = ts[k];
      a.setXYZ(k, q.x + (f.x - q.x) * t + Math.sin(k * 7) * 0.4 * t, y0 + (ty - y0) * t + Math.sin(t * Math.PI) * 2, q.z + (f.z - q.z) * t + Math.cos(k * 5) * 0.4 * t);
    }
    a.needsUpdate = true;
  }

  // Lampaat
  function makeSheep() {
    const g = new (T().Group)();
    const wool = new (T().Mesh)(new (T().SphereGeometry)(0.75, 14, 10), M(0xf8f9fa, { r: 1 })); wool.scale.set(1, 0.8, 1.3); wool.position.y = 0.95; wool.castShadow = true; g.add(wool);
    const head = new (T().Mesh)(new (T().SphereGeometry)(0.32, 12, 8), M(0x343a40)); head.position.set(0, 1.15, 0.95); g.add(head);
    for (const [x, z] of [[-0.35, -0.5], [0.35, -0.5], [-0.35, 0.5], [0.35, 0.5]]) cyl(0.08, 0.08, 0.6, M(0x343a40), x, 0.3, z, g, 6);
    return g;
  }
  function startSheep(p) {
    const s = st[p.index];
    sheep.filter(sh => sh.owner === p.index).forEach(sh => H.removeObject(sh.g));
    sheep = sheep.filter(sh => sh.owner !== p.index);
    for (let k = 0; k < 6; k++) {
      const sp = freeNear(FARM.meadow.x, FARM.meadow.z, 3, FARM.meadow.r);
      const g = makeSheep(); H.addObject(g, sp.x, 0, sp.z);
      sheep.push({ g, x: sp.x, z: sp.z, yaw: Math.random() * 6, owner: p.index, penned: false, wt: 0 });
    }
    Object.assign(s, { job: 'sheep', time: 180, done: 0 });
    H.toast(p.index, '🐑 Aja 6 lammasta aitaukseen! Lampaat karkaavat sinusta poispäin.');
  }
  const inPen = (x, z, m = 0) => x > FARM.pen.x0 + m && x < FARM.pen.x1 - m && z > FARM.pen.z0 + m && z < FARM.pen.z1 - m;
  function updSheepAll(dt) {
    for (const sh of sheep) {
      let vx = 0, vz = 0;
      if (!sh.penned) {
        for (const p of H.players) {
          const q = H.posOf(p), dx = sh.x - q.x, dz = sh.z - q.z, d = Math.hypot(dx, dz);
          if (d < 8 && d > 0.01) { const k = (8 - d) / 8 * (p.car != null ? 7 : 5.5); vx += dx / d * k; vz += dz / d * k; }
        }
        // ohjaa kohti porttia kun lähellä aitausta
        const gx = FARM.pen.x0, gz = FARM.pen.gateZ;
        if (Math.hypot(sh.x - gx, sh.z - gz) < 6 && (vx || vz)) { vx += (gx + 3 - sh.x) * 0.6; vz += (gz - sh.z) * 0.8; }
      } else { sh.wt -= dt; if (sh.wt <= 0) { sh.wt = 1 + Math.random() * 2; sh.tx = FARM.pen.x0 + 2 + Math.random() * 10; sh.tz = FARM.pen.z0 + 2 + Math.random() * 8; } vx = (sh.tx - sh.x) * 0.4; vz = (sh.tz - sh.z) * 0.4; }
      if (!vx && !vz) { sh.wt -= dt; if (sh.wt <= 0) { sh.wt = 2 + Math.random() * 3; sh.yaw += (Math.random() - 0.5) * 2; } vx = Math.sin(sh.yaw) * 0.5; vz = Math.cos(sh.yaw) * 0.5; }
      const nx = sh.x + vx * dt, nz = sh.z + vz * dt;
      const blocked = Math.abs(nx) > 150 || Math.abs(nz) > 150 || H.game.isBlocked(nx, nz) || Math.abs(H.game.groundHeight(nx, nz)) > 0.4 || (sh.penned && !inPen(nx, nz, 0.8));
      if (!blocked) { sh.x = nx; sh.z = nz; } else sh.yaw += Math.PI * 0.5;
      if (Math.hypot(vx, vz) > 0.2) { const want = Math.atan2(vx, vz); let d = want - sh.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); sh.g.rotation.y += d * Math.min(1, dt * 6); }
      sh.g.position.set(sh.x, Math.abs(Math.sin(H.time * 8 + sh.x)) * (Math.hypot(vx, vz) > 1 ? 0.2 : 0), sh.z);
      if (!sh.penned && inPen(sh.x, sh.z, 0.8)) {
        sh.penned = true; const s = st[sh.owner]; s.done++;
        H.beep(392, 0.12, 'triangle', 0.05); pay(sh.owner, 5, 'Mää! Lammas aitauksessa +5 🪙 🐑');
        if (s.job === 'sheep' && sheep.filter(o => o.owner === sh.owner && o.penned).length >= 6) {
          stopJob(sh.owner); pay(sh.owner, 10, 'Kaikki lampaat kotona! Bonus +10 🪙 ja villakerä 🧶'); H.emit?.('job', sh.owner, 'sheep'); H.hunger?.addToBag(sh.owner, 'villa', true);
        }
      }
    }
  }
  function updSheepJob(p, dt) {
    const i = p.index, s = st[i], q = H.posOf(p); s.time -= dt;
    const mine = sheep.filter(o => o.owner === i), free = mine.filter(o => !o.penned);
    if (s.time <= 0) { stopJob(i); H.emit?.('jobfail', i, 'sheep'); H.toast(i, `Lammasaika loppui – ${mine.length - free.length}/6 aitauksessa.`, true); return; }
    const n = free.sort((a, b) => dist(q, a) - dist(q, b))[0];
    startHud(p, `🐑 ${mine.length - free.length}/6 aitauksessa${n ? ` · lähin ${arrow(p, n.x, n.z)} ${Math.round(dist(q, n))} m` : ''} · aitaus ${arrow(p, FARM.pen.x0, FARM.pen.gateZ)} · ⏱ ${Math.ceil(s.time)} s`);
  }

  // Roskat
  function makeBag() {
    const g = new (T().Group)();
    const b = new (T().Mesh)(new (T().SphereGeometry)(0.45, 12, 10), M(0x212529, { r: 0.4 })); b.scale.y = 1.2; b.position.y = 0.5; b.castShadow = true; g.add(b);
    cyl(0.08, 0.18, 0.25, M(0x212529), 0, 1.1, 0, g, 8);
    return g;
  }
  function startTrash(p) {
    const s = st[p.index];
    trash.filter(t => t.owner === p.index).forEach(t => H.removeObject(t.g));
    trash = trash.filter(t => t.owner !== p.index);
    for (let k = 0; k < 8; k++) { const sp = freeNear(DUMP.x, DUMP.z, 14, 55); const g = makeBag(); H.addObject(g, sp.x, 0, sp.z); trash.push({ g, x: sp.x, z: sp.z, owner: p.index }); }
    Object.assign(s, { job: 'trash', time: 200, carry: 0, done: 0 });
    H.toast(p.index, '🗑️ Kerää 8 roskapussia ja vie ne jäteasemalle! Mahtuu 4 kerrallaan.');
  }
  function updTrashJob(p, dt) {
    const i = p.index, s = st[i], q = H.posOf(p); s.time -= dt;
    const cap = p.car != null ? 8 : 4;
    for (const t of trash.filter(t => t.owner === i)) {
      if (s.carry < cap && dist(q, t) < (p.car != null ? 2.8 : 1.7) && q.y < 3) {
        s.carry++; H.removeObject(t.g); trash.splice(trash.indexOf(t), 1); H.beep(330, 0.08, 'square', 0.03);
      }
    }
    if (s.carry && dist(q, DUMP.bin) < 4.5) {
      const n = s.carry; s.done += n; s.carry = 0; pay(i, n * 3, `Roskat lajiteltu! +${n * 3} 🪙 ♻️`);
      if (s.done >= 8) { stopJob(i); pay(i, 8, 'Kaupunki on siisti! Bonus +8 🪙'); H.emit?.('job', i, 'trash'); return; }
    }
    const left = trash.filter(t => t.owner === i);
    if (s.time <= 0) { const c = s.carry | 0; s.carry = 0; stopJob(i); left.forEach(t => H.removeObject(t.g)); trash = trash.filter(t => t.owner !== i); H.emit?.('jobfail', i, 'trash'); if (c) pay(i, c * 2, `Roska-aika loppui – kantamasi ${c} pussia kirjattiin: +${c * 2} 🪙`); else H.toast(i, `Roska-aika loppui – lajittelit ${s.done}/8.`, true); return; }
    const n = left.sort((a, b) => dist(q, a) - dist(q, b))[0];
    const goal = s.carry >= cap || !n ? DUMP.bin : n;
    startHud(p, `🗑️ Kyydissä ${s.carry}/${cap} · tehty ${s.done}/8 · ${goal === DUMP.bin ? 'jäteasema' : 'roskapussi'} ${arrow(p, goal.x, goal.z)} ${Math.round(dist(q, goal))} m · ⏱ ${Math.ceil(s.time)} s`);
  }

  const PADS = [
    { id: 'post', at: POST.pad, name: 'Postinkantaja', info: 'vie paketit laatikoihin', start: startPost },
    { id: 'fire', at: FIRE.pad, name: 'Palomies', info: 'sammuta tulipalot', start: startFire },
    { id: 'sheep', at: FARM.pad, name: 'Lammasfarmari', info: 'aja lampaat aitaukseen', start: startSheep },
    { id: 'trash', at: DUMP.pad, name: 'Roskakuski', info: 'kerää roskapussit', start: startTrash },
  ];

  H.onStart(() => {
    active = !H.challenge; fires = []; sheep = []; trash = []; drops.length = 0; trucks = new Set(); fireT = 25;
    st = [blank(), blank(), blank(), blank()];
    if (!active) return;
    build();
    beams = H.players.map((p, i) => [0, 1, 2].map(() => beam([0xffd43b, 0x4dabf7, 0x69db7c, 0xffa94d][i])));
    sprays = H.players.map(() => makeSpray());
  });
  H.onStop(() => {
    active = false;
    fires.forEach(f => { if (f.tree) f.tree.fire = 0.01; }); fires = [];
    trucks.forEach(c => { if (c.__truck) { c.group.remove(c.__truck); c.__truck = null; } }); trucks = new Set();
  });
  H.onUpdate(dt => {
    if (!active) return;
    for (const p of H.players) {
      const i = p.index, s = st[i], q = H.posOf(p);
      const near = p.car == null && !p.rocket ? PADS.find(pd => dist(q, pd.at) < 1.6 && q.y < 2) : null;
      if (s.needLeave && !near) s.needLeave = false;
      if (s.job === 'post') updPost(p, dt);
      else if (s.job === 'fire') updFireJob(p, dt);
      else if (s.job === 'sheep') updSheepJob(p, dt);
      else if (s.job === 'trash') updTrashJob(p, dt);
      else if (near && !s.needLeave) {
        startHud(p, `${near.at === POST.pad ? '📮' : near.id === 'fire' ? '🧯' : near.id === 'sheep' ? '🐑' : '🗑️'} ${near.name}: ${near.info} · ${KEY[i]} = aloita`);
        if (H.pressed(i, 'interact')) near.start(p);
      } else startHud(p, '');
      if (s.job !== 'fire' && sprays[i]) sprays[i].visible = false;
    }
    // palot: uusi hälytys kun joku on palomiesvuorossa
    const onDuty = st.some(s => s.job === 'fire');
    if (onDuty && fires.length < 2) { fireT -= dt; if (fireT <= 0) { fireT = 30 + Math.random() * 25; spawnFire(); } }
    for (const f of fires.slice()) {
      f.life -= dt / 1.2;   // ~120 s jälkeen sammuu itsestään
      if (f.tree) f.tree.fire = Math.max(f.tree.fire, 5);
      if (f.g) {
        const sc = 0.35 + 0.65 * Math.max(0, f.hp) / 100;
        f.g.children.forEach((c, k) => {
          if (c.userData.smoke != null) { c.position.y = 8 + ((H.time * 1.5 + c.userData.smoke * 1.6) % 6.4); c.scale.setScalar(sc * (0.8 + c.position.y / 12)); }
          else c.scale.set(sc, sc * (0.8 + 0.35 * Math.sin(H.time * 9 + k * 1.7)), sc);
        });
      } else if (f.tree) f.tree.flames.scale.setScalar(0.5 + 0.5 * Math.max(0, f.hp) / 100);
      if (f.life <= 0) { endFire(f, null); H.players.forEach(p => H.toast(p.index, 'Palo sammui itsestään. 💨')); }
    }
    if (sheep.length) updSheepAll(dt);
    for (const d of drops.slice()) {
      d.k += dt / 1.2; const t = Math.min(1, d.k);
      d.o.position.set(d.sx + (d.t.x - d.sx) * t, d.y0 + (1.6 - d.y0) * t, d.sz + (d.t.z - d.sz) * t); d.o.rotation.y += dt * 3;
      if (d.k > 2.5) { H.removeObject(d.o); drops.splice(drops.indexOf(d), 1); }
    }
  });

  H.jobs2 = {
    POST, FIRE, FARM, DUMP, PADS: PADS.map(p => ({ id: p.id, ...p.at })),
    state: () => ({ st: st.map(s => ({ job: s.job, time: s.time, done: s.done, carry: s.carry, targets: s.targets.map(t => ({ x: t.x, z: t.z, ok: t.ok, name: t.name })) })),
      fires: fires.map(f => ({ x: f.x, z: f.z, hp: f.hp, name: f.name, house: !!f.house })), sheep: sheep.map(s => ({ x: s.x, z: s.z, penned: s.penned, owner: s.owner })),
      trash: trash.map(t => ({ x: t.x, z: t.z, owner: t.owner })), mailboxes: mailboxes.slice(), trucks: trucks.size }),
    _setTime(i, t) { if (st[i]) st[i].time = t; },   // testikoukku
    _sheep: () => sheep,   // testikoukku
    spawnFire, start: (i, id) => { const p = H.players[i]; PADS.find(x => x.id === id).start(p); },
  };
})();
