// tunnel.js – 3.4: merkitty naapuritunneli, kaivu lapiolla molemmista päistä.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const M = (c, o = {}) => new (T().MeshStandardMaterial)({
    color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0,
    emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 0,
  });
  const DIG_RATE = 0.16;
  const WIDTH = 3.2;

  let active = false, root = null, routes = [], shovels = [], hasShovel = [], markers = [];
  let hold = Array(12).fill(false);

  function IN() { return H.hatch?.IN || { x: 850, z: -180 }; }
  function w(x, z) { const p = IN(); return { x: p.x + x, z: p.z + z }; }

  function neighborPairs() {
    const list = (H.homes?.list?.() || []).map(h => ({ i: h.i, x: h.x, z: h.z }));
    const edges = [];
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        edges.push({ a: list[a].i, b: list[b].i, d: Math.hypot(list[a].x - list[b].x, list[a].z - list[b].z) });
      }
    }
    edges.sort((p, q) => p.d - q.d);
    const deg = {}, pairs = [];
    for (const e of edges) {
      if ((deg[e.a] || 0) && (deg[e.b] || 0)) continue;
      if ((deg[e.a] || 0) === 0 || (deg[e.b] || 0) === 0) {
        pairs.push([e.a, e.b]);
        deg[e.a] = (deg[e.a] || 0) + 1;
        deg[e.b] = (deg[e.b] || 0) + 1;
      }
    }
    if (!pairs.length && list.length >= 2) pairs.push([list[0].i, list[1].i]);
    return pairs.slice(0, 6);
  }

  const box = (ww, h, d, m, x, y, z, p) => {
    const o = new (T().Mesh)(new (T().BoxGeometry)(ww, h, d), m);
    o.position.set(x, y, z); p && p.add(o); return o;
  };
  const cyl = (rt, rb, h, m, x, y, z, p) => {
    const o = new (T().Mesh)(new (T().CylinderGeometry)(rt, rb, h, 6), m);
    o.position.set(x, y, z); p && p.add(o); return o;
  };

  function addMarker(x, z, y, col, parent) {
    const m = box(0.22, 0.12, 0.22, M(col, { e: col, ei: 0.7 }), x, y, z, parent);
    markers.push(m);
    return m;
  }

  function makeSign(text, x, y, z, parent, bg) {
    const lab = H.makeLabel(text, { scale: 2.2, size: 44, bg: bg || '#3e3428' });
    lab.position.set(x, y, z);
    parent.add(lab);
    return lab;
  }

  function makeShovel(x, z) {
    const g = new (T().Group)();
    cyl(0.03, 0.03, 0.9, M(0x6b4423), 0, 0.5, 0, g);
    box(0.28, 0.06, 0.22, M(0x868e96, { m: 0.4 }), 0, 0.08, 0, g);
    const lab = H.makeLabel('⛏️ Lapio', { scale: 1.4, size: 36, bg: '#495057' });
    lab.position.set(0, 1.05, 0); g.add(lab);
    const wp = w(x, z);
    H.addObject(g, wp.x, 0, wp.z);
    shovels.push({ mesh: g, x: wp.x, z: wp.z, alive: true });
  }

  function buildRoute(pair, k, parent) {
    // merkitty reitti: käytävästä etelään ja länteen, sitten kaivuu-uoma
    const zA = -7 - k * 6.2, zB = zA - 5.4;
    const xC = -10;
    const dirtZ = (zA + zB) / 2;
    const dirtLen = Math.abs(zA - zB) - 1.6;

    // sivuseinät (auki kun valmis)
    const wallTag = 'tunnel' + k;
    const a = w(xC - WIDTH / 2, zB - 0.4), b = w(xC - WIDTH / 2, zA + 0.4);
    const c = w(xC + WIDTH / 2, zB - 0.4), d = w(xC + WIDTH / 2, zA + 0.4);
    H.addWallSeg(a.x, a.z, b.x, b.z, 3.4, 0.3, wallTag);
    H.addWallSeg(c.x, c.z, d.x, d.z, 3.4, 0.3, wallTag);
    // maan seinä keskellä, katoaa valmistuessa
    const midL = w(xC - WIDTH / 2 + 0.15, dirtZ - dirtLen / 2);
    const midR = w(xC + WIDTH / 2 - 0.15, dirtZ + dirtLen / 2);
    // sulje uoma aluksi poikittaisella seinällä
    const midWall = H.addWallSeg(w(xC - WIDTH / 2, dirtZ).x, w(xC, dirtZ).z, w(xC + WIDTH / 2, dirtZ).x, w(xC, dirtZ).z, 3.2, 0.8, wallTag + 'dirt');

    box(0.28, 3.0, Math.abs(zA - zB) + 1.2, M(0x6f5d4c), xC - WIDTH / 2, 1.5, dirtZ, parent);
    box(0.28, 3.0, Math.abs(zA - zB) + 1.2, M(0x6f5d4c), xC + WIDTH / 2, 1.5, dirtZ, parent);
    const dirt = box(WIDTH - 0.3, 2.6, Math.max(1.2, dirtLen), M(0x9c6b3c, { e: 0x6b4423, ei: 0.08 }), xC, 1.3, dirtZ, parent);

    // köysi ja hehkuvat merkit reitin varrella
    const path = [];
    // käytävästä (0,2) → (0,-6) → (xC, -6) → fronts
    for (let z = 2; z >= -6; z -= 2) path.push([0, z]);
    for (let x = -2; x >= xC; x -= 2) path.push([x, -6]);
    path.push([xC, zA], [xC, zB]);
    path.forEach(([x, z], i) => {
      addMarker(x, z, 0.12, i % 2 ? 0x66d9e8 : 0xffd43b, parent);
      if (i && i % 2 === 0) {
        const rope = cyl(0.025, 0.025, 2.05, M(0xd9480f, { e: 0xc92a2a, ei: 0.25 }), x, 0.9, z, parent);
        rope.rotation.z = Math.PI / 2;
      }
    });

    const homeName = (i) => {
      try { return (H.players[i] && (H.players[i].name || H.players[i].hero)) || ('Koti ' + (i + 1)); }
      catch (e) { return 'Koti ' + (i + 1); }
    };
    const title = '⛏️ ' + homeName(pair[0]) + ' ↔ ' + homeName(pair[1]);
    makeSign('➡️ ' + title, 0, 2.3, -5.5, parent, '#1864ab');
    makeSign('⛏️ Kaiva lapiolla tähän', xC, 2.35, zA + 0.2, parent, '#e67700');
    makeSign('⬅️ Toinen pää kaivaa tästä', xC, 2.35, zB - 0.2, parent, '#e67700');

    const progA = makeSign('Kaivettu 0%', xC, 1.6, zA, parent, '#2b8a3e');
    const progB = makeSign('Kaivettu 0%', xC, 1.6, zB, parent, '#2b8a3e');
    const barA = box(1.6, 0.12, 0.16, M(0x2f9e44, { e: 0x2f9e44, ei: 0.5 }), xC, 0.55, zA, parent);
    const barB = box(1.6, 0.12, 0.16, M(0x2f9e44, { e: 0x2f9e44, ei: 0.5 }), xC, 0.55, zB, parent);
    barA.scale.x = 0.05; barB.scale.x = 0.05;

    // lapion paikat
    makeShovel(0.9, 16.2);
    makeShovel(xC + 1.1, zA);
    makeShovel(xC - 1.1, zB);

    const fa = w(xC, zA), fb = w(xC, zB);
    const route = {
      a: pair[0], b: pair[1], k,
      progress: 0, done: false,
      faceA: { x: fa.x, z: fa.z, homeI: pair[0] },
      faceB: { x: fb.x, z: fb.z, homeI: pair[1] },
      dirt, midWall, wallTag, progA, progB, barA, barB, title,
      ladderA: null, ladderB: null,
    };
    routes.push(route);
    return route;
  }

  function setProgressLabel(route) {
    const pct = Math.round((route.progress || 0) * 100) + '%';
    const txt = route.done ? '✅ Tunneli valmis!' : ('Kaivettu ' + pct);
    try {
      if (route.progA && H.makeLabel) {
        // labels are baked sprites; replace text via userData or new label is hard.
        route.progA.userData = route.progA.userData || {};
        if (route.progA.userData._txt !== txt && route.progA.parent) {
          const par = route.progA.parent;
          const pos = route.progA.position.clone();
          par.remove(route.progA);
          route.progA = H.makeLabel(txt, { scale: 2.2, size: 44, bg: route.done ? '#2b8a3e' : '#2b8a3e' });
          route.progA.position.copy(pos);
          par.add(route.progA);
          route.progA.userData._txt = txt;
        }
      }
    } catch (e) {}
    const s = Math.max(0.05, route.progress || 0);
    if (route.barA) route.barA.scale.x = s;
    if (route.barB) route.barB.scale.x = s;
    if (route.dirt && !route.done) {
      const left = Math.max(0.15, 1 - (route.progress || 0));
      route.dirt.scale.z = left;
      route.dirt.scale.y = 0.4 + 0.6 * left;
    }
  }

  function finish(route) {
    if (route.done) return;
    route.done = true;
    route.progress = 1;
    if (route.dirt) route.dirt.visible = false;
    if (route.midWall) { try { H.removeWall(route.midWall); } catch (e) {} route.midWall = null; }
    setProgressLabel(route);
    // tikkaat molempiin autotalleihin
    function ladderAt(face, homeI, parent) {
      const g = new (T().Group)();
      cyl(0.04, 0.04, 3.6, M(0x8f5420), -0.22, 1.8, 0, g);
      cyl(0.04, 0.04, 3.6, M(0x8f5420), 0.22, 1.8, 0, g);
      for (let k = 0; k < 7; k++) box(0.52, 0.05, 0.07, M(0x5c4033), 0, 0.4 + k * 0.45, 0, g);
      const loc = { x: face.x - IN().x, z: face.z - IN().z };
      g.position.set(loc.x, 0, loc.z);
      parent.add(g);
      const lab = H.makeLabel('🪜 Naapurin autotalli (koti ' + (homeI + 1) + ')', { scale: 1.8, size: 40, bg: '#3e3428' });
      lab.position.set(loc.x, 3.1, loc.z);
      parent.add(lab);
      return { x: face.x, z: face.z, homeI };
    }
    route.ladderA = ladderAt(route.faceA, route.a, root);
    route.ladderB = ladderAt(route.faceB, route.b, root);
    H.beep(784, 0.15, 'triangle', 0.06);
    (H.players || []).forEach(p => { if (p && H.hatch?.inside?.(p.index)) H.toast(p.index, 'Tunnelin reitti avautui! 🪜'); });
  }

  function dig(route, side, dt, i) {
    if (route.done) return route.progress;
    route.progress = Math.min(1, (route.progress || 0) + DIG_RATE * dt);
    setProgressLabel(route);
    if ((H.time || 0) * 8 % 1 < dt * 8) H.beep(180 + route.progress * 200, 0.04, 'square', 0.03);
    if (route.progress >= 1) finish(route);
    return route.progress;
  }

  function build() {
    routes = []; shovels = []; markers = [];
    H.clearWalls?.('tunnel0'); H.clearWalls?.('tunnel1'); H.clearWalls?.('tunnel0dirt');
    const pairs = neighborPairs();
    if (!pairs.length) return;
    const g = new (T().Group)();
    const floor = box(8, 0.08, 28, M(0x6f5d4c), -10, 0.04, -12, g);
    floor.receiveShadow = false;
    // opaste alkuun
    makeSign('🗺️ Naapuritunneli – seuraa valomerkkejä ja köyttä', 0, 2.6, 8, g, '#1864ab');
    addMarker(0, 8, 0.12, 0xffd43b, g);
    pairs.forEach((pair, k) => buildRoute(pair, k, g));
    const p0 = IN();
    H.addObject(g, p0.x, 0, p0.z);
    root = g;
    try { H.mergeStatic?.(g, new Set(markers.concat(shovels.map(s => s.mesh)))); } catch (e) {}
  }

  H.onStart(() => {
    active = !H.challenge; hasShovel = Array(12).fill(false); hold = Array(12).fill(false);
    routes = []; shovels = []; root = null;
    if (!active) return;
    try { build(); } catch (e) { console.warn('tunnel', e); }
  });
  H.onStop(() => {
    active = false;
    ['tunnel0', 'tunnel1', 'tunnel2', 'tunnel0dirt', 'tunnel1dirt', 'tunnel2dirt'].forEach(t => { try { H.clearWalls(t); } catch (e) {} });
    routes = []; shovels = []; root = null;
  });

  H.onUpdate((dt) => {
    if (!active) return;
    dt = Math.min(dt, 0.1);
    const inside = (p) => H.hatch?.inside?.(p.index);
    for (const p of (H.players || [])) {
      if (!p || !inside(p)) continue;
      const i = p.index, key = H.keyLabel?.(i, 'interact') || 'E';

      const sh = shovels.find(s => s.alive && Math.hypot(p.pos.x - s.x, p.pos.z - s.z) < 1.4);
      if (sh && !hasShovel[i]) {
        H.hud(i, `⛏️ Ota lapio · ${key}`, 'tunnel');
        if (H.pressed(i, 'interact')) {
          hasShovel[i] = true;
          sh.alive = false; sh.mesh.visible = false;
          H.toast(i, 'Otit lapion! Seuraa valomerkkejä naapuritunneliin.');
          H.beep(523, 0.08, 'square', 0.04);
        }
        continue;
      }

      let used = false;
      for (const r of routes) {
        if (r.done) {
          for (const lad of [r.ladderA, r.ladderB]) {
            if (!lad) continue;
            if (Math.hypot(p.pos.x - lad.x, p.pos.z - lad.z) < 1.5) {
              H.hud(i, `🪜 Naapurin autotalliin (koti ${lad.homeI + 1}) · ${key}`, 'tunnel');
              if (H.pressed(i, 'interact')) H.hatch.exitTo(p, lad.homeI);
              used = true;
            }
          }
          if (used) break;
          continue;
        }
        const dA = Math.hypot(p.pos.x - r.faceA.x, p.pos.z - r.faceA.z);
        const dB = Math.hypot(p.pos.x - r.faceB.x, p.pos.z - r.faceB.z);
        const side = dA < 1.6 ? 'A' : (dB < 1.6 ? 'B' : null);
        if (!side) continue;
        used = true;
        const pct = Math.round((r.progress || 0) * 100);
        if (!hasShovel[i]) {
          H.hud(i, `⛏️ Hae lapio (hehkuva reitti vie alkuun) · kaivettu ${pct} %`, 'tunnel');
        } else {
          H.hud(i, `⛏️ Kaiva tunneli ${r.title.replace('⛏️ ', '')} · ${key} pohjassa · ${pct} %`, 'tunnel');
          const want = !!(H.input(i) && H.input(i).interact);
          if (want) dig(r, side, dt, i);
        }
        break;
      }
      if (!used) {
        // vihje jos lähellä merkittyä reittiä
        const hint = w(-2, -6);
        if (Math.hypot(p.pos.x - hint.x, p.pos.z - hint.z) < 4) {
          const r = routes[0];
          const pct = r ? Math.round((r.progress || 0) * 100) : 0;
          H.hud(i, `🗺️ Seuraa valo- ja köysimerkkejä tunneliin · ${pct} %`, 'tunnel');
        } else {
          H.hud(i, '', 'tunnel');
        }
      }
    }
  });

  H.tunnel = {
    pairs: neighborPairs,
    routes: () => routes.map(r => ({
      a: r.a, b: r.b, progress: r.progress, done: r.done,
      faceA: { ...r.faceA }, faceB: { ...r.faceB },
    })),
    hasShovel: (i) => !!hasShovel[i],
    giveShovel: (i) => { hasShovel[i] = true; },
    dig: (i, dt, side) => {
      const r = routes[0]; if (!r) return 0;
      hasShovel[i] = true;
      return dig(r, side || 'A', dt || 0.5, i);
    },
    finish: (i) => { const r = routes[i || 0] || routes[0]; if (r) finish(r); return !!(r && r.done); },
    DIG_RATE,
  };
  H.define?.('tunnel', H.tunnel);
})();
