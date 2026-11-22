// wallet.js – 3.4: jokaisella hahmolla oma lompakko, nappi ja kivat mekaniikat.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.6, metalness: o.m ?? 0.1,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
  });
  const PIGGY_RATE = 90; // s välein pieni korko
  const TICKET = { circus: 2, plane: 2 };
  const STICKERS = ['⭐', '🌈', '🦄', '🐸', '🎈', '🍀', '🍓', '🚀'];

  function loadExtra(i) {
    const d = H.load('wallet-x-p' + (i + 1), null) || {};
    return {
      photo: d.photo || '👨‍👩‍👧‍👦',
      stickers: Array.isArray(d.stickers) ? d.stickers.slice(0, 12) : ['⭐'],
      receipts: Array.isArray(d.receipts) ? d.receipts.slice(-8) : [],
      card: d.card !== false,
      piggy: Math.max(0, d.piggy | 0),
      piggyT: d.piggyT || 0,
    };
  }
  function saveExtra(i, x) {
    H.save('wallet-x-p' + (i + 1), {
      photo: x.photo, stickers: x.stickers, receipts: x.receipts,
      card: x.card, piggy: x.piggy, piggyT: x.piggyT,
    });
  }

  let active = false, extras = [], dropped = [], lost = [], piggies = [], hold = Array(12).fill(false);
  let openFor = -1;

  function earn(i, n, reason) {
    n = Math.round(n);
    if (!(n > 0)) return 0;
    if (H.coop && H.coop.pay) return H.coop.pay(i, n, reason) || 0;
    H.money?.add?.(i, n, reason);
    return n;
  }

  function addReceipt(i, text) {
    const x = extras[i] || (extras[i] = loadExtra(i));
    x.receipts.push({ t: Date.now(), text: String(text).slice(0, 60) });
    if (x.receipts.length > 8) x.receipts = x.receipts.slice(-8);
    saveExtra(i, x);
  }
  function addSticker(i, s) {
    const x = extras[i] || (extras[i] = loadExtra(i));
    if (x.stickers.includes(s)) return false;
    x.stickers.push(s);
    saveExtra(i, x);
    return true;
  }

  function coinsAndNotes(n) {
    n = Math.max(0, n | 0);
    const notes = Math.floor(n / 5);
    const coins = n - notes * 5;
    return { notes, coins, total: n };
  }

  function isDropped(i) { return dropped.some(d => d.owner === i && d.alive); }

  function walletHtml(i) {
    const n = H.money?.get?.(i) | 0;
    const cn = coinsAndNotes(n);
    const x = extras[i] || loadExtra(i);
    const miss = isDropped(i);
    const rec = (x.receipts || []).slice(-4).reverse().map(r => '• ' + r.text).join('<br>') || '— ei vielä kuitteja —';
    const st = (x.stickers || []).join(' ') || '—';
    const key = H.keyLabel?.(i, 'wallet') || 'B';
    return `<div class="hyyte-wallet" data-wallet="${i}">
      <div style="font-size:22px;font-weight:900">👛 ${miss ? 'Lompakko on pudonnut!' : 'Oma lompakko'}</div>
      <p style="margin:6px 0">${miss ? 'Etsi se maasta tai pyydä kaveria palauttamaan.' : `💵 Setelit: <b>${cn.notes}</b> × 5  ·  🪙 Kolikot: <b>${cn.coins}</b>  ·  yht. <b>${n}</b>`}</p>
      <p>🪪 Kirjastokortti: ${x.card ? 'kyllä' : 'ei'} · 🖼️ Kuva: ${x.photo}<br>🎫 Tarrat: ${st}</p>
      <p style="opacity:.85"><small>Kuitit<br>${rec}</small></p>
      <p style="opacity:.9"><small>🐷 Säästöpossu kotona: <b>${x.piggy | 0}</b> 🪙 (pieni korko ajan kanssa)<br>
      Lompakko aukeaa napilla <b>${key}</b> (ohjain: View / Create).<br>
      Lähellä kaveria: lahjoita 1 🪙. Kojuilla, sirkuksessa ja lentokoneessa voi maksaa.</small></p>
    </div>`;
  }

  function closeWallet() {
    const el = document.getElementById('hyyte-wallet-wrap');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    openFor = -1;
  }
  function openWallet(i) {
    if (openFor === i) { closeWallet(); return; }
    closeWallet();
    openFor = i;
    const wrap = document.createElement('div');
    wrap.id = 'hyyte-wallet-wrap';
    wrap.innerHTML = `<style>
      #hyyte-wallet-wrap{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(10,20,30,.45)}
      #hyyte-wallet-wrap .card{background:#fff8ee;color:#3d2b1f;padding:16px 18px;border-radius:16px;min-width:280px;max-width:420px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-family:system-ui,sans-serif}
      #hyyte-wallet-wrap .row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      #hyyte-wallet-wrap button{font-weight:800;border:0;border-radius:10px;padding:8px 12px;cursor:pointer;background:#ffe8cc}
    </style><div class="card">${walletHtml(i)}<div class="row">
      <button data-w="give">🎁 Lahjoita 1 🪙</button>
      <button data-w="drop">📦 Pudota lompakko</button>
      <button data-w="close">Sulje</button>
    </div></div>`;
    wrap.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      const act = b.getAttribute('data-w');
      if (act === 'close') closeWallet();
      else if (act === 'give') { giveNear(i); closeWallet(); }
      else if (act === 'drop') { dropWallet(i); closeWallet(); }
    });
    document.body.appendChild(wrap);
    H.beep(523, 0.08, 'triangle', 0.04);
  }

  function nearestPlayer(i, r) {
    const me = H.players[i]; if (!me) return null;
    let best = null, bd = r ?? 2.2;
    for (const p of (H.players || [])) {
      if (!p || p.index === i) continue;
      const d = Math.hypot(me.pos.x - p.pos.x, me.pos.z - p.pos.z);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  function giveNear(i, amt) {
    amt = amt || 1;
    if (isDropped(i)) { H.toast(i, 'Lompakko on pudonnut!', true); return false; }
    if ((H.money?.get?.(i) | 0) < amt) { H.toast(i, 'Ei tarpeeksi kolikoita lahjaksi', true); return false; }
    const o = nearestPlayer(i, 2.4);
    if (!o) { H.toast(i, 'Mene lähemmäs kaveria lahjoittaaksesi', true); return false; }
    if (!H.money.spend(i, amt)) return false;
    H.money.add(o.index, amt); // siirto, ei uutta rahaa – ei capia
    addReceipt(i, 'Lahja ' + amt + ' 🪙 → pelaaja ' + (o.index + 1));
    addReceipt(o.index, 'Sait ' + amt + ' 🪙 kaverilta ' + (i + 1));
    if (addSticker(o.index, '🍀')) H.toast(o.index, 'Sait onnentarran!');
    H.toast(i, 'Annoit ' + amt + ' 🪙 pelaajalle ' + (o.index + 1));
    H.toast(o.index, 'Sait ' + amt + ' 🪙 kaverilta!');
    H.beep(880, 0.1, 'triangle', 0.05);
    return true;
  }

  function dropWallet(i) {
    if (isDropped(i)) { H.toast(i, 'Lompakko on jo maassa', true); return false; }
    const p = H.players[i]; if (!p) return false;
    const g = new (T().Group)();
    const body = new (T().Mesh)(new (T().BoxGeometry)(0.38, 0.08, 0.28), M(0x7c2d12, { r: 0.7 }));
    g.add(body);
    const lab = H.makeLabel('👛 Lompakko P' + (i + 1), { scale: 1.4, size: 40, bg: '#fff0e0' });
    lab.position.y = 0.35; g.add(lab);
    H.addObject(g, p.pos.x, 0.12, p.pos.z + 0.7);
    dropped.push({ owner: i, mesh: g, x: p.pos.x, z: p.pos.z + 0.7, alive: true });
    H.toast(i, 'Pudotit lompakon – älä unohda sitä!');
    H.beep(220, 0.1, 'square', 0.04);
    return true;
  }

  function pickDropped(finder, rec) {
    if (!rec || !rec.alive) return false;
    rec.alive = false;
    try { H.removeObject(rec.mesh); } catch (e) {}
    dropped = dropped.filter(d => d !== rec);
    if (finder.index === rec.owner) {
      H.toast(finder.index, 'Löysit oman lompakkosi!');
    } else {
      H.toast(finder.index, 'Palautit kaverin lompakon – kiitos!');
      H.toast(rec.owner, 'P' + (finder.index + 1) + ' palautti lompakkosi!');
      if (addSticker(finder.index, '🌈')) H.toast(finder.index, 'Sait palautustarran!');
      earn(finder.index, 1, '🌈 Palautuspalkinto +1 🪙');
    }
    H.beep(784, 0.1, 'triangle', 0.05);
    return true;
  }

  function canPay(i) {
    return !isDropped(i);
  }

  function payAt(i, kind, amount, label) {
    amount = amount | 0;
    if (!canPay(i)) { H.toast(i, 'Lompakko on pudonnut – et voi maksaa', true); return false; }
    if (amount <= 0) return true;
    if (!H.money.spend(i, amount)) {
      H.toast(i, 'Ei tarpeeksi kolikoita' + (label ? (' (' + label + ' ' + amount + ' 🪙)') : ''), true);
      return false;
    }
    addReceipt(i, (label || kind) + ' −' + amount + ' 🪙');
    if (kind === 'circus' && addSticker(i, '🎈')) H.toast(i, 'Sirkustarra lompakkoon!');
    if (kind === 'plane' && addSticker(i, '🚀')) H.toast(i, 'Lentotarra lompakkoon!');
    return true;
  }

  function buildPiggies() {
    piggies = [];
    const list = H.homes?.list?.() || [];
    list.forEach((h) => {
      const pos = H.homes.piggy?.(h.i) || { x: h.x - 5.2, z: h.z + 2.2 };
      const g = new (T().Group)();
      const body = new (T().Mesh)(new (T().SphereGeometry)(0.22, 10, 8), M(0xfa5252, { r: 0.45, e: 0xe03131, ei: 0.12 }));
      body.scale.set(1.15, 0.85, 0.9); g.add(body);
      const snout = new (T().Mesh)(new (T().SphereGeometry)(0.08, 8, 6), M(0xffa8a8));
      snout.position.set(0, 0, 0.2); g.add(snout);
      const lab = H.makeLabel('🐷 Säästöpossu', { scale: 1.5, size: 40, bg: '#fff0f0' });
      lab.position.y = 0.5; g.add(lab);
      H.addObject(g, pos.x, 0.35, pos.z);
      piggies.push({ homeI: h.i, x: pos.x, z: pos.z, mesh: g });
    });
  }

  function openPiggy(p, homeI) {
    const i = p.index;
    const x = extras[i] || (extras[i] = loadExtra(i));
    if (H.menuPad?.open) return;
    H.menuPad.show({
      owner: i,
      title: '🐷 Säästöpossu (' + (x.piggy | 0) + ' 🪙)',
      items: [
        { id: 'in', html: '➕ Laita 2 🪙 possuun', disabled: (H.money.get(i) | 0) < 2 || isDropped(i) },
        { id: 'out', html: '➖ Ota 2 🪙 possusta', disabled: (x.piggy | 0) < 2 },
        { id: 'close', html: 'Sulje' },
      ],
      onSelect: (it) => {
        if (it.id === 'in') {
          if (!H.money.spend(i, 2)) return;
          x.piggy = (x.piggy | 0) + 2; saveExtra(i, x);
          addReceipt(i, 'Possuun +2 🪙');
          H.toast(i, 'Säästit 2 🪙 possuun!');
        } else if (it.id === 'out') {
          if ((x.piggy | 0) < 2) return;
          x.piggy -= 2; saveExtra(i, x);
          H.money.add(i, 2); // omat säästöt takaisin, ei uutta rahaa
          addReceipt(i, 'Possusta −2 🪙');
          H.toast(i, 'Otit 2 🪙 possusta');
        }
      },
    });
  }

  function tickInterest(dt) {
    for (const p of (H.players || [])) {
      if (!p) continue;
      const i = p.index;
      const x = extras[i] || (extras[i] = loadExtra(i));
      if ((x.piggy | 0) < 4) continue;
      x.piggyT = (x.piggyT || 0) + dt;
      if (x.piggyT >= PIGGY_RATE) {
        x.piggyT = 0;
        const bonus = Math.min(2, 1 + Math.floor((x.piggy | 0) / 10));
        // korko on uutta rahaa possuun, coop-katto huomioidaan jos possun nosto...
        // lisätään possuun, merkitään kuitilla; nostaessa raha tulee lompakkoon ilman capia
        // koska se on jo "ansaittu" korkona – capataan ansainnalla tässä:
        const got = earn(i, bonus, null);
        if (got > 0) {
          // siirrä korko suoraan possuun: vähennä lompakosta takaisin
          if (H.money.get(i) >= got) H.money.spend(i, got);
          x.piggy += got;
          addReceipt(i, 'Possun korko +' + got + ' 🪙');
          H.toast(i, '🐷 Possu sai korkoa +' + got + ' 🪙!');
        }
        saveExtra(i, x);
      } else saveExtra(i, x);
    }
  }

  function spawnLostCoins() {
    lost = [];
    const spots = [
      { x: -40, z: -60 }, { x: 20, z: -80 }, { x: -88, z: -70 },
      { x: 100, z: -50 }, { x: 0, z: -100 }, { x: -20, z: -140 },
      { x: 60, z: -90 }, { x: -120, z: -90 },
    ];
    spots.forEach((s, k) => {
      const g = new (T().Mesh)(new (T().CylinderGeometry)(0.22, 0.22, 0.06, 12), M(0xffd43b, { m: 0.6, e: 0xf59f00, ei: 0.45 }));
      g.rotation.x = Math.PI / 2;
      H.addObject(g, s.x, 0.4, s.z);
      lost.push({ mesh: g, x: s.x, z: s.z, alive: true, value: k % 4 === 0 ? 2 : 1 });
    });
  }

  function hookTickets() {
    // sirkus: pieni lippu ensimmäisellä sisäänkäynnillä / sessio
    const c = H.circus;
    if (c && c.enter && !c._walletHook) {
      const prev = c.enter.bind(c);
      c.enter = function (p) {
        if (p && !p._circusTicket) {
          if ((H.money.get(p.index) | 0) >= TICKET.circus && canPay(p.index)) {
            if (payAt(p.index, 'circus', TICKET.circus, 'Sirkuslippu')) p._circusTicket = true;
          } else {
            H.toast(p.index, 'Sirkukseen pääsee myös ilman lippua – maksa jos sinulla on kolikoita');
            p._circusTicket = true;
          }
        }
        return prev(p);
      };
      c._walletHook = true;
    }
    const pl = H.plane;
    if (pl && pl.board && !pl._walletHook) {
      const prev = pl.board.bind(pl);
      pl.board = function (p, quiet) {
        if (p && !p._planeTicket && !quiet) {
          if ((H.money.get(p.index) | 0) >= TICKET.plane && canPay(p.index)) {
            if (payAt(p.index, 'plane', TICKET.plane, 'Lentolippu')) p._planeTicket = true;
          } else {
            if (!quiet) H.toast(p.index, 'Lento onnistuu myös ilman lippua tällä kertaa');
            p._planeTicket = true;
          }
        }
        return prev(p, quiet);
      };
      pl._walletHook = true;
    }
  }

  H.onStart(() => {
    active = !H.challenge;
    dropped = []; lost = []; piggies = []; openFor = -1; hold = Array(12).fill(false);
    extras = Array.from({ length: 12 }, (_, i) => loadExtra(i));
    closeWallet();
    if (!active) return;
    try { buildPiggies(); spawnLostCoins(); hookTickets(); } catch (e) { console.warn('wallet', e); }
  });
  H.onStop(() => {
    active = false; closeWallet();
    dropped.forEach(d => { try { H.removeObject(d.mesh); } catch (e) {} });
    lost.forEach(c => { try { H.removeObject(c.mesh); } catch (e) {} });
    dropped = []; lost = []; piggies = [];
  });

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    tickInterest(dt);
    if (openFor >= 0 && (H.pressed(openFor, 'wallet') || H.keyPressed?.('Escape'))) {
      closeWallet();
      hold[openFor] = true;
    }
    for (const p of (H.players || [])) {
      if (!p) continue;
      const i = p.index;
      if (p.car != null || p.rocket || p.moon) continue;
      const want = !!(H.input(i) && H.input(i).wallet);
      if (want && !hold[i] && openFor !== i) openWallet(i);
      hold[i] = want;

      // pudotettu lompakko
      for (const d of dropped) {
        if (!d.alive) continue;
        if (Math.hypot(p.pos.x - d.x, p.pos.z - d.z) < 1.4 && p.pos.y < 2.5) {
          const k = H.keyLabel?.(i, 'interact') || 'E';
          H.hud(i, `👛 ${d.owner === i ? 'Oma lompakko' : ('P' + (d.owner + 1) + ' lompakko (palauta)')} · ${k}`, 'wallet');
          if (H.pressed(i, 'interact')) pickDropped(p, d);
        }
      }
      // kadonneet kolikot
      for (const c of lost) {
        if (!c.alive) continue;
        if (Math.hypot(p.pos.x - c.x, p.pos.z - c.z) < 1.3) {
          c.alive = false; c.mesh.visible = false;
          const got = earn(i, c.value, c.value > 1 ? 'Löysit kadonneen isomman kolikon!' : 'Löysit kadonneen kolikon!');
          if (!got) H.toast(i, 'Sessioraha on jo täynnä – kolikko jäi muistoksi');
          if (addSticker(i, '⭐')) H.toast(i, 'Sait tähtitarran!');
          H.beep(1050, 0.08, 'triangle', 0.05);
        }
      }
      // possu
      const nearP = piggies.find(g => Math.hypot(p.pos.x - g.x, p.pos.z - g.z) < 1.5 && p.pos.y < 2.5);
      if (nearP) {
        const k = H.keyLabel?.(i, 'interact') || 'E';
        H.hud(i, `🐷 Säästöpossu · ${k} = avaa`, 'piggy');
        if (H.pressed(i, 'interact')) openPiggy(p, nearP.homeI);
      } else {
        H.hud(i, '', 'piggy');
      }
    }
  });

  H.wallet = {
    open: openWallet, close: closeWallet, html: walletHtml,
    give: giveNear, drop: dropWallet,
    pick: (finder, rec) => {
      const hit = dropped.find(d => d.alive && rec && (d === rec || d.owner === rec.owner));
      return pickDropped(finder, hit || rec);
    },
    pay: payAt, canPay, isDropped,
    extra: (i) => extras[i] || loadExtra(i),
    piggy: (i) => (extras[i] || loadExtra(i)).piggy | 0,
    deposit: (i, n) => {
      n = Math.round(n); if (n <= 0 || isDropped(i) || !H.money.spend(i, n)) return false;
      const x = extras[i] || (extras[i] = loadExtra(i));
      x.piggy += n; saveExtra(i, x); return true;
    },
    withdraw: (i, n) => {
      n = Math.round(n);
      const x = extras[i] || (extras[i] = loadExtra(i));
      if ((x.piggy | 0) < n) return false;
      x.piggy -= n; saveExtra(i, x); H.money.add(i, n); return true;
    },
    dropped: () => dropped.filter(d => d.alive).map(d => ({ owner: d.owner, x: d.x, z: d.z })),
    lost: () => lost.filter(c => c.alive).map(c => ({ x: c.x, z: c.z, value: c.value })),
    interestRate: PIGGY_RATE,
    TICKET,
  };
  H.define?.('wallet', H.wallet);
})();
