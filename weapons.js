// weapons.js – efektit, aseet, lammas, hevosenkengät, peili, teleport (ex-v21/v22/v24)
// weapons.js (part: v21) – Hyytelösankarit 2.1: tulevaisuuden aseet, spektaakkelilentoauto, kuun kaupunkikopio.
(function () {
  const H = window.HYYTE;
  if (!H) return;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.55, metalness: o.m ?? 0.15,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1, depthWrite: o.op ? false : true,
  });
  const box = (w, h, d, m, x, y, z, p) => { const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  const cyl = (rt, rb, h, m, x, y, z, p, seg = 12) => { const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  const sphere = (r, m, x, y, z, p) => { const o = new (T().Mesh)(new (T().SphereGeometry)(r, 12, 10), m); o.position.set(x, y, z); p && p.add(o); return o; };

  // ---------- status-efektit pelaajilla ----------
  const fx = [{}, {}, {}, {}]; // per pelaaja
  const fogEls = [null, null, null, null];
  let active = false;
  let flyFX = []; // { car, gear, glow, parts, bank }
  let moonRoot = null;

  function ensureFog(i) {
    if (fogEls[i]) return fogEls[i];
    const stage = document.querySelector('.stage');
    const vp = stage?.querySelector('.vp.v' + i) || stage;
    if (!vp) return null;
    const el = document.createElement('div');
    el.className = 'v21-fog';
    el.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:40;background:rgba(180,190,210,0.55);backdrop-filter:blur(6px);opacity:0;transition:opacity .25s';
    vp.style.position = vp.style.position || 'relative';
    vp.appendChild(el);
    fogEls[i] = el;
    return el;
  }

  function setFx(i, kind, dur, extra) {
    const f = fx[i];
    // 2.2: älä jätä kääntöohjausta päälle jos efekti vaihtuu
    if (f.kind && f.kind !== kind) clearFx(i);
    f.kind = kind; f.t = dur; f.extra = extra || {};
    const p = H.players[i]; if (!p) return;
    if (kind === 'float') { p._v21float = true; p.vy = Math.max(p.vy || 0, 1.5); }
    if (kind === 'shrink') { p._v21scale = 0.45; if (p.group) p.group.scale.setScalar(0.45); }
    if (kind === 'slowmo') { p.slow = Math.max(p.slow || 0, dur); p.speedMul = Math.min(p.speedMul || 1, 0.35); }
    if (kind === 'jelly') { p._v21jelly = true; }
    if (kind === 'reverse') { p._v21rev = true; }
    if (kind === 'blind') { const el = ensureFog(i); if (el) el.style.opacity = '1'; }
    if (kind === 'bubble') {
      p._v21bubble = true; p.lock = true; p.lockHint = '🫧 Kuplassa! Odota…';
      p.vy = 0;
    }
  }

  function clearFx(i) {
    const f = fx[i], p = H.players[i];
    if (!f.kind) return;
    if (p) {
      if (f.kind === 'float') p._v21float = false;
      if (f.kind === 'shrink') { p._v21scale = 1; if (p.group) p.group.scale.setScalar(1); }
      if (f.kind === 'slowmo') { p.speedMul = 1; }
      if (f.kind === 'jelly') p._v21jelly = false;
      if (f.kind === 'reverse') p._v21rev = false;
      if (f.kind === 'blind' && fogEls[i]) fogEls[i].style.opacity = '0';
      if (f.kind === 'bubble') { p._v21bubble = false; p.lock = false; p.lockHint = null; }
    }
    f.kind = null; f.t = 0;
  }

  function nearestOther(e) {
    let best = null, bd = 1e9;
    for (const p of H.players) {
      if (p === e || p.moon !== e.moon || p.rocket) continue;
      const d = (p.pos.x - e.pos.x) ** 2 + (p.pos.z - e.pos.z) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  // ---------- aseet ----------
  H.v21Fire = function (e, r, n) {
    const V21 = ['floatgun', 'blind', 'shrink', 'bubble', 'swapgun', 'slowmo', 'jelly', 'magnet', 'hypermag', 'tornado', 'reverse'];
    if (!V21.includes(r)) return false;
    const foe = nearestOther(e);
    const hit = foe && ((foe.pos.x - e.pos.x) ** 2 + (foe.pos.z - e.pos.z) ** 2) < 140;

    if (r === 'floatgun') {
      e.cd = 2.5; H.beep(440, 0.12, 'sine', 0.05);
      if (hit) { setFx(foe.index, 'float', 10); foe.vy = 4; H.toast(foe.index, '🎈 Leijut 10 s!'); H.toast(e.index, '🎈 Kohde leijuu!'); }
      else { setFx(e.index, 'float', 10); e.vy = 4; H.toast(e.index, '🎈 Leijut 10 s!'); }
      return true;
    }
    if (r === 'blind') {
      e.cd = 3.0; H.beep(180, 0.15, 'sawtooth', 0.04);
      if (hit) { setFx(foe.index, 'blind', 6); H.toast(foe.index, '🌫️ Sumu peittää näön!'); H.toast(e.index, '🌫️ Sokeutit kohteen!'); }
      else H.toast(e.index, 'Ei kohdetta lähellä', true);
      return true;
    }
    if (r === 'shrink') {
      e.cd = 3.5; H.beep(880, 0.1, 'triangle', 0.05);
      if (hit) { setFx(foe.index, 'shrink', 8); H.toast(foe.index, '🔬 Kutistit!'); }
      else { setFx(e.index, 'shrink', 8); H.toast(e.index, '🔬 Kutistuit 8 s!'); }
      return true;
    }
    if (r === 'bubble') {
      e.cd = 4.0; H.beep(660, 0.14, 'sine', 0.05);
      if (hit) { setFx(foe.index, 'bubble', 4); H.toast(foe.index, '🫧 Jäit kuplaan!'); }
      else H.toast(e.index, 'Ei kohdetta', true);
      return true;
    }
    if (r === 'swapgun') {
      e.cd = 5.0; H.beep(520, 0.1, 'square', 0.05);
      if (hit && foe.car == null && e.car == null) {
        const ax = e.pos.x, az = e.pos.z, ay = e.pos.y;
        e.pos.set(foe.pos.x, foe.pos.y, foe.pos.z);
        foe.pos.set(ax, ay, az);
        H.toast(e.index, '🔄 Vaihdoitte paikkoja!'); H.toast(foe.index, '🔄 Paikat vaihtuivat!');
      } else H.toast(e.index, 'Tarvitset lähellä olevan jalanjalkaisen', true);
      return true;
    }
    if (r === 'slowmo') {
      e.cd = 3.2; H.beep(220, 0.2, 'triangle', 0.05);
      if (hit) { setFx(foe.index, 'slowmo', 7); H.toast(foe.index, '🐢 Hidastus!'); }
      else { setFx(e.index, 'slowmo', 5); H.toast(e.index, '🐢 Hidastit itseäsi'); }
      return true;
    }
    if (r === 'jelly') {
      e.cd = 3.0; H.beep(140, 0.15, 'sine', 0.05);
      if (hit) { setFx(foe.index, 'jelly', 8); foe.vy = 6; H.toast(foe.index, '🍮 Hyytelötila!'); }
      else { setFx(e.index, 'jelly', 8); e.vy = 6; H.toast(e.index, '🍮 Hyytelö!'); }
      return true;
    }
    if (r === 'magnet' || r === 'hypermag') {
      e.cd = 1.8; H.beep(90, 0.2, 'sawtooth', 0.06);
      const pull = (ox, oz, oy, setPos, force) => {
        const dx = e.pos.x - ox, dz = e.pos.z - oz, d2 = dx * dx + dz * dz;
        if (d2 < 400 && d2 > 0.15) {
          const d = Math.sqrt(d2), f = force / Math.max(1, d * 0.35);
          setPos(ox + (dx / d) * f, oy, oz + (dz / d) * f);
          return true;
        }
        return false;
      };
      for (const p of H.players) {
        if (p === e || p.moon !== e.moon || p.rocket) continue;
        if (p.car != null) continue;
        pull(p.pos.x, p.pos.z, p.pos.y, (x,y,z) => { p.pos.x=x; p.pos.y=y; p.pos.z=z; p.vy = (p.vy||0) + 2.2; }, 4.2);
      }
      for (const c of H.cars) {
        // ei rakennuksia — vain liikkuvat ajoneuvot (myös kuumönkijät)
        if (c.immovable || c.building) continue;
        pull(c.pos.x, c.pos.z, c.y || 0, (x,y,z) => { c.pos.x=x; c.y=y; c.pos.y=y; c.pos.z=z; c.speed *= 0.55; }, 3.6);
      }
      // rekisteröidyt irtoesineet (hevosenkengät, itemit, …)
      const mov = H.movableObjects || [];
      for (const m of mov) {
        if (!m || m.building || m.immovable) continue;
        const px = m.pos?.x ?? m.x, pz = m.pos?.z ?? m.z, py = m.pos?.y ?? m.y ?? 0;
        if (px == null) continue;
        pull(px, pz, py, (x,y,z) => {
          if (m.pos) { m.pos.x=x; m.pos.y=y; m.pos.z=z; }
          else { m.x=x; m.y=y; m.z=z; }
          if (m.mesh) m.mesh.position.set(x, y, z);
          if (m.group) m.group.position.set(x, y, z);
          if (typeof m.onPull === 'function') m.onPull(x,y,z);
        }, 3.8);
      }
      H.toast(e.index, r === 'hypermag' ? '🧲⚡ Hypermagneetti vetää kaiken!' : '🧲 Magneetti vetää!');
      return true;
    }
    if (r === 'tornado') {
      e.cd = 4.5; H.beep(90, 0.25, 'sawtooth', 0.05);
      if (hit) {
        foe.vy = 10; foe.spin = 3.5; foe.spinDir = Math.random() < 0.5 ? 1 : -1;
        foe.pos.x += n.fx * 1.2; foe.pos.z += n.fz * 1.2;
        H.toast(foe.index, '🌪️ Pyörremyrsky!'); H.toast(e.index, '🌪️ Nostit kohteen!');
      } else {
        e.vy = 8; e.spin = 2; H.toast(e.index, '🌪️ Pyörre!');
      }
      return true;
    }
    if (r === 'reverse') {
      e.cd = 3.8; H.beep(300, 0.12, 'square', 0.05);
      if (hit) { setFx(foe.index, 'reverse', 8); H.toast(foe.index, '↩️ Ohjaus käännetty!'); }
      else { setFx(e.index, 'reverse', 6); H.toast(e.index, '↩️ Oma ohjaus käännetty'); }
      return true;
    }
    return false;
  };

  // patch input for reverse controls
  function patchReverse() {
    if (H._v21revPatch) return;
    H._v21revPatch = true;
    const orig = H.input.bind(H);
    // H.input is from api which delegates to game.input — wrap game after attach
    H.onStart(() => {
      if (!H.game || H.game._v21rev) return;
      H.game._v21rev = true;
      const gi = H.game.input;
      H.game.input = function (i) {
        const inp = gi.call(H.game, i);
        const p = H.players[i];
        if (p && p._v21rev) {
          return Object.assign({}, inp, { f: -inp.f, turn: -inp.turn });
        }
        return inp;
      };
    });
  }
  patchReverse();

  // ---------- lentoauton spektaakkeli ----------
  function attachFlyFX(car) {
    if (!car || !car.fly || car._v21fx) return;
    car._v21fx = true;
    const G = T();
    const gear = new G.Group();
    for (const x of [-0.55, 0.55]) {
      const leg = box(0.08, 0.35, 0.08, M(0xadb5bd, { m: 0.6 }), x, -0.15, 0.3, gear);
      const pad = box(0.22, 0.05, 0.28, M(0x495057), x, -0.35, 0.3, gear);
    }
    car.group.add(gear);

    const glow = new G.Group();
    for (const x of [-0.4, 0.4]) {
      const thr = cyl(0.12, 0.18, 0.35, M(0x69db7c, { e: 0x37b24d, ei: 1.6, op: 0.9 }), x, 0.05, -0.85, glow, 10);
      thr.rotation.x = Math.PI / 2;
    }
    const core = sphere(0.2, M(0xffd43b, { e: 0xff922b, ei: 1.8, op: 0.85 }), 0, 0.05, -0.9, glow);
    glow.visible = false;
    car.group.add(glow);

    const parts = [];
    for (let k = 0; k < 12; k++) {
      const p = sphere(0.06 + Math.random() * 0.05, M(0x69db7c, { e: 0x37b24d, ei: 1.2, op: 0.7 }), 0, 0, 0, null);
      p.visible = false; H.scene.add(p); parts.push({ m: p, life: 0 });
    }

    flyFX.push({ car, gear, glow, parts, snd: 0, bank: 0, pitch: 0 });
  }

  function updFlyFX(dt) {
    for (const fx of flyFX) {
      const c = fx.car; if (!c || !c.group) continue;
      const flying = !!c.flying && c.y > 0.5;
      fx.gear.visible = !flying;
      fx.glow.visible = flying;
      if (flying) {
        // banking
        const turnRate = (c._lastYaw != null) ? (c.yaw - c._lastYaw) / Math.max(dt, 0.001) : 0;
        c._lastYaw = c.yaw;
        fx.bank += (Math.max(-0.45, Math.min(0.45, -turnRate * 0.35)) - fx.bank) * Math.min(1, dt * 5);
        fx.pitch += (Math.max(-0.35, Math.min(0.4, (c.vy || 0) * 0.04)) - fx.pitch) * Math.min(1, dt * 4);
        c.group.rotation.z = fx.bank;
        c.group.rotation.x = fx.pitch;
        // thruster pulse
        fx.glow.children.forEach((ch, k) => {
          const s = 0.85 + 0.3 * Math.sin(H.time * 18 + k);
          ch.scale.setScalar(s);
        });
        // particles
        for (const p of fx.parts) {
          if (p.life <= 0 && Math.random() < 0.4) {
            p.life = 0.4 + Math.random() * 0.4;
            p.m.visible = true;
            p.m.position.set(c.pos.x + (Math.random() - 0.5) * 0.6, c.y + 0.1, c.pos.z + (Math.random() - 0.5) * 0.6);
            p.vx = (Math.random() - 0.5) * 2; p.vy = -1 - Math.random() * 2; p.vz = (Math.random() - 0.5) * 2;
          }
          if (p.life > 0) {
            p.life -= dt;
            p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
            p.m.scale.setScalar(Math.max(0.1, p.life));
            if (p.life <= 0) p.m.visible = false;
          }
        }
        // boost on run
        if (c.occupied != null) {
          const drv = H.players[c.occupied];
          const inp = H.input(c.occupied) || {};
          if (inp.run && (c._boostCd || 0) <= 0) {
            c.nitro = Math.max(c.nitro || 0, 1.8);
            c.boostMul = 1.8;
            c._boostCd = 4;
            H.beep(980, 0.08, 'sawtooth', 0.04);
            if (drv) H.toast(drv.index, '🚀 Boost!');
          }
          c._boostCd = Math.max(0, (c._boostCd || 0) - dt);
        }
        // sound
        fx.snd -= dt;
        if (fx.snd <= 0) { fx.snd = 0.35; H.beep(90 + Math.random() * 40, 0.08, 'sawtooth', 0.012); }
      } else {
        c.group.rotation.z *= Math.exp(-dt * 6);
        c.group.rotation.x *= Math.exp(-dt * 6);
        fx.parts.forEach(p => { p.life = 0; p.m.visible = false; });
      }
      // ground clamp safety (belt + suspenders)
      if (c.fly) {
        const gnd = H.game?.groundHeight?.(c.pos.x, c.pos.z) ?? 0;
        if (c.y < gnd) { c.y = gnd; if (c.vy < 0) c.vy = 0; c.pos.y = c.y; }
      }
    }
  }

  // ---------- kuun kaupunkikopio (shared layout + theme) ----------
  function layoutDefs() {
    // shared relative layout (earth origin 0,0) — reused on moon with offset
    return [
      { kind: 'dome', x: 0, z: 0, r: 8, h: 5 },
      { kind: 'shop', x: -18, z: 8, w: 7, d: 5, h: 3.5, label: 'KAUPPA' },
      { kind: 'shop', x: 18, z: 8, w: 7, d: 5, h: 3.5, label: 'KAHVILA' },
      { kind: 'pad', x: -10, z: -14, label: 'TYÖ' },
      { kind: 'pad', x: 10, z: -14, label: 'TEHTÄVÄ' },
      { kind: 'park', x: 0, z: 18, r: 6 },
      { kind: 'ramp', x: 22, z: -8 },
      { kind: 'rover', x: -22, z: -6 },
      { kind: 'tower', x: 0, z: -22, h: 9 },
      { kind: 'dome', x: -28, z: 16, r: 4.5, h: 3.5 },
      { kind: 'dome', x: 28, z: 16, r: 4.5, h: 3.5 },
    ];
  }

  function themeMats(theme) {
    if (theme === 'moon') {
      return {
        wall: M(0xc5ccd6, { m: 0.35, r: 0.45, e: 0x748ffc, ei: 0.15 }),
        roof: M(0x868e96, { m: 0.5, e: 0xa5d8ff, ei: 0.25 }),
        glow: M(0x74c0fc, { e: 0x4dabf7, ei: 1.1 }),
        ground: M(0xadb5bd, { r: 0.9 }),
        accent: M(0xffd43b, { e: 0xfab005, ei: 0.7 }),
        dome: M(0xa5d8ff, { m: 0.2, r: 0.2, e: 0x74c0fc, ei: 0.35, op: 0.55 }),
      };
    }
    return {
      wall: M(0xe9ecef, { r: 0.7 }),
      roof: M(0xe03131, { r: 0.6 }),
      glow: M(0xffd43b, { e: 0xfab005, ei: 0.4 }),
      ground: M(0x94d82d, { r: 0.9 }),
      accent: M(0x228be6, { e: 0x1c7ed6, ei: 0.3 }),
      dome: M(0xa5d8ff, { op: 0.45, e: 0x74c0fc, ei: 0.2 }),
    };
  }

  function buildFromLayout(ox, oz, theme, yBase) {
    const G = T();
    const mats = themeMats(theme);
    const root = new G.Group();
    root.name = 'v21-city-' + theme;
    const defs = layoutDefs();
    const obst = [];

    for (const d of defs) {
      const x = d.x, z = d.z;
      if (d.kind === 'dome') {
        const dome = new G.Mesh(new G.SphereGeometry(d.r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.dome);
        dome.position.set(x, yBase + 0.05, z); root.add(dome);
        const ring = cyl(d.r * 1.02, d.r * 1.02, 0.2, mats.accent, x, yBase + 0.1, z, root, 24);
        obst.push({ x: ox + x, z: oz + z, r: d.r * 0.85, h: d.h * 0.5 });
      } else if (d.kind === 'shop') {
        const g = new G.Group();
        box(d.w, d.h, d.d, mats.wall, 0, d.h / 2, 0, g);
        box(d.w + 0.4, 0.25, d.d + 0.4, mats.roof, 0, d.h + 0.1, 0, g);
        const lab = H.makeLabel((theme === 'moon' ? '🌙 ' : '') + d.label, { bg: theme === 'moon' ? '#364fc7' : '#c92a2a', scale: 4 });
        lab.position.set(0, d.h + 1.2, 0); g.add(lab);
        g.position.set(x, yBase, z); root.add(g);
        obst.push({ x: ox + x, z: oz + z, r: Math.max(d.w, d.d) * 0.45, h: d.h });
      } else if (d.kind === 'pad') {
        cyl(1.5, 1.5, 0.12, mats.glow, x, yBase + 0.08, z, root, 24);
        const lab = H.makeLabel(d.label, { scale: 3.2, size: 40 }); lab.position.set(x, yBase + 2.2, z); root.add(lab);
      } else if (d.kind === 'park') {
        cyl(d.r, d.r, 0.08, mats.ground, x, yBase + 0.04, z, root, 28);
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          const tx = x + Math.cos(a) * (d.r * 0.55), tz = z + Math.sin(a) * (d.r * 0.55);
          if (theme === 'moon') {
            cyl(0.15, 0.2, 1.6, mats.accent, tx, yBase + 0.8, tz, root, 8);
            sphere(0.45, mats.glow, tx, yBase + 1.7, tz, root);
          } else {
            cyl(0.12, 0.18, 1.4, M(0x5c3a21), tx, yBase + 0.7, tz, root, 8);
            sphere(0.55, M(0x2f9e44), tx, yBase + 1.6, tz, root);
          }
        }
      } else if (d.kind === 'ramp') {
        const ramp = box(4, 0.3, 8, mats.wall, 0, 0, 0, null);
        ramp.rotation.x = -0.35; ramp.position.set(x, yBase + 1.2, z);
        root.add(ramp);
        box(4.2, 0.2, 2, mats.accent, x, yBase + 0.1, z + 4, root);
      } else if (d.kind === 'rover') {
        const rv = new G.Group();
        box(2.2, 0.7, 1.4, mats.wall, 0, 0.55, 0, rv);
        box(1.2, 0.5, 1.2, mats.glow, 0, 1.15, 0, rv);
        for (const wx of [-0.8, 0.8]) for (const wz of [-0.7, 0.7]) {
          const wh = cyl(0.28, 0.28, 0.18, M(0x343a40, { m: 0.5 }), 0, 0, 0, rv, 10);
          wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.28, wz);
        }
        if (theme === 'moon') {
          const dish = cyl(0.5, 0.05, 0.08, mats.accent, 0, 1.6, -0.3, rv, 12);
          dish.rotation.x = 0.4;
        }
        rv.position.set(x, yBase, z); root.add(rv);
        obst.push({ x: ox + x, z: oz + z, r: 1.4, h: 1.2 });
      } else if (d.kind === 'tower') {
        box(1.6, d.h, 1.6, mats.wall, x, yBase + d.h / 2, z, root);
        const beacon = sphere(0.35, mats.glow, x, yBase + d.h + 0.3, z, root);
        beacon.userData.beacon = true;
        obst.push({ x: ox + x, z: oz + z, r: 1.1, h: d.h });
      }
    }

    // floor plate
    const floor = box(70, 0.15, 55, theme === 'moon' ? M(0x868e96, { r: 0.95, e: 0x495057, ei: 0.08 }) : M(0xd8f5a2, { r: 0.95 }), 0, yBase + 0.02, 0, root);
    floor.receiveShadow = true;

    root.position.set(ox, 0, oz);
    H.scene.add(root);
    for (const o of obst) H.addObstacle(o.x, o.z, o.r, o.h);
    return root;
  }

  function buildMoonCity() {
    const MX = H.moon?.center?.x ?? 0, MZ = H.moon?.center?.z ?? 1600;
    // place replica east of moon base
    const y0 = (H.moonH?.(MX + 40, MZ + 10) ?? 1.2);
    moonRoot = buildFromLayout(MX + 40, MZ + 10, 'moon', Math.max(0.05, y0 - 1.15));
    const sign = H.makeLabel('🌙 KUUKAUPUNKI 2.1', { bg: '#364fc7', scale: 8 });
    sign.position.set(MX + 40, y0 + 8, MZ + 10);
    H.scene.add(sign);
  }

  // ---------- lifecycle ----------
  H.onStart(() => {
    active = true;
    fx.forEach((_, i) => { fx[i] = {}; if (fogEls[i]) fogEls[i].style.opacity = '0'; });
    flyFX = [];
    // attach FX to flying cars
    setTimeout(() => {
      (H.cars || []).forEach(attachFlyFX);
      try { buildMoonCity(); } catch (e) { console.warn('moon city', e); }
    }, 120);
  });
  H.onStop(() => {
    active = false;
    flyFX.forEach(f => f.parts.forEach(p => p.m.parent && p.m.parent.remove(p.m)));
    flyFX = [];
    fogEls.forEach((el, i) => { if (el) { el.remove(); fogEls[i] = null; } });
    moonRoot = null;
  });

  H.onUpdate(dt => {
    if (!active) return;
    // status ticks
    for (const p of H.players) {
      const i = p.index, f = fx[i];
      if (!f.kind) continue;
      f.t -= dt;
      if (f.kind === 'float') {
        p._v21float = true;
        if (p.pos.y < 4) p.vy = Math.max(p.vy, 2.5);
        else p.vy = Math.max(-0.5, Math.min(1.5, p.vy * 0.9));
        p.grounded = false;
      }
      if (f.kind === 'jelly') {
        p.vy += Math.sin(H.time * 8 + i) * 12 * dt;
        if (p.group) p.group.scale.y = 0.7 + 0.35 * Math.sin(H.time * 6);
      }
      if (f.kind === 'bubble') {
        p.pos.y = Math.min(4, p.pos.y + dt * 0.8);
        p.vy = 0; p.lock = true;
      }
      if (f.kind === 'shrink' && p.group) p.group.scale.setScalar(0.45);
      if (p._v21rev && f.kind !== 'reverse') { p._v21rev = false; }
      if (f.t <= 0) {
        if (f.kind === 'jelly' && p.group) p.group.scale.set(1, 1, 1);
        clearFx(i);
        H.toast(i, 'Efekti loppui');
      }
    }
    updFlyFX(dt);
    // beacon spin
    if (moonRoot) moonRoot.traverse(o => {
      if (o.userData && o.userData.beacon) { o.rotation.y += dt * 2; o.position.y += Math.sin(H.time * 3) * 0.002; }
    });
  });

  H.v21 = {
    fx: () => fx.map(f => ({ ...f })),
    setFx, clearFx,
    flyCount: () => flyFX.length,
    moonCity: () => moonRoot,
    weapons: ['floatgun', 'blind', 'shrink', 'bubble', 'swapgun', 'slowmo', 'jelly', 'magnet', 'tornado', 'reverse'],
  };
})();

// weapons.js (part: v22) – Hyytelösankarit 2.2: lammasase, hevosenkengät, nimet, köysikiipeilyteline, onni.
(function () {
  const H = window.HYYTE;
  if (!H) return;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.55, metalness: o.m ?? 0.2,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1, depthWrite: o.op ? false : true,
  });
  const box = (w, h, d, m, x, y, z, p) => { const o = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };
  const cyl = (rt, rb, h, m, x, y, z, p, seg = 10) => { const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; p && p.add(o); return o; };

  let active = false;
  const sheepAmmo = Array(12).fill(20);
  const SHEEP_MAX = 20;
  const sheepProj = []; // { mesh, x,y,z, vx,vy,vz, life, owner, bounced }
  const shoes = []; // { mesh, x, z, taken }
  const shoeBag = Array(12).fill(0);
  const luckT = Array(12).fill(0);
  const nameTags = [];
  let climb = null; // { root, poleX, poleZ, H, ropes:[{x1,z1,x2,z2}], color }
  const climbing = Array(12).fill(false);

  const FARM = () => H.jobs2?.FARM || { x: 108, z: 84, pad: { x: 104, z: 92 }, pen: { x0: 116, x1: 130, z0: 96, z1: 108 } };

  function playerName(i) {
    return (H.stats?.names?.() || [])[i] || ('P' + (i + 1));
  }

  function makeSheepMesh() {
    const g = new (T().Group)();
    box(0.55, 0.45, 0.7, M(0xf8f9fa), 0, 0.35, 0, g);
    box(0.28, 0.28, 0.28, M(0x868e96), 0, 0.42, 0.42, g);
    box(0.08, 0.18, 0.08, M(0x495057), -0.18, 0.1, 0.2, g);
    box(0.08, 0.18, 0.08, M(0x495057), 0.18, 0.1, 0.2, g);
    box(0.08, 0.18, 0.08, M(0x495057), -0.18, 0.1, -0.2, g);
    box(0.08, 0.18, 0.08, M(0x495057), 0.18, 0.1, -0.2, g);
    return g;
  }

  function fireSheep(e, n) {
    const i = e.index;
    if (sheepAmmo[i] <= 0) {
      H.toast(i, 'Ei lampaita! Hae täydennys Lammasfarmilta 🐑', true);
      H.beep(180, 0.15, 'sawtooth', 0.04);
      return true;
    }
    sheepAmmo[i]--;
    e.cd = 0.55;
    const g = makeSheepMesh();
    H.scene.add(g);
    const x = e.pos.x + n.fx * 1.2, y = e.pos.y + 0.6, z = e.pos.z + n.fz * 1.2;
    g.position.set(x, y, z);
    sheepProj.push({
      mesh: g, x, y, z,
      vx: n.fx * 10, vy: 7.2, vz: n.fz * 10,
      life: 6, owner: i, bounced: 0, yaw: Math.atan2(n.fx, n.fz),
      ox: x, oz: z, dist: 0,
    });
    H.toast(i, `🐑 Lammasase! (${sheepAmmo[i]}/${SHEEP_MAX})`);
    H.beep(420, 0.08, 'square', 0.05);
    return true;
  }

  function burstSheep(p) {
    // jelly/wool burst particles
    const G = T();
    for (let k = 0; k < 14; k++) {
      const col = k % 2 ? 0xff6b9d : 0xf8f9fa;
      const s = new G.Mesh(new G.SphereGeometry(0.1 + Math.random() * 0.12, 6, 6), M(col, { e: col, ei: 0.4, op: 0.9 }));
      s.position.set(p.x, p.y + 0.4, p.z);
      H.scene.add(s);
      const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 5;
      sheepProj.push({
        mesh: s, x: p.x, y: p.y + 0.4, z: p.z,
        vx: Math.cos(a) * sp, vy: 4 + Math.random() * 4, vz: Math.sin(a) * sp,
        life: 0.7, owner: -1, particle: true,
      });
    }
    H.beep(180, 0.2, 'triangle', 0.06);
    setTimeout(() => H.beep(320, 0.15, 'sine', 0.05), 80);
  }

  function updSheep(dt) {
    for (let k = sheepProj.length - 1; k >= 0; k--) {
      const p = sheepProj[k];
      p.life -= dt;
      p.vy -= (p.particle ? 14 : 16) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (!p.particle) {
        p.yaw += dt * 4;
        // bounce on ground
        p.dist = (p.dist || 0) + Math.hypot(p.vx, p.vz) * dt;
        if (p.y < 0.35) {
          p.y = 0.35; p.vy = Math.abs(p.vy) * 0.78 + 2.4; // 2.3: korkeampi pomppu
          p.vx *= 0.94; p.vz *= 0.94;
          p.bounced++;
          H.beep(260 + p.bounced * 40, 0.05, 'sine', 0.03);
        }
        // hit players (not owner) → pop heti
        for (const pl of H.players) {
          if (pl.index === p.owner || pl.moon || pl.rocket) continue;
          if (Math.hypot(pl.pos.x - p.x, pl.pos.z - p.z) < 1.35 && Math.abs(pl.pos.y - p.y) < 1.7) {
            pl.vy = Math.max(pl.vy || 0, 9);
            pl.spin = 1.2; pl.spinDir = Math.random() < 0.5 ? 1 : -1;
            H.toast(pl.index, '🐑 Poks! Villaa!');
            H.toast(p.owner, '🐑 Osuma!');
            burstSheep(p);
            p.life = 0;
          }
        }
        // 2.3: poksahda ~30 m jälkeen tai timeout
        if ((p.dist || 0) >= 30 || p.life <= 0.05) {
          if (p.life > 0) burstSheep(p);
          p.life = 0;
        }
      } else if (p.y < 0.05) p.life = 0;
      if (p.mesh) {
        p.mesh.position.set(p.x, Math.max(0.05, p.y), p.z);
        if (!p.particle) p.mesh.rotation.y = p.yaw;
      }
      if (p.life <= 0) {
        if (p.mesh) { H.scene.remove(p.mesh); p.mesh.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); }); }
        sheepProj.splice(k, 1);
      }
    }
  }

  // ---------- ammo refill at farm ----------
  function nearFarm(p) {
    const F = FARM();
    const pads = [F.pad, { x: F.x, z: F.z }, { x: (F.pen.x0 + F.pen.x1) / 2, z: (F.pen.z0 + F.pen.z1) / 2 }];
    return pads.some(q => Math.hypot(p.pos.x - q.x, p.pos.z - q.z) < 3.5);
  }

  // ---------- horseshoes ----------
  function makeShoe() {
    const g = new (T().Group)();
    const m = M(0xadb5bd, { m: 0.7, r: 0.35, e: 0x868e96, ei: 0.2 });
    // U-shape from boxes
    box(0.35, 0.06, 0.1, m, 0, 0.05, 0.12, g);
    box(0.1, 0.06, 0.35, m, -0.15, 0.05, 0, g);
    box(0.1, 0.06, 0.35, m, 0.15, 0.05, 0, g);
    return g;
  }
  function scatterShoes() {
    shoes.forEach(s => { if (s.mesh) H.removeObject?.(s.mesh); });
    shoes.length = 0;
    const spots = [
      [12, 40], [-40, 20], [50, -30], [-70, 60], [30, 90], [-20, -50],
      [80, 40], [-90, -20], [0, 70], [60, 110], [-50, 100], [100, -60],
      [-110, 30], [20, -90], [-30, 130],
    ];
    for (const [x, z] of spots) {
      const g = makeShoe();
      H.addObject(g, x, 0.02, z);
      g.rotation.y = Math.random() * 6;
      shoes.push({ mesh: g, x, z, taken: false });
    }
  }
  function throwShoes(i) {
    const p = H.players[i];
    if (!p || shoeBag[i] < 4) {
      H.toast(i, `Hevosenkenkiä ${shoeBag[i]}/4 – kerää 4 ja heitä (E)`, true);
      return;
    }
    shoeBag[i] = 0;
    luckT[i] = 60;
    H.toast(i, '🍀 Heitit hevosenkengät olan yli – ONNI 60 s!');
    H.beep(784, 0.12, 'triangle', 0.06);
    setTimeout(() => H.beep(988, 0.15, 'triangle', 0.06), 100);
    // visual toss behind
    const d = H.game?.dirVectors?.(p.yaw) || { fx: 0, fz: 1, rx: 1, rz: 0 };
    for (let k = 0; k < 4; k++) {
      const g = makeShoe();
      H.scene.add(g);
      const bx = p.pos.x - d.fx * (1 + k * 0.3) + d.rx * (k - 1.5) * 0.3;
      const bz = p.pos.z - d.fz * (1 + k * 0.3) + d.rz * (k - 1.5) * 0.3;
      sheepProj.push({
        mesh: g, x: bx, y: p.pos.y + 1.2, z: bz,
        vx: -d.fx * 2, vy: 3, vz: -d.fz * 2,
        life: 1.2, owner: -1, particle: true,
      });
    }
  }
  function luckMul(i) { return luckT[i] > 0 ? 1.75 : 1; }

  // wrap money.add for luck bonus on coin pickups / generic earns
  function patchMoney() {
    if (!H.money || H.money._v22) return;
    H.money._v22 = true;
    const orig = H.money.add.bind(H.money);
    H.money.add = function (i, n, reason) {
      if (luckT[i] > 0 && n > 0) {
        const bonus = Math.max(1, Math.round(n * 0.75));
        return orig(i, n + bonus, reason ? reason + ' 🍀+' + bonus : '🍀 Onni +' + (n + bonus));
      }
      return orig(i, n, reason);
    };
  }

  // ---------- name tags + HP (selvästi pään yläpuolella) ----------
  function makeNameHpSprite(nm, hp, lucky) {
    const T = H.THREE;
    const c = document.createElement('canvas');
    const w = 480, h = 160;
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.clearRect(0, 0, w, h);
    // nimi
    g.fillStyle = lucky ? '#2b8a3e' : '#102430';
    roundish(g, 40, 8, w - 80, 70, 22); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#fff6e8'; g.stroke();
    g.fillStyle = '#fff'; g.font = '900 48px system-ui,sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(nm, w / 2, 44);
    // HP-palkki
    const barX = 70, barY = 95, barW = w - 140, barH = 36;
    g.fillStyle = '#212529'; roundish(g, barX, barY, barW, barH, 12); g.fill();
    const pct = Math.max(0, Math.min(1, (hp == null ? 100 : hp) / 100));
    g.fillStyle = pct < 0.35 ? '#fa5252' : pct < 0.6 ? '#fcc419' : '#40c057';
    roundish(g, barX + 3, barY + 3, Math.max(8, (barW - 6) * pct), barH - 6, 10); g.fill();
    g.fillStyle = '#fff'; g.font = '800 26px system-ui'; g.fillText(Math.round(hp == null ? 100 : hp) + '/100', w / 2, barY + barH / 2 + 1);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
    s.scale.set(2.8, 2.8 * h / w, 1);
    return s;
  }
  function roundish(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function ensureNames() {
    nameTags.forEach(t => { if (t.mesh) H.scene.remove(t.mesh); });
    nameTags.length = 0;
    for (const p of H.players) {
      const lab = makeNameHpSprite(playerName(p.index), p.hp, false);
      H.scene.add(lab);
      nameTags.push({ i: p.index, mesh: lab, _nm: '', _hp: -1 });
    }
  }

  // ---------- rope climbing frame (photo: blue ropes, grey pole, red rubber, star guy-lines) ----------
  function ropeColor() {
    try {
      const fromSetup = H.game?._setups?.[0]?.ropeColor;
      if (fromSetup) return fromSetup;
      return localStorage.getItem('hyyte-rope-color') || '#1c7ed6';
    } catch { return '#1c7ed6'; }
  }
  function hexToNum(h) {
    if (typeof h === 'number') return h;
    return parseInt(String(h).replace('#', ''), 16) || 0x1c7ed6;
  }
  function buildClimb() {
    if (climb?.root) { H.scene.remove(climb.root); }
    const col = hexToNum(ropeColor());
    const G = T();
    const root = new G.Group();
    const CX = 14, CZ = 108; // kikkailualueen laidalla (punainen kumialusta lähellä)
    const Hgt = 7.2;
    // red rubber ground
    const rubber = new G.Mesh(new G.CircleGeometry(7.5, 36), M(0xc92a2a, { r: 0.92 }));
    rubber.rotation.x = -Math.PI / 2; rubber.position.y = 0.03; root.add(rubber);
    // grey steel pole
    const pole = cyl(0.12, 0.14, Hgt, M(0xadb5bd, { m: 0.75, r: 0.28 }), 0, Hgt / 2, 0, root, 12);
    const cap = cyl(0.16, 0.16, 0.12, M(0x868e96, { m: 0.8 }), 0, Hgt + 0.05, 0, root, 10);
    // guy ropes + net cone (6–8 anchors)
    const N = 7;
    const ropes = [];
    const ropeMat = M(col, { r: 0.55, e: col, ei: 0.15 });
    const clampMat = M(0x495057, { m: 0.6, r: 0.4 });
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2 - Math.PI / 2;
      const R = 6.2;
      const ax = Math.cos(a) * R, az = Math.sin(a) * R;
      // main guy from top to ground
      const len = Math.hypot(ax, Hgt, az);
      const guy = cyl(0.035, 0.035, len, ropeMat, 0, 0, 0, root, 6);
      guy.position.set(ax / 2, Hgt / 2, az / 2);
      try { guy.quaternion.setFromUnitVectors(new G.Vector3(0, 1, 0), new G.Vector3(ax, -Hgt, az).normalize()); } catch(e) {}
      // ground anchor
      box(0.25, 0.12, 0.25, clampMat, ax, 0.06, az, root);
      ropes.push({ x1: 0, y1: Hgt, z1: 0, x2: ax, y2: 0, z2: az });
      // cross ropes (net) at mid heights
      for (let ring = 1; ring <= 3; ring++) {
        const t = ring / 4;
        const y = Hgt * (1 - t);
        const rr = R * t;
        const a2 = ((k + 1) / N) * Math.PI * 2 - Math.PI / 2;
        const xA = Math.cos(a) * rr, zA = Math.sin(a) * rr;
        const xB = Math.cos(a2) * rr, zB = Math.sin(a2) * rr;
        const L = Math.hypot(xB - xA, zB - zA) || 0.1;
        const seg = cyl(0.028, 0.028, L, ropeMat, 0, 0, 0, root, 5);
        seg.position.set((xA + xB) / 2, y, (zA + zB) / 2);
        try { const d=new G.Vector3(xB-xA,0,zB-zA); if(d.length()>1e-4) seg.quaternion.setFromUnitVectors(new G.Vector3(0,1,0), d.normalize()); } catch(e) {}
        // junction clamp
        box(0.1, 0.1, 0.1, clampMat, xA, y, zA, root);
        ropes.push({ x1: xA, y1: y, z1: zA, x2: xB, y2: y, z2: zB });
        // radial mid rope already covered by guy; add short rung toward pole
        const L2 = Math.hypot(xA, zA) || 0.1;
        const rad = cyl(0.022, 0.022, L2 * 0.35, ropeMat, 0, 0, 0, root, 5);
        const ix = xA * 0.82, iz = zA * 0.82;
        rad.position.set((xA + ix) / 2, y, (zA + iz) / 2);
        try { const d=new G.Vector3(ix-xA,0,iz-zA); if(d.length()>1e-4) rad.quaternion.setFromUnitVectors(new G.Vector3(0,1,0), d.normalize()); } catch(e) {}
      }
    }
    const label = H.makeLabel('🪢 Köysikiipeily', { scale: 3.2, size: 42, bg: '#1c3d5a' });
    label.position.set(0, Hgt + 1.2, 0); root.add(label);
    root.position.set(CX, 0, CZ);
    H.scene.add(root);
    // soft obstacle so cars don't clip through pole
    H.addObstacle(CX, CZ, 0.45, Hgt);
    climb = { root, poleX: CX, poleZ: CZ, H: Hgt, ropes, color: col, R: 6.2 };
  }

  function nearRope(p) {
    if (!climb) return null;
    const dx = p.pos.x - climb.poleX, dz = p.pos.z - climb.poleZ;
    const dist = Math.hypot(dx, dz);
    if (dist < climb.R + 0.6 && dist > 0.2) {
      // height along cone
      const maxY = climb.H * (1 - dist / climb.R);
      return { dist, maxY: Math.max(0.4, maxY), onCone: true };
    }
    if (dist <= 0.55) return { dist, maxY: climb.H, onCone: false };
    return null;
  }

  function updClimb(dt) {
    if (!climb) return;
    for (const p of H.players) {
      if (p.car != null || p.rocket || p.moon || p.lock) { climbing[p.index] = false; continue; }
      const nr = nearRope(p);
      const inp = H.input(p.index) || {};
      if (nr && (climbing[p.index] || ((inp.jump || inp.f > 0.2) && p.pos.y < nr.maxY + 0.8 && Math.hypot(p.pos.x - climb.poleX, p.pos.z - climb.poleZ) < climb.R + 0.5))) {
        climbing[p.index] = true;
        p._v22climb = true;
        // stick to cone surface (ajetaan myöhään – grounded+vy estää putoamisen)
        const dx = p.pos.x - climb.poleX, dz = p.pos.z - climb.poleZ;
        let dist = Math.hypot(dx, dz) || 0.01;
        if (inp.f > 0 || inp.jump) p.pos.y = Math.min(climb.H - 0.2, p.pos.y + 3.2 * dt);
        if (inp.f < 0) p.pos.y = Math.max(0, p.pos.y - 3.5 * dt);
        if (inp.turn) {
          const ang = Math.atan2(dx, dz) + inp.turn * 1.6 * dt;
          const targetR = Math.max(0.25, climb.R * (1 - p.pos.y / climb.H));
          p.pos.x = climb.poleX + Math.sin(ang) * targetR;
          p.pos.z = climb.poleZ + Math.cos(ang) * targetR;
        } else {
          const targetR = Math.max(0.25, climb.R * (1 - p.pos.y / climb.H));
          p.pos.x = climb.poleX + (dx / dist) * targetR;
          p.pos.z = climb.poleZ + (dz / dist) * targetR;
        }
        p.vy = 0;
        p.speed = 0;
        p.grounded = true; // älä pudota köydestä
        H.hud(p.index, '🪢 Kiipeät köysissä · ↑/hyppy = ylös · ↓ = alas · ←→ = kierros', 'climb');
        if (p.pos.y < 0.35 && !inp.jump && inp.f <= 0) { climbing[p.index] = false; p._v22climb = false; }
      } else {
        if (climbing[p.index]) H.hud(p.index, '', 'climb');
        climbing[p.index] = false; p._v22climb = false;
      }
    }
  }

  // ---------- fire hook ----------
  const prevFire = H.v21Fire;
  H.v21Fire = function (e, r, n) {
    if (r === 'sheepgun') return fireSheep(e, n);
    return prevFire ? prevFire(e, r, n) : false;
  };

  H.onStart(() => {
    active = !H.challenge;
    for (let i = 0; i < 12; i++) { sheepAmmo[i] = SHEEP_MAX; shoeBag[i] = 0; luckT[i] = 0; climbing[i] = false; }
    sheepProj.length = 0;
    if (!active) return;
    patchMoney();
    scatterShoes();
    buildClimb();
    ensureNames();
    // store setups ref if available
    try { H.game._setups = H.game._setups; } catch {}
  });
  H.onStop(() => {
    active = false;
    sheepProj.forEach(p => { if (p.mesh) H.scene?.remove(p.mesh); });
    sheepProj.length = 0;
    if (climb?.root) H.scene?.remove(climb.root);
    climb = null;
    nameTags.forEach(t => H.scene?.remove(t.mesh));
    nameTags.length = 0;
  });

  const throwEdge = [false, false, false, false];
  H.onUpdate(dt => {
    if (!active) return;
    try {
    updSheep(dt);
    updClimb(dt);
    // names + HP follow heads — selvästi pään/kypärän yläpuolella (skaala 1.35)
    for (const t of nameTags) {
      const p = H.players[t.i];
      if (!p || !t.mesh) continue;
      const nm = playerName(t.i) + (luckT[t.i] > 0 ? ' 🍀' : '');
      const hp = Math.round(p.hp || 0);
      if (t._nm !== nm || t._hp !== hp) {
        H.scene.remove(t.mesh);
        t.mesh = makeNameHpSprite(nm, hp, luckT[t.i] > 0);
        H.scene.add(t.mesh);
        t._nm = nm; t._hp = hp;
      }
      // pään yläpuoli: perus 1.35*1.55 ≈ 2.1 + tilaa kypärälle/skaalalle → 3.55
      const sc = (p.group && p.group.scale && p.group.scale.y) || 1.35;
      const yOff = 2.55 * sc + 0.35;
      t.mesh.position.set(p.pos.x, p.pos.y + yOff, p.pos.z);
      t.mesh.visible = !p.rocket && p.car == null;
    }
    for (const p of H.players) {
      const i = p.index;
      if (luckT[i] > 0) {
        luckT[i] -= dt;
        if (luckT[i] <= 0) { luckT[i] = 0; H.toast(i, 'Onni loppui'); }
        else H.hud(i, `🍀 Onni ${Math.ceil(luckT[i])} s · tipit & kolikot ×1.75`, 'luck');
      } else H.hud(i, '', 'luck');

      // pick horseshoes
      if (p.car == null && !p.rocket) {
        for (const s of shoes) {
          if (s.taken) continue;
          if (Math.hypot(p.pos.x - s.x, p.pos.z - s.z) < 1.4) {
            s.taken = true; if (s.mesh) s.mesh.visible = false;
            shoeBag[i] = Math.min(4, shoeBag[i] + 1);
            H.toast(i, `🧲 Hevosenkenkä ${shoeBag[i]}/4`);
            H.beep(700, 0.08, 'triangle', 0.04);
            if (shoeBag[i] >= 4) H.toast(i, '4 kenkää! Paina E heittääksesi olan yli 🍀');
          }
        }
      }
      // throw on interact when bag full (and not near car/farm interactables competing)
      const inp = H.input(i) || {};
      const press = !!inp.interact;
      if (press && !throwEdge[i] && shoeBag[i] >= 4 && p.car == null && !nearFarm(p) && !climbing[i]) {
        // only if not entering car
        const nearCar = H.game?.cars?.some?.(c => c.occupied == null && Math.hypot(c.pos.x - p.pos.x, c.pos.z - p.pos.z) < 2.2);
        if (!nearCar) throwShoes(i);
      }
      throwEdge[i] = press;

      // refill sheep ammo at farm
      if (nearFarm(p) && sheepAmmo[i] < SHEEP_MAX) {
        H.hud(i, `🐑 Lammasfarmi · E = täydennä lammasase (${sheepAmmo[i]}/${SHEEP_MAX})`, 'sheepammo');
        if (H.pressed(i, 'interact')) {
          sheepAmmo[i] = SHEEP_MAX;
          H.toast(i, `🐑 Lammasase täynnä (${SHEEP_MAX}/${SHEEP_MAX})!`);
          H.beep(880, 0.1, 'triangle', 0.05);
        }
      } else H.hud(i, '', 'sheepammo');

      if (sheepAmmo[i] < SHEEP_MAX && p.weapon === 'sheepgun') {
        H.hud(i, `🐑 Lammasase ${sheepAmmo[i]}/${SHEEP_MAX}`, 'sheepammo2');
      } else H.hud(i, '', 'sheepammo2');
    }
    } catch (err) { console.error('v22 update', err && err.message, err && err.stack); }
  });

  function refillAtFarm(i) {
    const p = H.players[i];
    if (!p || !nearFarm(p)) return false;
    sheepAmmo[i] = SHEEP_MAX;
    return true;
  }

  H.v22 = {
    sheepAmmo: () => sheepAmmo.slice(),
    setAmmo: (i, n) => { sheepAmmo[i] = n; },
    sheepMax: () => SHEEP_MAX,
    refillAtFarm,
    nearFarm: i => nearFarm(H.players[i]),
    shoes: () => shoes.map(s => ({ x: s.x, z: s.z, taken: s.taken })),
    shoeBag: () => shoeBag.slice(),
    setShoeBag: (i, n) => { shoeBag[i] = n; },
    luckT: () => luckT.slice(),
    setLuck: (i, sec) => { luckT[i] = Math.max(0, sec); },
    _luckRef: luckT,
    luckMul,
    climb: () => climb,
    climbing: () => climbing.slice(),
    throwShoes,
    rebuildClimb: buildClimb,
    playerName,
    forceClimb(i, y) {
      const p = H.players[i]; if (!p || !climb) return false;
      climbing[i] = true; p._v22climb = true;
      const targetR = Math.max(0.25, climb.R * (1 - y / climb.H));
      p.pos.set(climb.poleX + targetR, y, climb.poleZ);
      p.vy = 0; p.grounded = true;
      return true;
    },
  };
})();

