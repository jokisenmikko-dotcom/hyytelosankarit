// menuPad.js – 3.0: kun lista/valikko aukeaa, ohjain siirtyy listalle (dpad/tatti, A valitse, B sulje).
(function () {
  const H = window.HYYTE;
  let open = null; // { owner, items, idx, onSelect, onClose, el, highlight }
  let prev = {};

  function ensureStyle() {
    if (document.getElementById('hyyte-menupad-css')) return;
    const s = document.createElement('style');
    s.id = 'hyyte-menupad-css';
    s.textContent = `.hyyte-menu-focus{outline:3px solid #f6c445!important;box-shadow:0 0 0 3px #102430,0 0 14px #f6c445;transform:translateY(-1px)}
      .hyyte-menu-wrap{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(8,18,28,.55);pointer-events:auto}
      .hyyte-menu-card{background:#102430;border:3px solid #f6c445;border-radius:18px;padding:16px 18px;max-width:640px;width:92%;color:#fff6e8;max-height:78vh;overflow:auto}
      .hyyte-menu-card h2{margin:0 0 10px;text-align:center;font-size:22px}
      .hyyte-menu-list{display:flex;flex-direction:column;gap:6px}
      .hyyte-menu-list button,.hyyte-menu-grid button{display:block;width:100%;text-align:left;background:#1b3a4a;border:2px solid #3aa0ff;border-radius:12px;color:#fff;padding:10px 12px;cursor:pointer;font:inherit}
      .hyyte-menu-list button.disabled,.hyyte-menu-grid button.disabled{opacity:.4;filter:grayscale(.7);cursor:not-allowed}
      .hyyte-menu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
      .hyyte-menu-hint{margin-top:10px;opacity:.85;font-size:13px;text-align:center}`;
    document.head.appendChild(s);
  }

  function padState(i) {
    const P = window.HYYTE_PAD; if (!P) return null;
    // raw/state palauttaa kartoitetun tilan (ei Gamepad.buttons)
    const g = (P.state ? P.state(i) : P.raw(i));
    if (!g) return null;
    const dU = !!g.camIn || (typeof g.f === 'number' && g.f > 0.55);
    const dD = !!g.camOut || (typeof g.f === 'number' && g.f < -0.55);
    const dL = typeof g.turn === 'number' && g.turn > 0.55;
    const dR = typeof g.turn === 'number' && g.turn < -0.55;
    return { dU, dD, dL, dR, A: !!g.jump, B: !!g.drift };
  }

  function highlight() {
    if (!open) return;
    const nodes = open.nodes;
    nodes.forEach((n, i) => n.classList.toggle('hyyte-menu-focus', i === open.idx));
    const cur = nodes[open.idx];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }

  function close(reason) {
    if (!open) return;
    const o = open; open = null;
    if (o.el && o.el.parentNode) o.el.remove();
    try { o.onClose && o.onClose(reason); } catch (e) {}
  }

  function select() {
    if (!open) return;
    const it = open.items[open.idx];
    if (!it || it.disabled) { H.beep?.(220, 0.08, 'sawtooth', 0.04); return; }
    const o = open;
    try { o.onSelect && o.onSelect(it, open.idx); } catch (e) {}
    if (o.keepOpen) highlight();
    else close('select');
  }

  /** Avaa ohjainlistan. items: [{id,label,disabled?,html?}] */
  function show(opts) {
    ensureStyle();
    close('replace');
    const owner = opts.owner ?? 0;
    const items = (opts.items || []).slice();
    if (!items.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'hyyte-menu-wrap';
    wrap.dataset.owner = String(owner);
    const card = document.createElement('div');
    card.className = 'hyyte-menu-card';
    card.innerHTML = `<h2>${opts.title || 'Valitse'}</h2><div class="${opts.grid ? 'hyyte-menu-grid' : 'hyyte-menu-list'}"></div><div class="hyyte-menu-hint">↑↓ valitse · A/✕ OK · B/○ sulje</div>`;
    const list = card.querySelector('div');
    const nodes = items.map((it) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (it.disabled) b.classList.add('disabled');
      b.innerHTML = it.html || it.label || it.id;
      b.addEventListener('click', () => {
        if (it.disabled) return;
        open && (open.idx = nodes.indexOf(b));
        select();
      });
      list.appendChild(b);
      return b;
    });
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close('backdrop'); });
    open = {
      owner, items, idx: Math.max(0, items.findIndex(x => !x.disabled)),
      onSelect: opts.onSelect, onClose: opts.onClose, el: wrap, nodes,
      keepOpen: !!opts.keepOpen, cols: opts.cols || (opts.grid ? 3 : 1),
    };
    if (open.idx < 0) open.idx = 0;
    highlight();
    // älä laukaise A/B uudestaan, jos nappi on vielä pohjassa (esim. lista avautuu uudelleen)
    const st = padState(owner) || {};
    prev[owner] = { dU: !!st.dU, dD: !!st.dD, dL: !!st.dL, dR: !!st.dR, A: !!st.A, B: !!st.B };
    return { close: () => close('api'), isOpen: () => open && open.el === wrap };
  }

  function tick() {
    if (!open) return;
    const i = open.owner;
    const st = padState(i);
    // myös näppäimistö: nuolet / WASD + E/Enter = OK, Esc/Q = sulje
    const kb = {
      dU: H.kbHit?.(i, 'up') || H.keyPressed?.('ArrowUp') || H.keyPressed?.('KeyW'),
      dD: H.kbHit?.(i, 'down') || H.keyPressed?.('ArrowDown') || H.keyPressed?.('KeyS'),
      dL: H.kbHit?.(i, 'left') || H.keyPressed?.('ArrowLeft') || H.keyPressed?.('KeyA'),
      dR: H.kbHit?.(i, 'right') || H.keyPressed?.('ArrowRight') || H.keyPressed?.('KeyD'),
      A: H.kbHit?.(i, 'interact') || H.keyPressed?.('Enter') || H.keyPressed?.('Space'),
      B: H.keyPressed?.('Escape') || H.kbHit?.(i, 'drift'),
    };
    const cur = {
      dU: !!(st && st.dU) || !!kb.dU,
      dD: !!(st && st.dD) || !!kb.dD,
      dL: !!(st && st.dL) || !!kb.dL,
      dR: !!(st && st.dR) || !!kb.dR,
      A: !!(st && st.A) || !!kb.A,
      B: !!(st && st.B) || !!kb.B,
    };
    const pr = prev[i] || {};
    const hit = (k) => cur[k] && !pr[k];
    const n = open.items.length, cols = open.cols || 1;
    if (hit('dU')) { open.idx = (open.idx - cols + n) % n; highlight(); H.beep?.(520, 0.04, 'square', 0.02); }
    if (hit('dD')) { open.idx = (open.idx + cols) % n; highlight(); H.beep?.(520, 0.04, 'square', 0.02); }
    if (hit('dL') && cols > 1) { open.idx = (open.idx - 1 + n) % n; highlight(); }
    if (hit('dR') && cols > 1) { open.idx = (open.idx + 1) % n; highlight(); }
    if (hit('A')) select();
    if (hit('B')) close('cancel');
    prev[i] = cur;
  }

  // estä pelisyöte kun valikko auki (pelaaja owner)
  const _input = H.input.bind(H);
  H.input = function (i) {
    const r = _input(i);
    if (open && open.owner === i) {
      return Object.assign({}, r, { f: 0, turn: 0, jump: false, fire: false, interact: false, eat: false, swap: false, drift: false, run: false });
    }
    return r;
  };

  H.onUpdate(() => { try { tick(); } catch (e) {} });
  H.onStop(() => close('stop'));
  // 3.2: aula (peli ei juokse) – tick rAF:lla, jotta listat toimivat ohjaimella ilman hiirtä
  if (typeof requestAnimationFrame === 'function') {
    const loop = () => {
      if (open && !H.running) { try { tick(); } catch (e) {} }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  H.menuPad = {
    show, close: () => close('api'),
    get open() { return !!open; },
    get owner() { return open ? open.owner : -1; },
    tick,
  };
  H.define?.('menuPad', H.menuPad);
})();
