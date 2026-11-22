// stats.js (1.8) – Pistetaulukon tilastot pelaajan nimen mukaan (localStorage hyyte-stats).
// Kerää: rahat, työt, Haaste-tulokset, Palikkamaa, ruoat, kävely- ja ajomatkat, peliajan.
(function () {
  const H = window.HYYTE;
  const KEY = 'stats', NAMES = 'names';
  const DEF_NAMES = ['Pelaaja 1','Pelaaja 2','Pelaaja 3','Pelaaja 4','Pelaaja 5','Pelaaja 6','Pelaaja 7','Pelaaja 8','Pelaaja 9','Pelaaja 10','Pelaaja 11','Pelaaja 12'];
  const JOBS = { pizza: 'Pizzakuskina', pallo: 'Pallojahdit', post: 'Postikierrokset', fire: 'Palot sammutettu', sheep: 'Lammaskierrokset', trash: 'Roskakierrokset' };
  let db = load(), sess = null, saveT = 0;

  function load() { const d = H.load(KEY, null); return d && typeof d === 'object' && d.players ? d : { v: 1, players: {} }; }
  function store() { H.save(KEY, db); }
  const keyOf = n => String(n || '').trim().toLowerCase().replace(/\s+/g, ' ') || '?';
  function names() { const n = H.load(NAMES, null); return Array.from({length:12},(_,i)=>clean(Array.isArray(n)?n[i]:'')||DEF_NAMES[i%DEF_NAMES.length]); }
  function clean(s) { return String(s ?? '').replace(/[<>&"]/g, '').trim().slice(0, 16); }
  function setName(i, s) { const n = names(); n[i] = clean(s) || DEF_NAMES[i]; H.save(NAMES, n); return n[i]; }
  function blank(name) {
    return { name, games: 0, playSec: 0, earned: 0, spent: 0, bestSession: 0, jobs: {}, jobFail: 0, food: 0, help: 0, walk: 0, drive: 0,
      mine: { broken: 0, placed: 0, ores: 0, sold: 0, pops: 0 },
      kikka: { points: 0, laps: 0, bestLap: 0, bounce: 0, ramp: 0, bestJump: 0, best: 0 }, duel: { games: 0, wins: 0, losses: 0, draws: 0, bestScore: 0, bestRounds: 0, hist: [] }, first: Date.now(), last: Date.now() };
  }
  function rec(name) {
    const k = keyOf(name); let r = db.players[k];
    if (!r) r = db.players[k] = blank(clean(name) || '?');
    // vanhemman muodon täydennys
    const b = blank(r.name); for (const f in b) if (r[f] == null) r[f] = b[f];
    for (const f in b.mine) if (r.mine[f] == null) r.mine[f] = 0;
    for (const f in b.kikka) if (r.kikka[f] == null) r.kikka[f] = 0;
    for (const f in b.duel) if (r.duel[f] == null) r.duel[f] = b.duel[f];
    return r;
  }
  const seat = i => (sess && sess.names[i] != null ? rec(sess.names[i]) : null);

  H.onStart(() => {
    const n = names().slice(0, Math.max(1, H.players.length));
    sess = { names: n, t: 0, earned: n.map(() => 0), kikka: n.map(() => 0), last: n.map(() => null), challenge: !!H.challenge };
    n.forEach(x => { const r = rec(x); r.games++; r.last = Date.now(); r.name = x; });
    store();
  });
  H.onUpdate(dt => {
    if (!sess) return;
    sess.t += dt;
    H.players.forEach((p, i) => {
      const r = seat(i); if (!r) return;
      r.playSec += dt;
      const q = H.posOf(p), L = sess.last[i];
      if (L) { const d = Math.hypot(q.x - L.x, q.z - L.z); if (d < 3) { if (p.car != null) r.drive += d; else if (!p.rocket) r.walk += d; } }
      sess.last[i] = { x: q.x, z: q.z };
    });
    if ((saveT += dt) > 20) { saveT = 0; store(); }
  });
  H.onStop(() => {
    if (!sess) return;
    if (sess.challenge && sess.t >= 30 && H.players.length >= 2) {
      const s = H.players.map(p => p.score | 0), k = H.players.map(p => p.rounds | 0);
      if (s.reduce((a, b) => a + b, 0) > 0) recordDuel(s, k, Date.now());
    }
    sess.names.forEach((x, i) => { const r = rec(x); r.bestSession = Math.max(r.bestSession, sess.earned[i]); r.kikka.best = Math.max(r.kikka.best, sess.kikka[i] || 0); });
    store(); sess = null;
  });
  function recordDuel(s, k, when) {
    const n = sess ? sess.names : names();
    s.forEach((_, i) => {
      // 1.9: vastustaja = paras muista pelaajista
      let o = -1; s.forEach((v, j) => { if (j !== i && (o < 0 || v > s[o])) o = j; });
      const r = rec(n[i]), res = s[i] > s[o] ? 'win' : s[i] < s[o] ? 'loss' : 'draw';
      r.duel.games++; r.duel[res === 'win' ? 'wins' : res === 'loss' ? 'losses' : 'draws']++;
      r.duel.bestScore = Math.max(r.duel.bestScore, s[i]); r.duel.bestRounds = Math.max(r.duel.bestRounds, k[i]);
      r.duel.hist.unshift({ d: when, me: s[i], opp: s[o], rounds: k[i], vs: n[o], res }); r.duel.hist.length = Math.min(r.duel.hist.length, 10);
    });
  }
  H.on('earn', (i, n) => { const r = seat(i); if (!r) return; r.earned += n; sess.earned[i] += n; });
  H.on('spend', (i, n) => { const r = seat(i); if (r) r.spent += n; });
  H.on('job', (i, id) => { const r = seat(i); if (!r) return; r.jobs[id] = (r.jobs[id] || 0) + 1; store(); });
  H.on('jobfail', i => { const r = seat(i); if (r) r.jobFail++; });
  H.on('eat', i => { const r = seat(i); if (r) r.food++; });
  // 1.9: kikkailupisteet (kikka.js): type = 'lap' | 'bounce' | 'ramp', pts, data {sec | count | dist}
  H.on('kikka', (i, type, pts, data = {}) => {
    const r = seat(i); if (!r) return; const k = r.kikka;
    k.points += pts; if (sess) sess.kikka[i] = (sess.kikka[i] || 0) + pts;
    if (type === 'lap') { k.laps++; if (data.sec && (!k.bestLap || data.sec < k.bestLap)) k.bestLap = Math.round(data.sec * 10) / 10; }
    if (type === 'bounce') k.bounce++;
    if (type === 'ramp') { k.ramp++; k.bestJump = Math.max(k.bestJump, Math.round((data.dist || 0) * 10) / 10); }
    store();
  });
  H.on('mine', (i, what, n = 1) => { const r = seat(i); if (r && what in r.mine) r.mine[what] += n; });
  H.on('help', (i, reason, pts = 1) => { const r = seat(i); if (!r) return; r.help = (r.help || 0) + (pts || 1); });


  H.stats = {
    JOBS, names, setName, keyOf,
    all: () => Object.entries(db.players).map(([k, r]) => ({ key: k, ...JSON.parse(JSON.stringify(rec(r.name))) })),
    get: name => JSON.parse(JSON.stringify(rec(typeof name === 'number' ? (sess ? sess.names[name] : names()[name]) : name))),
    remove(key) { delete db.players[key]; store(); },
    jobsTotal: r => Object.values(r.jobs || {}).reduce((a, b) => a + b, 0),
    reload() { db = load(); },
    _recordDuel: recordDuel,
  };
})();
