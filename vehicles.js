// vehicles.js – S-market Spaceship -mönkijät, LRV, kuupöly (ex-v24)
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

  // ---------- S-market Spaceship -mönkijät + LRV + kuupöly ----------
  const moonVehicles = [];
  const dustParts = [];

  function makeSpaceshipBot(scale, color) {
    const G = T();
    const g = new G.Group();
    const bodyC = M(color || 0xffffff, { r: 0.55, m: 0.15 });
    const dark = M(0x212529, { r: 0.7 });
    const accent = M(0xe03131, { e: 0xfa5252, ei: 0.5 });
    const glow = M(0xffd43b, { e: 0xfab005, ei: 0.9 });
    // cute 6-wheel box
    box(1.8 * scale, 1.1 * scale, 1.3 * scale, bodyC, 0, 0.85 * scale, 0, g);
    box(1.5 * scale, 0.55 * scale, 1.15 * scale, M(0xf8f9fa, { r: 0.4 }), 0.05 * scale, 1.55 * scale, 0, g); // dome/lid
    // face panel
    box(0.08, 0.45 * scale, 0.7 * scale, dark, 0.92 * scale, 1.05 * scale, 0, g);
    sph(0.08 * scale, glow, 0.98 * scale, 1.15 * scale, -0.18 * scale, g);
    sph(0.08 * scale, glow, 0.98 * scale, 1.15 * scale, 0.18 * scale, g);
    // turn signals
    const tl = sph(0.07 * scale, M(0xff922b, { e: 0xff922b, ei: 0.8 }), 0.85 * scale, 1.35 * scale, -0.55 * scale, g);
    const tr = sph(0.07 * scale, M(0xff922b, { e: 0xff922b, ei: 0.8 }), 0.85 * scale, 1.35 * scale, 0.55 * scale, g);
    tl.userData.signal = 'L'; tr.userData.signal = 'R';
    // headlights
    sph(0.09 * scale, M(0xfff9db, { e: 0xfff3bf, ei: 1.2 }), 0.95 * scale, 0.7 * scale, -0.4 * scale, g);
    sph(0.09 * scale, M(0xfff9db, { e: 0xfff3bf, ei: 1.2 }), 0.95 * scale, 0.7 * scale, 0.4 * scale, g);
    // 6 wheels
    const wheels = [];
    for (const wz of [-0.55, 0, 0.55]) for (const wx of [-0.55, 0.55]) {
      const wh = cyl(0.28 * scale, 0.28 * scale, 0.22 * scale, dark, wx * scale, 0.28 * scale, wz * scale, g, 10);
      wh.rotation.z = Math.PI / 2; wheels.push(wh);
    }
    // flag antenna
    cyl(0.025 * scale, 0.025 * scale, 1.2 * scale, dark, -0.5 * scale, 1.9 * scale, -0.4 * scale, g, 6);
    const flag = box(0.35 * scale, 0.22 * scale, 0.04 * scale, accent, -0.32 * scale, 2.4 * scale, -0.4 * scale, g);
    flag.userData.flag = true;
    // S-badge
    try {
      const lab = H.makeLabel('S', { bg: '#e03131', scale: 1.8 * scale, size: 48 });
      lab.position.set(0, 1.2 * scale, 0.68 * scale); g.add(lab);
    } catch (_) {}
    g.userData.wheels = wheels;
    g.userData.signals = { L: tl, R: tr };
    g.userData.botScale = scale;
    return g;
  }

  function makeLRV(scale) {
    const G = T();
    const g = new G.Group();
    const frame = M(0xadb5bd, { m: 0.55, r: 0.35 });
    const seat = M(0x343a40, { r: 0.7 });
    box(2.4 * scale, 0.25 * scale, 1.6 * scale, frame, 0, 0.55 * scale, 0, g);
    box(0.8 * scale, 0.7 * scale, 0.7 * scale, seat, -0.3 * scale, 1.0 * scale, 0.3 * scale, g);
    box(0.8 * scale, 0.7 * scale, 0.7 * scale, seat, -0.3 * scale, 1.0 * scale, -0.3 * scale, g);
    // antenna dish
    const dish = cyl(0.45 * scale, 0.05 * scale, 0.06 * scale, M(0xffe066, { e: 0xfab005, ei: 0.5 }), 0.9 * scale, 1.5 * scale, -0.5 * scale, g, 12);
    dish.rotation.x = 0.5;
    cyl(0.04 * scale, 0.04 * scale, 0.9 * scale, frame, 0.9 * scale, 1.1 * scale, -0.5 * scale, g, 6);
    const wheels = [];
    for (const wz of [-0.7, 0.7]) for (const wx of [-0.9, 0.9]) {
      const wh = cyl(0.38 * scale, 0.38 * scale, 0.22 * scale, M(0x212529), wx * scale, 0.38 * scale, wz * scale, g, 10);
      wh.rotation.z = Math.PI / 2; wheels.push(wh);
    }
    g.userData.wheels = wheels;
    g.userData.botScale = scale;
    return g;
  }

  function spawnMoonVehicles() {
    const moon = H.moon; if (!moon || !H.cars) return;
    if (moonVehicles.length > 0) return; // already spawned this visit
    const MX = moon.center.x, MZ = moon.center.z;
    // lähelle laskeutumisalustaa / spawnia (PAD z≈-16, SPAWN z≈-24)
    const y0 = H.moonH?.(MX + 6, MZ - 20) ?? 1.5;
    const specs = [
      { kind: 'spaceship', scale: 0.65, color: 0xffffff, x: MX - 6, z: MZ - 20, top: 14, accel: 28 },
      { kind: 'spaceship', scale: 1.0, color: 0xf8f9fa, x: MX - 10, z: MZ - 18, top: 12, accel: 24 },
      { kind: 'spaceship', scale: 1.5, color: 0xe7f5ff, x: MX - 14, z: MZ - 22, top: 10, accel: 20 },
      { kind: 'lrv', scale: 1.0, x: MX + 6, z: MZ - 18, top: 16, accel: 30 },
      { kind: 'lrv', scale: 1.3, x: MX + 10, z: MZ - 22, top: 15, accel: 28 },
      { kind: 'lrv', scale: 0.85, x: MX + 4, z: MZ - 26, top: 17, accel: 32 },
    ];
    for (const s of specs) {
      const mesh = s.kind === 'lrv' ? makeLRV(s.scale) : makeSpaceshipBot(s.scale, s.color);
      const yy = H.moonH?.(s.x, s.z) ?? y0;
      mesh.position.set(s.x, yy, s.z);
      // gameLoop expects userData.boost + wheels
      if (!mesh.userData.wheels) mesh.userData.wheels = [];
      if (!mesh.userData.boost) {
        const boost = new (T().Group)(); boost.visible = false; mesh.add(boost);
        mesh.userData.boost = boost;
      }
      H.scene.add(mesh);
      const car = {
        group: mesh, pos: mesh.position, yaw: 0.4, speed: 0, occupied: null,
        accel: s.accel, top: s.top, bigRear: false, carType: s.kind, fly: false, mass: 0.7 * s.scale,
        slow: 0, spin: 0, spinDir: 1, coat: { visible: false, position: { set() {} }, scale: { setScalar() {} } },
        y: yy, vy: 0, vx: 0, vz: 0, sliding: false, nitro: 0, oil: 0, portalCd: 0,
        moonOnly: true, driverScale: 1.15 / Math.max(0.55, s.scale), // character relative to vehicle
        _v24moon: true, _botScale: s.scale, immovable: false,
      };
      car.coat = new (T().Group)(); car.coat.visible = false; H.scene.add(car.coat);
      H.cars.push(car);
      moonVehicles.push(car);
      H.registerMovable(car);
    }
  }

  function spawnDust(car, dt) {
    if (!car._v24moon || Math.abs(car.speed) < 2) return;
    if (Math.random() > 0.35) return;
    const G = T();
    const p = new G.Mesh(new G.SphereGeometry(0.15 + Math.random() * 0.2, 6, 5),
      M(0xc5ccd6, { op: 0.55, r: 1 }));
    p.position.set(car.pos.x + (Math.random() - 0.5) * 1.2, (car.y || 0) + 0.2, car.pos.z + (Math.random() - 0.5) * 1.2);
    H.scene.add(p);
    dustParts.push({ m: p, life: 0.7 + Math.random() * 0.5, vy: 0.8 + Math.random() * 1.5 });
  }

  function updateDust(dt) {
    for (let i = dustParts.length - 1; i >= 0; i--) {
      const d = dustParts[i];
      d.life -= dt; d.m.position.y += d.vy * dt; d.vy *= 0.96;
      d.m.material.opacity = Math.max(0, d.life);
      d.m.scale.setScalar(1 + (0.7 - d.life) * 1.5);
      if (d.life <= 0) { H.scene.remove(d.m); d.m.geometry.dispose(); dustParts.splice(i, 1); }
    }
  }

  // driver scale while in moon vehicle
  function updateDriverScale() {
    for (const p of H.players) {
      if (p.car == null) {
        if (p._v24scaled) { p.group.scale.setScalar(1.35); p._v24scaled = false; }
        continue;
      }
      const c = H.cars[p.car];
      if (c && c.driverScale) {
        p.group.scale.setScalar(1.35 * c.driverScale);
        p._v24scaled = true;
      }
    }
  }


  function tick(dt) {
    for (const c of moonVehicles) {
      if (c.occupied != null) spawnDust(c, dt);
      if (c.group?.userData?.signals) {
        const turn = Math.sin(H.time * 8) > 0;
        const s = c.group.userData.signals;
        if (s.L) s.L.material.emissiveIntensity = (c.speed && turn) ? 1.4 : 0.2;
        if (s.R) s.R.material.emissiveIntensity = (c.speed && !turn) ? 1.4 : 0.2;
      }
    }
  }
  H.vehicles = {
    spawnMoonVehicles,
    updateDust,
    updateDriverScale,
    tick,
    list: () => moonVehicles.slice(),
    count: () => moonVehicles.length,
    reset: () => { moonVehicles.length = 0; dustParts.length = 0; },
  };
  H.onUpdate((dt) => {
    updateDust(dt);
    updateDriverScale();
    tick(dt);
    if (moonVehicles.length === 0 && H.moon && H.players.some(p => p.moon && !p._bodyId)) {
      try { spawnMoonVehicles(); } catch (_) {}
    }
  });
  H.onStart(() => {
    setTimeout(() => { try { spawnMoonVehicles(); } catch (e) { console.warn(e); } }, 400);
  });
  H.onStop(() => { moonVehicles.length = 0; dustParts.length = 0; });
})();
