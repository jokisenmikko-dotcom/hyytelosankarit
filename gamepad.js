// gamepad.js (1.9) – 2.6: RT/R2 analog + akseli-triggerit fireen
// gamepad.js (1.9) – peliohjainten tuki Gamepad API:lla (Xbox, PS5 DualSense ja muut "standard"-ohjaimet).
// 1.9: jopa 4 ohjainta. Ohjaimet numeroidaan kytkentäjärjestyksessä (Ohjain 1–4). Aula päättää mikä ohjain
// ohjaa mitäkin pelaajaa (HYYTE_PAD.assign = [ohjain pelaajalle 1, ...]); näppäimistö toimii yhtä aikaa.
// game.js kysyy joka ruudulla HYYTE_PAD.state(pelaaja) ja yhdistää sen näppäimiin.
(function () {
  const DEAD = 0.22;            // tatin kuollut alue
  const MAX = 12;
  const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, START: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15, TOUCHPAD: 17 };
  let pads = Array(MAX).fill(null), frame = -1, prevBtn = Array.from({ length: MAX }, () => ({})), known = new Set();
  let assign = null;                         // pelaaja -> ohjainpaikka (null = vanha tapa: pelaaja i = ohjain i)
  const lastAct = Array(MAX).fill(0), runOn = Array(MAX).fill(false), idleT = Array(MAX).fill(0), lsPrev = Array(MAX).fill(false);
  let lastT = 0;
  const canPoll = typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function';

  let stubPad = null;
  function list() {
    if (stubPad) return [stubPad];
    if (!canPoll) return [];
    let L = [];
    try { L = Array.from(navigator.getGamepads() || []); } catch { return []; }
    return L.filter(g => g && g.connected !== false && g.buttons && g.buttons.length >= 4 && g.axes && g.axes.length >= 2)
      .sort((a, b) => a.index - b.index);
  }
  function makeStub() {
    const buttons = Array.from({ length: 18 }, () => ({ pressed: false, value: 0, touched: false }));
    const axes = [0, 0, 0, 0];
    return {
      id: 'Hyyte Test Pad', index: 0, connected: true, mapping: 'standard',
      buttons, axes, timestamp: 0,
    };
  }
  function setStub(on) {
    if (!on) { stubPad = null; frame = -1; slots = Array(MAX).fill(null); pads = Array(MAX).fill(null); return null; }
    stubPad = makeStub();
    frame = -1;
    slots = Array(MAX).fill(null);
    slots[0] = stubPad.index + ':' + stubPad.id;
    return stubPad;
  }
  function stubButton(i, pressed) {
    if (!stubPad) setStub(true);
    const b = stubPad.buttons[i];
    if (b) { b.pressed = !!pressed; b.value = pressed ? 1 : 0; }
    stubPad.timestamp = (typeof performance !== 'undefined' ? performance.now() : 0);
    frame = -1;
  }
  function stubAxis(i, v) {
    if (!stubPad) setStub(true);
    stubPad.axes[i] = v;
    stubPad.timestamp = (typeof performance !== 'undefined' ? performance.now() : 0);
    frame = -1;
  }
  // Paikat pysyvät: ensimmäinen havaittu ohjain = Ohjain 1 jne. Irrotettu ohjain vapauttaa paikkansa,
  // eikä toisen pelaajan ohjain hyppää sen tilalle kesken pelin.
  let slots = Array(MAX).fill(null);
  const keyOf = g => g.index + ':' + g.id;
  const who = k => { const p = assign ? assign.indexOf(k) : k; return p >= 0 ? ` – Pelaaja ${p + 1}` : ''; };
  function refresh() {
    const f = typeof performance !== 'undefined' ? Math.floor(performance.now() / 4) : 0;  // kerran ~ruudussa
    if (f === frame) return; frame = f;
    const L = list(), by = new Map(L.map(g => [keyOf(g), g]));
    for (let k = 0; k < MAX; k++) if (slots[k] && !by.has(slots[k])) { slots[k] = null; note(`🎮 Ohjain ${k + 1} irrotettu${who(k)}`, true); }
    for (const g of L) {
      const id = keyOf(g); if (slots.includes(id)) continue;
      const k = slots.indexOf(null); if (k < 0) break;
      slots[k] = id; note(`🎮 ${kindName(g.id)} yhdistetty = Ohjain ${k + 1}${who(k)}`);
      prevBtn[k] = { s: btn(g, B.START), v: btn(g, B.VIEW) };   // herätyspainallus ei laukaise mitään
      lsPrev[k] = btn(g, B.LS); runOn[k] = false;
    }
    pads = slots.map(id => (id && by.get(id)) || null);
    known = new Set(by.keys());
  }
  const btn = (g, i) => { const b = g.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
  const val = (g, i) => { const b = g.buttons[i]; return b ? (typeof b.value === 'number' ? b.value : b.pressed ? 1 : 0) : 0; };
  function stick(x, y) {
    x = Number.isFinite(x) ? x : 0; y = Number.isFinite(y) ? y : 0;
    const m = Math.hypot(x, y); if (m < DEAD) return [0, 0];
    const k = Math.min(1, (m - DEAD) / (1 - DEAD)) / m; return [x * k, y * k];
  }
  const curve = v => Math.sign(v) * Math.abs(v) ** 1.4;
  /** Ohjaimen tyyppi tunnisteesta: 'ps' (PS5/PS4), 'xbox' tai 'muu'. */
  function kind(id) {
    id = String(id || '');
    if (/045e|xbox|xinput/i.test(id)) return 'xbox';
    if (/054c|dualsense|dualshock|playstation|wireless controller/i.test(id)) return 'ps';
    return 'muu';
  }
  const kindName = id => ({ ps: 'PS5-ohjain', xbox: 'Xbox-ohjain', muu: 'Peliohjain' })[kind(id)];
  /** Pelaajan ohjainpaikka (tai -1). */
  const padOf = i => assign ? (assign[i] ?? -1) : i;

  /** 2.2: akselien resoluutio – standard mapping + PS5/non-standard Firefox/Chrome-eroavaisuudet. */
  function axesOf(g) {
    const a = g.axes || [];
    const map = (g.mapping || '').toLowerCase();
    // Standard: 0=LX 1=LY 2=RX 3=RY
    if (map === 'standard' && a.length >= 4) return { lx: a[0]||0, ly: a[1]||0, rx: a[2]||0, ry: a[3]||0, mode: 'standard' };
    // DualSense / DualShock non-standard: usein sama 0..3, mutta joissain selaimissa
    // triggers vievät akselit 2/5 ja oikea tatti on 3/4 (Chrome Linux) tai 2/3 OK.
    const isPs = kind(g.id) === 'ps';
    if (isPs && a.length >= 4) {
      // Jos axes[2] näyttää triggeriltä (vain 0..1 ja lepää ~0 tai ~-1), käytä 3/4 oikealle
      const a2 = a[2], a3 = a[3], a4 = a.length > 4 ? a[4] : null, a5 = a.length > 5 ? a[5] : null;
      const looksTrig = (v) => v != null && v >= -1.05 && v <= 1.05 && Math.abs(v) < 0.02 || (v >= 0 && v <= 1 && a.length >= 6);
      // Prefer classic 0,1,2,3 when |a2| and |a3| move like sticks (symmetric around 0)
      if (a.length <= 4 || (Math.abs(a2) > 0.02 && Math.abs(a2) <= 1 && Math.abs(a3) <= 1 && (a4 == null || Math.abs(a4) < 0.02 || a.length === 5))) {
        return { lx: a[0]||0, ly: a[1]||0, rx: a2||0, ry: a3||0, mode: 'ps4' };
      }
      // Chrome DualSense extended: LX LY L2 RX RY R2 → 0,1,3,4 for sticks
      if (a.length >= 5) return { lx: a[0]||0, ly: a[1]||0, rx: a[3]||0, ry: a[4]||0, mode: 'ps-ext' };
    }
    return { lx: a[0]||0, ly: a[1]||0, rx: a[2]||0, ry: a[3]||0, mode: 'fallback' };
  }
  // 2.2: turn-EMA per ohjain – pehmentää merkin vaihtoja
  const turnSm = Array(MAX).fill(0);
  /** Raaka tila ohjainpaikasta k. */
  function raw(k) {
    const g = pads[k]; if (!g) return null;
    const ax = axesOf(g);
    const [lx, ly] = stick(ax.lx, ax.ly);
    const [rx, ry] = stick(ax.rx, ax.ry);
    const dL = btn(g, B.LEFT), dR = btn(g, B.RIGHT);
    // juoksu: vasemman tatin painallus (LS / L3) kytkee päälle ja pois; sammuu itsestään kun tatti on vapaana hetken
    const ls = btn(g, B.LS), now = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
    if (ls && !lsPrev[k]) runOn[k] = !runOn[k];
    lsPrev[k] = ls;
    const mag = Math.hypot(lx, ly);
    if (mag < 0.15 && !ls) { if (!idleT[k]) idleT[k] = now; else if (now - idleT[k] > 1.0) runOn[k] = false; } else idleT[k] = 0;
    // 2.1: PS5 kosketuslevy = standard mapping button 17 (graceful if missing)
    const touch = (g.buttons && g.buttons.length > B.TOUCHPAD) ? btn(g, B.TOUCHPAD) : false;
    return {
      f: -ly, turn: (function(){ let t = curve(-lx) || (dL ? 1 : 0) - (dR ? 1 : 0); if (Math.abs(t)<0.05) t=0; // pehmennä merkin flip
        if (turnSm[k] && t && Math.sign(turnSm[k])!==Math.sign(t) && Math.abs(turnSm[k])>0.2) t = turnSm[k]*0.6;
        turnSm[k] += (t - turnSm[k]) * 0.45; return Math.abs(turnSm[k])<0.04 ? 0 : turnSm[k]; })(),
      jump: btn(g, B.A), drift: btn(g, B.B) || val(g, B.LT) > 0.4,
      interact: btn(g, B.X), eat: btn(g, B.Y), wallet: btn(g, B.VIEW),
      // 2.6: RT/R2 = fire (nappi 7 analog + mahdollinen akseli 2/5 non-standard PS)
      fire: (function(){
        if (val(g, B.RT) > 0.35 || btn(g, B.RT)) return true;
        const a = g.axes || [];
        // jotkin PS-ohjaimet: R2 akselina (0..1 tai -1..1)
        if (a.length >= 6) {
          const r2 = a[5];
          if (typeof r2 === 'number' && (r2 > 0.35 || (r2 + 1) * 0.5 > 0.7)) return true;
        }
        if (a.length >= 3 && kind(g.id) === 'ps') {
          const t = a[2];
          if (typeof t === 'number' && t > 0.55 && t <= 1.01) return true;
        }
        return false;
      })(), swap: btn(g, B.RB), camera: btn(g, B.LB),
      camIn: btn(g, B.UP), camOut: btn(g, B.DOWN),
      camUp: ry > 0.45, camDown: ry < -0.45, orbit: -rx, camReset: btn(g, B.RS),
      run: runOn[k],
      touchpad: touch,
    };
  }
  /** Pelaajan i ohjaimen syöte samassa muodossa kuin game.js readInput, tai null jos ohjainta ei ole. */
  function state(i) {
    refresh();
    const k = padOf(i); if (k < 0 || k >= MAX) return null;
    return raw(k);
  }

  // --- ilmoitus (näkyy myös aulassa) ---
  function note(text, bad) {
    if (typeof document === 'undefined' || !document.body) return;
    const el = document.createElement('div'); el.className = 'pad-note' + (bad ? ' bad' : ''); el.textContent = text;
    document.body.appendChild(el); setTimeout(() => el.remove(), 2600);
  }

  // --- Start/View-napit: valikkoon paluun hyväksyntä ja aulassa pelin aloitus ---
  function menuLoop() {
    refresh();
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    for (let k = 0; k < MAX; k++) {
      const g = pads[k], cur = g ? { s: btn(g, B.START), v: btn(g, B.VIEW) } : {}, pr = prevBtn[k];
      if (g && g.buttons.some((b, n) => n !== B.LS && n !== B.RS && b && (b.pressed || b.value > 0.5))) lastAct[k] = now;
      if (g && Math.hypot(g.axes[0] || 0, g.axes[1] || 0) > 0.6) lastAct[k] = now;
      const hit = n => cur[n] && !pr[n];
      const mc = window.__menuConfirm, go = document.getElementById('go');
      if (hit('s')) {
        if (mc) { const p = assign ? assign.indexOf(k) : k; if (p >= 0) mc.accept(p); }
        else if (go) go.click();
      }
      if (hit('v') && mc) { mc.state().open ? mc.close() : mc.request(null); }
      prevBtn[k] = cur;
    }
    const lob = document.querySelector('.lobby .pad-status');
    if (lob) {
      const t = pads.map((g, k) => g ? `🎮${k + 1} ${kindName(g.id)}` : '').filter(Boolean).join(' · ') || '🎮 Ei ohjainta – kytke Xbox- tai PS5-ohjain ja paina jotain sen nappia';
      if (lob.textContent !== t) lob.textContent = t;
    }
    lastT = now;
    requestAnimationFrame(menuLoop);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('gamepadconnected', () => { frame = -1; refresh(); });
    window.addEventListener('gamepaddisconnected', () => { frame = -1; refresh(); });
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(menuLoop);
  }
  // napin nimi ohjaintyypin mukaan (PS5: ✕ ○ □ △ L1 R1 L2 R2 L3)
  const NAMES = {
    xbox: { up: 'Tatti ↑', down: 'Tatti ↓', camIn: 'Risti ↑', camOut: 'Risti ↓', camUp: 'O-tatti ↑', camDown: 'O-tatti ↓', jump: 'A', drift: 'B', interact: 'X', eat: 'Y', fire: 'RT', swap: 'RB', camera: 'LB', run: 'LS', start: 'Start', view: 'View', wallet: 'View', touchpad: 'Touchpad' },
    ps: { up: 'Tatti ↑', down: 'Tatti ↓', camIn: 'Risti ↑', camOut: 'Risti ↓', camUp: 'O-tatti ↑', camDown: 'O-tatti ↓', jump: '✕', drift: '○', interact: '□', eat: '△', fire: 'R2', swap: 'R1', camera: 'L1', run: 'L3', start: 'Options', view: 'Create', wallet: 'Create', touchpad: 'Kosketuslevy' },
  };
  function label(k, action) { const g = pads[k]; const n = NAMES[g && kind(g.id) === 'ps' ? 'ps' : 'xbox']; return n[action] || action; }
  window.HYYTE_PAD = {
    state, raw: k => (refresh(), raw(k)), MAX,
    connected: i => (refresh(), padOf(i) >= 0 && !!pads[padOf(i)]),
    list: () => (refresh(), pads.map(g => g && g.id)),
    pads: () => (refresh(), pads.map((g, k) => g ? { slot: k, id: g.id, kind: kind(g.id), name: kindName(g.id), active: now() - lastAct[k] < 350 } : null)),
    set assign(a) { assign = Array.isArray(a) ? a.slice() : null; },
    get assign() { return assign ? assign.slice() : null; },
    padOf, kind, kindName, label, axesOf, _dead: DEAD, BUTTONS: B,
    _setStub: setStub, _stubButton: stubButton, _stubAxis: stubAxis,
  };
  function now() { return typeof performance !== 'undefined' ? performance.now() : 0; }
})();
