// money.js – kolikot ja lompakko (Vapaa leikki). Käyttää window.HYYTE-rajapintaa.
// Lompakko tallentuu pelaajapaikoittain: localStorage hyyte-money-p1 / hyyte-money-p2.
(function () {
  const H = window.HYYTE;
  const COIN_COUNT = 28, RESPAWN = 18, PICK_R = 1.8;
  const wallet = Array.from({length:12},(_,i)=>H.load('money-p'+(i+1),0)|0);   // 3.0: 12 lompakkoa
  let coins = [], geo = null, matGold = null, matBig = null, active = false;
  const listeners = new Set();

  const money = {
    get: i => wallet[i] | 0,
    /** Lisää rahaa; reason näytetään ilmoituksena jos annettu. */
    add(i, n, reason) {
      if (!(n > 0)) return;
      wallet[i] = (wallet[i] | 0) + Math.round(n); store(i);
      if (reason) H.toast(i, reason);
      listeners.forEach(f => f(i, wallet[i]));
      H.emit?.('earn', i, Math.round(n), reason || '');
    },
    /** Kuluttaa rahaa; palauttaa false jos ei riitä. */
    spend(i, n) {
      if (wallet[i] < n) return false;
      wallet[i] -= n; store(i); listeners.forEach(f => f(i, wallet[i])); H.emit?.('spend', i, n); return true;
    },
    set(i, n) { wallet[i] = Math.max(0, n | 0); store(i); },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    coins: () => coins.map(c => ({ x: c.x, z: c.z, alive: c.alive, value: c.value })),
  };
  H.money = money;
  function store(i) { H.save('money-p' + (i + 1), wallet[i]); }

  /** Satunnainen vapaa paikka kartalla (ei Haaste-areenaa, ei esteitä). */
  function freeSpot(tries = 60) {
    const g = H.game;
    for (let k = 0; k < tries; k++) {
      const x = (Math.random() * 2 - 1) * 135, z = (Math.random() * 2 - 1) * 135;
      if (Math.hypot(x, z - 105) < 48) continue;           // Haaste-alue
      if (Math.hypot(x + 1.2, z - 2.35) < 12) continue;      // museo / raketti
      if (g.isBlocked && g.isBlocked(x, z)) continue;
      if (g.obstacles.some(o => Math.hypot(o.x - x, o.z - z) < o.r + 1.5)) continue;
      return { x, z };
    }
    return { x: -20, z: -20 };
  }
  H.freeSpot = freeSpot;

  function placeCoin(c) {
    const s = freeSpot();
    c.x = s.x; c.z = s.z; c.alive = true; c.timer = 0;
    c.big = Math.random() < 0.12; c.value = c.big ? 5 : 1;
    c.mesh.material = c.big ? matBig : matGold;
    c.mesh.scale.setScalar(c.big ? 1.5 : 1);
    c.baseY = (H.game.groundHeight ? H.game.groundHeight(c.x, c.z) : 0) + 1;
    c.mesh.position.set(c.x, c.baseY, c.z); c.mesh.visible = true;
  }

  H.onStart(() => {
    active = !H.challenge;
    coins = [];
    if (!active) return;
    const T = H.THREE;
    geo = geo || new T.CylinderGeometry(0.45, 0.45, 0.12, 20);
    matGold = matGold || new T.MeshStandardMaterial({ color: 0xffc928, metalness: 0.7, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.5 });
    matBig = matBig || new T.MeshStandardMaterial({ color: 0xffe066, metalness: 0.8, roughness: 0.15, emissive: 0xff9f1a, emissiveIntensity: 0.8 });
    for (let k = 0; k < COIN_COUNT; k++) {
      const m = new T.Mesh(geo, matGold); m.rotation.x = Math.PI / 2;
      H.addObject(m);
      const c = { mesh: m, phase: Math.random() * 6 };
      placeCoin(c); coins.push(c);
    }
  });
  H.onStop(() => { coins = []; active = false; });

  H.onUpdate(dt => {
    if (!active) return;
    for (const c of coins) {
      if (!c.alive) {
        if ((c.timer -= dt) <= 0) placeCoin(c);
        continue;
      }
      c.phase += dt;
      c.mesh.rotation.z = c.phase * 2.5;
      c.mesh.position.y = c.baseY + Math.sin(c.phase * 2) * 0.15;
      for (const p of H.players) {
        const q = H.posOf(p);
        if (Math.abs(q.x - c.x) > PICK_R || Math.abs(q.z - c.z) > PICK_R) continue;
        if (Math.hypot(q.x - c.x, q.z - c.z) > (p.car != null ? 2.6 : PICK_R)) continue;
        if (q.y > c.baseY + 3) continue;
        c.alive = false; c.mesh.visible = false; c.timer = RESPAWN;
        money.add(p.index, c.value, c.big ? '+5 iso kolikko!' : null);
        H.beep(c.big ? 1320 : 1050, 0.08, 'triangle', 0.05);
        break;
      }
    }
    for (const p of H.players) H.hud(p.index, `🪙 ${wallet[p.index]}`, 'money');
  });
})();
