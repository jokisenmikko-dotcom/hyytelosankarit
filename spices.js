// spices.js – 2.2: 30+ eksoottista (vaikutus 90 s, hinnat ↑) maustetta ruokatorilla (maa, lippu, hinta, vaikutukset).
(function () {
  const H = window.HYYTE;
  const STALL = { x: -52, z: -28 }; // ruokatorin pohjoispuoli
  const SPICES = [
    { id: 'safrani', name: 'Sahrami', flag: '🇮🇷', country: 'Iran', price: 17, food: 8, effect: 'speed', dur: 90, emoji: '🌸', blurb: '+nopeus 90 s' },
    { id: 'vanilja', name: 'Vanilja', flag: '🇲🇬', country: 'Madagaskar', price: 13, food: 10, effect: 'heal', dur: 0, emoji: '🤎', blurb: '+HP' },
    { id: 'kaneli', name: 'Kaneli', flag: '🇱🇰', country: 'Sri Lanka', price: 7, food: 12, effect: 'warm', dur: 90, emoji: '🪵', blurb: 'lämpö · 90 s' },
    { id: 'kardemumma', name: 'Kardemumma', flag: '🇬🇹', country: 'Guatemala', price: 10, food: 9, effect: 'jump', dur: 90, emoji: '💚', blurb: '+hyppy · 90 s' },
    { id: 'kurkuma', name: 'Kurkuma', flag: '🇮🇳', country: 'Intia', price: 6, food: 11, effect: 'glow', dur: 90, emoji: '🟡', blurb: 'hehku · 90 s' },
    { id: 'sumakki', name: 'Sumakki', flag: '🇹🇷', country: 'Turkki', price: 7, food: 8, effect: 'vision', dur: 90, emoji: '🔴', blurb: '+näkö · 90 s' },
    { id: 'zaatar', name: 'Za\'atar', flag: '🇱🇧', country: 'Libanon', price: 8, food: 10, effect: 'speed', dur: 90, emoji: '🌿', blurb: '+nopeus · 90 s' },
    { id: 'harissa', name: 'Harissa', flag: '🇹🇳', country: 'Tunisia', price: 7, food: 7, effect: 'fire', dur: 90, emoji: '🌶️', blurb: 'tuli! · 90 s' },
    { id: 'raselhanout', name: 'Ras el hanout', flag: '🇲🇦', country: 'Marokko', price: 11, food: 12, effect: 'all', dur: 90, emoji: '✨', blurb: 'kaikki buffit · 90 s' },
    { id: 'yuzukosh', name: 'Yuzu-kosho', flag: '🇯🇵', country: 'Japani', price: 14, food: 6, effect: 'focus', dur: 90, emoji: '🍋', blurb: 'tarkkuus · 90 s' },
    { id: 'gochugaru', name: 'Gochugaru', flag: '🇰🇷', country: 'Korea', price: 8, food: 8, effect: 'fire', dur: 90, emoji: '🌶️', blurb: 'tuli · 90 s' },
    { id: 'sichuan', name: 'Sichuan-pippuri', flag: '🇨🇳', country: 'Kiina', price: 10, food: 7, effect: 'tingle', dur: 90, emoji: '🌶️', blurb: 'puutuminen · 90 s' },
    { id: 'galangal', name: 'Galangal', flag: '🇹🇭', country: 'Thaimaa', price: 7, food: 9, effect: 'heal', dur: 0, emoji: '🫚', blurb: '+HP' },
    { id: 'lemongrass', name: 'Sitruunaruoho', flag: '🇻🇳', country: 'Vietnam', price: 6, food: 8, effect: 'fresh', dur: 90, emoji: '🍋', blurb: 'raikkaus · 90 s' },
    { id: 'kemiri', name: 'Kemiri', flag: '🇮🇩', country: 'Indonesia', price: 7, food: 10, effect: 'armor', dur: 90, emoji: '🥜', blurb: 'suoja · 90 s' },
    { id: 'pandan', name: 'Pandan', flag: '🇲🇾', country: 'Malesia', price: 8, food: 9, effect: 'floaty', dur: 90, emoji: '🍃', blurb: 'keveys · 90 s' },
    { id: 'annatto', name: 'Annatto', flag: '🇲🇽', country: 'Meksiko', price: 6, food: 7, effect: 'glow', dur: 90, emoji: '🧡', blurb: 'hehku · 90 s' },
    { id: 'achiote', name: 'Achiote', flag: '🇧🇿', country: 'Belize', price: 7, food: 8, effect: 'warm', dur: 90, emoji: '🟥', blurb: 'lämpö · 90 s' },
    { id: 'aji', name: 'Ají amarillo', flag: '🇵🇪', country: 'Peru', price: 8, food: 7, effect: 'fire', dur: 90, emoji: '🟡', blurb: 'tuli · 90 s' },
    { id: 'urucum', name: 'Urucum', flag: '🇧🇷', country: 'Brasilia', price: 7, food: 8, effect: 'glow', dur: 90, emoji: '🟠', blurb: 'hehku · 90 s' },
    { id: 'chimichurri', name: 'Chimichurri', flag: '🇦🇷', country: 'Argentiina', price: 8, food: 11, effect: 'speed', dur: 90, emoji: '🌿', blurb: '+nopeus · 90 s' },
    { id: 'merquén', name: 'Merkén', flag: '🇨🇱', country: 'Chile', price: 10, food: 8, effect: 'smoke', dur: 90, emoji: '🔥', blurb: 'savu · 90 s' },
    { id: 'berbere', name: 'Berbere', flag: '🇪🇹', country: 'Etiopia', price: 10, food: 10, effect: 'fire', dur: 90, emoji: '🌶️', blurb: 'tuli · 90 s' },
    { id: 'grainsparadise', name: 'Paratiisin jyvät', flag: '🇬🇭', country: 'Ghana', price: 11, food: 9, effect: 'jump', dur: 90, emoji: '✨', blurb: '+hyppy · 90 s' },
    { id: 'selim', name: 'Selim-pippuri', flag: '🇸🇳', country: 'Senegal', price: 8, food: 7, effect: 'vision', dur: 90, emoji: '⚫', blurb: '+näkö · 90 s' },
    { id: 'grainsel', name: 'Voimansuolo', flag: '🇳🇬', country: 'Nigeria', price: 7, food: 8, effect: 'armor', dur: 90, emoji: '🧂', blurb: 'suoja · 90 s' },
    { id: 'mahleb', name: 'Mahleb', flag: '🇸🇾', country: 'Syyria', price: 10, food: 9, effect: 'sweet', dur: 90, emoji: '🍒', blurb: 'makeus · 90 s' },
    { id: 'nigella', name: 'Nigella', flag: '🇪🇬', country: 'Egypti', price: 6, food: 8, effect: 'focus', dur: 90, emoji: '🖤', blurb: 'tarkkuus · 90 s' },
    { id: 'fenugreek', name: 'Sarviapila', flag: '🇾🇪', country: 'Jemen', price: 6, food: 9, effect: 'heal', dur: 0, emoji: '🌱', blurb: '+HP' },
    { id: 'mastic', name: 'Mastiksi', flag: '🇬🇷', country: 'Kreikka', price: 13, food: 6, effect: 'fresh', dur: 90, emoji: '💎', blurb: 'raikkaus · 90 s' },
    { id: 'lavender', name: 'Laventeli', flag: '🇫🇷', country: 'Ranska', price: 8, food: 7, effect: 'calm', dur: 90, emoji: '💜', blurb: 'rauha · 90 s' },
    { id: 'safflower', name: 'Värisaflori', flag: '🇪🇸', country: 'Espanja', price: 7, food: 8, effect: 'glow', dur: 90, emoji: '🧡', blurb: 'hehku · 90 s' },
    { id: 'juniper', name: 'Katajanmarja', flag: '🇫🇮', country: 'Suomi', price: 4, food: 6, effect: 'fresh', dur: 90, emoji: '🔵', blurb: 'raikkaus · 90 s' },
    { id: 'longpepper', name: 'Pitkäpippuri', flag: '🇰🇭', country: 'Kambodža', price: 11, food: 7, effect: 'fire', dur: 90, emoji: '🌶️', blurb: 'tuli · 90 s' },
    { id: 'tonka', name: 'Tonkapapu', flag: '🇻🇪', country: 'Venezuela', price: 15, food: 5, effect: 'sweet', dur: 90, emoji: '🤎', blurb: 'makeus · 90 s' },
  ];

  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.65, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0 });
  let active = false, pads = [], fx = [{}, {}, {}, {}];

  function applyEffect(i, sp) {
    const p = H.players[i]; if (!p) return;
    const f = fx[i];
    if (sp.effect === 'heal') { p.hp = Math.min(100, p.hp + 15); H.toast(i, `❤️ ${sp.emoji} ${sp.name}: +15 HP`); return; }
    f.kind = sp.effect; f.t = sp.dur || 15; f.name = sp.name; f.emoji = sp.emoji;
    if (sp.effect === 'speed' || sp.effect === 'all') p.speedMul = Math.max(p.speedMul || 1, 1.35);
    if (sp.effect === 'jump' || sp.effect === 'all') p._spiceJump = 1.4;
    if (sp.effect === 'armor' || sp.effect === 'all') p._spiceArmor = 0.5;
    if (sp.effect === 'floaty') p._spiceFloat = true;
    if (sp.effect === 'glow' || sp.effect === 'all') p._spiceGlow = true;
    H.toast(i, `${sp.flag} ${sp.emoji} ${sp.name}: ${sp.blurb} (${sp.country})`);
  }

  function makeJar(col) {
    const G = T(), g = new G.Group();
    const jar = new G.Mesh(new G.CylinderGeometry(0.18, 0.2, 0.35, 12), M(col, { e: col, ei: 0.15 }));
    jar.position.y = 0.2; jar.castShadow = true; g.add(jar);
    const lid = new G.Mesh(new G.CylinderGeometry(0.16, 0.16, 0.05, 12), M(0xdee2e6, { r: 0.3 }));
    lid.position.y = 0.4; g.add(lid);
    return g;
  }

  function build() {
    const G = T(), Me = G.Mesh;
    const floor = new Me(new G.BoxGeometry(28, 0.12, 10), M(0xfff3bf)); floor.position.y = 0.06; floor.receiveShadow = true;
    H.addObject(floor, STALL.x, 0, STALL.z);
    const roof = new Me(new G.BoxGeometry(28, 0.15, 10.4), M(0xe8590c)); roof.position.set(0, 3.4, 0);
    const posts = [-13, 13].flatMap(x => [-4.5, 4.5].map(z => { const p = new Me(new G.CylinderGeometry(0.1, 0.1, 3.4, 8), M(0x495057)); p.position.set(x, 1.7, z); return p; }));
    const grp = new G.Group(); grp.add(roof, ...posts);
    const sign = H.makeLabel('🌶️ MAUSTETORI · 35 maustetta', { bg: '#e8590c', scale: 6.5 }); sign.position.set(0, 4.2, 0); grp.add(sign);
    H.addObject(grp, STALL.x, 0, STALL.z);
    for (let k = -12; k <= 12; k += 3) H.addObstacle(STALL.x + k, STALL.z - 4.2, 0.7, 1.0);

    pads = SPICES.map((sp, k) => {
      const cols = 7;
      const row = Math.floor(k / cols), col = k % cols;
      const x = STALL.x - 12 + col * 4.0, z = STALL.z - 2.2 + row * 2.4;
      H.addObject(new Me(new G.CylinderGeometry(0.7, 0.7, 0.08, 20), M(0xffd43b, { e: 0x664400, ei: 0.25 })), x, 0.18, z);
      const jar = makeJar([0xff6b6b, 0xfcc419, 0x40c057, 0x748ffc, 0xbe4bdb, 0xff922b, 0x20c997][k % 7]);
      jar.scale.setScalar(1.6); H.addObject(jar, x, 0.4, z);
      const label = H.makeLabel(`${sp.flag} ${sp.emoji} ${sp.name}\n${sp.price}🪙 · ${sp.blurb}`, { scale: 2.2, size: 32, bg: '#102430', w: 520 });
      H.addObject(label, x, 1.85, z);
      return { ...sp, x, z, jar };
    });
  }

  function buy(i, sp) {
    if (!H.money.spend(i, sp.price)) { H.toast(i, `Tarvitset ${sp.price - H.money.get(i)} kolikkoa lisää 🪙`, true); H.beep(200, 0.2, 'sawtooth', 0.04); return; }
    // syö heti (mausteet ovat pussukoita) + buffi
    if (H.hunger?.set) {
      const cur = H.hunger.get(i);
      H.hunger.set(i, Math.min(100, cur + sp.food));
    }
    applyEffect(i, sp);
    H.beep(784, 0.1, 'triangle', 0.06);
  }

  H.onStart(() => {
    active = !H.challenge; pads = [];
    fx = [{}, {}, {}, {}];
    if (active) build();
  });
  H.onStop(() => { active = false; pads = []; });
  H.onUpdate(dt => {
    if (!active) return;
    for (const pd of pads) if (pd.jar) pd.jar.rotation.y += dt * 0.8;
    for (const p of H.players) {
      const i = p.index, f = fx[i];
      if (f.t > 0) {
        f.t -= dt;
        if (f.kind === 'speed' || f.kind === 'all') p.speedMul = Math.max(p.speedMul || 1, 1.35);
        if (f.kind === 'floaty' && p.grounded === false && p.vy < -2) p.vy = Math.max(p.vy, -2);
        if (f.t <= 0) {
          f.kind = null; p._spiceJump = 0; p._spiceArmor = 0; p._spiceFloat = false; p._spiceGlow = false;
          if ((p.speedMul || 1) > 1) p.speedMul = 1;
          H.toast(i, 'Mausteen vaikutus loppui');
        }
      }
      const near = p.car == null && !p.rocket ? pads.find(pd => Math.hypot(p.pos.x - pd.x, p.pos.z - pd.z) < 1.35 && p.pos.y < 2) : null;
      if (near) {
        H.hud(i, `🌶️ ${near.flag} ${near.name} (${near.country}) · ${near.price}🪙 · ${near.blurb} · E = osta`, 'spice');
        if (H.pressed(i, 'interact')) buy(i, near);
      } else H.hud(i, '', 'spice');
    }
  });

  // hyppybuffi: hook moon/earth jump via player flag read in game — also bump vy on jump edge
  const prevJump = {};
  H.onUpdate(dt => {
    if (!active) return;
    for (const p of H.players) {
      if (!p._spiceJump) continue;
      const inp = H.input(p.index) || {};
      if (inp.jump && !prevJump[p.index] && p.grounded) {
        // pieni lisäys heti hypyn jälkeen
        setTimeout(() => { if (p.vy > 0) p.vy *= p._spiceJump; }, 0);
      }
      prevJump[p.index] = !!inp.jump;
    }
  });

  H.spices = { SPICES, STALL, count: () => SPICES.length, fx: () => fx.map(f => ({ ...f })) };
})();
