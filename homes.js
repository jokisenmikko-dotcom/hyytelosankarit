// homes.js – 2.6: sohvalla pad EI KOSKAAN nosta; Kuutiojuoksu A/✕ + RT/R2 = hyppy
// homes.js – Pelaajien omat kodit (1.7): isompi talo jossa harjakatto, ikkunat, ovi, savupiippu
// ja kuisti. Sisällä olohuone, keittiö ja makuuhuone kalusteineen. Kun pelaaja on sisällä, hänen
// kamerastaan piilotetaan katto ja seinien yläosat (nukkekotinäkymä). Arkkuun voi viedä tavaroita
// repusta (tallentuu localStorageen hyyte-home-p1/p2) ja ne näkyvät hyllyillä. Erillinen autotalli,
// jonka ovi aukeaa napista – auton voi ajaa sisään.
(function () {
  const H = window.HYYTE;
  const HOME_COLORS = ['#f4e3c1', '#e8a87c', '#c94f4f', '#6fa8dc', '#93c47d', '#ffd966', '#b4a7d6', '#ffffff', '#7f6a5a'];
  const GARAGE_COLORS = ['#c0c4cc', '#4f5b66', '#c94f4f', '#3d85c6', '#6aa84f', '#f1c232', '#e69138', '#ffffff'];
  const HOMES = [
    { x: -54, z: -168 }, { x: 33, z: -168 }, { x: -141, z: -168 }, { x: 144, z: -168 },
    { x: -54, z: -210 }, { x: 33, z: -210 }, { x: -141, z: -210 }, { x: 144, z: -210 },
    { x: -97, z: -168 }, { x: 88, z: -168 }, { x: -97, z: -210 }, { x: 88, z: -210 },
  ];
  const WH = 3.2, LOW = 1.1, CHEST_MAX = 30;
  const KEY = new Proxy([], { get: (t, k) => (/^\d+$/.test(k) ? (H.keyLabel?.(+k, 'interact') || 'E') : t[k]) });
  const DEF_HOUSE = [0,3,4,5,1,2,6,7,8,0,3,4], DEF_GARAGE = [2,3,6,5,0,1,4,7,2,3,6,5], SIGN_BG = ['#c92a2a','#1864ab','#2b8a3e','#e67700','#9c36b5','#e64980','#0b7285','#5c940d','#e67700','#d9480f','#5f3dc4','#087f5b'];
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: o.r ?? 0.75, metalness: o.m ?? 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0, transparent: !!o.op, opacity: o.op ?? 1, side: o.side ?? 0 });
  let active = false, homes = [];

  function colors(i) {
    let d = {}; try { d = JSON.parse(localStorage.getItem('hyyte-p' + (i + 1)) || '{}') || {}; } catch {}
    const ok = (v, L) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : null;
    return { house: ok(d.houseColor) || HOME_COLORS[DEF_HOUSE[i] ?? 0], garage: ok(d.garageColor) || GARAGE_COLORS[DEF_GARAGE[i] ?? 2] };
  }
  const loadChest = i => { const d = H.load('home-p' + (i + 1), null) || {}; return Array.isArray(d.chest) ? d.chest.filter(x => H.hunger?.ITEMS[x]).slice(0, CHEST_MAX) : []; };
  const saveChest = h => H.save('home-p' + (h.i + 1), { chest: h.chest });

  function box(w, hgt, d, mat, x, y, z, parent) {
    const m = new (T().Mesh)(new (T().BoxGeometry)(w, hgt, d), mat); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; parent && parent.add(m); return m;
  }

  /** Rakentaa yhden kodin. Palauttaa olion jossa kaikki tila. */
  function buildHome(i) {
    const G = T(), base = HOMES[i], col = colors(i);
    const low = new G.Group(), up = new G.Group(), gUp = new G.Group();
    const wallM = M(col.house), trimM = M(0xffffff), roofM = M(0x7a2e22, { r: 0.9 }), woodM = M(0x9c6b3c), darkWood = M(0x6b4423);
    const glassM = M(0x9fd3ff, { e: 0x335577, ei: 0.35, r: 0.15, op: 0.55 });
    const obs = [];
    const circ = (x, z, r, hgt) => obs.push(H.obstacle(base.x + x, base.z + z, r ?? 0.45, hgt ?? WH));
    // seinä akselin suuntaisesti (x1,z1)-(x2,z2), aukot [keskikohta, leveys] seinän suunnassa
    function wall(x1, z1, x2, z2, gaps = [], wins = [], mat = wallM, upGroup = up, height = WH) {
      const alongX = z1 === z2, a0 = alongX ? Math.min(x1, x2) : Math.min(z1, z2), a1 = alongX ? Math.max(x1, x2) : Math.max(z1, z2);
      const c = alongX ? z1 : x1, th = 0.26;
      const cuts = gaps.map(([m, w]) => [m - w / 2, m + w / 2]).sort((p, q) => p[0] - q[0]);
      let s = a0; const segs = [];
      for (const [g0, g1] of cuts) { if (g0 > s) segs.push([s, g0]); s = g1; }
      if (s < a1) segs.push([s, a1]);
      for (const [s0, s1] of segs) {
        const L = s1 - s0, m = (s0 + s1) / 2;
        const mk = (hgt, y, grp) => alongX ? box(L, hgt, th, mat, m, y, c, grp) : box(th, hgt, L, mat, c, y, m, grp);
        mk(LOW, LOW / 2, low); mk(height - LOW, LOW + (height - LOW) / 2, upGroup);
        if (alongX) H.addWallSeg(base.x + s0, base.z + c, base.x + s1, base.z + c, height, 0.32, 'home' + i);
        else H.addWallSeg(base.x + c, base.z + s0, base.x + c, base.z + s1, height, 0.32, 'home' + i);
        for (let t = s0 + 0.25; t <= s1 - 0.2; t += 0.5) alongX ? circ(t, c, 0.45, height) : circ(c, t, 0.45, height);
      }
      // ovien yläpuoliset palkit
      for (const [g0, g1] of cuts) { const L = g1 - g0, m = (g0 + g1) / 2; alongX ? box(L, height - 2.3, th, mat, m, 2.3 + (height - 2.3) / 2, c, upGroup) : box(th, height - 2.3, L, mat, c, 2.3 + (height - 2.3) / 2, m, upGroup); }
      for (const [m, w] of wins) {
        const fr = alongX ? box(w + 0.2, 1.4, th + 0.08, trimM, m, 1.9, c, upGroup) : box(th + 0.08, 1.4, w + 0.2, trimM, c, 1.9, m, upGroup);
        alongX ? box(w, 1.2, th + 0.12, glassM, m, 1.9, c, upGroup) : box(th + 0.12, 1.2, w, glassM, c, 1.9, m, upGroup);
        alongX ? box(0.08, 1.2, th + 0.14, trimM, m, 1.9, c, upGroup) : box(th + 0.14, 1.2, 0.08, trimM, c, 1.9, m, upGroup);
        fr.castShadow = false;
      }
    }
    // --- talo (x -7..7, z -5..5), ovi edessä (+z) ---
    box(14, 0.06, 10, M(0xc9a27a, { r: 0.6 }), 0, 0.03, 0, low).castShadow = false;
    box(14.6, 0.3, 10.6, M(0x868e96), 0, -0.1, 0, low);
    wall(-7, 5, 7, 5, [[-3, 1.6]], [[-5.6, 1.4], [4, 1.8]]);
    wall(-7, -5, 7, -5, [], [[-4, 1.8], [4, 1.6]]);
    wall(-7, -5, -7, 5, [], [[0, 1.8]]);
    wall(7, -5, 7, 5, [], [[-2.5, 1.4], [2.5, 1.4]]);
    const inM = M(0xf8f0e3);
    wall(1, -5, 1, 5, [[2.5, 1.4], [-2.6, 1.3]], [], inM);
    wall(1, 0, 7, 0, [[4, 1.4]], [], inM);
    // auki oleva etuovi
    const door = box(0.12, 2.25, 1.5, darkWood, -3.8, 1.13, 5.85, low); door.castShadow = true;
    box(0.06, 0.06, 0.06, M(0xfcc419, { m: 0.8 }), -3.7, 1.1, 6.4, low);
    // harjakatto
    const rise = 2.6, half = 5, a = Math.atan2(rise, half), L = Math.hypot(rise, half) + 0.8;
    [1, -1].forEach(sd => { const r = box(15, 0.22, L, roofM, 0, WH + rise / 2 + 0.05, sd * half / 2 + sd * 0.15, up); r.rotation.x = sd * a; });
    const sh = new G.Shape(); sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
    [-7, 7].forEach(x => { const gm = new G.Mesh(new G.ShapeGeometry(sh), M(col.house, { side: 2 })); gm.rotation.y = Math.PI / 2; gm.position.set(x, WH, 0); up.add(gm); });
    const ridge = box(15.2, 0.25, 0.3, M(0x4a1d16), 0, WH + rise + 0.08, 0, up); ridge.castShadow = false;
    box(1.0, 2.4, 1.0, M(0xa0522d), 4.2, WH + rise - 0.2, -1.8, up);
    box(1.2, 0.2, 1.2, M(0x5c3a1e), 4.2, WH + rise + 1.0, -1.8, up);
    // kuisti
    box(4.6, 0.28, 2.8, woodM, -3, 0.14, 6.45, low);
    box(1.8, 0.14, 0.6, woodM, -3, 0.07, 8.1, low);
    [-5.1, -0.9].forEach(x => { box(0.2, 2.7, 0.2, trimM, x, 1.35, 7.6, low); box(0.08, 0.9, 2.6, trimM, x, 0.7, 6.4, low); });
    const pr = box(5, 0.16, 3.2, roofM, -3, 2.85, 6.6, up); pr.rotation.x = 0.18;
    // --- kalusteet ---
    const F = low;
    box(5, 0.02, 3.4, M(0xc92a2a, { r: 1 }), -3.6, 0.07, -0.6, F);           // matto
    box(1.0, 0.5, 2.6, M(0x5c7cfa), -6.3, 0.35, -0.6, F); box(0.3, 0.9, 2.6, M(0x4c6ef5), -6.75, 0.6, -0.6, F); // sohva
    [-1.85, 0.65].forEach(z => box(1.0, 0.75, 0.3, M(0x4c6ef5), -6.3, 0.45, z, F));
    box(1.0, 0.08, 1.6, woodM, -3.15, 0.45, -0.6, F); [-0.9, 0.9].forEach(dz => box(0.08, 0.4, 0.08, woodM, -3.15, 0.22, -0.6 + dz * 0.8, F));
    box(0.5, 0.6, 2.2, darkWood, 0.5, 0.3, -0.6, F); box(0.08, 0.95, 1.7, M(0x111111, { r: 0.2 }), 0.55, 1.15, -0.6, F); // TV
    // 1.9: TV-ruutu on canvas-kuva ("Tervetuloa kotiin" / Hyytelö-Kakkonen -ohjelma sohvalta)
    const tvCv = document.createElement('canvas'); tvCv.width = 320; tvCv.height = 166;
    const tvTex = new G.CanvasTexture(tvCv); tvTex.colorSpace = G.SRGBColorSpace;
    const tv = new G.Mesh(new G.PlaneGeometry(1.55, 0.8), new G.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tvTex, emissiveIntensity: 1, roughness: 1, toneMapped: false }));
    tv.rotation.y = -Math.PI / 2; tv.position.set(0.46, 1.15, -0.6); F.add(tv);
    const lampP = box(0.08, 1.6, 0.08, M(0x495057), -6.4, 0.8, -4.3, F); lampP.castShadow = false;
    box(0.5, 0.4, 0.5, M(0xfff3bf, { e: 0xffd43b, ei: 0.5 }), -6.4, 1.75, -4.3, F);
    // hylly (tavaroiden näyttö) ja arkku
    const shelf = { x: -4, z: -4.65 };
    box(3.4, 2.6, 0.08, darkWood, shelf.x, 1.3, -4.82, F);
    for (let k = 0; k < 4; k++) box(3.4, 0.07, 0.6, woodM, shelf.x, 0.15 + k * 0.75, shelf.z, F);
    [-1.7, 1.7].forEach(dx => box(0.08, 2.6, 0.6, woodM, shelf.x + dx, 1.3, shelf.z, F));
    const chestPos = { x: -1.3, z: -4.2 };
    box(1.5, 0.7, 0.9, M(0x8f5420), chestPos.x, 0.35, chestPos.z, F);
    const lid = box(1.56, 0.16, 0.96, M(0x6b4423), chestPos.x, 0.78, chestPos.z, F);
    box(0.2, 0.25, 0.05, M(0xfcc419, { m: 0.8 }), chestPos.x, 0.6, chestPos.z + 0.47, F);
    const chestLbl = H.makeLabel('📦 Arkku', { scale: 1.8, size: 56 }); chestLbl.position.set(chestPos.x, 1.6, chestPos.z); F.add(chestLbl);
    // keittiö (x 1..7, z 0..5)
    box(0.8, 0.95, 4.0, M(0xffffff), 6.4, 0.48, 2.6, F); box(0.85, 0.06, 4.05, M(0x495057), 6.4, 0.98, 2.6, F);
    box(0.6, 0.06, 0.5, M(0x868e96, { m: 0.7, r: 0.3 }), 6.4, 1.02, 1.6, F);
    box(0.85, 2.0, 0.85, M(0xdee2e6, { m: 0.3, r: 0.3 }), 6.35, 1.0, 0.55, F);
    box(1.6, 0.08, 1.0, woodM, 3.6, 0.78, 2.8, F); [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]].forEach(([dx, dz]) => box(0.07, 0.75, 0.07, woodM, 3.6 + dx, 0.38, 2.8 + dz, F));
    [[3.6, 1.9], [3.6, 3.7]].forEach(([x, z]) => { box(0.5, 0.06, 0.5, M(0xe03131), x, 0.48, z, F); box(0.5, 0.5, 0.06, M(0xe03131), x, 0.75, z + (z < 2.8 ? -0.25 : 0.25), F); });
    // makuuhuone (x 1..7, z -5..0)
    box(2.0, 0.45, 3.0, M(0xffffff), 5.6, 0.3, -3.3, F); box(2.05, 0.1, 2.1, M(col.house === '#ffffff' ? 0x74c0fc : 0x339af0), 5.6, 0.58, -2.9, F);
    box(1.2, 0.18, 0.6, M(0xf8f9fa), 5.6, 0.6, -4.45, F); box(2.1, 1.0, 0.12, darkWood, 5.6, 0.6, -4.85, F);
    box(0.5, 0.5, 0.5, woodM, 4.2, 0.25, -4.5, F);
    box(1.4, 2.2, 0.6, M(0xb08968), 1.9, 1.1, -4.6, F);
    box(0.02, 0.9, 0.02, M(0x222222), 1.9, 1.1, -4.29, F);
    // postilaatikko pihalla
    const mail = { x: -6.2, z: 9 };
    box(0.12, 1.1, 0.12, M(0x495057), mail.x, 0.55, mail.z, low); box(0.5, 0.4, 0.7, M(0x1971c2), mail.x, 1.25, mail.z, low);
    // nimikyltti
    const sign = H.makeLabel(`🏠 P${i + 1}:n koti`, { scale: 5, bg: SIGN_BG[i] || '#c92a2a' }); sign.position.set(0, WH + rise + 1.8, 0); up.add(sign);

    // --- autotalli (x 9..16, z -4..5), ovi +z ---
    // 2.0: isompi autotalli (mahtuu urheilu-/lentävään autoon)
    const gx0 = 7, gx1 = 19, gz0 = -5, gz1 = 7, gcx = (gx0 + gx1) / 2;
    const gM = M(col.garage);
    box(12.2, 0.06, 12.2, M(0x9aa0a6, { r: 0.9 }), gcx, 0.03, 1.0, low).castShadow = false;
    box(6.5, 0.05, 4.2, M(0x9aa0a6, { r: 0.9 }), gcx, 0.025, gz1 + 2.2, low).castShadow = false;   // ajoluiska
    wall(gx0, gz0, gx1, gz0, [], [], gM, gUp, 3.6);
    wall(gx0, gz0, gx0, gz1, [], [[0.5, 1.8]], gM, gUp, 3.6);
    wall(gx1, gz0, gx1, gz1, [], [], gM, gUp, 3.6);
    wall(gx0, gz1, gx0 + 1.6, gz1, [], [], gM, gUp, 3.6);
    wall(gx1 - 1.6, gz1, gx1, gz1, [], [], gM, gUp, 3.6);
    box(12.4, 0.28, 12.4, M(0x495057), gcx, 3.72, 1.0, gUp);
    box(gx1 - gx0 - 0.4, 0.5, 0.35, gM, gcx, 3.35, gz1, gUp);
    const gLbl = H.makeLabel(`🚗 P${i + 1}:n talli`, { scale: 4.2, bg: '#343a40' }); gLbl.position.set(gcx, 4.8, gz1); gUp.add(gLbl);
    const gdoor = new G.Group(); gdoor.position.set(gcx, 0, gz1);
    box(8.6, 3.0, 0.12, M(0xf1f3f5), 0, 1.5, 0, gdoor);
    for (let k = 0; k < 6; k++) box(8.62, 0.05, 0.16, M(0xadb5bd), 0, 0.35 + k * 0.5, 0, gdoor);
    low.add(gdoor);
    const doorObs = []; const btn = { x: gx1 + 0.9, z: gz1 + 1.2 };
    box(0.18, 1.2, 0.18, M(0x495057), btn.x, 0.6, btn.z, low);
    box(0.4, 0.4, 0.2, M(0x343a40), btn.x, 1.35, btn.z, low);
    const btnLamp = box(0.22, 0.22, 0.1, M(0xe03131, { e: 0xe03131, ei: 0.8 }), btn.x, 1.35, btn.z + 0.12, low);
    // työkaluhylly tallissa
    box(0.5, 1.8, 2.2, M(0x868e96), gx1 - 0.5, 0.9, -2.4, low);

    // suorituskyky: pienet kalusteet eivät heitä varjoa
    low.traverse(o => { if (o.isMesh && o.geometry.parameters && (o.geometry.parameters.width || 0) * (o.geometry.parameters.height || 0) < 3) o.castShadow = false; });
    gUp.traverse(o => { if (o.isMesh) o.castShadow = o.geometry.parameters?.width > 7; });
    // 1.8: staattiset osat yhdistetään (paljon vähemmän piirtokutsuja)
    H.mergeStatic(low, new Set([lid, btnLamp, gdoor, tv])); H.mergeStatic(up); H.mergeStatic(gUp);
    // kerros-näkymä: yläosista kopio kummallekin kameralle (layer 20+i)
    const NC = Math.max(2, H.players.length);
    const ups = Array.from({ length: NC }, (_, c) => c).map(c => { const u = up.clone(); u.traverse(o => o.layers.set(20 + c)); return u; });
    const gUps = Array.from({ length: NC }, (_, c) => c).map(c => { const u = gUp.clone(); u.traverse(o => o.layers.set(20 + c)); return u; });
    const root = new G.Group(); root.add(low, ...ups, ...gUps);
    H.addObject(root, base.x, 0, base.z);
    const h = { i, x: base.x, z: base.z, root, ups, gUps, gdoor, doorObs, btn, btnLamp, chest: loadChest(i), chestPos, shelf, lid, items: null, open: false, doorT: 0, mail, col, gx0, gx1, gz0, gz1, tvCv, tvTex, tvT: 0, tvShow: false, tvFrame: -1, sofa: { x: -5.85, z: -0.6 } };
    drawTv(h, 0);
    setDoor(h, false, true);
    renderShelf(h);
    return h;
  }

  function setDoor(h, open, quiet) {
    h.open = open;
    if (open) {
      h.doorObs.splice(0).forEach(o => H.removeObstacle(o));
      if (h.doorWall) { H.removeWall(h.doorWall); h.doorWall = null; }
    } else if (!h.doorObs.length) {
      for (let x = h.gx0 + 1.2; x <= h.gx1 - 1.2; x += 0.5) h.doorObs.push(H.obstacle(h.x + x, h.z + h.gz1, 0.45, 3.2));
      h.doorWall = H.addWallSeg(h.x + h.gx0 + 1.5, h.z + h.gz1, h.x + h.gx1 - 1.5, h.z + h.gz1, 3.2, 0.32, 'gdoor' + h.i);
    }
    h.btnLamp.material.color.setHex(open ? 0x40c057 : 0xe03131); h.btnLamp.material.emissive.setHex(open ? 0x40c057 : 0xe03131);
    if (!quiet) { H.beep(open ? 520 : 390, 0.25, 'square', 0.03); H.toast(h.i, open ? 'Autotallin ovi aukeaa 🚗' : 'Autotallin ovi sulkeutuu'); }
  }

  function renderShelf(h) {
    if (h.items) h.items.parent && h.items.parent.remove(h.items);
    const g = new (T().Group)(); h.items = g;
    h.chest.slice(0, 24).forEach((id, k) => {
      const it = H.hunger.makeItem(id); it.scale.setScalar(0.75);
      const row = Math.floor(k / 8), col = k % 8;
      it.position.set(h.shelf.x - 1.4 + col * 0.4, 0.2 + row * 0.75, h.shelf.z);
      g.add(it);
    });
    h.root.children[0].add(g);
  }

  const inHouse = (h, q) => q.x > h.x - 7 && q.x < h.x + 7 && q.z > h.z - 5 && q.z < h.z + 5.2 && q.y < 3;
  const inGarage = (h, q) => q.x > h.x + h.gx0 && q.x < h.x + h.gx1 && q.z > h.z + h.gz0 && q.z < h.z + h.gz1 + 0.3 && q.y < 3;

  H.onStart(() => {
    active = !H.challenge; homes = [];
    if (!active) return;
    homes = Array.from({ length: Math.max(2, H.players.length) }, (_, k) => buildHome(k));
    const cams = H.game.cameras || [];
    cams.forEach((c, k) => c && c.layers && c.layers.enable(20 + k));
    // varjot myös kattojen yläosista
    H.scene.traverse(o => { if (o.isDirectionalLight && o.shadow) { o.shadow.camera.layers.enable(20); } });
    // 2.1: pelaajat aloittavat sohvalla katsomassa TV:tä
    setTimeout(() => {
      H.players.forEach((p, i) => {
        const h = homes[i] || homes[0];
        if (!h || p.car != null) return;
        setDoor(h, true, true);
        p.pos.set(h.x + h.sofa.x, 0, h.z + h.sofa.z);
        sitDown(p, h);
      });
    }, 80);
  });
  H.onStop(() => { active = false; homes = []; seated.clear(); });
  H.onUpdate(dt => {
    if (!active) return;
    for (const h of homes) {
      h.doorT += ((h.open ? 1 : 0) - h.doorT) * Math.min(1, dt * 3);
      h.gdoor.position.y = h.doorT * 2.45; h.gdoor.scale.y = 1 - h.doorT * 0.85;
      h.lid.rotation.x = 0;
      // TV: ohjelma pyörii kun joku istuu tämän kodin sohvalla
      const watching = [...seated.values()].some(s => s === h);
      if (watching !== h.tvShow) { h.tvShow = watching; h.tvT = 0; h.tvFrame = -1; if (!watching) drawTv(h, 0); }
      if (watching) {
        h.tvT += dt; const f = Math.floor(h.tvT * 15);
        const ch = channelOf(h);
        if (ch === 'peli' || ch === 'dash') {
          let pi = h.tvOwner;
          if (pi == null) { for (const [pp, hh] of seated) if (hh === h) { pi = pp.index; break; } }
          if (pi != null) {
            if (ch === 'peli') updBreakout(h, pi, dt);
            if (ch === 'dash') updDash(h, pi, dt);
          }
          drawTv(h, h.tvT);
        } else if (f !== h.tvFrame) { h.tvFrame = f; drawTv(h, h.tvT); }
        const beat = Math.floor(h.tvT * 2.5); if (beat !== h.tvBeat) { h.tvBeat = beat; if (h.tvT > 1 && channelOf(h) === 'kakkonen') H.beep(TUNE[beat % TUNE.length], 0.16, 'triangle', 0.018); }
      }
    }
    for (const p of H.players) {
      const i = p.index, q = H.posOf(p);
      for (const h of homes) { h.ups[i].visible = !inHouse(h, q); h.gUps[i].visible = !inGarage(h, q); }
      let hud = '';
      const sh = seated.get(p);
      if (sh) {
        // 2.6: sohvalla PAD ei koskaan nosta hahmoa (jump/interact/fire/stick).
        // Nousu VAIN näppäimistöllä: Backspace. TV-pelit saavat pad-syötteen heti (ei erillistä TV-tilaa).
        p.pos.set(sh.x + sh.sofa.x, 0, sh.z + sh.sofa.z + (sh.seatOff?.get(p) || 0)); p.yaw = -Math.PI / 2;
        p.lock = true; p.speed = 0; p.vy = 0; p.tvActive = true; // auto-TV: pad → TV-pelit
        const bs = !!H.keyPressed?.('Backspace');
        if (bs) standUp(p);
        else refreshTvHint(p, sh);
        // kanavanvaihto VAIN näppäimistöllä (C / nuolet) — ei pad
        if (!p._chEdge) p._chEdge = { c: false, L: false, R: false };
        const kbC = !!H.kbDown?.(i, 'camera');
        const left = !!H.kbDown?.(i, 'left');
        const right = !!H.kbDown?.(i, 'right');
        if (kbC && !p._chEdge.c) switchChannel(sh, i, 1);
        if (left && !p._chEdge.L) switchChannel(sh, i, -1);
        if (right && !p._chEdge.R) switchChannel(sh, i, 1);
        p._chEdge.c = kbC; p._chEdge.L = left; p._chEdge.R = right;
        if (sh.tvOwner === i && p.tvChannel && sh.channel !== p.tvChannel) {
          sh.channel = p.tvChannel; sh.tvT = 0; sh.tvFrame = -1;
        }
        H.hud(i, '', 'home'); continue;
      }
      if (p.car == null && !p.rocket && !p.lock) {
        for (const h of homes) {
          if (inHouse(h, q) && (p.enterLock || 0) <= 0 && Math.hypot(q.x - (h.x + h.sofa.x), q.z - (h.z + h.sofa.z)) < 1.8) {
            hud = `🛋️ Sohva · ${KEY[i]} = istu ja katso TV:tä`;
            if (H.pressed(i, 'interact')) sitDown(p, h);
            continue;
          }
          if (Math.hypot(q.x - (h.x + h.btn.x), q.z - (h.z + h.btn.z)) < 1.9) {
            hud = `🔘 Tallin ovi · ${KEY[i]} = ${h.open ? 'sulje' : 'avaa'}`;
            if (H.pressed(i, 'interact')) setDoor(h, !h.open);
          } else if (Math.hypot(q.x - (h.x + h.chestPos.x), q.z - (h.z + h.chestPos.z)) < 1.7) {
            if (h.i !== i) { hud = `📦 Tämä on P${h.i + 1}:n arkku`; continue; }
            const bag = H.hunger.bag(i);
            hud = bag.length ? `📦 Arkku (${h.chest.length}) · ${KEY[i]} = vie repusta ${bag.length} tavaraa` : `📦 Arkku (${h.chest.length}) · ${KEY[i]} = ota ruokaa reppuun`;
            h.lid.rotation.x = -0.5;
            if (H.pressed(i, 'interact')) chestAction(h, i);
          }
        }
      } else if (p.car != null) {
        for (const h of homes) if (inGarage(h, q) && Math.abs(H.cars[p.car].speed) < 0.5) hud = '🅿️ Auto on parkissa tallissa';
      }
      // 3.3: sisällä ja autotallissa automaattinen ykköshenkilö (kamera ei jää talon ulkopuolelle)
      if (!sh && p.car == null && !p.rocket) {
        let indoor = !!(H.hatch && H.hatch.inside && H.hatch.inside(i));
        if (!indoor) {
          for (const h of homes) { if (inHouse(h, q) || inGarage(h, q)) { indoor = true; break; } }
        }
        if (indoor) { p._forceFP = true; p.firstPerson = true; }
        else if (p._forceFP) { p._forceFP = false; p.firstPerson = false; }
      }
      H.hud(i, hud, 'home');
    }
  });
  // ---------- 1.9: sohva + Hyytelö-Kakkonen ----------
  const seated = new Map();
  const TUNE = [523, 587, 659, 523, 659, 698, 784, 0, 784, 698, 659, 587, 523, 587, 523, 0].map(f => f || 392);
  const CHANNELS = ['kakkonen', 'uutiset', 'peli', 'dash'];
  const CH_NAME = { kakkonen: 'Hyytelö-Kakkonen', uutiset: 'Pikkuväen uutiset', peli: 'Pomppupallo', dash: 'Kuutiojuoksu' };
  const CH_NUM = { kakkonen: 1, uutiset: 2, peli: 3, dash: 4 };
  function channelOf(h) { return h.channel || 'kakkonen'; }
  function playerChannel(p, h) { return p.tvChannel || (h && h.channel) || 'kakkonen'; }
  function channelBanner(i, ch) {
    const n = CH_NUM[ch] || 1, name = CH_NAME[ch] || ch;
    H.toast(i, `📺 Kanava ${n}/4: ${name}`);
    // short HUD banner
    H.hud(i, `<span style="background:#111c;padding:6px 12px;border-radius:10px;font-weight:800">📺 ${n} · ${name}</span>`, 'tvch');
    setTimeout(() => { try { H.hud(i, '', 'tvch'); } catch {} }, 2200);
  }
  function sitDown(p, h) {
    const n = [...seated.values()].filter(s => s === h).length;
    h.seatOff = h.seatOff || new Map(); h.seatOff.set(p, [0, -0.75, 0.75, -0.4][n] || 0);
    if (!p.tvChannel) p.tvChannel = 'kakkonen';
    // 2.3: kodin TV näyttää istujan omaa kanavaa (ei jaeta muille pelaajille)
    h.channel = p.tvChannel; h.tvOwner = p.index;
    seated.set(p, h); p.lock = true; p.tvActive = true; // 2.6: sohva = auto TV-ohjaus
    const ch = playerChannel(p, h);
    refreshTvHint(p, h);
    p.tvCam = [h.x - 3.6, 1.75, h.z - 0.6 + (h.seatOff.get(p) || 0) * 0.5, h.x + 0.46, 1.2, h.z - 0.6];
    p.speed = 0; H.toast(p.index, '🛋️ Sohva/TV · ohjain = peli · Backspace = nouse'); H.beep(660, 0.12, 'triangle', 0.04);
    channelBanner(p.index, ch);
    H.emit?.('sofa', p.index, true);
  }
  function applyChannel(h, p, next) {
    const cur = playerChannel(p, h);
    p.tvChannel = next;
    // vain tämän kodin TV + vain jos tämä pelaaja on "tvOwner" tai ainoa sohvalla
    const watchers = [...seated.entries()].filter(([, hh]) => hh === h).map(([pp]) => pp);
    if (watchers.length <= 1 || h.tvOwner === p.index || !watchers.some(w => w.index === h.tvOwner)) {
      h.channel = next; h.tvOwner = p.index; h.tvT = 0; h.tvFrame = -1;
    }
    if (next === 'peli') ensureBreakout(h);
    if (next === 'dash') ensureDash(h);
    if (cur === 'peli' && next !== 'peli') { /* keep brk for return */ }
    if (p.tvActive) refreshTvHint(p, h); else refreshSofaHint(p, h);
    channelBanner(p.index, next);
    H.beep(520, 0.06, 'square', 0.035);
  }
  function switchChannel(h, i, dir = 1) {
    const p = H.players[i]; if (!p) return;
    const cur = playerChannel(p, h);
    const ix = CHANNELS.indexOf(cur);
    const next = CHANNELS[(ix + (dir >= 0 ? 1 : CHANNELS.length - 1)) % CHANNELS.length];
    applyChannel(h, p, next);
  }
  const TV_EXIT_KEY = 'Backspace';
  const TV_EXIT_LABEL = 'Backspace';
  function refreshSofaHint(p, h) { refreshTvHint(p, h); }
  function refreshTvHint(p, h) {
    const ch = playerChannel(p, h);
    const dashHelp = ch === 'dash' ? ' · hyppy: A/✕ tai RT/R2' : (ch === 'peli' ? ' · ohjaa: tatti' : '');
    p.lockHint = `📺 ${CH_NUM[ch]}. ${CH_NAME[ch]}${dashHelp} · C/←→ = kanava · ${TV_EXIT_LABEL} = nouse`;
    H.hud(p.index, `<span style="background:#111c;padding:8px 14px;border-radius:12px;font-weight:800;border:2px solid #f6c445">Sohva/TV: poistu näppäimellä ${TV_EXIT_LABEL}</span>`, 'tvmode');
  }
  function enterTvMode(p, h) {
    p.tvActive = true;
    refreshTvHint(p, h);
    H.toast(p.index, '📺 TV-tila: ohjain vain TV-peliin · poistu: ' + TV_EXIT_LABEL);
    H.beep(880, 0.08, 'square', 0.04);
    H.emit?.('tvmode', p.index, true);
  }
  function exitTvMode(p, h) {
    p.tvActive = false;
    refreshSofaHint(p, h || seated.get(p));
    H.toast(p.index, '📺 TV-tila pois');
    H.beep(420, 0.08, 'triangle', 0.04);
    H.emit?.('tvmode', p.index, false);
  }
  function standUp(p) {
    const h = seated.get(p); seated.delete(p); p.lock = false; p.lockHint = null; p.enterLock = 0.4;
    p.tvCam = null; p.tvActive = false;
    try { H.hud(p.index, '', 'tvmode'); } catch (_) {}
    if (h) { p.pos.set(h.x + h.sofa.x + 0.55, 0, h.z + h.sofa.z + 2.15); h.seatOff?.delete(p); }
    H.emit?.('sofa', p.index, false);
    H.emit?.('tvmode', p.index, false);
  }
  // tikku-ukko: x,y = lantio, s = koko, ph = vaihe (tanssi)
  function stick(c, x, y, s, ph, col, mode) {
    const sw = Math.sin(ph), cw = Math.cos(ph);
    c.strokeStyle = col; c.lineWidth = Math.max(2, s * 0.09); c.lineCap = 'round';
    const hy = y - s * 0.55;
    c.beginPath(); c.arc(x, hy - s * 0.17, s * 0.15, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, hy);
    const arm = mode === 'wave' ? [[-0.35, -0.1 + sw * 0.1], [0.3, -0.45 + sw * 0.25]] : mode === 'up' ? [[-0.3, -0.45 - sw * 0.1], [0.3, -0.45 + sw * 0.1]] : [[-0.35, 0.15 * sw], [0.35, -0.15 * sw]];
    for (const [ax, ay] of arm) { c.moveTo(x, hy + s * 0.12); c.lineTo(x + ax * s, hy + s * 0.12 + ay * s); }
    c.moveTo(x, y); c.lineTo(x - s * (0.2 + 0.12 * sw), y + s * 0.45); c.moveTo(x, y); c.lineTo(x + s * (0.2 - 0.12 * sw), y + s * 0.45);
    c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(x - s * 0.05, hy - s * 0.19, s * 0.02 + 1, 0, 7); c.arc(x + s * 0.05, hy - s * 0.19, s * 0.02 + 1, 0, 7); c.fill();
    c.beginPath(); c.arc(x, hy - s * 0.15, s * 0.07, 0.2, Math.PI - 0.2); c.stroke();
  }

  // ---------- 2.2: kolmas kanava = Pomppupallo (breakout) ----------

  // ---------- 2.3: Kuutiojuoksu (Geometry Dash -tyylinen) ----------
  function dashDifficulty() {
    let v = 3;
    try { v = Number(localStorage.getItem('hyyte-dash-diff')); } catch (_) {}
    if (!Number.isFinite(v)) v = 3;
    return Math.max(1, Math.min(10, Math.round(v)));
  }
  function ensureDash(h) {
    if (h.dash) return h.dash;
    const diff = dashDifficulty();
    const base = 55 + diff * 8; // 63..135
    h.dash = {
      x: 48, y: 120, vy: 0, ground: 120, alive: true, t: 0,
      score: 0, jumpPts: 0, spikes: [], speed: base, baseSpeed: base,
      cool: 0, lastScore: 0, showLast: 0, diff,
    };
    spawnDashSpikes(h.dash);
    return h.dash;
  }
  function spawnDashSpikes(d) {
    d.spikes = [];
    const diff = d.diff || dashDifficulty();
    // pidemmät välit; vaikeus pienentää väliä
    const gapMin = Math.max(95, 160 - diff * 6);
    const gapSpan = Math.max(50, 120 - diff * 5);
    let x = 260;
    let lastSpikeX = -9999;
    for (let k = 0; k < 10; k++) {
      x += gapMin + Math.random() * gapSpan;
      let kind = (k % 3 === 2) ? 'block' : 'spike';
      // ei peräkkäisiä piikkejä liian lähelle
      if (kind === 'spike' && (x - lastSpikeX) < 140) {
        kind = 'block';
      }
      if (kind === 'spike') {
        d.spikes.push({ x, w: 14, h: 16 + (Math.random() * 8) | 0, kind: 'spike', cleared: false });
        lastSpikeX = x;
      } else {
        d.spikes.push({ x, w: 26, h: 20 + (Math.random() * 6) | 0, kind: 'block', cleared: false });
      }
    }
  }
  /** Kolmio-hitbox: tippi groundY-h, kanta [x,x+w] @ groundY. Forgiving ~2px. */
  function dashTriHitsPlayer(sp, plL, plR, plT, plB, groundY) {
    const inset = 2;
    const x0 = sp.x + inset, w = Math.max(4, sp.w - inset * 2), h = Math.max(4, sp.h - inset);
    const x1 = x0 + w, mid = x0 + w / 2;
    const ovL = Math.max(plL, x0), ovR = Math.min(plR, x1);
    if (ovL >= ovR) return false;
    if (plB <= groundY - h || plT >= groundY) return false;
    // korkeus x:ssä: lin. tippiin
    const cx = Math.max(ovL, Math.min(ovR, mid));
    let hAt;
    if (cx <= mid) hAt = h * ((cx - x0) / Math.max(0.001, mid - x0));
    else hAt = h * ((x1 - cx) / Math.max(0.001, x1 - mid));
    const tipY = groundY - hAt;
    return plB > tipY + 0.5;
  }
  /** Kuutio-AABB: osuma sivusta/alta = kuolema; päälle laskeutuminen OK. */
  function dashBlockResolve(d, sp, plL, plR, plT, plB, groundY, prevB) {
    const bL = sp.x, bR = sp.x + sp.w, bT = groundY - sp.h, bB = groundY;
    if (plR <= bL || plL >= bR) return false;
    // laskeudu päälle (putoamassa / paikallaan, jalat lähellä kattoa)
    if (d.vy >= -20 && plB >= bT - 1 && plB <= bT + 10 && prevB <= bT + 2) {
      d.y = bT - 12; // pelaajan fillRect bottom = d.y+12
      d.vy = 0;
      d._onBlock = true;
      return false; // ei kuolemaa
    }
    // sivutörmäys tai isku alta
    if (plB > bT + 2 && plT < bB - 1) return true;
    return false;
  }
  function dashWantsJump(i) {
    // 2.6: Kuutiojuoksu — A/✕ (jump) TAI ampuminen RT/R2 (fire, analog ≥0.35)
    const inp = H.input(i) || {};
    if (inp.jump || inp.fire) return true;
    const pad = window.HYYTE_PAD?.state?.(i);
    if (pad && (pad.jump || pad.fire)) return true;
    return false;
  }
  function updDash(h, i, dt) {
    const pl = H.players[i];
    if (!pl || !seated.has(pl)) return; // 2.6: ohjaus kun istuu sohvalla (ei erillistä TV-tilaa)
    const d = ensureDash(h);
    if (!d.alive) {
      d.cool = (d.cool || 0) - dt;
      d.showLast = Math.max(0, (d.showLast || 0) - dt);
      if (d.cool <= 0) {
        d.alive = true; d.y = d.ground; d.vy = 0; d.t = 0;
        d.score = 0; d.jumpPts = 0; d.diff = dashDifficulty();
        d.baseSpeed = 55 + d.diff * 8; d.speed = d.baseSpeed;
        d.showLast = 0; spawnDashSpikes(d);
      }
      return;
    }
    d.t += dt;
    // pisteet = onnistuneet hypyt (esteet ohitettu); etäisyys vain näytölle
    d.speed = Math.min(d.baseSpeed + 40, d.baseSpeed + d.t * 1.6);
    const jump = dashWantsJump(i);
    const onG = d.y >= d.ground - 0.5 || d._onBlock;
    if (jump && onG) { d.vy = -200; H.beep(720, 0.05, 'square', 0.03); }
    d.vy += 480 * dt; d.y += d.vy * dt;
    const prevY = d.y;
    if (d.y > d.ground) { d.y = d.ground; d.vy = 0; }
    d._onBlock = false;
    const groundY = d.ground + 12;
    const plL = d.x - 7, plR = d.x + 7, plT = d.y - 2, plB = d.y + 12;
    const prevB = prevY + 12;
    const diff = d.diff || 3;
    const gapMin = Math.max(95, 160 - diff * 6);
    const gapSpan = Math.max(50, 120 - diff * 5);
    for (const sp of d.spikes) {
      sp.x -= d.speed * dt;
      // piste kun este ohitettu (pelaaja meni ohi)
      if (!sp.cleared && sp.x + sp.w < d.x - 8) {
        sp.cleared = true;
        d.jumpPts = (d.jumpPts || 0) + 1;
        d.score = d.jumpPts;
        H.beep(980, 0.04, 'triangle', 0.025);
      }
      if (sp.x < -30) {
        // kierrätä kauas, älä lähelle toista piikkiä
        let nx = 0;
        for (let tries = 0; tries < 8; tries++) {
          nx = 280 + Math.random() * (gapMin + gapSpan) * d.spikes.length * 0.35;
          const conflict = d.spikes.some(o => o !== sp && o.kind === 'spike' && sp.kind === 'spike' && Math.abs(o.x - nx) < 140);
          if (!conflict) break;
        }
        // varmista ettei kaksi piikkiä lähekkäin
        if (sp.kind === 'spike') {
          const nearSpike = d.spikes.some(o => o !== sp && o.kind === 'spike' && Math.abs(o.x - nx) < 140);
          if (nearSpike) { sp.kind = 'block'; sp.w = 26; sp.h = 22; }
        }
        sp.x = nx; sp.cleared = false;
      }
      let hit = false;
      if (sp.kind === 'block') hit = dashBlockResolve(d, sp, plL, plR, plT, plB, groundY, prevB);
      else hit = dashTriHitsPlayer(sp, plL, plR, plT, plB, groundY);
      if (hit) {
        d.lastScore = d.score;
        d.showLast = 2.8;
        d.alive = false; d.cool = 2.8;
        H.beep(160, 0.15, 'sawtooth', 0.05);
        H.toast(i, '💥 Kuutiojuoksu – tulos ' + d.lastScore + ' · uudestaan…');
        break;
      }
    }
  }
  function drawDash(h, t) {
    const c = h.tvCv.getContext('2d'), W = h.tvCv.width, Hh = h.tvCv.height;
    const d = ensureDash(h);
    // sky
    const g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, '#1b1f3a'); g.addColorStop(1, '#4c1d95');
    c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    // ground
    c.fillStyle = '#2b2d42'; c.fillRect(0, d.ground + 12, W, Hh);
    c.fillStyle = '#ff4d6d'; c.fillRect(0, d.ground + 12, W, 3);
    // spikes (kolmio) + blocks (kuutio) — hitbox vastaa visuaalia
    for (const sp of d.spikes) {
      const gy = d.ground + 12;
      if (sp.kind === 'block') {
        c.fillStyle = '#adb5bd';
        c.fillRect(sp.x, gy - sp.h, sp.w, sp.h);
        c.fillStyle = '#868e96';
        c.fillRect(sp.x, gy - sp.h, sp.w, 3);
      } else {
        c.fillStyle = '#e9ecef';
        c.beginPath(); c.moveTo(sp.x, gy); c.lineTo(sp.x + sp.w / 2, gy - sp.h); c.lineTo(sp.x + sp.w, gy); c.closePath(); c.fill();
      }
    }
    // player cube
    c.fillStyle = d.alive ? '#4cc9f0' : '#adb5bd';
    c.fillRect(d.x - 7, d.y - 2, 14, 14);
    c.fillStyle = '#fff'; c.font = '800 11px system-ui'; c.textAlign = 'left';
    c.fillText('🟦 KUUTIOJUOKSU  ' + d.score + ' pt · VA '+ (d.diff||3), 8, 12);
    if (!d.alive && (d.showLast || 0) > 0) {
      c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(W/2 - 90, Hh/2 - 28, 180, 56);
      c.fillStyle = '#ffd43b'; c.font = '900 16px system-ui'; c.textAlign = 'center';
      c.fillText('TULOS: ' + (d.lastScore|0), W/2, Hh/2 - 4);
      c.fillStyle = '#fff'; c.font = '700 11px system-ui';
      c.fillText('Uusi yritys…', W/2, Hh/2 + 16);
    }
    c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '700 9px system-ui'; c.textAlign = 'center';
    c.fillText((d.alive ? 'A/✕ tai RT/R2 = hyppy' : 'Uudelleen…') + ' · ' + TV_EXIT_LABEL + ' = nouse', W / 2, Hh - 6);
    // channel badge
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(W - 52, 4, 46, 16);
    c.fillStyle = '#ffd43b'; c.font = '800 10px system-ui'; c.textAlign = 'center'; c.fillText('CH 4', W - 29, 15);
    h.tvTex.needsUpdate = true;
  }

  function ensureBreakout(h) {
    if (h.brk) return h.brk;
    h.brk = {
      px: 160, pw: 56, balls: [{ x: 160, y: 120, vx: 90, vy: -110 }],
      bricks: [], score: 0, lives: 3, cool: 0,
    };
    resetBricks(h.brk);
    return h.brk;
  }
  function resetBricks(b) {
    b.bricks = [];
    const cols = ['#ff6b6b','#fcc419','#51cf66','#339af0','#cc5de8'];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      b.bricks.push({ x: 18 + c * 36, y: 28 + r * 14, w: 32, h: 10, alive: true, col: cols[r % cols.length] });
    }
  }
  function updBreakout(h, i, dt) {
    const pl = H.players[i];
    if (!pl || !seated.has(pl)) return; // 2.6: sohvalla pad → peli
    const b = ensureBreakout(h);
    const inp = H.input(i) || {};
    const turn = (inp && inp.turn) || 0;
    b.px = Math.max(b.pw / 2, Math.min(320 - b.pw / 2, b.px + turn * -180 * dt));
    for (const ball of b.balls) {
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < 6) { ball.x = 6; ball.vx *= -1; }
      if (ball.x > 314) { ball.x = 314; ball.vx *= -1; }
      if (ball.y < 6) { ball.y = 6; ball.vy *= -1; }
      if (ball.vy > 0 && ball.y > 148 && ball.y < 160 && Math.abs(ball.x - b.px) < b.pw / 2 + 4) {
        ball.y = 148; ball.vy *= -1;
        ball.vx = (ball.x - b.px) * 4.5;
        H.beep(660, 0.04, 'square', 0.03);
      }
      for (const br of b.bricks) if (br.alive && ball.x > br.x && ball.x < br.x + br.w && ball.y > br.y && ball.y < br.y + br.h) {
        br.alive = false; ball.vy *= -1; b.score += 1; H.beep(880, 0.05, 'triangle', 0.03);
      }
      if (ball.y > 170) {
        ball.x = b.px; ball.y = 120; ball.vx = 80 * (Math.random() < 0.5 ? -1 : 1); ball.vy = -110;
        b.lives -= 1; H.beep(200, 0.12, 'sawtooth', 0.04);
        if (b.lives <= 0) { b.lives = 3; b.score = 0; resetBricks(b); H.toast(i, 'Pomppupallo alkaa alusta!'); }
      }
    }
    if (b.bricks.every(br => !br.alive)) { resetBricks(b); b.score += 5; H.toast(i, 'Tasoa ylös! +5'); H.beep(1040, 0.1, 'triangle', 0.05); }
  }
  function drawBreakout(h, t) {
    const c = h.tvCv.getContext('2d'), W = h.tvCv.width, Hh = h.tvCv.height;
    const b = ensureBreakout(h);
    c.fillStyle = '#0b1a25'; c.fillRect(0, 0, W, Hh);
    c.fillStyle = '#fff'; c.font = '800 11px system-ui'; c.textAlign = 'left';
    c.fillText('🎮 POMPPUPALLO  pisteet ' + b.score + '  ·♥ ' + b.lives, 8, 12);
    for (const br of b.bricks) if (br.alive) { c.fillStyle = br.col; c.fillRect(br.x, br.y, br.w, br.h); }
    c.fillStyle = '#ffd43b'; c.fillRect(b.px - b.pw / 2, 152, b.pw, 8);
    for (const ball of b.balls) { c.fillStyle = '#fff'; c.beginPath(); c.arc(ball.x, ball.y, 5, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '700 9px system-ui'; c.textAlign = 'center';
    c.fillText('tatti = lankku · ' + TV_EXIT_LABEL + ' = nouse', W / 2, Hh - 6);
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(W - 52, 4, 46, 16);
    c.fillStyle = '#ffd43b'; c.font = '800 10px system-ui'; c.textAlign = 'center'; c.fillText('CH 3', W - 29, 15);
    h.tvTex.needsUpdate = true;
  }

  function drawTv(h, t) {
    const c = h.tvCv.getContext('2d'), W = h.tvCv.width, Hh = h.tvCv.height;
    if (!h.tvShow) {
      const g = c.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, '#1c3d7a'); g.addColorStop(1, '#3b5bdb');
      c.fillStyle = g; c.fillRect(0, 0, W, Hh);
      c.fillStyle = '#ffd43b'; c.font = '900 34px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('Tervetuloa', W / 2, Hh * 0.36); c.fillText('kotiin!', W / 2, Hh * 0.62);
      c.fillStyle = '#e7f5ff'; c.font = '700 14px system-ui,sans-serif'; c.fillText('🏠 ' + (H.stats?.names?.()[h.i] || 'P' + (h.i + 1)) + ' · sohvalta: ohjelma alkaa', W / 2, Hh * 0.86);
      h.tvTex.needsUpdate = true; return;
    }
    if (channelOf(h) === 'peli') { drawBreakout(h, t); return; }
    if (channelOf(h) === 'dash') { drawDash(h, t); return; }
    if (channelOf(h) === 'uutiset') {
      const g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, '#e7f5ff'); g.addColorStop(1, '#d0ebff');
      c.fillStyle = g; c.fillRect(0, 0, W, Hh);
      c.fillStyle = '#1864ab'; c.fillRect(0, 0, W, 28);
      c.fillStyle = '#fff'; c.font = '900 15px system-ui'; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('📰 PIKKUVÄEN UUTISET', 10, 14);
      c.fillStyle = '#ff6b6b'; c.font = '800 11px system-ui'; c.textAlign = 'right'; c.fillText('LIVE', W - 10, 14);
      const news = ['Kuussa avattiin uusi hyytelökupoli!','Torilta löytyi 30 eksoottista maustetta.','Lentoauto sai uudet hehkuvat thrusterit.','Palikkamaassa voi nyt hakata korkealle.','Pikkusankarit hyppäävät 3× korkeammalle kuussa!','Uudet tulevaisuuden aseet ovat leikkimielisiä.'];
      const ni = Math.floor(t / 4) % news.length;
      c.fillStyle = '#212529'; c.font = '800 15px system-ui'; c.textAlign = 'center';
      c.fillText(news[ni], W / 2, Hh * 0.42);
      stick(c, W * 0.22, Hh - 50, 38, t * 3, '#1864ab', 'wave');
      stick(c, W * 0.78, Hh - 50, 38, t * 3 + 1, '#c92a2a', 'wave');
      c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, Hh - 18, W, 18);
      c.fillStyle = '#fff'; c.font = '700 10px system-ui'; c.fillText('C / kosketuslevy = vaihda kanavaa', W / 2, Hh - 9);
      h.tvTex.needsUpdate = true; return;
    }
    const scene = Math.floor(t / 6) % 4, st = t % 6;
    const skies = ['#74c0fc', '#ffe066', '#b2f2bb', '#fcc2d7'];
    c.fillStyle = skies[scene]; c.fillRect(0, 0, W, Hh);
    // aurinko ja maa
    c.fillStyle = '#ffd43b'; c.beginPath(); c.arc(W - 36, 30, 18, 0, 7); c.fill();
    c.strokeStyle = '#ffd43b'; c.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * 0.785 + t; c.beginPath(); c.moveTo(W - 36 + Math.cos(a) * 23, 30 + Math.sin(a) * 23); c.lineTo(W - 36 + Math.cos(a) * 31, 30 + Math.sin(a) * 31); c.stroke(); }
    c.fillStyle = '#69db7c'; c.fillRect(0, Hh - 26, W, 26);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (scene === 0) {
      // tunnari: sateenkaari + nimi
      ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'].forEach((cc, k) => { c.strokeStyle = cc; c.lineWidth = 7; c.beginPath(); c.arc(W / 2, Hh - 20, 110 - k * 8, Math.PI, Math.PI + Math.PI * Math.min(1, st / 1.5)); c.stroke(); });
      c.fillStyle = '#212529'; c.font = '900 26px system-ui,sans-serif'; c.fillText('HYYTELÖ-KAKKONEN', W / 2, 38 + Math.sin(t * 6) * 3);
      stick(c, W / 2, Hh - 62, 52, t * 8, '#212529', 'wave');
    } else if (scene === 1) {
      // tanssi
      c.fillStyle = '#212529'; c.font = '900 18px system-ui,sans-serif'; c.fillText('♪ Hyppää, pomppaa, hyytelö! ♪', W / 2, 22);
      stick(c, W * 0.32, Hh - 60 - Math.abs(Math.sin(t * 5)) * 14, 50, t * 9, '#c92a2a', 'up');
      stick(c, W * 0.68, Hh - 60 - Math.abs(Math.cos(t * 5)) * 14, 50, t * 9 + 1.5, '#1864ab', 'up');
      c.fillStyle = '#5f3dc4'; c.font = '900 22px system-ui'; for (let k = 0; k < 3; k++) c.fillText('♪', ((t * 40 + k * 110) % (W + 20)) - 10, 50 + Math.sin(t * 3 + k) * 12);
    } else if (scene === 2) {
      // pallo
      const bx = W / 2 + Math.sin(t * 2.2) * (W * 0.3), by = Hh - 40 - Math.abs(Math.sin(t * 4.4)) * 70;
      stick(c, W * 0.15, Hh - 58, 46, t * 4, '#2b8a3e', 'wave'); stick(c, W * 0.85, Hh - 58, 46, t * 4 + 2, '#e67700', 'wave');
      c.fillStyle = '#f03e3e'; c.beginPath(); c.arc(bx, by, 11, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(bx - 3, by - 3, 3, 0, 7); c.fill();
      c.fillStyle = '#212529'; c.font = '900 17px system-ui,sans-serif'; c.fillText('Palloleikki – kuka saa kiinni?', W / 2, 22);
    } else {
      // laulu + taputus, sanat vaihtuvat
      const L = ['Hyvää huomenta, aurinko!', 'Taputa käsiä – yks, kaks!', 'Hyytelö hyppää korkealle!', 'Nähdään taas – heippa hei!'];
      c.fillStyle = '#212529'; c.font = '900 17px system-ui,sans-serif'; c.fillText(L[Math.floor(st / 1.5) % 4], W / 2, 22);
      for (let k = 0; k < 4; k++) stick(c, W * (0.17 + k * 0.22), Hh - 56 - (Math.floor(t * 4 + k) % 2) * 6, 40, t * 7 + k, ['#c92a2a', '#1864ab', '#2b8a3e', '#e67700'][k], k % 2 ? 'up' : 'wave');
    }
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(6, Hh - 20, 54, 15); c.fillStyle = '#fff'; c.font = '800 11px system-ui'; c.fillText('LIVE ●', 33, Hh - 12);
    h.tvTex.needsUpdate = true;
  }

  function chestAction(h, i) {
    const bag = H.hunger.bag(i);
    if (bag.length) {
      const room = CHEST_MAX - h.chest.length;
      if (room <= 0) { H.toast(i, 'Arkku on täynnä!', true); return; }
      const put = bag.slice(0, room); H.hunger.setBag(i, bag.slice(room));
      h.chest.push(...put); saveChest(h); renderShelf(h);
      H.toast(i, `Veit arkkuun ${put.length} tavaraa 📦`); H.beep(700, 0.1, 'triangle', 0.05);
    } else {
      const k = h.chest.map((x, n) => [x, n]).reverse().find(([x]) => H.hunger.FOODS.some(f => f.id === x));
      if (!k) { H.toast(i, 'Arkussa ei ole ruokaa', true); return; }
      h.chest.splice(k[1], 1); H.hunger.addToBag(i, k[0]); saveChest(h); renderShelf(h);
      H.toast(i, `Otit arkusta: ${H.hunger.ITEMS[k[0]].emoji} ${H.hunger.ITEMS[k[0]].name}`);
    }
  }

  H.homes = {
    HOMES, HOME_COLORS, GARAGE_COLORS, colors,
    list: () => homes.map(h => ({ i: h.i, x: h.x, z: h.z, open: h.open, doorT: h.doorT, chest: h.chest.slice(), btn: { x: h.x + h.btn.x, z: h.z + h.btn.z },
      chestPos: { x: h.x + h.chestPos.x, z: h.z + h.chestPos.z }, door: { x: h.x - 3, z: h.z + 6.5 }, mail: { x: h.x + h.mail.x, z: h.z + h.mail.z },
      gx0: h.gx0, gx1: h.gx1, gz0: h.gz0, gz1: h.gz1,
      garage: { x: h.x + (h.gx0 + h.gx1) / 2, z: h.z + 0.5, doorZ: h.z + h.gz1 }, col: h.col, roofHidden: h.ups.map(u => !u.visible) })),
    setDoor: (k, open) => homes[k] && setDoor(homes[k], open, true),
    sit: (pi, k) => { const p = H.players[pi], h = homes[k ?? pi]; if (p && h) sitDown(p, h); },
    stand: pi => { const p = H.players[pi]; p && seated.has(p) && standUp(p); },
    seated: pi => !!seated.get(H.players[pi]),
    tvActive: pi => !!H.players[pi]?.tvActive,
    enterTv: pi => { const p = H.players[pi], h = seated.get(p); if (p && h) enterTvMode(p, h); },
    exitTv: pi => { const p = H.players[pi], h = seated.get(p); if (p && h && p.tvActive) exitTvMode(p, h); },
    tvExitKey: TV_EXIT_KEY,
    channel: (k) => homes[k] && channelOf(homes[k]),
    playerChannel: (pi) => { const p = H.players[pi]; return p && playerChannel(p, seated.get(p)); },
    switchChannel: (k, i, dir) => homes[k] && switchChannel(homes[k], i, dir),
    CHANNELS, CH_NAME,
    ensureDash, updDash, drawDash,
    setPlayerChannel: (pi, ch) => { const p = H.players[pi]; if (p) { p.tvChannel = ch; const h = seated.get(p); if (h) applyChannel(h, p, ch); } },
    inHouse: (pi, k) => { const p = H.players[pi], h = homes[k ?? pi] || homes[0]; return !!(p && h && inHouse(h, H.posOf(p))); },
    inGarage: (pi, k) => { const p = H.players[pi], h = homes[k ?? pi] || homes[0]; return !!(p && h && inGarage(h, H.posOf(p))); },
    sofa: (k) => { const h = homes[k]; return h ? { x: h.x + h.sofa.x, z: h.z + h.sofa.z } : null; },
    kitchen: (k) => {
      const h = homes[k]; if (!h) return null;
      return {
        table: { x: h.x + 3.6, z: h.z + 2.8 },
        chairs: [{ x: h.x + 3.6, z: h.z + 1.9 }, { x: h.x + 3.6, z: h.z + 3.7 }],
      };
    },
    piggy: (k) => { const h = homes[k]; return h ? { x: h.x - 5.2, z: h.z + 2.2 } : null; },
    tv: k => homes[k] && { show: homes[k].tvShow, t: homes[k].tvT, canvas: homes[k].tvCv, channel: channelOf(homes[k]) },
    addToChest: (k, id) => { const h = homes[k]; if (h && h.chest.length < CHEST_MAX) { h.chest.push(id); saveChest(h); renderShelf(h); } },
  };
  H.define?.('homes', H.homes);
})();
