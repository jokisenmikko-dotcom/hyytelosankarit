// kikka.js (1.9) – Kikkailurata-tehtävät ja kikkailupisteet.
// Tehtävät (pelaajakohtaiset, toistettavat):
//  • Kikkailukierros: astu laatoille z=62 → 74 → 86 ja juokse sillan päähän (z>150) 90 s sisällä: +5 (alle 45 s: +6)
//  • Pomppusarja: 6 eri pomppualustaa 60 s sisällä: +4
//  • Kaikki alustat: jokainen pomppualusta saman pelin aikana: +8 (kerran per peli)
//  • Luiskahyppy: auton hyppy yli 8 m: +3 (yli 15 m: +5)  [2.0]
// Pisteet: H.kikka.points(i) (tämä peli); kokonaissummat tallentaa stats.js ('kikka'-tapahtuma).
(function () {
  const H = window.HYYTE;
  const TILES = [62, 74, 86];
  const TASKS = [
    { id: 'lap', name: 'Kikkailukierros', txt: 'Laatat 1→2→3 ja sillan päähän 90 s:ssa', pts: '+5 (alle 45 s +6)' },
    { id: 'bounce', name: 'Pomppusarja', txt: '6 eri pomppualustaa minuutissa', pts: '+4' },
    { id: 'all', name: 'Kaikki alustat', txt: 'Jokainen pomppualusta saman pelin aikana', pts: '+8' },
    { id: 'ramp', name: 'Luiskahyppy', txt: 'Hyppää autolla luiskasta yli 8 m', pts: '+3 (yli 15 m +5)' },
  ];
  let st = [], board = null, drawT = 0, active = false;
  const fresh = () => ({ points: 0, stage: 0, t0: 0, pads: new Map(), allSet: new Set(), allDone: false, last: '' });

  function award(i, type, pts, data, msg) {
    const s = st[i]; if (!s) return;
    s.points += pts; s.last = msg;
    H.toast(i, `⭐ ${msg} +${pts} kikkailupistettä!`);
    H.beep(880, 0.12, 'triangle', 0.06); setTimeout(() => H.beep(1320, 0.14, 'triangle', 0.05), 110);
    H.emit('kikka', i, type, pts, data || {});
    drawT = 0;
  }

  function makeBoard() {
    const T = H.THREE; if (!T) return null;
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 768;
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
    const g = new T.Group();
    const face = new T.Mesh(new T.PlaneGeometry(3.8, 2.85), new T.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
    face.position.set(0, 2.25, -0.07); face.rotation.y = Math.PI; g.add(face);
    const back = new T.Mesh(new T.BoxGeometry(4.0, 3.05, 0.1), new T.MeshStandardMaterial({ color: '#2b3340', roughness: 0.8 }));
    back.position.set(0, 2.25, 0); g.add(back);
    for (const x of [-1.7, 1.7]) {
      const p = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.8, 8), new T.MeshStandardMaterial({ color: '#6b4a2b' }));
      p.position.set(x, 0.4, 0); g.add(p);
    }
    H.addObject(g, -6.4, 0, 92.6);
    H.obstacle(-7.6, 92.6, 0.5); H.obstacle(-5.2, 92.6, 0.5);
    return { cv, ctx: cv.getContext('2d'), tex, g };
  }
  function draw() {
    if (!board) return;
    const c = board.ctx, W = 1024;
    c.fillStyle = '#102430'; c.fillRect(0, 0, W, 768);
    c.fillStyle = '#f6c445'; c.fillRect(0, 0, W, 104);
    c.fillStyle = '#102430'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '800 64px sans-serif';
    c.fillText('KIKKAILUTEHTÄVÄT', W / 2, 56);
    c.textAlign = 'left';
    TASKS.forEach((t, k) => {
      const y = 150 + k * 92;
      c.fillStyle = '#ffffff'; c.font = '800 40px sans-serif'; c.fillText(t.name, 30, y);
      c.fillStyle = '#ffe066'; c.textAlign = 'right'; c.fillText(t.pts, W - 30, y); c.textAlign = 'left';
      c.fillStyle = '#a5d8ff'; c.font = '600 30px sans-serif'; c.fillText(t.txt, 30, y + 38);
    });
    c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(20, 520, W - 40, 4);
    const n = H.players.length, names = H.stats?.names?.() || [];
    H.players.forEach((p, i) => {
      const s = st[i]; if (!s) return;
      const colW = (W - 40) / n, x = 20 + colW * i + colW / 2;
      c.textAlign = 'center';
      c.fillStyle = H.PLAYER_COLORS[i]; c.font = `800 ${n > 2 ? 34 : 42}px sans-serif`;
      c.fillText(String(names[i] || `Pelaaja ${i + 1}`).slice(0, 12), x, 570);
      c.font = '800 84px sans-serif'; c.fillText(`${s.points}`, x, 660);
      c.fillStyle = '#d0ebff'; c.font = '600 26px sans-serif';
      c.fillText(s.stage ? `kierros: laatta ${s.stage}/3` : 'kikkailupistettä', x, 728);
    });
    board.tex.needsUpdate = true;
  }

  H.onStart(() => {
    st = H.players.map(fresh); active = true; drawT = 0;
    try { board = makeBoard(); } catch (e) { board = null; }
  });
  H.onStop(() => { active = false; board = null; });

  H.on('bounce', (i, idx) => {
    const s = st[i]; if (!active || !s) return;
    const now = H.time;
    s.pads.set(idx, now);
    for (const [k, t] of s.pads) if (now - t > 60) s.pads.delete(k);
    if (s.pads.size >= 6) { s.pads.clear(); award(i, 'bounce', 4, { count: 6 }, 'Pomppusarja'); }
    s.allSet.add(idx);
    const total = H.game?.course?.pads?.length || 0;
    if (!s.allDone && total && s.allSet.size >= total) { s.allDone = true; award(i, 'bounce', 8, { count: total }, 'Kaikki alustat'); }
  });
  H.on('rampJump', (i, dist) => {
    if (!active || !st[i] || !(dist > 8)) return;
    award(i, 'ramp', dist > 15 ? 5 : 3, { dist }, `Luiskahyppy ${dist.toFixed(1)} m`);
  });

  H.onUpdate(dt => {
    if (!active) return;
    H.players.forEach((p, i) => {
      const s = st[i]; if (!s || p.car != null) return;
      const x = p.pos.x, z = p.pos.z, now = H.time;
      if (s.stage > 0 && now - s.t0 > 90) { s.stage = 0; H.toast(i, 'Kikkailukierroksen aika loppui – aloita laatalta 1.', true); drawT = 0; }
      if (s.stage < 3) {
        const tz = TILES[s.stage];
        if (Math.abs(x) < 3.6 && Math.abs(z - tz) < 2.2) {
          if (s.stage === 0) s.t0 = now;
          s.stage++; drawT = 0;
          H.toast(i, s.stage < 3 ? `Laatta ${s.stage}/3 ✔` : 'Laatat ✔ – juokse sillan päähän!');
          H.beep(520 + s.stage * 120, 0.08, 'sine', 0.05);
        }
      } else if (z > 150 && Math.abs(x) < 6) {
        const sec = now - s.t0; s.stage = 0;
        award(i, 'lap', sec < 45 ? 6 : 5, { sec }, `Kikkailukierros ${sec.toFixed(1)} s`);
      }
    });
    if ((drawT -= dt) <= 0) { drawT = 0.5; draw(); }
  });

  H.kikka = {
    TASKS,
    points: i => st[i]?.points || 0,
    state: i => st[i] && { points: st[i].points, stage: st[i].stage, pads: st[i].pads.size, all: st[i].allSet.size },
    _award: award,
  };
})();
