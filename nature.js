// nature.js – 3.0: koivut/vaahterat/omenapuut, putoavat lehdet, harava, omenat, ruokasienet.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.85, metalness: 0, transparent: !!o.op, opacity: o.op ?? 1 });
  let active = false, trees = [], leaves = [], rakes = [], mushrooms = [], apples = [];

  function trunk(h, rBot, rTop, col) {
    const m = new (T().Mesh)(new (T().CylinderGeometry)(rTop, rBot, h, 8), M(col));
    m.position.y = h / 2; m.castShadow = true; return m;
  }
  function foliage(y, r, col, seg = 10) {
    const m = new (T().Mesh)(new (T().SphereGeometry)(r, seg, 8), M(col));
    m.position.y = y; m.castShadow = true; return m;
  }

  function makeBirch() {
    const g = new (T().Group)();
    g.add(trunk(3.2, 0.18, 0.12, 0xf1f3f5));
    // mustat raidat
    for (let k = 0; k < 5; k++) {
      const b = new (T().Mesh)(new (T().BoxGeometry)(0.38, 0.08, 0.06), M(0x212529));
      b.position.set(0, 0.5 + k * 0.55, 0.14); g.add(b);
    }
    g.add(foliage(3.5, 1.05, 0xc0eb75));
    g.add(foliage(4.1, 0.75, 0xa9e34b));
    return g;
  }
  function makeMaple() {
    const g = new (T().Group)();
    g.add(trunk(3.0, 0.22, 0.14, 0x6b4423));
    g.add(foliage(3.3, 1.2, 0xe8590c));
    g.add(foliage(3.9, 0.85, 0xf08c00));
    g.add(foliage(3.5, 0.7, 0xfa5252));
    return g;
  }
  function makeApple() {
    const g = new (T().Group)();
    g.add(trunk(2.6, 0.16, 0.1, 0x8f5420));
    g.add(foliage(2.9, 1.0, 0x2f9e44));
    g.add(foliage(3.4, 0.7, 0x40c057));
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const apple = new (T().Mesh)(new (T().SphereGeometry)(0.09, 8, 6), M(0xe03131));
      apple.position.set(Math.sin(a) * 0.55, 2.7 + (k % 2) * 0.25, Math.cos(a) * 0.55);
      apple.name = 'appleFruit'; g.add(apple);
    }
    return g;
  }
  function makeRake() {
    const g = new (T().Group)();
    const shaft = new (T().Mesh)(new (T().CylinderGeometry)(0.03, 0.03, 1.4, 6), M(0x8f5420));
    shaft.position.y = 0.7; g.add(shaft);
    const head = new (T().Mesh)(new (T().BoxGeometry)(0.55, 0.04, 0.08), M(0x868e96, { r: 0.4 }));
    head.position.set(0, 1.35, 0.05); g.add(head);
    for (let k = -2; k <= 2; k++) {
      const tine = new (T().Mesh)(new (T().BoxGeometry)(0.03, 0.22, 0.03), M(0x495057));
      tine.position.set(k * 0.1, 1.22, 0.12); g.add(tine);
    }
    return g;
  }
  function makeMushroom(edible) {
    const g = new (T().Group)();
    const stem = new (T().Mesh)(new (T().CylinderGeometry)(0.06, 0.08, 0.22, 8), M(0xfff3bf));
    stem.position.y = 0.11; g.add(stem);
    const cap = new (T().Mesh)(new (T().SphereGeometry)(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(edible ? 0xe8590c : 0x862e9c));
    cap.position.y = 0.22; g.add(cap);
    return g;
  }
  function leafMesh(col) {
    const m = new (T().Mesh)(new (T().PlaneGeometry)(0.18, 0.22), M(col, { op: 0.95, r: 1 }));
    m.rotation.x = -Math.PI / 2; m.receiveShadow = false; m.castShadow = false; return m;
  }

  function placeTree(kind, x, z) {
    const mk = kind === 'birch' ? makeBirch : kind === 'maple' ? makeMaple : makeApple;
    const g = mk(); H.addObject(g, x, 0, z);
    H.obstacle(x, z, 0.55, 1.2);
    const t = { kind, x, z, g, leafT: 0.5 + Math.random() * 2, appleLeft: kind === 'apple' ? 6 : 0 };
    trees.push(t);
    return t;
  }

  function spawnLeaf(x, z, col) {
    if (leaves.length > 220) return;
    const m = leafMesh(col);
    const y = 2.2 + Math.random() * 1.5;
    H.addObject(m, x + (Math.random() - 0.5) * 0.8, y, z + (Math.random() - 0.5) * 0.8);
    leaves.push({ m, x: m.position.x, z: m.position.z, y, vy: -0.4 - Math.random() * 0.6, spin: Math.random() * 6, life: 40 + Math.random() * 40, piled: false });
  }

  function placeRake(x, z) {
    const g = makeRake(); g.rotation.y = Math.random() * Math.PI; H.addObject(g, x, 0, z);
    const lbl = H.makeLabel('🧹 Harava', { scale: 2.2, size: 48, bg: '#343a40' });
    H.addObject(lbl, x, 1.7, z);
    rakes.push({ g, lbl, x, z, heldBy: -1 });
  }

  function placeMushroom(x, z) {
    const g = makeMushroom(true); H.addObject(g, x, 0, z);
    mushrooms.push({ g, x, z, taken: false });
  }

  function aroundHomes() {
    const homes = (H.homes && H.homes.list && H.homes.list()) || [];
    const bases = homes.length ? homes.map(h => ({ x: h.x, z: h.z })) :
      [{ x: -54, z: -168 }, { x: 33, z: -168 }, { x: -141, z: -168 }, { x: 144, z: -168 }];
    bases.forEach((b, i) => {
      const offs = [
        [-8, 6, 'birch'], [8, 5, 'maple'], [-5, 11, 'apple'],
        [6, 11, 'birch'], [-10, 2, 'maple'], [10, 2, 'apple'],
      ];
      offs.forEach(([dx, dz, kind], k) => {
        if ((i + k) % 7 === 0 && kind !== 'apple') return; // harvenna
        placeTree(kind, b.x + dx, b.z + dz);
      });
      placeRake(b.x - 3, b.z + 8);
    });
  }

  function woodedAreas() {
    // koivu/vaahtera -rykelmät
    const groves = [
      { cx: -95, cz: -70, n: 7 },
      { cx: 88, cz: -85, n: 7 },
      { cx: -70, cz: 55, n: 6 },
      { cx: 55, cz: 70, n: 6 },
    ];
    groves.forEach((g, gi) => {
      for (let k = 0; k < g.n; k++) {
        const a = (k / g.n) * Math.PI * 2, r = 4 + (k % 3) * 2.2;
        const x = g.cx + Math.cos(a) * r, z = g.cz + Math.sin(a) * r;
        placeTree(k % 2 ? 'birch' : 'maple', x, z);
      }
      placeRake(g.cx + 1.5, g.cz + 1.5);
      // ruokasieniä parilla alueella
      if (gi < 2) {
        for (let m = 0; m < 5; m++) {
          const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 5;
          placeMushroom(g.cx + Math.cos(a) * r, g.cz + Math.sin(a) * r);
        }
      }
    });
  }

  function holdRake(p, rake) {
    rake.heldBy = p.index;
    if (rake.lbl) { H.removeObject(rake.lbl); rake.lbl = null; }
    // kiinnitä käteen
    const grp = p.group; if (!grp) return;
    rake.g.parent && rake.g.parent.remove(rake.g);
    rake.g.position.set(0.45, 0.9, 0.2);
    rake.g.rotation.set(0.4, 0.2, 0.5);
    rake.g.scale.setScalar(0.85);
    grp.add(rake.g);
    H.toast(p.index, 'Harava kädessä! Kävele lehtien päälle 🍂');
  }

  function dropRake(rake, x, z) {
    const p = H.players[rake.heldBy];
    if (p && p.group && rake.g.parent === p.group) p.group.remove(rake.g);
    rake.heldBy = -1;
    rake.g.scale.setScalar(1);
    rake.g.rotation.set(0, Math.random() * Math.PI, 0);
    H.addObject(rake.g, x, 0, z);
    rake.x = x; rake.z = z;
    rake.lbl = H.makeLabel('🧹 Harava', { scale: 2.2, size: 48, bg: '#343a40' });
    H.addObject(rake.lbl, x, 1.7, z);
  }

  H.onStart(() => {
    active = !H.challenge; trees = []; leaves = []; rakes = []; mushrooms = []; apples = [];
    if (!active) return;
    aroundHomes();
    woodedAreas();
  });
  H.onStop(() => { active = false; trees = []; leaves = []; rakes = []; mushrooms = []; apples = []; });

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    // lehdet putoavat
    for (const t of trees) {
      if (t.kind === 'apple') continue;
      t.leafT -= dt;
      if (t.leafT <= 0) {
        t.leafT = 1.2 + Math.random() * 2.5;
        const col = t.kind === 'birch' ? 0xc0eb75 : [0xe8590c, 0xf08c00, 0xfa5252][(Math.random() * 3) | 0];
        spawnLeaf(t.x, t.z, col);
      }
    }
    // lehtien fysiikka
    for (let i = leaves.length - 1; i >= 0; i--) {
      const L = leaves[i];
      if (!L.piled) {
        L.y += L.vy * dt;
        L.spin += dt * 2;
        L.x += Math.sin(L.spin) * 0.15 * dt;
        if (L.y <= 0.03) { L.y = 0.03; L.piled = true; L.vy = 0; }
        L.m.position.set(L.x, L.y, L.z);
        L.m.rotation.z = L.spin;
      }
      L.life -= dt;
      if (L.life <= 0) { H.removeObject(L.m); leaves.splice(i, 1); }
    }
    // omenoiden regenerointi
    for (const t of trees) {
      if (t.kind !== 'apple') continue;
      if (t.appleLeft < 6) {
        t._regen = (t._regen || 0) + dt;
        if (t._regen > 25) { t._regen = 0; t.appleLeft = Math.min(6, t.appleLeft + 1);
          const fruits = []; t.g.traverse(o => { if (o.name === 'appleFruit') fruits.push(o); });
          fruits.forEach((f, k) => { f.visible = k < t.appleLeft; });
        }
      }
    }

    for (const p of H.players) {
      if (p.car != null || p.rocket || p.moon) continue;
      const i = p.index, key = H.KEYS('interact')[i];
      // poimi omena
      let nearApple = null;
      for (const t of trees) {
        if (t.kind !== 'apple' || t.appleLeft <= 0) continue;
        if (Math.hypot(p.pos.x - t.x, p.pos.z - t.z) < 1.6 && p.pos.y < 2.2) { nearApple = t; break; }
      }
      if (nearApple) {
        H.hud(i, `🍎 Omenapuu · ${key} = poimi (${nearApple.appleLeft})`, 'nature');
        if (H.pressed(i, 'interact')) {
          if (H.hunger?.addToBag(i, 'omena')) {
            nearApple.appleLeft--;
            const fruits = []; nearApple.g.traverse(o => { if (o.name === 'appleFruit') fruits.push(o); });
            fruits.forEach((f, k) => { f.visible = k < nearApple.appleLeft; });
            H.toast(i, 'Poimit omenan 🍎'); H.beep(880, 0.08, 'triangle', 0.05);
          }
        }
        continue;
      }
      // poimi sieni
      let nearM = mushrooms.find(m => !m.taken && Math.hypot(p.pos.x - m.x, p.pos.z - m.z) < 1.3);
      if (nearM) {
        H.hud(i, `🍄 Ruokasieni · ${key} = poimi`, 'nature');
        if (H.pressed(i, 'interact')) {
          if (H.hunger?.addToBag(i, 'sieni')) {
            nearM.taken = true; nearM.g.visible = false;
            H.toast(i, 'Poimit ruokasienen 🍄'); H.beep(700, 0.08, 'triangle', 0.05);
            H.emit?.('forage', i, 'sieni');
          }
        }
        continue;
      }
      // harava
      const holding = rakes.find(r => r.heldBy === i);
      if (holding) {
        // haravoi lehtiä lähellä
        let n = 0;
        for (let li = leaves.length - 1; li >= 0; li--) {
          const L = leaves[li];
          if (Math.hypot(L.x - p.pos.x, L.z - p.pos.z) < 1.4) {
            H.removeObject(L.m); leaves.splice(li, 1); n++;
          }
        }
        if (n) H.emit?.('rake', i, n);
        H.hud(i, n ? `🍂 Haravoit ${n} lehteä!` : `🧹 Harava kädessä · ${key} = pudota`, 'nature');
        if (H.pressed(i, 'interact')) dropRake(holding, p.pos.x + 0.8, p.pos.z + 0.4);
        continue;
      }
      const nearR = rakes.find(r => r.heldBy < 0 && Math.hypot(p.pos.x - r.x, p.pos.z - r.z) < 1.5);
      if (nearR) {
        H.hud(i, `🧹 Harava · ${key} = ota`, 'nature');
        if (H.pressed(i, 'interact')) holdRake(p, nearR);
        continue;
      }
      H.hud(i, '', 'nature');
    }
  });

  H.nature = {
    trees: () => trees.map(t => ({ kind: t.kind, x: t.x, z: t.z, appleLeft: t.appleLeft })),
    leaves: () => leaves.length,
    burstLeaves: (n = 80) => {
      const src = trees.filter(t => t.kind !== 'apple');
      if (!src.length) return 0;
      const cap = Math.min(220, Math.max(0, n|0));
      for (let i = 0; i < cap; i++) {
        const t = src[i % src.length];
        const col = t.kind === 'birch' ? 0xc0eb75 : [0xe8590c, 0xf08c00, 0xfa5252][i % 3];
        spawnLeaf(t.x + (i % 5) * 0.3, t.z + ((i / 5) | 0) * 0.2, col);
      }
      return leaves.length;
    },
    rakes: () => rakes.map(r => ({ x: r.x, z: r.z, heldBy: r.heldBy })),
    mushrooms: () => mushrooms.filter(m => !m.taken).map(m => ({ x: m.x, z: m.z })),
  };
})();
