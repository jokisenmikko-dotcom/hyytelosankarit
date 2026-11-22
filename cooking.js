// cooking.js – 3.0: jääkaappi, hylly, ruoanlaitto, reseptit, anna ruokaa (pelaaja/NPC → onni+raha+sydänilmapallo).
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.55, metalness: o.m ?? 0.1, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0 });
  const COOK_SEC = 3.2;
  const FRIDGE_MAX = 48, SHELF_MAX = 16;

  // Ainekset (lisätään hunger.ITEMS:iin onStartissa)
  const INGREDIENTS = [
    { id: 'omena', name: 'Omena', emoji: '🍎', food: 8 },
    { id: 'sieni', name: 'Ruokasieni', emoji: '🍄', food: 10 },
    { id: 'riisi', name: 'Riisi', emoji: '🍚', food: 12 },
    { id: 'kala', name: 'Kala', emoji: '🐟', food: 14 },
    { id: 'soija', name: 'Soija', emoji: '🧴', food: 4 },
    { id: 'jauhot', name: 'Jauhot', emoji: '🌾', food: 5 },
    { id: 'maito', name: 'Maito', emoji: '🥛', food: 8 },
    { id: 'muna', name: 'Muna', emoji: '🥚', food: 6 },
    { id: 'juusto', name: 'Juusto', emoji: '🧀', food: 10 },
    { id: 'kinkku', name: 'Kinkku', emoji: '🥓', food: 12 },
    { id: 'tomaatti', name: 'Tomaatti', emoji: '🍅', food: 6 },
    { id: 'mansikkahillo', name: 'Mansikkahillo', emoji: '🍓', food: 8 },
    { id: 'vispikerma', name: 'Vispattu kerma', emoji: '🍦', food: 7 },
    { id: 'pahkina', name: 'Pähkinät', emoji: '🥜', food: 9 },
    { id: 'mandariini', name: 'Mandariini', emoji: '🍊', food: 8 },
    { id: 'voi', name: 'Voi', emoji: '🧈', food: 5 },
    { id: 'sokeri', name: 'Sokeri', emoji: '🧂', food: 3 },
  ];

  const SPICES = [
    { id: 'suola', name: 'Suola', emoji: '🧂', food: 1, spice: true },
    { id: 'pippuri', name: 'Pippuri', emoji: '⚫', food: 1, spice: true },
    { id: 'paprikajauhe', name: 'Paprika', emoji: '🌶️', food: 1, spice: true },
    { id: 'curry', name: 'Curry', emoji: '🟡', food: 1, spice: true },
    { id: 'kaneli', name: 'Kaneli', emoji: '🌰', food: 1, spice: true },
    { id: 'valkosipuli', name: 'Valkosipuli', emoji: '🧄', food: 1, spice: true },
    { id: 'basilika', name: 'Basilika', emoji: '🌿', food: 1, spice: true },
    { id: 'oregano', name: 'Oregano', emoji: '🍃', food: 1, spice: true },
    { id: 'tilli', name: 'Tilli', emoji: '🌱', food: 1, spice: true },
    { id: 'chili', name: 'Chili', emoji: '🌶️', food: 1, spice: true },
    { id: 'inkivaari', name: 'Inkivääri', emoji: '🫚', food: 1, spice: true },
    { id: 'timjami', name: 'Timjami', emoji: '🪴', food: 1, spice: true },
    { id: 'meirami', name: 'Meirami', emoji: '☘️', food: 1, spice: true },
    { id: 'vanilja', name: 'Vanilja', emoji: '🌼', food: 1, spice: true },
    { id: 'muskotti', name: 'Muskotti', emoji: '🟤', food: 1, spice: true },
  ];

  const COOKED = [
    { id: 'americana', name: 'Americana-pizza', emoji: '🍕', food: 55 },
    { id: 'muupizza', name: 'Muu pizza', emoji: '🍕', food: 50 },
    { id: 'kotisushi', name: 'Sushi', emoji: '🍣', food: 48 },
    { id: 'aamupuuro', name: 'Aamupuuro', emoji: '🥣', food: 35 },
    { id: 'paivallinen', name: 'Päivällinen', emoji: '🍽️', food: 60 },
    { id: 'jalkiruoka', name: 'Jälkiruoka', emoji: '🥞', food: 40 },
    { id: 'naposteltavat', name: 'Naposteltavat', emoji: '🥜', food: 25 },
  ];

  const RECIPES = [
    { id: 'americana', name: 'Americana-pizza', emoji: '🍕', need: ['jauhot', 'tomaatti', 'juusto', 'kinkku'], out: 'americana' },
    { id: 'muupizza', name: 'Muu pizza', emoji: '🍕', need: ['jauhot', 'tomaatti', 'juusto'], out: 'muupizza' },
    { id: 'kotisushi', name: 'Sushi', emoji: '🍣', need: ['riisi', 'kala', 'soija'], out: 'kotisushi' },
    { id: 'aamupuuro', name: 'Aamupuuro', emoji: '🥣', need: ['maito', 'sokeri'], out: 'aamupuuro' },
    { id: 'paivallinen', name: 'Päivällinen', emoji: '🍽️', need: ['kala', 'sieni', 'tomaatti'], out: 'paivallinen' },
    { id: 'jalkiruoka', name: 'Jälkiruoka (letut/pannari)', emoji: '🥞', need: ['jauhot', 'muna', 'maito', 'mansikkahillo', 'vispikerma'], out: 'jalkiruoka' },
    { id: 'naposteltavat', name: 'Naposteltavat', emoji: '🥜', need: ['pahkina', 'mandariini', 'banaani'], out: 'naposteltavat' },
  ];

  // torilta ostettavat ainekset (hintaan)
  const MARKET = [
    { id: 'riisi', price: 3 }, { id: 'kala', price: 5 }, { id: 'soija', price: 2 },
    { id: 'jauhot', price: 2 }, { id: 'maito', price: 2 }, { id: 'muna', price: 2 },
    { id: 'juusto', price: 4 }, { id: 'kinkku', price: 4 }, { id: 'tomaatti', price: 2 },
    { id: 'mansikkahillo', price: 3 }, { id: 'vispikerma', price: 3 },
    { id: 'pahkina', price: 3 }, { id: 'mandariini', price: 2 }, { id: 'voi', price: 2 }, { id: 'sokeri', price: 1 },
  ];

  let active = false, fridges = [], cookJobs = [], balloons = [], marketPads = [];

  function loadStore(key, max) {
    const d = H.load(key, null) || {};
    return Array.isArray(d.items) ? d.items.filter(x => H.hunger?.ITEMS?.[x]).slice(0, max) : [];
  }
  function saveStore(key, items) { H.save(key, { items }); }

  function registerFoods() {
    const hung = H.hunger; if (!hung || !hung.ITEMS) return;
    INGREDIENTS.concat(SPICES).forEach(f => {
      if (!hung.ITEMS[f.id]) hung.ITEMS[f.id] = f;
      if (!hung.FOODS.find(x => x.id === f.id)) hung.FOODS.push({ ...f, price: 0 });
    });
    COOKED.forEach(f => {
      if (!hung.ITEMS[f.id]) hung.ITEMS[f.id] = f;
      if (!hung.FOODS.find(x => x.id === f.id)) hung.FOODS.push({ ...f, price: 0 });
    });
  }

  function makeFridge() {
    const g = new (T().Group)();
    const body = new (T().Mesh)(new (T().BoxGeometry)(0.9, 1.8, 0.7), M(0xf8f9fa, { r: 0.35, m: 0.2 }));
    body.position.y = 0.9; g.add(body);
    const door = new (T().Mesh)(new (T().BoxGeometry)(0.86, 1.1, 0.06), M(0xe9ecef));
    door.position.set(0, 1.15, 0.38); g.add(door);
    const freezer = new (T().Mesh)(new (T().BoxGeometry)(0.86, 0.5, 0.06), M(0xdee2e6));
    freezer.position.set(0, 0.4, 0.38); g.add(freezer);
    const handle = new (T().Mesh)(new (T().BoxGeometry)(0.04, 0.35, 0.04), M(0x868e96, { m: 0.6 }));
    handle.position.set(0.35, 1.15, 0.42); g.add(handle);
    return g;
  }
  function makeCookSpot() {
    const g = new (T().Group)();
    const stove = new (T().Mesh)(new (T().BoxGeometry)(0.9, 0.85, 0.7), M(0x495057));
    stove.position.y = 0.42; g.add(stove);
    [[-0.2, 0.15], [0.2, 0.15], [-0.2, -0.15], [0.2, -0.15]].forEach(([x, z]) => {
      const b = new (T().Mesh)(new (T().CylinderGeometry)(0.12, 0.12, 0.04, 12), M(0x212529));
      b.position.set(x, 0.87, z); g.add(b);
      const r = new (T().Mesh)(new (T().TorusGeometry)(0.1, 0.015, 6, 16), M(0xe03131, { e: 0xe03131, ei: 0.4 }));
      r.rotation.x = Math.PI / 2; r.position.set(x, 0.9, z); g.add(r);
    });
    return g;
  }

  function poolFor(homeI, playerI) {
    const fridge = loadStore('fridge-p' + (homeI + 1), FRIDGE_MAX);
    const shelf = loadStore('cookshelf-p' + (homeI + 1), SHELF_MAX);
    const bag = (H.hunger?.bag?.(playerI) || []).slice();
    return { fridge, shelf, bag, all: fridge.concat(shelf, bag) };
  }
  function countHave(pool, id) {
    return pool.all.filter(x => x === id).length;
  }
  function canCook(pool, recipe) {
    const used = {};
    for (const need of recipe.need) {
      used[need] = (used[need] || 0) + 1;
      if (countHave(pool, need) < used[need]) return false;
    }
    return true;
  }
  function recipeHave(pool, recipe) {
    const used = {};
    let have = 0;
    for (const need of recipe.need) {
      used[need] = (used[need] || 0) + 1;
      if (countHave(pool, need) >= used[need]) have++;
    }
    return have;
  }
  function recipeProgress(pool, recipe) {
    if (!recipe || !recipe.need || !recipe.need.length) return 0;
    return recipeHave(pool, recipe) / recipe.need.length;
  }
  function recipeHtml(r, pool) {
    const have = recipeHave(pool, r);
    const need = r.need.length;
    const t = have / need;
    const pct = Math.round(t * 100);
    const fill = t >= 1 ? 'rgba(47,158,68,.78)' : ('rgba(47,158,68,' + (0.18 + t * 0.55).toFixed(2) + ')');
    const tint = t >= 1 ? 'color:#0b3d1a;font-weight:800' : (t > 0 ? 'color:#1b4332' : '');
    const bits = r.need.map(id => {
      const info = H.hunger.ITEMS[id] || { emoji: '', name: id };
      const ok = countHave(pool, id) > 0;
      return `<span style="${ok ? 'background:rgba(47,158,68,.35);border-radius:4px;padding:0 3px' : 'opacity:.7'}">${info.emoji || ''} ${info.name || id}</span>`;
    }).join(' · ');
    return `<div class="cook-row" style="position:relative;border-radius:8px;overflow:hidden;padding:3px 6px;${tint}">
      <div data-cook-fill="${r.id}" style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:${fill};pointer-events:none"></div>
      <div style="position:relative">${r.emoji} <b>${r.name}</b> · ${have}/${need}${t >= 1 ? ' ✓' : ''}<br><small style="opacity:.9">${bits}${t >= 1 ? '' : ' · puuttuu aines'}</small></div>
    </div>`;
  }
  function ensureSpices(homeI) {
    const key = 'fridge-p' + (homeI + 1);
    const fr = loadStore(key, FRIDGE_MAX);
    let changed = false;
    for (const s of SPICES) {
      if (!fr.includes(s.id) && fr.length < FRIDGE_MAX) { fr.push(s.id); changed = true; }
    }
    if (changed) saveStore(key, fr);
    return fr;
  }
  function pickSpice(pool) {
    for (const s of SPICES) if (countHave(pool, s.id) > 0) return s;
    return null;
  }
  function consume(homeI, playerI, recipe) {
    const fridge = loadStore('fridge-p' + (homeI + 1), FRIDGE_MAX);
    const shelf = loadStore('cookshelf-p' + (homeI + 1), SHELF_MAX);
    let bag = (H.hunger?.bag?.(playerI) || []).slice();
    for (const need of recipe.need) {
      let ix = fridge.indexOf(need);
      if (ix >= 0) { fridge.splice(ix, 1); continue; }
      ix = shelf.indexOf(need);
      if (ix >= 0) { shelf.splice(ix, 1); continue; }
      ix = bag.indexOf(need);
      if (ix >= 0) { bag.splice(ix, 1); continue; }
    }
    saveStore('fridge-p' + (homeI + 1), fridge);
    saveStore('cookshelf-p' + (homeI + 1), shelf);
    H.hunger?.setBag?.(playerI, bag);
    return { fridge, shelf, bag };
  }
  function consumeSpice(homeI, playerI) {
    const spiceIds = new Set(SPICES.map(s => s.id));
    const fridge = loadStore('fridge-p' + (homeI + 1), FRIDGE_MAX);
    const shelf = loadStore('cookshelf-p' + (homeI + 1), SHELF_MAX);
    let bag = (H.hunger?.bag?.(playerI) || []).slice();
    const take = (arr) => { const ix = arr.findIndex(x => spiceIds.has(x)); if (ix >= 0) return arr.splice(ix, 1)[0]; };
    const id = take(fridge) || take(shelf) || take(bag);
    if (!id) return null;
    saveStore('fridge-p' + (homeI + 1), fridge);
    saveStore('cookshelf-p' + (homeI + 1), shelf);
    H.hunger?.setBag?.(playerI, bag);
    return SPICES.find(s => s.id === id) || { id, name: id, emoji: '🌿' };
  }

  function heartBalloon(x, y, z) {
    const g = new (T().Group)();
    const ball = new (T().Mesh)(new (T().SphereGeometry)(0.28, 12, 10), M(0xfa5252, { e: 0xe03131, ei: 0.35 }));
    ball.position.y = 0.35; g.add(ball);
    const string = new (T().Mesh)(new (T().CylinderGeometry)(0.012, 0.012, 1.2, 4), M(0xffffff));
    string.position.y = -0.35; g.add(string);
    // sydän-lätkä
    const lbl = H.makeLabel('❤️', { scale: 1.6, size: 64, bg: '#ffffff00' });
    lbl.position.y = 0.55; g.add(lbl);
    H.addObject(g, x, y, z);
    balloons.push({ g, y, life: 8, vy: 1.6 + Math.random() * 0.6 });
  }

  function isCooked(id) { return COOKED.some(c => c.id === id); }

  function giveFood(fromI, toKind, toRef) {
    const bag = H.hunger?.bag?.(fromI) || [];
    const cooked = bag.find(id => isCooked(id));
    if (!cooked) { H.toast(fromI, 'Ei kotiruokaa repussa', true); return false; }
    const next = bag.slice(); next.splice(next.indexOf(cooked), 1);
    H.hunger.setBag(fromI, next);
    const info = COOKED.find(c => c.id === cooked) || H.hunger.ITEMS[cooked];
    if (toKind === 'player') {
      if (!H.hunger.addToBag(toRef, cooked)) {
        // jos täynnä, syötä suoraan
        H.hunger.eat?.(toRef, cooked);
      }
      H.toast(fromI, `Annoit ruoan pelaajalle ${toRef + 1} ${info.emoji}`);
      H.toast(toRef, `Sait ruokaa: ${info.emoji} ${info.name}`);
      H.emit?.('giveFood', fromI, 'player', toRef);
      return true;
    }
    // NPC
    const ped = toRef;
    H.money?.add?.(fromI, 2 + ((Math.random() * 3) | 0), '+ tippi ruoasta');
    if (H.v22) {
      // myönnä onni ~45 s
      try {
        const L = H.v22.luckT();
        // ei setteriä – käytä sisäistä jos saatavilla
      } catch (e) {}
    }
    grantLuck(fromI, 45);
    heartBalloon(ped.x, ped.y + 1.8, ped.z);
    if (typeof ped === 'object' && ped.g) {
      // say thanks via label
      try {
        const lbl = H.makeLabel('Kiitos! ❤️', { scale: 2.2, size: 56, bg: '#fff0f6' });
        H.addObject(lbl, ped.x, ped.y + 2.6, ped.z);
        setTimeout(() => H.removeObject(lbl), 2000);
      } catch (e) {}
    }
    H.toast(fromI, `Annoit ruoan hahmolle · onni + tippi! ${info.emoji}`);
    H.beep(880, 0.1, 'triangle', 0.05);
    H.emit?.('giveFood', fromI, 'npc', ped);
    return true;
  }

  function grantLuck(i, sec) {
    try {
      if (H.v22 && H.v22.setLuck) H.v22.setLuck(i, Math.max(H.v22.luckT?.()[i] || 0, sec));
      else {
        if (!H._luck) H._luck = [];
        H._luck[i] = Math.max(H._luck[i] || 0, sec);
      }
    } catch (e) {}
    H.toast(i, `🍀 Onni ${sec} s`);
  }

  function openCookMenu(p, homeI) {
    if (H.menuPad?.open) return;
    const pool = poolFor(homeI, p.index);
    const items = RECIPES.map(r => {
      const ok = canCook(pool, r);
      return { id: r.id, recipe: r, disabled: !ok, html: recipeHtml(r, pool) };
    });
    items.unshift({
      id: '_keittioilta',
      disabled: (H.players || []).length < 2,
      html: '🍲 <b>Yhteinen keittiöilta</b><br><small>Iso resepti · vähintään 2 pelaajaa tuo aineksia samaan pataan</small>',
    });
    H.menuPad.show({
      owner: p.index,
      title: '🍳 Ruoanlaitto',
      items,
      onSelect: (it) => {
        if (it.id === '_keittioilta') {
          setTimeout(() => H.coop?.kitchen?.open(p, homeI), 40);
          return;
        }
        if (it.disabled) return;
        consume(homeI, p.index, it.recipe);
        const sp = consumeSpice(homeI, p.index);
        cookJobs.push({ i: p.index, homeI, recipe: it.recipe, t: COOK_SEC, spice: sp });
        H.toast(p.index, `Valmistuu: ${it.recipe.emoji} ${it.recipe.name}` + (sp ? ` + ${sp.emoji} ${sp.name}` : '') + '…');
        H.beep(660, 0.08, 'square', 0.04);
      },
    });
  }

  function openFridgeMenu(p, homeI) {
    if (H.menuPad?.open) return;
    const fridge = ensureSpices(homeI);
    const bag = H.hunger.bag(p.index);
    const items = [
      { id: 'tofridge', html: '📥 Vie aineksia jääkaappiin repusta', disabled: !bag.length },
      { id: 'tobag', html: '📤 Ota jääkaapista reppuun', disabled: !fridge.length },
      { id: 'toshelf', html: '📚 Vie aineksia hyllylle', disabled: !bag.length },
    ];
    H.menuPad.show({
      owner: p.index,
      title: '❄️ Jääkaappi / hylly',
      items,
      onSelect: (it) => {
        if (it.id === 'tofridge') {
          let fr = loadStore('fridge-p' + (homeI + 1), FRIDGE_MAX);
          let bg = H.hunger.bag(p.index).slice();
          while (bg.length && fr.length < FRIDGE_MAX) fr.push(bg.shift());
          saveStore('fridge-p' + (homeI + 1), fr); H.hunger.setBag(p.index, bg);
          H.toast(p.index, 'Ainekset jääkaapissa ❄️');
        } else if (it.id === 'tobag') {
          let fr = loadStore('fridge-p' + (homeI + 1), FRIDGE_MAX);
          while (fr.length && H.hunger.addToBag(p.index, fr[0], true)) fr.shift();
          saveStore('fridge-p' + (homeI + 1), fr);
          H.toast(p.index, 'Otettu jääkaapista');
        } else if (it.id === 'toshelf') {
          let sh = loadStore('cookshelf-p' + (homeI + 1), SHELF_MAX);
          let bg = H.hunger.bag(p.index).slice();
          while (bg.length && sh.length < SHELF_MAX) sh.push(bg.shift());
          saveStore('cookshelf-p' + (homeI + 1), sh); H.hunger.setBag(p.index, bg);
          H.toast(p.index, 'Ainekset hyllyllä 📚');
        }
      },
    });
  }

  function openMarket(p) {
    if (H.menuPad?.open) return;
    const items = MARKET.map(m => {
      const info = INGREDIENTS.find(x => x.id === m.id) || H.hunger.ITEMS[m.id];
      return {
        id: m.id, price: m.price,
        html: `${info?.emoji || '🧂'} <b>${info?.name || m.id}</b> · ${m.price} 🪙`,
      };
    });
    H.menuPad.show({
      owner: p.index,
      title: '🛒 Torin ainekset',
      grid: true, cols: 3,
      items,
      keepOpen: true,
      onSelect: (it) => {
        if (!H.money.spend(p.index, it.price)) {
          H.toast(p.index, `Tarvitset ${it.price - H.money.get(p.index)} kolikkoa`, true);
          return;
        }
        if (!H.hunger.addToBag(p.index, it.id)) {
          H.money.add(p.index, it.price); // refund
          H.toast(p.index, 'Reppu täynnä', true);
          return;
        }
        H.toast(p.index, `Ostit: ${H.hunger.ITEMS[it.id]?.emoji || ''} ${H.hunger.ITEMS[it.id]?.name}`);
        H.beep(784, 0.08, 'triangle', 0.05);
      },
    });
  }

  function attachToHomes() {
    fridges = [];
    const list = H.homes?.list?.() || [];
    list.forEach((h) => {
      // paikalliset koordinaatit keittiössä
      const fx = h.x + 5.2, fz = h.z + 4.2;
      const cx = h.x + 6.4, cz = h.z + 3.4;
      const fg = makeFridge(); H.addObject(fg, fx, 0, fz);
      const fl = H.makeLabel('❄️ Jääkaappi', { scale: 1.8, size: 48 }); H.addObject(fl, fx, 2.1, fz);
      const cg = makeCookSpot(); H.addObject(cg, cx, 0, cz);
      const cl = H.makeLabel('🍳 Liesi', { scale: 1.8, size: 48 }); H.addObject(cl, cx, 1.9, cz);
      // keittiöhylly merkki
      const sx = h.x + 4.2, sz = h.z + 4.6;
      const sl = H.makeLabel('📚 Raaka-ainehylly', { scale: 1.6, size: 44 }); H.addObject(sl, sx, 1.7, sz);
      ensureSpices(h.i);
      fridges.push({ homeI: h.i, fx, fz, cx, cz, sx, sz, fg, cg });
    });
  }

  function buildMarketStall() {
    marketPads = [];
    const x = -48, z = -34;
    const stall = new (T().Group)();
    const table = new (T().Mesh)(new (T().BoxGeometry)(3.2, 0.12, 1.4), M(0x8f5420));
    table.position.y = 0.9; stall.add(table);
    [[-1, 0], [1, 0]].forEach(([dx]) => {
      const leg = new (T().Mesh)(new (T().BoxGeometry)(0.1, 0.9, 0.1), M(0x6b4423));
      leg.position.set(dx, 0.45, 0.5); stall.add(leg);
      const leg2 = leg.clone(); leg2.position.set(dx, 0.45, -0.5); stall.add(leg2);
    });
    const canopy = new (T().Mesh)(new (T().BoxGeometry)(3.6, 0.08, 1.8), M(0xe03131));
    canopy.position.y = 2.1; stall.add(canopy);
    H.addObject(stall, x, 0, z);
    const lbl = H.makeLabel('🛒 Ainekset', { scale: 3.2, bg: '#2b8a3e' });
    H.addObject(lbl, x, 2.6, z);
    marketPads.push({ x, z });
  }


  let meals = []; // { homeI, recipe, spice, mesh, food, eaten, seats: {i: chair} }

  function makeMealMesh(recipe) {
    const g = new (T().Group)();
    const plate = new (T().Mesh)(new (T().CylinderGeometry)(0.28, 0.3, 0.05, 12), M(0xf8f9fa, { r: 0.4 }));
    plate.position.y = 0.03; g.add(plate);
    const food = new (T().Mesh)(new (T().SphereGeometry)(0.16, 8, 6), M(0xe67700, { r: 0.55, e: 0xd9480f, ei: 0.15 }));
    food.position.y = 0.14; food.scale.set(1, 0.55, 1); g.add(food);
    const lab = H.makeLabel((recipe.emoji || '🍽️') + ' ' + (recipe.name || 'Ruoka'), { scale: 1.5, size: 42, bg: '#fff4e6' });
    lab.position.y = 0.55; g.add(lab);
    g.userData.food = food; g.userData.lab = lab;
    return g;
  }
  function serveMeal(homeI, recipe, spice) {
    const kit = H.homes?.kitchen?.(homeI);
    if (!kit) return null;
    // poista vanha syöty tai lisää viereen (max 3)
    meals = meals.filter((m) => {
      if (m.homeI !== homeI) return true;
      if (m.eaten) { try { H.removeObject(m.mesh); } catch (e) {} return false; }
      return true;
    });
    const same = meals.filter(m => m.homeI === homeI && !m.eaten);
    if (same.length >= 3) {
      const old = same[0];
      try { H.removeObject(old.mesh); } catch (e) {}
      meals = meals.filter(m => m !== old);
    }
    const n = meals.filter(m => m.homeI === homeI && !m.eaten).length;
    const mesh = makeMealMesh(recipe);
    const ox = (n - 1) * 0.45;
    H.addObject(mesh, kit.table.x + ox, 0.82, kit.table.z);
    const rec = { homeI, recipe, spice, mesh, eaten: false, seats: {} };
    meals.push(rec);
    return rec;
  }
  function mealAt(homeI) { return meals.find(m => m.homeI === homeI && !m.eaten) || null; }
  function nearestChair(p) {
    const homes = H.homes?.list?.() || [];
    let best = null, bd = 1.15;
    for (const h of homes) {
      const kit = H.homes.kitchen(h.i); if (!kit) continue;
      kit.chairs.forEach((c, k) => {
        const d = Math.hypot(p.pos.x - c.x, p.pos.z - c.z);
        if (d < bd) { bd = d; best = { homeI: h.i, chair: k, x: c.x, z: c.z, table: kit.table }; }
      });
    }
    return best;
  }
  function sitAtTable(p, seat) {
    if (!p || !seat) return false;
    p._mealSit = { homeI: seat.homeI, chair: seat.chair };
    p.pos.set(seat.x, 0.12, seat.z);
    p.vx = p.vz = p.speed = 0; p.grounded = true;
    const yaw = Math.atan2(seat.table.x - seat.x, seat.table.z - seat.z);
    p.yaw = yaw;
    H.toast(p.index, 'Istuuduit pöytään');
    H.beep(392, 0.08, 'sine', 0.03);
    return true;
  }
  function standFromTable(p) {
    if (!p?._mealSit) return false;
    const kit = H.homes?.kitchen?.(p._mealSit.homeI);
    if (kit) {
      const c = kit.chairs[p._mealSit.chair];
      if (c) p.pos.set(c.x, 0.12, c.z + (c.z >= kit.table.z ? 0.55 : -0.55));
    }
    p._mealSit = null; p._eatT = 0;
    return true;
  }
  function eatAtTable(p) {
    const sit = p && p._mealSit; if (!sit) return false;
    const m = mealAt(sit.homeI); if (!m) { H.toast(p.index, 'Pöydässä ei ole ruokaa', true); return false; }
    m.eaten = true;
    if (m.mesh && m.mesh.userData.food) m.mesh.userData.food.visible = false;
    if (m.mesh && m.mesh.userData.lab) m.mesh.userData.lab.visible = false;
    p._eatT = 1.15;
    try { H.hunger?.eat?.(p.index, m.recipe.out); } catch (e) {}
    grantLuck(p.index, m.spice ? 22 : 16);
    H.toast(p.index, '😋 Nam! Hyvää ruokaa' + (m.spice ? (' ja ' + m.spice.name) : '') + ' — onnea!');
    H.beep(784, 0.1, 'triangle', 0.05);
    setTimeout(() => { try { H.removeObject(m.mesh); } catch (e) {} meals = meals.filter(x => x !== m); }, 1800);
    return true;
  }

  H.onStart(() => {
    active = !H.challenge; cookJobs = []; balloons = []; fridges = []; marketPads = []; meals = [];
    registerFoods();
    if (!active) return;
    // odota hetki että homes ehtii
    setTimeout(() => { if (active) { attachToHomes(); buildMarketStall(); } }, 200);
  });
  H.onStop(() => { active = false; fridges.forEach(() => {}); meals.forEach(m => { try { H.removeObject(m.mesh); } catch (e) {} }); fridges = []; cookJobs = []; balloons = []; marketPads = []; meals = []; });

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    // onni-tick (oma jos v22 ei peilaa)
    if (H._luck) {
      for (let i = 0; i < H._luck.length; i++) {
        if (H._luck[i] > 0) {
          H._luck[i] -= dt;
          if (H._luck[i] <= 0) { H._luck[i] = 0; H.toast(i, 'Onni loppui'); }
          else H.hud(i, `🍀 Onni ${Math.ceil(H._luck[i])} s`, 'cookluck');
        }
      }
    }
    // kypsyminen
    for (let j = cookJobs.length - 1; j >= 0; j--) {
      const job = cookJobs[j];
      job.t -= dt;
      H.hud(job.i, `🍳 ${job.recipe.emoji} valmistuu… ${job.t.toFixed(1)} s`, 'cook');
      if (job.t <= 0) {
        if (H.hunger.addToBag(job.i, job.recipe.out)) {
          H.toast(job.i, `Valmista! ${job.recipe.emoji} ${job.recipe.name} → reppu ja pöytä`);
        } else {
          H.toast(job.i, 'Reppu täynnä – ruoka pöytään ja jääkaappiin');
          const fr = loadStore('fridge-p' + (job.homeI + 1), FRIDGE_MAX);
          if (fr.length < FRIDGE_MAX) { fr.push(job.recipe.out); saveStore('fridge-p' + (job.homeI + 1), fr); }
        }
        serveMeal(job.homeI, job.recipe, job.spice);
        H.beep(1046, 0.12, 'triangle', 0.06);
        H.hud(job.i, '', 'cook');
        cookJobs.splice(j, 1);
      }
    }
    // ilmapallot
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      b.y += b.vy * dt; b.life -= dt;
      b.g.position.y = b.y;
      b.g.position.x += Math.sin(H.time * 1.5 + i) * 0.15 * dt;
      if (b.life <= 0) { H.removeObject(b.g); balloons.splice(i, 1); }
    }

    for (const p of H.players) {
      if (p.car != null || p.rocket || p.moon) continue;
      const i = p.index, key = H.KEYS('interact')[i];
      if (H.menuPad?.open && H.menuPad.owner === i) continue;

      // tori
      const nearM = marketPads.find(m => Math.hypot(p.pos.x - m.x, p.pos.z - m.z) < 2.2);
      if (nearM) {
        H.hud(i, `🛒 Torin ainekset · ${key} = selaa`, 'cookui');
        if (H.pressed(i, 'interact')) openMarket(p);
        continue;
      }

      // pöytä: istu ja syö
      if (p._eatT > 0) {
        p._eatT -= dt;
        p.pos.y = 0.12 + Math.abs(Math.sin((1.15 - Math.max(0, p._eatT)) * 10)) * 0.05;
        H.hud(i, '😋 Syödään…', 'cookui');
        continue;
      }
      if (p._mealSit) {
        const m = mealAt(p._mealSit.homeI);
        H.hud(i, m ? (`🍽️ Syö ${m.recipe.emoji} · ${key}   ·  nouse = hyppy`) : (`Pöydässä · ${key} = nouse`), 'cookui');
        const inp = H.input(i);
        if (H.pressed(i, 'interact')) {
          if (m) eatAtTable(p); else standFromTable(p);
        } else if (inp && inp.jump) standFromTable(p);
        continue;
      }
      const seat = nearestChair(p);
      if (seat && p.pos.y < 2.2) {
        const m = mealAt(seat.homeI);
        H.hud(i, m ? (`🍽️ Istu ja syö ${m.recipe.emoji} · ${key}`) : (`Istu pöytään · ${key}`), 'cookui');
        if (H.pressed(i, 'interact')) sitAtTable(p, seat);
        continue;
      }

      // koti: jääkaappi / liesi
      let handled = false;
      for (const f of fridges) {
        if (Math.hypot(p.pos.x - f.cx, p.pos.z - f.cz) < 1.5 && p.pos.y < 2.5) {
          H.hud(i, `🍳 Liesi · ${key} = kokkaa`, 'cookui');
          if (H.pressed(i, 'interact')) openCookMenu(p, f.homeI);
          handled = true; break;
        }
        if (Math.hypot(p.pos.x - f.fx, p.pos.z - f.fz) < 1.5 && p.pos.y < 2.5) {
          H.hud(i, `❄️ Jääkaappi · ${key} = avaa`, 'cookui');
          if (H.pressed(i, 'interact')) openFridgeMenu(p, f.homeI);
          handled = true; break;
        }
        if (Math.hypot(p.pos.x - f.sx, p.pos.z - f.sz) < 1.4 && p.pos.y < 2.5) {
          H.hud(i, `📚 Hylly · ${key} = siirrä aineksia`, 'cookui');
          if (H.pressed(i, 'interact')) openFridgeMenu(p, f.homeI);
          handled = true; break;
        }
      }
      if (handled) continue;

      // anna ruokaa toiselle pelaajalle / NPC:lle
      const bag = H.hunger?.bag?.(i) || [];
      const hasCooked = bag.some(isCooked);
      if (hasCooked) {
        let nearP = H.players.find(o => o.index !== i && o.car == null && Math.hypot(p.pos.x - o.pos.x, p.pos.z - o.pos.z) < 1.8);
        if (nearP) {
          H.hud(i, `🎁 Anna kotiruoka P${nearP.index + 1}:lle · ${key}`, 'cookui');
          if (H.pressed(i, 'interact')) giveFood(i, 'player', nearP.index);
          continue;
        }
        const peds = H.peds?.list?.() || [];
        let nearPed = peds.find(pd => Math.hypot(p.pos.x - pd.x, p.pos.z - pd.z) < 1.8);
        if (nearPed) {
          H.hud(i, `🎁 Anna ruokaa hahmolle · ${key}`, 'cookui');
          if (H.pressed(i, 'interact')) giveFood(i, 'npc', nearPed);
          continue;
        }
      }
      H.hud(i, '', 'cookui');
    }
  });

  H.cooking = {
    RECIPES, INGREDIENTS, COOKED, MARKET,
    fridge: i => loadStore('fridge-p' + (i + 1), FRIDGE_MAX),
    shelf: i => loadStore('cookshelf-p' + (i + 1), SHELF_MAX),
    canCook: (homeI, playerI, recipeId) => {
      const r = RECIPES.find(x => x.id === recipeId); if (!r) return false;
      return canCook(poolFor(homeI, playerI), r);
    },
    grantLuck, heartBalloon, isCooked, SPICES, FRIDGE_MAX,
    ensureSpices, recipeProgress, recipeHave, recipeHtml,
    serveMeal, mealAt, sitAtTable, eatAtTable, standFromTable, meals: () => meals.slice(),
  };

})();
