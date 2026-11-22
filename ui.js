// ui.js – TV-tila, observatorio-teleskooppi, versio (ex-v25/v26/v28)
// v25.js – Hyytelösankarit 2.5: TV-tila (pad exclusive TV-peleihin, poistu Backspace)
(function () {
  const H = window.HYYTE;
  if (!H) return;

  // TV-aktiivinen pelaaja pysyy lukittuna: pad ei liikuta/hypytä/aseista hahmoa.
  H.onUpdate((dt) => {
    for (const p of H.players || []) {
      if (!p || !p.tvActive) continue;
      p.lock = true;
      p.speed = 0;
      if (typeof p.vy === 'number') p.vy = 0;
    }
  });

  H.tvMode = {
    exitKey: () => (H.homes && H.homes.tvExitKey) || 'Backspace',
    exitLabel: 'Backspace',
    active: (i) => !!(H.homes && H.homes.tvActive && H.homes.tvActive(i)),
    enter: (i) => H.homes && H.homes.enterTv && H.homes.enterTv(i),
    exit: (i) => H.homes && H.homes.exitTv && H.homes.exitTv(i),
  };
})();

// v26.js – sohvalla pad ei nosta; Kuutiojuoksu RT/R2 = hyppy
(function () {
  const H = window.HYYTE;
  if (!H) return;

  // Vahvista joka tick: sohvalla lock + ei pad-nousua (homes hoitaa standUp vain Backspacella)
  H.onUpdate(() => {
    for (const p of H.players || []) {
      if (!p) continue;
      if (H.homes && H.homes.seated && H.homes.seated(p.index)) {
        p.lock = true;
        p.tvActive = true;
        p.speed = 0;
        if (typeof p.vy === 'number') p.vy = 0;
      }
    }
  });

  H.tvSofa = {
    exitKey: 'Backspace',
    dashJumpButtons: 'A/✕ tai RT/R2',
  };
})();