// weapons.js (part: mirror/teleport/new weapons from v24)
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

  // ---------- peili (RTT) + laser-heijastus ----------
  const mirrorRT = Object.create(null); // per player
  function setupMirror(p) {
    if (mirrorRT[p.index]) return mirrorRT[p.index];
    const G = T();
    const rt = new G.WebGLRenderTarget(256, 256, { samples: 0 });
    const cam = new G.PerspectiveCamera(50, 1, 0.2, 80);
    const mat = new G.MeshStandardMaterial({
      map: rt.texture, metalness: 0.85, roughness: 0.08,
      emissive: 0xa5d8ff, emissiveIntensity: 0.15, side: 2,
    });
    mirrorRT[p.index] = { rt, cam, mat, cooldown: 0 };
    return mirrorRT[p.index];
  }

  function updateMirrors(dt) {
    const g = H.game; if (!g || !H.scene) return;
    const renderer = g.renderer; if (!renderer) return;
    for (const p of H.players) {
      if (p.weapon !== 'mirror' || !p.weaponGroup) continue;
      const m = setupMirror(p);
      m.cooldown -= dt;
      // apply material to mirror faces occasionally
      if (m.cooldown <= 0) {
        m.cooldown = 0.12; // ~8 fps RTT – Radeon 780M friendly
        p.weaponGroup.traverse(o => {
          if (o.isMesh && o.userData.mirrorFace) {
            o.material = m.mat;
          }
        });
        // camera looking at player from mirror's point of view (in front of player)
        const d = H.game.dirVectors(p.yaw);
        const mx = p.pos.x + d.fx * 1.2, my = p.pos.y + 1.4, mz = p.pos.z + d.fz * 1.2;
        m.cam.position.set(mx, my, mz);
        m.cam.lookAt(p.pos.x, p.pos.y + 1.35, p.pos.z);
        const prev = renderer.getRenderTarget();
        // hide own weapon briefly
        const was = p.weaponGroup.visible;
        p.weaponGroup.visible = false;
        try {
          renderer.setRenderTarget(m.rt);
          renderer.clear();
          renderer.render(H.scene, m.cam);
        } catch (_) {}
        p.weaponGroup.visible = was;
        renderer.setRenderTarget(prev);
      }
    }
    // reflect laser bolts off mirrors
    const bolts = g.laserBolts || [];
    for (const b of bolts) {
      if (!b || b._reflected) continue;
      for (const p of H.players) {
        if (p.weapon !== 'mirror' || p.index === b.owner) continue;
        const d = H.game.dirVectors(p.yaw);
        const mx = p.pos.x + d.fx * 0.9, my = p.pos.y + 1.3, mz = p.pos.z + d.fz * 0.9;
        const dx = b.x - mx, dy = (b.y || 0) - my, dz = b.z - mz;
        if (dx * dx + dy * dy + dz * dz > 2.8) continue;
        // reflect direction about mirror normal (player forward)
        const nx = d.fx, nz = d.fz;
        const dot = b.dx * nx + b.dz * nz;
        if (dot >= 0) continue; // coming from behind
        b.dx -= 2 * dot * nx;
        b.dz -= 2 * dot * nz;
        b._reflected = true;
        b.owner = p.index; // now "owned" by reflector for scoring
        H.beep?.(900, 0.06, 'sine', 0.04);
        H.toast?.(p.index, '🪞 Heijastus!');
      }
    }
  }

  // ---------- teleportti (3.4: karttavalinta) ----------
  const TP_LIM = 315;
  let tpMap = null;

  function tpWalkable(x, z, p) {
    if (p && p.moon) return false;
    const lim = ((H.game && H.game.earthLimit && H.game.earthLimit()) || TP_LIM) - 4;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
    if (Math.hypot(x, z) > lim) return false;
    if (H.hatch && H.hatch.IN && Math.hypot(x - H.hatch.IN.x, z - H.hatch.IN.z) < (H.hatch.R || 32) + 2) return false;
    if (H.circus && H.circus.IN && Math.hypot(x - H.circus.IN.x, z - H.circus.IN.z) < 18) return false;
    try { if (H.blocked(x, z, 0, 0.55)) return false; } catch (e) { return false; }
    return true;
  }
  function doTeleportTo(p, x, z) {
    if (!p) return false;
    if (!tpWalkable(x, z, p)) {
      H.toast?.(p.index, 'Ei voi teleportata siihen (seinä tai kartan ulkopuoli)', true);
      H.beep?.(200, 0.1, 'sawtooth', 0.04);
      return false;
    }
    const gy = H.game.groundHeight?.(x, z) ?? 0;
    const car = p.car != null ? H.cars[p.car] : null;
    if (car) { car.pos.x = x; car.pos.z = z; car.vx = car.vz = 0; }
    p.pos.x = x; p.pos.z = z; p.pos.y = gy + 0.15; p.vy = 0.3;
    p.camS = null;
    H.toast?.(p.index, '✨ Teleport!');
    H.beep?.(660, 0.12, 'sine', 0.06);
    try {
      const G = T();
      const s = new G.Mesh(new G.SphereGeometry(0.6, 8, 6), M(0xb197fc, { e: 0x9775fa, ei: 2, op: 0.8 }));
      s.position.copy(p.pos); s.position.y += 1; H.scene.add(s);
      setTimeout(() => { H.scene.remove(s); s.geometry.dispose(); }, 280);
    } catch (_) {}
    return true;
  }
  function closeTeleportMap() {
    if (tpMap && tpMap.el && tpMap.el.parentNode) tpMap.el.parentNode.removeChild(tpMap.el);
    if (tpMap && tpMap.p) tpMap.p._tpMap = false;
    tpMap = null;
  }
  function worldToMap(x, z, w, h) {
    return { mx: (x / TP_LIM * 0.5 + 0.5) * w, my: (0.5 - z / TP_LIM * 0.5) * h };
  }
  function mapToWorld(mx, my, w, h) {
    return { x: ((mx / w) - 0.5) * 2 * TP_LIM, z: (0.5 - my / h) * 2 * TP_LIM };
  }
  function drawTeleportMap() {
    if (!tpMap) return;
    const cv = tpMap.cv, ctx = tpMap.ctx, w = cv.width, h = cv.height;
    ctx.fillStyle = '#b2f2bb'; ctx.fillRect(0, 0, w, h);
    // meri / reuna
    ctx.strokeStyle = '#1864ab'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(w/2, h/2, w*0.49, 0, Math.PI*2); ctx.stroke();
    const dot = (x, z, col, r) => {
      const m = worldToMap(x, z, w, h);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(m.mx, m.my, r || 5, 0, Math.PI*2); ctx.fill();
    };
    try {
      (H.homes?.list?.() || []).forEach((hm) => { dot(hm.x, hm.z, '#c92a2a', 6); });
      if (H.circus?.OUT) dot(H.circus.OUT.x, H.circus.OUT.z, '#be4bdb', 7);
      if (H.plane?.HOME) dot(H.plane.HOME.x, H.plane.HOME.z, '#1864ab', 7);
    } catch (e) {}
    const p = tpMap.p;
    if (p) dot(p.pos.x, p.pos.z, '#212529', 6);
    const ok = tpWalkable(tpMap.cx, tpMap.cz, p);
    const cur = worldToMap(tpMap.cx, tpMap.cz, w, h);
    ctx.strokeStyle = ok ? '#2f9e44' : '#c92a2a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cur.mx - 10, cur.my); ctx.lineTo(cur.mx + 10, cur.my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cur.mx, cur.my - 10); ctx.lineTo(cur.mx, cur.my + 10); ctx.stroke();
    ctx.fillStyle = ok ? '#0b3d1a' : '#c92a2a';
    ctx.font = '16px system-ui,sans-serif';
    ctx.fillText((ok ? 'OK  ' : 'EI  ') + Math.round(tpMap.cx) + ', ' + Math.round(tpMap.cz), 12, 24);
  }
  function confirmTeleportMap() {
    if (!tpMap) return false;
    const p = tpMap.p, x = tpMap.cx, z = tpMap.cz;
    const ok = doTeleportTo(p, x, z);
    if (ok) closeTeleportMap();
    return ok;
  }
  function openTeleportMap(p) {
    if (!p) return false;
    closeTeleportMap();
    p._tpMap = true;
    const el = document.createElement('div');
    el.id = 'hyyte-tp-map';
    el.innerHTML = `<style>
      #hyyte-tp-map{position:fixed;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(8,18,28,.55);font-family:system-ui,sans-serif}
      #hyyte-tp-map .box{background:#fff;padding:10px 12px 14px;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.3)}
      #hyyte-tp-map h2{margin:0 0 6px;font-size:18px}
      #hyyte-tp-map canvas{background:#b2f2bb;border-radius:8px;touch-action:none;cursor:crosshair}
      #hyyte-tp-map .hint{margin:6px 0 0;font-size:13px;opacity:.8}
    </style><div class="box"><h2>✨ Teleportti – valitse paikka kartalta</h2>
    <canvas width="520" height="520"></canvas>
    <p class="hint">Klikkaa tai liikuta ohjaimen tikkua. Vihreä risti = ok, punainen = ei voi. A/✕ tai klikkaus vie perille. B/○ sulkee.</p></div>`;
    document.body.appendChild(el);
    const cv = el.querySelector('canvas');
    const ctx = cv.getContext('2d');
    tpMap = { p, el, cv, ctx, cx: p.pos.x, cz: p.pos.z, prevA: false, prevB: false };
    const pickEv = (ev) => {
      const r = cv.getBoundingClientRect();
      const t = ev.touches && ev.touches[0];
      const px = ((t || ev).clientX - r.left) * (cv.width / r.width);
      const py = ((t || ev).clientY - r.top) * (cv.height / r.height);
      const wrl = mapToWorld(px, py, cv.width, cv.height);
      tpMap.cx = wrl.x; tpMap.cz = wrl.z;
      drawTeleportMap();
    };
    cv.addEventListener('pointerdown', (ev) => { pickEv(ev); });
    cv.addEventListener('pointermove', (ev) => { if (ev.buttons) pickEv(ev); });
    cv.addEventListener('click', (ev) => { pickEv(ev); confirmTeleportMap(); });
    el.addEventListener('click', (ev) => { if (ev.target === el) closeTeleportMap(); });
    drawTeleportMap();
    H.toast?.(p.index, 'Valitse paikka kartalta');
    return true;
  }
  function tickTeleportMap(dt) {
    if (!tpMap) return;
    const p = tpMap.p;
    if (!p) { closeTeleportMap(); return; }
    let lx = 0, ly = 0, A = false, B = false;
    try {
      const P = window.HYYTE_PAD;
      const st = P && P.state && P.state(p.index);
      if (st) { lx = st.turn || 0; ly = -(st.f || 0); }
      const raw = P && P.raw && P.raw(P.padOf ? P.padOf(p.index) : p.index);
      if (raw && raw.buttons) {
        A = !!(raw.buttons[0] && (raw.buttons[0].pressed || raw.buttons[0].value > 0.5));
        B = !!(raw.buttons[1] && (raw.buttons[1].pressed || raw.buttons[1].value > 0.5));
      }
    } catch (e) {}
    const inp = H.input?.(p.index);
    if (inp) {
      if (!lx && inp.turn) lx = inp.turn;
      if (!ly && inp.f) ly = -inp.f;
    }
    if (lx || ly) {
      tpMap.cx += lx * 90 * dt;
      tpMap.cz += -ly * 90 * dt;
      const lim = TP_LIM - 4;
      const m = Math.hypot(tpMap.cx, tpMap.cz);
      if (m > lim) { tpMap.cx *= lim / m; tpMap.cz *= lim / m; }
    }
    drawTeleportMap();
    if (A && !tpMap.prevA) confirmTeleportMap();
    if ((B && !tpMap.prevB) || H.keyPressed?.('Escape')) closeTeleportMap();
    tpMap.prevA = A; tpMap.prevB = B;
  }
  function doTeleport(p) { return openTeleportMap(p); }

  // fire hook
  function patchFire() {
    H.onStart(() => {
      try { if (typeof wrapToMoon === 'function') wrapToMoon(); } catch (e) {}
      const g = H.game; if (!g || g._v24fire) return;
      g._v24fire = true;
      const prev = g.tryFire || null;
      // Hook via H.noFire? Better: wrap updateFiring through weapons in onUpdate edge
    });
  }

  // Use HYYTE fire interception pattern from v21
  const origTrySpecial = H._v24prevSpecial;
  H.onStart(() => {
    try { if (typeof wrapToMoon === 'function') wrapToMoon(); } catch (e) {}
    // Patch trySpecialWeapons if exists
    const g = H.game;
    if (!g) return;
    // Monkey-patch: intercept when player fires with our weapons via polling edge
  });

  // Fire for teleport/blaster/railgun/hypermag/mirror goes through H.v21Fire chain only
  function handleNewWeapons(dt) { /* no-op: avoid double-fire */ }


  H.onUpdate((dt) => {
    handleNewWeapons(dt);
    updateMirrors(dt);
    try { tickTeleportMap(dt); } catch (e) {}
  });
  H.teleport = {
    open: openTeleportMap, close: closeTeleportMap, to: doTeleportTo,
    walkable: tpWalkable, pick: (x, z) => { if (!tpMap) return false; tpMap.cx = x; tpMap.cz = z; drawTeleportMap(); return confirmTeleportMap(); },
    state: () => tpMap ? { open: true, x: tpMap.cx, z: tpMap.cz, owner: tpMap.p && tpMap.p.index } : { open: false },
  };
})();


