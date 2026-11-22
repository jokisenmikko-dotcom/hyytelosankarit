// peds.js – Kävelevät hyytelöihmiset (1.7). Kävelevät rauhallisesti tasaisella maalla,
// väistävät esteitä eivätkä mene rampeille/sillalle. Auto tönäisee heidät hassusti ilmaan
// (ei vahinkoa) – he pomppivat, huutavat "Huiii!" ja nousevat takaisin kävelemään.
(function () {
  const H = window.HYYTE;
  const COUNT = 14;
  const COLS = [0xff8787, 0x74c0fc, 0x8ce99a, 0xffd43b, 0xda77f2, 0xffa94d, 0x63e6be, 0xf783ac];
  const SAY = ['Huiii!', 'Hups!', 'Oho!', 'Jiihaa!', 'Pomps!', 'Ai ai!'];
  const HELLO = ['Moi!', 'Hei hei!', 'Kiva päivä!', 'Terve!'];
  const T = () => H.THREE;
  let active = false, peds = [], geo = null;
  const M = c => new (T().MeshStandardMaterial)({ color: c, roughness: 0.25, metalness: 0, transparent: true, opacity: 0.88 });
  const okSpot = (x, z) => Math.abs(x) < 146 && Math.abs(z) < 146 && !H.game.isBlocked(x, z) && Math.abs(H.game.groundHeight(x, z)) < 0.15
    && !(Math.abs(x) < 48 && z > 55)          // Haaste-areena / silta
    && !H.game.obstacles.some(o => (o.x - x) ** 2 + (o.z - z) ** 2 < (o.r + 0.8) ** 2);
  function pick(cx, cz, r) { for (let k = 0; k < 40; k++) { const x = cx + (Math.random() * 2 - 1) * r, z = cz + (Math.random() * 2 - 1) * r; if (okSpot(x, z)) return { x, z }; } return null; }
  function make(k) {
    const g = new (T().Group)(), c = COLS[k % COLS.length], m = M(c);
    const body = new (T().Mesh)(geo.body, m); body.position.y = 0.75; body.castShadow = true; g.add(body);
    const head = new (T().Mesh)(geo.head, m); head.position.y = 1.55; g.add(head);
    const eyeM = new (T().MeshStandardMaterial)({ color: 0x111111 });
    [-0.11, 0.11].forEach(x => { const e = new (T().Mesh)(geo.eye, eyeM); e.position.set(x, 1.62, 0.3); g.add(e); });
    if (k % 3 === 0) { const hat = new (T().Mesh)(geo.hat, new (T().MeshStandardMaterial)({ color: COLS[(k + 3) % COLS.length] })); hat.position.y = 1.9; g.add(hat); }
    return g;
  }
  H.onStart(() => {
    active = !H.challenge; peds = [];
    if (!active) return;
    const G = T();
    geo = { body: new G.CapsuleGeometry(0.38, 0.6, 4, 12), head: new G.SphereGeometry(0.34, 14, 10), eye: new G.SphereGeometry(0.05, 6, 6), hat: new G.ConeGeometry(0.25, 0.4, 10) };
    const hubs = [[-52, -50], [40, -55], [-12, -60], [-36, -95], [22, -95], [-85, -40], [80, -25], [-36, 38], [100, 80], [-30, -30], [20, -30], [-100, 0], [110, 0], [60, -100]];
    for (let k = 0; k < COUNT; k++) {
      const [hx, hz] = hubs[k % hubs.length], s = pick(hx, hz, 10); if (!s) continue;
      const g = make(k); H.addObject(g, s.x, 0, s.z);
      peds.push({ g, x: s.x, z: s.z, y: 0, vx: 0, vy: 0, vz: 0, hx, hz, tx: s.x, tz: s.z, wait: Math.random() * 3, state: 'walk', t: 0, spin: 0, speed: 1.2 + Math.random() * 0.6, label: null, hiT: 0, hits: 0 });
    }
  });
  H.onStop(() => { active = false; peds = []; });
  function say(pd, text, sec = 1.6) {
    if (pd.label) H.removeObject(pd.label);
    pd.label = H.makeLabel(text, { scale: 2.2, size: 60, bg: '#ffffff', color: '#212529', border: '#212529' });
    pd.label.userData.life = sec; H.addObject(pd.label, pd.x, 2.7, pd.z);
  }
  H.onUpdate(dt => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    for (const pd of peds) {
      if (pd.label) { pd.label.userData.life -= dt; pd.label.position.set(pd.x, pd.y + 2.7, pd.z); if (pd.label.userData.life <= 0) { H.removeObject(pd.label); pd.label = null; } }
      pd.hiT -= dt;
      if (pd.state === 'fly') {
        pd.vy -= 22 * dt; pd.x += pd.vx * dt; pd.z += pd.vz * dt; pd.y += pd.vy * dt; pd.spin += dt * 9;
        if (Math.abs(pd.x) > 150) pd.vx *= -1; if (Math.abs(pd.z) > 150) pd.vz *= -1;
        if (pd.y <= 0 && pd.vy < 0) {
          pd.y = 0;
          if (pd.vy < -6) { pd.vy *= -0.45; pd.vx *= 0.6; pd.vz *= 0.6; H.beep(180, 0.06, 'triangle', 0.03); }   // pomps
          else { pd.state = 'down'; pd.t = 1.6; pd.vy = 0; }
        }
        pd.g.rotation.set(pd.spin, pd.g.rotation.y, pd.spin * 0.6);
        pd.g.scale.set(1, 1, 1);
      } else if (pd.state === 'down') {
        pd.t -= dt; pd.g.rotation.set(-Math.PI / 2 * Math.min(1, pd.t), pd.g.rotation.y, 0);
        const sq = 1 + Math.sin(pd.t * 12) * 0.08; pd.g.scale.set(sq, 1 / sq, sq);
        if (pd.t <= 0) { pd.state = 'walk'; pd.g.rotation.set(0, pd.g.rotation.y, 0); pd.g.scale.set(1, 1, 1); if (!okSpot(pd.x, pd.z)) { const s = pick(pd.hx, pd.hz, 10); if (s) { pd.x = s.x; pd.z = s.z; } } pd.tx = pd.x; pd.tz = pd.z; }
      } else {
        // kävely kohti välietappia hubin lähellä
        const dx = pd.tx - pd.x, dz = pd.tz - pd.z, d = Math.hypot(dx, dz);
        if (d < 0.4) { pd.wait -= dt; if (pd.wait <= 0) { const s = pick(pd.hx, pd.hz, 14); if (s) { pd.tx = s.x; pd.tz = s.z; } pd.wait = 1 + Math.random() * 4; } }
        else {
          const nx = pd.x + dx / d * pd.speed * dt, nz = pd.z + dz / d * pd.speed * dt;
          if (okSpot(nx, nz)) { pd.x = nx; pd.z = nz; } else { pd.tx = pd.x; pd.tz = pd.z; pd.wait = 0.2; }
          const want = Math.atan2(dx, dz); let a = want - pd.g.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); pd.g.rotation.y += a * Math.min(1, dt * 5);
        }
        pd.y = d >= 0.4 ? Math.abs(Math.sin(H.time * 7 + pd.hx)) * 0.12 : 0;
        const sq = 1 + Math.sin(H.time * 7 + pd.hz) * 0.04; pd.g.scale.set(1 / sq, sq, 1 / sq);
        // autot tönäisevät
        for (const c of H.cars) {
          const cx = pd.x - c.pos.x, cz = pd.z - c.pos.z, cd = Math.hypot(cx, cz), sp = Math.abs(c.speed || 0);
          if (cd < 2.0 && sp > 3 && (c.y || 0) < 1.5) {
            const k = Math.min(16, 4 + sp * 0.5), n = cd || 1;
            pd.vx = cx / n * k + Math.sin(c.yaw) * sp * 0.3; pd.vz = cz / n * k + Math.cos(c.yaw) * sp * 0.3; pd.vy = 7 + sp * 0.25;
            pd.state = 'fly'; pd.hits++; say(pd, SAY[(Math.random() * SAY.length) | 0]);
            H.beep(520, 0.12, 'triangle', 0.04); setTimeout(() => H.beep(330, 0.12, 'triangle', 0.04), 120);
            break;
          }
        }
        // pelaajat: tervehtivät ja väistävät
        if (pd.state === 'walk') for (const p of H.players) {
          if (p.car != null) continue;
          const px = pd.x - p.pos.x, pz = pd.z - p.pos.z, pdist = Math.hypot(px, pz);
          if (pdist < 0.9 && pdist > 0.01) { const nx = pd.x + px / pdist * 0.05, nz = pd.z + pz / pdist * 0.05; if (okSpot(nx, nz)) { pd.x = nx; pd.z = nz; } }
          if (pdist < 3 && pd.hiT <= 0) { pd.hiT = 12; say(pd, HELLO[(Math.random() * HELLO.length) | 0], 1.4); }
        }
      }
      pd.g.position.set(pd.x, pd.y, pd.z);
    }
  });
  H.peds = { list: () => peds.map(p => ({ x: p.x, z: p.z, y: p.y, state: p.state, hits: p.hits })), count: () => peds.length };
})();
