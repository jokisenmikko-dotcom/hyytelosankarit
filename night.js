// night.js – 3.3: vuorokausi, tähtitaivas ja automaattinen otsalamppu.
// Yö ei ole liian pimeä lapsille. Yksi Points-tähtikenttä, yksi varjoton spotlight / pelaaja.
(function () {
  const H = window.HYYTE;
  const T = () => H.THREE;
  const DAY = 360; // 6 min oikeaa aikaa = yksi pelivuorokausi
  // 0–0.42 päivä, 0.42–0.52 hämärä, 0.52–0.86 yö, 0.86–1.0 aamu

  let active = false, offset = 0, stars = null, lamps = [];
  let hemi = null, dir = null, fog = null;
  let base = null, spaceSky = false;
  let _fwd = null;
  let cHemiN = null, cDirN = null, cFogN = null;

  function wrapSkyNight() {
    const prev = H.skyNight;
    H.skyNight = (night) => {
      spaceSky = !!night;
      try { prev && prev(night); } catch (e) {}
      applySky();
    };
  }

  function phase() {
    const t = (H.time || 0) + offset;
    return ((t % DAY) + DAY) % DAY / DAY;
  }
  function darkOf(u) {
    if (u < 0.42) return 0;
    if (u < 0.52) return (u - 0.42) / 0.10;
    if (u < 0.86) return 1;
    return Math.max(0, 1 - (u - 0.86) / 0.14);
  }

  function cacheLights() {
    hemi = null; dir = null;
    const scene = H.scene; if (!scene) return;
    scene.traverse((o) => {
      if (!hemi && o.isHemisphereLight) hemi = o;
      if (!dir && o.isDirectionalLight) dir = o;
    });
    fog = scene.fog || null;
    if (!base) {
      const G = T();
      base = {
        hemi: hemi ? hemi.intensity : 1.05,
        dir: dir ? dir.intensity : 1.15,
        dirC: dir && dir.color ? dir.color.clone() : null,
        hemiS: hemi && hemi.color ? hemi.color.clone() : null,
        hemiG: hemi && hemi.groundColor ? hemi.groundColor.clone() : null,
        fogC: fog && fog.color ? fog.color.clone() : null,
      };
      cHemiN = new G.Color(0x7f9bc7);
      cDirN = new G.Color(0xb0c4de);
      cFogN = new G.Color(0x1b2740);
    }
  }

  function buildStars() {
    const G = T(); if (!G || !H.scene) return;
    const n = (H.gfx === 'matala' || H.gfx === 'mobiili') ? 400 : 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // tasainen jakauma yläpuoliskolle
      const u = Math.random(), v = Math.random();
      const th = 2 * Math.PI * u;
      const ph = Math.acos(1 - v); // 0..pi/2 roughly if we fold
      const r = 420;
      const y = Math.abs(Math.cos(ph)) * r + 40;
      const rr = Math.sin(ph) * r;
      pos[i * 3] = Math.cos(th) * rr;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(th) * rr;
    }
    const geo = new G.BufferGeometry();
    geo.setAttribute('position', new G.BufferAttribute(pos, 3));
    const mat = new G.PointsMaterial({
      color: 0xfff4d6, size: H.gfx === 'matala' ? 1.6 : 2.2,
      sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false,
    });
    stars = new G.Points(geo, mat);
    stars.frustumCulled = false;
    stars.visible = false;
    H.scene.add(stars);
  }

  function makeLamps() {
    lamps = [];
    const G = T(); if (!G || !H.scene) return;
    if (!_fwd && G.Vector3) _fwd = new G.Vector3();
    const n = Math.max(1, (H.players || []).length);
    for (let i = 0; i < n; i++) {
      // vendor-buildissa ei ole SpotLightia – lyhyt PointLight ilman varjoja
      const L = new G.PointLight(0xfff1d0, 0, 14, 1.6);
      L.castShadow = false;
      L.visible = false;
      H.scene.add(L);
      lamps[i] = L;
    }
  }

  function offWorld(p) {
    return !!(p && (p.moon || p.rocket || p._bodyId));
  }
  function anyOffWorld() {
    const ps = H.players || [];
    for (let i = 0; i < ps.length; i++) if (offWorld(ps[i])) return true;
    return false;
  }

  function applySky() {
    if (!base) cacheLights();
    const u = phase();
    const dark = (anyOffWorld() || spaceSky) ? 0 : darkOf(u);
    const nightNow = dark > 0.45;
    if (hemi && base) {
      hemi.intensity = base.hemi * (1 - dark * 0.52);
      if (hemi.color && base.hemiS) {
        hemi.color.copy(base.hemiS);
        if (cHemiN) hemi.color.lerp(cHemiN, dark * 0.55);
      }
    }
    if (dir && base) {
      dir.intensity = base.dir * (1 - dark * 0.78);
      if (dir.color && base.dirC) {
        dir.color.copy(base.dirC);
        if (cDirN) dir.color.lerp(cDirN, dark * 0.7);
      }
    }
    if (fog && fog.color && base && base.fogC) {
      fog.color.copy(base.fogC);
      if (cFogN) fog.color.lerp(cFogN, dark * 0.65);
    }
    if (stars && stars.material) {
      const show = spaceSky || dark > 0.25;
      stars.visible = show;
      stars.material.opacity = spaceSky ? 0.95 : Math.max(0, (dark - 0.2) * 1.2);
    }
    return { dark, nightNow, u };
  }

  function updLamps(dark) {
    if (!lamps.length) { try { makeLamps(); } catch (e) {} }
    const cheap = H.gfx === 'matala' || H.gfx === 'mobiili';
    const on = !cheap && dark > 0.45 && !spaceSky;
    const ps = H.players || [];
    const cams = H.game && H.game.cameras;
    for (let i = 0; i < lamps.length; i++) {
      const L = lamps[i], p = ps[i];
      const use = on && p && !offWorld(p);
      L.visible = !!use;
      L.intensity = use ? (1.1 + dark * 0.4) : 0;
      if (!use) continue;
      const cam = cams && cams[i];
      let x, y, z, fx, fy, fz;
      if (cam && cam.position && _fwd && cam.getWorldDirection) {
        x = cam.position.x; y = cam.position.y; z = cam.position.z;
        try { cam.getWorldDirection(_fwd); } catch (e) { _fwd.set(0, 0, 1); }
        fx = _fwd.x; fy = _fwd.y; fz = _fwd.z;
      } else {
        const yaw = p.yaw || 0;
        fx = Math.sin(yaw); fz = Math.cos(yaw); fy = -0.05;
        x = p.pos.x; y = (p.pos.y || 0) + 1.45; z = p.pos.z;
      }
      // valo vähän pään eteen, jotta se valaisee suunnan (ei varjoja)
      L.position.set(x + fx * 0.7, y + 0.05, z + fz * 0.7);
    }
  }

  function setPhase(u) {
    u = Math.max(0, Math.min(0.999, +u || 0));
    offset = u * DAY - (H.time || 0);
    const s = applySky();
    updLamps(s.dark);
    return s;
  }

  H.onStart(() => {
    active = !H.challenge; offset = 0; spaceSky = false; base = null;
    lamps = []; stars = null; hemi = null; dir = null;
    if (!active) return;
    wrapSkyNight();
    // valot ja taivas ehtivät syntyä gfx.onStartissa
    setTimeout(() => {
      if (!active) return;
      try {
        cacheLights();
        buildStars();
        makeLamps();
        applySky();
      } catch (e) { console.warn('night', e); }
    }, 120);
  });
  H.onStop(() => {
    active = false;
    if (stars && stars.parent) stars.parent.remove(stars);
    lamps.forEach(L => L && L.parent && L.parent.remove(L));
    lamps = []; stars = null; base = null;
  });

  H.onUpdate(() => {
    if (!active) return;
    const s = applySky();
    updLamps(s.dark);
  });

  H.night = {
    DAY, phase, dark: () => darkOf(phase()),
    isNight: () => darkOf(phase()) > 0.45,
    setPhase,
    headlamp: (i) => !!(lamps[i] && lamps[i].visible),
    _debug: () => ({ n: lamps.length, vis: lamps.map(L => !!(L && L.visible)), inten: lamps.map(L => L && L.intensity), spaceSky, gfx: H.gfx, players: (H.players||[]).length }),
    stars: () => !!(stars && stars.visible),
  };
  H.define?.('night', H.night);
})();