// ui.js – Hyytelösankarit 3.3: turvallinen planeettaspawn, observatorio-teleskooppi,
// Kuutiojuoksu VA, nimi+HP ylhäällä, kuumönkijät lähellä laskua.
(function () {
  const H = window.HYYTE;
  if (!H) return;
  H.version = '3.5';
  H.ui = { version: '3.5', observatory: true, tvMode: true, cooking: true, circus: true, maxPlayers: 12, coop: true, hatch: true, plane: true, night: true, perfHud: true, wallet: true, tunnel: true, touch: true, pwa: true };
  H.v28 = {
    safeSpawn: true,
    observatory: true,
    dashDifficulty: true,
    nameHpRaise: true,
    moonVehiclesNearPad: true,
  };

  const observing = new Map(); // playerIndex -> { bodyId|moon }
  let styleInjected = false;

  function ensureStyle() {
    if (styleInjected) return;
    styleInjected = true;
    const s = document.createElement('style');
    s.textContent = `
.hyyte-obs{position:absolute;inset:0;z-index:40;display:none;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at 50% 40%,#1a1040 0%,#050510 70%);pointer-events:none;overflow:hidden}
.hyyte-obs.on{display:flex}
.hyyte-obs canvas{width:92%;height:82%;border-radius:50%;border:10px solid #1c1c22;box-shadow:0 0 40px #4c6ef5,inset 0 0 60px #000}
.hyyte-obs .obs-hint{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:#ffe8a3;font:800 14px system-ui;
  background:rgba(0,0,0,.55);padding:6px 14px;border-radius:999px}
.hyyte-obs .obs-title{position:absolute;top:14px;left:50%;transform:translateX(-50%);color:#fff;font:900 16px system-ui;
  letter-spacing:.06em;text-shadow:0 2px 8px #000}
`;
    document.head.appendChild(s);
  }

  function vpEl(i) { return document.querySelector(`.vp.v${i}`); }

  function ensureOverlay(i) {
    ensureStyle();
    const vp = vpEl(i); if (!vp) return null;
    let el = vp.querySelector('.hyyte-obs');
    if (!el) {
      el = document.createElement('div');
      el.className = 'hyyte-obs';
      el.innerHTML = `<div class="obs-title">🔭 OBSERVATORIO</div><canvas width="720" height="720"></canvas><div class="obs-hint"></div>`;
      vp.appendChild(el);
    }
    return el;
  }

  function listObservatories(p) {
    const list = [];
    try {
      if (p._bodyId && p._bodyId !== 'moon' && H.v24?.ensureWorld) {
        const w = H.v24.ensureWorld(p._bodyId);
        if (w?.observatories) list.push(...w.observatories);
      }
    } catch (_) {}
    try {
      if (p.moon && (!p._bodyId || p._bodyId === 'moon')) {
        list.push(...(H.moon?.observatories?.() || []));
      }
    } catch (_) {}
    return list;
  }

  function nearObs(p) {
    const L = listObservatories(p);
    for (const o of L) {
      if (Math.hypot(p.pos.x - o.x, p.pos.z - o.z) < (o.r || 4)) return o;
    }
    return null;
  }

  function enterObs(p) {
    const el = ensureOverlay(p.index); if (!el) return;
    observing.set(p.index, { t: 0, rockets: [] });
    p.lock = true; p.lockHint = '🔭 Observatorio';
    p._obsView = true;
    el.classList.add('on');
    const key = H.keyLabel?.(p.index, 'interact') || 'E';
    el.querySelector('.obs-hint').textContent = key + ' = poistu kaukoputkesta';
    H.toast?.(p.index, '🔭 Kaukoputki: Linnunrata, sumut, planeetat…');
  }

  function exitObs(p) {
    observing.delete(p.index);
    p._obsView = false;
    // älä lukitse uudelleen jos ei sohvalla
    if (!(H.homes && H.homes.seated && H.homes.seated(p.index))) {
      p.lock = false; p.lockHint = null;
    }
    const el = vpEl(p.index)?.querySelector('.hyyte-obs');
    if (el) el.classList.remove('on');
  }

  function drawTelescope(el, st, dt) {
    const c = el.querySelector('canvas'); if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, Hh = c.height;
    st.t += dt;
    // deep space
    const g = ctx.createRadialGradient(W/2, Hh/2, 40, W/2, Hh/2, W*0.55);
    g.addColorStop(0, '#1b1048'); g.addColorStop(0.55, '#0a0a1c'); g.addColorStop(1, '#020208');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);

    // milky way band
    ctx.save();
    ctx.translate(W/2, Hh/2); ctx.rotate(-0.4 + Math.sin(st.t * 0.05) * 0.05);
    const band = ctx.createLinearGradient(-W, -40, W, 80);
    band.addColorStop(0, 'rgba(0,0,0,0)');
    band.addColorStop(0.35, 'rgba(200,210,255,0.25)');
    band.addColorStop(0.5, 'rgba(255,230,255,0.45)');
    band.addColorStop(0.65, 'rgba(180,200,255,0.28)');
    band.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = band; ctx.fillRect(-W, -60, W*2, 140);
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random()*0.6})`;
      ctx.fillRect(-W*0.8 + Math.random()*W*1.6, -50 + Math.random()*100, 1.5, 1.5);
    }
    ctx.restore();

    // stars
    for (let i = 0; i < 220; i++) {
      const seed = (i * 9973 + 13) % 1000;
      const x = (seed * 17 + st.t * 3) % W;
      const y = (seed * 31) % Hh;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + (seed%50)/80})`;
      ctx.fillRect(x, y, 1 + (seed%3===0?1:0), 1);
    }

    // nebulae
    for (let n = 0; n < 3; n++) {
      const nx = W*0.25 + n*W*0.22 + Math.sin(st.t*0.2+n)*20;
      const ny = Hh*0.35 + Math.cos(st.t*0.15+n)*30;
      const rg = ctx.createRadialGradient(nx, ny, 0, nx, ny, 70 + n*20);
      const cols = ['rgba(255,80,160,0.28)','rgba(80,160,255,0.25)','rgba(180,80,255,0.22)'];
      rg.addColorStop(0, cols[n]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(nx, ny, 90, 0, 7); ctx.fill();
    }

    // planets
    const planets = [
      { c:'#e8590c', r:28, ox:0.22, oy:0.55, sp:0.12 },
      { c:'#fab005', r:18, ox:0.7, oy:0.3, sp:0.08 },
      { c:'#748ffc', r:22, ox:0.55, oy:0.7, sp:0.1 },
      { c:'#ff6b6b', r:14, ox:0.35, oy:0.25, sp:0.15 },
    ];
    for (const pl of planets) {
      const px = W*pl.ox + Math.sin(st.t*pl.sp)*12;
      const py = Hh*pl.oy + Math.cos(st.t*pl.sp*0.8)*8;
      ctx.fillStyle = pl.c; ctx.beginPath(); ctx.arc(px, py, pl.r, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(px-pl.r*0.3, py-pl.r*0.3, pl.r*0.35, 0, 7); ctx.fill();
    }

    // occasional rockets between planets
    if (!st.rockets) st.rockets = [];
    if (Math.random() < 0.012 && st.rockets.length < 3) {
      st.rockets.push({
        x: Math.random()*W, y: Math.random()*Hh,
        vx: 40 + Math.random()*60, vy: -20 + Math.random()*40,
        life: 4 + Math.random()*3,
      });
    }
    for (let i = st.rockets.length - 1; i >= 0; i--) {
      const r = st.rockets[i];
      r.life -= dt; r.x += r.vx*dt; r.y += r.vy*dt;
      if (r.life <= 0) { st.rockets.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(Math.atan2(r.vy, r.vx));
      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-8,-5); ctx.lineTo(-8,5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff922b';
      ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(-16,-3); ctx.lineTo(-16,3); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // circular vignette (telescope eyepiece)
    const vig = ctx.createRadialGradient(W/2, Hh/2, W*0.32, W/2, Hh/2, W*0.5);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, Hh);
  }

  H.onUpdate((dt) => {
    if (!H.game) return;
    for (const p of H.players) {
      const i = p.index;
      if (p._obsView) {
        const st = observing.get(i); if (!st) continue;
        // exit
        if (H.pressed?.(i, 'interact') && (p.enterLock || 0) <= 0) {
          exitObs(p); p.enterLock = 0.35; continue;
        }
        p.lock = true; p.speed = 0;
        const el = ensureOverlay(i);
        if (el) drawTelescope(el, st, dt);
        continue;
      }
      // not observing
      if (p.lock && !p.rocket && !(H.homes && H.homes.seated && H.homes.seated(i))) {
        // skip hints while locked for other reasons
      }
      const o = nearObs(p);
      if (o && !p.rocket && p.car == null && !p.lock) {
        H.hud?.(i, `🔭 ${H.keyLabel?.(i, 'interact') || 'E'} = katso kaukoputkella`, 'obs');
        if (H.pressed?.(i, 'interact') && (p.enterLock || 0) <= 0) {
          enterObs(p); p.enterLock = 0.4;
        }
      } else {
        H.hud?.(i, '', 'obs');
      }
    }
  });

  H.onStop(() => {
    observing.clear();
    document.querySelectorAll('.hyyte-obs').forEach(el => el.remove());
  });
})();

(function () {
  const H = window.HYYTE;
  if (!H) return;
  H.v27 = H.v27 || { dashHit: 'triangle+AABB', rocketAutoOrbit: true, homeRocketPicker: true };
})();
