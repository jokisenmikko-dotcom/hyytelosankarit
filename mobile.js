// mobile.js – 3.5: kosketusohjaus, Mobiili-grafiikka, vaakavihje ja PWA-apu.
(function () {
  const H = window.HYYTE;
  if (!H) return;

  function coarse() {
    try { if (window.matchMedia && matchMedia('(pointer: coarse)').matches) return true; } catch (e) {}
    return (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  }
  function isPhone() {
    const s = Math.min(screen.width || 0, screen.height || 0) || Math.min(innerWidth, innerHeight);
    return coarse() && s > 0 && s < 700;
  }
  function isTablet() {
    const s = Math.min(screen.width || 0, screen.height || 0) || Math.min(innerWidth, innerHeight);
    return coarse() && s >= 700;
  }
  function portrait() {
    try { return !!(window.matchMedia && matchMedia('(orientation: portrait)').matches); } catch (e) {}
    return innerHeight > innerWidth;
  }

  const st = Array.from({ length: 12 }, () => ({
    f: 0, turn: 0, jump: false, fire: false, interact: false, camera: false,
    wallet: false, swap: false, drift: false, eat: false, run: false,
    orbit: 0, camUp: false, camDown: false, lookX: 0, lookY: 0,
  }));
  let root = null, active = false, look = [];

  if (coarse() && !H.load('gfx-manual', false)) {
    try { H.gfx = 'mobiili'; } catch (e) {}
  }

  function css() {
    if (document.getElementById('hyyte-mobile-css')) return;
    const s = document.createElement('style');
    s.id = 'hyyte-mobile-css';
    s.textContent = `
      .hyyte-touch{position:fixed;inset:0;z-index:8;pointer-events:none}
      .hyyte-touch .stick-base{position:absolute;width:132px;height:132px;border-radius:50%;
        background:rgba(16,36,48,.35);border:3px solid rgba(255,246,232,.55);pointer-events:auto;touch-action:none}
      .hyyte-touch .stick-knob{position:absolute;width:58px;height:58px;border-radius:50%;
        background:rgba(255,246,232,.92);border:3px solid #102430;left:37px;top:37px;pointer-events:none}
      .hyyte-touch .acts{position:absolute;display:flex;flex-wrap:wrap;gap:8px;width:168px;pointer-events:auto;justify-content:flex-end}
      .hyyte-touch .acts button{min-width:72px;min-height:56px;padding:6px 8px;border-radius:16px;border:3px solid #102430;
        background:rgba(246,196,69,.94);color:#102430;font:800 13px system-ui,sans-serif;touch-action:none;user-select:none}
      .hyyte-touch .acts button[data-touch-btn="jump"]{background:#ff5a36;color:#fff;min-width:88px;min-height:64px;font-size:15px}
      .hyyte-touch .acts button[data-touch-btn="interact"]{background:#2f9e44;color:#fff}
      .hyyte-orient{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;
        background:rgba(14,26,36,.92);color:#fff6e8;text-align:center;padding:24px;font:800 22px system-ui,sans-serif}
      .hyyte-orient.show{display:flex;flex-direction:column;gap:12px}
      .hyyte-orient b{font-size:48px}
      .hyyte-fs-lobby{margin-left:8px}
      @media (pointer: coarse){
        .lobby button,.lobby .mode,.lobby .go,.lobby .pick{min-height:48px;min-width:48px;font-size:16px}
        .lobby .go{min-height:56px;padding:12px 28px;font-size:20px}
        .hyyte-menu-list button,.hyyte-menu-grid button{min-height:52px;font-size:16px;padding:10px 12px}
        .pad{display:none !important}
      }
    `;
    document.head.appendChild(s);
  }

  function orientBanner() {
    let el = document.getElementById('hyyte-orient');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hyyte-orient';
      el.className = 'hyyte-orient';
      el.innerHTML = '<b>📱↻</b><div>Käännä laite vaakaan – peli on suunniteltu vaakasuuntaan.</div>';
      document.body.appendChild(el);
    }
    const show = coarse() && portrait();
    el.classList.toggle('show', show);
    return show;
  }

  function lobbyBits() {
    const lobby = document.querySelector('.lobby');
    if (!lobby || lobby._mobDone) return;
    lobby._mobDone = true;
    if (!coarse()) return;
    const go = lobby.querySelector('#go') || lobby.querySelector('.go');
    if (go && !document.getElementById('hyyte-fs-lobby')) {
      const b = document.createElement('button');
      b.type = 'button'; b.id = 'hyyte-fs-lobby'; b.className = 'hyyte-fs-lobby mode';
      b.textContent = '⛶ Kokoruutu';
      b.addEventListener('click', () => {
        const el = document.documentElement;
        const fn = el.requestFullscreen || el.webkitRequestFullscreen;
        if (fn) fn.call(el);
      });
      go.after(b);
    }
    if (isTablet()) {
      const hint = document.createElement('p');
      hint.className = 'uutta-hint';
      hint.textContent = 'Tabletissa voit valita 2 pelaajaa: kumpikin saa oman puolen kosketusohjaimet. Ohjaimet toimivat silti.';
      (lobby.querySelector('.pcount') || go)?.after(hint);
    }
  }

  function clearLook(i) { st[i].lookX = 0; st[i].lookY = 0; st[i].orbit = 0; st[i].camUp = false; st[i].camDown = false; }

  function bindStick(el, i) {
    const knob = el.querySelector('.stick-knob');
    const max = 40;
    const set = (dx, dy) => {
      const m = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, m / max);
      const nx = dx / m * k, ny = dy / m * k;
      st[i].turn = -nx;
      st[i].f = -ny;
      if (knob) { knob.style.left = (37 + nx * max) + 'px'; knob.style.top = (37 + ny * max) + 'px'; }
    };
    const end = () => { st[i].f = 0; st[i].turn = 0; if (knob) { knob.style.left = '37px'; knob.style.top = '37px'; } };
    const move = (ev) => {
      ev.preventDefault();
      const r = el.getBoundingClientRect();
      const t = ev.changedTouches ? ev.changedTouches[0] : ev;
      set(t.clientX - (r.left + r.width / 2), t.clientY - (r.top + r.height / 2));
    };
    el.addEventListener('pointerdown', (ev) => { el.setPointerCapture(ev.pointerId); move(ev); });
    el.addEventListener('pointermove', (ev) => { if (el.hasPointerCapture?.(ev.pointerId) || ev.buttons) move(ev); });
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('touchstart', move, { passive: false });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
  }

  function bindBtn(el, i, name) {
    const down = (ev) => { ev.preventDefault(); st[i][name] = true; if (name === 'map') openMap(i); if (name === 'menu') openMenu(); };
    const up = () => { st[i][name] = false; };
    el.addEventListener('pointerdown', (ev) => { try { el.setPointerCapture(ev.pointerId); } catch (e) {} down(ev); });
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchend', up);
  }

  function openMap(i) {
    const p = H.players && H.players[i];
    if (H.teleport && H.teleport.open && p) H.teleport.open(p);
    else H.toast?.(i, 'Teleporttikartta');
  }
  function openMenu() {
    const b = document.getElementById('back');
    if (b) b.click();
  }

  function bindLook(canvas, halves) {
    const start = (ev) => {
      if (ev.target && ev.target.closest && ev.target.closest('.hyyte-touch,.pad,.back,.fsbtn,.hyyte-menu-wrap,#hyyte-wallet-wrap,#hyyte-tp-map')) return;
      const t = ev.changedTouches ? ev.changedTouches[0] : ev;
      const x = t.clientX, y = t.clientY;
      let i = 0;
      if (halves && innerWidth) i = x > innerWidth / 2 ? 1 : 0;
      look[i] = { id: ev.pointerId != null ? ev.pointerId : (t.identifier ?? 0), x, y };
      try { canvas.setPointerCapture && ev.pointerId != null && canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    };
    const move = (ev) => {
      const t = ev.changedTouches ? ev.changedTouches[0] : ev;
      const id = ev.pointerId != null ? ev.pointerId : (t.identifier ?? 0);
      const slot = look.findIndex((L) => L && L.id === id);
      if (slot < 0) return;
      ev.preventDefault();
      const dx = t.clientX - look[slot].x, dy = t.clientY - look[slot].y;
      look[slot].x = t.clientX; look[slot].y = t.clientY;
      const p = H.players && H.players[slot];
      if (p) {
        p.yaw -= dx * 0.008;
        if (p.firstPerson) p.pitch = Math.max(-1.2, Math.min(1.1, (p.pitch || 0) + dy * 0.006));
        else p.camLift = Math.max(1.15, Math.min(10, (p.camLift || 4.4) + dy * 0.03));
        st[slot].orbit = Math.max(-1, Math.min(1, -dx * 0.02));
      }
    };
    const end = (ev) => {
      const t = ev.changedTouches ? ev.changedTouches[0] : ev;
      const id = ev.pointerId != null ? ev.pointerId : (t && t.identifier);
      look = look.map((L) => (L && (id == null || L.id === id) ? null : L));
      look.forEach((L, i) => { if (!L) clearLook(i); });
    };
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
  }

  function mount() {
    unmount();
    if (!coarse()) return;
    css();
    const stage = document.querySelector('.stage');
    if (!stage) return;
    const n = Math.min(2, Number(stage.dataset.n) || (H.players || []).length || 1);
    const halves = n === 2 && (isTablet() || innerWidth >= 900);
    root = document.createElement('div');
    root.className = 'hyyte-touch' + (halves ? ' split' : '');
    root.setAttribute('data-touch-ui', '1');
    const players = halves ? [0, 1] : [0];
    players.forEach((i) => {
      const side = i === 0 ? 'left' : 'right';
      const stick = document.createElement('div');
      stick.className = 'stick-base';
      stick.dataset.touchStick = String(i);
      stick.innerHTML = '<div class="stick-knob"></div>';
      const acts = document.createElement('div');
      acts.className = 'acts';
      acts.dataset.touchActs = String(i);
      const btns = [
        ['jump', 'Hyppy'], ['interact', 'Käytä'], ['wallet', 'Lompakko'],
        ['map', 'Kartta'], ['camera', 'Kamera'], ['menu', 'Valikko'],
      ];
      btns.forEach(([id, lab]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.touchBtn = id;
        b.dataset.player = String(i);
        b.textContent = lab;
        acts.appendChild(b);
        bindBtn(b, i, id);
      });
      if (halves) {
        stick.style.bottom = '18px';
        stick.style[side] = '18px';
        acts.style.bottom = '18px';
        acts.style[side] = '160px';
      } else {
        stick.style.bottom = '18px';
        stick.style.left = '16px';
        acts.style.bottom = '18px';
        acts.style.right = '16px';
      }
      root.appendChild(stick);
      root.appendChild(acts);
      bindStick(stick, i);
    });
    document.body.appendChild(root);
    const canvas = document.getElementById('view') || stage.querySelector('canvas');
    if (canvas) bindLook(canvas, halves);
    // piilota vanha d-pad
    stage.querySelectorAll('.pad').forEach((p) => { p.style.display = 'none'; });
    active = true;
  }
  function unmount() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; active = false;
    st.forEach((s, i) => { Object.keys(s).forEach((k) => { s[k] = typeof s[k] === 'boolean' ? false : 0; }); });
  }

  H.onStart(() => { try { css(); orientBanner(); mount(); } catch (e) { console.warn('touch', e); } });
  H.onStop(() => { unmount(); });

  const tick = () => { try { orientBanner(); lobbyBits(); } catch (e) {} };
  if (typeof requestAnimationFrame === 'function') {
    const loop = () => { tick(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  document.addEventListener('DOMContentLoaded', () => { css(); lobbyBits(); orientBanner(); });
  window.addEventListener('orientationchange', orientBanner);
  window.addEventListener('resize', orientBanner);

  H.touch = {
    active: () => !!active,
    coarse, isPhone, isTablet,
    state: (i) => st[i] || st[0],
    mount, unmount,
    _press: (i, name, on) => { if (st[i]) st[i][name] = !!on; },
    _stick: (i, f, turn) => { if (st[i]) { st[i].f = f; st[i].turn = turn; } },
  };
  H.define?.('touch', H.touch);
})();
