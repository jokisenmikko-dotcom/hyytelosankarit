// lobby18.js (3.2) – aulan lisäosat + Uutta v3.1 -kortti (ohjaimella suljettava):
//  pelaajien nimet, hatut sankarikuvissa, grafiikka-asetus,
// ohjainten tila ja Pistetaulukko (haitarit, avoimet kohdat muistetaan: localStorage hyyte-enn-auki).
(function () {
  const H = window.HYYTE;
  const OPEN_KEY = 'enn-auki';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('fi-FI');
  const km = m => (m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' km' : Math.round(m) + ' m');
  const dur = s => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${m} min` : m ? `${m} min` : `${s} s`; };
  const date = t => { const d = new Date(t); return `${d.getDate()}.${d.getMonth() + 1}. klo ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };

  // ---------- hatut aulan sankarikuviin ----------
  const HAT_SVG = {
    cap: '<path d="M5 15a10 9 0 0 1 20 0z" fill="#e03131"/><rect x="15" y="13" width="13" height="3" rx="1.5" fill="#c92a2a"/>',
    top: '<rect x="9" y="1" width="12" height="13" fill="#1b1b1f"/><rect x="9" y="10" width="12" height="2" fill="#c92a2a"/><rect x="4" y="13" width="22" height="3" rx="1.5" fill="#1b1b1f"/>',
    witch: '<path d="M15 0 22 14H8z" fill="#5f3dc4"/><rect x="2" y="13" width="26" height="3" rx="1.5" fill="#4c2fa3"/><rect x="9" y="10" width="12" height="2" fill="#fcc419"/>',
    prop: '<path d="M6 15a9 8 0 0 1 18 0z" fill="#1c7ed6"/><path d="M6 15a9 8 0 0 1 9-8v8z" fill="#fcc419"/><rect x="14" y="2" width="2" height="5" fill="#333"/><rect x="5" y="1" width="20" height="2" rx="1" fill="#e03131"/>',
    crown: '<path d="M5 15V5l5 5 5-8 5 8 5-5v10z" fill="#fcc419" stroke="#b08900" stroke-width="1"/><circle cx="15" cy="11" r="1.6" fill="#e03131"/>',
    pipo: '<path d="M6 15a9 10 0 0 1 18 0z" fill="#f06595"/><rect x="5" y="12" width="20" height="4" rx="2" fill="#fff"/><circle cx="15" cy="4" r="3" fill="#fff"/>',
    party: '<path d="M15 0 22 15H8z" fill="#ffd43b"/><path d="M12 6h6l1.5 3h-9zM10 12h10l1 2H9z" fill="#f03e3e"/><circle cx="15" cy="1" r="2" fill="#4dabf7"/>',
    chef: '<circle cx="10" cy="6" r="5" fill="#fff"/><circle cx="20" cy="6" r="5" fill="#fff"/><circle cx="15" cy="4" r="5" fill="#fff"/><rect x="9" y="7" width="12" height="8" fill="#fff" stroke="#dde" stroke-width=".6"/>',
    cowboy: '<path d="M10 13V5q5-3 10 0v8z" fill="#8d5a32"/><path d="M1 13q14 6 28 0v3q-14 4-28 0z" fill="#6b4226"/><rect x="10" y="10" width="10" height="2" fill="#3b2414"/>',
    pirate: '<path d="M2 15q13-16 26 0z" fill="#1b1b1f"/><circle cx="15" cy="10" r="2.2" fill="#fff"/><rect x="3" y="14" width="24" height="2" fill="#fcc419"/>',
    viking: '<path d="M7 16a8 9 0 0 1 16 0z" fill="#adb5bd"/><rect x="6" y="13" width="18" height="3" fill="#868e96"/><path d="M7 12Q1 9 2 2q3 6 7 7zM23 12q6-3 5-10-3 6-7 7z" fill="#fff3d6" stroke="#c9b79c" stroke-width=".6"/>',
  };
  const whoList = n => Array.from({ length: n }, (_, i) => 'p' + (i + 1));
  function decorateHeroes(root, n = 2) {
    whoList(n).forEach((who, i) => {
      let d = null; try { d = H.shop?.data(i); } catch {}
      if (!d) return;
      const col = d.color && H.shop.COLORS.find(c => c.id === d.color);
      root.querySelectorAll(`.pane.${who} .pick[data-kind="hero"]`).forEach(btn => {
        const fig = btn.querySelector('.fig'); if (!fig || !btn.classList.contains('on')) return;
        if (col && col.c != null) { const hex = '#' + col.c.toString(16).padStart(6, '0'); fig.style.setProperty('--body', hex); }
        if (d.hat && HAT_SVG[d.hat]) {
          const s = document.createElement('i'); s.className = 'lhat';
          s.innerHTML = `<svg viewBox="0 0 30 17" width="30" height="17" aria-hidden="true">${HAT_SVG[d.hat]}</svg>`; fig.appendChild(s);
        }
      });
      const pane = root.querySelector(`.pane.${who}`); if (!pane) return;
      const hat = d.hat && H.shop.HATS.find(h => h.id === d.hat), cn = col && col.name;
      if (hat || cn) {
        const p = document.createElement('p'); p.className = 'wear';
        p.textContent = `Kaupasta: ${[hat && '🎩 ' + hat.name, cn && '🎨 ' + cn].filter(Boolean).join(' · ')}`;
        pane.querySelector('h3')?.before(p);
      }
    });
  }

  // ---------- nimet, grafiikka, ohjaimet ----------
  function namesUi(root, rerenderScores, np = 2) {
    const n = H.stats.names();
    whoList(np).forEach((who, i) => {
      const pane = root.querySelector(`.pane.${who}`); if (!pane) return;
      const lab = document.createElement('label'); lab.className = 'nm';
      lab.innerHTML = `<span>Nimi</span><input type="text" maxlength="16" autocomplete="off" spellcheck="false" value="${esc(n[i])}" data-name="${i}" aria-label="Pelaaja ${i + 1}:n nimi">`;
      pane.querySelector('h2').after(lab);
      const inp = lab.querySelector('input');
      const save = () => { inp.value = H.stats.setName(i, inp.value); rerenderScores(); };
      inp.addEventListener('change', save);
      inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      const wkey = (H.keyLabel && H.keyLabel(i, 'wallet')) || (i % 2 ? '-' : 'B');
      const hint = document.createElement('p');
      hint.className = 'wallet-hint';
      hint.textContent = '👛 Lompakko: ' + wkey + '  ·  ohjain: View / Create';
      lab.after(hint);
    });
  }
  function topBar(root) {
    const el = root.querySelector('.lobby18'); if (!el) return;
    const g = H.gfx;
    const hints = {
      ultra: 'Ultra: 2–4× tarkempi – korkeampi resoluutio, 8K-varjot, AA ja pehmeä jälkikäsittely (Ryzen 7940HS / 780M).',
      korkea: 'Korkea: taivas, pilvet, terävät varjot ja paljon hiukkasia.',
      matala: 'Matala: kevyempi vanhoille koneille – ei pilviä, kevyemmät varjot ja vähemmän hiukkasia.',
      mobiili: 'Mobiili: tableteille ja puhelimille – matala kuvapistetiheys, ei varjoja, lyhyempi näköetäisyys, ei otsalamppua.',
    };
    el.innerHTML = `<div class="gfx"><span>Grafiikka:</span>
      <button type="button" class="mode${g === 'ultra' ? ' on' : ''}" data-gfx="ultra">Ultra 🚀</button>
      <button type="button" class="mode${g === 'korkea' ? ' on' : ''}" data-gfx="korkea">Korkea ✨</button>
      <button type="button" class="mode${g === 'mobiili' ? ' on' : ''}" data-gfx="mobiili">Mobiili 📱</button>
      <button type="button" class="mode${g === 'matala' ? ' on' : ''}" data-gfx="matala">Matala ⚡</button></div>
      <p class="pad-status">🎮</p>
      <p class="gfx-hint">${hints[g] || hints.ultra}</p>`;
    el.querySelectorAll('[data-gfx]').forEach(b => b.addEventListener('click', () => { H.gfx = b.dataset.gfx; try { H.save('gfx-manual', true); } catch (e) {} topBar(root); }));
  }

  // ---------- Pistetaulukko ----------
  function openSet() { const a = H.load(OPEN_KEY, []); return new Set(Array.isArray(a) ? a : []); }
  function saveOpen(s) { H.save(OPEN_KEY, [...s].slice(-30)); }
  const row = (k, v) => `<tr><th>${k}</th><td>${v}</td></tr>`;
  function group(id, title, body, open) { return `<details class="enn-ryhma" data-id="${esc(id)}"${open.has(id) ? ' open' : ''}><summary class="enn-otsikko">${title}</summary><div class="enn-sisus">${body}</div></details>`; }
  function playerHtml(r, rank, open) {
    const id = 'p:' + r.key, jobs = H.stats.jobsTotal(r), medal = ['🥇', '🥈', '🥉'][rank] || `${rank + 1}.`;
    const g = k => `${id}:${k}`;
    const jobRows = Object.entries(H.stats.JOBS).map(([k, n]) => row(n, fmt(r.jobs[k] || 0))).join('') + row('Kesken jääneet', fmt(r.jobFail || 0));
    const d = r.duel, hist = d.hist.length
      ? `<ol class="hist">${d.hist.map(h => `<li class="${h.res}"><b>${h.res === 'win' ? 'Voitto' : h.res === 'loss' ? 'Tappio' : 'Tasapeli'}</b> ${h.me}–${h.opp} vs ${esc(h.vs)} · ${h.rounds} kaatoa <small>${date(h.d)}</small></li>`).join('')}</ol>`
      : '<p class="muted">Ei vielä Haaste-pelejä (peli lasketaan, kun se kestää vähintään 30 s ja joku saa pisteitä).</p>';
    return `<details class="enn-pelaaja" data-id="${esc(id)}"${open.has(id) ? ' open' : ''}>
      <summary class="enn-otsikko"><span class="rank">${medal}</span><b class="nimi">${esc(r.name)}</b>
        <span class="chips"><span title="Ansaittu yhteensä">🪙 ${fmt(r.earned)}</span><span title="Työt tehty">💼 ${fmt(jobs)}</span><span title="Auttamispisteet">🤝 ${fmt(r.help || 0)}</span><span title="Haaste-voitot">🏆 ${fmt(d.wins)}</span></span></summary>
      <div class="enn-sisus">
        ${group(g('tyot'), `💼 Työt <small>${fmt(jobs)} tehty</small>`, `<table>${jobRows}</table>`, open)}
        ${group(g('raha'), `🪙 Raha <small>${fmt(r.earned)} ansaittu</small>`, `<table>${row('Ansaittu yhteensä', fmt(r.earned) + ' 🪙')}${row('Käytetty kaupoissa', fmt(r.spent) + ' 🪙')}${row('Paras pelikerta', fmt(r.bestSession) + ' 🪙')}</table>`, open)}
        ${group(g('haaste'), `⚔️ Haaste <small>${d.wins}–${d.losses}–${d.draws}</small>`, `<table>${row('Pelejä', d.games)}${row('Voitot / tappiot / tasapelit', `${d.wins} / ${d.losses} / ${d.draws}`)}${row('Paras pistemäärä', d.bestScore)}${row('Eniten kaatoja', d.bestRounds)}</table><h4>Viimeiset tulokset</h4>${hist}`, open)}
        ${group(g('palikka'), `⛏ Palikkamaa <small>${fmt(r.mine.broken)} rikottu</small>`, `<table>${row('Palikoita rikottu', fmt(r.mine.broken))}${row('Palikoita rakennettu', fmt(r.mine.placed))}${row('Malmeja kaivettu', fmt(r.mine.ores))}${row('Malmeista saatu', fmt(r.mine.sold) + ' 🪙')}${row('Hiipijöitä poksautettu', fmt(r.mine.pops))}</table>`, open)}
        ${group(g('kikka'), `🤸 Kikkailu <small>${fmt(r.kikka?.points || 0)} p</small>`, `<table>${row('Kikkailupisteet yhteensä', fmt(r.kikka?.points || 0))}${row('Kikkailukierroksia', fmt(r.kikka?.laps || 0))}${row('Paras kierrosaika', r.kikka?.bestLap ? String(r.kikka.bestLap).replace('.', ',') + ' s' : '–')}${row('Pomppusarjoja', fmt(r.kikka?.bounce || 0))}${row('Luiskahyppyjä (yli 15 m)', fmt(r.kikka?.ramp || 0))}${row('Pisin hyppy', r.kikka?.bestJump ? String(r.kikka.bestJump).replace('.', ',') + ' m' : '–')}${row('Paras pelikerta', fmt(r.kikka?.best || 0) + ' p')}</table>`, open)}
        ${group(g('muut'), `🚶 Liikkuminen ja muut`, `<table>${row('Pelikertoja', fmt(r.games))}${row('Peliaika', dur(r.playSec))}${row('Käveltyä', km(r.walk))}${row('Ajettua', km(r.drive))}${row('Syötyjä ruokia', fmt(r.food))}${row('Auttamispisteet', fmt(r.help || 0) + ' 🤝')}${row('Viimeksi pelattu', date(r.last))}</table>`, open)}
        <button type="button" class="enn-poista" data-key="${esc(r.key)}">Poista ${esc(r.name)} taulukosta</button>
      </div></details>`;
  }
  function leaders(L) {
    const best = (f, fmtv) => { let b = null; for (const r of L) { const v = f(r); if (v > 0 && (!b || v > b.v)) b = { r, v }; } return b ? `${esc(b.r.name)} <small>${fmtv(b.v)}</small>` : '–'; };
    return `<table class="enn-karki">${row('🪙 Eniten rahaa', best(r => r.earned, v => fmt(v) + ' 🪙'))}${row('💼 Eniten töitä', best(r => H.stats.jobsTotal(r), fmt))}${row('⚔️ Paras Haaste-tulos', best(r => r.duel.bestScore, v => v + ' p'))}${row('🏆 Eniten voittoja', best(r => r.duel.wins, fmt))}${row('⛏ Eniten palikoita', best(r => r.mine.broken + r.mine.placed, fmt))}${row('🤸 Eniten kikkailupisteitä', best(r => r.kikka?.points || 0, v => fmt(v) + ' p'))}${row('🤝 Eniten auttamista', best(r => r.help || 0, fmt))}${row('🛫 Pisin luiskahyppy', best(r => r.kikka?.bestJump || 0, v => String(v).replace('.', ',') + ' m'))}</table>`;
  }
  function scores(root) {
    const el = root.querySelector('.scores'); if (!el || !H.stats) return;
    const open = openSet();
    const L = H.stats.all().sort((a, b) => b.earned - a.earned || H.stats.jobsTotal(b) - H.stats.jobsTotal(a) || b.duel.wins - a.duel.wins);
    const body = L.length
      ? group('karki', '🏅 Kärkipaikat', leaders(L), open) + L.map((r, k) => playerHtml(r, k, open)).join('')
      : '<p class="muted">Taulukko on vielä tyhjä. Kirjoita nimet yllä ja pelaa – tulokset tallentuvat tähän koneelle.</p>';
    el.innerHTML = `<details class="enn-pelaaja enn-paa" data-id="paa"${open.has('paa') || !open.size ? ' open' : ''}><summary class="enn-otsikko"><b class="nimi">🏆 Pistetaulukko</b><span class="chips"><span>${L.length} pelaajaa</span></span></summary><div class="enn-sisus">${body}</div></details>`;
    el.querySelectorAll('details[data-id]').forEach(d => d.addEventListener('toggle', () => {
      const s = openSet(); d.open ? s.add(d.dataset.id) : s.delete(d.dataset.id); if (!s.size && !d.open && d.dataset.id === 'paa') s.add('_'); saveOpen(s);
    }));
    el.querySelectorAll('.enn-poista').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      const r = L.find(x => x.key === b.dataset.key);
      if (r && confirm(`Poistetaanko ${r.name} Pistetaulukosta? Tätä ei voi perua.`)) { H.stats.remove(r.key); scores(root); }
    }));
  }

  // ---------- 1.9: kikkailutehtävät aulassa ----------
  function kikkaLobby(root) {
    const el = root.querySelector('.kikka-lobby'); if (!el) return;
    const T = H.kikka?.TASKS || [];
    const L = (H.stats?.all?.() || []).filter(r => (r.kikka?.points || 0) > 0).sort((a, b) => b.kikka.points - a.kikka.points).slice(0, 6);
    const open = openSet();
    el.innerHTML = `<details data-id="kikka"${open.has('kikka') ? ' open' : ''}><summary>🤸 Kikkailurata – tehtävät ja kikkailupisteet</summary>
      <ul>${T.map(t => `<li><b>${esc(t.name)}</b> – ${esc(t.txt)} <b>${esc(t.pts)}</b></li>`).join('')}</ul>
      <p>Rata on museon takana (laatat, pomppualustat ja silta). Luiska on kaupungin itälaidalla. Pisteet näkyvät myös radan tehtävätaulussa.</p>
      <div>${L.length ? L.map((r, k) => `<span class="kp">${['🥇', '🥈', '🥉'][k] || k + 1 + '.'} ${esc(r.name)} ${fmt(r.kikka.points)} p</span>`).join('') : '<span class="muted">Ei vielä kikkailupisteitä.</span>'}</div></details>`;
    el.querySelector('details').addEventListener('toggle', e => { const s = openSet(); e.target.open ? s.add('kikka') : s.delete('kikka'); saveOpen(s); });
  }

  const COOP_SPOTS = [
    { e: '📦', n: 'Kylän arkku', h: 'Torin laidalla, n. x=8, z=−52. Vie ja ota tavaroita.' },
    { e: '🤝', n: 'Auttamispisteet', h: 'Näkyvät HUD:ssa ja aulan pistetaulussa.' },
    { e: '🍀', n: 'Onnenketju', h: 'Anna kotiruokaa kentän hahmolle – lähin kaveri saa onnea.' },
    { e: '🌱', n: 'Kylän puutarha', h: 'Kotien pohjoispuolella (n. z=−148). Kastele ja korjaa sato.' },
    { e: '🏘️', n: 'Talkoot', h: 'Haravoi lehtiä, luo lumikasoja puutarhan luona tai poimi sieniä.' },
    { e: '🛒', n: 'Toripäivä', h: 'Koju lähellä toria (n. x=−40, z=−28). Täyttäkää ja myykää yhdessä.' },
    { e: '📡', n: 'Pelastuspartio', h: 'Pelastusasema torilla (x=14, z=−52). Auta kaveria kuussa, merellä tai sirkuksessa.' },
    { e: '🎺', n: 'Paraati', h: 'Kylän aukio (x=0, z=−58). Kaksi pelaajaa aloittaa, lopussa konfetit.' },
    { e: '🍲', n: 'Keittiöilta', h: 'Kodin lieden listasta. Vähintään 2 pelaajaa tuo aineksia.' },
    { e: '🎪', n: 'Sirkusshow', h: 'Sirkuksen sisätilan taulu. Trapetsi, kanuuna, valot.' },
    { e: '🏗️', n: 'Rakennustyömaa', h: 'Kaupungin etelälaidalla (x=40, z=−120). Silta, maja, majakka.' },
    { e: '🌙', n: 'Kuun tukikohta', h: 'Lähellä kuun laskualustaa. Kuski, korjaaja, energia.' },
  ];

  function uuttaCard(root) {
    let el = root.querySelector('#uutta-v31');
    if (!el) {
      el = document.createElement('section');
      el.id = 'uutta-v31';
      el.className = 'uutta-v31';
      const hook = root.querySelector('.lobby18') || root.querySelector('.cols') || root.querySelector('.kikka-lobby');
      if (hook) hook.before(el); else root.appendChild(el);
    }
    const dismissed = !!H.load?.('uutta31-dismissed', false);
    el.hidden = !!dismissed;
    el.innerHTML = `<details id="uutta-v31-details" class="uutta-card"${dismissed ? '' : ' open'}>
      <summary>✨ Uutta v3.1 – 12 yhteistyöpaikkaa</summary>
      <p class="uutta-hint">Lyhyet karttavihjeet. Ohjain: B / ○ sulkee kortin. Esc toimii myös.</p>
      <ul class="uutta-list">${COOP_SPOTS.map(s => `<li><b>${s.e} ${esc(s.n)}</b> — ${esc(s.h)}</li>`).join('')}</ul>
      <button type="button" class="uutta-close" data-uutta-close>Sulje (B / Esc)</button>
    </details>`;
    const close = () => {
      el.hidden = true;
      try { H.save?.('uutta31-dismissed', true); } catch (e) {}
    };
    el.querySelector('[data-uutta-close]')?.addEventListener('click', close);
    el._close = close;
    return el;
  }

  function bindUuttaPad(root) {
    if (root._uuttaPad) return;
    root._uuttaPad = true;
    let prevB = false, prevEsc = false;
    const loop = () => {
      const el = root.querySelector('#uutta-v31');
      if (el && !el.hidden) {
        let B = false;
        try {
          const P = window.HYYTE_PAD;
          if (P) {
            const g = P.raw(0) || (P.raw(P.padOf?.(0) ?? 0));
            // raw returns mapped state with drift=B button
            if (g && (g.drift || (g.buttons && g.buttons[P.BUTTONS.B]))) B = true;
            const rawG = typeof navigator !== 'undefined' && navigator.getGamepads && navigator.getGamepads()[0];
            if (!B && P.raw) {
              const st = P.raw(0);
              if (st && st.drift) B = true;
            }
            // direct button 1 (B/○)
            const list = P.list?.() || [];
          }
        } catch (e) {}
        try {
          const P = window.HYYTE_PAD;
          const gpad = P && P.raw(0);
          if (gpad && gpad.drift) B = true;
          // also poll button 1 from stub/raw gamepad
          const L = (typeof navigator !== 'undefined' && navigator.getGamepads) ? Array.from(navigator.getGamepads() || []) : [];
          const g0 = L.find(g => g && g.buttons);
          if (g0 && g0.buttons[1] && (g0.buttons[1].pressed || g0.buttons[1].value > 0.5)) B = true;
        } catch (e) {}
        const esc = !!(window.HYYTE?.keyPressed?.('Escape'));
        if ((B && !prevB) || (esc && !prevEsc)) el._close?.();
        prevB = B; prevEsc = esc;
      }
      requestAnimationFrame(loop);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(loop);
  }


  function releaseNotesCard(root) {
    let el = root.querySelector('#release-notes');
    if (!el) {
      el = document.createElement('section');
      el.id = 'release-notes';
      el.className = 'uutta-v31';
      const hook = root.querySelector('#uutta-v31') || root.querySelector('.lobby18') || root.querySelector('.cols');
      if (hook && hook.parentNode) hook.after(el); else root.appendChild(el);
    }
    el.innerHTML = `<details id="release-notes-details" class="uutta-card">
      <summary>📝 Julkaisutiedot – versio 3.5</summary>
      <p class="uutta-hint">👛 Lompakko: pelaaja 1 = <b>B</b>, pelaaja 2 = <b>-</b>, ohjain = <b>View / Create</b>.</p>
      <pre id="release-notes-body" style="white-space:pre-wrap;max-height:280px;overflow:auto;font-size:13px;margin:8px 0">Ladataan…</pre>
    </details>`;
    const body = el.querySelector('#release-notes-body');
    const show = (txt) => { if (body) body.textContent = txt; };
    const tryFetch = (url) => fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.text(); });
    tryFetch('RELEASE_NOTES.md').catch(() => tryFetch('docs/RELEASE_NOTES.md'))
      .then(show)
      .catch(() => show('Hyytelösankarit 3.4 – julkaisutiedot ovat tiedostossa RELEASE_NOTES.md.'));
    return el;
  }

  function attachLobby(root, opts = {}) {
    if (!root) return;
    const rer = () => scores(root);
    const np = Math.max(1, Math.min(12, opts.players || root.querySelectorAll('.cols .pane').length || 2));
    try { topBar(root); } catch (e) { console.warn(e); }
    try { namesUi(root, rer, np); } catch (e) { console.warn(e); }
    try { decorateHeroes(root, np); } catch (e) { console.warn(e); }
    try { kikkaLobby(root); } catch (e) { console.warn(e); }
    try { scores(root); } catch (e) { console.warn(e); }
    try { uuttaCard(root); bindUuttaPad(root); releaseNotesCard(root); } catch (e) { console.warn(e); }
  }

  H.lobbyExtras = attachLobby;
  H.uutta = {
    spots: COOP_SPOTS,
    isOpen: () => {
      const el = document.querySelector('#uutta-v31');
      return !!(el && !el.hidden);
    },
    close: () => { document.querySelector('#uutta-v31')?._close?.(); },
    show: () => {
      try { H.save?.('uutta31-dismissed', false); } catch (e) {}
      const root = document.querySelector('.lobby');
      if (root) uuttaCard(root);
    },
  };
  H.define?.('lobbyExtras', H.lobbyExtras);
})();
// 3.2: ei oleteta että aula on jo DOM:ssa tai että tämä tiedosto latautuu viimeisenä
(function attachWhenReady() {
  const tryAttach = () => {
    const r = document.querySelector('.lobby');
    if (r && window.HYYTE?.lobbyExtras && !r.querySelector('#uutta-v31')) {
      try { window.HYYTE.lobbyExtras(r); } catch (e) { console.warn(e); }
      return true;
    }
    return false;
  };
  if (tryAttach()) return;
  if (typeof MutationObserver === 'function' && document.documentElement) {
    const mo = new MutationObserver(() => { if (tryAttach()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 15000);
  }
  document.addEventListener('DOMContentLoaded', tryAttach);
})();
