// hunger.js – Nälkäpalkki, ruokakoju ja reppu (1.7).
// Nälkä 100 → 0 noin 7 minuutissa vapaassa pelissä (ei Haasteessa).
// Tyhjällä vatsalla: hitaampi kävely ja HP valuu hitaasti – mutta ei koskaan alle 25.
(function () {
  const H = window.HYYTE;
  // 1.9: aulan asetus "Nälkä" 5–40 min (hyyte-hunger-min, oletus 20) = kuinka kauan täydellä vatsalla jaksaa.
  // Juostessa nälkä kuluu 3× nopeammin.
  const hungerMin = () => { const v = +H.load('hunger-min', 20); return Number.isFinite(v) ? Math.max(5, Math.min(40, Math.round(v))) : 20; };
  let DRAIN = 100 / (hungerMin() * 60);   // %/s
  const HP_FLOOR = 25, BAG_MAX = 6;
  const STALL = { x: -52, z: -40 };
  const FOODS = [
    { id: 'pizza', name: 'Pizza', price: 6, food: 45, emoji: '🍕' },
    { id: 'makkara', name: 'Makkara', price: 3, food: 25, emoji: '🌭' },
    { id: 'jaatelo', name: 'Jäätelö', price: 2, food: 12, emoji: '🍦' },
    { id: 'banaani', name: 'Banaani', price: 1, food: 10, emoji: '🍌' },
    { id: 'korvapuusti', name: 'Korvapuusti', price: 3, food: 20, emoji: '🥐' },
    { id: 'keitto', name: 'Keitto', price: 5, food: 40, emoji: '🍲' },
    { id: 'sushi', name: 'Sushi', price: 7, food: 38, emoji: '🍣' },
    { id: 'hamppari', name: 'Hampurilainen', price: 5, food: 42, emoji: '🍔' },
    { id: 'taco', name: 'Taco', price: 4, food: 28, emoji: '🌮' },
    { id: 'donitsi', name: 'Donitsi', price: 2, food: 15, emoji: '🍩' },
    { id: 'salaatti', name: 'Salaatti', price: 4, food: 22, emoji: '🥗' },
    { id: 'smoothie', name: 'Smoothie', price: 3, food: 18, emoji: '🥤' },
    { id: 'karkkipussi', name: 'Karkkipussi', price: 2, food: 8, emoji: '🍬' },
    { id: 'pannukakku', name: 'Pannukakku', price: 4, food: 30, emoji: '🥞' },
  ];
  // muut reppuun mahtuvat tavarat (palkintoja töistä)
  const ITEMS = {
    paketti: { name: 'Lahjapaketti', emoji: '🎁' }, villa: { name: 'Villakerä', emoji: '🧶' },
    pokaali: { name: 'Pokaali', emoji: '🏆' }, kypara: { name: 'Palokypärä', emoji: '⛑️' },
  };
  FOODS.forEach(f => ITEMS[f.id] = f);
  const EAT_LABEL = H.KEYS('eat');
  const BUY_KEY = H.KEYS('interact');
  const st = Array.from({length:12},(_,i)=>mk(i));
  let active = false, pads = [], hpAcc = Array(12).fill(0);

  function mk(i) {
    const d = H.load('bag-p' + (i + 1), null) || {};
    return { hunger: typeof d.hunger === 'number' ? Math.max(30, Math.min(100, d.hunger)) : 100, bag: Array.isArray(d.bag) ? d.bag.filter(x => ITEMS[x]).slice(0, BAG_MAX) : [] };
  }
  function store(i) { H.save('bag-p' + (i + 1), { hunger: Math.round(st[i].hunger), bag: st[i].bag }); }
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.6, metalness: 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0 });

  /** Pieni 3D-malli tavarasta (n. 0.5 m, pohja y=0). Käytetään kojussa ja kodin hyllyillä. */
  function makeItem(id) {
    const g = new (T().Group)(), Me = T().Mesh, G = T();
    const add = (geo, m, x = 0, y = 0, z = 0, rx = 0, rz = 0) => { const o = new Me(geo, m); o.position.set(x, y, z); o.rotation.x = rx; o.rotation.z = rz; o.castShadow = true; g.add(o); return o; };
    switch (id) {
      case 'pizza': add(new G.CylinderGeometry(0.3, 0.3, 0.05, 20), M(0xf4a340), 0, 0.03);
        add(new G.CylinderGeometry(0.26, 0.26, 0.02, 20), M(0xe03131), 0, 0.065);
        for (let k = 0; k < 5; k++) add(new G.CylinderGeometry(0.04, 0.04, 0.02, 8), M(0x862e2e), Math.sin(k * 1.3) * 0.15, 0.08, Math.cos(k * 1.3) * 0.15); break;
      case 'makkara': add(new G.CapsuleGeometry(0.06, 0.36, 4, 10), M(0xc0582b), 0, 0.08, 0, 0, Math.PI / 2);
        add(new G.CapsuleGeometry(0.08, 0.3, 4, 10), M(0xf2d29b), 0, 0.04, 0, 0, Math.PI / 2); break;
      case 'jaatelo': add(new G.ConeGeometry(0.1, 0.3, 14), M(0xd9a35b), 0, 0.15, 0, Math.PI);
        add(new G.SphereGeometry(0.12, 14, 10), M(0xfcc2d7), 0, 0.33); add(new G.SphereGeometry(0.1, 14, 10), M(0xfff3bf), 0, 0.45); break;
      case 'banaani': { const t = add(new G.TorusGeometry(0.18, 0.05, 8, 16, 2.2), M(0xffe066), 0, 0.22); t.rotation.z = 3.9; break; }
      case 'korvapuusti': add(new G.TorusGeometry(0.12, 0.07, 10, 18), M(0xc47a2c), 0, 0.07, 0, Math.PI / 2);
        add(new G.SphereGeometry(0.08, 10, 8), M(0x8f5420), 0, 0.1); break;
      case 'keitto': add(new G.CylinderGeometry(0.2, 0.14, 0.16, 18), M(0xffffff), 0, 0.08);
        add(new G.CylinderGeometry(0.18, 0.18, 0.02, 18), M(0xf08c00), 0, 0.155); break;
      case 'sushi': add(new G.CylinderGeometry(0.14, 0.14, 0.1, 16), M(0x212529), 0, 0.05);
        add(new G.CylinderGeometry(0.1, 0.1, 0.08, 16), M(0xff6b6b), 0, 0.08); break;
      case 'hamppari': add(new G.CylinderGeometry(0.22, 0.22, 0.07, 16), M(0xf4a261), 0, 0.04);
        add(new G.CylinderGeometry(0.2, 0.2, 0.05, 16), M(0x2f9e44), 0, 0.09);
        add(new G.CylinderGeometry(0.21, 0.21, 0.05, 16), M(0x8d5524), 0, 0.13);
        add(new G.CylinderGeometry(0.22, 0.22, 0.07, 16), M(0xf4a261), 0, 0.18); break;
      case 'taco': add(new G.TorusGeometry(0.16, 0.07, 8, 12, Math.PI), M(0xffd43b), 0, 0.12); break;
      case 'donitsi': add(new G.TorusGeometry(0.14, 0.06, 10, 18), M(0xffa8a8, { e: 0xff8787, ei: 0.2 }), 0, 0.08, 0, Math.PI / 2); break;
      case 'salaatti': add(new G.SphereGeometry(0.18, 10, 8), M(0x40c057), 0, 0.15); break;
      case 'smoothie': add(new G.CylinderGeometry(0.08, 0.1, 0.28, 12), M(0xbe4bdb, { e: 0x9c36b5, ei: 0.3 }), 0, 0.14); break;
      case 'karkkipussi': add(new G.BoxGeometry(0.22, 0.28, 0.12), M(0xff6b6b), 0, 0.14);
        add(new G.BoxGeometry(0.24, 0.06, 0.14), M(0xffd43b), 0, 0.26); break;
      case 'pannukakku': add(new G.CylinderGeometry(0.22, 0.22, 0.04, 16), M(0xf4a261), 0, 0.03);
        add(new G.CylinderGeometry(0.2, 0.2, 0.04, 16), M(0xe8590c), 0, 0.07);
        add(new G.CylinderGeometry(0.18, 0.18, 0.04, 16), M(0xffd43b), 0, 0.11); break;
      case 'paketti': add(new G.BoxGeometry(0.34, 0.3, 0.34), M(0xe64980), 0, 0.15);
        add(new G.BoxGeometry(0.36, 0.31, 0.07), M(0xffd43b), 0, 0.155); add(new G.BoxGeometry(0.07, 0.31, 0.36), M(0xffd43b), 0, 0.155); break;
      case 'villa': add(new G.SphereGeometry(0.18, 14, 10), M(0xf8f9fa, { r: 1 }), 0, 0.18); break;
      case 'pokaali': { const m = M(0xfcc419, { e: 0x6b4d00, ei: 0.4 }); add(new G.CylinderGeometry(0.12, 0.12, 0.06, 14), m, 0, 0.03);
        add(new G.CylinderGeometry(0.03, 0.03, 0.16, 8), m, 0, 0.14); add(new G.CylinderGeometry(0.16, 0.06, 0.2, 16), m, 0, 0.32); break; }
      case 'kypara': add(new G.SphereGeometry(0.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0xe03131), 0, 0.05);
        add(new G.CylinderGeometry(0.26, 0.26, 0.03, 16), M(0xe03131), 0, 0.05); break;
      default: add(new G.BoxGeometry(0.3, 0.3, 0.3), M(0xadb5bd), 0, 0.15);
    }
    return g;
  }

  function addToBag(i, id, quiet) {
    if (!ITEMS[id]) return false;
    if (st[i].bag.length >= BAG_MAX) { if (!quiet) H.toast(i, 'Reppu on täynnä! Vie tavaroita kotiin arkkuun 🏠', true); return false; }
    st[i].bag.push(id); store(i); return true;
  }
  function eat(i, id) {
    const f = FOODS.find(x => x.id === id); if (!f) return false;
    st[i].hunger = Math.min(100, st[i].hunger + f.food); store(i);
    H.toast(i, `Nam! ${f.emoji} ${f.name} +${f.food} ruokaa`); H.emit?.('eat', i, f.id);
    H.beep(523, 0.08, 'triangle', 0.05); setTimeout(() => H.beep(784, 0.1, 'triangle', 0.05), 90);
    return true;
  }
  function eatFromBag(i) {
    const s = st[i];
    // syö ruoka joka täyttää vatsan parhaiten tuhlaamatta
    const need = 100 - s.hunger;
    const foods = s.bag.filter(x => FOODS.some(f => f.id === x));
    if (!foods.length) { H.toast(i, 'Repussa ei ole ruokaa – osta ruokakojusta 🍔', true); return false; }
    foods.sort((a, b) => Math.abs(ITEMS[a].food - need) - Math.abs(ITEMS[b].food - need));
    s.bag.splice(s.bag.indexOf(foods[0]), 1);
    return eat(i, foods[0]);
  }

  function build() {
    const Me = T().Mesh, G = T();
    const g = new G.Group();
    const floor = new Me(new G.BoxGeometry(30, 0.16, 11), M(0xffe8cc)); floor.position.y = 0.08; floor.receiveShadow = true; g.add(floor);
    const counter = new Me(new G.BoxGeometry(29, 1.0, 1.2), M(0xd9480f)); counter.position.set(0, 0.5, -4.2); counter.castShadow = true; g.add(counter);
    for (let k = 0; k < 12; k++) { const s = new Me(new G.BoxGeometry(2.4, 0.15, 2.2), M(k % 2 ? 0xffffff : 0x2f9e44)); s.position.set(-13.2 + k * 2.4, 3.6, -3.8); s.rotation.x = 0.3; g.add(s); }
    for (const x of [-14.2, 14.2]) { const p = new Me(new G.CylinderGeometry(0.12, 0.12, 3.6, 8), M(0x495057)); p.position.set(x, 1.8, -4.5); g.add(p); }
    const sign = H.makeLabel('🍔 RUOKATORI 2.0', { bg: '#2b8a3e', scale: 7 }); sign.position.set(0, 5, -4.5); g.add(sign);
    H.addObject(g, STALL.x, 0, STALL.z);
    for (let k = -12; k <= 12; k += 2.5) H.addObstacle(STALL.x + k, STALL.z - 4.5, 0.9);
    // 2.0: kaksi riviä ruokia
    pads = FOODS.map((f, k) => {
      const cols = 7;
      const row = Math.floor(k / cols), col = k % cols;
      const x = STALL.x - 11.5 + col * 3.6, z = STALL.z + row * 3.2;
      H.addObject(new Me(new G.CylinderGeometry(1.05, 1.05, 0.1, 24), M(0xfab005, { e: 0x111111, ei: 0.2 })), x, 0.2, z);
      const show = makeItem(f.id); show.scale.setScalar(2.2); H.addObject(show, x, 1.05, z - 2.2);
      const label = H.makeLabel(`${f.emoji} ${f.name} ${f.price}🪙`, { scale: 2.8, size: 40, bg: '#102430' }); H.addObject(label, x, 2.3, z - 1.5);
      return { ...f, x, z, show };
    });
  }

  function hudBar(i) {
    if (!active) { H.hud(i, '', 'hunger'); return; }
    const s = st[i], v = Math.round(s.hunger), low = v <= 20;
    const bag = s.bag.map(x => ITEMS[x].emoji).join('');
    H.hud(i, `<span class="hgr${low ? ' low' : ''}" title="Nälkä">🍽️<b><i style="width:${v}%"></i></b>${v}%${v <= 0 ? ' · nälkä! syö' : ''}</span>${bag ? ` <span class="bag">🎒${bag} <small>${EAT_LABEL[i]}=syö</small></span>` : ''}`, 'hunger');
  }

  H.onStart(() => {
    active = !H.challenge; pads = []; hpAcc = Array(12).fill(0); DRAIN = 100 / (hungerMin() * 60);
    for (const p of H.players) p.speedMul = 1;
    if (active) build();
    H.players.forEach(p => hudBar(p.index));
  });
  H.onStop(() => { active = false; pads = []; for (let i = 0; i < 4; i++) store(i); });
  let saveT = 0;
  H.onUpdate(dt => {
    if (!active) return;
    for (const pd of pads) pd.show.rotation.y += dt * 1.1;
    for (const p of H.players) {
      const i = p.index, s = st[i];
      s.hunger = Math.max(0, s.hunger - DRAIN * (p.running ? 3 : 1) * dt);
      const empty = s.hunger <= 0;
      p.speedMul = empty ? 0.7 : s.hunger < 15 ? 0.9 : 1;
      if (empty && p.hp > HP_FLOOR) { hpAcc[i] += dt; if (hpAcc[i] >= 2) { hpAcc[i] = 0; p.hp = Math.max(HP_FLOOR, p.hp - 1); } } else hpAcc[i] = 0;
      if (H.pressed(i, 'eat')) eatFromBag(i);
      // ruokakoju
      const near = p.car == null && !p.rocket ? pads.find(pd => Math.hypot(p.pos.x - pd.x, p.pos.z - pd.z) < 1.4 && p.pos.y < 2) : null;
      if (near) {
        H.hud(i, `🍔 ${near.emoji} ${near.name} · ${near.price} 🪙 · +${near.food} ruokaa · ${BUY_KEY[i]} = osta`, 'food');
        if (H.pressed(i, 'interact')) buy(i, near);
      } else H.hud(i, '', 'food');
      hudBar(i);
    }
    if ((saveT += dt) > 10) { saveT = 0; H.players.forEach(p => store(p.index)); }
  });
  function buy(i, f) {
    if (!H.money.spend(i, f.price)) { H.toast(i, `Tarvitset ${f.price - H.money.get(i)} kolikkoa lisää 🪙`, true); H.beep(200, 0.2, 'sawtooth', 0.04); return; }
    if (addToBag(i, f.id, true)) { H.toast(i, `Ostit: ${f.emoji} ${f.name}! Reppuun – ${EAT_LABEL[i]} = syö`); H.beep(784, 0.1, 'triangle', 0.06); }
    else eat(i, f.id);   // reppu täynnä → syödään heti
  }

  H.hunger = {
    FOODS, ITEMS, STALL, BAG_MAX, makeItem, addToBag, eat, eatFromBag,
    get: i => st[i].hunger, drain: () => DRAIN, minutes: hungerMin, set: (i, v) => { st[i].hunger = Math.max(0, Math.min(100, v)); },
    bag: i => st[i].bag.slice(), setBag: (i, arr) => { st[i].bag = arr.filter(x => ITEMS[x]).slice(0, BAG_MAX); store(i); },
    takeBag: i => { const b = st[i].bag; st[i].bag = []; store(i); return b; },
    pads: () => pads.map(p => ({ id: p.id, x: p.x, z: p.z, price: p.price })), active: () => active,
  };
})();
