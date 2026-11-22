// shop.js – Kauppa: hatut ja värit sankarille. Ostokset tallentuvat pelaajapaikoittain
// (localStorage hyyte-shop-p1 / hyyte-shop-p2) ja näkyvät pelissä.
(function () {
  const H = window.HYYTE;
  const SHOP = { x: -52, z: -58 };
  const HATS = [
    { id: 'cap', name: 'Lippis', price: 8 },
    { id: 'top', name: 'Silinteri', price: 15 },
    { id: 'witch', name: 'Noitahattu', price: 20 },
    { id: 'prop', name: 'Propellihattu', price: 25 },
    { id: 'crown', name: 'Kruunu', price: 30 },
    { id: 'nohat', name: 'Ei hattua', price: 0 },
    // 1.7: uudet hatut (kolmas rivi)
    { id: 'pipo', name: 'Pipo', price: 6, row: 2 },
    { id: 'party', name: 'Bilehattu', price: 10, row: 2 },
    { id: 'chef', name: 'Kokin hattu', price: 14, row: 2 },
    { id: 'cowboy', name: 'Cowboy-hattu', price: 18, row: 2 },
    { id: 'pirate', name: 'Merirosvohattu', price: 22, row: 2 },
    { id: 'viking', name: 'Viikinkikypärä', price: 28, row: 2 },
  ];
  const COLORS = [
    { id: 'red', name: 'Punainen', price: 10, c: 0xe03131 },
    { id: 'green', name: 'Vihreä', price: 10, c: 0x2f9e44 },
    { id: 'blue', name: 'Sininen', price: 10, c: 0x1c7ed6 },
    { id: 'pink', name: 'Pinkki', price: 12, c: 0xf06595 },
    { id: 'gold', name: 'Kulta', price: 40, c: 0xfcc419, metal: true },
    { id: 'nocolor', name: 'Oma väri', price: 0 },
  ];
  const KEY = H.KEYS('interact');
  const data = Array.from({length:12},(_,i)=>load(i));
  let active = false, pads = [];

  function load(i) {
    const d = H.load('shop-p' + (i + 1), null) || {};
    return { owned: Array.isArray(d.owned) ? d.owned : [], hat: d.hat || '', color: d.color || '' };
  }
  function store(i) { H.save('shop-p' + (i + 1), data[i]); }
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.5, metalness: o.m ?? 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0 });

  /** Rakentaa hattumallin (keskitetty, pohja y=0, edessä +z). */
  function makeHat(id) {
    const g = new (T().Group)(), Me = T().Mesh;
    const cyl = (rt, rb, h, m, y) => { const x = new Me(new (T().CylinderGeometry)(rt, rb, h, 24), m); x.position.y = y; g.add(x); return x; };
    if (id === 'cap') {
      const m = M(0xe03131);
      const dome = new Me(new (T().SphereGeometry)(0.28, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); g.add(dome);
      const brim = new Me(new (T().BoxGeometry)(0.36, 0.03, 0.26), m); brim.position.set(0, 0.01, 0.3); g.add(brim);
    } else if (id === 'top') {
      const m = M(0x212529); cyl(0.38, 0.38, 0.04, m, 0.02); cyl(0.22, 0.24, 0.42, m, 0.25);
      cyl(0.245, 0.245, 0.07, M(0xc92a2a), 0.09);
    } else if (id === 'witch') {
      const m = M(0x5f3dc4); cyl(0.42, 0.42, 0.04, m, 0.02);
      const c = new Me(new (T().ConeGeometry)(0.25, 0.62, 20), m); c.position.y = 0.33; c.rotation.z = 0.15; g.add(c);
    } else if (id === 'prop') {
      const dome = new Me(new (T().SphereGeometry)(0.27, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0x1c7ed6)); g.add(dome);
      cyl(0.02, 0.02, 0.18, M(0x868e96), 0.32);
      const blades = new (T().Group)(); blades.position.y = 0.42; blades.name = 'propeller';
      [0xfcc419, 0xe03131].forEach((c, k) => { const b = new Me(new (T().BoxGeometry)(0.7, 0.02, 0.1), M(c)); b.rotation.y = k * Math.PI / 2; blades.add(b); });
      g.add(blades);
    } else if (id === 'crown') {
      const m = M(0xfcc419, { m: 0.8, r: 0.2, e: 0x7a5800, ei: 0.4 });
      const band = new Me(new (T().CylinderGeometry)(0.26, 0.24, 0.16, 24, 1, true), m); band.material.side = 2; band.position.y = 0.08; g.add(band);
      for (let k = 0; k < 6; k++) {
        const a = k / 6 * Math.PI * 2, s = new Me(new (T().ConeGeometry)(0.06, 0.16, 6), m);
        s.position.set(Math.sin(a) * 0.25, 0.23, Math.cos(a) * 0.25); g.add(s);
      }
      const gem = new Me(new (T().SphereGeometry)(0.045, 10, 8), M(0xe03131, { e: 0x900, ei: 0.6 })); gem.position.set(0, 0.09, 0.26); g.add(gem);
    } else if (id === 'pipo') {
      const m = M(0x1c7ed6, { r: 1 });
      const dome = new Me(new (T().SphereGeometry)(0.27, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 1.15; g.add(dome);
      cyl(0.275, 0.275, 0.1, M(0xffffff, { r: 1 }), 0.03);
      const pom = new Me(new (T().SphereGeometry)(0.09, 12, 10), M(0xe03131, { r: 1 })); pom.position.y = 0.33; g.add(pom);
    } else if (id === 'party') {
      const c = new Me(new (T().ConeGeometry)(0.2, 0.5, 20), M(0xf06595)); c.position.y = 0.25; g.add(c);
      for (let k = 0; k < 3; k++) { const r = new Me(new (T().TorusGeometry)(0.2 - k * 0.06 - 0.03, 0.02, 6, 20), M(0xfcc419)); r.rotation.x = Math.PI / 2; r.position.y = 0.08 + k * 0.14; g.add(r); }
      const pom = new Me(new (T().SphereGeometry)(0.06, 10, 8), M(0x40c057)); pom.position.y = 0.52; g.add(pom);
    } else if (id === 'chef') {
      const m = M(0xffffff, { r: 0.9 }); cyl(0.24, 0.24, 0.22, m, 0.11);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, s = new Me(new (T().SphereGeometry)(0.15, 12, 10), m); s.position.set(Math.sin(a) * 0.13, 0.33, Math.cos(a) * 0.13); g.add(s); }
      const s = new Me(new (T().SphereGeometry)(0.17, 12, 10), m); s.position.y = 0.38; g.add(s);
    } else if (id === 'cowboy') {
      const m = M(0x8f5420); cyl(0.5, 0.5, 0.03, m, 0.02); cyl(0.2, 0.25, 0.3, m, 0.17); cyl(0.255, 0.255, 0.05, M(0x212529), 0.06);
    } else if (id === 'pirate') {
      const m = M(0x212529);
      const b = new Me(new (T().CylinderGeometry)(0.3, 0.3, 0.3, 3, 1), m); b.rotation.y = Math.PI / 6; b.scale.set(1.25, 1, 0.8); b.position.y = 0.15; g.add(b);
      const sk = new Me(new (T().SphereGeometry)(0.06, 10, 8), M(0xffffff)); sk.position.set(0, 0.2, 0.22); g.add(sk);
    } else if (id === 'viking') {
      const m = M(0xadb5bd, { m: 0.6, r: 0.35 });
      const dome = new Me(new (T().SphereGeometry)(0.28, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); g.add(dome);
      cyl(0.29, 0.29, 0.06, M(0x8f5420), 0.03);
      [-1, 1].forEach(sd => { const h = new Me(new (T().ConeGeometry)(0.06, 0.3, 10), M(0xfff3bf)); h.position.set(sd * 0.3, 0.2, 0); h.rotation.z = -sd * 0.9; g.add(h); });
    }
    return g;
  }

  // ---------- varusteiden näyttäminen sankarissa ----------
  function apply(p) {
    const d = data[p.index], grp = p.group; if (!grp) return;
    const body = grp.children[0], head = grp.children[1];
    if (!p.__shop) p.__shop = { body: body.material.color.getHex(), head: head && head.material.color.getHex(), headMat: head && head.material, hat: null };
    const s = p.__shop;
    // väri
    const col = COLORS.find(c => c.id === d.color && c.c != null);
    body.material.color.setHex(col ? col.c : s.body);
    body.material.metalness = col && col.metal ? 0.6 : 0;
    body.material.roughness = col && col.metal ? 0.3 : (body.material.__r ??= body.material.roughness);
    if (head && s.head === s.body && head.material !== body.material) head.material.color.setHex(col ? col.c : s.head);
    // hattu
    if (s.hat) { grp.remove(s.hat); s.hat = null; }
    if (d.hat && d.hat !== 'nohat') {
      const h = makeHat(d.hat);
      const y = p.hero === 'knight' ? 1.78 : p.hero === 'cat' || p.hero === 'dog' ? 1.68 : 1.66;
      h.position.set(0, y, 0); h.name = 'shop-hat';
      h.traverse(o => { o.layers.set(10 + p.index); o.castShadow = true; });
      grp.add(h); s.hat = h;
    }
  }

  // ---------- kauppa-alue ----------
  function build() {
    const Me = T().Mesh;
    const g = new (T().Group)();
    const floor = new Me(new (T().BoxGeometry)(24, 0.16, 16.5), M(0xfff3bf)); floor.position.set(0, 0.08, 2.25); floor.receiveShadow = true; g.add(floor);
    const back = new Me(new (T().BoxGeometry)(24, 5, 0.5), M(0x74c0fc)); back.position.set(0, 2.5, -6); back.castShadow = true; g.add(back);
    for (let k = 0; k < 8; k++) {
      const st = new Me(new (T().BoxGeometry)(3, 0.25, 1.6), M(k % 2 ? 0xffffff : 0xe03131)); st.position.set(-10.5 + k * 3, 5, -5.2); st.rotation.x = 0.35; g.add(st);
    }
    const sign = H.makeLabel('🛍️ KAUPPA', { bg: '#1971c2', scale: 7 }); sign.position.set(0, 6.8, -6); g.add(sign);
    H.addObject(g, SHOP.x, 0, SHOP.z);
    for (let k = -10; k <= 10; k += 4) H.addObstacle(SHOP.x + k, SHOP.z - 6.2, 2.1);
    const items = [...HATS.map(h => ({ ...h, kind: 'hat' })), ...COLORS.map(c => ({ ...c, kind: 'color' }))];
    pads = items.map((it, k) => {
      const row = it.kind === 'hat' ? (it.row || 0) : 1;
      const col = items.filter((o, q) => q < k && (o.kind === 'hat' ? (o.row || 0) : 1) === row).length;
      const x = SHOP.x - 9.5 + col * 3.8, z = SHOP.z - 2.4 + row * 4.4;
      const pad = new Me(new (T().CylinderGeometry)(1.15, 1.15, 0.1, 24), M(it.kind === 'hat' ? 0x9775fa : 0x20c997, { e: 0x111111, ei: 0.2 }));
      H.addObject(pad, x, 0.2, z);
      let show;
      if (it.kind === 'hat') { show = it.id === 'nohat' ? new (T().Group)() : makeHat(it.id); show.scale.setScalar(2); }
      else {
        show = new Me(new (T().SphereGeometry)(0.45, 20, 14), it.c != null ? M(it.c, { m: it.metal ? 0.7 : 0, r: it.metal ? 0.25 : 0.5 }) : M(0xffffff));
        if (it.c == null) show.material.color.setHex(0xdee2e6);
      }
      H.addObject(show, x, 1.5, z);
      const label = H.makeLabel(it.price ? `${it.name} ${it.price}🪙` : it.name, { scale: 3, size: 48, bg: '#102430' });
      H.addObject(label, x, 2.9, z);
      return { ...it, x, z, show };
    });
  }

  function owned(i, it) { return it.price === 0 || data[i].owned.includes(it.id); }
  function worn(i, it) {
    const d = data[i];
    return it.kind === 'hat' ? (d.hat || 'nohat') === it.id : (d.color || 'nocolor') === it.id;
  }
  function choose(p, it) {
    const i = p.index, d = data[i];
    if (!owned(i, it)) {
      if (!H.money.spend(i, it.price)) { H.toast(i, `Tarvitset ${it.price - H.money.get(i)} kolikkoa lisää 🪙`, true); H.beep(200, 0.2, 'sawtooth', 0.04); return; }
      d.owned.push(it.id);
      H.toast(i, `Ostit: ${it.name}! 🎉`);
      H.beep(784, 0.1, 'triangle', 0.06); setTimeout(() => H.beep(1046, 0.16, 'triangle', 0.06), 110);
    } else H.beep(660, 0.08, 'triangle', 0.05);
    if (it.kind === 'hat') d.hat = it.id === 'nohat' ? '' : it.id;
    else d.color = it.id === 'nocolor' ? '' : it.id;
    store(i); apply(p);
  }

  H.onStart(() => {
    active = !H.challenge; pads = [];
    for (const p of H.players) { p.__shop = null; apply(p); }   // varusteet näkyvät myös Haasteessa
    if (active) build();
  });
  H.onStop(() => { active = false; pads = []; });
  H.onUpdate(dt => {
    for (const p of H.players) { const h = p.__shop && p.__shop.hat; const pr = h && h.getObjectByName('propeller'); if (pr) pr.rotation.y += dt * 12; }
    if (!active) return;
    for (const pd of pads) pd.show.rotation.y += dt * 1.2;
    for (const p of H.players) {
      const i = p.index;
      const near = p.car == null && !p.rocket ? pads.find(pd => Math.hypot(p.pos.x - pd.x, p.pos.z - pd.z) < 1.4 && p.pos.y < 2) : null;
      if (!near) { H.hud(i, '', 'shop'); continue; }
      const k = KEY[i];
      let txt;
      if (worn(i, near)) txt = `${near.name} on päälläsi ✔`;
      else if (owned(i, near)) txt = `${near.name} · ${k} = pue päälle`;
      else txt = `${near.name} · ${near.price} 🪙 · ${k} = osta`;
      H.hud(i, '🛍️ ' + txt, 'shop');
      if (H.pressed(i, 'interact') && !worn(i, near)) choose(p, near);
    }
  });

  H.shop = {
    SHOP, HATS, COLORS, data: i => JSON.parse(JSON.stringify(data[i])), pads: () => pads.map(p => ({ id: p.id, kind: p.kind, x: p.x, z: p.z, price: p.price })),
    hatOf: i => H.players[i]?.__shop?.hat?.parent ? data[i].hat : '',
    bodyColor: i => H.players[i]?.group?.children[0].material.color.getHex(),
  };
})();