// fire chain (ex-v24)
(function () {
  const H = window.HYYTE;
  if (!H) return;
  // Chain onto v21Fire for teleport / blaster / railgun / mirror / hypermag
  (function chainFire() {
    const prev = H.v21Fire;
    H.v21Fire = function (e, r, n) {
      if (r === 'teleport') {
        e.cd = 2.5;
        try { (H.teleport && H.teleport.open ? H.teleport.open(e) : doTeleport(e)); } catch (err) {}
        return true;
      }
      if (r === 'mirror') {
        // passive — short swing feedback
        e.cd = 0.4; e.swing = 1; H.beep(1200, 0.05, 'sine', 0.03);
        return true;
      }
      if (r === 'blaster') {
        e.cd = 0.45; H.beep(500, 0.08, 'square', 0.05);
        // damage nearest in cone
        const d = n || H.game.dirVectors(e.yaw);
        for (const p of H.players) {
          if (p === e || p.moon !== e.moon) continue;
          const dx = p.pos.x - e.pos.x, dz = p.pos.z - e.pos.z;
          const along = dx * d.fx + dz * d.fz;
          if (along > 0.5 && along < 28 && Math.hypot(dx, dz) < along * 0.35 + 1.5) {
            (H.game.damage ? H.game.damage(p, 12, e) : (p.hp = Math.max(0, (p.hp||100) - 12))); e.score = (e.score || 0) + 1;
          }
        }
        return true;
      }
      if (r === 'railgun') {
        e.cd = 1.15; H.beep(160, 0.18, 'sawtooth', 0.06);
        const d = n || H.game.dirVectors(e.yaw);
        for (const p of H.players) {
          if (p === e || p.moon !== e.moon) continue;
          const dx = p.pos.x - e.pos.x, dz = p.pos.z - e.pos.z;
          const along = dx * d.fx + dz * d.fz;
          const rx = d.rx != null ? d.rx : Math.cos(e.yaw), rz = d.rz != null ? d.rz : -Math.sin(e.yaw);
          const lat = Math.abs(dx * rx + dz * rz);
          if (along > 0.5 && along < 55 && lat < 1.4) {
            (H.game.damage ? H.game.damage(p, 28, e) : (p.hp = Math.max(0, (p.hp||100) - 28))); e.score = (e.score || 0) + 2;
          }
        }
        H.toast(e.index, '⚡ Raidetykki!');
        return true;
      }
      if (typeof prev === 'function') return prev(e, r, n);
      return false;
    };
  })();
})();
