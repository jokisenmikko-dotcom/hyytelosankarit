// coop.js – 3.1: 12 yhteistyöideaa (kylän arkku, auttamispisteet, onnenketju,
// pihapuutarha, talkoot, toripäivä, pelastus, paraati, keittiöilta, sirkusshow,
// rakennusprojekti, kuun tukikohta). Erä A toimii myös yksin; erä B alkaa 2 pelaajalla.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.7, metalness: o.m ?? 0,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op, opacity: o.op ?? 1,
  });
  const KEY = (i) => H.KEYS('interact')[i];
  const nP = () => (H.players || []).length;
  const alive = () => (H.players || []).filter(p => p && p.pos);
  const pos = (p) => H.posOf ? H.posOf(p) : p.pos;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const now = () => H.time || 0;

  const LOC = {
    chest: { x: 8, z: -52 },
    radio: { x: 14, z: -52 },
    parade: { x: 0, z: -58 },
    garden: { x: 0, z: -148 },
    market: { x: -40, z: -28 },
    build: { x: 40, z: -120 },
    sea: { x: -108, z: 36 },
    harbor: { x: -80, z: 22 },
    moon: { x: 12, z: 1588 },
    flag: { x: 40, z: 1620 },
    show: { x: 620, z: -10 },
  };
  const PARADE_WP = [
    { x: 0, z: -58 }, { x: 20, z: -40 }, { x: 20, z: -20 }, { x: 0, z: -20 }, { x: 0, z: -58 },
  ];
  const SNOW = [
    { x: -16, z: -152 }, { x: 16, z: -152 }, { x: -8, z: -158 }, { x: 12, z: -142 },
  ];
  const BUILD_STAGES = [
    { id: 'silta', name: 'Silta', emoji: '🌉', need: { lauta: 2, naula: 2 } },
    { id: 'maja', name: 'Maja', emoji: '🛖', need: { lauta: 2, tiili: 2 } },
    { id: 'majakka', name: 'Majakka', emoji: '🗼', need: { tiili: 2, lasi: 1, lamppu: 1 } },
  ];
  const KITCHEN_NEED = ['jauhot', 'kala', 'maito', 'tomaatti', 'sieni'];
  const PARTS = [
    { id: 'lauta', name: 'Lauta', emoji: '🪵' },
    { id: 'naula', name: 'Naula', emoji: '📌' },
    { id: 'tiili', name: 'Tiili', emoji: '🧱' },
    { id: 'lasi', name: 'Lasi', emoji: '🪟' },
    { id: 'lamppu', name: 'Lamppu', emoji: '💡' },
    { id: 'porkkana', name: 'Porkkana', emoji: '🥕', food: 12 },
    { id: 'juhlailta', name: 'Juhlaillallinen', emoji: '🍲', food: 60 },
  ];
  const CHEST_MAX = 40;
  const TALK_THRESH = 15;
  const MONEY_CAP = 24; // coop-raha / pelaaja / sessio
  const HELP_CD = {
    chest: 8, rake: 2, forage: 4, shovel: 3, repair: 6, food: 4,
    rescue: 12, garden: 5, market: 6, kitchen: 10, show: 20, build: 4, moon: 20, parade: 20,
  };

  let active = false;
  let helpPts = Array(12).fill(0);
  let helpCd = Array.from({ length: 12 }, () => ({}));
  let moneyGot = Array(12).fill(0);
  let chestItems = [];
  let garden = [];
  let snow = [];
  let talkoot = { meter: 0, lastBonus: -999, bonuses: 0 };
  let market = { stock: [], shares: {}, lastSell: -999, selling: false, t: 0 };
  let rescueCd = {};
  let stuckOverride = {}; // test: i -> 'moon'|'sea'|'circus'
  let parade = null;
  let kitchen = null;
  let show = null;
  let build = { stage: 0, have: {}, brought: {}, done: false };
  let moonbase = null;
  let confetti = [];
  let roots = {};
  let hudT = 0;

  function registerItems() {
    const hung = H.hunger; if (!hung || !hung.ITEMS) return;
    PARTS.forEach((f) => {
      if (!hung.ITEMS[f.id]) hung.ITEMS[f.id] = f;
      if (f.food && hung.FOODS && !hung.FOODS.find(x => x.id === f.id))
        hung.FOODS.push({ ...f, price: 0 });
    });
  }

  function box(w, h, d, mat, x, y, z, parent) {
    const m = new (T().Mesh)(new (T().BoxGeometry)(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (parent) parent.add(m); return m;
  }
  function cyl(rt, rb, h, mat, x, y, z, parent, seg = 16) {
    const m = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, seg), mat);
    m.position.set(x, y, z); m.castShadow = true;
    if (parent) parent.add(m); return m;
  }
  function put(g, x, y, z, label, scale = 3.2, bg) {
    H.addObject(g, x, y, z);
    if (label) {
      const l = H.makeLabel(label, { scale, size: 48, bg: bg || '#102430' });
      H.addObject(l, x, y + 2.4, z);
      return l;
    }
  }

  function helpAdd(i, reason, pts) {
    if (i == null || i < 0) return 0;
    pts = Math.max(0, pts | 0);
    if (!pts) return 0;
    const t = now();
    const cd = HELP_CD[reason] || 5;
    const key = reason;
    if ((helpCd[i][key] || 0) + cd > t && helpCd[i][key] !== undefined) return 0;
    helpCd[i][key] = t;
    helpPts[i] = (helpPts[i] || 0) + pts;
    H.emit?.('help', i, reason, pts);
    return pts;
  }
  function helpGet(i) { return helpPts[i] | 0; }

  function pay(i, n, reason) {
    n = Math.round(n);
    if (!(n > 0) || i == null) return 0;
    const left = Math.max(0, MONEY_CAP - (moneyGot[i] || 0));
    n = Math.min(n, left);
    if (!n) return 0;
    moneyGot[i] = (moneyGot[i] || 0) + n;
    H.money?.add?.(i, n, reason);
    return n;
  }

  function nearestFriend(i, maxD) {
    const me = H.players[i]; if (!me) return null;
    const q = pos(me);
    let best = null, bd = maxD ?? 1e9;
    for (const p of alive()) {
      if (p.index === i) continue;
      const d = dist(q, pos(p));
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  function luck(i, sec, msg) {
    try {
      if (H.cooking?.grantLuck) H.cooking.grantLuck(i, sec);
      else if (H.v22?.setLuck) H.v22.setLuck(i, Math.max(H.v22.luckT?.()[i] || 0, sec));
      else { H._luck = H._luck || []; H._luck[i] = Math.max(H._luck[i] || 0, sec); if (msg !== false) H.toast(i, `🍀 Onni ${sec} s`); }
    } catch (e) {}
  }

  /* ---------- 12 kylän arkku ---------- */
  function chestLoad() {
    const d = H.load('village-chest', null);
    chestItems = Array.isArray(d) ? d.filter(x => H.hunger?.ITEMS?.[x]).slice(0, CHEST_MAX) : [];
  }
  function chestSave() { H.save('village-chest', chestItems.slice()); }
  function chestDeposit(i, id) {
    if (!id) {
      const bag = H.hunger?.bag?.(i) || [];
      id = bag[0];
    }
    if (!id || !H.hunger?.ITEMS?.[id]) return false;
    if (chestItems.length >= CHEST_MAX) { H.toast(i, 'Kylän arkku on täynnä', true); return false; }
    const bag = H.hunger.bag(i);
    const ix = bag.indexOf(id);
    if (ix < 0) { H.toast(i, 'Ei tätä tavaraa repussa', true); return false; }
    const next = bag.slice(); next.splice(ix, 1);
    H.hunger.setBag(i, next);
    chestItems.push(id);
    chestSave();
    helpAdd(i, 'chest', 1);
    const info = H.hunger.ITEMS[id];
    H.toast(i, `Vein arkkuun: ${info.emoji || ''} ${info.name}`);
    H.beep(620, 0.08, 'triangle', 0.04);
    return true;
  }
  function chestWithdraw(i, id) {
    if (!id) id = chestItems[0];
    const ix = chestItems.indexOf(id);
    if (ix < 0) { H.toast(i, 'Arkussa ei ole tätä', true); return false; }
    if (!H.hunger.addToBag(i, id)) { H.toast(i, 'Reppu täynnä', true); return false; }
    chestItems.splice(ix, 1);
    chestSave();
    const info = H.hunger.ITEMS[id];
    H.toast(i, `Otit arkusta: ${info.emoji || ''} ${info.name}`);
    H.beep(784, 0.08, 'triangle', 0.04);
    return true;
  }
  function openChest(p) {
    if (H.menuPad?.open) return;
    const bag = H.hunger?.bag?.(p.index) || [];
    const items = [
      ...bag.map((id, k) => {
        const info = H.hunger.ITEMS[id] || { name: id, emoji: '📦' };
        return { id: 'in:' + k + ':' + id, act: 'in', item: id, html: `📥 Vie arkkuun: ${info.emoji} ${info.name}` };
      }),
      ...chestItems.map((id, k) => {
        const info = H.hunger.ITEMS[id] || { name: id, emoji: '📦' };
        return { id: 'out:' + k + ':' + id, act: 'out', item: id, html: `📤 Ota arkusta: ${info.emoji} ${info.name}` };
      }),
    ];
    if (!items.length) {
      H.toast(p.index, 'Arkku ja reppu ovat tyhjiä');
      return;
    }
    H.menuPad.show({
      owner: p.index,
      title: `📦 Kylän arkku (${chestItems.length}/${CHEST_MAX})`,
      keepOpen: true,
      items,
      onSelect: (it) => {
        if (it.act === 'in') chestDeposit(p.index, it.item);
        else chestWithdraw(p.index, it.item);
        H.menuPad.close();
        setTimeout(() => openChest(p), 40);
      },
    });
  }

  /* ---------- 7 onnenketju ---------- */
  let luckChainCd = -999;
  function luckChain(fromI) {
    const t = now();
    if (t < luckChainCd + 30) return null;
    const f = nearestFriend(fromI, 48);
    if (!f) return null;
    luckChainCd = t;
    luck(f.index, 20);
    H.toast(f.index, '🍀 Onnenketju! Kaverin hyvyys tarttui');
    H.toast(fromI, `Onni tarttui pelaajaan ${f.index + 1}`);
    helpAdd(fromI, 'food', 2);
    return f.index;
  }

  /* ---------- 1 puutarha ---------- */
  function plotCount() {
    const n = nP();
    return n >= 6 ? 8 : n >= 3 ? 6 : 4;
  }
  function syncPlots() {
    const n = plotCount();
    while (garden.length < n) {
      const k = garden.length;
      const col = k % 4, row = (k / 4) | 0;
      const x = LOC.garden.x + (col - 1.5) * 2.2;
      const z = LOC.garden.z + (row - 0.5) * 2.4;
      const g = new (T().Group)();
      box(1.6, 0.18, 1.6, M(0x6b4423), 0, 0.09, 0, g);
      const soil = box(1.4, 0.08, 1.4, M(0x5c4033), 0, 0.18, 0, g);
      const plant = cyl(0.05, 0.02, 0.01, M(0x2f9e44), 0, 0.2, 0, g);
      plant.visible = false;
      const veg = cyl(0.08, 0.06, 0.28, M(0xe8590c), 0, 0.4, 0, g);
      veg.visible = false;
      H.addObject(g, x, 0, z);
      garden.push({ x, z, g, soil, plant, veg, state: 'dry', wet: 0, grow: 0, watered: {}, marker: g });
    }
  }
  function gardenWater(i, idx) {
    const pl = garden[idx]; if (!pl) return false;
    if (pl.state === 'ripe') { H.toast(i, 'Sato on valmis poimittavaksi!'); return false; }
    pl.wet = Math.min(1, pl.wet + 0.5);
    pl.watered[i] = (pl.watered[i] || 0) + 1;
    if (pl.state === 'dry') pl.state = 'wet';
    pl.soil.material.color.setHex(0x3d2b1f);
    pl.plant.visible = true;
    pl.plant.scale.set(1, 4, 1);
    helpAdd(i, 'garden', 1);
    H.toast(i, 'Kastelit puutarhaa 💧');
    H.beep(660, 0.06, 'sine', 0.03);
    return true;
  }
  function gardenGrowNow() {
    garden.forEach((pl) => {
      if (pl.state === 'dry') return;
      pl.state = 'ripe'; pl.grow = 1; pl.wet = 1;
      pl.plant.visible = true; pl.plant.scale.set(1, 14, 1);
      pl.veg.visible = true;
    });
  }
  function gardenHarvest(i, idx) {
    const pl = idx != null ? garden[idx] : garden.find(p => p.state === 'ripe');
    if (!pl || pl.state !== 'ripe') { H.toast(i, 'Ei vielä satoa', true); return []; }
    const who = Object.keys(pl.watered).map(Number);
    let rec = who.length ? who : [i];
    // sato jaetaan kaikille paikalla oleville kastelijoille; jos ei kastelijoita, kaikille pelaajille
    if (!rec.length) rec = alive().map(p => p.index);
    const given = [];
    rec.forEach((pi) => {
      if (H.hunger?.addToBag(pi, 'porkkana')) {
        given.push(pi);
        H.toast(pi, '🥕 Satoa puutarhasta!');
      } else {
        if (chestItems.length < CHEST_MAX) { chestItems.push('porkkana'); chestSave(); H.toast(pi, 'Sato arkkuun (reppu täynnä)'); given.push(pi); }
      }
    });
    // lisäsato jos useita pelaajia
    if (nP() >= 3 && H.hunger?.addToBag(i, 'omena')) given.push(i);
    pl.state = 'dry'; pl.wet = 0; pl.grow = 0; pl.watered = {};
    pl.plant.visible = false; pl.veg.visible = false;
    pl.soil.material.color.setHex(0x5c4033);
    helpAdd(i, 'garden', 2);
    pay(i, 1, '+1 🪙 sadosta');
    return given;
  }

  /* ---------- 3 talkoot ---------- */
  function talkootAdd(i, kind, n = 1) {
    talkoot.meter += n;
    helpAdd(i, kind === 'rake' ? 'rake' : kind === 'sieni' ? 'forage' : 'shovel', 1);
    if (talkoot.meter >= TALK_THRESH && now() - talkoot.lastBonus > 75 && talkoot.bonuses < 3) {
      talkootTrigger();
    }
  }
  function talkootTrigger() {
    talkoot.meter = 0;
    talkoot.lastBonus = now();
    talkoot.bonuses++;
    alive().forEach((p) => {
      luck(p.index, 15);
      pay(p.index, 2, '🏘️ Kyläbonus! Talkoot palkitsivat');
    });
    H.beep(523, 0.12, 'triangle', 0.05);
    return true;
  }
  function shovelSnow(i, idx) {
    const s = snow[idx]; if (!s || s.left <= 0) return false;
    s.left = Math.max(0, s.left - 1);
    if (s.g) s.g.scale.setScalar(0.35 + s.left / s.max * 0.65);
    if (s.left <= 0) { if (s.g) s.g.visible = false; s.respawn = 40; }
    talkootAdd(i, 'shovel', 2);
    H.toast(i, 'Luojit lunta ❄️');
    return true;
  }

  /* ---------- 9 toripäivä ---------- */
  function marketContribute(i, id) {
    if (!id) {
      const bag = H.hunger?.bag?.(i) || [];
      id = bag.find(x => x && !H.cooking?.isCooked?.(x)) || bag[0];
    }
    const bag = H.hunger?.bag?.(i) || [];
    const ix = bag.indexOf(id);
    if (ix < 0) { H.toast(i, 'Ei vietävää tavaraa', true); return false; }
    const next = bag.slice(); next.splice(ix, 1);
    H.hunger.setBag(i, next);
    market.stock.push({ id, by: i });
    market.shares[i] = (market.shares[i] || 0) + 1;
    helpAdd(i, 'market', 1);
    const info = H.hunger.ITEMS[id] || { name: id, emoji: '🧺' };
    H.toast(i, `Vein torille: ${info.emoji} ${info.name} (${market.stock.length} kojuun)`);
    return true;
  }
  function marketSell() {
    if (now() - market.lastSell < 45) return { ok: false, reason: 'cooldown' };
    if (!market.stock.length) return { ok: false, reason: 'empty' };
    const n = market.stock.length;
    const total = Math.min(16, n * 2);
    const shareKeys = Object.keys(market.shares).map(Number);
    const who = shareKeys.length ? shareKeys : [0];
    const each = Math.max(1, Math.floor(total / who.length));
    const paid = {};
    who.forEach((i) => { paid[i] = pay(i, Math.min(8, each), `🛒 Toripäivä: +${Math.min(8, each)} 🪙`); });
    market.stock = [];
    market.shares = {};
    market.lastSell = now();
    helpAdd(who[0], 'market', 2);
    return { ok: true, total, paid, n };
  }
  function openMarket(p) {
    if (H.menuPad?.open) return;
    const bag = H.hunger?.bag?.(p.index) || [];
    const items = [
      ...bag.map((id, k) => {
        const info = H.hunger.ITEMS[id] || { name: id, emoji: '🧺' };
        return { id: 'stk:' + k, act: 'stock', item: id, html: `📥 Täytä kojua: ${info.emoji} ${info.name}` };
      }),
      { id: 'sell', act: 'sell', disabled: !market.stock.length, html: `💰 Myy kojun tavarat (${market.stock.length} kpl, voitto jaetaan)` },
    ];
    H.menuPad.show({
      owner: p.index,
      title: '🛒 Toripäivä – yhteinen koju',
      items,
      onSelect: (it) => {
        if (it.act === 'stock') marketContribute(p.index, it.item);
        else {
          const r = marketSell();
          if (!r.ok) H.toast(p.index, r.reason === 'cooldown' ? 'Toripäivä on juuri pidetty – odota hetki' : 'Koju on tyhjä', true);
        }
      },
    });
  }

  /* ---------- 2 pelastuspartio ---------- */
  function inSea(p) {
    return dist(pos(p), LOC.sea) < 4.5;
  }
  function stuckReason(p) {
    const i = p.index;
    if (stuckOverride[i]) return stuckOverride[i];
    if (p.moon && (!p._bodyId || p._bodyId === 'moon')) return 'moon';
    if (p._bodyId && p._bodyId !== 'moon') return 'moon'; // muu kappale: myös pelastettavissa
    if (H.circus?.inside?.(i)) return 'circus';
    if (inSea(p)) return 'sea';
    return null;
  }
  function markStuck(i, kind) { stuckOverride[i] = kind || 'sea'; return stuckOverride[i]; }
  function clearStuck(i) { delete stuckOverride[i]; }
  function rescueSafe(target, kind) {
    const p = typeof target === 'number' ? H.players[target] : target;
    if (!p) return;
    p.lock = false; p.rocket = false; p.car = null; p.speed = 0; p.vy = 0; p.air = 'none'; p.grounded = true;
    if (kind === 'moon') {
      // kuussa: palauta laskualustalle; muuten Maahan kylään
      if (p.moon || p._bodyId) {
        try { if (p._bodyId && p._bodyId !== 'moon' && H.v24?.returnToEarth) H.v24.returnToEarth(p); } catch (e) {}
        p.moon = true; p._bodyId = p._bodyId || 'moon';
        p.pos.set(0, 1.5, 1576);
      } else {
        p.pos.set(LOC.radio.x, 0.1, LOC.radio.z + 3);
      }
    } else if (kind === 'circus') {
      try { H.circus.leave(p); } catch (e) { p.pos.set(120, 0.1, -31); }
    } else {
      // meri
      p.pos.set(LOC.harbor.x, 0.1, LOC.harbor.z);
    }
    clearStuck(p.index);
  }
  function doRescue(rescuerI, targetI) {
    if (rescuerI === targetI) { H.toast(rescuerI, 'Et voi pelastaa itseäsi – pyydä kaveria!', true); return false; }
    const t = H.players[targetI]; if (!t) return false;
    const kind = stuckReason(t);
    if (!kind) { H.toast(rescuerI, 'Kaveri ei ole jumissa', true); return false; }
    const key = rescuerI + '>' + targetI;
    if (rescueCd[key] != null && rescueCd[key] + 20 > now()) { H.toast(rescuerI, 'Pelastus jäähtyy…', true); return false; }
    rescueCd[key] = now();
    rescueSafe(t, kind);
    helpAdd(rescuerI, 'rescue', 3);
    pay(rescuerI, 2, '📡 Pelastuspartio! +2 🪙');
    luck(rescuerI, 12, false);
    luck(targetI, 12, false);
    const where = kind === 'moon' ? 'kuusta/avaruudesta' : kind === 'circus' ? 'sirkuksesta' : 'mereltä';
    H.toast(rescuerI, `Lähetit pelastuksen ${where} pelaajalle ${targetI + 1}`);
    H.toast(targetI, `Pelaaja ${rescuerI + 1} pelasti sinut ${where}!`);
    H.beep(880, 0.12, 'triangle', 0.05);
    return true;
  }
  function openRescue(p) {
    if (H.menuPad?.open) return;
    const stuck = alive().filter(o => o.index !== p.index && stuckReason(o));
    if (!stuck.length) { H.toast(p.index, 'Kukaan ei ole juuri nyt jumissa'); return; }
    H.menuPad.show({
      owner: p.index,
      title: '📡 Pelastuspartio',
      items: stuck.map((o) => ({
        id: 'r' + o.index, target: o.index,
        html: `🆘 Pelaaja ${o.index + 1} · ${stuckReason(o) === 'moon' ? '🌙 kuu/avaruus' : stuckReason(o) === 'circus' ? '🎪 sirkus' : '🌊 meri'}`,
      })),
      onSelect: (it) => doRescue(p.index, it.target),
    });
  }

  /* ---------- 11 paraati ---------- */
  function paradeCanStart() { return nP() >= 2; }
  function paradeStart(i) {
    if (nP() < 2) { H.toast(i, 'Paraatiin tarvitaan vähintään 2 pelaajaa', true); return false; }
    if (parade && parade.active) { paradeJoin(i); return true; }
    parade = {
      active: true, t: 0, members: {}, lastWp: {},
      confetti: false, startedBy: i,
    };
    paradeJoin(i);
    // auto-kutsu läheiset
    alive().forEach((p) => {
      if (p.index !== i && dist(pos(p), LOC.parade) < 8) paradeJoin(p.index);
    });
    if (Object.keys(parade.members).length < 2) {
      // merkitse aloittaja odottamaan
      H.toast(i, '🎺 Paraati odottaa toista osallistujaa…');
    } else {
      H.toast(i, '🎺 Paraati lähti käyntiin! Seuraa reittiä');
    }
    return true;
  }
  function paradeJoin(i) {
    if (!parade || !parade.active) return false;
    if (parade.members[i]) return true;
    parade.members[i] = true;
    parade.lastWp[i] = 0;
    H.toast(i, 'Liityit paraatiin! Seuraa reittiä 🎉');
    return true;
  }
  function paradeAdvance(i, to) {
    if (!parade || !parade.active || !parade.members[i]) return -1;
    const cur = parade.lastWp[i] || 0;
    const next = Math.max(cur, Math.min(PARADE_WP.length - 1, to != null ? to : cur + 1));
    parade.lastWp[i] = next;
    return next;
  }
  function paradeFinishCheck() {
    if (!parade || !parade.active || parade.confetti) return false;
    const mem = Object.keys(parade.members).map(Number).filter(i => H.players[i]);
    if (!mem.length) { parade = null; return false; }
    const ready = mem.filter(i => (parade.lastWp[i] || 0) >= PARADE_WP.length - 1);
    const need = Math.min(2, mem.length);
    if (ready.length >= need && mem.length >= 1) {
      parade.confetti = true;
      const bonus = Math.min(6, 3 + Math.max(0, mem.length - 2));
      mem.forEach((i) => {
        pay(i, bonus, `🎉 Paraati! +${bonus} 🪙 ja konfetit`);
        luck(i, 20, false);
        helpAdd(i, 'parade', 3);
      });
      spawnConfetti(LOC.parade.x, LOC.parade.z);
      setTimeout(() => { parade = null; }, 4000);
      return true;
    }
    return false;
  }
  function spawnConfetti(x, z) {
    for (let k = 0; k < 24; k++) {
      const col = [0xfa5252, 0xfcc419, 0x4dabf7, 0x51cf66, 0xe64980][k % 5];
      const m = box(0.12, 0.04, 0.08, M(col, { e: col, ei: 0.3 }), 0, 0, 0, null);
      H.addObject(m, x + (Math.random() - 0.5) * 3, 1.5 + Math.random(), z + (Math.random() - 0.5) * 3);
      confetti.push({ m, life: 2.5 + Math.random(), vy: 2 + Math.random() * 2, vx: (Math.random() - 0.5) * 3, vz: (Math.random() - 0.5) * 3 });
    }
  }

  /* ---------- 4 keittiöilta ---------- */
  function kitchenOpen(p, homeI) {
    if (nP() < 2) { H.toast(p.index, 'Keittiöiltaan tarvitaan vähintään 2 pelaajaa', true); return; }
    if (!kitchen || kitchen.done || kitchen.homeI !== homeI) {
      kitchen = { homeI: homeI ?? 0, need: KITCHEN_NEED.slice(), got: {}, by: {}, t: 0, cooking: false, done: false };
    }
    const bag = H.hunger?.bag?.(p.index) || [];
    const items = KITCHEN_NEED.map((id) => {
      const info = H.hunger.ITEMS[id] || { name: id, emoji: '🧂' };
      const has = bag.includes(id);
      const already = !!kitchen.got[id];
      return {
        id, disabled: already || !has,
        html: `${info.emoji} <b>${info.name}</b>${already ? ' · tuotu' : has ? ' · tuo pataan' : ' · puuttuu'}`,
      };
    });
    items.push({
      id: '_cook',
      disabled: !kitchenCanCook(),
      html: kitchenCanCook() ? '🍲 Kypsennä juhlaillallinen' : '🍲 Tarvitaan kaikki ainekset vähintään 2 pelaajalta',
    });
    H.menuPad.show({
      owner: p.index,
      title: '🍲 Yhteinen keittiöilta',
      keepOpen: true,
      items,
      onSelect: (it) => {
        if (it.id === '_cook') {
          kitchenStartCook();
          H.menuPad.close();
        } else {
          kitchenContribute(p.index, it.id);
          H.menuPad.close();
          setTimeout(() => kitchenOpen(p, homeI), 40);
        }
      },
    });
  }
  function kitchenContribute(i, id) {
    if (!kitchen || kitchen.cooking || kitchen.done) return false;
    if (!KITCHEN_NEED.includes(id)) return false;
    if (kitchen.got[id]) { H.toast(i, 'Tämä aines on jo tuotu', true); return false; }
    const bag = H.hunger.bag(i);
    const ix = bag.indexOf(id);
    if (ix < 0) { H.toast(i, 'Aines ei ole repussa', true); return false; }
    const next = bag.slice(); next.splice(ix, 1);
    H.hunger.setBag(i, next);
    kitchen.got[id] = true;
    kitchen.by[id] = i;
    helpAdd(i, 'kitchen', 1);
    H.toast(i, `Toit pataan: ${H.hunger.ITEMS[id]?.emoji || ''} ${H.hunger.ITEMS[id]?.name}`);
    return true;
  }
  function kitchenCanCook() {
    if (!kitchen || kitchen.done || kitchen.cooking) return false;
    if (KITCHEN_NEED.some(id => !kitchen.got[id])) return false;
    const who = new Set(Object.values(kitchen.by));
    return who.size >= 2;
  }
  function kitchenStartCook() {
    if (!kitchenCanCook()) return false;
    kitchen.cooking = true;
    kitchen.t = 3.2;
    Object.keys(kitchen.by).map(Number);
    const who = [...new Set(Object.values(kitchen.by))];
    who.forEach(i => H.toast(i, '🍲 Juhlaillallinen valmistuu…'));
    return true;
  }
  function kitchenFinish() {
    if (!kitchen || !kitchen.cooking) return;
    const who = [...new Set(Object.values(kitchen.by))].filter(i => H.players[i]);
    who.forEach((i) => {
      if (!H.hunger.addToBag(i, 'juhlailta')) {
        if (chestItems.length < CHEST_MAX) { chestItems.push('juhlailta'); chestSave(); }
        H.toast(i, 'Juhlaillallinen arkkuun (reppu täynnä)');
      } else H.toast(i, '🍲 Juhlaillallinen reppuun!');
      pay(i, 3, '+3 🪙 keittiöillasta');
      helpAdd(i, 'kitchen', 2);
    });
    kitchen.cooking = false;
    kitchen.done = true;
    kitchen.t = 0;
    setTimeout(() => { if (kitchen && kitchen.done) kitchen = null; }, 8000);
  }

  /* ---------- 5 sirkusshow ---------- */
  const SHOW_ROLES = ['trapeze', 'cannon', 'lights'];
  const SHOW_LABEL = { trapeze: '🤸 Trapetsi', cannon: '💥 Kanuuna', lights: '💡 Valot' };
  function showNeeded() { return nP() >= 3 ? SHOW_ROLES.slice() : ['trapeze', 'cannon']; }
  function showJoin(i, role) {
    if (nP() < 2) { H.toast(i, 'Sirkusshowhun tarvitaan vähintään 2 esiintyjää', true); return false; }
    if (!show || show.done) show = { roles: {}, t: 0, running: false, done: false };
    if (show.running) { H.toast(i, 'Show on jo käynnissä', true); return false; }
    // vapauta aiempi rooli
    Object.keys(show.roles).forEach((r) => { if (show.roles[r] === i) delete show.roles[r]; });
    const need = showNeeded();
    if (role && !need.includes(role)) role = need[0];
    if (!role) role = need.find(r => show.roles[r] == null) || need[0];
    show.roles[role] = i;
    H.toast(i, `${SHOW_LABEL[role]} – olet roolissa!`);
    return role;
  }
  function showReady() {
    if (!show || show.running || show.done) return false;
    const need = showNeeded();
    return need.every(r => show.roles[r] != null);
  }
  function showStart() {
    if (!show) return false;
    if (nP() < 3 && show.roles.lights == null) show.roles.lights = -1; // automaattivalot
    if (!showReady() && !(nP() === 2 && show.roles.trapeze != null && show.roles.cannon != null)) return false;
    if (nP() === 2) show.roles.lights = -1;
    show.running = true;
    show.t = 6;
    const ids = Object.values(show.roles).filter(i => i >= 0);
    ids.forEach(i => H.toast(i, '🎪 Show alkaa! Valot, trapetsi, kanuuna…'));
    return true;
  }
  function showComplete() {
    if (!show || !show.running) return false;
    const ids = [...new Set(Object.values(show.roles).filter(i => i >= 0 && H.players[i]))];
    if (ids.length < 1) { show = null; return false; }
    const tip = Math.min(8, 4 + Math.max(0, ids.length - 2));
    ids.forEach((i) => {
      pay(i, tip, `🎪 Sirkusshow! Yleisö antoi tippiä +${tip} 🪙`);
      luck(i, 20, false);
      helpAdd(i, 'show', 3);
    });
    show.running = false; show.done = true; show.t = 0;
    setTimeout(() => { show = null; }, 10000);
    return true;
  }
  function openShow(p) {
    if (H.menuPad?.open) return;
    if (nP() < 2) { H.toast(p.index, 'Sirkusshowhun tarvitaan vähintään 2 esiintyjää', true); return; }
    if (!show || show.done) show = { roles: {}, t: 0, running: false, done: false };
    const need = showNeeded();
    const items = need.map((r) => ({
      id: r,
      disabled: show.running,
      html: `${SHOW_LABEL[r]} ${show.roles[r] >= 0 ? '· pelaaja ' + (show.roles[r] + 1) : '· vapaana'}${nP() < 3 && r === 'lights' ? ' (automaattinen 2 p)' : ''}`,
    }));
    items.push({ id: '_start', disabled: show.running || !((nP() >= 3 ? showReady() : (show.roles.trapeze != null && show.roles.cannon != null))), html: '🎬 Aloita show' });
    H.menuPad.show({
      owner: p.index,
      title: '🎪 Sirkusshow yhdessä',
      items,
      onSelect: (it) => {
        if (it.id === '_start') showStart();
        else showJoin(p.index, it.id);
      },
    });
  }

  /* ---------- 6 rakennusprojekti ---------- */
  function buildNeedLeft() {
    const st = BUILD_STAGES[build.stage];
    if (!st || build.done) return {};
    const left = {};
    Object.entries(st.need).forEach(([id, n]) => {
      const have = build.have[id] || 0;
      if (have < n) left[id] = n - have;
    });
    return left;
  }
  function buildContribute(i, id) {
    if (build.done) { H.toast(i, 'Kylän rakennukset ovat valmiit!'); return false; }
    const left = buildNeedLeft();
    if (!left[id]) {
      // jos ei id, ota ensimmäinen minkä pelaajalla on
      if (!id) {
        const bag = H.hunger.bag(i);
        id = Object.keys(left).find(k => bag.includes(k));
      }
    }
    if (!id || !buildNeedLeft()[id]) { H.toast(i, 'Tätä osaa ei juuri nyt tarvita', true); return false; }
    const bag = H.hunger.bag(i);
    const ix = bag.indexOf(id);
    if (ix < 0) { H.toast(i, 'Osa ei ole repussa', true); return false; }
    const next = bag.slice(); next.splice(ix, 1);
    H.hunger.setBag(i, next);
    build.have[id] = (build.have[id] || 0) + 1;
    build.brought[i] = true;
    helpAdd(i, 'build', 1);
    H.toast(i, `Toit osan: ${H.hunger.ITEMS[id]?.emoji || ''} ${H.hunger.ITEMS[id]?.name}`);
    if (Object.keys(buildNeedLeft()).length === 0) buildAdvance(i);
    return true;
  }
  function buildAdvance(i) {
    const st = BUILD_STAGES[build.stage];
    const who = Object.keys(build.brought).map(Number).filter(k => H.players[k]);
    (who.length ? who : [i]).forEach((pi) => pay(pi, 2, `${st.emoji} ${st.name} valmistui! +2 🪙`));
    build.stage++;
    build.have = {};
    build.brought = {};
    if (build.stage >= BUILD_STAGES.length) {
      build.done = true;
      alive().forEach((p) => { pay(p.index, 3, '🏗️ Kylän rakennusprojekti valmis!'); helpAdd(p.index, 'build', 2); });
      updateBuildMesh();
      return true;
    }
    updateBuildMesh();
    H.toast(i, `Seuraava vaihe: ${BUILD_STAGES[build.stage].emoji} ${BUILD_STAGES[build.stage].name}`);
    return true;
  }
  function updateBuildMesh() {
    const g = roots.buildParts;
    if (!g) return;
    g.children.forEach((c, k) => { c.visible = build.done || k < build.stage; });
  }
  function givePart(i, id) {
    if (!H.hunger.addToBag(i, id)) { H.toast(i, 'Reppu täynnä', true); return false; }
    H.toast(i, `Poimit: ${H.hunger.ITEMS[id]?.emoji} ${H.hunger.ITEMS[id]?.name}`);
    return true;
  }
  function openBuild(p) {
    if (H.menuPad?.open) return;
    const st = BUILD_STAGES[Math.min(build.stage, BUILD_STAGES.length - 1)];
    const left = buildNeedLeft();
    const bag = H.hunger.bag(p.index);
    const items = [];
    if (!build.done) {
      Object.keys(st.need).forEach((id) => {
        const info = H.hunger.ITEMS[id] || { name: id, emoji: '📦' };
        const need = left[id] || 0;
        items.push({
          id, disabled: need <= 0 || !bag.includes(id),
          html: `${info.emoji} ${info.name} · jäljellä ${need}${bag.includes(id) ? '' : ' · ei repussa'}`,
        });
      });
    } else items.push({ id: 'ok', disabled: true, html: 'Valmis! Kiitos kaikille rakentajille' });
    H.menuPad.show({
      owner: p.index,
      title: build.done ? '🏗️ Rakennusprojekti valmis' : `🏗️ ${st.emoji} ${st.name} (vaihe ${build.stage + 1}/3)`,
      items,
      onSelect: (it) => { if (it.id !== 'ok') buildContribute(p.index, it.id); },
    });
  }

  /* ---------- 8 kuun tukikohta ---------- */
  function moonRolesNeeded() { return nP() >= 3 ? ['drive', 'repair', 'energy'] : ['drive', 'repair']; }
  function moonJoin(i, role) {
    if (nP() < 2) { H.toast(i, 'Kuun tukikohtaan tarvitaan vähintään 2 astronauttia', true); return false; }
    if (!moonbase || moonbase.done) moonbase = { roles: {}, tasks: {}, t: 0, running: false, done: false };
    if (moonbase.running && moonbase.tasks[role]) return false;
    Object.keys(moonbase.roles).forEach((r) => { if (moonbase.roles[r] === i) delete moonbase.roles[r]; });
    const need = moonRolesNeeded();
    if (role && !need.includes(role)) role = need[0];
    if (!role) role = need.find(r => moonbase.roles[r] == null) || need[0];
    moonbase.roles[role] = i;
    H.toast(i, role === 'drive' ? '🛵 Olet kuski – aja LRV merkkilippuun' : role === 'repair' ? '🔧 Olet korjaaja' + (nP() < 3 ? ' (ja energia)' : '') : '⚡ Olet energiahoitaja');
    return role;
  }
  function moonTask(i, kind) {
    if (!moonbase) return false;
    const need = moonRolesNeeded();
    // 2p: energia kuuluu korjaajalle
    if (kind === 'energy' && nP() < 3) kind = 'repair';
    const roleOf = Object.keys(moonbase.roles).find(r => moonbase.roles[r] === i);
    if (kind === 'energy' && roleOf === 'repair' && nP() < 3) { /* ok */ }
    else if (roleOf !== kind && !(kind === 'repair' && roleOf === 'energy')) {
      // salli tehtävä jos rooli täsmää tai tehtävää ei ole varattu
    }
    moonbase.tasks[kind] = true;
    if (nP() < 3 && kind === 'repair') moonbase.tasks.energy = true;
    H.toast(i, kind === 'drive' ? '🛵 Ajotehtävä tehty!' : kind === 'repair' ? '🔧 Korjaus tehty!' : '⚡ Energia kunnossa!');
    helpAdd(i, 'moon', 1);
    moonMaybeComplete();
    return true;
  }
  function moonMaybeComplete() {
    if (!moonbase || moonbase.done) return false;
    const need = nP() >= 3 ? ['drive', 'repair', 'energy'] : ['drive', 'repair'];
    if (!need.every(k => moonbase.tasks[k])) return false;
    const ids = [...new Set(Object.values(moonbase.roles).filter(i => i >= 0 && H.players[i]))];
    const tip = Math.min(8, 4 + Math.max(0, ids.length - 2));
    ids.forEach((i) => {
      pay(i, tip, `🌙 Kuun tukikohta valmis! +${tip} 🪙`);
      luck(i, 18, false);
      helpAdd(i, 'moon', 2);
    });
    moonbase.done = true;
    moonbase.running = false;
    setTimeout(() => { moonbase = null; }, 12000);
    return true;
  }
  function openMoon(p) {
    if (H.menuPad?.open) return;
    if (nP() < 2) { H.toast(p.index, 'Kuun tukikohtaan tarvitaan vähintään 2 astronauttia', true); return; }
    if (!moonbase || moonbase.done) moonbase = { roles: {}, tasks: {}, t: 0, running: false, done: false };
    const need = moonRolesNeeded();
    const lab = { drive: '🛵 Kuski (LRV)', repair: '🔧 Korjaaja' + (nP() < 3 ? ' + energia' : ''), energy: '⚡ Energia' };
    const items = need.map((r) => ({
      id: r,
      html: `${lab[r]} ${moonbase.roles[r] >= 0 ? '· pelaaja ' + (moonbase.roles[r] + 1) : '· vapaana'}${moonbase.tasks[r] ? ' ✓' : ''}`,
    }));
    if (moonbase.roles[need.find(r => moonbase.roles[r] === p.index) || '' ] != null || Object.values(moonbase.roles).includes(p.index)) {
      const mine = Object.keys(moonbase.roles).find(r => moonbase.roles[r] === p.index);
      items.push({ id: 'do:' + mine, html: '✅ Merkitse tehtävä tehdyksi (' + (lab[mine] || mine) + ')' });
    }
    H.menuPad.show({
      owner: p.index,
      title: '🌙 Kuun tukikohta',
      items,
      onSelect: (it) => {
        if (String(it.id).startsWith('do:')) moonTask(p.index, it.id.slice(3));
        else moonJoin(p.index, it.id);
      },
    });
  }

  /* ---------- leave mid-activity ---------- */
  function abandon(i) {
    if (parade && parade.members[i]) {
      delete parade.members[i];
      delete parade.lastWp[i];
      const mem = Object.keys(parade.members).filter(k => H.players[+k]);
      if (mem.length < 1) parade = null;
      else H.toast(+mem[0], 'Kaveri lähti paraatista – jatketaan!');
    }
    if (kitchen && !kitchen.done) {
      Object.keys(kitchen.by).forEach((id) => { if (kitchen.by[id] === i) delete kitchen.by[id]; });
      const who = new Set(Object.values(kitchen.by));
      if (who.size < 1 && !kitchen.cooking) { /* aineet jäävät, odotetaan */ }
    }
    if (show && !show.done) {
      Object.keys(show.roles).forEach((r) => { if (show.roles[r] === i) delete show.roles[r]; });
      const ids = Object.values(show.roles).filter(x => x >= 0 && H.players[x]);
      if (ids.length < 2) {
        if (show.running) alive().forEach(p => H.toast(p.index, 'Sirkusshow keskeytyi – ei softlockia'));
        show = null;
      } else if (nP() < 3) show.roles.lights = -1;
    }
    if (moonbase && !moonbase.done) {
      Object.keys(moonbase.roles).forEach((r) => { if (moonbase.roles[r] === i) delete moonbase.roles[r]; });
      const ids = Object.values(moonbase.roles).filter(x => x >= 0 && H.players[x]);
      if (ids.length < 2) {
        if (!moonbase.done) alive().forEach(p => { if (p.index !== i) H.toast(p.index, 'Kuun tehtävä keskeytyi – ei softlockia'); });
        moonbase = null;
      } else if (ids.length < 3 && moonbase.roles.energy != null && moonbase.roles.repair == null) {
        moonbase.roles.repair = moonbase.roles.energy;
        delete moonbase.roles.energy;
        if (moonbase.tasks.energy) moonbase.tasks.repair = true;
      }
    }
    if (market.shares[i]) { /* osuus jää, voitto jaetaan jäljellä oleville kun myydään */ }
    return true;
  }

  /* ---------- world ---------- */
  function buildWorld() {
    // arkku
    const ch = new (T().Group)();
    box(1.4, 0.7, 0.9, M(0x8f5420), 0, 0.4, 0, ch);
    box(1.5, 0.12, 1.0, M(0x6b3f1a), 0, 0.8, 0, ch);
    cyl(0.08, 0.08, 0.15, M(0xfcc419), 0, 0.9, 0.35, ch);
    roots.chest = ch;
    put(ch, LOC.chest.x, 0, LOC.chest.z, '📦 Kylän arkku', 3.4, '#5c4033');

    // pelastusasema
    const rd = new (T().Group)();
    cyl(0.12, 0.12, 2.4, M(0x495057), 0, 1.2, 0, rd);
    box(0.7, 0.5, 0.15, M(0x1c7ed6, { e: 0x1864ab, ei: 0.4 }), 0, 2.3, 0, rd);
    put(rd, LOC.radio.x, 0, LOC.radio.z, '📡 Pelastusasema', 3.2, '#1864ab');

    // paraati
    const pr = new (T().Group)();
    cyl(1.6, 1.6, 0.08, M(0xe03131, { e: 0xc92a2a, ei: 0.2 }), 0, 0.04, 0, pr, 28);
    put(pr, LOC.parade.x, 0, LOC.parade.z, '🎺 Paraati / yhteislaulu', 3.4, '#c92a2a');

    // puutarha
    const gd = new (T().Group)();
    box(10, 0.08, 6, M(0x5c7a3a), 0, 0.02, 0, gd);
    roots.garden = gd;
    put(gd, LOC.garden.x, 0, LOC.garden.z, '🌱 Kylän puutarha', 4.0, '#2b8a3e');
    syncPlots();

    // lumi
    snow = SNOW.map((s) => {
      const g = new (T().Group)();
      cyl(0.9, 1.2, 0.7, M(0xf1f3f5), 0, 0.35, 0, g, 10);
      H.addObject(g, s.x, 0, s.z);
      const lbl = H.makeLabel('❄️ Lumikasa', { scale: 2.2, size: 44, bg: '#4c6a86' });
      H.addObject(lbl, s.x, 1.6, s.z);
      return { x: s.x, z: s.z, g, lbl, left: 4, max: 4, respawn: 0 };
    });

    // toripäivä
    const mk = new (T().Group)();
    box(3.0, 0.12, 1.5, M(0xf4a261), 0, 0.9, 0, mk);
    box(3.2, 0.08, 1.7, M(0x2b8a3e), 0, 2.05, 0, mk);
    put(mk, LOC.market.x, 0, LOC.market.z, '🛒 Toripäivä', 3.4, '#2b8a3e');

    // rakennustyömaa
    const bd = new (T().Group)();
    box(12, 0.12, 8, M(0xf59f00), 0, 0.06, 0, bd);
    const partsG = new (T().Group)();
    // silta
    const bridge = new (T().Group)();
    box(6, 0.2, 1.2, M(0x8f5420), 0, 0.5, 0, bridge);
    box(0.2, 0.8, 0.2, M(0x5c4033), -2.8, 0.5, 0.5, bridge);
    box(0.2, 0.8, 0.2, M(0x5c4033), 2.8, 0.5, 0.5, bridge);
    bridge.position.set(-3, 0, 0); partsG.add(bridge);
    // maja
    const hut = new (T().Group)();
    box(2.2, 1.6, 2.2, M(0xc0853a), 0, 0.8, 0, hut);
    box(2.6, 0.15, 2.6, M(0x7a2e22), 0, 1.7, 0, hut);
    hut.position.set(2.5, 0, -1); partsG.add(hut);
    // majakka
    const lh = new (T().Group)();
    cyl(0.5, 0.7, 4.2, M(0xf8f9fa), 0, 2.1, 0, lh, 10);
    cyl(0.35, 0.35, 0.5, M(0xfcc419, { e: 0xffd43b, ei: 0.7 }), 0, 4.4, 0, lh, 10);
    lh.position.set(4.2, 0, 1.5); partsG.add(lh);
    partsG.children.forEach(c => { c.visible = false; });
    bd.add(partsG);
    roots.buildParts = partsG;
    roots.build = bd;
    put(bd, LOC.build.x, 0, LOC.build.z, '🏗️ Rakennustyömaa', 4.0, '#e67700');
    // tarvikelaatikot
    const crateIds = ['lauta', 'naula', 'tiili', 'lasi', 'lamppu'];
    roots.crates = crateIds.map((id, k) => {
      const g = new (T().Group)();
      box(0.7, 0.5, 0.7, M(0x9c6b3c), 0, 0.25, 0, g);
      const x = LOC.build.x - 5 + k * 1.5, z = LOC.build.z + 5;
      const info = PARTS.find(p => p.id === id);
      put(g, x, 0, z, `${info.emoji} ${info.name}`, 2.0, '#5c4033');
      return { id, x, z, g, cd: 0 };
    });

    // merilautta
    const sea = new (T().Group)();
    box(3.2, 0.18, 2.2, M(0x8f5420), 0, 0.1, 0, sea);
    cyl(0.08, 0.08, 1.4, M(0x5c4033), 1.3, 0.8, 0.8, sea);
    put(sea, LOC.sea.x, 0, LOC.sea.z, '🌊 Merilautta (kutsu apua radiolla)', 3.2, '#1c7ed6');

    // kuun tukikohta rakennetaan onStart + kun kuu on olemassa (lazy)
  }

  let moonBuilt = false;
  function buildMoonBase() {
    if (moonBuilt) return;
    if (!H.moon && !(H.players || []).some(p => p.moon)) return;
    moonBuilt = true;
    const g = new (T().Group)();
    box(6, 0.2, 6, M(0x868e96), 0, 0.1, 0, g);
    box(2.2, 1.6, 2.2, M(0xdee2e6), 0, 1.0, 0, g);
    cyl(0.15, 0.15, 2.2, M(0xffd43b, { e: 0xfcc419, ei: 0.5 }), 1.4, 1.2, 1.4, g);
    roots.moon = g;
    const y = (H.moonH && H.moonH(LOC.moon.x, LOC.moon.z)) || 1.2;
    put(g, LOC.moon.x, y, LOC.moon.z, '🌙 Kuun tukikohta', 4.0, '#212529');
    // ajotehtävän merkkilippu (LRV:llä tänne)
    const fy = (H.moonH && H.moonH(LOC.flag.x, LOC.flag.z)) || y;
    const fl = new (T().Group)();
    cyl(0.06, 0.06, 3.2, M(0xadb5bd), 0, 1.6, 0, fl, 8);
    const flag = new (T().Mesh)(new (T().PlaneGeometry)(1.6, 1.0), M(0x228be6, { e: 0x1c7ed6, ei: 0.35, side: 2 }));
    flag.position.set(0.8, 2.6, 0); fl.add(flag);
    H.addObject(fl, LOC.flag.x, fy, LOC.flag.z);
    const flab = H.makeLabel('🚩 Merkkilippu', { scale: 3.2, bg: '#1864ab' });
    H.addObject(flab, LOC.flag.x, fy + 4.0, LOC.flag.z);
  }

  /* ---------- loop ---------- */
  function near(p, loc, r) { return dist(pos(p), loc) < r && (!p.moon || loc === LOC.moon || (loc.z || 0) > 400); }

  H.onStart(() => {
    active = !H.challenge;
    helpPts = Array(12).fill(0);
    helpCd = Array.from({ length: 12 }, () => ({}));
    moneyGot = Array(12).fill(0);
    garden = []; snow = []; confetti = [];
    talkoot = { meter: 0, lastBonus: -999, bonuses: 0 };
    market = { stock: [], shares: {}, lastSell: -999, selling: false, t: 0 };
    rescueCd = {}; stuckOverride = {};
    parade = kitchen = show = moonbase = null;
    build = { stage: 0, have: {}, brought: {}, done: false };
    roots = {}; moonBuilt = false;
    luckChainCd = -999;
    registerItems();
    chestLoad();
    if (!active) return;
    try { buildWorld(); } catch (e) { console.warn('coop build', e); }
  });
  H.onStop(() => {
    active = false;
    garden = []; snow = []; confetti = [];
    parade = kitchen = show = moonbase = null;
    roots = {};
  });

  H.on('giveFood', (fromI, kind) => {
    if (kind === 'npc') luckChain(fromI);
    else if (kind === 'player') helpAdd(fromI, 'food', 2);
  });
  H.on('rake', (i, n) => { if (n > 0) talkootAdd(i, 'rake', Math.min(3, n)); });
  H.on('forage', (i) => talkootAdd(i, 'sieni', 2));
  H.on('repair', (i) => helpAdd(i, 'repair', 2));

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    if ((hudT += dt) > 0.4) {
      hudT = 0;
      alive().forEach((p) => {
        const bonus = talkoot.meter;
        H.hud(p.index, `🤝 Auttaminen: ${helpGet(p.index)} · 🏘️ Talkoot ${bonus}/${TALK_THRESH}`, 'coophelp');
      });
    }
    // puutarhan kasvu
    garden.forEach((pl) => {
      if (pl.state === 'wet' || (pl.state !== 'ripe' && pl.wet > 0.3)) {
        const boost = 1 + Object.keys(pl.watered).length * 0.25;
        pl.grow = (pl.grow || 0) + dt * 0.07 * boost;
        pl.plant.visible = true;
        pl.plant.scale.set(1, 4 + pl.grow * 10, 1);
        if (pl.grow >= 1) { pl.state = 'ripe'; pl.veg.visible = true; }
      }
    });
    // lumi respawn
    snow.forEach((s) => {
      if (s.left <= 0) {
        s.respawn -= dt;
        if (s.respawn <= 0) { s.left = s.max; if (s.g) { s.g.visible = true; s.g.scale.setScalar(1); } }
      }
    });
    // confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.life -= dt;
      if (c.m && c.m.position) {
        c.m.position.y += c.vy * dt;
        c.m.position.x += c.vx * dt;
        c.m.position.z += c.vz * dt;
        c.vy -= 4 * dt;
        c.m.rotation.z += dt * 4;
      }
      if (c.life <= 0) { try { H.removeObject(c.m); } catch (e) {} confetti.splice(i, 1); }
    }
    // keittiö ajastin
    if (kitchen && kitchen.cooking) {
      kitchen.t -= dt;
      if (kitchen.t <= 0) kitchenFinish();
    }
    if (kitchen && !kitchen.done && !kitchen.cooking) {
      kitchen.idle = (kitchen.idle || 0) + dt;
      if (kitchen.idle > 90) { kitchen = null; }
    }
    // show timer
    if (show && show.running) {
      show.t -= dt;
      if (show.t <= 0) showComplete();
    }
    // paraati timeout
    if (parade && parade.active) {
      parade.t += dt;
      if (parade.t > 120) { alive().forEach(p => { if (parade.members[p.index]) H.toast(p.index, 'Paraati päättyi – aika loppui'); }); parade = null; }
    }
    // kuu base lazy build
    if (!moonBuilt && (H.players || []).some(p => p.moon)) try { buildMoonBase(); } catch (e) {}

    for (const p of alive()) {
      if (p.car != null && !p.moon) { /* auto ok earth */ }
      if (p.rocket) continue;
      const i = p.index, key = KEY(i);
      // menu auki: ei kaapata
      if (H.menuPad?.open && H.menuPad.owner === i) continue;

      // merilautta-vihje
      if (inSea(p)) H.hud(i, '🌊 Merellä! Toinen pelaaja voi pelastaa radiolla', 'coopsea');
      else H.hud(i, '', 'coopsea');

      // paraati checkpointit
      if (parade && parade.active && parade.members[i]) {
        const wpI = Math.min(PARADE_WP.length - 1, (parade.lastWp[i] || 0));
        const wp = PARADE_WP[Math.min(PARADE_WP.length - 1, wpI + (wpI < PARADE_WP.length - 1 ? 1 : 0))];
        if (wp && dist(pos(p), wp) < 3.2) {
          paradeAdvance(i, (parade.lastWp[i] || 0) + 1);
          paradeFinishCheck();
        }
        H.hud(i, `🎺 Paraati · etappi ${(parade.lastWp[i] || 0) + 1}/${PARADE_WP.length}`, 'coopparade');
      } else H.hud(i, '', 'coopparade');

      // kuun tukikohta
      if (p.moon && p.car != null) {
        const c = H.cars[p.car];
        if (c && (c.carType === 'lrv' || c._v24moon) && dist(pos(p), LOC.flag) < 8.5) {
          H.hud(i, '🚩 Merkkilippu saavutettu!', 'coopmoon');
          if (moonbase && !moonbase.tasks.drive) moonTask(i, 'drive');
        }
      }
      if (p.moon && near(p, LOC.moon, 5)) {
        H.hud(i, `🌙 Tukikohta · ${key} = roolit (kuski / korjaus / energia)`, 'coopmoon');
        if (H.pressed(i, 'interact')) openMoon(p);
        continue;
      }

      if (p.moon || p._bodyId) continue;

      // sirkusshow-taulu
      if (H.circus?.inside?.(i) && dist(pos(p), LOC.show) < 4) {
        H.hud(i, `🎪 Sirkusshow · ${key} = roolit`, 'coopshow');
        if (H.pressed(i, 'interact')) openShow(p);
        continue;
      }

      if (near(p, LOC.chest, 2.2)) {
        H.hud(i, `📦 Kylän arkku · ${key} = avaa (${chestItems.length}/${CHEST_MAX})`, 'coop');
        if (H.pressed(i, 'interact')) openChest(p);
        continue;
      }
      if (near(p, LOC.radio, 2.2)) {
        H.hud(i, `📡 Pelastusasema · ${key} = lähetä apua`, 'coop');
        if (H.pressed(i, 'interact')) openRescue(p);
        continue;
      }
      if (near(p, LOC.parade, 2.6)) {
        H.hud(i, `🎺 Paraati · ${key} = ${nP() < 2 ? 'tarvitaan 2 pelaajaa' : (parade && parade.active ? 'liity' : 'aloita')}`, 'coop');
        if (H.pressed(i, 'interact')) paradeStart(i);
        continue;
      }
      if (near(p, LOC.market, 2.4)) {
        H.hud(i, `🛒 Toripäivä · ${key} = täytä / myy (koju ${market.stock.length})`, 'coop');
        if (H.pressed(i, 'interact')) openMarket(p);
        continue;
      }
      if (near(p, LOC.build, 6)) {
        const crate = (roots.crates || []).find(c => dist(pos(p), c) < 1.4 && c.cd <= 0);
        if (crate) {
          H.hud(i, `${H.hunger.ITEMS[crate.id]?.emoji || '📦'} ${H.hunger.ITEMS[crate.id]?.name} · ${key} = ota`, 'coop');
          if (H.pressed(i, 'interact')) { givePart(i, crate.id); crate.cd = 8; }
          continue;
        }
        H.hud(i, `🏗️ Rakennustyömaa · ${key} = tuo osia`, 'coop');
        if (H.pressed(i, 'interact')) openBuild(p);
        continue;
      }
      // puutarha
      const gpl = garden.find(pl => dist(pos(p), pl) < 1.4);
      if (gpl) {
        const st = gpl.state === 'ripe' ? `valmis · ${key} = korjaa sato` : gpl.state === 'wet' ? 'kasvaa… kastelua voi jatkaa' : `${key} = kastele`;
        H.hud(i, `🌱 Puutarha · ${st}`, 'coop');
        if (H.pressed(i, 'interact')) {
          if (gpl.state === 'ripe') gardenHarvest(i, garden.indexOf(gpl));
          else gardenWater(i, garden.indexOf(gpl));
        }
        continue;
      }
      const sn = snow.find(s => s.left > 0 && dist(pos(p), s) < 1.6);
      if (sn) {
        H.hud(i, `❄️ Lumikasa · ${key} = luo (${sn.left})`, 'coop');
        if (H.pressed(i, 'interact')) shovelSnow(i, snow.indexOf(sn));
        continue;
      }
      H.hud(i, '', 'coop');
    }
    (roots.crates || []).forEach(c => { if (c.cd > 0) c.cd -= dt; });
  });

  H.coop = {
    LOC, CHEST_MAX, TALK_THRESH, BUILD_STAGES, KITCHEN_NEED, SHOW_ROLES, PARADE_WP,
    help: { add: helpAdd, get: helpGet, all: () => helpPts.slice(), cd: HELP_CD },
    chest: {
      list: () => chestItems.slice(), deposit: chestDeposit, withdraw: chestWithdraw,
      open: openChest, pos: LOC.chest, MAX: CHEST_MAX,
    },
    luckChain,
    garden: {
      water: gardenWater, harvest: gardenHarvest, growNow: gardenGrowNow,
      plots: () => garden.map(p => ({ x: p.x, z: p.z, state: p.state, wet: p.wet, watered: { ...p.watered } })),
      pos: LOC.garden,
    },
    talkoot: {
      get meter() { return talkoot.meter; },
      add: talkootAdd, shovel: shovelSnow, trigger: talkootTrigger,
      snow: () => snow.map(s => ({ x: s.x, z: s.z, left: s.left })),
      THRESH: TALK_THRESH,
      get bonuses() { return talkoot.bonuses; },
      _setMeter(v) { talkoot.meter = v; },
    },
    market: {
      contribute: marketContribute, sell: marketSell, open: openMarket,
      get stock() { return market.stock.slice(); },
      get shares() { return { ...market.shares }; },
      pos: LOC.market,
      _resetCd() { market.lastSell = -999; },
    },
    rescue: {
      stuckReason: (i) => { const p = typeof i === 'number' ? H.players[i] : i; return p ? stuckReason(p) : null; },
      markStuck, clearStuck, rescue: doRescue, open: openRescue,
      seaPos: LOC.sea, harborPos: LOC.harbor,
    },
    parade: {
      start: paradeStart, join: paradeJoin, advance: paradeAdvance,
      finishCheck: paradeFinishCheck, canStart: paradeCanStart,
      get state() { return parade ? { ...parade, members: { ...parade.members }, lastWp: { ...parade.lastWp } } : null; },
      pos: LOC.parade, WP: PARADE_WP,
    },
    kitchen: {
      open: kitchenOpen, contribute: kitchenContribute, canCook: kitchenCanCook,
      start: kitchenStartCook, finish: kitchenFinish,
      get state() { return kitchen ? { ...kitchen, got: { ...kitchen.got }, by: { ...kitchen.by } } : null; },
      NEED: KITCHEN_NEED,
      _reset() { kitchen = { homeI: 0, need: KITCHEN_NEED.slice(), got: {}, by: {}, t: 0, cooking: false, done: false }; },
    },
    show: {
      join: showJoin, start: showStart, complete: showComplete, open: openShow,
      get state() { return show ? { ...show, roles: { ...show.roles } } : null; },
      needed: showNeeded, pos: LOC.show, ROLES: SHOW_ROLES,
      _reset() { show = { roles: {}, t: 0, running: false, done: false }; },
    },
    build: {
      contribute: buildContribute, givePart, open: openBuild,
      get stage() { return build.stage; },
      get done() { return !!build.done; },
      get have() { return { ...build.have }; },
      needLeft: buildNeedLeft, pos: LOC.build, STAGES: BUILD_STAGES,
      _reset() { build = { stage: 0, have: {}, brought: {}, done: false }; updateBuildMesh(); },
    },
    moonbase: {
      join: moonJoin, task: moonTask, complete: moonMaybeComplete, open: openMoon,
      get state() { return moonbase ? { ...moonbase, roles: { ...moonbase.roles }, tasks: { ...moonbase.tasks } } : null; },
      needed: moonRolesNeeded, pos: LOC.moon, flag: LOC.flag,
      _reset() { moonbase = { roles: {}, tasks: {}, t: 0, running: false, done: false }; },
      _ensure() { try { buildMoonBase(); } catch (e) {} },
    },
    abandon,
    pay,
    MONEY_CAP,
    _resetMoneyCap() { moneyGot = Array(12).fill(0); },
  };
  H.define?.('coop', H.coop);
})();
