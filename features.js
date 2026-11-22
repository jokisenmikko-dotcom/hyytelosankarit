// features.js (home rockets/helmets/flag) – Hyytelösankarit 2.0: kuutehtävä, kypärä, kotiraketit, kuuturva-HUD
(function () {
  const H = window.HYYTE;
  if (!H) return;

  const FLAG = { x: 8, z: -6 }; // suhteessa kuun keskipisteeseen (MX/MZ)
  let flagMesh = null, flagDone = [], helmets = [], homeRockets = [], active = false;

  function T() { return H.THREE; }

  function makeHelmet(color) {
    const G = T();
    const g = new G.Group();
    const glass = new G.Mesh(
      new G.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
      new G.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.45, metalness: 0.3, roughness: 0.15, emissive: '#a5d8ff', emissiveIntensity: 0.2 })
    );
    glass.position.y = 1.55;
    const rim = new G.Mesh(
      new G.TorusGeometry(0.32, 0.04, 8, 20),
      new G.MeshStandardMaterial({ color: color || '#dee2e6', metalness: 0.6, roughness: 0.3 })
    );
    rim.position.y = 1.38; rim.rotation.x = Math.PI / 2;
    const pack = new G.Mesh(
      new G.BoxGeometry(0.35, 0.45, 0.18),
      new G.MeshStandardMaterial({ color: '#868e96', metalness: 0.4, roughness: 0.5 })
    );
    pack.position.set(0, 1.1, -0.35);
    g.add(glass, rim, pack);
    g.visible = false; g.userData.helmet = true; g.name = 'spaceHelmet';
    return g;
  }

  function makeFlag() {
    const G = T();
    const g = new G.Group();
    const pole = new G.Mesh(new G.CylinderGeometry(0.06, 0.08, 4.2, 8), new G.MeshStandardMaterial({ color: '#ced4da', metalness: 0.7 }));
    pole.position.y = 2.1;
    const flag = new G.Mesh(new G.PlaneGeometry(1.8, 1.1), new G.MeshStandardMaterial({ color: '#ff6b6b', emissive: '#fa5252', emissiveIntensity: 0.55, side: 2 }));
    flag.position.set(0.95, 3.5, 0);
    const ball = new G.Mesh(new G.SphereGeometry(0.18, 10, 8), new G.MeshStandardMaterial({ color: '#ffd43b', emissive: '#fab005', emissiveIntensity: 0.9 }));
    ball.position.y = 4.25;
    const base = new G.Mesh(new G.CylinderGeometry(0.55, 0.7, 0.25, 12), new G.MeshStandardMaterial({ color: '#adb5bd' }));
    base.position.y = 0.12;
    // leijuva merkki
    const mark = new G.Mesh(new G.OctahedronGeometry(0.45), new G.MeshStandardMaterial({ color: '#ffe066', emissive: '#ffd43b', emissiveIntensity: 1.2 }));
    mark.position.y = 5.2;
    mark.userData.spin = true;
    g.add(pole, flag, ball, base, mark);
    g.userData.mark = mark;
    return g;
  }

  function makeHomeRocket(i) {
    const G = T();
    // kevyt kopio moon.buildRocket-tyylistä
    const g = new G.Group();
    const body = new G.Mesh(new G.CylinderGeometry(0.55, 0.7, 3.2, 12), new G.MeshStandardMaterial({ color: '#e9ecef', metalness: 0.55, roughness: 0.35 }));
    body.position.y = 1.9;
    const nose = new G.Mesh(new G.ConeGeometry(0.55, 1.1, 12), new G.MeshStandardMaterial({ color: '#ffd43b', emissive: '#fab005', emissiveIntensity: 0.4 }));
    nose.position.y = 4.05;
    const finM = new G.MeshStandardMaterial({ color: H.PLAYER_COLORS[i] || '#ff5a36' });
    for (let k = 0; k < 3; k++) {
      const fin = new G.Mesh(new G.BoxGeometry(0.12, 0.9, 0.55), finM);
      const a = (k / 3) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.65, 0.7, Math.sin(a) * 0.65);
      g.add(fin);
    }
    const pad = new G.Mesh(new G.CylinderGeometry(1.6, 1.7, 0.15, 24), new G.MeshStandardMaterial({ color: '#4dabf7', emissive: '#339af0', emissiveIntensity: 0.55 }));
    pad.position.y = 0.08;
    const lbl = H.makeLabel ? H.makeLabel(`🚀 P${i + 1}`, { scale: 2.8, bg: '#1c7ed6' }) : null;
    if (lbl) { lbl.position.set(0, 5.2, 0); g.add(lbl); }
    g.add(body, nose, pad);
    g.userData.owner = i; g.userData.homeRocket = true;
    return g;
  }

  function placeHomeRockets() {
    homeRockets.forEach(r => H.removeObject?.(r));
    homeRockets = [];
    const n = Math.max(1, H.players.length);
    const HOMES = H.homes?.HOMES || [{ x: -36, z: -112 }, { x: 22, z: -112 }, { x: -94, z: -112 }, { x: 96, z: -112 }];
    for (let i = 0; i < n; i++) {
      const h = HOMES[i] || HOMES[0];
      // raketti tallin viereen (ovi +z)
      const x = h.x + 3, z = h.z + 10;
      const r = makeHomeRocket(i);
      H.addObject(r, x, 0, z);
      H.obstacle?.(x, z, 1.2);
      homeRockets.push(r);
    }
  }

  function ensureFlag() {
    if (flagMesh || !H.moon) return;
    const c = H.moon.center;
    flagMesh = makeFlag();
    const y = (H.moon.height?.(c.x + FLAG.x, c.z + FLAG.z) ?? 2) + 0.05;
    H.addObject(flagMesh, c.x + FLAG.x, y, c.z + FLAG.z);
  }

  function ensureHelmets() {
    H.players.forEach((p, i) => {
      if (helmets[i]) return;
      const hel = makeHelmet(p.color);
      p.group.add(hel);
      helmets[i] = hel;
    });
  }

  H.onStart(() => {
    active = true;
    flagDone = H.players.map(() => false);
    helmets = [];
    flagMesh = null;
    try { placeHomeRockets(); } catch (e) { console.warn('home rockets', e); }
  });
  H.onStop(() => { active = false; homeRockets = []; flagMesh = null; helmets = []; });

  H.onUpdate((dt) => {
    if (!active) return;
    ensureHelmets();
    // kypärä näkyviin kuussa
    H.players.forEach((p, i) => {
      const hel = helmets[i];
      if (!hel) return;
      hel.visible = !!p.moon;
    });
    // kuutehtävä: lipulle
    if (H.players.some(p => p.moon)) {
      ensureFlag();
      if (flagMesh?.userData.mark) {
        flagMesh.userData.mark.rotation.y += dt * 2.2;
        flagMesh.userData.mark.position.y = 5.2 + Math.sin(H.time * 3) * 0.25;
      }
    }
    H.players.forEach((p, i) => {
      if (!p.moon || p.lock) {
        if (!p.moon) H.hud(i, '', 'moon');
        return;
      }
      const c = H.moon.center;
      const fx = c.x + FLAG.x, fz = c.z + FLAG.z;
      const dist = Math.hypot(p.pos.x - fx, p.pos.z - fz);
      if (!flagDone[i]) {
        H.hud(i, `🌙 Kuutehtävä: mene lipulle! ${dist < 25 ? '← lähellä' : ''} · ${H.keyLabel?.(i, 'interact') || 'E'}`, 'moon');
        if (dist < 2.8) {
          flagDone[i] = true;
          p.score = (p.score || 0) + 5;
          H.toast?.(i, '🏁 Kuutehtävä suoritettu! +5');
          H.beep?.(880, 0.12, 'triangle', 0.06);
          H.emit?.('moonQuest', i);
        }
      } else {
        H.hud(i, `🌙 Kuutehtävä ✓ · Kuuturva-aseella takaisin alas · hyppy korkealle!`, 'moon');
      }
      // kuuturva jatkuva veto
      if (p.tetherPull > 0) {
        p.tetherPull -= dt;
        p.vy = Math.min(p.vy, -16);
      }
    });

    // kotiraketti: E lähellä → sama kohdevalitsin kuin museoraketissa
    H.players.forEach((p, i) => {
      if (p.moon || p.lock || p.car != null || p.rocket) return;
      const r = homeRockets[i];
      if (!r) return;
      const dx = p.pos.x - r.position.x, dz = p.pos.z - r.position.z;
      if (dx * dx + dz * dz < 9) {
        H.hud(i, `🚀 Oma raketti · ${H.keyLabel?.(i, 'interact') || 'E'} = kohdevalinta`, 'rocket');
        if (H.pressed?.(i, 'interact')) {
          if (H.v24?.requestTravel) H.v24.requestTravel(p);
          else if (H.showDestPicker) {
            // fallback
            H.showDestPicker?.(p);
          } else H.toMoon?.(p);
        }
      }
    });
  });

  H.v20 = { flagDone: () => flagDone.slice(), homeRockets: () => homeRockets };
})();

// features: sheep ammo ensure (ex-v23)
(function () {
  const H = window.HYYTE;
  if (!H) return;
  H.on?.('start', () => {
    try {
      if (H.v22?.setAmmo && H.v22.sheepMax) {
        for (let i = 0; i < (H.players?.length || 0); i++) {
          const a = H.v22.sheepAmmo?.()?.[i];
          if (a != null && a <= 3) H.v22.setAmmo(i, H.v22.sheepMax());
        }
      }
    } catch (e) { console.warn('ammo ensure', e); }
  });
})();
