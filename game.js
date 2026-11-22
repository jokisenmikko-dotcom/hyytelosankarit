// Hyytelösankarit – pelikoodi (purettu 1.5.0-bundlesta, nimetty uudelleen 1.6-dev)
// Three.js-luokat tulevat vendor/three-r186.js:stä (window.THREE_R186).
(function () {
  const {
    RepeatWrapping,
    SRGBColorSpace,
    Vector3,
    Group,
    Color,
    Fog,
    Scene,
    BufferAttribute,
    BufferGeometry,
    SpriteMaterial,
    Sprite,
    Mesh,
    PointsMaterial,
    Points,
    CanvasTexture,
    BoxGeometry,
    CapsuleGeometry,
    CircleGeometry,
    CylinderGeometry,
    ConeGeometry,
    Path,
    Shape,
    ExtrudeGeometry,
    OctahedronGeometry,
    PlaneGeometry,
    ShapeGeometry,
    SphereGeometry,
    TorusGeometry,
    MeshStandardMaterial,
    TextureLoader,
    HemisphereLight,
    PerspectiveCamera,
    PointLight,
    DirectionalLight,
    Timer,
    WebGLRenderer,
  } = window.THREE_R186;
  let HEROES = [
      {
        id: `ninja`,
        name: `Ninja`,
        blurb: `Musta huppu`,
        body: `#1c1c1c`,
        accent: `#e74c3c`,
      },
      {
        id: `knight`,
        name: `Ritari`,
        blurb: `Kypärä ja kilpi`,
        body: `#c5ccd6`,
        accent: `#f1c40f`,
      },
      {
        id: `cat`,
        name: `Kissa`,
        blurb: `Korvat ja häntä`,
        body: `#f39c12`,
        accent: `#fff3d6`,
      },
      {
        id: `dog`,
        name: `Koira`,
        blurb: `Korvat ja kuono`,
        body: `#c4a574`,
        accent: `#5d4037`,
      },
      {
        id: `bat`,
        name: `Yösiipi`,
        blurb: `Lepakkoviitta`,
        body: `#12141a`,
        accent: `#f6c445`,
      },
      {
        id: `cape`,
        name: `Viittakoira`,
        blurb: `Supersankarikoiran viitta`,
        body: `#e67e22`,
        accent: `#3498db`,
      },
      {
        id: `mask`,
        name: `Purppuranaamio`,
        blurb: `Naamio ja purppura`,
        body: `#6c3483`,
        accent: `#111111`,
      },
    ],
    WEAPONS = [
      {
        id: `shield`,
        name: `Kilpi`,
        blurb: `Torjuu ja tönäisee`,
      },
      {
        id: `bow`,
        name: `Jousi`,
        blurb: `Nuoli lentää kaarella`,
      },
      {
        id: `pistol`,
        name: `Pistooli`,
        blurb: `Nopea yksittäinen`,
      },
      {
        id: `shotgun`,
        name: `Haulikko`,
        blurb: `Viuhka kuulia`,
      },
      {
        id: `axe`,
        name: `Kirves`,
        blurb: `Lyhyt isku`,
      },
      {
        id: `minigun`,
        name: `Minigun`,
        blurb: `Pidä pohjassa`,
      },
      {
        id: `rifle`,
        name: `Kivääri`,
        blurb: `Suora luoti`,
      },
      {
        id: `scope`,
        name: `Tähtäinkivääri`,
        blurb: `Zoomaa ammuttaessa`,
      },
      {
        id: `boomerang`,
        name: `Tulibumerangi`,
        blurb: `Syttyy ja palaa`,
      },
      {
        id: `star`,
        name: `Tulitähti`,
        blurb: `Palava ninjatähti`,
      },
      {
        id: `lighter`,
        name: `Sytkäri`,
        blurb: `Lyhyt liekki`,
      },
      {
        id: `ball`,
        name: `Rantapallo`,
        blurb: `Iso, värikäs ja pomppii`,
      },
      {
        id: `katana`,
        name: `Katana`,
        blurb: `Pitkä viilto`,
      },
      {
        id: `slime`,
        name: `Limapyssy`,
        blurb: `Kolmen metrin möhkäle, hidastaa 4 s`,
      },
      {
        id: `rocket`,
        name: `Ilotuliteraketti`,
        blurb: `Paukahtaa värikkäästi`,
      },
      {
        id: `banana`,
        name: `Banaaninkuori`,
        blurb: `Pyöräyttää auton`,
      },
      {
        id: `wrench`,
        name: `Jakoavain`,
        blurb: `Korjaa terveyden noin 10 sekunnissa`,
      },
      {
        id: `oil`,
        name: `Öljyläikkä`,
        blurb: `Auto liukuu ja pyörii`,
      },
      {
        id: `can`,
        name: `Kanisteri`,
        blurb: `Autolle 2 s typpivauhti, sitten 10 s tauko`,
      },
      {
        id: `spikes`,
        name: `Naulat`,
        blurb: `Hidastaa auton`,
      },
      {
        id: `laser`,
        name: `Laser`,
        blurb: `Punainen 20 m säde lentää 60 km/h`,
      },
      {
        id: `boost`,
        name: `Vauhtilätäkkö`,
        blurb: `Eteen sininen lätäkkö: 1,5–2× vauhti, katoaa 30 s päästä`,
      },
      {
        id: `plasma`,
        name: `Plasmapallo`,
        blurb: `Hyytelöinen plasma-kupla – pehmeä paukahdus`,
      },
      {
        id: `gravity`,
        name: `Vetovoima`,
        blurb: `Vetää lähellä olevia leluja ja autoja`,
      },
      {
        id: `freeze`,
        name: `Jääsäde`,
        blurb: `Jäähyytelö hidastaa vastustajaa`,
      },
      {
        id: `tether`,
        name: `Kuuturva`,
        blurb: `Kuussa: köysi vetää takaisin alas jos hyppäsit liian korkealle`,
      },
      { id: `floatgun`, name: `Painovoima-ase`, blurb: `Kohde leijuu 10 s` },
      { id: `blind`, name: `Sokeus-ase`, blurb: `Näky sumenee hetkeksi` },
      { id: `shrink`, name: `Kutistus-sade`, blurb: `Kohde kutistuu 8 s` },
      { id: `bubble`, name: `Kupla-ansa`, blurb: `Kupla lukitsee 6 s` },
      { id: `swapgun`, name: `Vaihtosäde`, blurb: `Vaihtaa paikkoja kohteen kanssa` },
      { id: `slowmo`, name: `Hidastusaika`, blurb: `Kaikki hidastuu 5 s` },
      { id: `jelly`, name: `Hyytelöliima`, blurb: `Liimaa jalat 7 s` },
      { id: `magnet`, name: `Magneetti`, blurb: `Vetää kohteen luoksesi` },
      { id: `tornado`, name: `Pikkupyörre`, blurb: `Pyörittää kohdetta 5 s` },
      { id: `reverse`, name: `Kääntöohjaus`, blurb: `Kääntää ohjaimet 8 s` },
      { id: `sheepgun`, name: `Lammasase`, blurb: `Pomppiva lammas (20 laukausta, täydennä farmilla)` },
      { id: `mirror`, name: `Peili`, blurb: `Katso itseäsi + heijasta lasersäteet` },
      { id: `teleport`, name: `Teleportti`, blurb: `Hyppää ~30 m eteen (toimii autossa)` },
      { id: `blaster`, name: `Plasmapyssy`, blurb: `Tulevaisuuden salamapallo` },
      { id: `railgun`, name: `Raidetykki`, blurb: `Läpäisevä energiavarsi` },
      { id: `hypermag`, name: `Hypermagneetti`, blurb: `Vetää mitä tahansa irtoesinettä` },
    ],
    Sl = 2.2,
    Cl = 2.6,
    wl = 52.5,
    Tl = 4.6,
    El = 3.85,
    Dl = 1.06,
    Ol = 5.49,
    kl = -1.2,
    Al = 2.35,
    PORTALS = [
      {
        x: -78,
        z: 27,
        yaw: -Math.PI / 2,
        color: `#3aa0ff`,
        label: `1 → 2`,
      },
      {
        x: 90,
        z: -45,
        yaw: Math.PI / 2,
        color: `#ff5a36`,
        label: `2 → 3`,
      },
      {
        x: 42,
        z: 78,
        yaw: Math.PI,
        color: `#c77dff`,
        label: `3 → 1`,
      },
    ];
  function Ml(e, t) {
    if (Math.abs(t) > Tl || e < 40 || e > wl) return 0;
    let n = (e - 40) / Math.max(0.1, wl - 40);
    return Math.pow(n, 2.35) * El;
  }
  // 1.9: luiska on kiinteä muualta kuin ajosuunnasta (-x reuna x=40) tultaessa.
  function rampIn(x, z) {
    return x > 40 && x < wl + 0.25 && Math.abs(z) < Tl + 0.25;
  }
  function rampBlock(ox, oz, nx, nz, y) {
    return rampIn(nx, nz) && !rampIn(ox, oz) && Ml(Math.min(nx, wl), nz * 0) > Math.max(0.5, y + 0.45);
  }
  function Nl(e) {
    let t = 2425,
      n = (40 + wl) / 2,
      r = new Float32Array(t * 2 * 3),
      i = new Float32Array(t * 2 * 2);
    for (let e = 0; e < 25; e++)
      for (let a = 0; a < 97; a++) {
        let o = a / 96,
          s = e / 24,
          c = -(wl - 40) / 2 + o * (wl - 40),
          l = -Tl + s * Tl * 2,
          u = Ml(n + c, 0) + 0.05,
          d = e * 97 + a;
        ((r[d * 3] = c),
          (r[d * 3 + 1] = u),
          (r[d * 3 + 2] = l),
          (i[d * 2] = o),
          (i[d * 2 + 1] = s));
        let f = t + d;
        ((r[f * 3] = c),
          (r[f * 3 + 1] = 0.02),
          (r[f * 3 + 2] = l),
          (i[f * 2] = 0.01),
          (i[f * 2 + 1] = 0.5));
      }
    let a = [],
      o = (e, n) => {
        a.push(e, n, t + e, n, t + n, t + e);
      };
    for (let e = 0; e < 24; e++)
      for (let n = 0; n < 96; n++) {
        let r = e * 97 + n,
          i = r + 1,
          o = r + 97,
          s = o + 1;
        (a.push(r, o, i, i, o, s), a.push(t + r, t + i, t + o, t + i, t + s, t + o));
      }
    for (let e = 0; e < 96; e++) {
      o(e + 1, e);
      let t = 2328 + e;
      o(t, t + 1);
    }
    for (let e = 0; e < 24; e++) {
      let t = e * 97;
      o(t, t + 97);
      let n = e * 97 + 96;
      o(n + 97, n);
    }
    let s = new BufferGeometry();
    (s.setAttribute(`position`, new BufferAttribute(r, 3)),
      s.setAttribute(`uv`, new BufferAttribute(i, 2)),
      s.setIndex(a),
      s.computeVertexNormals());
    let c = new Mesh(s, e);
    return (c.position.set(n, 0, 0), (c.castShadow = !0), (c.receiveShadow = !0), c);
  }
  function Pl(e, t) {
    return Math.abs(e) <= 18
      ? Math.min(Math.abs(t - 16), Math.abs(t + 16))
      : Math.abs(Math.hypot(e - (e < 0 ? -18 : 18), t) - 16);
  }
  function dirVectors(e) {
    return {
      fx: -Math.sin(e),
      fz: -Math.cos(e),
      rx: Math.cos(e),
      rz: -Math.sin(e),
    };
  }
  function mat(e, t) {
    return new MeshStandardMaterial({
      color: e,
      roughness: 0.55,
      metalness: 0.05,
      ...t,
    });
  }
  function addMesh(e, t, n, r, i, a) {
    let o = new Mesh(t, n);
    return (o.position.set(r, i, a), (o.castShadow = !0), e.add(o), o);
  }
  function segs(e, t) {
    return Math.min(t, Math.max(12, Math.round(e * 4)));
  }
  function cylinderGeo(e, t, n, r = 8, i = 1) {
    return new CylinderGeometry(e, t, n, segs(r, 48), Math.max(1, i));
  }
  function sphereGeo(e, t = 12, n = 8, r, i, a, o) {
    return new SphereGeometry(e, segs(t, 48), segs(n, 36), r, i, a, o);
  }
  function coneGeo(e, t, n = 8) {
    return new ConeGeometry(e, t, segs(n, 32));
  }
  function torusGeo(e, t, n = 8, r = 12, i) {
    return new TorusGeometry(e, t, Math.min(28, Math.round(n * 3)), segs(r, 56), i);
  }
  function capsuleGeo(e, t, n = 8, r = 16) {
    return new CapsuleGeometry(e, t, Math.min(24, n * 2), segs(r, 40));
  }
  function circleGeo(e, t = 16) {
    return new CircleGeometry(e, segs(t, 64));
  }
  function buildHeroModel(e) {
    let t = new Group(),
      [n, r] = {
        ninja: [`#1c1c1c`, `#e74c3c`],
        knight: [`#c5ccd6`, `#f1c40f`],
        cat: [`#f39c12`, `#fff3d6`],
        dog: [`#c4a574`, `#5d4037`],
        bat: [`#12141a`, `#f6c445`],
        cape: [`#e67e22`, `#3498db`],
        mask: [`#6c3483`, `#111111`],
      }[e],
      i = mat(n),
      a = mat(r),
      o = mat(e === `ninja` || e === `bat` || e === `mask` ? `#f1c7a3` : n);
    addMesh(t, capsuleGeo(0.32, 0.55, 10, 20), i, 0, 0.85, 0);
    let s = addMesh(t, sphereGeo(0.26, 32, 24), o, 0, 1.48, 0),
      c = mat(`#111`);
    if (
      (addMesh(s, sphereGeo(0.05, 12, 10), c, -0.08, 0.04, 0.2),
      addMesh(s, sphereGeo(0.05, 12, 10), c, 0.08, 0.04, 0.2),
      e === `ninja` && addMesh(t, new BoxGeometry(0.5, 0.12, 0.08), a, 0, 1.5, 0.22),
      e === `knight` &&
        (addMesh(
          t,
          new BoxGeometry(0.46, 0.28, 0.46),
          mat(`#9aa3b2`, {
            metalness: 0.4,
          }),
          0,
          1.62,
          0,
        ),
        addMesh(t, new BoxGeometry(0.08, 0.34, 0.08), a, 0, 1.9, 0)),
      e === `cat` || e === `dog` || e === `cape`)
    ) {
      let e = coneGeo(0.09, 0.22, 6);
      (addMesh(t, e, a, -0.12, 1.72, 0),
        addMesh(t, e, a, 0.12, 1.72, 0),
        addMesh(s, sphereGeo(0.09, 8, 8), a, 0, -0.04, 0.2));
      let n = addMesh(t, cylinderGeo(0.05, 0.05, 0.55, 6), a, 0, 0.9, -0.35);
      n.rotation.x = 0.8;
    }
    if (
      (e === `cape` && addMesh(t, coneGeo(0.18, 0.32, 8), mat(`#3498db`), 0, 1.9, 0),
      e === `bat` || e === `cape` || e === `mask`)
    ) {
      let e = addMesh(t, new BoxGeometry(0.7, 0.7, 0.06), a, 0, 1.05, -0.22);
      e.rotation.x = 0.15;
    }
    return (
      e === `bat` &&
        (addMesh(t, coneGeo(0.08, 0.22, 5), a, -0.14, 1.74, 0),
        addMesh(t, coneGeo(0.08, 0.22, 5), a, 0.14, 1.74, 0),
        addMesh(t, new OctahedronGeometry(0.09), a, 0, 1.02, 0.28)),
      e === `mask` &&
        (addMesh(t, new BoxGeometry(0.38, 0.12, 0.08), mat(`#111`), 0, 1.5, 0.22),
        addMesh(t, new BoxGeometry(0.09, 0.045, 0.03), mat(`#f4efe6`), -0.09, 1.5, 0.27),
        addMesh(t, new BoxGeometry(0.09, 0.045, 0.03), mat(`#f4efe6`), 0.09, 1.5, 0.27)),
      t.traverse((e) => {
        e instanceof Mesh && (e.castShadow = !0);
      }),
      t
    );
  }
  function buildWeaponModel(e) {
    let t = new Group(),
      n = mat(`#222`),
      r = mat(`#8d5a32`),
      i = mat(`#d0d4dc`, {
        metalness: 0.5,
        roughness: 0.3,
      });
    if (
      (e === `shield` &&
        (addMesh(t, cylinderGeo(0.28, 0.28, 0.06, 12), i, 0, 0, 0).rotation.x = Math.PI / 2),
      e === `bow` && addMesh(t, torusGeo(0.22, 0.03, 6, 12, Math.PI), r, 0, 0, 0),
      e === `pistol` || e === `rifle` || e === `scope` || e === `shotgun` || e === `minigun`)
    ) {
      let r = e === `pistol` ? 0.28 : e === `shotgun` || e === `scope` ? 0.7 : 0.55;
      if (
        (addMesh(t, new BoxGeometry(0.08, 0.08, r), n, 0, 0, r / 2),
        e === `scope` &&
          (addMesh(t, cylinderGeo(0.04, 0.04, 0.16, 8), i, 0, 0.1, 0.3).rotation.x = Math.PI / 2),
        e === `minigun`)
      )
        for (let e = 0; e < 4; e++) {
          let r = addMesh(
            t,
            cylinderGeo(0.02, 0.02, 0.4, 6),
            n,
            Math.cos(e) * 0.05,
            Math.sin(e) * 0.05,
            0.3,
          );
          r.rotation.x = Math.PI / 2;
        }
    }
    if (
      (e === `axe` &&
        (addMesh(t, cylinderGeo(0.03, 0.03, 0.55, 6), r, 0, 0, 0),
        addMesh(t, new BoxGeometry(0.22, 0.16, 0.04), i, 0.1, 0.22, 0)),
      e === `boomerang` &&
        addMesh(
          t,
          torusGeo(0.16, 0.035, 6, 10, Math.PI),
          mat(`#e67e22`, {
            emissive: `#ff6a00`,
            emissiveIntensity: 0.4,
          }),
          0,
          0,
          0,
        ),
      e === `star` &&
        addMesh(
          t,
          new OctahedronGeometry(0.12),
          mat(`#f1c40f`, {
            emissive: `#ff4500`,
            emissiveIntensity: 0.5,
          }),
          0,
          0,
          0,
        ),
      e === `lighter` && addMesh(t, new BoxGeometry(0.08, 0.16, 0.05), i, 0, 0, 0),
      e === `ball` &&
        addMesh(
          t,
          sphereGeo(0.16, 12, 10),
          mat(`#ff3b30`, {
            emissive: `#ff9f0a`,
            emissiveIntensity: 0.35,
          }),
          0,
          0,
          0,
        ),
      e === `katana` &&
        (addMesh(t, cylinderGeo(0.035, 0.04, 0.22, 6), mat(`#5c3317`), 0, -0.02, 0),
        addMesh(
          t,
          new BoxGeometry(0.16, 0.045, 0.05),
          mat(`#f6c445`, {
            metalness: 0.4,
          }),
          0,
          0.1,
          0,
        ),
        addMesh(
          t,
          new BoxGeometry(0.04, 0.78, 0.012),
          mat(`#e7eef8`, {
            metalness: 0.72,
            roughness: 0.18,
            emissive: `#b9d7ff`,
            emissiveIntensity: 0.2,
          }),
          0,
          0.5,
          0,
        )),
      e === `slime` &&
        addMesh(
          t,
          sphereGeo(0.18, 10, 8),
          mat(`#39d353`, {
            emissive: `#1faa3a`,
            emissiveIntensity: 0.35,
          }),
          0,
          0,
          0,
        ),
      e === `rocket` &&
        (addMesh(t, new BoxGeometry(0.1, 0.1, 0.48), mat(`#ff5a36`), 0, 0, 0.2),
        (addMesh(t, coneGeo(0.08, 0.16, 6), mat(`#f6c445`), 0, 0, 0.5).rotation.x = Math.PI / 2)),
      e === `banana` && addMesh(t, torusGeo(0.12, 0.04, 6, 10, Math.PI), mat(`#ffe14a`), 0, 0, 0),
      e === `wrench`)
    ) {
      let e = mat(`#f4f7fb`, {
        metalness: 0.9,
        roughness: 0.16,
      });
      addMesh(t, cylinderGeo(0.034, 0.04, 0.92, 20), e, 0, 0.02, 0);
      let n = addMesh(t, torusGeo(0.11, 0.03, 14, 28), e, 0, -0.52, 0);
      ((n.rotation.x = Math.PI / 2),
        addMesh(t, new BoxGeometry(0.2, 0.07, 0.055), e, 0, 0.5, 0),
        addMesh(t, new BoxGeometry(0.055, 0.34, 0.055), e, -0.11, 0.68, 0),
        addMesh(t, new BoxGeometry(0.055, 0.34, 0.055), e, 0.11, 0.68, 0),
        addMesh(t, new BoxGeometry(0.08, 0.05, 0.055), e, -0.08, 0.86, 0),
        addMesh(t, new BoxGeometry(0.08, 0.05, 0.055), e, 0.08, 0.86, 0),
        t.scale.setScalar(2.05 * 0.7));
    }
    if (
      (e === `oil` &&
        addMesh(
          t,
          cylinderGeo(0.1, 0.12, 0.22, 16),
          mat(`#1a1c22`, {
            metalness: 0.4,
          }),
          0,
          0,
          0,
        ),
      e === `can`)
    ) {
      let e = mat(`#3ddc6a`, {
          roughness: 0.42,
          metalness: 0.28,
          emissive: `#1faa3a`,
          emissiveIntensity: 0.45,
        }),
        n = mat(`#e7eef6`, {
          metalness: 0.78,
          roughness: 0.2,
        }),
        r = mat(`#1b4332`, {
          roughness: 0.5,
        }),
        i = addMesh(t, new BoxGeometry(0.34, 0.42, 0.22), e, 0, 0, 0);
      ((i.userData.canBody = !0),
        addMesh(t, new BoxGeometry(0.3, 0.07, 0.19), e, 0, 0.23, 0),
        addMesh(t, new BoxGeometry(0.24, 0.018, 0.222), mat(`#d8f3dc`), 0, 0.02, 0),
        addMesh(t, new BoxGeometry(0.018, 0.24, 0.222), r, 0, -0.02, 0),
        addMesh(t, new BoxGeometry(0.22, 0.028, 0.04), n, 0, 0.32, 0),
        addMesh(t, new BoxGeometry(0.028, 0.09, 0.04), n, -0.09, 0.28, 0),
        addMesh(t, new BoxGeometry(0.028, 0.09, 0.04), n, 0, 0.28, 0),
        addMesh(t, new BoxGeometry(0.028, 0.09, 0.04), n, 0.09, 0.28, 0));
      let a = addMesh(t, cylinderGeo(0.04, 0.05, 0.14, 16), n, 0.12, 0.3, 0.05);
      ((a.rotation.z = -0.55),
        addMesh(
          t,
          cylinderGeo(0.046, 0.046, 0.035, 16),
          mat(`#f4efe6`, {
            metalness: 0.35,
            roughness: 0.4,
          }),
          0.16,
          0.37,
          0.05,
        ),
        t.scale.setScalar(1.7));
    }
    if (
      (e === `spikes` &&
        addMesh(
          t,
          coneGeo(0.08, 0.28, 5),
          mat(`#d0d4dc`, {
            metalness: 0.55,
          }),
          0,
          0.1,
          0,
        ),
      e === `laser`)
    ) {
      let e = mat(`#12151e`, {
          metalness: 0.78,
          roughness: 0.22,
        }),
        n = mat(`#ffd0d4`, {
          emissive: `#ff2430`,
          emissiveIntensity: 1.55,
          metalness: 0.15,
          roughness: 0.12,
        }),
        r = mat(`#ff4d6d`, {
          emissive: `#ff2d55`,
          emissiveIntensity: 0.85,
        }),
        i = addMesh(t, cylinderGeo(0.046, 0.02, 0.78, 12), n, 0, 0.03, 0.58);
      ((i.rotation.x = Math.PI / 2),
        (i.userData.laserBody = !0),
        addMesh(t, new BoxGeometry(0.1, 0.11, 0.64), e, 0, 0, 0.02),
        addMesh(t, new BoxGeometry(0.13, 0.09, 0.24), e, 0, -0.09, -0.16));
      for (let e = 0; e < 4; e++) {
        let n = addMesh(t, torusGeo(0.075, 0.012, 8, 16), r, 0, 0.03, 0.16 + e * 0.13);
        n.rotation.y = Math.PI / 2;
      }
      let a = addMesh(t, sphereGeo(0.075, 12, 10), n, 0, 0.09, -0.06);
      a.userData.laserBody = !0;
      let o = addMesh(t, cylinderGeo(0.012, 0.012, 0.3, 6), e, -0.055, 0.03, 0.78);
      o.rotation.x = Math.PI / 2;
      let s = addMesh(t, cylinderGeo(0.012, 0.012, 0.3, 6), e, 0.055, 0.03, 0.78);
      s.rotation.x = Math.PI / 2;
      let c = addMesh(t, sphereGeo(0.04, 10, 8), n, 0, 0.03, 0.98);
      ((c.userData.laserBody = !0), t.scale.setScalar(1.35));
    }
    // 2.0: futuristiset hyytelöaseet + kuuturva
    if (e === `plasma`) {
      addMesh(t, sphereGeo(0.2, 12, 10), mat(`#da77f2`, { emissive: `#be4bdb`, emissiveIntensity: 0.9, transparent: !0, opacity: 0.85 }), 0, 0.05, 0.25);
      addMesh(t, sphereGeo(0.1, 8, 6), mat(`#e599f7`, { emissive: `#e599f7`, emissiveIntensity: 1.2 }), 0, 0.12, 0.35);
    } else if (e === `gravity`) {
      addMesh(t, new BoxGeometry(0.14, 0.18, 0.4), mat(`#495057`), 0, 0, 0.15);
      addMesh(t, torusGeo(0.16, 0.03, 8, 16), mat(`#ffd43b`, { emissive: `#fab005`, emissiveIntensity: 0.8 }), 0, 0.05, 0.4).rotation.y = Math.PI / 2;
    } else if (e === `freeze`) {
      addMesh(t, new BoxGeometry(0.1, 0.1, 0.55), mat(`#a5d8ff`, { emissive: `#74c0fc`, emissiveIntensity: 0.7 }), 0, 0, 0.2);
      addMesh(t, sphereGeo(0.09, 8, 6), mat(`#e7f5ff`, { emissive: `#ffffff`, emissiveIntensity: 0.9 }), 0, 0.02, 0.55);
    } else if (e === `tether`) {
      addMesh(t, cylinderGeo(0.06, 0.08, 0.35, 8), mat(`#868e96`), 0, 0, 0.1);
      addMesh(t, torusGeo(0.14, 0.025, 6, 12), mat(`#ff922b`, { emissive: `#fd7e14`, emissiveIntensity: 0.7 }), 0, 0.05, 0.35).rotation.x = Math.PI / 2;
      addMesh(t, new OctahedronGeometry(0.08), mat(`#ffe8cc`, { emissive: `#ffd8a8`, emissiveIntensity: 0.6 }), 0, 0.05, 0.5);
    } else if ([`floatgun`,`blind`,`shrink`,`bubble`,`swapgun`,`slowmo`,`jelly`,`magnet`,`tornado`,`reverse`,`sheepgun`,`mirror`,`teleport`,`blaster`,`railgun`,`hypermag`].includes(e)) {
      let cols = { floatgun:`#ffd43b`, blind:`#adb5bd`, shrink:`#74c0fc`, bubble:`#a5d8ff`, swapgun:`#da77f2`, slowmo:`#9775fa`, jelly:`#69db7c`, magnet:`#ff6b6b`, tornado:`#ced4da`, reverse:`#ff922b`, sheepgun:`#f8f9fa`, mirror:`#c0e8ff`, teleport:`#b197fc`, blaster:`#ff6bcb`, railgun:`#66d9e8`, hypermag:`#ff8787` };
      let c = cols[e] || `#fff`;
      if (e === `mirror`) {
        addMesh(t, new BoxGeometry(0.08, 0.9, 0.55), mat(`#adb5bd`, { metalness: 0.7, roughness: 0.25 }), 0, 0.35, 0.2);
        let face = addMesh(t, new BoxGeometry(0.02, 0.78, 0.46), mat(`#d0ebff`, { metalness: 0.95, roughness: 0.05, emissive: `#a5d8ff`, emissiveIntensity: 0.35 }), 0.05, 0.35, 0.2);
        face.userData.mirrorFace = !0;
        addMesh(t, new BoxGeometry(0.02, 0.78, 0.46), mat(`#d0ebff`, { metalness: 0.95, roughness: 0.05, emissive: `#a5d8ff`, emissiveIntensity: 0.35 }), -0.05, 0.35, 0.2).userData.mirrorFace = !0;
        t.scale.setScalar(1.25);
      } else if (e === `teleport`) {
        addMesh(t, new BoxGeometry(0.14, 0.16, 0.5), mat(`#343a40`, { metalness: 0.6 }), 0, 0, 0.15);
        addMesh(t, new OctahedronGeometry(0.14), mat(`#b197fc`, { emissive: `#9775fa`, emissiveIntensity: 1.1 }), 0, 0.05, 0.48);
        addMesh(t, torusGeo(0.18, 0.025, 8, 16), mat(`#eebefa`, { emissive: `#da77f2`, emissiveIntensity: 0.9 }), 0, 0.05, 0.48).rotation.y = Math.PI / 2;
      } else {
        addMesh(t, new BoxGeometry(0.12, 0.14, 0.42), mat(`#343a40`, { metalness: 0.5 }), 0, 0, 0.12);
        addMesh(t, sphereGeo(0.1, 10, 8), mat(c, { emissive: c, emissiveIntensity: 0.9 }), 0, 0.04, 0.42);
      }
    } else if (e === `boost`) {
      addMesh(t, cylinderGeo(0.1, 0.12, 0.2, 10), mat(`#1fb6ff`, { emissive: `#1fb6ff`, emissiveIntensity: 0.6 }), 0, 0, 0.1);
    }
    return (t.position.set(0.38, 1.05, 0.15), t);
  }
  function Gl() {
    let e = document.createElement(`canvas`);
    ((e.width = 512), (e.height = 256));
    let t = e.getContext(`2d`),
      n = [`#ff3b30`, `#ffd60a`, `#30d158`, `#0a84ff`, `#ffffff`, `#ff9f0a`],
      r = e.width / n.length;
    (n.forEach((n, i) => {
      ((t.fillStyle = n), t.fillRect(i * r, 0, r + 1, e.height));
    }),
      (t.fillStyle = `#ffffff`),
      t.fillRect(0, 0, e.width, 26),
      t.fillRect(0, e.height - 26, e.width, 26));
    let i = new CanvasTexture(e);
    return ((i.colorSpace = SRGBColorSpace), i);
  }
  function buildCarModel(e, t, typ) {
    typ = typ || (t ? `sports` : `normal`);
    let n = new Group(),
      r = mat(e, {
        roughness: typ === `sports` ? 0.22 : typ === `toy` ? 0.55 : 0.35,
        metalness: typ === `sports` ? 0.45 : typ === `flying` ? 0.55 : 0.15,
      }),
      i = mat(`#b9e6ff`, {
        transparent: !0,
        opacity: 0.45,
        roughness: 0.05,
        metalness: 0.1,
      }),
      a = mat(`#1a1a1a`, {
        roughness: 0.7,
      }),
      o = mat(`#fff6d0`, {
        emissive: `#fff2c2`,
        emissiveIntensity: 0.9,
      }),
      s = mat(`#ff2a2a`, {
        emissive: `#ff1a1a`,
        emissiveIntensity: 0.55,
      });
    (addMesh(n, new BoxGeometry(1.75, 0.42, 3.7), r, 0, 0.55, 0),
      addMesh(n, new BoxGeometry(1.58, 0.4, 1.65), r, 0, 0.95, -0.2),
      addMesh(n, new BoxGeometry(1.42, 0.32, 1.4), i, 0, 1.05, -0.18),
      addMesh(n, new BoxGeometry(0.38, 0.12, 0.08), o, -0.5, 0.58, 1.88),
      addMesh(n, new BoxGeometry(0.38, 0.12, 0.08), o, 0.5, 0.58, 1.88),
      addMesh(n, new BoxGeometry(1.35, 0.1, 0.08), s, 0, 0.58, -1.88),
      addMesh(n, new BoxGeometry(1.78, 0.07, 3.74), mat(`#14202a`), 0, 0.38, 0),
      addMesh(n, new BoxGeometry(1.7, 0.08, 0.28), r, 0, 1.2, -1.55),
      addMesh(
        n,
        new OctahedronGeometry(0.12),
        mat(`#f6c445`, {
          emissive: `#f6c445`,
          emissiveIntensity: 0.55,
        }),
        0,
        0.82,
        1.55,
      ));
    let c = addMesh(n, new BoxGeometry(1.15, 0.1, 0.28), a, 0, 0.78, 0.62);
    c.castShadow = !1;
    let l = addMesh(n, torusGeo(0.15, 0.022, 6, 12), a, -0.28, 0.96, 0.48);
    ((l.rotation.x = Math.PI / 2.4), (l.castShadow = !1));
    let u = [],
      d = [
        [-0.88, 1.15, !1],
        [0.88, 1.15, !1],
        [t ? -1.08 : -0.88, -1.2, t],
        [t ? 1.08 : 0.88, -1.2, t],
      ];
    for (let [t, r, i] of d) {
      let a = i ? 0.64 : 0.32,
        o = new Group();
      o.position.set(t, a, r);
      let s = mat(`#1a1a1a`, {
          roughness: 0.85,
        }),
        c = new Mesh(cylinderGeo(a, a, i ? 0.3 : 0.22, 28), s);
      c.rotation.z = Math.PI / 2;
      let l = new Mesh(
        cylinderGeo(a * 0.46, a * 0.46, i ? 0.34 : 0.26, 20),
        mat(`#d5dbe6`, {
          metalness: 0.65,
          roughness: 0.28,
        }),
      );
      l.rotation.z = Math.PI / 2;
      let d = new Mesh(
        cylinderGeo(a * 0.16, a * 0.16, i ? 0.38 : 0.3, 12),
        mat(e, {
          metalness: 0.3,
          roughness: 0.4,
        }),
      );
      ((d.rotation.z = Math.PI / 2), o.add(c, l, d), n.add(o), u.push(o));
    }
    let f = new Group(),
      p = addMesh(
        f,
        coneGeo(0.22, 0.9, 12),
        mat(`#ffd60a`, {
          emissive: `#ff4d00`,
          emissiveIntensity: 1.6,
          transparent: !0,
          opacity: 0.92,
        }),
        0,
        0,
        0,
      );
    p.rotation.x = Math.PI / 2;
    let m = addMesh(
      f,
      coneGeo(0.1, 1.25, 10),
      mat(`#fff6d0`, {
        emissive: `#ffffff`,
        emissiveIntensity: 1.3,
        transparent: !0,
        opacity: 0.88,
      }),
      0,
      0,
      0.12,
    );
    // 2.0: tyyppikohtaiset koristeet
    if (typ === `toy`) {
      addMesh(n, new BoxGeometry(0.35, 0.35, 0.35), mat(`#ff6b6b`, { emissive: `#ff6b6b`, emissiveIntensity: 0.3 }), 0, 1.35, -0.2);
      n.scale.setScalar(0.85);
    } else if (typ === `sports`) {
      addMesh(n, new BoxGeometry(1.6, 0.08, 0.9), mat(`#111`), 0, 0.72, 0.9);
      addMesh(n, new BoxGeometry(0.2, 0.08, 1.2), mat(`#fff6d0`, { emissive: `#fff6d0`, emissiveIntensity: 0.4 }), -0.95, 0.7, 0);
      addMesh(n, new BoxGeometry(0.2, 0.08, 1.2), mat(`#fff6d0`, { emissive: `#fff6d0`, emissiveIntensity: 0.4 }), 0.95, 0.7, 0);
    } else if (typ === `flying`) {
      let wing = mat(`#a5d8ff`, { transparent: !0, opacity: 0.55, metalness: 0.3, roughness: 0.2 });
      addMesh(n, new BoxGeometry(3.4, 0.06, 0.9), wing, 0, 0.7, 0);
      addMesh(n, new BoxGeometry(0.9, 0.06, 2.2), wing, 0, 0.7, -0.4);
      let thr = mat(`#74c0fc`, { emissive: `#4dabf7`, emissiveIntensity: 1.2 });
      addMesh(n, cylinderGeo(0.12, 0.16, 0.35, 10), thr, -0.55, 0.25, -1.7);
      addMesh(n, cylinderGeo(0.12, 0.16, 0.35, 10), thr, 0.55, 0.25, -1.7);
      let hover = new Group();
      addMesh(hover, coneGeo(0.18, 0.55, 10), mat(`#69db7c`, { emissive: `#37b24d`, emissiveIntensity: 1.4, transparent: !0, opacity: 0.85 }), 0, 0, 0).rotation.x = Math.PI;
      hover.position.set(0, 0.05, 0); hover.visible = !1; n.add(hover); n.userData.hover = hover;
    }
    return (
      (m.rotation.x = Math.PI / 2),
      f.position.set(0, 0.58, -2.05),
      (f.visible = !1),
      n.add(f),
      (n.userData.boost = f),
      (n.userData.wheels = u),
      (n.userData.carType = typ),
      n
    );
  }
  // 1.9: pelaajien värit (P1 punainen, P2 sininen, P3 vihreä, P4 oranssi)
  const PLAYER_COLORS = [`#ff5a36`, `#3aa0ff`, `#40c057`, `#f59f00`];
  let FIREARMS = /* @__PURE__ */ new Set([`pistol`, `shotgun`, `minigun`, `rifle`, `scope`]);
  function buildBeachBall() {
    let e = new Group(),
      t = [`#ff3b30`, `#ffd60a`, `#3aa0ff`, `#ffffff`, `#30d158`, `#bf5af2`];
    t.forEach((n, r) => {
      let i = new Mesh(
        sphereGeo(
          2.85,
          14,
          16,
          (r / t.length) * Math.PI * 2,
          (Math.PI * 2) / t.length + 0.02,
          0,
          Math.PI / 2,
        ),
        new MeshStandardMaterial({
          color: n,
          roughness: 0.42,
          metalness: 0.02,
          side: 2,
        }),
      );
      ((i.castShadow = !0), e.add(i));
    });
    let n = mat(`#f4efe6`);
    for (let t = 0; t < 8; t++) {
      let r = (t / 8) * Math.PI * 2,
        i = new Mesh(cylinderGeo(0.02, 0.02, 2.55, 8), n);
      (i.position.set(Math.cos(r) * 1.85, -1.25, Math.sin(r) * 1.85), e.add(i));
    }
    return ((e.visible = !1), e);
  }
  function buildSlimeCoat() {
    let e = new Group(),
      t = mat(`#39d353`, {
        transparent: !0,
        opacity: 0.62,
        emissive: `#1faa3a`,
        emissiveIntensity: 0.25,
        roughness: 0.15,
      });
    return (
      addMesh(e, sphereGeo(0.85, 10, 8), t, 0, 0.7, 0),
      addMesh(e, sphereGeo(0.42, 8, 6), t, 0.55, 0.35, 0.2),
      addMesh(e, sphereGeo(0.32, 8, 6), t, -0.4, 0.28, -0.15),
      (e.visible = !1),
      e
    );
  }
  function buildEjectSeat() {
    let e = new Group(),
      t = mat(`#d5dbe6`, {
        metalness: 0.45,
        roughness: 0.35,
      });
    return (
      addMesh(e, new BoxGeometry(0.95, 0.14, 0.85), t, 0, 0.1, 0),
      addMesh(e, new BoxGeometry(0.95, 0.62, 0.12), t, 0, 0.4, -0.36),
      addMesh(
        e,
        new BoxGeometry(0.18, 0.42, 0.18),
        mat(`#ff5a36`, {
          emissive: `#ff5a36`,
          emissiveIntensity: 0.45,
        }),
        0,
        0.28,
        0.12,
      ),
      (e.visible = !1),
      e
    );
  }
  function buildFlame() {
    let e = new Group(),
      t = mat(`#ff6a00`, {
        emissive: `#ff4500`,
        emissiveIntensity: 1.3,
      }),
      n = mat(`#ffe14a`, {
        emissive: `#ffd000`,
        emissiveIntensity: 1.5,
      });
    for (let r = 0; r < 3; r++) {
      let i = addMesh(e, coneGeo(0.16, 0.55, 7), r === 1 ? n : t, (r - 1) * 0.18, 0.36, 0);
      i.castShadow = !1;
    }
    return ((e.visible = !1), e);
  }
  function Ql(e, t, n, r) {
    let i = document.createElement(`canvas`);
    ((i.width = 1024), (i.height = 320));
    let a = i.getContext(`2d`);
    ((a.fillStyle = n),
      a.fillRect(0, 0, 1024, 320),
      (a.fillStyle = r),
      (a.textAlign = `center`),
      (a.textBaseline = `middle`),
      (a.font = `800 168px sans-serif`));
    // 1.9: sovita teksti kankaalle (ennen pitkä nimi leikkautui: "ikkailura")
    let fit = (txt, px, w, wt) => {
      a.font = `${wt} ${px}px sans-serif`;
      let m = a.measureText(txt).width;
      m > w && (a.font = `${wt} ${Math.floor((px * w) / m)}px sans-serif`);
    };
    (fit(e, 168, 960, 800), a.fillText(e, 512, t ? 130 : 160), t && (fit(t, 78, 960, 700), a.fillText(t, 512, 240)));
    let o = new CanvasTexture(i);
    return ((o.colorSpace = SRGBColorSpace), o);
  }
  function makeHealthBar(e) {
    let t = document.createElement(`canvas`);
    ((t.width = 256), (t.height = 64));
    let n = t.getContext(`2d`),
      r = new CanvasTexture(t);
    r.colorSpace = SRGBColorSpace;
    let i = new Sprite(
      new SpriteMaterial({
        map: r,
        transparent: !0,
        depthTest: !0,
      }),
    );
    return (
      i.scale.set(1.7, 0.42, 1),
      i.center.set(0.5, 0),
      (i.renderOrder = 4),
      (i.userData.tint = e),
      {
        sprite: i,
        ctx: n,
        tex: r,
      }
    );
  }
  function drawHealthBar(e, t, n, r) {
    (e.clearRect(0, 0, 256, 64),
      (e.fillStyle = `rgba(12, 22, 30, 0.9)`),
      e.fillRect(4, 14, 248, 36));
    let i = Math.max(0, Math.min(1, n / 100));
    ((e.fillStyle = i > 0.55 ? `#3ddc84` : i > 0.3 ? `#ffd60a` : `#ff4d4d`),
      e.fillRect(8, 18, 240 * i, 28),
      (e.strokeStyle = r),
      (e.lineWidth = 6),
      e.strokeRect(4, 14, 248, 36),
      (t.needsUpdate = !0));
  }
  function buildArch(e) {
    let t = new Shape();
    (t.absarc(0, 0, 4.55, 0, Math.PI, !1),
      t.lineTo(-4.05, 0),
      t.absarc(0, 0, 4.05, Math.PI, 0, !0));
    let n = new ExtrudeGeometry(t, {
      depth: 30,
      bevelEnabled: !1,
      curveSegments: 32,
    });
    (n.translate(0, 0, -15), n.rotateY(Math.PI / 2));
    let r = new Mesh(
      n,
      mat(`#d7dde6`, {
        roughness: 0.72,
        metalness: 0.08,
        side: 2,
      }),
    );
    (r.position.set(0, 0, 16), (r.castShadow = !1), (r.receiveShadow = !0), e.add(r));
    let i = mat(`#fff4c2`, {
      emissive: `#ffe08a`,
      emissiveIntensity: 0.9,
    });
    for (let t = 0; t < 8; t++) {
      let n = -13 + t * 3.7,
        r = new Mesh(new BoxGeometry(1.4, 0.08, 0.28), i);
      (r.position.set(n, 3.55, 16), e.add(r));
    }
    let a = mat(`#1c2430`, {
      roughness: 0.5,
      metalness: 0.2,
    });
    for (let t of [-15, 15]) {
      let n = new Mesh(torusGeo(4.3, 0.18, 10, 28, Math.PI), a);
      ((n.rotation.y = Math.PI / 2), (n.rotation.z = Math.PI), n.position.set(t, 0, 16), e.add(n));
    }
    let o = new Mesh(
      new PlaneGeometry(4.2, 1.3),
      new MeshStandardMaterial({
        map: Ql(`TUNNELI`, `30 m`, `#102430`, `#ffffff`),
        roughness: 0.5,
      }),
    );
    (o.position.set(-15.2, 5.3, 16), (o.rotation.y = -Math.PI / 2), e.add(o));
  }
  function buildMuseum(e, t) {
    let n = [],
      r = 1.75,
      i = 0.42,
      a = mat(`#f6f3ec`, {
        roughness: 0.7,
      }),
      o = mat(`#111318`, {
        roughness: 0.4,
        metalness: 0.2,
      }),
      s = (t, r, i, o, s) => {
        let c = new Mesh(new BoxGeometry(r - t, s, o - i), a);
        (c.position.set((t + r) / 2, s / 2, (i + o) / 2),
          (c.castShadow = !0),
          (c.receiveShadow = !0),
          e.add(c),
          n.push({
            minX: t,
            maxX: r,
            minZ: i,
            maxZ: o,
          }));
      };
    (s(-9, 9, 4.58, 5, 5.2),
      s(-9, 9, -5, -4.58, 5.2),
      s(-9, -8.58, -5, -1.75, 5.2),
      s(-9, -8.58, r, 5, 5.2),
      s(8.58, 9, -5, -1.75, 5.2),
      s(8.58, 9, r, 5, 5.2));
    let c = 1.55;
    for (let t of [-8.79, 9 - i / 2]) {
      let n = new Mesh(new BoxGeometry(i, c, r * 2), a);
      (n.position.set(t, 5.2 - c / 2, 0), (n.castShadow = !0), e.add(n));
      let s = new Mesh(torusGeo(r, 0.16, 10, 24, Math.PI), o);
      ((s.rotation.y = Math.PI / 2), s.position.set(t, 3.55, 0), e.add(s));
    }
    let l = mat(`#1b1f27`, {
        roughness: 0.55,
      }),
      u = -2.9,
      d = 0.5,
      f = [
        [-9.2, u, -5.2, 5.2],
        [d, 9.2, -5.2, 5.2],
        [u, d, -5.2, 0.65],
        [u, d, 4.05, 5.2],
      ];
    for (let [t, n, r, i] of f) {
      let a = new Mesh(new BoxGeometry(n - t, 0.28, i - r), l);
      (a.position.set((t + n) / 2, 5.35, (r + i) / 2),
        (a.castShadow = !0),
        (a.receiveShadow = !0),
        e.add(a));
    }
    let p = mat(`#2a3140`, {
        roughness: 0.4,
        metalness: 0.35,
      }),
      m = new Mesh(new BoxGeometry(1.72, 0.16, 3.5), p),
      h = new Mesh(new BoxGeometry(1.72, 0.16, 3.5), p);
    (m.position.set(-2.81, 5.42, 2.35),
      h.position.set(0.41, 5.42, 2.35),
      (m.castShadow = !0),
      (h.castShadow = !0),
      e.add(m, h));
    let g = new Mesh(new BoxGeometry(18.5, 0.55, 0.08), o);
    (g.position.set(0, 4.15, 5.02), e.add(g));
    let _ = new Mesh(
      new PlaneGeometry(17.2, 9.1),
      mat(`#141820`, {
        roughness: 0.85,
        metalness: 0.08,
      }),
    );
    ((_.rotation.x = -Math.PI / 2), _.position.set(0, 0.02, 0), (_.receiveShadow = !0), e.add(_));
    let v = new Mesh(
      torusGeo(2.3, 0.04, 8, 40),
      mat(`#7ec8ff`, {
        emissive: `#3aa0ff`,
        emissiveIntensity: 0.4,
      }),
    );
    ((v.rotation.x = Math.PI / 2), (v.position.y = 0.05), e.add(v));
    for (let t of [-1, 1]) {
      let n = new Mesh(
        new PlaneGeometry(6.4, 2),
        new MeshStandardMaterial({
          map: Ql(`SPACEX`, `MUSEO`, `#111318`, `#f4f7fb`),
          roughness: 0.45,
        }),
      );
      (n.position.set(t * 6.2, 3.15, t > 0 ? -5.05 : 5.05),
        t < 0 && (n.rotation.y = Math.PI),
        e.add(n));
    }
    let y = new Mesh(
      new PlaneGeometry(4.6, 1.45),
      new MeshStandardMaterial({
        map: Ql(`SPACEX`, `sisään`, `#111318`, `#ffffff`),
        roughness: 0.45,
      }),
    );
    (y.position.set(-9.05, 4.35, 0), (y.rotation.y = -Math.PI / 2), e.add(y));
    let b = mat(`#f7f7f5`, {
        roughness: 0.35,
        metalness: 0.12,
      }),
      x = mat(`#16181d`, {
        roughness: 0.4,
        metalness: 0.25,
      }),
      S = mat(`#c5ccd6`, {
        metalness: 0.55,
        roughness: 0.28,
      }),
      C = new Group();
    (addMesh(C, cylinderGeo(0.55, 0.62, 4.4, 20), b, 0, 2.5, 0),
      addMesh(C, cylinderGeo(0.62, 0.62, 0.35, 20), x, 0, 4.2, 0),
      addMesh(C, coneGeo(0.55, 1.35, 20), b, 0, 5.35, 0),
      addMesh(C, cylinderGeo(0.18, 0.22, 0.7, 12), S, 0, 0.35, 0));
    for (let e = 0; e < 4; e++) {
      let t = (e / 4) * Math.PI * 2 + Math.PI / 4,
        n = addMesh(
          C,
          new BoxGeometry(0.85, 0.42, 0.06),
          x,
          Math.cos(t) * 0.95,
          3.55,
          Math.sin(t) * 0.95,
        );
      n.rotation.y = -t;
      let r = addMesh(
        C,
        new BoxGeometry(0.07, 1.05, 0.07),
        S,
        Math.cos(t) * 0.72,
        0.5,
        Math.sin(t) * 0.72,
      );
      ((r.rotation.order = `YXZ`), (r.rotation.y = -t), (r.rotation.z = 0.45));
    }
    C.position.set(-1.2, 0, 2.35);
    let w = new Group(),
      T = addMesh(
        w,
        coneGeo(0.5, 1.8, 16),
        mat(`#ffb020`, {
          emissive: `#ff4d00`,
          emissiveIntensity: 1.8,
          transparent: !0,
          opacity: 0.95,
        }),
        0,
        0.2,
        0,
      );
    T.rotation.x = Math.PI;
    let E = addMesh(
      w,
      coneGeo(0.22, 2.6, 12),
      mat(`#9ad7ff`, {
        emissive: `#3aa0ff`,
        emissiveIntensity: 1.5,
        transparent: !0,
        opacity: 0.85,
      }),
      0,
      -0.15,
      0,
    );
    ((E.rotation.x = Math.PI), w.position.set(0, 0.2, 0), (w.visible = !1), C.add(w), e.add(C));
    let D = {
      x: -1.2,
      z: 2.35,
      r: 1.15,
    };
    t.push(D);
    let O = new Group();
    (addMesh(
      O,
      cylinderGeo(0.42, 0.42, 3.1, 18),
      mat(`#d5dbe3`, {
        metalness: 0.65,
        roughness: 0.22,
      }),
      0,
      1.7,
      0,
    ),
      addMesh(
        O,
        coneGeo(0.42, 0.7, 16),
        mat(`#e8eef6`, {
          metalness: 0.4,
          roughness: 0.3,
        }),
        0,
        3.55,
        0,
      ),
      addMesh(O, cylinderGeo(0.28, 0.34, 0.4, 12), x, 0, 0.25, 0),
      O.position.set(2.4, 0, -2.15),
      e.add(O),
      t.push({
        x: 2.4,
        z: -2.15,
        r: 0.7,
      }));
    let k = new Group();
    (addMesh(k, coneGeo(0.48, 0.85, 16), b, 0, 1.55, 0),
      addMesh(
        k,
        cylinderGeo(0.48, 0.48, 0.55, 16),
        mat(`#e7eef8`, {
          roughness: 0.2,
          metalness: 0.15,
        }),
        0,
        0.85,
        0,
      ),
      addMesh(k, cylinderGeo(0.5, 0.5, 0.18, 16), x, 0, 0.5, 0),
      addMesh(
        k,
        sphereGeo(0.22, 16, 12),
        mat(`#9ad7ff`, {
          transparent: !0,
          opacity: 0.55,
          roughness: 0.05,
        }),
        0,
        1.35,
        0.28,
      ).scale.set(1, 0.7, 0.45),
      k.position.set(-3.4, 0, -2.2),
      e.add(k));
    let A = new Mesh(
      sphereGeo(0.7, 24, 18),
      mat(`#3aa0ff`, {
        emissive: `#1c4f86`,
        emissiveIntensity: 0.25,
        roughness: 0.4,
      }),
    );
    (A.position.set(4.6, 1.55, 2.2), e.add(A));
    let ee = new Mesh(cylinderGeo(0.12, 0.16, 0.8, 12), S);
    (ee.position.set(4.6, 0.4, 2.2),
      e.add(ee),
      t.push({
        x: 4.6,
        z: 2.2,
        r: 0.55,
      }));
    let te = mat(`#fff6d0`, {
      emissive: `#fff1b8`,
      emissiveIntensity: 1.1,
    });
    for (let [t, n, r] of [
      [-4, 4.6, 1.2],
      [1.5, 4.8, -1],
      [5, 4.4, 0.4],
      [-2, 4.7, -3],
    ]) {
      let i = new Mesh(sphereGeo(0.08, 10, 8), te);
      (i.position.set(t, n, r), e.add(i));
    }
    let j = new PointLight(`#fff4e5`, 2.4, 18, 2);
    (j.position.set(0, 4.2, 0), e.add(j));
    let M = new PointLight(`#ffb15a`, 0, 36, 1.2);
    (M.position.set(-1.2, 3, 2.35), e.add(M));
    let ne = new Mesh(
      torusGeo(1.15, 0.09, 8, 32),
      mat(`#ffd60a`, {
        emissive: `#ff6a00`,
        emissiveIntensity: 1.2,
        transparent: !0,
        opacity: 0.9,
      }),
    );
    return (
      (ne.rotation.x = Math.PI / 2),
      ne.position.set(-1.2, 0.45, 2.35),
      (ne.visible = !1),
      e.add(ne),
      {
        walls: n,
        rocket: C,
        rocketHit: D,
        flame: w,
        hatches: [m, h],
        launchLight: M,
        shock: ne,
      }
    );
  }
  function startGame(canvas, options, onHud, onNote) {
    window.HYYTE && options.devices && (HYYTE.devices = options.devices);
    // 1.9: ohjainten kohdistus pelaajille (devices[i].pad = ohjainpaikka tai null)
    window.HYYTE_PAD &&
      (HYYTE_PAD.assign = options.devices ? options.devices.map((d) => (d && d.pad != null ? d.pad : -1)) : null);
    // 1.8: grafiikan laatu (Korkea / Matala) valitaan aulassa
    const gfxMode = window.HYYTE?.gfx || `korkea`;
    const mobiGfx = gfxMode === `mobiili`;
    const lowGfx = gfxMode === `matala` || mobiGfx;
    const ultraGfx = gfxMode === `ultra`;
    let renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: !lowGfx,
      powerPreference: `high-performance`,
    });
    (renderer.setPixelRatio(mobiGfx ? Math.min(devicePixelRatio || 1, 1.25) : lowGfx ? 1 : ultraGfx ? Math.min(devicePixelRatio || 1, 2) : Math.min(devicePixelRatio || 1, 1.5)),
      (renderer.shadowMap.enabled = !mobiGfx),
      (renderer.shadowMap.type = lowGfx ? 1 : 2),
      (renderer.toneMapping = ultraGfx ? 4 : 0),
      (renderer.toneMappingExposure = ultraGfx ? 1.12 : 1),
      renderer.setScissorTest(!0));
    let scene = new Scene(),
      s = new Color(`#87c8ea`),
      c = new Color(`#070b18`);
    scene.background = s;
    let l = new Fog(`#87c8ea`, 150, 520);
    scene.fog = l;
    let u = /* @__PURE__ */ new Float32Array(2100);
    for (let e = 0; e < 700; e++) {
      let t = Math.random() * Math.PI * 2,
        n = 0.25 + Math.random() * 0.75,
        r = Math.sqrt(1 - n * n);
      ((u[e * 3] = Math.cos(t) * r * 460),
        (u[e * 3 + 1] = n * 460),
        (u[e * 3 + 2] = Math.sin(t) * r * 460));
    }
    let d = new BufferGeometry();
    d.setAttribute(`position`, new BufferAttribute(u, 3));
    let f = new Points(
      d,
      new PointsMaterial({
        color: `#fffaf0`,
        size: 2.1,
        sizeAttenuation: !1,
        fog: !1,
      }),
    );
    ((f.visible = !1), scene.add(f));
    let p = new Mesh(
      torusGeo(1.2, 0.09, 10, 28),
      mat(`#ffb0b8`, {
        emissive: `#ff2a2a`,
        emissiveIntensity: 1.5,
        transparent: !0,
        opacity: 0.9,
        fog: !1,
      }),
    );
    ((p.rotation.x = Math.PI / 2),
      (p.visible = !1),
      scene.add(p),
      scene.add(new HemisphereLight(`#fff4d8`, `#3d7a45`, 1.05)));
    let sunLight = new DirectionalLight(`#fff6e0`, 1.15);
    (sunLight.position.set(18, 28, 10),
      (sunLight.castShadow = !0),
      sunLight.shadow.mapSize.set(lowGfx ? 2048 : ultraGfx ? 8192 : 4096, lowGfx ? 2048 : ultraGfx ? 8192 : 4096),
      (sunLight.shadow.camera.near = 2),
      (sunLight.shadow.camera.far = 340),
      (sunLight.shadow.camera.left = -175),
      (sunLight.shadow.camera.right = 175),
      (sunLight.shadow.camera.top = 175),
      (sunLight.shadow.camera.bottom = -175),
      (sunLight.shadow.bias = -6e-4),
      scene.add(sunLight),
      scene.add(sunLight.target));
    let h = mat(`#3d9a4a`, {
        roughness: 0.95,
      }),
      g = document.createElement(`canvas`);
    ((g.width = 2048), (g.height = 2048));
    let _ = g.getContext(`2d`);
    ((_.fillStyle = `#348a42`), _.fillRect(0, 0, 2048, 2048), (_.fillStyle = `#43a352`));
    for (let e = 0; e < 64; e++)
      for (let t = 0; t < 64; t++) (t + e) % 2 == 0 && _.fillRect(t * 32, e * 32, 32, 32);
    let v = new CanvasTexture(g);
    ((v.wrapS = v.wrapT = RepeatWrapping),
      v.repeat.set(62, 62),
      (v.anisotropy = 16),
      (v.colorSpace = SRGBColorSpace),
      (h.map = v));
    let y = new Mesh(new PlaneGeometry(486, 486), h);
    ((y.rotation.x = -Math.PI / 2), (y.receiveShadow = !0), scene.add(y));
    let b = mat(`#3c4454`, {
        roughness: 0.95,
        metalness: 0.02,
      }),
      x = new Shape();
    (x.moveTo(-18, -19.6),
      x.lineTo(18, -19.6),
      x.absarc(18, 0, 19.6, -Math.PI / 2, Math.PI / 2, !1),
      x.lineTo(-18, 19.6),
      x.absarc(-18, 0, 19.6, Math.PI / 2, (Math.PI * 3) / 2, !1));
    let S = new Path();
    (S.moveTo(-18, -12.4),
      S.absarc(-18, 0, 12.4, -Math.PI / 2, Math.PI / 2, !0),
      S.lineTo(18, 12.4),
      S.absarc(18, 0, 12.4, Math.PI / 2, -Math.PI / 2, !0),
      x.holes.push(S));
    let C = new ShapeGeometry(x, 80);
    C.rotateX(Math.PI / 2);
    let w = new Mesh(C, b);
    ((w.position.y = 0.025), (w.receiveShadow = !0), scene.add(w));
    let T = 72 + Math.PI * 2 * 16,
      E = mat(`#f6c445`, {
        emissive: `#f6c445`,
        emissiveIntensity: 0.15,
      });
    for (let e = 0; e < T; e += 4.4) {
      let t = e / T,
        n = Math.PI * 16,
        r = t * T,
        i = 0,
        a = 0,
        s = 0;
      if (r < 36) ((i = -18 + r), (a = -16), (s = -Math.PI / 2));
      else if ((r -= 36) < n) {
        let e = -Math.PI / 2 + r / 16;
        ((i = 18 + Math.cos(e) * 16), (a = Math.sin(e) * 16), (s = e));
      } else if ((r -= n) < 36) ((i = 18 - r), (a = 16), (s = Math.PI / 2));
      else {
        r -= 36;
        let e = Math.PI / 2 + r / 16;
        ((i = -18 + Math.cos(e) * 16), (a = Math.sin(e) * 16), (s = e));
      }
      let c = new Mesh(new BoxGeometry(1.5, 0.02, 0.16), E);
      (c.position.set(i, 0.06, a), (c.rotation.y = s), scene.add(c));
    }
    let D = new Mesh(new BoxGeometry(0.4, 0.02, 6.9), mat(`#f4efe6`));
    (D.position.set(-2, 0.07, -16), scene.add(D));
    let obstacles = [],
      museum = buildMuseum(scene, obstacles),
      ee = museum.walls,
      portalRings = [];
    for (let e of PORTALS) {
      let t = new Group(),
        n = new Mesh(
          torusGeo(1.7, 0.16, 12, 32),
          mat(e.color, {
            emissive: e.color,
            emissiveIntensity: 0.75,
            metalness: 0.35,
            roughness: 0.25,
          }),
        );
      n.position.y = 1.9;
      let r = new Mesh(
        circleGeo(1.42, 32),
        mat(e.color, {
          emissive: e.color,
          emissiveIntensity: 0.4,
          transparent: !0,
          opacity: 0.38,
          side: 2,
        }),
      );
      r.position.y = 1.9;
      let i = new Mesh(
        cylinderGeo(1.95, 2.05, 0.14, 24),
        mat(`#141820`, {
          metalness: 0.25,
          roughness: 0.55,
        }),
      );
      i.position.y = 0.07;
      let a = new Mesh(
        new PlaneGeometry(2.4, 0.78),
        new MeshStandardMaterial({
          map: Ql(`PORTAALI`, e.label, `#111318`, `#ffffff`),
          roughness: 0.45,
          side: 2,
        }),
      );
      a.position.set(0, 4.15, 0);
      let s = new PointLight(e.color, 1.4, 12, 2);
      (s.position.set(0, 2.2, 0.5),
        t.add(n, r, i, a, s),
        t.position.set(e.x, 0, e.z),
        (t.rotation.y = e.yaw + Math.PI),
        scene.add(t),
        portalRings.push(n, r));
    }
    buildArch(scene);
    let j = [];
    [
      [-10, -4],
      [-4, 2],
      [2, -3],
      [8, 3],
      [0, 6],
      [-8, 6],
      [12, -2],
      [28, 0],
      [-30, 4],
      [8, 28],
      [-10, 30],
      [22, -28],
      [-24, -26],
    ].forEach(([e, t], n) => {
      if (
        Pl(e, t) < 5.2 ||
        (Math.abs(e) < 12 && Math.abs(t) < 8) ||
        (Math.abs(e) < 17 && Math.abs(t - 16) < 6) ||
        (Math.abs(e) < 14 && t < -22) ||
        (e > 36 && Math.abs(t) < 8) ||
        Math.abs(e) > 231 ||
        Math.abs(t) > 231
      )
        return;
      let r = new Mesh(
        new BoxGeometry(1.1, 1.1, 1.1),
        mat([`#ffb703`, `#fb8500`, `#8ecae6`, `#ff6b6b`][n % 4]),
      );
      (r.position.set(e, 0.55, t),
        (r.castShadow = !0),
        (r.receiveShadow = !0),
        scene.add(r),
        j.push(r),
        obstacles.push({
          x: e,
          z: t,
          r: 0.75,
        }));
    });
    let trees = [];
    for (let e = 0; e < 16; e++) {
      let t = (e / 16) * Math.PI * 2,
        n = Math.cos(t) * 36,
        r = Math.sin(t) * 30;
      if (
        Pl(n, r) < 5.4 ||
        (Math.abs(n) < 14 && Math.abs(r) < 9) ||
        (Math.abs(n) < 18 && Math.abs(r - 16) < 7) ||
        (Math.abs(n) < 16 && r < -22) ||
        (n > 36 && Math.abs(r) < 12) ||
        Math.abs(n) > 231.5 ||
        Math.abs(r) > 231.5
      )
        continue;
      let i = new Mesh(cylinderGeo(0.2, 0.28, 1.4, 12), mat(`#8b5a2b`));
      i.position.set(n, 0.7, r);
      let a = new Mesh(sphereGeo(1, 20, 16), mat(`#2d9f4a`));
      a.position.set(n, 1.8, r);
      let s = buildFlame();
      (s.position.set(n, 2.72, r),
        scene.add(i, a, s),
        obstacles.push({
          x: n,
          z: r,
          r: 0.7,
          h: 1.15,
        }),
        trees.push({
          x: n,
          z: r,
          r: 1.15,
          fire: 0,
          flames: s,
        }));
    }
    for (let e = 0; e < 12; e++) {
      let t = (e / 12) * Math.PI * 2 + 0.2,
        n = Math.cos(t) * 78,
        r = Math.sin(t) * 70;
      if (Pl(n, r) < 5.6 || (n > 34 && Math.abs(r) < 10)) continue;
      let i = new Mesh(cylinderGeo(0.22, 0.3, 1.6, 12), mat(`#8b5a2b`));
      i.position.set(n, 0.8, r);
      let a = new Mesh(sphereGeo(1.15, 18, 14), mat(`#227a38`));
      a.position.set(n, 2.1, r);
      let s = buildFlame();
      (s.position.set(n, 3.05, r),
        scene.add(i, a, s),
        obstacles.push({
          x: n,
          z: r,
          r: 0.75,
        }),
        trees.push({
          x: n,
          z: r,
          r: 1.2,
          fire: 0,
          flames: s,
        }));
    }
    for (let e = 0; e < 14; e++) {
      let t = (e / 14) * Math.PI * 2 + 0.35,
        n = Math.cos(t) * 128,
        r = Math.sin(t) * 128;
      if ((r > 88 && Math.abs(n) < 42) || Math.abs(n) > 148 || Math.abs(r) > 148) continue;
      let i = new Mesh(cylinderGeo(0.24, 0.32, 1.7, 12), mat(`#8b5a2b`));
      i.position.set(n, 0.85, r);
      let a = new Mesh(sphereGeo(1.25, 16, 12), mat(`#1f7a34`));
      a.position.set(n, 2.25, r);
      let s = buildFlame();
      (s.position.set(n, 3.2, r),
        scene.add(i, a, s),
        obstacles.push({
          x: n,
          z: r,
          r: 0.8,
        }),
        trees.push({
          x: n,
          z: r,
          r: 1.25,
          fire: 0,
          flames: s,
        }));
    }
    let ne = [],
      re = [],
      ie = new Group();
    {
      let e = new TextureLoader(),
        t = e.load(`course/pads.jpg`),
        n = e.load(`course/net.jpg`);
      ((t.colorSpace = SRGBColorSpace),
        (n.colorSpace = SRGBColorSpace),
        (t.anisotropy = 8),
        (n.anisotropy = 8));
      let r = new Mesh(
        circleGeo(30, 40),
        mat(`#5c4030`, {
          roughness: 1,
        }),
      );
      ((r.rotation.x = -Math.PI / 2), r.position.set(0, 0.02, 118), (r.receiveShadow = !0));
      let i = new Mesh(
        circleGeo(12, 36),
        mat(`#8d3a32`, {
          roughness: 0.92,
        }),
      );
      ((i.rotation.x = -Math.PI / 2),
        i.position.set(0, 0.035, 100),
        (i.receiveShadow = !0),
        scene.add(r, i));
      let a = [];
      for (let e = 0; e < 10; e++) {
        let t = (e / 10) * Math.PI * 2 - Math.PI / 2;
        a.push([0 + Math.cos(t) * 7.6, 100 + Math.sin(t) * 7.6]);
      }
      a.forEach(([e, n], r) => {
        let i = new Mesh(
          cylinderGeo(1.22, 1.22, 0.22, 22),
          mat(`#1f6fd6`, {
            roughness: 0.72,
            emissive: `#0a3d78`,
            emissiveIntensity: 0.12,
          }),
        );
        (i.position.set(e, 0.16, n), (i.castShadow = !0), (i.receiveShadow = !0));
        let s = new Mesh(
          circleGeo(1.16, 22),
          new MeshStandardMaterial({
            map: t,
            roughness: 0.78,
            metalness: 0.02,
          }),
        );
        ((s.rotation.x = -Math.PI / 2), s.position.set(e, 0.28, n), scene.add(i, s));
        let c = a[(r + 1) % a.length],
          l = c[0] - e,
          u = c[1] - n,
          d = Math.hypot(l, u) || 1,
          f = new Mesh(
            cylinderGeo(0.045, 0.045, d, 6),
            mat(`#2c3544`, {
              metalness: 0.55,
              roughness: 0.4,
            }),
          );
        (f.position.set(e + l / 2, 0.42, n + u / 2),
          f.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(l / d, 0, u / d)),
          scene.add(f),
          ne.push({
            x: e,
            z: n,
            r: 1.15,
            spring: !1,
            lit: [!1, !1, !1, !1],
            mesh: i,
          }));
      });
      let s = new Group();
      for (let e = 0; e < 5; e++) {
        let t = new Mesh(
          torusGeo(0.62, 0.07, 8, 18),
          mat(`#b7c0cc`, {
            metalness: 0.75,
            roughness: 0.28,
          }),
        );
        ((t.rotation.x = Math.PI / 2), (t.position.y = 0.12 + e * 0.1), s.add(t));
      }
      let c = new Mesh(
        cylinderGeo(1.7, 1.7, 0.26, 24),
        mat(`#d7dbe3`, {
          roughness: 0.48,
          metalness: 0.28,
        }),
      );
      c.position.y = 0.72;
      let l = new Mesh(
        circleGeo(1.55, 24),
        new MeshStandardMaterial({
          map: t,
          roughness: 0.7,
        }),
      );
      ((l.rotation.x = -Math.PI / 2),
        (l.position.y = 0.86),
        s.add(c, l),
        s.position.set(0, 0, 100),
        scene.add(s),
        ne.push({
          x: 0,
          z: 100,
          r: 1.55,
          spring: !0,
          lit: [!1, !1, !1, !1],
          mesh: c,
        }));
      // 2.0: tukevampi ripustusilta – paksumpi kansi, kaiteet, ripustusvaijerit
      let u = new Mesh(
        new BoxGeometry(Cl * 2 + 0.4, 0.22, 20),
        new MeshStandardMaterial({
          map: n,
          roughness: 0.55,
          metalness: 0.08,
        }),
      );
      (u.position.set(0, Sl, 132), (u.receiveShadow = u.castShadow = !0), scene.add(u));
      let d = mat(`#cbb89a`, { roughness: 0.75 }),
        f = new Mesh(new BoxGeometry(Cl * 2 + 0.4, 0.18, 10), d);
      (f.position.set(0, Sl / 2, 117), (f.rotation.x = -Math.atan2(Sl, 10)));
      let p = new Mesh(new BoxGeometry(Cl * 2 + 0.4, 0.18, 10), d);
      (p.position.set(0, Sl / 2, 147), (p.rotation.x = Math.atan2(Sl, 10)), scene.add(f, p));
      let m = mat(`#adb5bd`, { metalness: 0.7, roughness: 0.28 }),
        h = mat(`#f59f00`, { roughness: 0.45, emissive: `#f59f00`, emissiveIntensity: 0.15 }),
        wood = mat(`#8d6e4c`, { roughness: 0.82 }),
        g = new Mesh(cylinderGeo(0.14, 0.14, 20, 12), m);
      ((g.rotation.x = Math.PI / 2), g.position.set(0, 1.55, 0), ie.add(g));
      for (let e = 0; e < 8; e++) {
        let t = -9.2 + e * 2.6,
          n = new Mesh(cylinderGeo(0.04, 0.04, Cl * 2 + 0.2, 6), h);
        ((n.rotation.z = Math.PI / 2), n.position.set(0, -0.05, t), ie.add(n));
      }
      {
        let a = new BoxGeometry(Cl * 2 - 0.15, 0.08, 0.55);
        for (let t = -9.6; t <= 9.61; t += 0.7) {
          let o = new Mesh(a, wood);
          (o.position.set(0, 0.14, t), (o.receiveShadow = !0), ie.add(o));
        }
      }
      // kaiteet + pystytolpat
      for (let e = -1; e <= 1; e += 2) {
        let rail = new Mesh(cylinderGeo(0.07, 0.07, 20, 8), m);
        ((rail.rotation.x = Math.PI / 2), rail.position.set(e * (Cl + 0.15), 0.95, 0), ie.add(rail));
        let rail2 = new Mesh(cylinderGeo(0.05, 0.05, 20, 8), m);
        ((rail2.rotation.x = Math.PI / 2), rail2.position.set(e * (Cl + 0.15), 0.55, 0), ie.add(rail2));
        for (let z = -9; z <= 9; z += 3) {
          let post = new Mesh(cylinderGeo(0.06, 0.06, 1.05, 6), m);
          (post.position.set(e * (Cl + 0.15), 0.52, z), ie.add(post));
        }
      }
      // ripustusvaijerit tornista kannelle (riippusiltamainen)
      for (let e = -1; e <= 1; e += 2) {
        for (let side of [-1, 1]) {
          let cable = new Mesh(cylinderGeo(0.025, 0.025, 11.5, 6), mat(`#dee2e6`, { metalness: 0.85, roughness: 0.25 }));
          cable.position.set(side * (Cl + 0.1), 2.4, e * 8);
          cable.rotation.z = side * 0.55;
          cable.rotation.x = e * 0.35;
          ie.add(cable);
        }
      }
      (ie.position.set(0, Sl, 132), scene.add(ie));
      for (let e of [122, 142])
        for (let t of [-3.5, 3.5]) {
          let n = new Mesh(cylinderGeo(0.16, 0.2, 3.5500000000000003, 10), m);
          (n.position.set(t, 3.5500000000000003 / 2, e),
            (n.castShadow = !0),
            scene.add(n),
            obstacles.push({
              x: t,
              z: e,
              r: 0.42,
            }));
        }
      [
        [-8, `course/pads.jpg`],
        [8, `course/net.jpg`],
      ].forEach(([t, n]) => {
        let r = e.load(n);
        r.colorSpace = SRGBColorSpace;
        let i = new Mesh(
          new PlaneGeometry(6.4, 4.4),
          new MeshStandardMaterial({
            map: r,
            roughness: 0.6,
            side: 2,
          }),
        );
        (i.position.set(t, 2.5, 109), (i.rotation.y = Math.PI));
        let a = new Mesh(cylinderGeo(0.1, 0.12, 2.4, 8), mat(`#6b4a2b`));
        (a.position.set(t, 1.2, 109.3), scene.add(i, a));
      });
      let _ = [t, n];
      [62, 74, 86].forEach((e, t) => {
        let n = new Mesh(
          new BoxGeometry(7.2, 0.12, 4.4),
          new MeshStandardMaterial({
            map: _[t % 2],
            roughness: 0.72,
          }),
        );
        (n.position.set(0, 0.08, e),
          (n.receiveShadow = !0),
          scene.add(n),
          re.push({
            x: 0,
            z: e,
            hw: 3.6,
            hh: 2.2,
            got: [!1, !1, !1, !1],
          }));
      });
      let v = new Mesh(
        new PlaneGeometry(4.6, 1.5),
        new MeshStandardMaterial({
          map: Ql(`KIKKAILURATA`, `kiekot, silta ja tehtävät`, `#102430`, `#f6c445`),
          roughness: 0.5,
        }),
      );
      // 1.9: yksipuolinen kyltti kohti tulijaa (-z) + takalevy, ei peilikuvaa
      ((v.rotation.y = Math.PI), v.position.set(0, 2.4, 93), scene.add(v));
      {
        let bk = new Mesh(new BoxGeometry(4.8, 1.7, 0.1), mat(`#2b3340`));
        (bk.position.set(0, 2.4, 93.07), scene.add(bk));
        for (let x of [-2.1, 2.1]) {
          let po = new Mesh(cylinderGeo(0.07, 0.07, 1.7, 8), mat(`#6b4a2b`));
          (po.position.set(x, 0.85, 93.07), scene.add(po));
        }
      }
    }
    let targets = [];
    function addTarget(e, t, n, r, i, a, s) {
      (scene.add(e),
        targets.push({
          mesh: e,
          x: t,
          z: n,
          y: r,
          r: i,
          alive: !0,
          t: 0,
          bob: a,
          points: s,
        }));
    }
    for (let e = 0; e < 8; e++) {
      let t = Math.cos((e / 8) * Math.PI * 2) * 7,
        n = Math.sin((e / 8) * Math.PI * 2) * 5,
        r = new Mesh(
          sphereGeo(0.45, 24, 18),
          mat(`#ff5a36`, {
            emissive: `#ff5a36`,
            emissiveIntensity: 0.25,
          }),
        );
      r.position.set(t, 1.3, n);
      let i = new Mesh(sphereGeo(0.07, 8, 8), mat(`#1a1a1a`));
      i.position.set(-0.12, 0.08, 0.38);
      let a = i.clone();
      ((a.position.x = 0.12), r.add(i, a), addTarget(r, t, n, 1.3, 0.85, !0, 1));
    }
    function oe(e, t, n, r) {
      let i = new Group();
      addMesh(i, cylinderGeo(0.06, 0.08, 1.35, 6), mat(`#6b4a2b`), 0, 0.65, 0);
      let a = 1.25 + n * 0.2;
      ([
        [1, `#f7f1e6`, 0],
        [0.72, `#1a1a1a`, 0.012],
        [0.48, `#ff3b30`, 0.02],
        [0.26, `#ffd60a`, 0.028],
        [0.12, `#1a1a1a`, 0.036],
      ].forEach(([e, t, r]) => {
        let o = addMesh(
          i,
          cylinderGeo(Math.max(0.05, n * e), Math.max(0.05, n * e), 0.06, 24),
          mat(t),
          0,
          a,
          r,
        );
        o.rotation.x = Math.PI / 2;
      }),
        i.position.set(e, 0, t),
        (i.rotation.y = r),
        addTarget(i, e, t, a, Math.max(0.28, n * 0.95), !1, n < 0.4 ? 2 : 1));
    }
    ([
      [-12, 0.7],
      [-6, 0.42],
      [0, 0.28],
      [6, 0.42],
      [12, 0.7],
    ].forEach(([e, t]) => oe(e, 8, t, Math.PI)),
      [-14, -7, 0, 7, 14].forEach((e) => oe(e, 26, 0.5, Math.PI)),
      [
        [32, -8],
        [32, 10],
        [-32, -8],
        [-32, 12],
      ].forEach(([e, t]) => oe(e, t, 0.62, e > 0 ? -Math.PI / 2 : Math.PI / 2)));
    let se = Gl();
    function P(e, t, n) {
      let r = document.createElement(`canvas`);
      ((r.width = 1024), (r.height = 256));
      let i = r.getContext(`2d`);
      ((i.fillStyle = t),
        i.fillRect(0, 0, 1024, 256),
        (i.fillStyle = n),
        (i.font = `700 156px sans-serif`),
        (i.textAlign = `center`),
        (i.textBaseline = `middle`),
        i.fillText(e, 512, 136));
      let a = new CanvasTexture(r);
      a.colorSpace = SRGBColorSpace;
      let o = new Mesh(
        new PlaneGeometry(4.4, 1.1),
        new MeshStandardMaterial({
          map: a,
          roughness: 0.6,
        }),
      );
      return ((o.castShadow = !0), o);
    }
    let F = new Mesh(
      new BoxGeometry(22, 0.06, 10),
      mat(`#2c313c`, {
        roughness: 0.92,
      }),
    );
    (F.position.set(0, 0.03, -31), (F.receiveShadow = !0), scene.add(F));
    for (let e of [-9, -3, 3, 9]) {
      let t = new Mesh(new BoxGeometry(0.12, 0.02, 6.2), mat(`#f4efe6`));
      (t.position.set(e - 1.6, 0.08, -31), scene.add(t));
    }
    for (let e of [-10.2, 10.2]) {
      let t = new Mesh(new BoxGeometry(0.28, 3.1, 0.28), mat(`#f6c445`));
      (t.position.set(e, 1.55, -34.6), scene.add(t));
    }
    let I = new Mesh(
      new BoxGeometry(21.2, 0.16, 5.2),
      mat(`#e03131`, {
        roughness: 0.55,
      }),
    );
    (I.position.set(0, 3.15, -32.2), (I.castShadow = !0), scene.add(I));
    let ce = P(`VARIKKO`, `#f6c445`, `#102430`);
    (ce.position.set(0, 2.35, -34.85), scene.add(ce));
    let le = document.createElement(`canvas`);
    ((le.width = 2048), (le.height = 512));
    let ue = le.getContext(`2d`);
    ((ue.fillStyle = `#c2410c`),
      ue.fillRect(0, 0, 2048, 512),
      (ue.fillStyle = `#e8590c`),
      ue.fillRect(40, 28, 1968, 456),
      (ue.fillStyle = `#fff6d0`),
      ue.fillRect(40, 28, 1968, 36),
      ue.fillRect(40, 448, 1968, 36));
    for (let e = 0; e < 14; e++) {
      let t = 80 + e * 140;
      ((ue.fillStyle = e % 2 ? `#ffd60a` : `#fffef6`),
        ue.beginPath(),
        ue.moveTo(t, 90),
        ue.lineTo(t + 90, 256),
        ue.lineTo(t, 422),
        ue.lineTo(t + 34, 422),
        ue.lineTo(t + 124, 256),
        ue.lineTo(t + 34, 90),
        ue.closePath(),
        ue.fill());
    }
    let de = new CanvasTexture(le);
    ((de.colorSpace = SRGBColorSpace), (de.anisotropy = 16));
    let fe = new MeshStandardMaterial({
      map: de,
      roughness: 0.42,
      metalness: 0.04,
    });
    scene.add(Nl(fe));
    // 1.9: luiskan kiinteät sivuseinät, takaseinä ja kaiteet (näyttää umpinaiselta muualta kuin ajosuunnasta)
    {
      let sh = new Shape();
      sh.moveTo(40, 0);
      for (let k = 0; k <= 24; k++) {
        let x = 40 + (k / 24) * (wl - 40);
        sh.lineTo(x, Ml(x, 0) + 0.12);
      }
      (sh.lineTo(wl + 0.3, El + 0.12), sh.lineTo(wl + 0.3, 0), sh.closePath());
      let geo = new ExtrudeGeometry(sh, { depth: 0.24, bevelEnabled: !1 }),
        cm = mat(`#8a8f98`, { roughness: 0.9 }),
        stripe = (() => {
          let c = document.createElement(`canvas`);
          ((c.width = 256), (c.height = 64));
          let g = c.getContext(`2d`);
          ((g.fillStyle = `#ffd60a`), g.fillRect(0, 0, 256, 64), (g.fillStyle = `#111`));
          for (let k = -2; k < 10; k++) (g.beginPath(), g.moveTo(k * 32, 64), g.lineTo(k * 32 + 16, 64), g.lineTo(k * 32 + 48, 0), g.lineTo(k * 32 + 32, 0), g.fill());
          let t = new CanvasTexture(c);
          return ((t.colorSpace = SRGBColorSpace), (t.wrapS = RepeatWrapping), t.repeat.set(3, 1), t);
        })();
      for (let side of [-1, 1]) {
        let m = new Mesh(geo, cm);
        (m.position.set(0, 0, side > 0 ? Tl : -Tl - 0.24), (m.castShadow = m.receiveShadow = !0), scene.add(m));
        let rail = new Mesh(new BoxGeometry(wl - 40 + 0.3, 0.12, 0.3), mat(`#e03131`));
        let mid = (40 + wl) / 2;
        (rail.position.set(mid, Ml(mid, 0) + 0.3, side * (Tl + 0.12)), (rail.rotation.z = Math.atan2(El, wl - 40) * 0.95), scene.add(rail));
      }
      let back = new Mesh(new BoxGeometry(0.3, El + 0.12, Tl * 2 + 0.48), cm);
      (back.position.set(wl + 0.15, (El + 0.12) / 2, 0), (back.castShadow = back.receiveShadow = !0), scene.add(back));
      let band = new Mesh(new PlaneGeometry(Tl * 2 + 0.48, 0.5), new MeshStandardMaterial({ map: stripe, roughness: 0.6 }));
      (band.position.set(wl + 0.31, El - 0.3, 0), (band.rotation.y = Math.PI / 2), scene.add(band));
      for (let k = 0; k < 3; k++) {
        let x = 43 + k * 2.6,
          h = Ml(x, 0);
        for (let side of [-1, 1]) {
          let p = new Mesh(new BoxGeometry(0.16, 0.16, 0.05), mat(`#ffd60a`));
          (p.position.set(x, h * 0.5, side * (Tl + 0.26)), scene.add(p));
        }
      }
      // 2.0: lähestymis-vauhtityyny (x≈34) + laskeutumisluiska x>wl + etäisyysmerkit
      {
        let pad = new Mesh(new BoxGeometry(6.5, 0.08, Tl * 1.7), mat(`#1fb6ff`, { emissive: `#1fb6ff`, emissiveIntensity: 0.7, roughness: 0.55 }));
        (pad.position.set(34.2, 0.04, 0), (pad.receiveShadow = !0), scene.add(pad));
        let arr = new Mesh(new BoxGeometry(2.2, 0.06, 0.5), mat(`#fff6d0`, { emissive: `#ffffff`, emissiveIntensity: 0.5 }));
        (arr.position.set(36.4, 0.09, 0), scene.add(arr));
        window.__rampBoostPad = { x: 34.2, z: 0, rx: 3.4, rz: Tl * 0.9 };
        // laskeutumisluiska pehmeäksi (loiva rinne)
        let land = new Mesh(new BoxGeometry(18, 0.18, Tl * 2.2), mat(`#2b8a3e`, { roughness: 0.85 }));
        (land.position.set(wl + 10, 0.05, 0), (land.rotation.z = -0.04), (land.receiveShadow = !0), scene.add(land));
        for (let m = 5; m <= 30; m += 5) {
          let pole = new Mesh(new BoxGeometry(0.12, 1.4, 0.12), mat(`#fff6d0`));
          (pole.position.set(wl + m, 0.7, Tl + 1.1), scene.add(pole));
          let lb = P(m + ` m`, `#102430`, `#fff6d0`);
          (lb.position.set(wl + m, 1.55, Tl + 1.1), scene.add(lb));
        }
      }
    }
    let pe = document.createElement(`canvas`);
    ((pe.width = 2048), (pe.height = 1024));
    let L = pe.getContext(`2d`),
      R = new CanvasTexture(pe);
    ((R.colorSpace = SRGBColorSpace), (R.anisotropy = 8));
    // 1.9: laskeutumisalue – maassa vain metriviivat (luettavissa luiskalta päin) ja
    // viimeisimpien hyppyjen merkit pelaajan värillä. Tulokset näkyvät erillisessä taulussa.
    let jumpLog = [];
    function me() {
      let n = pe.width,
        r = pe.height;
      ((L.fillStyle = `#1864ab`),
        L.fillRect(0, 0, n, r),
        (L.fillStyle = `#1c7ed6`),
        L.fillRect(28, 28, n - 56, r - 56),
        (L.textAlign = `center`),
        (L.textBaseline = `middle`));
      let lbl = (x, y, txt, col, size) => {
        (L.save(),
          L.translate(x, y),
          L.rotate(Math.PI / 2),
          (L.fillStyle = col),
          (L.font = `800 ${size}px sans-serif`),
          L.fillText(txt, 0, 0),
          L.restore());
      };
      for (let e = 1; e <= 21; e++) {
        let t = (e / 22) * n,
          a = e % 5 == 0;
        ((L.strokeStyle = a ? `#ffffff` : `rgba(255,255,255,0.38)`),
          (L.lineWidth = a ? 10 : 3),
          L.beginPath(),
          L.moveTo(t, 80),
          L.lineTo(t, r - 80),
          L.stroke());
        a && (lbl(t - 52, 170, `${e} m`, `#ffffff`, 84), lbl(t - 52, r - 170, `${e} m`, `#ffffff`, 84));
      }
      jumpLog.forEach((j, k) => {
        let x = Math.max(24, Math.min(n - 24, (j.dist / 22) * n)),
          y0 = 300 + k * 110;
        ((L.fillStyle = j.color), L.fillRect(x - 9, 250, 18, r - 500));
        (L.beginPath(), L.arc(x, y0 + 20, 34, 0, Math.PI * 2), L.fill());
        lbl(x, y0 + 20, `P${j.player + 1}`, `#102430`, 34);
      });
      R.needsUpdate = !0;
    }
    me();
    let he = new Mesh(
      new PlaneGeometry(22, 10.4),
      new MeshStandardMaterial({
        map: R,
        roughness: 0.62,
        metalness: 0.02,
      }),
    );
    ((he.rotation.x = -Math.PI / 2),
      he.position.set(60.2, 0.055, 0),
      (he.receiveShadow = !0),
      scene.add(he));
    function ge(e, t, n, r) {
      let i = document.createElement(`canvas`);
      ((i.width = 640), (i.height = 384));
      let a = i.getContext(`2d`),
        o = new CanvasTexture(i);
      o.colorSpace = SRGBColorSpace;
      let s = new Mesh(
        new PlaneGeometry(3.6, 2.15),
        new MeshStandardMaterial({
          map: o,
          roughness: 0.45,
          side: 2,
        }),
      );
      s.castShadow = !0;
      let c = (e, t, n, r) => {
        ((a.fillStyle = n),
          a.fillRect(0, 0, 640, 384),
          (a.fillStyle = r),
          (a.textAlign = `center`),
          (a.textBaseline = `middle`),
          (a.font = `800 150px sans-serif`),
          a.fillText(e, 320, 140),
          (a.font = `700 92px sans-serif`),
          a.fillText(t, 320, 270),
          (o.needsUpdate = !0));
      };
      return (
        c(e, t, n, r),
        {
          mesh: s,
          draw: c,
        }
      );
    }
    // 1.9: hyppytulostaulu (vain tämä pelikerta, 4 viimeisintä, pelaajan värillä)
    let jumpBoard = (() => {
      let cv = document.createElement(`canvas`);
      ((cv.width = 1024), (cv.height = 640));
      let g = cv.getContext(`2d`),
        tex = new CanvasTexture(cv);
      tex.colorSpace = SRGBColorSpace;
      let grp = new Group(),
        face = new Mesh(new PlaneGeometry(5.2, 3.25), new MeshStandardMaterial({ map: tex, roughness: 0.5 }));
      ((face.position.set(0, 2.75, 0.09), grp.add(face)));
      let back = new Mesh(new BoxGeometry(5.5, 3.5, 0.16), mat(`#3b4350`, { roughness: 0.8 }));
      ((back.position.set(0, 2.75, 0), (back.castShadow = !0), grp.add(back)));
      for (let x of [-2.2, 2.2]) {
        let post = new Mesh(new BoxGeometry(0.2, 1.2, 0.2), mat(`#5c6470`));
        (post.position.set(x, 0.6, -0.02), (post.castShadow = !0), grp.add(post));
      }
      (grp.position.set(74.5, 0, -8.2), (grp.rotation.y = -Math.PI / 2 + 0.5), scene.add(grp));
      obstacles.push({ x: 74.5 - 2.2 * Math.cos(0.5) * 0, z: -8.2, r: 1.5 }, { x: 73.4, z: -6.3, r: 0.6 }, { x: 75.6, z: -10.1, r: 0.6 });
      let draw = () => {
        ((g.fillStyle = `#102430`), g.fillRect(0, 0, 1024, 640));
        ((g.fillStyle = `#ffd60a`), g.fillRect(0, 0, 1024, 120));
        ((g.fillStyle = `#102430`), (g.textAlign = `center`), (g.textBaseline = `middle`), (g.font = `800 74px sans-serif`));
        g.fillText(`HYPPYTULOKSET`, 512, 64);
        g.textAlign = `left`;
        if (!jumpLog.length) {
          ((g.fillStyle = `#d0ebff`), (g.font = `700 52px sans-serif`), g.fillText(`Aja luiskaa – ensimmäinen hyppy tänne!`, 40, 330));
        }
        jumpLog.forEach((j, k) => {
          let y = 190 + k * 118;
          ((g.fillStyle = k == 0 ? `rgba(255,255,255,0.12)` : `rgba(255,255,255,0.04)`), g.fillRect(24, y - 50, 976, 102));
          ((g.fillStyle = j.color), g.fillRect(24, y - 50, 16, 102));
          ((g.fillStyle = j.color), (g.font = `800 58px sans-serif`), (g.textAlign = `left`));
          g.fillText(j.name.slice(0, 14), 64, y);
          ((g.textAlign = `right`), (g.fillStyle = `#ffffff`), (g.font = `800 62px sans-serif`));
          g.fillText(`${j.dist.toFixed(1)} m`, 780, y);
          ((g.fillStyle = `#ffe066`), (g.font = `700 44px sans-serif`));
          g.fillText(`${j.kmh} km/h`, 990, y + 4);
        });
        tex.needsUpdate = !0;
      };
      return (draw(), { draw, group: grp });
    })();
    function logJump(pi, dist, speed) {
      let pl = players[pi];
      (jumpLog.unshift({
        player: pi,
        name: window.HYYTE?.stats?.names?.()?.[pi] || pl?.name || `P${pi + 1}`,
        color: pl?.color || PLAYER_COLORS?.[pi] || `#ffd60a`,
        dist,
        kmh: Math.round(speed * 3.6),
      }),
        (jumpLog.length = Math.min(4, jumpLog.length)),
        me(),
        jumpBoard.draw());
      try { window.HYYTE?.emit?.(`rampJump`, pi, dist, speed); } catch (e) {}
    }
    let z = P(`HYPPY`, `#ffd60a`, `#102430`);
    (z.position.set(39.8, 2.2, 0), (z.rotation.y = -Math.PI / 2), scene.add(z));
    const CAR_DEFS = {
      normal: { accel: 28, top: 19, bigRear: !1, mass: 1.1, fly: !1 },
      toy: { accel: 38, top: 14, bigRear: !1, mass: 0.55, fly: !1, scale: 0.62 },
      sports: { accel: 52, top: 28, bigRear: !0, mass: 0.95, fly: !1 },
      flying: { accel: 32, top: 22, bigRear: !1, mass: 0.8, fly: !0 },
    };
    const CAR_COLORS = [`#2f9e44`, `#f6c445`, `#e03131`, `#1c7ed6`, `#be4bdb`, `#15aabf`, `#ff922b`, `#fab005`];
    // 2.0: autot pelaajien talliin (setup.carType / carColor); fallback VARIKKO
    let carSpecs = (options.players || [options.p1, options.p2]).slice(0, 12).map((s, i) => {
      let typ = (s && s.carType) || [`normal`, `sports`, `toy`, `flying`][i] || `normal`;
      if (!CAR_DEFS[typ]) typ = `normal`;
      let def = CAR_DEFS[typ];
      let hex = (s && s.carColor) || CAR_COLORS[i % CAR_COLORS.length];
      let gpos = null;
      try { gpos = window.HYYTE?.homes?.garage?.(i); } catch (_) {}
      // garage API may not be ready until onStart – use HOMES offsets
      const HOMES = [{ x: -54, z: -168 }, { x: 33, z: -168 }, { x: -141, z: -168 }, { x: 144, z: -168 }];
      let hx = HOMES[i] ? HOMES[i].x + 13 : [-9, -3, 3, 9][i],
        hz = HOMES[i] ? HOMES[i].z + 1 : -31;
      if (gpos && gpos.x != null) { hx = gpos.x; hz = gpos.z; }
      return { hex, x: hx, z: hz, yaw: 0, typ, ...def };
    });
    let cars = carSpecs.map((e) => {
        let t = buildCarModel(e.hex, e.bigRear, e.typ);
        t.position.set(e.x, 0, e.z);
        if (e.scale) t.scale.setScalar(e.scale);
        let n = buildSlimeCoat();
        return (
          n.scale.setScalar(1.7 * (e.scale || 1)),
          scene.add(t, n),
          {
            group: t,
            pos: t.position,
            yaw: e.yaw ?? 0,
            speed: 0,
            occupied: null,
            accel: e.accel,
            top: e.top,
            bigRear: e.bigRear,
            carType: e.typ,
            fly: !!e.fly,
            mass: e.mass || 1,
            slow: 0,
            spin: 0,
            spinDir: 1,
            coat: n,
            y: 0,
            vy: 0,
            vx: 0,
            vz: 0,
            sliding: !1,
            nitro: 0,
            oil: 0,
            portalCd: 0,
            airT: 0,
            scoredHop: !1,
            hopSpeed: 0,
            puff: 0,
          }
        );
      }),
      players = (options.players || [options.p1, options.p2]).slice(0, 12).map((e, t) => {
        let r = (e.weapons ?? [])
          .filter((e, t, n) => WEAPONS.some((t) => t.id === e) && n.indexOf(e) === t)
          .slice(0, 12);
        const PC = PLAYER_COLORS[t];
        r.length === 0 && r.push(`star`);
        let i = buildHeroModel(e.hero),
          a = buildWeaponModel(r[0]);
        (i.add(a), i.scale.setScalar(1.35));
        let s = !!options.challenge,
          c = s ? [-88, 88, -88, 88][t] : [-9, 3, -3, 9][t],
          l = s ? [10, 10, -20, -20][t] : -26.7;
        i.position.set(c, 0, l);
        let u = new Mesh(
          torusGeo(0.36, 0.055, 6, 14),
          mat(PC, {
            emissive: PC,
            emissiveIntensity: 0.25,
          }),
        );
        ((u.rotation.x = Math.PI / 2), (u.position.y = 0.72), i.add(u));
        let d = 10 + t;
        (i.layers.set(d), i.traverse((e) => e.layers.set(d)), scene.add(i));
        let f = new Mesh(
          circleGeo(0.7, 20),
          mat(PC, {
            emissive: PC,
            emissiveIntensity: 0.45,
          }),
        );
        ((f.rotation.x = -Math.PI / 2),
          f.position.set(i.position.x, 0.05, i.position.z),
          f.layers.set(d),
          scene.add(f));
        let p = buildBeachBall(),
          m = buildEjectSeat(),
          h = buildSlimeCoat(),
          g = makeHealthBar(PC);
        g.sprite.layers.set(d);
        return (
          drawHealthBar(g.ctx, g.tex, 100, PC),
          scene.add(p, m, h, g.sprite),
          {
            index: t,
            hero: e.hero,
            weapon: r[0],
            weapons: r,
            slot: 0,
            group: i,
            pos: i.position.clone(),
            yaw: s ? (t % 2 === 0 ? -Math.PI / 2 : Math.PI / 2) : 0,
            color: PC,
            moon: !1,
            running: !1,
            vy: 0,
            grounded: !0,
            cd: 0,
            score: 0,
            speed: 0,
            hpFlash: 0,
            hurt: 0,
            swing: 0,
            weaponGroup: a,
            disc: f,
            camDist: 9,
            camLift: 4.4,
            firstPerson: !1,
            car: null,
            enterLock: 0,
            heldInteract: !1,
            heldCam: !1,
            heldSwap: !1,
            hp: 100,
            repair: 0,
            down: 0,
            air: `none`,
            airT: 0,
            chute: p,
            seat: m,
            slow: 0,
            spin: 0,
            spinDir: 1,
            coat: h,
            nitro: 0,
            canCd: 0,
            portalCd: 0,
            bar: g.sprite,
            barCtx: g.ctx,
            barShown: 100,
            rounds: 0,
            padLock: 0,
            courseBonus: !1,
            bridgeBonus: !1,
            rocket: !1,
            pitch: -1.15,
            heldJump: !1,
          }
        );
      }),
      cameras = players.map(() => {
        let e = new PerspectiveCamera(62, 1, 0.1, 520);
        for (let k = 0; k < 12; k++) e.layers.enable(10 + k);
        return (e.layers.enable(1), e);
      }),
      projectiles = [],
      ye = [],
      laserBolts = [],
      xe = new Vector3(0, 1, 0),
      Se = new Vector3(),
      Ce = [],
      we = [],
      Te = [],
      Ee = sphereGeo(0.26, 10, 8),
      De = mat(`#e7edf5`, {
        transparent: !0,
        opacity: 0.55,
        roughness: 0.9,
      }),
      keysDown = /* @__PURE__ */ new Set(),
      touchKeys = {
        0: /* @__PURE__ */ new Set(),
        1: /* @__PURE__ */ new Set(),
        2: /* @__PURE__ */ new Set(),
        3: /* @__PURE__ */ new Set(),
      },
      testKeys = null,
      running = !0,
      timer = new Timer();
    timer.connect(document);
    let onKeyDown = (e) => {
        (keysDown.add(e.code),
          [`Space`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`].includes(e.code) &&
            e.preventDefault());
      },
      onKeyUp = (e) => keysDown.delete(e.code),
      onBlur = () => keysDown.clear();
    (window.addEventListener(`keydown`, onKeyDown),
      window.addEventListener(`keyup`, onKeyUp),
      window.addEventListener(`blur`, onBlur));
    function isKeyDown(e) {
      return testKeys ? testKeys.has(e) : keysDown.has(e);
    }
    // 1.8: näppäimistö + Xbox-ohjain (gamepad.js) yhdistetään
    function readInput(e) {
      let k = readKeys(e),
        g = window.HYYTE_PAD?.state(e);
      if (g) {
        for (let n in g) n === `f` || n === `turn` ? k[n] === 0 && (k[n] = g[n]) : (k[n] = k[n] || g[n]);
      }
      const tc = window.HYYTE?.touch?.state?.(e);
      if (tc) {
        if (!k.f) k.f = tc.f || 0;
        if (!k.turn) k.turn = tc.turn || 0;
        for (const n of [`jump`, `fire`, `interact`, `camera`, `drift`, `swap`, `eat`, `run`, `wallet`]) k[n] = k[n] || !!tc[n];
        if (tc.orbit) k.orbit = (k.orbit || 0) + tc.orbit;
        k.camUp = k.camUp || !!tc.camUp;
        k.camDown = k.camDown || !!tc.camDown;
      }
      return k;
    }
    // 1.9: näppäinsarja pelaajan laitteen mukaan (HYYTE.devices: kb = 'wasd' | 'arrows' | null)
    function kbSetOf(e) {
      let d = options.devices?.[e];
      return d ? d.kb || null : e === 0 ? `wasd` : e === 1 ? `arrows` : null;
    }
    function readKeys(e) {
      let t = touchKeys[e] || new Set(),
        K = window.HYYTE?.KB?.[kbSetOf(e)],
        any = (L) => !!K && L.some((k) => isKeyDown(k)),
        n = any(K ? K.left : []) || t.has(`left`),
        r = any(K ? K.right : []) || t.has(`right`),
        i = any(K ? K.up : []) || t.has(`up`),
        a = any(K ? K.down : []) || t.has(`down`);
      return {
        f: !!i - +!!a,
        turn: !!n - +!!r,
        jump: (K && any(K.jump)) || t.has(`jump`),
        fire: (K && any(K.fire)) || t.has(`fire`),
        interact: (K && any(K.interact)) || t.has(`interact`),
        camera: (K && any(K.camera)) || t.has(`camera`),
        camIn: !!K && any(K.camIn),
        camOut: !!K && any(K.camOut),
        camUp: !!K && any(K.camUp),
        camDown: !!K && any(K.camDown),
        drift: (K && any(K.drift)) || t.has(`drift`),
        swap: (K && any(K.swap)) || t.has(`swap`),
        eat: !!K && any(K.eat),
        run: (K && any(K.run)) || t.has(`run`),
        wallet: (K && (any(K.wallet) || any(K.buy))) || t.has(`wallet`),
      };
    }
    let audioCtx = null;
    function beep(e, t = 0.05, n = `square`, r = 0.035) {
      try {
        ((audioCtx ||= new AudioContext()), audioCtx.state === `suspended` && audioCtx.resume());
        let i = audioCtx.createOscillator(),
          a = audioCtx.createGain();
        ((i.type = n), (i.frequency.value = e));
        let o = audioCtx.currentTime;
        (a.gain.setValueAtTime(r, o),
          a.gain.exponentialRampToValueAtTime(0.001, o + t),
          i.connect(a),
          a.connect(audioCtx.destination),
          i.start(o),
          i.stop(o + t));
      } catch {}
    }
    let Le = new Vector3();
    function disposeObject(e) {
      e.traverse((e) => {
        if (e instanceof Mesh) {
          e.geometry.dispose();
          let t = e.material;
          Array.isArray(t) ? t.forEach((e) => e.dispose()) : t.dispose();
        }
      });
    }
    function weaponName(e) {
      return WEAPONS.find((t) => t.id === e)?.name ?? e;
    }
    function cycleWeapon(e) {
      if (e.weapons.length < 2) return;
      ((e.slot = (e.slot + 1) % e.weapons.length),
        (e.weapon = e.weapons[e.slot]),
        e.group.remove(e.weaponGroup),
        disposeObject(e.weaponGroup),
        (e.weaponGroup = buildWeaponModel(e.weapon)));
      let t = 10 + e.index;
      (e.weaponGroup.layers.set(t),
        e.weaponGroup.traverse((e) => e.layers.set(t)),
        e.group.add(e.weaponGroup),
        beep(540, 0.04, `sine`, 0.03));
    }
    // 1.9: lähin toinen pelaaja samassa maailmassa (Maa / Kuu) lähitaisteluaseille
    const NO_FOE = { pos: new Vector3(1e6, 0, 1e6), hurt: 1, down: 0, hp: 100 };
    function nearestFoe(e) {
      let b = NO_FOE,
        bd = 1e18;
      for (let t of players) {
        if (t === e || t.moon !== e.moon || t.rocket) continue;
        let d = (t.pos.x - e.pos.x) ** 2 + (t.pos.z - e.pos.z) ** 2;
        d < bd && ((bd = d), (b = t));
      }
      return b;
    }
    function damagePlayer(e, t, n) {
      t <= 0 ||
        (n && n !== e && n.moon !== e.moon) ||
        e.hurt > 0 ||
        ((e.hp = Math.max(0, Math.round(e.hp - t))),
        (e.hpFlash = 0.35),
        (e.hurt = 0.55),
        beep(90, 0.08, `sawtooth`, 0.04),
        e.hp <= 0 &&
          ((e.hp = 40),
          (e.down = 1.2),
          n && n.index !== e.index && ((n.rounds += 1), (e.lastHitBy = n.index)),
          beep(70, 0.18, `triangle`, 0.06)));
    }
    function Be() {
      let e = new Group(),
        t = mat(`#39d353`, {
          transparent: !0,
          opacity: 0.9,
          emissive: `#1faa3a`,
          emissiveIntensity: 0.45,
          roughness: 0.12,
        }),
        n = addMesh(e, capsuleGeo(0.38, 2.24, 5, 10), t, 0, 0, 0);
      return (
        (n.rotation.x = Math.PI / 2),
        addMesh(e, sphereGeo(0.32, 8, 6), t, 0.22, 0.28, 0.5),
        addMesh(e, sphereGeo(0.24, 8, 6), t, -0.16, 0.22, -0.7),
        e
      );
    }
    function Ve() {
      let e = new Group(),
        t = addMesh(e, cylinderGeo(0.1, 0.12, 0.7, 8), mat(`#ff5a36`), 0, 0, 0);
      t.rotation.x = Math.PI / 2;
      let n = addMesh(e, coneGeo(0.12, 0.28, 8), mat(`#f6c445`), 0, 0, 0.48);
      n.rotation.x = Math.PI / 2;
      let r = addMesh(
        e,
        coneGeo(0.08, 0.24, 6),
        mat(`#ffd60a`, {
          emissive: `#ff6a00`,
          emissiveIntensity: 1.2,
        }),
        0,
        0,
        -0.46,
      );
      return ((r.rotation.x = -Math.PI / 2), e);
    }
    function He(e, t, n) {
      (Le.set(e.position.x + t, e.position.y, e.position.z + n), e.lookAt(Le));
    }
    function dropTrap(e, t = `banana`) {
      if (Ce.length > 10) {
        let e = Ce.shift();
        e && (scene.remove(e.mesh), disposeObject(e.mesh));
      }
      let n = dirVectors(e.yaw),
        r = new Group();
      if (t === `boost`) {
        // 1.9: Vauhtilätäkkö – hehkuva sininen lätäkkö nuolineen, laitetaan ETEEN
        let e = addMesh(r, circleGeo(1.5, 28), mat(`#1fb6ff`, { roughness: 0.1, metalness: 0.2, emissive: `#0a6bff`, emissiveIntensity: 0.9 }), 0, 0.06, 0);
        e.rotation.x = -Math.PI / 2;
        let o = addMesh(r, torusGeo(1.5, 0.08, 6, 32), mat(`#bff3ff`, { emissive: `#7fe3ff`, emissiveIntensity: 1 }), 0, 0.07, 0);
        o.rotation.x = -Math.PI / 2;
        for (let k = -1; k <= 1; k++) {
          let c = addMesh(r, coneGeo(0.32, 0.55, 3), mat(`#ffffff`, { emissive: `#ffffff`, emissiveIntensity: 0.8 }), 0, 0.1, k * 0.6);
          ((c.rotation.x = Math.PI / 2), (c.scale.y = 0.6), (c.rotation.order = `YXZ`));
        }
        r.rotation.y = 0;
      } else if (t === `oil`) {
        let e = addMesh(
          r,
          circleGeo(1.15, 18),
          mat(`#1a1c22`, {
            roughness: 0.15,
            metalness: 0.35,
          }),
          0,
          0.08,
          0,
        );
        e.rotation.x = -Math.PI / 2;
      } else if (t === `spike`)
        for (let e = 0; e < 5; e++) {
          let t = addMesh(
            r,
            coneGeo(0.06, 0.28, 5),
            mat(`#c5ccd6`, {
              metalness: 0.6,
            }),
            (e - 2) * 0.18,
            0.14,
            ((e % 2) - 0.5) * 0.16,
          );
          t.castShadow = !0;
        }
      else {
        let e = addMesh(r, torusGeo(0.28, 0.08, 6, 10, Math.PI * 1.2), mat(`#ffe14a`), 0, 0.12, 0);
        ((e.rotation.x = Math.PI / 2), (e.rotation.z = 0.4));
      }
      let ahead = t === `boost` ? (e.car != null ? 5 + Math.min(6, Math.abs(cars[e.car].speed) * 0.12) : 2.4) : -1.5,
        i = e.pos.x + n.fx * ahead,
        a = e.pos.z + n.fz * ahead;
      t === `boost` && ((r.rotation.y = Math.atan2(n.fx, n.fz)), (r.userData.spinFree = !0));
      (r.position.set(i, t === `boost` ? Math.max(0, Ml(i, a)) + 0.01 : 0, a),
        scene.add(r),
        Ce.push({
          mesh: r,
          x: i,
          z: a,
          life: t === `banana` ? 12 : t === `boost` ? 30 : 14,
          arm: t === `boost` ? 0 : 0.45,
          kind: t,
          hit: t === `boost` ? new Map() : null,
        }),
        beep(t === `oil` ? 90 : 240, 0.06, `sine`));
    }
    function We(e, t, n, r) {
      let i = !1;
      for (let t of targets)
        t.alive &&
          (t.x - e) ** 2 + (t.z - n) ** 2 < 6.8 &&
          ((t.alive = !1),
          (t.t = 2.2),
          (t.mesh.visible = !1),
          (players[r].score += t.points),
          (i = !0));
      for (let t of players)
        t.index !== r &&
          (t.pos.x - e) ** 2 + (t.pos.z - n) ** 2 < 5.2 &&
          ((t.vy = Math.max(t.vy, 6.2)),
          damagePlayer(t, 18, players[r]),
          (i ||= ((players[r].score += 1), !0)));
      for (let r = 0; r < 8; r++) {
        let i = (r / 8) * Math.PI * 2,
          a = new Mesh(
            sphereGeo(0.12, 6, 6),
            mat([`#ff5a36`, `#ffd60a`, `#3aa0ff`, `#30d158`][r % 4], {
              emissive: `#fff6d0`,
              emissiveIntensity: 0.5,
            }),
          );
        (a.position.set(e, t, n),
          scene.add(a),
          we.push({
            mesh: a,
            vx: Math.cos(i) * 7,
            vy: 2.5 + (r % 3),
            vz: Math.sin(i) * 7,
            life: 0.48,
          }));
      }
      beep(170, 0.12, `triangle`, 0.05);
    }
    function Ge(e, t, n, r, i, a, s = !1, c = 0) {
      let l = a === `boomerang` || a === `star` || a === `lighter`,
        u = a === `ball`,
        d = a === `slime`,
        f = a === `rocket`,
        plas = a === `plasma`,
        frz = a === `freeze`,
        p = d ? 0.55 : u ? 0.58 : plas ? 0.42 : frz ? 0.16 : a === `shotgun` ? 0.07 : f ? 0.2 : 0.1,
        m = d
          ? Be()
          : f
            ? Ve()
            : new Mesh(
                u
                  ? sphereGeo(p, 18, 14)
                  : a === `star`
                    ? new OctahedronGeometry(0.12)
                    : sphereGeo(p, plas ? 12 : 8, plas ? 10 : 6),
                u
                  ? new MeshStandardMaterial({
                      map: se,
                      roughness: 0.45,
                      metalness: 0.02,
                    })
                  : mat(
                      plas ? `#da77f2` : frz ? `#a5d8ff` : l ? `#ff6a00` : `#f4efe6`,
                      plas
                        ? { emissive: `#be4bdb`, emissiveIntensity: 1.1, transparent: !0, opacity: 0.88 }
                        : frz
                          ? { emissive: `#74c0fc`, emissiveIntensity: 1.0 }
                          : l
                            ? { emissive: `#ff4500`, emissiveIntensity: 0.8 }
                            : { emissive: `#fff`, emissiveIntensity: 0.2 },
                    ),
              ),
        h = d ? 2.8 : u ? 1.9 : f ? 1.3 : plas ? 1.2 : 0.7;
      (m.position.set(e.pos.x + t * h, (d ? 1.05 : u ? 1.35 : 1.15) + (e.pos.y || 0) * (e.moon ? 1 : 0), e.pos.z + n * h),
        m instanceof Mesh && (m.castShadow = !0),
        m instanceof Mesh && e.moon && m.material && (m.material.fog = !1, m.material.emissiveIntensity = Math.max(m.material.emissiveIntensity || 0, 0.85)),
        (d || f) && He(m, t, n),
        scene.add(m),
        projectiles.push({
          mesh: m,
          vx: t * r,
          vy: u ? 6.4 : d ? 0.6 : c,
          vz: n * r,
          life: u ? 8 : i,
          owner: e.index,
          kind: a,
          ret: s,
          age: 0,
          bouncy: u,
          radius: p,
          playerCd: 0,
          got: /* @__PURE__ */ new Set(),
        }));
    }
    function Ke(e, t) {
      let n = Math.cos(t),
        r = Math.sin(t),
        i = dirVectors(e);
      return {
        x: i.fx * n,
        y: r,
        z: i.fz * n,
      };
    }
    function qe() {
      return {
        x: kl,
        y: museum.rocket.position.y + 4.8,
        z: Al,
      };
    }
    function Je(e, t) {
      if (t.y > -0.08) return null;
      let n = (0.9 - e.y) / t.y;
      return n < 1
        ? null
        : {
            x: e.x + t.x * n,
            y: 0.9,
            z: e.z + t.z * n,
            dist: n,
          };
    }
    function spawnLaserBolt(e, t, n, r, i, a, s) {
      let c = new Group(),
        l = new Mesh(
          cylinderGeo(0.11, 0.11, 20, 8),
          mat(`#ffe4e6`, {
            emissive: `#ff1f2a`,
            emissiveIntensity: 2.8,
            fog: !1,
          }),
        ),
        u = new Mesh(
          cylinderGeo(0.38, 0.38, 20, 8),
          mat(`#ff3b30`, {
            emissive: `#ff2030`,
            emissiveIntensity: 1.7,
            transparent: !0,
            opacity: 0.5,
            fog: !1,
          }),
        );
      (c.add(l, u), Se.set(i, a, s), c.quaternion.setFromUnitVectors(xe, Se), scene.add(c));
      let d = {
        mesh: c,
        x: t,
        y: n,
        z: r,
        dx: i,
        dy: a,
        dz: s,
        life: 18,
        owner: e.index,
        hitP: /* @__PURE__ */ new Set(),
        hitT: /* @__PURE__ */ new Set(),
        hitTree: /* @__PURE__ */ new Set(),
      };
      (laserBolts.push(d),
        d.mesh.position.set(t + i * 20 * 0.5, n + a * 20 * 0.5, r + s * 20 * 0.5));
    }
    function updateLaserBolts(e) {
      let t = 16.666666666666668 * e;
      for (let n = laserBolts.length - 1; n >= 0; n--) {
        let r = laserBolts[n];
        ((r.life -= e), (r.x += r.dx * t), (r.y += r.dy * t), (r.z += r.dz * t));
        let i = r.x + r.dx * 20,
          a = r.y + r.dy * 20,
          s = r.z + r.dz * 20;
        r.mesh.position.set((r.x + i) / 2, (r.y + a) / 2, (r.z + s) / 2);
        let c = players[r.owner];
        for (let e of players) {
          if (e.index === c.index || e.rocket || r.hitP.has(e.index)) continue;
          let t = e.car == null ? e.pos.x : cars[e.car].pos.x,
            n = e.car == null ? e.pos.z : cars[e.car].pos.z,
            o = (e.car == null ? e.pos.y : cars[e.car].y) + 1;
          Ze(r.x, r.y, r.z, i, a, s, t, o, n, 1.15) &&
            (r.hitP.add(e.index),
            damagePlayer(e, 18, c),
            (c.score += 1),
            beep(260, 0.07, `triangle`));
        }
        for (let e of targets)
          e.alive &&
            !r.hitT.has(e) &&
            Ze(r.x, r.y, r.z, i, a, s, e.x, e.y, e.z, e.r + 0.4) &&
            (r.hitT.add(e),
            (e.alive = !1),
            (e.t = 2.2),
            (e.mesh.visible = !1),
            (c.score += e.points),
            beep(620, 0.08, `sine`));
        for (let e of trees)
          r.hitTree.has(e) ||
            (Ze(r.x, r.y, r.z, i, a, s, e.x, 1.6, e.z, e.r + 0.5) &&
              (r.hitTree.add(e), (e.fire = 2.6), (e.flames.visible = !0)));
        {
          const ownerMoon = !!(c && c.moon) || r.z > 400 || r.y > 50;
          const earthKill = !ownerMoon && (Math.abs(i) > 340 || Math.abs(s) > 340);
          const moonKill = ownerMoon && (Math.hypot(i - 0, s - 1600) > 170 || a < -2);
          if (r.life <= 0 || (!ownerMoon && a < 0.15) || earthKill || moonKill) {
          if (a < 1.2) {
            let e = new Mesh(
              sphereGeo(0.7, 10, 8),
              mat(`#ffd0d4`, {
                emissive: `#ff2a2a`,
                emissiveIntensity: 2,
                transparent: !0,
                opacity: 0.9,
                fog: !1,
              }),
            );
            (e.position.set(i, Math.max(0.3, a), s),
              scene.add(e),
              ye.push({
                obj: e,
                life: 0.35,
              }));
          }
          (scene.remove(r.mesh), disposeObject(r.mesh), laserBolts.splice(n, 1));
        }
        }
      }
    }
    function Ze(e, t, n, r, i, a, o, s, c, l) {
      let u = r - e,
        d = i - t,
        f = a - n,
        p = u * u + d * d + f * f || 1,
        m = ((o - e) * u + (s - t) * d + (c - n) * f) / p;
      m = Math.max(0, Math.min(1, m));
      let h = e + u * m,
        g = t + d * m,
        _ = n + f * m;
      return (o - h) ** 2 + (s - g) ** 2 + (c - _) ** 2 < l * l;
    }
    function fireHandLaser(e) {
      let t = dirVectors(e.yaw);
      spawnLaserBolt(e, e.pos.x + t.fx * 1.3, e.pos.y + 1.15, e.pos.z + t.fz * 1.3, t.fx, 0, t.fz);
    }
    function fireRocketLaser(e) {
      let t = qe(),
        n = Ke(e.yaw, e.pitch);
      spawnLaserBolt(e, t.x, t.y, t.z, n.x, n.y, n.z);
    }
    function updateFiring(e, t) {
      if (((e.cd -= t), e.rocket)) {
        if (e.cd > 0) return;
        ((e.cd = 5), (e.swing = 1), fireRocketLaser(e), beep(980, 0.09, `square`, 0.05));
        return;
      }
      let n = dirVectors(e.yaw),
        r = e.weapon;
      if (r === `lighter`) {
        if (e.cd > 0) return;
        ((e.cd = 0.05),
          (e.swing = 1),
          beep(520, 0.05, `sawtooth`),
          Ge(e, n.fx, n.fz, 9, 0.28, `lighter`, !1, 0.4));
        return;
      }
      if (e.cd > 0) return;
      if (((e.swing = 1), r === `shield`)) {
        e.cd = 0.4;
        let t = nearestFoe(e),
          r = t.pos.x - e.pos.x,
          i = t.pos.z - e.pos.z;
        r * n.fx + i * n.fz > 0 &&
          r * r + i * i < 4 &&
          t.hurt <= 0 &&
          ((t.pos.x += n.fx * 1.4),
          (t.pos.z += n.fz * 1.4),
          (t.vy = 4),
          damagePlayer(t, 12, e),
          (e.score += 1),
          beep(180, 0.08, `square`));
        for (let t of projectiles) {
          if (t.owner === e.index) continue;
          let r = t.mesh.position.x - e.pos.x,
            i = t.mesh.position.z - e.pos.z;
          r * n.fx + i * n.fz > 0 && r * r + i * i < 2.2 && (t.life = 0);
        }
        return;
      }
      if (r === `axe`) {
        e.cd = 0.45;
        let t = nearestFoe(e),
          r = t.pos.x - e.pos.x,
          i = t.pos.z - e.pos.z;
        r * r + i * i < 2.6 &&
          r * n.fx + i * n.fz > 0.2 &&
          t.hurt <= 0 &&
          ((t.vy = 5),
          (t.pos.x += n.fx * 0.8),
          (t.pos.z += n.fz * 0.8),
          damagePlayer(t, 14, e),
          (e.score += 1),
          beep(140, 0.09, `square`));
        return;
      }
      if (r === `katana`) {
        e.cd = 0.38;
        let t = nearestFoe(e),
          r = t.pos.x - e.pos.x,
          i = t.pos.z - e.pos.z;
        r * r + i * i < 11.5 &&
          r * n.fx + i * n.fz > 0.15 &&
          t.hurt <= 0 &&
          ((t.vy = 4.2),
          (t.pos.x += n.fx * 1.1),
          (t.pos.z += n.fz * 1.1),
          damagePlayer(t, 16, e),
          (e.score += 1),
          beep(480, 0.07, `square`));
        for (let t of targets) {
          if (!t.alive) continue;
          let r = t.x - e.pos.x,
            i = t.z - e.pos.z;
          r * r + i * i < (t.r + 2.2) ** 2 &&
            r * n.fx + i * n.fz > 0.2 &&
            ((t.alive = !1),
            (t.t = 2.2),
            (t.mesh.visible = !1),
            (e.score += t.points),
            beep(640, 0.05, `sine`));
        }
        return;
      }
      if (r === `slime`) {
        ((e.cd = 5), beep(90, 0.12, `sine`, 0.05), Ge(e, n.fx, n.fz, 15, 1.5, `slime`));
        return;
      }
      if (r === `banana`) {
        ((e.cd = 2.8), dropTrap(e, `banana`));
        return;
      }
      if (r === `oil`) {
        ((e.cd = 3.2), dropTrap(e, `oil`));
        return;
      }
      if (r === `spikes`) {
        ((e.cd = 3.4), dropTrap(e, `spike`));
        return;
      }
      if (r === `boost`) {
        ((e.cd = 4), dropTrap(e, `boost`));
        return;
      }
      if (r === `plasma`) {
        ((e.cd = 0.7), beep(420, 0.1, `sine`, 0.06), Ge(e, n.fx, n.fz, 18, 1.1, `plasma`, !1, 0.55));
        return;
      }
      if (r === `freeze`) {
        ((e.cd = 1.1), beep(880, 0.08, `triangle`, 0.05), Ge(e, n.fx, n.fz, 22, 0.7, `freeze`, !1, 0.4));
        return;
      }
      if (r === `gravity`) {
        e.cd = 1.4;
        beep(120, 0.15, `sawtooth`, 0.05);
        // vedä lähimmät autot / pelaajat kohti
        for (let c of cars) {
          let dx = e.pos.x - c.pos.x, dz = e.pos.z - c.pos.z, d2 = dx * dx + dz * dz;
          if (d2 < 100 && d2 > 0.4) {
            let d = Math.sqrt(d2);
            c.pos.x += (dx / d) * 2.8; c.pos.z += (dz / d) * 2.8;
            c.speed *= 0.7;
          }
        }
        for (let p of players) {
          if (p === e || p.moon !== e.moon) continue;
          let dx = e.pos.x - p.pos.x, dz = e.pos.z - p.pos.z, d2 = dx * dx + dz * dz;
          if (d2 < 64 && d2 > 0.3) {
            let d = Math.sqrt(d2);
            p.pos.x += (dx / d) * 1.6; p.pos.z += (dz / d) * 1.6; p.vy += 1.5;
          }
        }
        return;
      }
      if (r === `tether`) {
        e.cd = 0.8;
        if (e.moon && !e.grounded && e.pos.y > 3) {
          e.vy = Math.min(e.vy, -14);
          e.tetherPull = 1.2;
          beep(200, 0.12, `sine`, 0.06);
          e.lockHint = `🪢 Kuuturva vetää alas!`;
        } else {
          beep(90, 0.05, `square`, 0.02);
          if (!e.moon) e.lockHint = `Kuuturva toimii vain Kuussa`;
          else if (e.grounded) e.lockHint = `Hyppää korkealle ja käytä Kuuturvaa`;
        }
        return;
      }
      // 2.1: tulevaisuuden aseet (v21.js)
      if (window.HYYTE?.v21Fire?.(e, r, n)) return;
      if (r === `can`) {
        if (e.canCd > 0) {
          e.cd = 0.25;
          return;
        }
        if (e.car == null) {
          ((e.cd = 0.4), beep(90, 0.05, `square`, 0.02));
          return;
        }
        let t = cars[e.car];
        ((t.nitro = 2), (t.boostMul = 0),
          (t.speed =
            (t.speed < -1 ? -1 : 1) *
            Math.min(t.top + 14, Math.max(Math.abs(t.speed) + 11, t.top + 6))));
        let n = dirVectors(t.yaw);
        ((t.vx = n.fx * t.speed),
          (t.vz = n.fz * t.speed),
          (e.canCd = 10),
          (e.cd = 0.45),
          beep(70, 0.22, `sawtooth`, 0.09));
        return;
      }
      if (r === `wrench`) {
        if (((e.cd = 0.45), beep(300, 0.06, `square`), (e.slow = 0), e.car != null)) {
          let t = cars[e.car];
          ((t.slow = 0), (t.oil = 0));
        }
        e.hp < 100 && e.repair <= 0 && (e.repair = 10);
        try { window.HYYTE?.emit?.("repair", e.index); } catch (_e) {}
        let t = nearestFoe(e),
          r = t.pos.x - e.pos.x,
          i = t.pos.z - e.pos.z;
        r * r + i * i < 3.2 &&
          r * n.fx + i * n.fz > 0.15 &&
          ((t.vy = 4),
          (t.pos.x += n.fx * 0.7),
          (t.pos.z += n.fz * 0.7),
          damagePlayer(t, 12, e),
          (e.score += 1));
        return;
      }
      if (r === `laser`) {
        ((e.cd = 5), (e.swing = 1), fireHandLaser(e), beep(880, 0.08, `square`, 0.045));
        return;
      }
      let [i, a, o] = {
        shield: [0, 0, 0],
        axe: [0, 0, 0],
        katana: [0, 0, 0],
        lighter: [0, 0, 0],
        slime: [0, 0, 0],
        banana: [0, 0, 0],
        wrench: [0, 0, 0],
        oil: [0, 0, 0],
        can: [0, 0, 0],
        spikes: [0, 0, 0],
        bow: [16, 1.1, 0.55],
        pistol: [28, 0.7, 0.28],
        shotgun: [22, 0.45, 0.7],
        minigun: [32, 0.35, 0.07],
        rifle: [36, 0.9, 0.2],
        scope: [48, 1.4, 0.85],
        boomerang: [12, 1.6, 0.85],
        star: [20, 0.8, 0.32],
        ball: [11, 8, 0.9],
        rocket: [26, 1.35, 1.15],
        laser: [0, 0, 0],
      }[r];
      if (
        ((e.cd = o),
        beep(
          r === `ball` ? 150 : r === `minigun` ? 210 : r === `bow` ? 340 : 420,
          r === `ball` ? 0.1 : r === `minigun` ? 0.03 : 0.05,
          r === `ball` ? `sine` : `square`,
          0.03,
        ),
        r === `shotgun`)
      ) {
        for (let t = -2; t <= 2; t++) {
          let n = dirVectors(e.yaw + t * 0.08);
          Ge(e, n.fx, n.fz, i, a, r);
        }
        return;
      }
      Ge(e, n.fx, n.fz, i, a, r, r === `boomerang`, r === `bow` ? 4 : 0);
    }
    function tt(e, t, n, r, i, a, o) {
      let s = i - e,
        c = a - t,
        l = Math.max(-1.5, Math.min(1.5, s * n + c * r)),
        u = s - n * l,
        d = c - r * l;
      return u * u + d * d < o * o;
    }
    function nt(e) {
      let t = Math.hypot(e.vx, e.vz) || 1,
        n = e.vx / t,
        r = e.vz / t,
        i = e.mesh.position.x,
        a = e.mesh.position.z,
        o = !1,
        s = !1;
      for (let t of players)
        t.index !== e.owner &&
          tt(i, a, n, r, t.pos.x, t.pos.z, 1.35) &&
          (t.slow <= 0 && (o = !0),
          (t.slow = 4),
          t.car != null && (cars[t.car].slow = 4),
          (s = !0));
      for (let t of cars)
        t.occupied !== e.owner &&
          tt(i, a, n, r, t.pos.x, t.pos.z, 2.15) &&
          (t.slow <= 0 && (o = !0),
          (t.slow = 4),
          t.occupied != null && (players[t.occupied].slow = 4),
          (s = !0));
      return (o && (players[e.owner].score += 1), s && beep(70, 0.14, `sine`, 0.05), s);
    }
    function rt(e) {
      for (let t of players) {
        if (t.index === e.owner) continue;
        if (t.hurt > 0) return !1;
        let n = t.pos.x - e.mesh.position.x,
          r = t.pos.z - e.mesh.position.z,
          i = 1.1 - e.mesh.position.y;
        if (n * n + r * r + i * i < 1.15)
          return (
            damagePlayer(
              t,
              {
                pistol: 9,
                shotgun: 5,
                minigun: 4,
                rifle: 14,
                scope: 20,
                bow: 10,
                star: 8,
                boomerang: 8,
                ball: 7,
                lighter: 4,
                rocket: 16,
              }[e.kind] ?? 8,
              players[e.owner],
            ),
            (players[e.owner].score += 1),
            beep(260, 0.07, `triangle`),
            !0
          );
      }
      return !1;
    }
    function it(e) {
      for (let t of targets) {
        if (!t.alive) continue;
        let n = t.x - e.mesh.position.x,
          r = t.z - e.mesh.position.z,
          i = t.y - e.mesh.position.y,
          a = t.r + 0.15;
        if (n * n + r * r + i * i < a * a)
          return (
            (t.alive = !1),
            (t.t = 2.2),
            (t.mesh.visible = !1),
            (players[e.owner].score += t.points),
            beep(620, 0.08, `sine`),
            !0
          );
      }
      return !1;
    }
    function at(e) {
      if (!FIREARMS.has(e.kind)) return !1;
      for (let t of trees) {
        let n = t.x - e.mesh.position.x,
          r = t.z - e.mesh.position.z;
        if (
          n * n + r * r < (t.r + e.radius) ** 2 &&
          e.mesh.position.y > 0.3 &&
          e.mesh.position.y < 3.2
        )
          return ((t.fire = 2.6), (t.flames.visible = !0), beep(160, 0.05, `sawtooth`, 0.025), !0);
      }
      return !1;
    }
    function ot(e, t, y) {
      return obstacles.some((n) => {
        let r = e - n.x,
          i = t - n.z;
        if (r * r + i * i >= n.r * n.r) return !1;
        // 2.1: korkeus — jos pelaaja on esteen yläpuolella, ei törmätä (hyppy yli)
        if (y != null) {
          let h = n.h != null ? n.h : 1.35;
          if (y + 0.12 >= h) return !1;
        }
        return !0;
      });
    }
    function earthLimit() { return 315; } // 2.4: kenttä ~+50 %
    function outOfBounds(e, t) {
      // 1.9: Kuun alue (moon.js) on oma kenttänsä kaukana Maan kartan ulkopuolella
      if (t > 400 && window.HYYTE?.moonOut) return window.HYYTE.moonOut(e, t);
      // 3.0: sirkuksen sisätila (isompi kuin ulkoteltta) kaukana kartasta
      try {
        const c = window.HYYTE?.circusOut?.(e, t);
        if (c === true || c === false) return c;
      } catch (_) {}
      try {
        const h = window.HYYTE?.hatchOut?.(e, t);
        if (h === true || h === false) return h;
      } catch (_) {}
      try {
        const a = window.HYYTE?.planeOut?.(e, t);
        if (a === true || a === false) return a;
      } catch (_) {}
      // 2.3: salli Palikkamaan koko alue + hakku/kaivos-padit (eteläpuoli)
      try {
        const P = window.HYYTE?.palikka;
        if (P && (P.active || P.OX != null)) {
          if (e > P.OX - 14 && e < P.OX + P.NX + 16 && t > P.OZ - 20 && t < P.OZ + P.NZ + 12) return !1;
        }
      } catch (_) {}
      const L = earthLimit();
      return Math.abs(e) > L || Math.abs(t) > L;
    }
    function lt(e, t, n) {
      return (
        (Math.abs(e) <= 15 && Math.abs(t - 16) > 3.55 && Math.abs(t - 16) < 4.85) ||
        ee.some((r) => e > r.minX - n && e < r.maxX + n && t > r.minZ - n && t < r.maxZ + n)
      );
    }
    function ut(e, t, n) {
      return !!(
        (n > 4.95 && n < 6.05 && Math.abs(e) < 9.45 && Math.abs(t) < 5.45) ||
        (n < 5.65 &&
          ee.some(
            (n) => e > n.minX - 0.5 && e < n.maxX + 0.5 && t > n.minZ - 0.5 && t < n.maxZ + 0.5,
          )) ||
        (n > 3.45 && n < 5.7 && Math.abs(t) < 2.1 && Math.abs(Math.abs(e) - 8.79) < 0.9)
      );
    }
    function dt(e, t, n) {
      return ut(e, t, n) || ut(e, t, n + 1.15) || ut(e, t, n + 2.7);
    }
    function ft(e, t, n) {
      if (t >= 122 && t <= 142 && Math.abs(e) <= Cl && n > 1) return Sl;
      if (Math.abs(e) <= Cl && t >= 112 && t < 122) return ((t - 112) / 10) * Sl;
      if (Math.abs(e) <= Cl && t > 142 && t <= 152) return ((152 - t) / 10) * Sl;
      for (let n of ne)
        if (!((e - n.x) ** 2 + (t - n.z) ** 2 > n.r * n.r)) return n.spring ? 0.78 : 0.28;
      return 0;
    }
    function pt(e, t, n) {
      let r = Math.max(Ml(e, t), window.HYYTE?.voxGround?.(e, t, n) ?? 0),
        i = ft(e, t, n);
      return n > 4.2 && Math.abs(e) <= 9.2 && Math.abs(t) <= 5.2
        ? Math.max(r, Ol, i)
        : Math.max(r, i);
    }
    function mt(e, t) {
      if (
        ((e.padLock = Math.max(0, e.padLock - t)), !(e.rocket || e.car != null || e.air !== `none`))
      ) {
        !e.bridgeBonus &&
          e.pos.y > 1.5 &&
          e.pos.z > 140.8 &&
          e.pos.z < 144 &&
          Math.abs(e.pos.x) <= Cl &&
          ((e.bridgeBonus = !0), (e.score += 3), beep(660, 0.1, `square`, 0.05));
        for (let t of re)
          t.got[e.index] ||
            Math.abs(e.pos.x - t.x) > t.hw ||
            Math.abs(e.pos.z - t.z) > t.hh ||
            ((t.got[e.index] = !0), (e.score += 1), beep(480, 0.05, `sine`, 0.03));
        if (!(e.padLock > 0 || !e.grounded)) {
          for (let t of ne)
            if (!((e.pos.x - t.x) ** 2 + (e.pos.z - t.z) ** 2 > t.r * t.r)) {
              if (
                ((e.vy = t.spring ? 11.5 : 6.5),
                (e.grounded = !1),
                (e.padLock = 0.45),
                window.HYYTE?.emit?.(`bounce`, e.index, ne.indexOf(t)),
                !t.lit[e.index])
              ) {
                if (((t.lit[e.index] = !0), (e.score += 1), !t.spring)) {
                  let e = t.mesh.material;
                  (e.emissive.set(`#8fd0ff`), (e.emissiveIntensity = 0.7));
                }
                beep(t.spring ? 180 : 540, 0.08, `sine`, 0.05);
              }
              !e.courseBonus &&
                ne.filter((e) => !e.spring).every((t) => t.lit[e.index]) &&
                ((e.courseBonus = !0), (e.score += 3), beep(720, 0.12, `square`, 0.06));
              break;
            }
        }
      }
    }
    function landPlayer(e) {
      if (
        ((e.enterLock = Math.min(e.enterLock, 0.4)),
        (e.vy = 0),
        (e.grounded = !0),
        (e.air = `none`),
        (e.chute.visible = !1),
        (e.seat.visible = !1),
        e.pos.y < 2)
      ) {
        let t = xt(e.pos.x, e.pos.z);
        ((e.pos.x = t.x), (e.pos.z = t.z));
      }
    }
    function wallHit(e, t, n, y) {
      try { return !!window.HYYTE?.wallHit?.(e, t, n == null ? 0.45 : n, y); } catch (_) { return !1; }
    }
    function yt(e, t, y) {
      return outOfBounds(e, t) || ot(e, t, y) || lt(e, t, 0.35) || wallHit(e, t, 0.45, y);
    }
    function bt(e, t, n, y) {
      return outOfBounds(e, t) || lt(e, t, n) || wallHit(e, t, n, y)
        ? !0
        : obstacles.some((r) => {
            let i = e - r.x,
              a = t - r.z;
            if (i * i + a * a >= (r.r + n) * (r.r + n)) return !1;
            if (y != null) {
              let h = r.h != null ? r.h : 1.35;
              if (y + 0.12 >= h) return !1;
            }
            return !0;
          });
    }
    function xt(e, t) {
      if (!bt(e, t, 0.55))
        return {
          x: e,
          z: t,
        };
      for (let n = 1; n <= 18; n++) {
        let r = n * 0.45,
          i = 8 + n;
        for (let n = 0; n < i; n++) {
          let a = (n / i) * Math.PI * 2,
            o = e + Math.cos(a) * r,
            s = t + Math.sin(a) * r;
          if (!bt(o, s, 0.55))
            return {
              x: o,
              z: s,
            };
        }
      }
      return {
        x: e,
        z: t,
      };
    }
    function resize() {
      let e = canvas.clientWidth || window.innerWidth,
        n = canvas.clientHeight || window.innerHeight;
      renderer.setSize(e, n, !1);
    }
    resize();
    let resizeObserver = new ResizeObserver(resize);
    (resizeObserver.observe(canvas),
      (window.__controlsTest = {
        getYaw: () => players[0].yaw,
        getSpeed: () => players[0].speed,
        getPose: () => {
          let e = players[0];
          return {
            x: e.pos.x,
            z: e.pos.z,
            yaw: e.yaw,
            speed: e.speed,
            car: e.car,
            fp: e.firstPerson,
            camDist: e.camDist,
            camLift: e.camLift,
            score: e.score,
            balls: projectiles.filter((e) => e.bouncy && e.life > 0).length,
            y: e.pos.y,
            air: e.air,
            fires: trees.filter((e) => e.fire > 0).length,
            targets: targets.length,
            p2x: (players[1] || players[0]).pos.x,
            p2z: (players[1] || players[0]).pos.z,
            p2y: (players[1] || players[0]).pos.y,
            p2yaw: (players[1] || players[0]).yaw,
            p2air: (players[1] || players[0]).air,
            slow: e.slow,
            p2slow: (players[1] || players[0]).slow,
            hp: e.hp,
            p2hp: (players[1] || players[0]).hp,
            p2spin: (players[1] || players[0]).spin,
            weapon: e.weapon,
            repair: e.repair,
            canCd: e.canCd,
            carNitro: e.car == null ? 0 : cars[e.car].nitro,
            rocketY: museum.rocket.position.y,
            riding: e.rocket,
            pitch: e.pitch,
            phase: rocketPhase,
            cd: e.cd,
            alive: targets.filter((e) => e.alive).length,
            rounds: e.rounds,
            p2rounds: (players[1] || players[0]).rounds,
            bolts: laserBolts.length,
            boltX: laserBolts[0]?.x ?? 0,
            boltY: laserBolts[0]?.y ?? 0,
            boltZ: laserBolts[0]?.z ?? 0,
            cars: cars.length,
            fast: cars.filter((e) => e.bigRear).length,
            cy: e.car == null ? 0 : cars[e.car].y,
            sliding: e.car != null && cars[e.car].sliding,
            oil: e.car == null ? 0 : cars[e.car].oil,
            carSpeed: e.car == null ? 0 : cars[e.car].speed,
            carX: e.car == null ? e.pos.x : cars[e.car].pos.x,
            carZ: e.car == null ? e.pos.z : cars[e.car].pos.z,
            carYaw: e.car == null ? e.yaw : cars[e.car].yaw,
            offRoad: cars.every((e) => e.pos.z < -24 && Pl(e.pos.x, e.pos.z) > 5.6),
          };
        },
        setKeys: (e) => {
          testKeys = new Set(e);
        },
        setYaw: (e) => {
          players[0].yaw = e;
        },
        setPitch: (e) => {
          players[0].pitch = e;
        },
        setHp: (e) => {
          (((players[1] || players[0]).hp = e), ((players[1] || players[0]).hurt = 0), ((players[1] || players[0]).down = 0));
        },
        setAir: (e, t, n) => {
          let r = players[0];
          (r.car != null && ((cars[r.car].occupied = null), (r.car = null)),
            (r.rocket = !1),
            (r.group.visible = !0),
            (r.disc.visible = !0),
            r.pos.set(e, t, n),
            (r.yaw = 0),
            (r.air = `chute`),
            (r.airT = 1),
            (r.chute.visible = !0),
            (r.seat.visible = !0),
            (r.grounded = !1));
        },
        setCar: (e, t, n, r, i) => {
          let a = cars[e];
          if (!a) return;
          ((a.pos.x = t),
            (a.pos.z = n),
            (a.y = Ml(t, n)),
            (a.pos.y = a.y),
            (a.yaw = r),
            (a.speed = i));
          let o = dirVectors(r);
          ((a.vx = o.fx * i),
            (a.vz = o.fz * i),
            (a.vy = 0),
            (a.sliding = !1),
            (a.oil = 0),
            (a.slow = 0),
            (a.nitro = 0),
            (a.airT = 0),
            (a.scoredHop = !1),
            (a.hopSpeed = 0),
            (a.spin = 0));
        },
        setCarOil: (e) => {
          let t = players[0];
          t.car != null && (cars[t.car].oil = e);
        },
        launchRocket: () => {
          ((rocketPhase = `rise`),
            (rocketPhaseTime = 2.3),
            (Mt = elapsed + 180),
            (museum.rocket.visible = !0));
        },
        setRocket: (e, t) => {
          ((e === `wait` ||
            e === `ignite` ||
            e === `rise` ||
            e === `orbit` ||
            e === `gone` ||
            e === `drop`) &&
            (rocketPhase = e),
            (rocketPhaseTime = t),
            (museum.rocket.visible = e !== `gone`));
        },
        setWeapon: (e) => {
          let t = players[0];
          if (!WEAPONS.some((t) => t.id === e)) return;
          let n = e;
          ((t.weapon = n),
            t.weapons.includes(n) || (t.weapons[0] = n),
            (t.slot = Math.max(0, t.weapons.indexOf(n))),
            t.group.remove(t.weaponGroup),
            disposeObject(t.weaponGroup),
            (t.weaponGroup = buildWeaponModel(n)),
            t.weaponGroup.layers.set(10),
            t.weaponGroup.traverse((e) => e.layers.set(10)),
            t.group.add(t.weaponGroup),
            (t.cd = 0));
        },
        place: (e, t, n) => {
          let r = players[0];
          (r.car != null && ((cars[r.car].occupied = null), (r.car = null)),
            (r.rocket = !1),
            (r.group.visible = !0),
            (r.disc.visible = !0),
            (r.air = `none`),
            (r.chute.visible = !1),
            (r.seat.visible = !1),
            r.pos.set(e, t, n),
            (r.vy = 0),
            (r.grounded = t <= 0.05));
        },
        rocketState: () => ({
          phase: rocketPhase,
          countdown: rocketCountdown,
          riders: rocketRiders().map((e) => e.index),
          rocketY: museum.rocket.position.y,
          banner: rocketBanner.hidden ? `` : rocketBanner.textContent,
        }),
        camState: (i) => ({ x: cameras[i].position.x, y: cameras[i].position.y, z: cameras[i].position.z }),
        placeP: (i, x, y, z) => {
          let r = players[i];
          (r.car != null && ((cars[r.car].occupied = null), (r.car = null)),
            (r.rocket = !1),
            (r.group.visible = !0),
            (r.disc.visible = !0),
            (r.air = `none`),
            (r.chute.visible = !1),
            (r.seat.visible = !1),
            (r.enterLock = 0),
            r.pos.set(x, y, z),
            (r.vy = 0),
            (r.grounded = y <= 0.05));
        },
        ejectP: (i) => {
          let r = players[i];
          r.car != null && exitCar(r);
        },
        enterCarP: (i, c) => enterCar(players[i], c),
        boardRocket: () => {
          let e = players[0];
          (e.car != null && ((cars[e.car].occupied = null), (e.car = null)),
            (e.air = `none`),
            (e.chute.visible = !1),
            (e.seat.visible = !1),
            (e.rocket = !1),
            enterRocket(e));
        },
      }));
    function wt(e, t, n) {
      return outOfBounds(e, t) ||
        lt(e, t, 0.85) ||
        !!window.HYYTE?.voxBlock?.(e, t, 0, 0.85) ||
        obstacles.some((n) => (e - n.x) ** 2 + (t - n.z) ** 2 < (n.r + 0.85) ** 2)
        ? !0
        : cars.some((r, i) => i !== n && (e - r.pos.x) ** 2 + (t - r.pos.z) ** 2 < 7);
    }
    function findNearestCar(e) {
      let t = null,
        n = 20;
      return (
        cars.forEach((r, i) => {
          if (r.occupied != null && r.occupied !== e.index) return;
          if (e.moon) { if (!(r.moonOnly || r._v24moon)) return; }
          else if (r.moonOnly || r._v24moon) return;
          let a = (r.pos.x - e.pos.x) ** 2 + (r.pos.z - e.pos.z) ** 2;
          a < n && ((n = a), (t = i));
        }),
        t
      );
    }

    // 2.4: ohjaus riippuu pyörien pyörimissuunnasta (nopeus auton eteenpäin-akselilla + hysteresis), ei gas/vaihteesta
    function setCarGear(r, throttle) {
      if (r._gear == null) r._gear = 1;
      if (throttle > 0.12) r._gear = 1;
      else if (throttle < -0.12) r._gear = -1;
      if (Math.abs(r.speed) < 0.35 && Math.abs(throttle) < 0.12) r._gear = 1;
    }
    function steerSign(r) {
      const d = dirVectors(r.yaw);
      const along = (r.vx || 0) * d.fx + (r.vz || 0) * d.fz;
      if (along > 0.55) r._steerDir = 1;
      else if (along < -0.55) r._steerDir = -1;
      if (r._steerDir == null) r._steerDir = along >= 0 ? 1 : -1;
      return r._steerDir;
    }
    function enterCar(e, t) {
      let n = cars[t];
      n.occupied ??
        ((n.occupied = e.index),
        (n.speed = 0),
        (e.car = t),
        (e.vy = 0),
        (e.grounded = !0),
        (e.air = `none`),
        (e.chute.visible = !1),
        (e.seat.visible = !1));
    }
    function exitCar(e) {
      if (e.car == null) return;
      let t = cars[e.car],
        n = dirVectors(t.yaw);
      // 2.1: heittoistuin poistettu — normaali poistuminen sivulle
      let high = t.y > 2.2;
      (e.pos.set(t.pos.x + n.rx * 1.6 + n.fx * 0.2, high ? t.y + 0.35 : Math.max(0, t.y), t.pos.z + n.rz * 1.6 + n.fz * 0.2),
        (e.yaw = t.yaw),
        (e.vy = 0),
        (e.grounded = !high),
        (e.air = high ? `chute` : `none`),
        (e.airT = high ? 0 : 0),
        (e.enterLock = 0), // 2.2: heti takaisin autoon
        (e.firstPerson = !1),
        (e.car = null),
        (t.occupied = null),
        (t.speed *= 0.4),
        (e.seat.visible = !1),
        (e.chute.visible = !!high),
        beep(210, 0.1, `sine`, 0.04));
    }
    function controlsHint(e) {
      let KL = (a) => window.HYYTE?.keyLabel?.(e.index, a) ?? a,
        t = KL(`interact`),
        n = KL(`camera`),
        r = KL(`camIn`) + `/` + KL(`camOut`),
        i = KL(`camUp`) + `/` + KL(`camDown`),
        a = KL(`drift`),
        o = KL(`swap`),
        s = `${Math.round(e.hp)}/100`,
        c = KL(`jump`),
        l = KL(`up`) + ` alas, ` + KL(`down`) + ` ylös`;
      if (e.lockHint) return e.lockHint;
      if (e.moon && !e.rocket) {
        let h = window.HYYTE?.moonHint?.(e);
        if (h) return h;
      }
      if (e.down > 0) return `Hups! ${s}`;
      if (players.some((t) => t !== e && t.down > 0 && t.lastHitBy === e.index)) return `Eräpiste! ${e.rounds}`;
      if (e.repair > 0) return `Jakoavain korjaa · ${Math.ceil(e.repair)} s · ${s}`;
      if (e.rocket)
        return e.cd > 0.2
          ? `Lasertykki ${Math.ceil(e.cd)} s`
          : rocketPhase === `wait`
            ? rocketCountdown > 0
              ? `Lähtö ${Math.ceil(rocketCountdown)} s · ${t} ulos · ${l}`
              : `${c} laukaisee · ${t} ulos · ${l}`
            : e.pitch < -0.35
              ? `Tähtää kenttää · ${KL(`fire`)} laser · ${t} ulos`
              : rocketPhase === `orbit`
                ? `Avaruus · ${c} = KUUHUN! · ${t} ulos`
                : e.pitch > 0.15
                ? `Avaruus · ${l}`
                : `Nousu · ${l} · ${t} ulos`;
      if (rocketPhase === `ignite` && !e.moon) return `Raketti käynnistyy!`;
      if (rocketPhase === `rise` && !e.moon) return `Laukaisu!`;
      if (rocketPhase === `orbit` && !e.moon) return `Raketti on avaruudessa`;
      if (e.car != null) {
        let r = cars[e.car],
          i = r.slow > 0 ? `Limaa hidastaa · ` : ``;
        return r.nitro > 0
          ? `Typpi! ${Math.ceil(r.nitro)} s`
          : e.weapon === `can` && e.canCd > 0
            ? `Kanisteri ${Math.ceil(e.canCd)} s`
            : r.sliding
              ? `Liuku · ${a} pohjaan, auto pyörii`
              : r.y > 1.2
                ? `Ilmassa!`
                : e.firstPerson
                  ? `${i}Silmät · ${n} takaisin · ${t} ulos autosta`
                  : `${i}Ajat · ${a} liuku · ${o} ase · ${t} ulos`;
      }
      if (e.weapon === `can` && e.car == null) return `Kanisteri toimii autossa`;
      if (e.weapon === `laser` && e.cd > 0.2) return `Laser ${Math.ceil(e.cd)} s`;
      if (e.slow > 0) return `Limaa! Liike on hidas`;
      if (e.air === `eject`) return `Heittoistuin!`;
      if (e.air === `chute`) return `Laskuvarjo · ohjaa vähän`;
      if (e.air === `none` && e.enterLock <= 0 && rocketBoardable() && nearRocket(e))
        return rocketCountdown > 0
          ? `${t} = rakettiin! Lähtö ${Math.ceil(rocketCountdown)} s`
          : `${t} = rakettiin`;
      if (!e.firstPerson && window.HYYTE && HYYTE.noFire && HYYTE.noFire(e)) return `Palikkamaa · ${i} korkeus · ${n} silmät`;
      return e.firstPerson
          ? `Silmät · ${n} takaisin · ${r} etäisyys`
          : e.enterLock <= 0 && findNearestCar(e) != null
            ? `${t} = autoon · ${o} vaihtaa aseen`
            : e.air === `none` &&
                e.pos.y > 1.2 &&
                e.pos.z >= 112 &&
                e.pos.z <= 152 &&
                Math.abs(e.pos.x) <= 2.9
              ? `Köysisilta · kävele yli`
              : e.air === `none` && (e.pos.x - 0) ** 2 + (e.pos.z - 100) ** 2 < 130
                ? `Pomppukiekot · keskijousi heittää ylös`
                : `${o} vaihtaa aseen · ${i} korkeus · ${n} silmät`;
    }
    // ---------- 1.9: 1–4 näkymää ----------
    const NP = players.length;
    let farCap = mobiGfx ? 220 : NP >= 5 ? 260 : NP >= 3 ? 340 : 900,
      basePR = mobiGfx ? Math.min(devicePixelRatio || 1, 1.25) : lowGfx ? 1 : ultraGfx ? Math.min(devicePixelRatio || 1, NP >= 5 ? 1.25 : NP >= 3 ? 1.5 : 2) : Math.min(devicePixelRatio || 1, NP >= 5 ? 1 : NP >= 3 ? 1.25 : 1.5),
      perfLevel = 0,
      perfAcc = 0,
      perfFrames = 0,
      perfGood = 0,
      layoutKey = ``;
    NP >= 3 && ((l.near = 110), (l.far = 330));
    renderer.setPixelRatio(basePR);
    function viewLayout(n, u) {
      if (NP === 1) return [{ i: 0, x: 0, y: 0, w: n, h: u }];
      if (NP === 2)
        return n < 860
          ? [
              { i: 0, x: 0, y: u / 2, w: n, h: u / 2 },
              { i: 1, x: 0, y: 0, w: n, h: u / 2 },
            ]
          : [
              { i: 0, x: 0, y: 0, w: n / 2, h: u },
              { i: 1, x: n / 2, y: 0, w: n / 2, h: u },
            ];
      // 3.0: skaalautuva ruudukko 3–12 pelaajalle
      let cols = NP <= 4 ? 2 : NP <= 9 ? 3 : 4;
      let rows = Math.ceil(NP / cols);
      let w = n / cols, h = u / rows, q = [];
      for (let i = 0; i < NP; i++) {
        let c = i % cols, r = (i / cols) | 0;
        // three.js viewport: y=0 alhaalla
        q.push({ i, x: c * w, y: (rows - 1 - r) * h, w, h });
      }
      return q;
    }
    // HUD-kerrokset (.vp.v0…v3) seuraavat näkymien paikkoja
    function layoutOverlays(d, n, u) {
      let key = d.map((e) => [e.i, e.x, e.y, e.w, e.h].map(Math.round).join(`,`)).join(`;`) + `/` + n + `x` + u;
      if (key === layoutKey) return;
      layoutKey = key;
      let st = canvas.parentElement;
      if (!st) return;
      for (let k = 1; k <= 12; k++) st.classList.toggle(`n` + k, NP === k);
      st.classList.toggle(`nMany`, NP >= 5);
      st.dataset.layout = NP === 2 ? (n < 860 ? `stack` : `side`) : NP === 1 ? `full` : `grid`;
      st.dataset.n = String(NP);
      for (let e of d) {
        let v = st.querySelector(`.vp.v${e.i}`);
        v &&
          Object.assign(v.style, {
            left: (e.x / n) * 100 + `%`,
            top: ((u - e.y - e.h) / u) * 100 + `%`,
            width: (e.w / n) * 100 + `%`,
            height: (e.h / u) * 100 + `%`,
            display: `block`,
          });
      }
      let info = st.querySelector(`.vp.info`);
      info && (info.style.display = NP === 3 ? `block` : `none`);
      let sb = st.querySelectorAll(`.splitbar`);
      sb.forEach((b, k) => {
        let s = b.style;
        if (NP === 1 || NP >= 5) return void (s.display = `none`);
        if (NP === 2) return void (s.cssText = k ? `display:none` : ``);
        s.cssText =
          k === 0
            ? `display:block;left:calc(50% - 2px);top:0;width:4px;height:100%;bottom:auto;right:auto;transform:none`
            : `display:block;top:calc(50% - 2px);left:0;height:4px;width:100%;bottom:auto;right:auto;transform:none`;
      });
    }
    // automaattinen laadunsäätö: matala FPS -> pienempi resoluutio ja lyhyempi näkyvyys
    function perfTick(e) {
      perfAcc += e;
      perfFrames++;
      if (perfAcc < 3) return;
      let fps = perfFrames / perfAcc;
      ((perfAcc = 0), (perfFrames = 0));
      if (window.__noAutoQuality) return;
      let old = perfLevel;
      fps < (NP >= 3 ? 34 : 30) && perfLevel < 3 ? ((perfLevel++), (perfGood = 0)) : fps > 55 && perfLevel > 0 ? ++perfGood >= 3 && (perfLevel--, (perfGood = 0)) : (perfGood = 0);
      if (old !== perfLevel) {
        renderer.setPixelRatio(basePR * [1, 0.85, 0.72, 0.6][perfLevel]);
        farCap = (NP >= 3 ? 340 : 900) * [1, 0.9, 0.75, 0.65][perfLevel];
        resize();
        window.HYYTE && ((HYYTE.perfLevel = perfLevel), HYYTE.emit?.(`perfLevel`, perfLevel));
      }
      window.__perf = { fps: Math.round(fps), level: perfLevel, pr: renderer.getPixelRatio(), views: NP };
    }
    let camerasReady = !1,
      rocketPhase = `wait`,
      rocketPhaseTime = 0,
      Mt = 35,
      Nt = -1,
      Pt = -1,
      Ft = -1,
      It = -1,
      Lt = -1,
      Rt = -1,
      zt = ``,
      Bt = ``,
      Vt = ``,
      Ht = ``,
      elapsed = 0;
    function portalAt(e, t, y) {
      // 2.4: vain todellinen osuma (pieni säde + matala korkeus) — lentoauto korkealla ei laukaise
      const yy = y == null ? 0 : y;
      if (yy > 2.4) return -1;
      for (let n = 0; n < PORTALS.length; n++) {
        let r = PORTALS[n];
        if ((e - r.x) ** 2 + (t - r.z) ** 2 < 1.69) return n; // r≈1.3
      }
      return -1;
    }
    function portalExit(e) {
      let t = PORTALS[(e + 1) % PORTALS.length],
        n = dirVectors(t.yaw);
      return {
        x: t.x + n.fx * 6.2,
        z: t.z + n.fz * 6.2,
        yaw: t.yaw,
      };
    }
    const ROCKET_COUNTDOWN = 5;
    let rocketCountdown = 0;
    function nearRocket(e) {
      return !e.moon && (e.pos.x - kl) ** 2 + (e.pos.z - Al) ** 2 < 26;
    }
    function rocketRiders() {
      return players.filter((e) => e.rocket);
    }
    // 1.6: kyytiin pääsee vain kun raketti odottaa lähtöalustalla (myös lähtölaskennan aikana)
    function rocketBoardable() {
      return museum.rocket.visible &&
        museum.rocket.position.y <= 2.4 &&
        rocketPhase === `wait` &&
        rocketRiders().length < players.length;
    }
    function enterRocket(e) {
      if (e.rocket || e.car != null || !rocketBoardable()) return;
      let used = rocketRiders().map((t) => t.rocketSeat),
        seat = [0, 1, 2, 3].find((k) => !used.includes(k)) ?? 0;
      e.rocketSeat = seat;
      rocketCountdown <= 0 && ((rocketCountdown = ROCKET_COUNTDOWN), (rocketCountdownBeep = 6));
      e.car ??
          ((e.rocket = !0),
          (e.pitch = -1.15),
          (e.vy = 0),
          (e.air = `none`),
          (e.grounded = !1),
          (e.chute.visible = !1),
          (e.seat.visible = !1),
          (e.group.visible = !1),
          (e.disc.visible = !1),
          (e.enterLock = 0.45),
          e.pos.set(kl, museum.rocket.position.y + 3.2, Al),
          beep(180, 0.1, `sine`, 0.05));
    }
    function exitRocket(e) {
      if (!e.rocket) return;
      let t = museum.rocket.position.y;
      ((e.rocket = !1),
        (e.group.visible = !0),
        (e.disc.visible = !0),
        e.group.scale.setScalar(1.35),
        (e.enterLock = 0.85),
        (e.firstPerson = !1),
        (e.vy = 0),
        t < 3
          ? (e.pos.set(1.4, 0, Al + (e.rocketSeat || 0) * 1.8),
            (e.air = `none`),
            (e.grounded = !0),
            (e.chute.visible = !1),
            (e.seat.visible = !1))
          : (e.pos.set(kl + (e.rocketSeat || 0) * 1.6, Math.max(2, t), Al),
            (e.air = `chute`),
            (e.airT = 1),
            (e.grounded = !1),
            (e.chute.visible = !0),
            (e.seat.visible = !0),
            beep(140, 0.16, `sine`, 0.04)));
    }
    let rocketCountdownBeep = 0,
      rocketBanner = document.createElement(`div`);
    ((rocketBanner.className = `rocket-banner`),
      (rocketBanner.hidden = !0),
      canvas.parentElement && canvas.parentElement.appendChild(rocketBanner));
    function updateRocketCountdown(e) {
      if (rocketCountdown <= 0) return;
      let riders = rocketRiders();
      if (riders.length === 0) {
        rocketCountdown = 0;
        return;
      }
      rocketCountdown = Math.max(0, rocketCountdown - e);
      let sec = Math.ceil(rocketCountdown);
      sec < rocketCountdownBeep && ((rocketCountdownBeep = sec), beep(sec > 0 ? 520 : 880, 0.12, `sine`, 0.06));
      rocketCountdown <= 0 &&
        ((rocketPhase = `ignite`), (rocketPhaseTime = 0), beep(55, 0.25, `sawtooth`, 0.06));
    }
    function updateRocketBanner() {
      let show = rocketCountdown > 0;
      if (show) {
        let riders = rocketRiders(),
          txt =
            riders.length >= players.length
              ? `${players.length > 1 ? `Kaikki kyydissä!` : `Kyydissä!`} Lähtö ${Math.ceil(rocketCountdown)} s`
              : `Raketti lähtee ${Math.ceil(rocketCountdown)} s! ${players
                  .filter((p) => !p.rocket)
                  .map((p) => `P${p.index + 1} (${window.HYYTE?.keyLabel?.(p.index, `interact`) ?? `E`})`)
                  .join(`, `)}: mene rakettiin`;
        rocketBanner.textContent !== txt && (rocketBanner.textContent = txt);
      }
      rocketBanner.hidden !== !show && (rocketBanner.hidden = !show);
    }
    function updateRocketLaunch(e) {
      {
        let s = window.HYYTE && window.HYYTE._rocketTimeScale;
        if (typeof s === `number` && s > 0) e = e * s;
      }
      rocketPhaseTime += e;
      let t =
        rocketPhase === `ignite`
          ? Math.min(1, rocketPhaseTime / 1.15)
          : rocketPhase === `rise` || rocketPhase === `drop` || rocketPhase === `orbit`
            ? 1
            : rocketPhase === `gone`
              ? Math.max(0, 1 - rocketPhaseTime / 1.5)
              : 0;
      ((museum.hatches[0].position.x = -2.81 - t * 1.7),
        (museum.hatches[1].position.x = 0.41 + t * 1.7));
      let n = museum.flame,
        r = museum.launchLight,
        i = museum.shock;
      if (rocketPhase === `wait`)
        (museum.rocket.position.set(-1.2, 0, 2.35),
          (museum.rocket.visible = !0),
          (n.visible = !1),
          (r.intensity = 0),
          (i.visible = !1),
          (museum.rocketHit.r = 1.15),
          updateRocketCountdown(e),
          rocketCountdown <= 0 &&
            elapsed >= Mt &&
            ((rocketPhase = `ignite`), (rocketPhaseTime = 0), beep(55, 0.25, `sawtooth`, 0.06)));
      else if (rocketPhase === `ignite`) {
        let t = Math.min(1, rocketPhaseTime / 4);
        (museum.rocket.position.set(
          -1.2 + Math.sin(rocketPhaseTime * 42) * 0.05 * t,
          Math.sin(rocketPhaseTime * 28) * 0.03 * t,
          2.35,
        ),
          (n.visible = !0),
          n.scale.set(0.35 + t * 0.9, 0.45 + t * 1.3, 0.35 + t * 0.9),
          (r.intensity = 2 + t * 8),
          (r.position.y = 2.2),
          (museum.rocketHit.r = 1.15),
          rocketPhaseTime > 0.35 &&
            Math.floor(rocketPhaseTime * 8) !== Math.floor((rocketPhaseTime - e) * 8) &&
            beep(48 + t * 40, 0.05, `square`, 0.03),
          rocketPhaseTime >= 4 &&
            ((rocketPhase = `rise`), (rocketPhaseTime = 0), beep(90, 0.28, `sawtooth`, 0.1)));
      } else if (rocketPhase === `rise`) {
        let e = Math.min(1, rocketPhaseTime / 8),
          t = e * e * 240;
        (museum.rocket.position.set(-1.2, t, 2.35), (n.visible = !0));
        let a = 1.4 + Math.sin(rocketPhaseTime * 50) * 0.35;
        if (
          (n.scale.set(a, 2.2 + e * 3.5, a),
          (r.intensity = 14 * (1 - e * 0.4)),
          r.position.set(-1.2, Math.min(18, 3 + t), 2.35),
          (museum.rocketHit.r = t > 3 ? 0 : 1.15),
          (i.visible = rocketPhaseTime < 1.4),
          i.visible)
        ) {
          let e = 1 + rocketPhaseTime * 14;
          (i.scale.set(e, e, e), (i.material.opacity = Math.max(0, 0.85 - rocketPhaseTime * 0.6)));
        }
        if (we.length < 80 && rocketPhaseTime < 7.2) {
          let e = Math.random() * Math.PI * 2,
            n = new Mesh(
              sphereGeo(0.16 + Math.random() * 0.2, 8, 6),
              mat([`#ff5a36`, `#ffd60a`, `#fff6d0`, `#ff9f0a`][we.length % 4], {
                emissive: `#ffb020`,
                emissiveIntensity: 0.8,
                transparent: !0,
                opacity: 0.85,
              }),
            );
          (n.position.set(
            -1.2 + Math.cos(e) * 0.4,
            Math.max(0.4, t - 0.6),
            2.35 + Math.sin(e) * 0.4,
          ),
            scene.add(n),
            we.push({
              mesh: n,
              vx: Math.cos(e) * 2.2,
              vy: 4 + Math.random() * 6,
              vz: Math.sin(e) * 2.2,
              life: 0.7 + Math.random() * 0.4,
            }));
        }
        rocketPhaseTime >= 8 &&
          (players.some((e) => e.rocket)
            ? ((rocketPhase = `orbit`),
              (rocketPhaseTime = 0),
              (museum.rocket.visible = !0),
              museum.rocket.position.set(kl, 240, Al),
              beep(220, 0.18, `sine`, 0.05))
            : ((rocketPhase = `gone`),
              (rocketPhaseTime = 0),
              (museum.rocket.visible = !1),
              (n.visible = !1),
              (r.intensity = 0),
              (i.visible = !1),
              (museum.rocketHit.r = 0)));
      } else if (rocketPhase === `orbit`) {
        let e = 240 + Math.sin(rocketPhaseTime * 0.65) * 1.6;
        (museum.rocket.position.set(kl, e, Al),
          (museum.rocket.visible = !0),
          (n.visible = !0),
          n.scale.set(0.42, 0.75, 0.42),
          (r.intensity = 2.4),
          r.position.set(kl, e - 1.2, Al),
          (i.visible = !1),
          (museum.rocketHit.r = 0),
          players.some((e) => e.rocket) ||
            ((rocketPhase = `gone`),
            (rocketPhaseTime = 0),
            (museum.rocket.visible = !1),
            (n.visible = !1),
            (r.intensity = 0),
            (museum.rocketHit.r = 0)));
      } else if (rocketPhase === `gone`)
        rocketPhaseTime >= 5 &&
          ((rocketPhase = `drop`),
          (rocketPhaseTime = 0),
          (museum.rocket.visible = !0),
          museum.rocket.position.set(-1.2, 70, 2.35),
          (n.visible = !1));
      else {
        let e = Math.min(1, rocketPhaseTime / 2.6),
          t = 70 * (1 - e) * (1 - e);
        (museum.rocket.position.set(-1.2, t, 2.35),
          (museum.rocketHit.r = t < 8 ? 1.15 : 0),
          (r.intensity = t > 1 ? 3 : 0),
          t <= 0.05 &&
            (museum.rocket.position.set(-1.2, 0, 2.35),
            (rocketPhase = `wait`),
            (rocketPhaseTime = 0),
            (Mt = elapsed + 180),
            (museum.rocketHit.r = 1.15),
            (r.intensity = 0),
            beep(70, 0.12, `triangle`, 0.05)));
      }
    }
    let physAcc = 0;
    const PHYS_DT = 1 / 60;
    function gameLoop() {
      if (!running) return;
      timer.update();
      let raw = Math.min(timer.getDelta(), 0.05);
      physAcc += raw;
      if (physAcc > 0.25) physAcc = 0.25;
      let e = 0, steps = 0;
      while (physAcc >= PHYS_DT && steps < 5) { physAcc -= PHYS_DT; e += PHYS_DT; steps++; }
      if (steps === 0) { e = raw; physAcc = 0; }
      // e = kiinteiden askelten summa (vakaa fysiikka)
      ((elapsed += e), updateRocketLaunch(e), updateRocketBanner(), window.HYYTE && HYYTE._tick(e));
      for (let t of portalRings) t.rotation.z += e * 0.7;
      for (let t of players) {
        let n = readInput(t.index),
          r = n.interact && !t.heldInteract,
          i = n.camera && !t.heldCam,
          a = n.swap && !t.heldSwap,
          o = n.jump && !t.heldJump;
        if (
          ((t.heldInteract = n.interact),
          (t.heldCam = n.camera),
          (t.heldSwap = n.swap),
          (t.heldJump = n.jump),
          (t.enterLock = Math.max(0, t.enterLock - e)),
          n.camIn && (t.camDist = Math.max(3.6, t.camDist - 7 * e)),
          n.camOut && (t.camDist = Math.min(18, t.camDist + 7 * e)),
          n.camUp && (t.camLift = Math.min(10, t.camLift + 4.2 * e)),
          n.camDown && (t.camLift = Math.max(1.15, t.camLift - 4.2 * e)),
          (t.camOrbit = (t.camOrbit ?? 0) + ((n.orbit ?? 0) * 2.3 - (t.camOrbit ?? 0)) * Math.min(1, 7 * e)),
          n.camReset && ((t.camDist = 9), (t.camLift = 4.4)),
          i && !t._forceFP && (t.firstPerson = !t.firstPerson),
          a && !window.HYYTE?.noSwap?.(t) && cycleWeapon(t),
          r && !t.lock)
        ) {
          if (t.rocket) exitRocket(t);
          else if (t.car != null) exitCar(t);
          else if (t.enterLock <= 0) {
            if (t.air === `none` && rocketBoardable() && nearRocket(t)) enterRocket(t);
            else {
              let e = findNearestCar(t);
              e != null && enterCar(t, e);
            }
          }
        }
        // 1.9: juoksu (2× nopeus jalan, 3× nälkä) – Shift / L3
        t.running = !!n.run && n.f !== 0 && t.car == null && !t.rocket && !t.lock && t.air === `none`;
        if (t.lock) ((t.speed = 0), (t.vy = 0), (t.grounded = !0));
        else if (t.rocket)
          ((t.group.visible = !1),
            (t.disc.visible = !1),
            (t.pitch = Math.max(-1.57, Math.min(1.15, t.pitch - n.f * 1.05 * e))),
            (t.yaw += n.turn * 1.25 * e),
            (t.speed = 0),
            (t.vy = 0),
            (t.grounded = !1),
            (t.air = `none`),
            t.pos.set(kl + [0, 0.5, -0.5, 0][t.rocketSeat || 0], museum.rocket.position.y + 3.2, Al + [0, 0, 0, 0.5][t.rocketSeat || 0]),
            t.group.scale.setScalar(1.35),
            o && rocketPhase === `orbit` && window.HYYTE?.toMoon?.(t),
            o &&
              rocketPhase === `wait` &&
              rocketCountdown <= 0 &&
              ((rocketPhase = `ignite`), (rocketPhaseTime = 0), beep(70, 0.2, `sawtooth`, 0.07)));
        else if (t.car != null) {
          let r = cars[t.car];
          if (r._turnSm == null) r._turnSm = 0;
          let rawT = n.turn;
          if (Math.abs(rawT) < 0.08) rawT = 0;
          if (r._turnSm && rawT && Math.sign(r._turnSm) !== Math.sign(rawT) && Math.abs(r._turnSm) > 0.25) {
            r._turnHold = (r._turnHold || 0) + e;
            if (r._turnHold < 0.08) rawT = 0; else r._turnHold = 0;
          } else r._turnHold = 0;
          r._turnSm += (rawT - r._turnSm) * Math.min(1, 14 * e);
          n = Object.assign({}, n, { turn: Math.abs(r._turnSm) < 0.05 ? 0 : r._turnSm });
          setCarGear(r, n.f);
          let i = r.slow > 0 ? 0.25 : 1,
            a = r.nitro > 0 ? 1.6 : 1,
            o = ((t.moon || r._v24moon || r.moonOnly) && window.HYYTE && window.HYYTE.moonH) ? (window.HYYTE.moonH(r.pos.x, r.pos.z) ?? 0) : Ml(r.pos.x, r.pos.z),
            s = r.vy > 0.4 || r.y > o + 0.45,
            c = (n.drift || r.oil > 0) && !s && Math.abs(r.speed) > 2.4,
            l = (e, n) => (s ? outOfBounds(e, n) : wt(e, n, t.car)) || rampBlock(r.pos.x, r.pos.z, e, n, r.y);
          if (c) {
            if (!r.sliding) {
              let e = dirVectors(r.yaw);
              ((r.vx = e.fx * r.speed), (r.vz = e.fz * r.speed), (r.sliding = !0));
            }
            let o = (n.turn === 0 ? 1 : n.turn) * (n.drift ? 6.4 : 3.2) * steerSign(r);
            r.yaw += o * e;
            let s = (r.nitro > 0 ? Math.max(r.top + 16, r.top * (r.boostMul || 1) + 6) : r.top) * i;
            if (n.f > 0) {
              let t = Math.hypot(r.vx, r.vz) || 1,
                n = r.accel * i * a * 0.4 * e;
              ((r.vx += (r.vx / t) * n), (r.vz += (r.vz / t) * n));
            } else n.f < 0 && ((r.vx *= Math.exp(-1.6 * e)), (r.vz *= Math.exp(-1.6 * e)));
            ((r.vx *= Math.exp(-0.22 * e)), (r.vz *= Math.exp(-0.22 * e)));
            let c = Math.hypot(r.vx, r.vz);
            (c > s && ((r.vx *= s / c), (r.vz *= s / c), (c = s)),
              (r.speed = c * (r.speed < 0 ? -1 : 1)));
            let u = r.pos.x + r.vx * e,
              d = r.pos.z + r.vz * e,
              f = Math.hypot(r.vx, r.vz);
            (l(u, r.pos.z)
              ? (f > 10 && damagePlayer(t, Math.min(26, Math.round((f - 8) * 1.15))),
                (r.vx *= -0.25))
              : (r.pos.x = u),
              l(r.pos.x, d)
                ? (f > 10 && damagePlayer(t, Math.min(26, Math.round((f - 8) * 1.15))),
                  (r.vz *= -0.25))
                : (r.pos.z = d));
          } else {
            r.sliding = !1;
            let o = Math.min(1, Math.abs(r.speed) / 7);
            (r.spin > 0 && ((r.spin = Math.max(0, r.spin - e)), (r.yaw += r.spinDir * 8 * e)),
              // 1.9: peruuttaessa ohjaus kuin oikeassa autossa (vasen ohjaus -> perä kääntyy vasemmalle)
              (r.yaw += n.turn * 4.15 * (s ? 0.35 : 0.78 + 0.22 * o) * steerSign(r) * e));
            let c = (r.nitro > 0 ? Math.max(r.top + 16, r.top * (r.boostMul || 1) + 6) : r.top) * i;
            (r.fly && r.flying
              ? (() => {
                  let flyCap = Math.max(c * 1.85, (r.top || 22) * 1.85);
                  if (n.f > 0) r.speed = Math.min(flyCap, r.speed + r.accel * i * a * 0.95 * e);
                  else if (n.f < 0) r.speed = Math.max(-8 * i, r.speed - 22 * e);
                  // 2.3: lentoautolla vauhti ei haihdu itsekseen
                })()
              : s
                ? (r.speed *= Math.exp(-0.12 * e))
                : n.f > 0
                  ? (r.speed = Math.min(c, r.speed + r.accel * i * a * e))
                  : n.f < 0
                    ? (r.speed = Math.max(-7 * i, r.speed - 32 * e))
                    : (r.speed *= Math.exp((r.nitro > 0 ? -0.08 : -0.7) * e)),
              !s && !(r.fly && r.flying) && r.speed > c && (r.speed += (c - r.speed) * Math.min(1, 4 * e)));
            let u = dirVectors(r.yaw);
            ((r.vx = u.fx * r.speed), (r.vz = u.fz * r.speed));
            let d = r.pos.x + u.fx * r.speed * e,
              f = r.pos.z + u.fz * r.speed * e,
              p = Math.abs(r.speed);
            (l(d, r.pos.z)
              ? (p > 10 && damagePlayer(t, Math.min(26, Math.round((p - 8) * 1.15))),
                (r.speed *= 0.2))
              : (r.pos.x = d),
              l(r.pos.x, f)
                ? (p > 10 && damagePlayer(t, Math.min(26, Math.round((p - 8) * 1.15))),
                  (r.speed *= 0.2))
                : (r.pos.z = f));
          }
          // 2.0: lentävä auto – hyppy nousee, pidä pohjassa leijuaksesi
          if (r.fly) {
            let hov = r.group.userData.hover;
            if (n.jump) {
              r.vy = Math.min(9, (r.vy || 0) + 22 * e);
              r.flying = !0;
            } else if (r.flying && r.y > 1.2) {
              r.vy = Math.max(-3.5, (r.vy || 0) - 6 * e);
              if (Math.abs(r.vy) < 1.5) r.vy *= 0.92;
            }
            if (hov) hov.visible = !!r.flying && r.y > 0.6;
            if (r.y > 28) r.vy = Math.min(r.vy, -2);
          }
          // 2.0: pehmeämpi jousitus (massa vaikuttaa); o = maanpinta Ml(...)
          if (!r.fly || !r.flying) {
            let gnd = o;
            let spring = 42 / (r.mass || 1), damp = 9;
            if (r.y <= gnd + 0.35 && (r.vy || 0) <= 0.5) {
              let compress = gnd - r.y;
              r.vy = (r.vy || 0) + (compress * spring - (r.vy || 0) * damp) * e;
              if (r.y < gnd) { r.y = gnd; if (r.vy < 0) r.vy *= -0.15; }
              r.flying = !1;
            }
          }
          ((t.yaw = r.yaw), (t.speed = Math.abs(r.speed)), (t.grounded = r.y < 0.35 && !r.flying));
          let u = dirVectors(r.yaw);
          (t.pos.set(
            r.pos.x - u.rx * 0.28 + u.fx * 0.05,
            r.y + 0.42,
            r.pos.z - u.rz * 0.28 + u.fz * 0.05,
          ),
            t.group.scale.setScalar(0.75));
        } else {
          (t.group.scale.setScalar(1.35),
            t.spin > 0 && ((t.spin = Math.max(0, t.spin - e)), (t.yaw += t.spinDir * 7 * e)),
            (t.yaw += n.turn * 0.95 * e));
          let r = dirVectors(t.yaw),
            i = t.air !== `none`,
            a = t.slow > 0 ? 0.25 : 1,
            o = t.nitro > 0 ? Math.max(1.55, t.boostMul || 0) : 1,
            s = (i ? 3.1 : 7.2) * a * o * (t.down > 0 ? 0.2 : 1) * (t.speedMul ?? 1) * (t.running ? ((typeof window.__runKmh === 'number' && window.__runKmh > 0) ? (window.__runKmh / 12) : 4) : 1),
            c = (e, n) => (i ? outOfBounds(e, n) || dt(e, n, t.pos.y) || wallHit(e, n, 0.45, t.pos.y) : yt(e, n, t.pos.y) || !!window.HYYTE?.voxBlock?.(e, n, t.pos.y)) || rampBlock(t.pos.x, t.pos.z, e, n, t.pos.y);
          // 2.1: pieni step-up — jos este on matala (≤0.55) ja maassa, nosta vähän
          if (n.f !== 0) {
            // 3.4: jaa iso askel osiin, ettei seinien läpi voi tunkeutua hitaalla ruudunpäivityksellä
            let steps = Math.max(1, Math.min(6, Math.ceil((s * e) / 0.22)));
            let sx = (r.fx * n.f * s * e) / steps, sz = (r.fz * n.f * s * e) / steps;
            for (let k = 0; k < steps; k++) {
              let i = t.pos.x + sx, a = t.pos.z + sz;
              if (c(i, t.pos.z)) {
                if (t.grounded && t.pos.y < 0.6) {
                  let up = t.pos.y + 0.55;
                  let c2 = (e, n) => yt(e, n, up) || wallHit(e, n, 0.45, up) || !!window.HYYTE?.voxBlock?.(e, n, up) || rampBlock(t.pos.x, t.pos.z, e, n, up);
                  if (!c2(i, t.pos.z)) { t.pos.y = up; t.pos.x = i; }
                }
              } else t.pos.x = i;
              if (c(t.pos.x, a)) {
                if (t.grounded && t.pos.y < 0.6) {
                  let up = t.pos.y + 0.55;
                  let c2 = (e, n) => yt(e, n, up) || wallHit(e, n, 0.45, up) || !!window.HYYTE?.voxBlock?.(e, n, up) || rampBlock(t.pos.x, t.pos.z, e, n, up);
                  if (!c2(t.pos.x, a)) { t.pos.y = up; t.pos.z = a; }
                }
              } else t.pos.z = a;
            }
            t.speed = s;
          } else t.speed = 0;
          if (t.air === `eject`) {
            t.airT += e;
            let n = Math.min(1, t.airT / 0.9),
              i = 1.1 + 8.9 * (1 - (1 - n) ** 3);
            (Math.abs(t.pos.x) < 9.3 &&
              Math.abs(t.pos.z) < 5.3 &&
              t.pos.y < Ol &&
              i > 4.86 &&
              (i = 4.86),
              (t.pos.y = i));
            let a = (1 - n) * 4.2 * e,
              o = t.pos.x + r.fx * a,
              s = t.pos.z + r.fz * a;
            (!outOfBounds(o, t.pos.z) && !dt(o, t.pos.z, t.pos.y) && (t.pos.x = o),
              !outOfBounds(t.pos.x, s) && !dt(t.pos.x, s, t.pos.y) && (t.pos.z = s),
              (t.vy = 0),
              (t.grounded = !1),
              n >= 1 &&
                ((t.air = `chute`),
                (t.airT = 0),
                (t.chute.visible = !0),
                beep(140, 0.16, `sine`, 0.04)));
          } else if (t.air === `chute`) {
            t.airT += e;
            let n = t.pos.y > 25 ? 26 : t.airT < 0.85 ? 0.2 : 1.35,
              r = t.pos.y - n * e,
              i = Math.abs(t.pos.x) <= 9.2 && Math.abs(t.pos.z) <= 5.2;
            if (
              ((t.vy = -n),
              (t.grounded = !1),
              (t.chute.rotation.z = Math.sin(elapsed * 1.6 + t.index) * 0.08),
              (t.chute.rotation.x = Math.cos(elapsed * 1.3 + t.index) * 0.06),
              i && t.pos.y >= 5.29 && r < Ol)
            )
              ((t.pos.y = Ol), landPlayer(t));
            else {
              t.pos.y = r;
              let e = pt(t.pos.x, t.pos.z, t.pos.y);
              t.pos.y <= e && ((t.pos.y = Math.max(e, 0)), landPlayer(t));
            }
          } else {
            let r = pt(t.pos.x, t.pos.z, t.pos.y);
            (n.jump && t.grounded && t.slow <= 0 && ((t.vy = t.moon ? 20.5 : 7.2), (t.grounded = !1), (t.wasAir = !0)),
              (t.vy -= 22 * (t.moon ? 0.28 : 1) * e),
              (() => {
                let d = dirVectors(t.yaw);
                if (!t.grounded && t.airSpeed && n.f === 0) {
                  t.pos.x += t.airFX * t.airSpeed * e;
                  t.pos.z += t.airFZ * t.airSpeed * e;
                }
                if (!t.grounded) { t.airFX = d.fx; t.airFZ = d.fz; t.airSpeed = t.speed * 0.85; }
              })(),
              (t.pos.y += t.vy * e),
              t.pos.y <= r && (
                t.wasAir && t.vy < -10 ? ((t.pos.y = r), (t.vy = -t.vy * 0.18), (t.wasAir = t.vy > 2)) : ((t.pos.y = r), (t.vy = 0), (t.grounded = !0), (t.wasAir = !1))
              ));
          }
        }
        if (
          ((t.hurt = Math.max(0, t.hurt - e)),
          (t.down = Math.max(0, t.down - e)),
          t.repair > 0 &&
            ((t.hp = Math.min(100, t.hp + 10 * e)),
            (t.repair = Math.max(0, t.repair - e)),
            t.hp >= 100 && (t.repair = 0)),
          t.car == null && !t.rocket && t.hurt <= 0 && t.air === `none`)
        )
          for (let e of cars) {
            if (t.moon || Math.abs(e.speed) < 9) continue;
            let n = e.pos.x - t.pos.x,
              r = e.pos.z - t.pos.z;
            if (n * n + r * r > 2.4) continue;
            let i = dirVectors(e.yaw);
            ((t.pos.x += i.fx * 0.8), (t.pos.z += i.fz * 0.8), (t.vy = 5));
            let a = e.occupied != null && e.occupied !== t.index ? players[e.occupied] : void 0;
            damagePlayer(t, Math.min(30, Math.round(Math.abs(e.speed) * 0.9)), a);
            break;
          }
        if (
          ((t.slow = Math.max(0, t.slow - e)),
          (t.nitro = Math.max(0, t.nitro - e)),
          (t.canCd = Math.max(0, t.canCd - e)),
          (t.portalCd = Math.max(0, t.portalCd - e)),
          t.car == null && !t.rocket && t.portalCd <= 0)
        ) {
          let e = portalAt(t.pos.x, t.pos.z, t.pos.y);
          if (e >= 0) {
            let n = portalExit(e);
            ((t.pos.x = n.x),
              (t.pos.z = n.z),
              (t.yaw = n.yaw),
              (t.portalCd = 1.5),
              beep(540, 0.14, `sine`, 0.07));
          }
        }
        if (t.weapon === `can`) {
          let e = t.canCd <= 0,
            n = e ? 1 : 1 - t.canCd / 10;
          t.weaponGroup.traverse((t) => {
            if (!(t instanceof Mesh) || !t.userData.canBody) return;
            let r = t.material;
            e
              ? (r.color.set(`#3ddc6a`),
                r.emissive.set(`#39d353`),
                (r.emissiveIntensity = 0.42 + Math.sin(elapsed * 6) * 0.22))
              : n > 0.72
                ? (r.color.set(`#f6c445`), r.emissive.set(`#ff9f0a`), (r.emissiveIntensity = 0.4))
                : (r.color.set(`#6b7280`), r.emissive.set(`#2a211c`), (r.emissiveIntensity = 0.06));
          });
        }
        if (t.weapon === `laser`) {
          let e = t.cd <= 0;
          t.weaponGroup.traverse((t) => {
            if (!(t instanceof Mesh) || !t.userData.laserBody) return;
            let n = t.material;
            e
              ? (n.emissive.set(`#ff2430`),
                (n.emissiveIntensity = 1.2 + Math.sin(elapsed * 8) * 0.45))
              : (n.emissive.set(`#334155`), (n.emissiveIntensity = 0.15));
          });
        }
        ((t.swing = Math.max(0, t.swing - e * 4)),
          t.weapon === `katana`
            ? ((t.weaponGroup.rotation.x = 0), (t.weaponGroup.rotation.z = -t.swing * 1.7))
            : ((t.weaponGroup.rotation.z = 0), (t.weaponGroup.rotation.x = -t.swing * 1.2)));
        let s =
          t.car == null && t.air === `none` && t.speed > 0
            ? Math.sin(elapsed * 12 + t.index) * 0.06
            : 0;
        (t.group.position.set(t.pos.x, t.pos.y + s, t.pos.z),
          t.air !== `none` &&
            (t.seat.position.set(t.pos.x, t.pos.y + 0.02, t.pos.z),
            (t.seat.rotation.y = t.yaw + Math.PI),
            t.chute.position.set(t.pos.x, t.pos.y + 3.05, t.pos.z)),
          t.disc.position.set(
            t.car == null ? t.pos.x : cars[t.car].pos.x,
            0.05,
            t.car == null ? t.pos.z : cars[t.car].pos.z,
          ),
          (t.coat.visible = t.slow > 0 && t.car == null && !t.rocket),
          t.coat.position.set(t.pos.x, t.pos.y, t.pos.z),
          t.coat.scale.setScalar(1 + Math.sin(elapsed * 8) * 0.04),
          (t.group.rotation.y = t.yaw + Math.PI));
        let c = t.car == null ? t.pos.x : cars[t.car].pos.x,
          l = t.car == null ? t.pos.z : cars[t.car].pos.z,
          u = (t.car == null ? t.pos.y : cars[t.car].y) + 2.55;
        t.bar.position.set(c, u, l);
        let d = Math.round(t.hp);
        if (
          (d !== t.barShown &&
            ((t.barShown = d),
            drawHealthBar(t.barCtx, t.bar.material.map, d, t.color)),
          t.hpFlash > 0 && (t.hpFlash -= e),
          n.fire && !t.lock && !window.HYYTE?.noFire?.(t) ? updateFiring(t, e) : (t.cd = Math.max(0, t.cd - e)),
          mt(t, e),
          t.rocket && t.pitch < -0.28)
        ) {
          let e = Je(qe(), Ke(t.yaw, t.pitch));
          if (e) {
            ((p.visible = !0), p.position.set(e.x, 0.2, e.z));
            let t = 0.9 + Math.sin(elapsed * 7) * 0.12;
            p.scale.setScalar(t);
          }
        }
      }
      players.some((e) => e.rocket && e.pitch < -0.28) || (p.visible = !1);
      for (let t of cars) {
        if (
          ((t.slow = Math.max(0, t.slow - e)),
          (t.nitro = Math.max(0, t.nitro - e)),
          (t.oil = Math.max(0, t.oil - e)),
          (t.portalCd = Math.max(0, t.portalCd - e)),
          t.portalCd <= 0)
        ) {
          let e = portalAt(t.pos.x, t.pos.z, t.y || t.pos.y || 0);
          if (e >= 0) {
            let n = portalExit(e);
            ((t.pos.x = n.x), (t.pos.z = n.z), (t.yaw = n.yaw));
            let r = dirVectors(n.yaw);
            ((t.vx = r.fx * t.speed),
              (t.vz = r.fz * t.speed),
              (t.portalCd = 1.5),
              t.occupied != null &&
                ((players[t.occupied].yaw = n.yaw), (players[t.occupied].portalCd = 1.5)),
              beep(540, 0.14, `sine`, 0.07));
          }
        }
        let n = Ml(t.pos.x, t.pos.z);
        // 2.0: vauhtityyny ennen luiskaa
        {
          let bp = window.__rampBoostPad;
          if (bp && Math.abs(t.pos.x - bp.x) < bp.rx && Math.abs(t.pos.z - bp.z) < bp.rz && Math.abs(t.speed) > 4) {
            t.rampBoost = 1.6;
            if (Math.abs(t.speed) < t.top + 10) t.speed += (t.speed >= 0 ? 1 : -1) * 22 * e;
            t.nitro = Math.max(t.nitro, 0.35);
          }
          if (t.rampBoost > 0) t.rampBoost = Math.max(0, t.rampBoost - e);
        }
        // 2.3: luiskahypyn tunnistus – leveämpi ikkuna, ei vaadi vx>3 (riittää eteenpäisvauhti)
        {
          let onTip = t.pos.x > wl - 6.2 && t.pos.x < wl + 2.8 && Math.abs(t.pos.z) < Tl + 1.1;
          let fastEnough = Math.abs(t.speed) > 5.5;
          let dir = dirVectors(t.yaw);
          let fwdDot = dir.fx * Math.sign(t.speed || 1); // ~1 kun keula kohti +x
          let climbing = (n > El * 0.22 || t.y > El * 0.28) && t.vy < 3.2 && (t.airT || 0) < 0.22;
          if (onTip && fastEnough && climbing && (fwdDot > 0.15 || t.pos.x > wl - 2.5)) {
            let launchSp = Math.max(Math.abs(t.speed), 12) * (t.rampBoost ? 1.25 : 1.08);
            t.speed = (t.speed >= 0 ? 1 : -1) * launchSp;
            let tipAng = Math.atan2(El * 2, Math.max(6, wl - 40));
            ((t.vx = dir.fx * t.speed * Math.cos(tipAng * 0.35)),
              (t.vz = dir.fz * t.speed * Math.cos(tipAng * 0.35)),
              (t.vy = Math.max(10.5, 6.8 + tipAng * 14 + (t.rampBoost ? 2.2 : 0))),
              (t.y = Math.max(t.y, n) + 0.28),
              (t.airT = 0.02),
              (t.hopSpeed = Math.abs(t.speed)),
              (t._rampLaunchX = t.pos.x),
              (t._rampLaunchZ = t.pos.z),
              (t._rampJump = !0),
              (t.scoredHop = !1),
              (t.sliding = !1),
              (t.rampBoost = 0),
              beep(260, 0.09, `sawtooth`, 0.045));
          }
        }
        if (t.y > n + 0.12 || t.vy > 0.35 || t.flying) {
          let grav = t.fly && t.flying ? 7 : 20;
          ((t.vy -= grav * e), (t.y += t.vy * e), (t.airT += e));
          // 2.1: lentoauto ei mene maan alle — clamp aina maahan
          if (t.y < n) {
            t.y = n;
            if (t.flying && t.vy < 0) t.vy = 0;
            if (!t.flying) {
              if (t.occupied != null && !t.scoredHop && (t._rampJump || t.airT > 0.28)) {
                let e2 = t.pos.x - wl;
                let dLaunch = Math.hypot(t.pos.x - (t._rampLaunchX != null ? t._rampLaunchX : wl), t.pos.z - (t._rampLaunchZ || 0));
                let dist = Math.max(e2, dLaunch * 0.9);
                let n2 = t.hopSpeed > 1 ? t.hopSpeed : Math.abs(t.speed);
                if (dist > 0.8 && (t._rampJump || e2 > 0.5)) {
                  t.scoredHop = !0;
                  players[t.occupied].score += 1;
                  logJump(t.occupied, dist, n2);
                  beep(620, 0.1, `square`, 0.045);
                }
              }
              t._rampJump = !1;
              t.airT = 0;
              t.vy = 0;
            }
          }
        } else ((t.y = n), (t.vy = 0), (t.scoredHop = !1), (t._rampJump = !1), (t.airT = 0));
        if (t.fly && t.y < n) t.y = n;
        if (((t.pos.y = t.y), t.sliding)) {
          if (((t.puff += e), t.puff > 0.08 && Te.length < 48)) {
            t.puff = 0;
            let e = new Mesh(Ee, De.clone());
            (e.position.set(t.pos.x, t.y + 0.28, t.pos.z),
              (e.castShadow = !1),
              scene.add(e),
              Te.push({
                mesh: e,
                life: 0.45,
              }));
          }
        } else t.puff = 0;
        (t.occupied == null &&
          t.spin > 0 &&
          ((t.spin = Math.max(0, t.spin - e)), (t.yaw += t.spinDir * 8 * e)),
          (t.group.rotation.y = t.yaw + Math.PI));
        let r = t.group.userData.wheels;
        if (r) for (let n of r) n.rotation.x -= t.speed * e * 2.2;
        if (t.coat) ((t.coat.visible = t.slow > 0), t.coat.position.set(t.pos.x, t.y + 0.2, t.pos.z));
        let i = t.group.userData.boost;
        if (i && ((i.visible = t.nitro > 0), t.nitro > 0)) {
          let e = 0.82 + Math.sin(elapsed * 46) * 0.2;
          i.scale.set(e, e, 1.05 + Math.sin(elapsed * 34) * 0.3);
        }
      }
      for (let t = projectiles.length - 1; t >= 0; t--) {
        let n = projectiles[t];
        ((n.age += e), (n.life -= e));
        let r = !1;
        if (n.bouncy) {
          n.vy -= 16 * e;
          let t = n.mesh.position.x + n.vx * e,
            i = n.mesh.position.z + n.vz * e;
          if (
            (yt(t, n.mesh.position.z) ? (n.vx *= -0.7) : (n.mesh.position.x = t),
            yt(n.mesh.position.x, i) ? (n.vz *= -0.7) : (n.mesh.position.z = i),
            (n.mesh.position.y += n.vy * e),
            n.mesh.position.y < n.radius &&
              ((n.mesh.position.y = n.radius),
              n.vy < 0 && (n.vy = -n.vy * 0.8),
              (n.vx *= 0.992),
              (n.vz *= 0.992)),
            (n.mesh.rotation.z += Math.hypot(n.vx, n.vz) * e * 0.8),
            (n.mesh.rotation.x += e * 1.5),
            (n.playerCd = Math.max(0, n.playerCd - e)),
            n.playerCd <= 0)
          )
            for (let e of players) {
              if (e.index === n.owner) continue;
              let t = e.pos.x - n.mesh.position.x,
                r = e.pos.z - n.mesh.position.z,
                i = 1 - n.mesh.position.y;
              if (t * t + r * r + i * i < (n.radius + 0.6) ** 2) {
                ((e.vy = n.kind === `plasma` ? 6.5 : 4.5),
                  damagePlayer(e, n.kind === `plasma` ? 10 : n.kind === `freeze` ? 4 : 7, players[n.owner]),
                  (players[n.owner].score += 1),
                  (n.playerCd = 0.7),
                  n.kind === `freeze` && ((e.slow = Math.max(e.slow, 3.5)), e.car != null && (cars[e.car].slow = Math.max(cars[e.car].slow, 3.5))),
                  beep(n.kind === `freeze` ? 990 : 170, 0.09, `sine`));
                break;
              }
            }
          for (let e of targets) {
            if (!e.alive || n.got.has(e)) continue;
            let t = e.x - n.mesh.position.x,
              r = e.z - n.mesh.position.z;
            t * t + r * r < (n.radius + e.r) ** 2 &&
              Math.abs(n.mesh.position.y - e.y) < e.r + 0.8 &&
              (n.got.add(e),
              (e.alive = !1),
              (e.t = 2.2),
              (e.mesh.visible = !1),
              (players[n.owner].score += e.points),
              beep(500, 0.08, `sine`));
          }
          r = n.life <= 0;
        } else if (n.kind === `slime`)
          ((n.vy -= 2.2 * e),
            (n.mesh.position.x += n.vx * e),
            (n.mesh.position.y += n.vy * e),
            (n.mesh.position.z += n.vz * e),
            He(n.mesh, n.vx, n.vz),
            (r = n.mesh.position.y < 0.3 || n.life <= 0 || nt(n)));
        else if (n.kind === `rocket`) {
          ((n.mesh.position.x += n.vx * e),
            (n.mesh.position.y += n.vy * e),
            (n.mesh.position.z += n.vz * e),
            He(n.mesh, n.vx, n.vz));
          let t = !1;
          for (let e of players)
            e.index !== n.owner &&
              (e.pos.x - n.mesh.position.x) ** 2 + (e.pos.z - n.mesh.position.z) ** 2 < 1.6 &&
              (t = !0);
          if (!t)
            for (let e of targets)
              e.alive &&
                (e.x - n.mesh.position.x) ** 2 + (e.z - n.mesh.position.z) ** 2 <
                  (e.r + 0.35) ** 2 &&
                (t = !0);
          ((r = n.mesh.position.y < 0.2 || n.life <= 0 || t),
            r &&
              We(n.mesh.position.x, Math.max(0.6, n.mesh.position.y), n.mesh.position.z, n.owner));
        } else {
          if ((n.kind === `bow` && (n.vy -= 9 * e), n.ret)) {
            let e = players[n.owner];
            if (n.age > 0.45) {
              let t = e.pos.x - n.mesh.position.x,
                r = e.pos.z - n.mesh.position.z,
                i = Math.hypot(t, r) || 1;
              ((n.vx = (t / i) * 12), (n.vz = (r / i) * 12), i < 0.8 && (n.life = 0));
            }
          }
          ((n.mesh.position.x += n.vx * e),
            (n.mesh.position.y += n.vy * e),
            (n.mesh.position.z += n.vz * e),
            (n.mesh.rotation.y += e * 12),
            (n.mesh.rotation.z += e * 10),
            (r =
              n.mesh.position.y < 0.05 ||
              n.life <= 0 ||
              rt(n) ||
              at(n) ||
              (n.kind !== `lighter` && it(n))));
        }
        r && (scene.remove(n.mesh), disposeObject(n.mesh), projectiles.splice(t, 1));
      }
      for (let t = Ce.length - 1; t >= 0; t--) {
        let n = Ce[t];
        if (
          ((n.life -= e),
          (n.arm = Math.max(0, n.arm - e)),
          n.mesh.userData.spinFree || (n.mesh.rotation.y += e * 1.4),
          n.kind === `boost`)
        ) {
          // Vauhtilätäkkö: jokainen auto / pelaaja saa vauhdin kerran 1,5 s välein, lätäkkö ei katoa ennen 30 s
          let now = performance.now() / 1000,
            pul = 1 + 0.08 * Math.sin(now * 6);
          (n.mesh.scale.set(pul, 1, pul), n.life < 3 && (n.mesh.visible = Math.sin(now * 14) > -0.3));
          for (let c = 0; c < cars.length; c++) {
            let q = cars[c];
            if ((q.pos.x - n.x) ** 2 + (q.pos.z - n.z) ** 2 < 3.6 && (q.y ?? 0) < Ml(n.x, n.z) + 0.8 && !(n.hit.get(`c` + c) > now)) {
              n.hit.set(`c` + c, now + 1.5);
              let m = 1.5 + Math.random() * 0.5,
                dir = q.speed < -0.5 ? -1 : 1,
                v = Math.max(Math.abs(q.speed), 8) * m;
              ((q.nitro = Math.max(q.nitro || 0, 2.5)), (q.speed = dir * Math.min(v, q.top * m + 6)));
              let u = dirVectors(q.yaw);
              ((q.vx = u.fx * q.speed), (q.vz = u.fz * q.speed), (q.boostMul = m), beep(880, 0.12, `triangle`, 0.07), setTimeout(() => beep(1320, 0.12, `triangle`, 0.06), 90));
              let drv = players.find((p) => p.car === c);
              drv && (drv.boostNote = 2, drv.boostMul = m);
              window.HYYTE?.emit?.(`boost`, drv ? drv.index : -1, m);
            }
          }
          for (let p of players)
            if (p.car == null && !p.moon && p.air === `none` && !p.rocket && (p.pos.x - n.x) ** 2 + (p.pos.z - n.z) ** 2 < 2.4 && !(n.hit.get(`p` + p.index) > now)) {
              n.hit.set(`p` + p.index, now + 1.5);
              let m = 1.5 + Math.random() * 0.5;
              ((p.nitro = Math.max(p.nitro || 0, 1.6 * m)), (p.boostNote = 2), (p.boostMul = m), beep(880, 0.1, `triangle`, 0.06));
              window.HYYTE?.emit?.(`boost`, p.index, m);
            }
        } else if (n.arm <= 0) {
          for (let e of cars)
            if ((e.pos.x - n.x) ** 2 + (e.pos.z - n.z) ** 2 < (n.kind === `banana` ? 2.6 : 3.4)) {
              (n.kind === `oil`
                ? (e.oil = 2.8)
                : n.kind === `spike`
                  ? ((e.slow = 3.2), (e.speed *= 0.35), (e.vx *= 0.35), (e.vz *= 0.35))
                  : ((e.spin = 0.75),
                    (e.spinDir = Math.random() < 0.5 ? 1 : -1),
                    (e.speed *= 0.32)),
                (n.life = 0),
                beep(120, 0.1, `square`));
              break;
            }
        }
        if (n.life > 0 && n.arm <= 0 && n.kind !== `boost`) {
          for (let e of players)
            if (
              e.car == null &&
              e.air === `none` &&
              (e.pos.x - n.x) ** 2 + (e.pos.z - n.z) ** 2 < 1.2
            ) {
              ((e.spin = 0.6), (e.spinDir = Math.random() < 0.5 ? 1 : -1), (n.life = 0));
              break;
            }
        }
        n.life <= 0 && (scene.remove(n.mesh), disposeObject(n.mesh), Ce.splice(t, 1));
      }
      for (let t = we.length - 1; t >= 0; t--) {
        let n = we[t];
        ((n.life -= e),
          (n.vy -= 12 * e),
          (n.mesh.position.x += n.vx * e),
          (n.mesh.position.y += n.vy * e),
          (n.mesh.position.z += n.vz * e),
          (n.life <= 0 || n.mesh.position.y < 0.05) &&
            (scene.remove(n.mesh), disposeObject(n.mesh), we.splice(t, 1)));
      }
      for (let t = Te.length - 1; t >= 0; t--) {
        let n = Te[t];
        ((n.life -= e),
          (n.mesh.position.y += 1.1 * e),
          n.mesh.scale.setScalar(1 + (0.45 - Math.max(0, n.life)) * 2.4));
        let r = n.mesh.material;
        ((r.opacity = Math.max(0, n.life * 1.3)),
          n.life <= 0 && (scene.remove(n.mesh), r.dispose(), Te.splice(t, 1)));
      }
      for (let t of targets)
        t.alive
          ? t.bob && (t.mesh.position.y = t.y + Math.sin(performance.now() * 0.003 + t.x) * 0.15)
          : ((t.t -= e), t.t <= 0 && ((t.alive = !0), (t.mesh.visible = !0)));
      for (let t of trees)
        t.fire <= 0 ||
          ((t.fire -= e),
          t.flames.scale.setScalar(Math.max(0.25, 0.75 + Math.sin(elapsed * 24 + t.x) * 0.28)),
          t.fire <= 0 && ((t.fire = 0), (t.flames.visible = !1), t.flames.scale.setScalar(1)));
      for (let t = ye.length - 1; t >= 0; t--) {
        let n = ye[t];
        n.life -= e;
        let r = Math.max(0, n.life / 0.4);
        (n.obj.traverse((e) => {
          if (!(e instanceof Mesh)) return;
          let t = e.material;
          ((t.opacity = r), (t.transparent = !0));
        }),
          n.life <= 0 && (scene.remove(n.obj), disposeObject(n.obj), ye.splice(t, 1)));
      }
      ((ie.rotation.z = Math.sin(elapsed * 1.25) * 0.045),
        (ie.rotation.x = Math.cos(elapsed * 0.8) * 0.03),
        updateLaserBolts(e));
      for (let t of j) t.rotation.y += e * 0.15;
      let n = canvas.clientWidth || 1,
        u = canvas.clientHeight || 1,
        d = viewLayout(n, u);
      layoutOverlays(d, n, u);
      perfTick(e);
      // 1.9: Maan näkymät ensin, sitten Kuun näkymät (varjokartta vaihtuu maailman mukana)
      d.sort((A, B) => (players[A.i].moon ? 1 : 0) - (players[B.i].moon ? 1 : 0));
      for (let t of d) {
        let n = players[t.i],
          r = cameras[t.i],
          i = dirVectors(n.yaw),
          u,
          d,
          p,
          m = 62,
          h = 520;
        if (n.rocket) {
          let e = qe(),
            i = Ke(n.yaw, n.pitch),
            a = Je(e, i),
            g = Math.max(0, Math.min(1, (-i.y - 0.2) / 0.6)),
            _ = e.x,
            v = e.y,
            y = e.z;
          if (
            ((u = e.x + i.x * 48), (d = e.y + i.y * 48), (p = e.z + i.z * 48), (m = 70), a && g > 0)
          ) {
            let t = Math.max(8, a.dist - 16),
              n = e.x + i.x * t,
              r = e.y + i.y * t,
              o = e.z + i.z * t,
              s = -i.z,
              c = i.x,
              l = Math.hypot(s, c) || 1,
              f = 9 * g,
              h = n + (s / l) * f,
              b = r + 5 * g,
              x = o + (c / l) * f;
            ((_ = _ * (1 - g) + h * g),
              (v = v * (1 - g) + b * g),
              (y = y * (1 - g) + x * g),
              (u = u * (1 - g) + a.x * g),
              (d = d * (1 - g) + a.y * g),
              (p = p * (1 - g) + a.z * g),
              (m = 70 * (1 - g) + 36 * g));
          }
          ((h = n.pitch > 0.05 ? 900 : 480), r.position.set(_, v, y), r.layers.enable(10 + t.i));
          let b = n.pitch > 0.12;
          ((f.visible = b), (scene.background = b ? c : s), (scene.fog = b ? null : l), window.HYYTE?.skyNight?.(b));
        } else {
          ((f.visible = !1), (scene.background = s), (scene.fog = l), window.HYYTE?.skyNight?.(!1));
          let a = n.car == null ? n.pos : cars[n.car].pos,
            c,
            h,
            g;
          if (n.firstPerson) {
            let e = n.car == null ? 0.42 : 0.28;
            ((c = a.x + i.fx * e),
              (h = a.y + (n.car == null ? 1.5 : 1.05)),
              (g = a.z + i.fz * e),
              (u = c + i.fx * 7),
              (d = n.car == null ? h - 0.12 : 0.4),
              (p = g + i.fz * 7),
              r.position.set(c, h, g),
              r.layers.disable(10 + t.i),
              (m = 74));
          } else {
            let o = n.air !== `none`,
              s = o ? 14 : n.camDist,
              l = o ? 3.2 : n.camLift;
            let ov = n.camOrbit ? dirVectors(n.yaw + n.camOrbit) : i;
            ((c = a.x - ov.fx * s),
              (g = a.z - ov.fz * s),
              (h = a.y + l),
              (u = a.x + i.fx * (o ? 0 : 1.2)),
              (d = a.y + (o ? 2.2 : 1.15)),
              (p = a.z + i.fz * (o ? 0 : 1.2)));
            // 1.9: tasainen kameratörmäys – vaimennettu sisäänveto, hystereesi ja oman hahmon häivytys
            if (!camerasReady || o || !n.camS) n.camS = { x: c, y: h, z: g };
            else {
              let t = 1 - 0.0015 ** e;
              ((n.camS.x += (c - n.camS.x) * t), (n.camS.y += (h - n.camS.y) * t), (n.camS.z += (g - n.camS.z) * t));
            }
            {
              let px = a.x,
                py = a.y + 1.6,
                pz = a.z,
                vx = n.camS.x - px,
                vy = n.camS.y - py,
                vz = n.camS.z - pz,
                full = Math.hypot(vx, vy, vz) || 0.01,
                free = window.HYYTE?.camRay ? window.HYYTE.camRay(px, py, pz, vx / full, vy / full, vz / full, full) : full,
                ak = Math.max(0, Math.min(1, free / full));
              n.camK == null && (n.camK = ak);
              if (ak < n.camK) {
                ((n.camK += (ak - n.camK) * (1 - Math.exp(-18 * e))), (n.camHold = 0));
                // ei koskaan syvälle palikan sisään: korkeintaan 0.25 m yli vapaan matkan
                n.camK = Math.min(n.camK, (free + 0.25) / full);
              } else if (ak > n.camK + 0.04) {
                ((n.camHold = (n.camHold || 0) + e), n.camHold > 0.25 && (n.camK += (ak - n.camK) * (1 - Math.exp(-3 * e))));
              } else n.camHold = 0;
              let k = Math.max(0.4 / full, Math.min(1, n.camK));
              (r.position.set(px + vx * k, py + vy * k, pz + vz * k), (n.camNear = full * k));
              // oma hahmo häivytetään kun kamera on aivan kiinni (estää välkkymisen)
              (n.camNear < 1.6 && n.car == null ? r.layers.disable(10 + t.i) : r.layers.enable(10 + t.i));
            }
            // 1.9: sohvalla kamera katsoo TV:tä
            n.tvCam && (r.position.set(n.tvCam[0], n.tvCam[1], n.tvCam[2]), (u = n.tvCam[3]), (d = n.tvCam[4]), (p = n.tvCam[5]), r.layers.disable(10 + t.i));
            m = n.weapon === `scope` && readInput(n.index).fire ? 32 : 62;
          }
        }
        window.HYYTE?.viewWorld?.(n, r, t);
        ((r.fov = m),
          (r.far = Math.min(h, farCap)),
          (r.aspect = t.w / Math.max(t.h, 1)),
          r.updateProjectionMatrix(),
          r.lookAt(u, d, p),
          renderer.setViewport(t.x, t.y, t.w, t.h),
          renderer.setScissor(t.x, t.y, t.w, t.h),
          renderer.render(scene, r));
      }
      camerasReady = !0;
      let notes = players.map((e) => controlsHint(e)),
        nk = notes.join(`\u0001`);
      nk !== Vt && ((Vt = nk), onNote?.(...notes));
      let hk = players
        .map((e) => [e.score, Math.round(e.hp), e.weapon, e.rounds, e.slot, e.running ? 1 : 0].join(`,`))
        .join(`|`);
      if (hk !== Nt) {
        Nt = hk;
        let e = (e) => ({
          score: e.score,
          hp: Math.round(e.hp),
          rounds: e.rounds,
          weapon: weaponName(e.weapon),
          running: e.running,
          slots: e.weapons
            .map((t, n) => (n === e.slot ? `[${weaponName(t)}]` : weaponName(t)))
            .join(` · `),
        });
        onHud(...players.map(e));
      }
    }
    return (
      window.HYYTE &&
        HYYTE._attach({
          projectiles: projectiles,
          laserBolts: laserBolts,
          groundHeight: Ml,
          isBlocked: (x, z) => wt(x, z, -1),
          outOfBounds: outOfBounds,
          dirVectors: dirVectors,
          input: readInput,
          isKeyDown: isKeyDown,
          obstacles: obstacles,
          canvas: canvas,
          challenge: !!options.challenge,
          players: players,
          cars: cars,
          museum: museum,
          scene: scene,
          renderer: renderer,
          cameras: cameras,
          course: { pads: ne, tiles: re },
          rocketInfo: () => ({ x: kl, z: Al, phase: rocketPhase, y: museum.rocket.position.y }),
          rocketState: () => ({
            phase: rocketPhase,
            countdown: rocketCountdown,
            riders: rocketRiders().map((e) => e.index),
            rocketY: museum.rocket.position.y,
          }),
          enterRocket: enterRocket,
          exitRocket: exitRocket,
          setRocket: (e, t) => {
            ((e === `wait` ||
              e === `ignite` ||
              e === `rise` ||
              e === `orbit` ||
              e === `gone` ||
              e === `drop`) &&
              (rocketPhase = e),
              (rocketPhaseTime = t),
              (museum.rocket.visible = e !== `gone`));
          },
          nearestFoe: nearestFoe,
          trees: trees,
          targets: targets,
          options: options,
          beep: beep,
          damage: damagePlayer,
          fireHandLaser: fireHandLaser,
          spawnProjectile: Ge,
        }),
      renderer.setAnimationLoop(gameLoop),
      {
        dispose() {
          (window.HYYTE && HYYTE._detach(),
            (running = !1),
            renderer.setAnimationLoop(null),
            window.removeEventListener(`keydown`, onKeyDown),
            window.removeEventListener(`keyup`, onKeyUp),
            window.removeEventListener(`blur`, onBlur),
            resizeObserver.disconnect(),
            window.__controlsTest && delete window.__controlsTest,
            audioCtx?.close(),
            rocketBanner.remove(),
            renderer.dispose());
        },
        setTouch(e, t, n) {
          n ? touchKeys[e].add(t) : touchKeys[e].delete(t);
        },
      }
    );
  }
  let rootEl = document.getElementById(`root`);
  if (!rootEl) throw Error(`root puuttuu`);
  function loadPlayerSetup(e, t) {
    try {
      let n = localStorage.getItem(e);
      if (!n) return t;
      let r = JSON.parse(n);
      if (!HEROES.some((e) => e.id === r.hero)) return t;
      if (!Array.isArray(r.weapons)) {
        let e = [...t.weapons];
        r.weapon && WEAPONS.some((e) => e.id === r.weapon) && (e[0] = r.weapon);
        let n = e.filter((t, n) => e.indexOf(t) === n).slice(0, 12);
        return {
          hero: r.hero,
          weapons: n,
          houseColor: typeof r.houseColor === `string` ? r.houseColor : void 0,
          garageColor: typeof r.garageColor === `string` ? r.garageColor : void 0,
          carType: [`normal`, `toy`, `sports`, `flying`].includes(r.carType) ? r.carType : void 0,
          carColor: typeof r.carColor === `string` ? r.carColor : void 0,
        };
      }
      let i = [...r.weapons.filter((e) => WEAPONS.some((t) => t.id === e))];
      for (let e of t.weapons) {
        if (i.length >= 12) break;
        i.includes(e) || i.push(e);
      }
      let a = i.filter((e, t) => i.indexOf(e) === t).slice(0, 12);
      return a.length === 0
        ? t
        : {
            hero: r.hero,
            weapons: a,
            houseColor: typeof r.houseColor === `string` ? r.houseColor : void 0,
            garageColor: typeof r.garageColor === `string` ? r.garageColor : void 0,
            carType: [`normal`, `toy`, `sports`, `flying`].includes(r.carType) ? r.carType : void 0,
            carColor: typeof r.carColor === `string` ? r.carColor : void 0,
          };
    } catch {}
    return t;
  }
  // 3.0: 1–12 pelaajaa. Asetukset hyyte-p1…p12, pelaajamäärä hyyte-players, laitteet hyyte-devices.
  const DEF_SETUP = [
    { hero: `ninja`, weapons: [`star`, `wrench`, `slime`, `boost`] },
    { hero: `knight`, weapons: [`bow`, `oil`, `can`, `boost`] },
    { hero: `cat`, weapons: [`ball`, `banana`, `boomerang`, `boost`] },
    { hero: `dog`, weapons: [`katana`, `spikes`, `laser`, `boost`] },
    { hero: `ninja`, weapons: [`star`, `oil`, `banana`, `boost`] },
    { hero: `knight`, weapons: [`bow`, `wrench`, `slime`, `boost`] },
    { hero: `cat`, weapons: [`ball`, `spikes`, `can`, `boost`] },
    { hero: `dog`, weapons: [`katana`, `boomerang`, `laser`, `boost`] },
    { hero: `ninja`, weapons: [`star`, `ball`, `wrench`, `boost`] },
    { hero: `knight`, weapons: [`bow`, `banana`, `slime`, `boost`] },
    { hero: `cat`, weapons: [`katana`, `oil`, `can`, `boost`] },
    { hero: `dog`, weapons: [`boomerang`, `spikes`, `laser`, `boost`] },
  ];
  let setups = DEF_SETUP.map((d, i) => loadPlayerSetup(`hyyte-p${i + 1}`, { ...d, weapons: [...d.weapons] })),
    p1Setup = setups[0],
    p2Setup = setups[1],
    playerCount = (() => {
      let v = Number(localStorage.getItem(`hyyte-players`));
      if (v >= 1 && v <= 12) return Math.round(v);
      try {
        const coarse = (window.matchMedia && matchMedia(`(pointer: coarse)`).matches) || (navigator.maxTouchPoints || 0) > 0;
        const short = Math.min(screen.width || innerWidth, screen.height || innerHeight);
        if (coarse && short < 700) return 1;
      } catch (e) {}
      return 2;
    })(),
    challengeMode = !1,
    hudState = [],
    currentGame = null;
  const blankHud = () => ({ score: 0, hp: 100, rounds: 0, weapon: ``, slots: `` });
  hudState = setups.map(blankHud);
  const saveSetups = () => setups.forEach((s, i) => localStorage.setItem(`hyyte-p${i + 1}`, JSON.stringify(s)));
  // --- laitteet: näppäimistösarja (wasd / arrows / ei) ja ohjainpaikka (0–3 / ei) pelaajaa kohden ---
  // Automaattinen jako: näppäimistö riittää kahdelle (WASD = P1, nuolet = P2); ohjaimet täyttävät loput.
  function autoDevices(n) {
    let kb = [`wasd`, `arrows`, null, null, null, null, null, null, null, null, null, null];
    // ohjaimet 0..11; kahdelle ensimmäiselle myös näppäimistö
    return Array.from({ length: n }, (_, i) => ({ kb: kb[i] || null, pad: i < 12 ? i : -1 }));
  }
  function loadDevices() {
    try {
      let d = JSON.parse(localStorage.getItem(`hyyte-devices`) || `null`);
      if (d && d.auto === !1 && Array.isArray(d.list)) {
        let L = autoDevices(playerCount).map((a, i) => {
          let x = d.list[i] || {};
          return {
            kb: x.kb === `wasd` || x.kb === `arrows` ? x.kb : x.kb === null ? null : a.kb,
            pad: Number.isInteger(x.pad) && x.pad >= -1 && x.pad < 12 ? x.pad : a.pad,
          };
        });
        return { auto: !1, list: L };
      }
    } catch {}
    return { auto: !0, list: autoDevices(playerCount) };
  }
  let devices = loadDevices();
  const saveDevices = () => localStorage.setItem(`hyyte-devices`, JSON.stringify({ auto: devices.auto, list: devices.list }));
  const KB_NAME = { wasd: `Näppäimistö WASD`, arrows: `Näppäimistö nuolet` };
  const settingOn = (k, d) => {
    let v = localStorage.getItem(`hyyte-` + k);
    return v == null ? d : v === `1` || v === `true`;
  };
  const hungerMin = () => {
    let v = Number(localStorage.getItem(`hyyte-hunger-min`));
    // 2.3: nälkä hitaampi – oletus 20 min, liuku 5–40
    return v >= 5 && v <= 40 ? Math.round(v) : 20;
  };
  const runKmh = () => {
    let v = Number(localStorage.getItem(`hyyte-run-kmh`));
    // 2.4: oletus 48 km/h (= 4× kävelyperusta 12 km/h, eli 2× aiempaa juoksua)
    return v >= 12 && v <= 80 ? Math.round(v) : 48;
  };
  const arcadePhys = () => localStorage.getItem(`hyyte-arcade`) === `1`;
  const dashDiff = () => {
    let v = Number(localStorage.getItem(`hyyte-dash-diff`));
    if (!Number.isFinite(v)) v = 3;
    return Math.max(1, Math.min(10, Math.round(v)));
  };
  // --- kokoruutu: pyydetään automaattisesti ensimmäisestä painalluksesta (selain vaatii käyttäjän eleen) ---
  let fsAsked = !1;
  const fsOn = () => settingOn(`fullscreen`, !0);
  function enterFullscreen() {
    let d = document.documentElement;
    if (document.fullscreenElement || !d.requestFullscreen) return;
    try {
      let p = d.requestFullscreen({ navigationUI: `hide` });
      p && p.catch && p.catch(() => {});
    } catch {}
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      try {
        let p = document.exitFullscreen();
        p && p.catch && p.catch(() => {});
      } catch {}
    } else enterFullscreen();
  }
  const firstGesture = (e) => {
    if (fsAsked || !fsOn()) return;
    if (e.type === `keydown` && (e.code === `Escape` || e.code === `F11` || e.code === `Tab`)) return;
    if (e.target && e.target.closest && e.target.closest(`[data-nofs]`)) return;
    fsAsked = !0;
    enterFullscreen();
  };
  window.addEventListener(`pointerdown`, firstGesture, !0);
  window.addEventListener(`keydown`, firstGesture, !0);
  window.addEventListener(`keydown`, (e) => {
    e.code === `F9` && !e.repeat && (e.preventDefault(), toggleFullscreen());
  });
  window.__fs = { enter: enterFullscreen, toggle: toggleFullscreen, asked: () => fsAsked, on: fsOn };
  function heroFigureHtml(e) {
    return `<span class="fig ${e}" aria-hidden><i class="cape"></i><i class="body"></i><i class="head"></i><i class="ear l"></i><i class="ear r"></i></span>`;
  }
  function weaponIconSvg(e) {
    let t = `<svg class="wicon" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">`,
      n = `</svg>`;
    if (e === `shield`)
      return `${t}<path d="M16 3 27 8v8c0 7-5 11-11 13C10 27 5 23 5 16V8z" fill="#d7dde8" stroke="#102430" stroke-width="2"/>${n}`;
    if (e === `bow`)
      return `${t}<path d="M10 4c8 6 8 18 0 24" fill="none" stroke="#8d5a32" stroke-width="3"/><path d="M10 4 22 16 10 28" fill="none" stroke="#102430" stroke-width="2"/>${n}`;
    if (e === `axe`)
      return `${t}<path d="M15 6v22" stroke="#8d5a32" stroke-width="3"/><path d="M15 8h8l-2 6 2 6h-8z" fill="#d0d4dc" stroke="#102430"/>${n}`;
    if (e === `boomerang`)
      return `${t}<path d="M8 24c8-2 14-8 14-14 0 8-4 12-12 14z" fill="#ff6a00" stroke="#102430"/>${n}`;
    if (e === `star`)
      return `${t}<path d="M16 3 19 13h10l-8 6 3 10-8-6-8 6 3-10-8-6h10z" fill="#f6c445" stroke="#ff5a36"/>${n}`;
    if (e === `ball`)
      return `${t}<circle cx="16" cy="16" r="11" fill="#ff3b30" stroke="#102430" stroke-width="2"/><path d="M16 5v22M7 16h18" stroke="#ffd60a" stroke-width="3"/><path d="M9 9c6 3 6 11 0 14M23 9c-6 3-6 11 0 14" fill="none" stroke="#0a84ff" stroke-width="2"/>${n}`;
    if (e === `katana`)
      return `${t}<path d="M14 28v-6" stroke="#5c3317" stroke-width="3"/><path d="M10 22h8" stroke="#f6c445" stroke-width="3"/><path d="M16 22 18 4" stroke="#d7e4f5" stroke-width="3"/>${n}`;
    if (e === `slime`)
      return `${t}<ellipse cx="16" cy="18" rx="12" ry="8" fill="#39d353" stroke="#102430" stroke-width="2"/><circle cx="10" cy="14" r="4" fill="#7bed8a"/><circle cx="20" cy="12" r="3" fill="#b6f5bf"/>${n}`;
    if (e === `rocket`)
      return `${t}<path d="M16 3 20 14h-8z" fill="#f6c445" stroke="#102430"/><rect x="13" y="13" width="6" height="12" fill="#ff5a36" stroke="#102430"/><path d="M13 25c2 4 4 4 6 0" fill="#ffd60a"/>${n}`;
    if (e === `banana`)
      return `${t}<path d="M8 20c2-8 8-12 16-8 2 6-2 12-8 12-4 0-6-2-8-4z" fill="#ffe14a" stroke="#102430" stroke-width="2"/>${n}`;
    if (e === `wrench`)
      return `${t}<path d="M14 28v-12" stroke="#d5dbe6" stroke-width="4" stroke-linecap="round"/><path d="M8 16h12" stroke="#d5dbe6" stroke-width="4"/><path d="M8 16V8M20 16V8" stroke="#d5dbe6" stroke-width="4" stroke-linecap="round"/><circle cx="14" cy="27" r="3.4" fill="none" stroke="#d5dbe6" stroke-width="2.6"/>${n}`;
    if (e === `oil`)
      return `${t}<ellipse cx="16" cy="20" rx="11" ry="6" fill="#1a1c22" stroke="#f6c445" stroke-width="2"/><path d="M16 4c3 4 3 7 0 10-3-3-3-6 0-10z" fill="#222"/>${n}`;
    if (e === `can`)
      return `${t}<rect x="6" y="11" width="16" height="15" rx="1.5" fill="#2f9e44" stroke="#102430" stroke-width="2"/><rect x="8" y="16" width="12" height="3" fill="#d8f3dc"/><path d="M9 11c1-5 6-5 7-1" fill="none" stroke="#d5dbe6" stroke-width="2"/><rect x="18" y="6" width="6" height="6" rx="1" fill="#f4efe6" stroke="#102430"/><path d="M20 6V4h2" stroke="#102430" stroke-width="2"/>${n}`;
    if (e === `spikes`)
      return `${t}<path d="M6 24 10 8l4 16 4-16 4 16" fill="none" stroke="#c5ccd6" stroke-width="2"/><path d="M5 24h22" stroke="#102430" stroke-width="2"/>${n}`;
    if (e === `laser`)
      return `${t}<rect x="3" y="14" width="16" height="5" rx="1" fill="#141824" stroke="#ff3b30" stroke-width="1.4"/><rect x="17" y="15" width="9" height="3" fill="#ff5a4a"/><circle cx="27.5" cy="16.5" r="2.2" fill="#fff"/><rect x="7" y="19" width="4" height="7" rx="1" fill="#ff4d6d"/><circle cx="11" cy="11" r="2.4" fill="#ff2430"/>${n}`;
    if (e === `boost`)
      return `${t}<ellipse cx="16" cy="21" rx="13" ry="7" fill="#1fb6ff" stroke="#102430" stroke-width="2"/><path d="M10 23l6-5 6 5M10 19l6-5 6 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>${n}`;
    if (e === `plasma`)
      return `${t}<circle cx="16" cy="16" r="11" fill="#da77f2" stroke="#102430" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#e599f7"/>${n}`;
    if (e === `gravity`)
      return `${t}<circle cx="16" cy="16" r="10" fill="none" stroke="#fab005" stroke-width="3"/><circle cx="16" cy="16" r="4" fill="#ffd43b"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="#fab005" stroke-width="2"/>${n}`;
    if (e === `freeze`)
      return `${t}<path d="M16 4v24M6 10l20 12M6 22l20-12" stroke="#74c0fc" stroke-width="3"/><circle cx="16" cy="16" r="5" fill="#e7f5ff" stroke="#102430"/>${n}`;
    if (e === `tether`)
      return `${t}<circle cx="16" cy="8" r="5" fill="#ff922b" stroke="#102430"/><path d="M16 13c0 8-6 12-6 16h12c0-4-6-8-6-16z" fill="#868e96" stroke="#102430"/>${n}`;
    if (e === `floatgun`)
      return `${t}<circle cx="16" cy="16" r="10" fill="#ffd43b" stroke="#102430"/><path d="M16 8v8M12 14h8" stroke="#102430" stroke-width="2"/>${n}`;
    if (e === `blind`)
      return `${t}<ellipse cx="16" cy="16" rx="12" ry="8" fill="#adb5bd" stroke="#102430"/><circle cx="11" cy="16" r="2" fill="#222"/><circle cx="21" cy="16" r="2" fill="#222"/>${n}`;
    if (e === `shrink`)
      return `${t}<circle cx="16" cy="16" r="11" fill="#74c0fc" stroke="#102430"/><circle cx="16" cy="16" r="5" fill="#fff"/>${n}`;
    if (e === `bubble`)
      return `${t}<circle cx="16" cy="16" r="11" fill="#a5d8ff" opacity="0.7" stroke="#102430"/><circle cx="12" cy="12" r="3" fill="#fff" opacity="0.6"/>${n}`;
    if (e === `swapgun`)
      return `${t}<path d="M8 12h10l-2-4M24 20H14l2 4" fill="none" stroke="#da77f2" stroke-width="3"/>${n}`;
    if (e === `slowmo`)
      return `${t}<circle cx="16" cy="16" r="11" fill="#9775fa" stroke="#102430"/><path d="M16 8v9l6 3" fill="none" stroke="#fff" stroke-width="2"/>${n}`;
    if (e === `jelly`)
      return `${t}<ellipse cx="16" cy="18" rx="11" ry="8" fill="#69db7c" stroke="#102430"/>${n}`;
    if (e === `magnet`)
      return `${t}<path d="M10 8v10a6 6 0 0 0 12 0V8" fill="none" stroke="#ff6b6b" stroke-width="4"/><path d="M10 8h4M18 8h4" stroke="#228be6" stroke-width="4"/>${n}`;
    if (e === `tornado`)
      return `${t}<path d="M16 4c8 4 8 8 0 10s-8 6 0 10" fill="none" stroke="#ced4da" stroke-width="3"/>${n}`;
    if (e === `reverse`)
      return `${t}<path d="M10 16a6 6 0 1 0 6-6" fill="none" stroke="#ff922b" stroke-width="3"/><path d="M16 6l4 4-4 2" fill="#ff922b"/>${n}`;
    if (e === `lighter`)
      return `${t}<rect x="12" y="12" width="8" height="14" rx="1" fill="#d0d4dc" stroke="#102430"/><path d="M16 11c2 3 0 5 0 5s3-1 3-4-3-6-3-6-1 2 0 5z" fill="#ff5a36"/>${n}`;
    let r = e === `rifle` || e === `shotgun` || e === `scope` || e === `minigun`;
    return `${t}<rect x="${r ? 4 : 8}" y="14" width="${r ? 22 : 14}" height="5" rx="1" fill="#222"/>${e === `scope` ? `<rect x="12" y="10" width="8" height="4" fill="#d0d4dc" stroke="#102430"/>` : ``}${e === `minigun` ? `<rect x="20" y="12" width="8" height="9" fill="#444"/>` : ``}<rect x="8" y="18" width="4" height="7" fill="#8d5a32"/>${n}`;
  }
  function deviceText(i) {
    let d = devices.list[i] || {},
      P = window.HYYTE_PAD?.pads?.() || [],
      parts = [];
    d.kb && parts.push(`⌨️ ${KB_NAME[d.kb]}`);
    if (d.pad >= 0) {
      let g = P[d.pad];
      parts.push(`🎮 Ohjain ${d.pad + 1}${g ? ` (${g.name})` : ` – ei kytketty`}`);
    }
    return parts.join(` + `) || `⚠️ Ei ohjainta – valitse laite alla`;
  }
  function paneHint(i) {
    let d = devices.list[i] || {},
      K = window.HYYTE?.KB?.[d.kb],
      L = (a) => (K && K[a] ? K[a] : ``),
      kb =
        d.kb === `wasd`
          ? `W eteen, S taakse, A ja D kääntävät. Välilyönti hyppää, F ase, G vaihda ase, E autoon/rakettiin/ulos, Q driftaus, V syö, Vasen Shift juoksu.`
          : d.kb === `arrows`
            ? `Nuolet liikkuvat. 0 hyppää, 1 ase, 8 vaihda ase, 2 autoon/rakettiin/ulos, 9 driftaus, . syö, Oikea Shift juoksu.`
            : ``,
      pad = d.pad >= 0 ? `🎮 Ohjain ${d.pad + 1}: tatti liikkuu, A/✕ hyppy, RT/R2 ase, X/□ autoon, Y/△ syö, RB/R1 vaihda ase, B/○ drifti, LS/L3 juoksu.` : ``;
    return [kb, pad].filter(Boolean).join(` `) || `Tällä pelaajalla ei ole vielä ohjainta.`;
  }
  function playerPaneHtml(e, t, n, r, i) {
    return `<section class="pane ${t}"><h2>${e}</h2><p class="dev">${deviceText(i)}</p><p class="hint">${paneHint(i)}</p><h3>Sankari</h3><div class="grid">${HEROES.map((e) => `<button type="button" class="${n.hero === e.id ? `pick on` : `pick`}" data-who="${r}" data-kind="hero" data-id="${e.id}">${heroFigureHtml(e.id)}<span><b>${e.name}</b><small>${e.blurb}</small></span></button>`).join(``)}</div><h3>Aseet (max 12)</h3><div class="grid">${WEAPONS.map(
      (e) => {
        let t = n.weapons.indexOf(e.id);
        return `<button type="button" class="${t >= 0 ? `pick on` : `pick`}" data-who="${r}" data-kind="weapon" data-id="${e.id}">${t >= 0 ? `<em class="slotn">${t + 1}</em>` : ``}${weaponIconSvg(e.id)}<span><b>${e.name}</b><small>${e.blurb}</small></span></button>`;
      },
    ).join(``)}</div>${homePickHtml(n, r, i)}</section>`;
  }
  const HOME_COLORS = [`#f4e3c1`, `#e8a87c`, `#c94f4f`, `#6fa8dc`, `#93c47d`, `#ffd966`, `#b4a7d6`, `#ffffff`, `#7f6a5a`];
  const GARAGE_COLORS = [`#c0c4cc`, `#4f5b66`, `#c94f4f`, `#3d85c6`, `#6aa84f`, `#f1c232`, `#e69138`, `#ffffff`];
  const LOBBY_COLORS = [`#ff5a36`,`#3aa0ff`,`#40c057`,`#f59f00`,`#be4bdb`,`#e64980`,`#15aabf`,`#82c91e`,`#fab005`,`#fd7e14`,`#7950f2`,`#12b886`];
  const CAR_TYPES_UI = [
    { id: `normal`, name: `Tavallinen`, blurb: `Vakaa perheauto` },
    { id: `toy`, name: `Leikkiauto`, blurb: `Pieni ja näppärä` },
    { id: `sports`, name: `Urheiluauto`, blurb: `Nopea ja matala` },
    { id: `flying`, name: `Lentävä`, blurb: `Hypyllä lentoon!` },
  ];
  const CAR_COLOR_UI = [`#2f9e44`, `#f6c445`, `#e03131`, `#1c7ed6`, `#be4bdb`, `#15aabf`, `#ff922b`, `#fab005`, `#ffffff`, `#212529`];
  function homePickHtml(n, r, i) {
    let sw = (kind, list, cur) =>
      list.map((c) => `<button type="button" class="${cur === c ? `sw on` : `sw`}" data-who="${r}" data-kind="${kind}" data-id="${c}" style="background:${c}" aria-label="${c}"></button>`).join(``);
    let ct = n.carType || [`normal`, `sports`, `toy`, `flying`][i] || `normal`;
    let cars = CAR_TYPES_UI.map((c) => `<button type="button" class="${ct === c.id ? `pick on` : `pick`}" data-who="${r}" data-kind="carType" data-id="${c.id}"><span><b>🚗 ${c.name}</b><small>${c.blurb}</small></span></button>`).join(``);
    return `<h3>Oma auto</h3><div class="grid car-grid">${cars}</div><h3>Auton väri</h3><div class="swatches">${sw(`carColor`, CAR_COLOR_UI, n.carColor || CAR_COLOR_UI[i % CAR_COLOR_UI.length])}</div><h3>Oma talo</h3><div class="swatches">${sw(`house`, HOME_COLORS, n.houseColor || HOME_COLORS[[0, 3, 4, 5][i] ?? 0])}</div><h3>Autotalli</h3><div class="swatches">${sw(`garage`, GARAGE_COLORS, n.garageColor || GARAGE_COLORS[[2, 3, 4, 5][i] ?? 2])}</div>${i===0?`<h3>Köysitelineen väri</h3><div class="swatches">${[`#1c7ed6`,`#e03131`,`#2f9e44`,`#f08c00`,`#9c36b5`,`#212529`].map(c=>`<button type="button" class="${(n.ropeColor||`#1c7ed6`)===c?`sw on`:`sw`}" data-who="${r}" data-kind="ropeColor" data-id="${c}" style="background:${c}" aria-label="köysi ${c}"></button>`).join(``)}</div>`:``}`;
  }
  function deviceTableHtml() {
    let P = window.HYYTE_PAD?.pads?.() || [],
      opt = (v, cur, t) => `<option value="${v}"${String(cur) === String(v) ? ` selected` : ``}>${t}</option>`,
      rows = devices.list
        .map(
          (d, i) => `<tr class="pc${i}"><th><i class="dot" style="background:${LOBBY_COLORS[i]}"></i>Pelaaja ${i + 1}</th>
        <td><select data-dev="kb" data-i="${i}" aria-label="Pelaaja ${i + 1}: näppäimistö">${opt(``, d.kb ?? ``, `– ei näppäimistöä –`)}${opt(`wasd`, d.kb, `⌨️ WASD + välilyönti`)}${opt(`arrows`, d.kb, `⌨️ Nuolet + numerot`)}</select></td>
        <td><select data-dev="pad" data-i="${i}" aria-label="Pelaaja ${i + 1}: peliohjain">${opt(-1, d.pad, `– ei ohjainta –`)}${Array.from({length:12},(_,k)=>k).map((k) => opt(k, d.pad, `🎮 Ohjain ${k + 1}${P[k] ? ` · ${P[k].name}` : ``}`)).join(``)}</select></td></tr>`,
        )
        .join(``);
    return `<details class="devices"${devices.auto ? `` : ` open`}><summary>🎮 Ohjaimet ja näppäimistö <small>${devices.auto ? `automaattinen jako` : `oma jako`}</small></summary>
      <p class="muted">Näppäimistö riittää kahdelle pelaajalle (WASD ja nuolet). Jokainen Xbox- tai PS5-ohjain on yksi pelaaja. Ohjaimet numeroidaan siinä järjestyksessä kuin ne kytketään – paina ohjaimen nappia, niin se ilmestyy listaan.</p>
      <table class="devtab">${rows}</table>
      <button type="button" class="mode" id="devAuto">↺ Automaattinen jako</button></details>`;
  }
  function showLobby() {
    let N = playerCount;
    devices.auto && (devices.list = autoDevices(N));
    devices.list.length !== N && (devices.list = autoDevices(N).map((a, i) => devices.list[i] || a));
    ((rootEl.innerHTML = `<main class="lobby">
    <h1>Hyytelö<span>sankarit</span></h1>
    <p class="ver">versio 3.5</p>
    <button class="go" type="button" id="go">Aloita</button>
    <p class="lead">Uutta 3.5: toimii puhelimella ja tabletilla (kosketus, Mobiili-grafiikka, kotiin asennettava). Toimii ilman nettiä.</p>
    <div class="modes">
      <button type="button" class="${challengeMode ? `mode` : `mode on`}" id="modeFree">Vapaa leikki</button>
      <button type="button" class="${challengeMode ? `mode on` : `mode`}" id="modeDuel">Haaste</button>
    </div>
    <div class="setup19">
      <div class="pcount"><span>Pelaajia:</span>${[1,2,3,4,5,6,7,8,9,10,11,12].map((k) => `<button type="button" class="${k === N ? `mode on` : `mode`}" data-np="${k}">${k}</button>`).join(``)}</div>
      <label class="hunger-set"><span>🍽️ Nälkä:</span><input type="range" min="5" max="40" step="1" value="${hungerMin()}" id="hungerMin" aria-label="Nälkä minuutteina"><b id="hungerVal">${hungerMin()} min</b></label>
      <label class="hunger-set"><span>🏃 Juoksu:</span><input type="range" min="12" max="80" step="1" value="${runKmh()}" id="runKmh" aria-label="Juoksunopeus km/h"><b id="runVal">${runKmh()} km/h</b></label>
      <label class="hunger-set"><span>🟦 Kuutiojuoksu VA:</span><input type="range" min="1" max="10" step="1" value="${dashDiff()}" id="dashDiff" aria-label="Kuutiojuoksu vaikeusaste"><b id="dashDiffVal">${dashDiff()}</b></label>
      <label class="fs-set"><input type="checkbox" id="arcadePhys"${arcadePhys() ? ` checked` : ``}> <span>🕹️ Arcade (ei fysiikkaa)</span></label>
      <label class="fs-set" data-nofs><input type="checkbox" id="fsAuto"${fsOn() ? ` checked` : ``}> <span>⛶ Kokoruutu automaattisesti</span></label>
      ${deviceTableHtml()}
    </div>
    <div class="lobby18"></div>
    <div class="cols n${N}">
      ${setups.slice(0, N).map((s, i) => playerPaneHtml(`Pelaaja ${i + 1}`, `p${i + 1}`, s, `p${i + 1}`, i)).join(``)}
    </div>
    <section class="kikka-lobby"></section>
    <button class="go end" type="button" id="go2">Aloita</button>
    <section class="scores"></section>
  </main>`),
      rootEl.querySelectorAll(`[data-kind]`).forEach((e) => {
        e.addEventListener(`click`, () => {
          let t = setups[Number(String(e.dataset.who).slice(1)) - 1] || p1Setup;
          if (e.dataset.kind === `hero`) t.hero = e.dataset.id;
          else if (e.dataset.kind === `house`) t.houseColor = e.dataset.id;
          else if (e.dataset.kind === `garage`) t.garageColor = e.dataset.id;
          else if (e.dataset.kind === `carType`) t.carType = e.dataset.id;
          else if (e.dataset.kind === `carColor`) t.carColor = e.dataset.id;
          else if (e.dataset.kind === `ropeColor`) { t.ropeColor = e.dataset.id; try { localStorage.setItem('hyyte-rope-color', e.dataset.id); } catch {} }
          else {
            let n = e.dataset.id,
              r = t.weapons.indexOf(n);
            r >= 0
              ? t.weapons.length > 1 && t.weapons.splice(r, 1)
              : (t.weapons.push(n), t.weapons.length > 12 && t.weapons.shift());
          }
          (saveSetups(), showLobby());
        });
      }),
      rootEl.querySelectorAll(`[data-np]`).forEach((b) =>
        b.addEventListener(`click`, () => {
          ((playerCount = Number(b.dataset.np)), localStorage.setItem(`hyyte-players`, String(playerCount)));
          devices.auto ? (devices.list = autoDevices(playerCount)) : (devices.list = autoDevices(playerCount).map((a, i) => devices.list[i] || a));
          (saveDevices(), showLobby());
        }),
      ),
      rootEl.querySelectorAll(`select[data-dev]`).forEach((s) =>
        s.addEventListener(`change`, () => {
          let i = Number(s.dataset.i),
            d = devices.list[i];
          if (s.dataset.dev === `kb`) {
            let v = s.value || null;
            v && devices.list.forEach((o, j) => j !== i && o.kb === v && (o.kb = null));   // sama sarja vain yhdelle
            d.kb = v;
          } else {
            let v = Number(s.value);
            v >= 0 && devices.list.forEach((o, j) => j !== i && o.pad === v && (o.pad = -1));
            d.pad = v;
          }
          ((devices.auto = !1), saveDevices(), showLobby());
        }),
      ),
      document.getElementById(`devAuto`)?.addEventListener(`click`, () => {
        ((devices = { auto: !0, list: autoDevices(playerCount) }), saveDevices(), showLobby());
      }),
      document.getElementById(`hungerMin`)?.addEventListener(`input`, (e) => {
        let v = Math.max(5, Math.min(40, Math.round(Number(e.target.value) || 20)));
        (localStorage.setItem(`hyyte-hunger-min`, String(v)), (document.getElementById(`hungerVal`).textContent = v + ` min`));
      }),
      document.getElementById(`runKmh`)?.addEventListener(`input`, (e) => {
        let v = Math.max(12, Math.min(80, Math.round(Number(e.target.value) || 48)));
        (localStorage.setItem(`hyyte-run-kmh`, String(v)), (window.__runKmh = v), (document.getElementById(`runVal`).textContent = v + ` km/h`));
      }),
      document.getElementById(`dashDiff`)?.addEventListener(`input`, (e) => {
        let v = Math.max(1, Math.min(10, Math.round(Number(e.target.value) || 3)));
        (localStorage.setItem(`hyyte-dash-diff`, String(v)), (document.getElementById(`dashDiffVal`).textContent = String(v)));
      }),
      ((window.__runKmh = runKmh()), (window.__arcadePhys = arcadePhys())),
      document.getElementById(`arcadePhys`)?.addEventListener(`change`, (e) => {
        localStorage.setItem(`hyyte-arcade`, e.target.checked ? `1` : `0`);
        window.__arcadePhys = !!e.target.checked;
        try { window.HYYTE.arcadePhys = window.__arcadePhys; } catch {}
      }),
      document.getElementById(`fsAuto`)?.addEventListener(`change`, (e) => {
        localStorage.setItem(`hyyte-fullscreen`, e.target.checked ? `1` : `0`);
        e.target.checked ? ((fsAsked = !0), enterFullscreen()) : document.fullscreenElement && toggleFullscreen();
      }),
      document.getElementById(`modeFree`).addEventListener(`click`, () => {
        ((challengeMode = !1), showLobby());
      }),
      document.getElementById(`modeDuel`).addEventListener(`click`, () => {
        ((challengeMode = !0), showLobby());
      }));
    let e = () => {
      (saveSetups(), saveDevices(), (hudState = setups.map(blankHud)), (function(){ try { if (setups[0]?.ropeColor) localStorage.setItem('hyyte-rope-color', setups[0].ropeColor); } catch{} })(), fsOn() && enterFullscreen(), startStage());
    };
    (document.getElementById(`go`).addEventListener(`click`, e),
      document.getElementById(`go2`).addEventListener(`click`, e));
    // ohjainlistan päivitys kun ohjain kytketään (piirretään uudelleen vain jos lista muuttui eikä valikko ole auki)
    clearInterval(window.__lobbyPadIv);
    let padSig = JSON.stringify((window.HYYTE_PAD?.pads?.() || []).map((g) => g && g.id));
    window.__lobbyPadIv = setInterval(() => {
      if (!rootEl.querySelector(`.lobby`)) return clearInterval(window.__lobbyPadIv);
      let s = JSON.stringify((window.HYYTE_PAD?.pads?.() || []).map((g) => g && g.id));
      if (s !== padSig && !(document.activeElement && /SELECT|INPUT/.test(document.activeElement.tagName))) ((padSig = s), showLobby());
      let P = window.HYYTE_PAD?.pads?.() || [];
      rootEl.querySelectorAll(`.devtab tr`).forEach((tr, i) => {
        let d = devices.list[i];
        tr.classList.toggle(`act`, !!(d && d.pad >= 0 && P[d.pad]?.active));
      });
    }, 400);
    // 1.8: nimet, grafiikka, ohjaimet, hatut ja Pistetaulukko (lobby18 / stats.js)
    try {
      window.HYYTE?.lobbyExtras?.(rootEl, { setups, players: N, p1: p1Setup, p2: p2Setup, challenge: challengeMode, rerender: showLobby });
    } catch (err) {
      console.warn(err);
    }
  }
  function touchPadHtml(e, t) {
    let n = (e, n) => `<button type="button" data-player="${t}" data-btn="${n}">${e}</button>`;
    return `<div class="pad ${e}"><div class="stick">${n(`↑`, `up`)}${n(`←`, `left`)}${n(`→`, `right`)}${n(`↓`, `down`)}</div><div class="acts">${n(`Hyppy`, `jump`)}${n(`Ase`, `fire`)}${n(`Auto`, `interact`)}${n(`Liuku`, `drift`)}${n(`Vaihda`, `swap`)}${n(`Katse`, `camera`)}</div></div>`;
  }
  function heroName(e) {
    return HEROES.find((t) => t.id === e)?.name ?? e;
  }
  function renderHud() {
    let st = rootEl.querySelector(`.stage`);
    if (!st) return;
    let N = Number(st.dataset.n) || 2;
    for (let i = 0; i < N; i++) {
      let e = st.querySelector(`.vp.v${i} .hud`),
        r = hudState[i] || blankHud();
      if (!e) continue;
      let low = r.hp < 35 ? ` low` : ``,
        run = r.running ? ` · 🏃` : ``;
      let nm = (window.HYYTE?.stats?.names?.() || [])[i] || `P${i + 1}`;
      e.innerHTML = `<div><b style="color:${LOBBY_COLORS[i]}">${nm}</b> ${heroName(setups[i]?.hero)} · ${r.score} · erä ${r.rounds}${run}</div><div class="bar"><i class="${low}" style="width:${r.hp}%;background:${r.hp < 35 ? `` : LOBBY_COLORS[i]}"></i></div><div>${r.hp}/100 · ${r.slots || r.weapon}</div>`;
    }
  }
  // 3 pelaajaa: neljännessä ruudussa tilannetaulu ja pieni kartta
  function infoPanel() {
    let box = rootEl.querySelector(`.vp.info`);
    if (!box || box.style.display === `none` || !currentGame) return;
    let H = window.HYYTE,
      pl = H?.players || [];
    if (!pl.length) return;
    let cv = box.querySelector(`canvas`),
      list = box.querySelector(`.info-list`);
    list.innerHTML = pl
      .map((p, i) => {
        let m = H.money?.get?.(i) ?? 0,
          h = H.hunger?.get ? Math.round(H.hunger.get(i)) : null,
          k = H.kikka?.points?.(i) ?? 0;
        return `<li><i class="dot" style="background:${LOBBY_COLORS[i]}"></i><b>${(window.HYYTE?.stats?.names?.()||[])[i]||('P'+(i+1))}</b> ${heroName(setups[i]?.hero)} <span>🪙${m}</span>${h != null ? `<span>🍽️${h}%</span>` : ``}<span>🤸${k}</span>${p.moon ? `<span>🌙 Kuussa</span>` : ``}</li>`;
      })
      .join(``);
    if (!cv) return;
    let w = (cv.width = cv.clientWidth * (window.devicePixelRatio > 1 ? 1.5 : 1)),
      h2 = (cv.height = cv.clientHeight * (window.devicePixelRatio > 1 ? 1.5 : 1)),
      g = cv.getContext(`2d`);
    if (!g || w < 10 || h2 < 10) return;
    let R = 170,
      s = Math.min(w, h2) / (2 * R),
      X = (x) => w / 2 + x * s,
      Z = (z) => h2 / 2 - z * s;
    g.fillStyle = `#5f9e4c`;
    g.fillRect(0, 0, w, h2);
    g.strokeStyle = `#d8d2c4`;
    g.lineWidth = Math.max(2, 7 * s);
    for (let k = -120; k <= 120; k += 60) {
      g.beginPath(), g.moveTo(X(-R), Z(k)), g.lineTo(X(R), Z(k)), g.stroke();
      g.beginPath(), g.moveTo(X(k), Z(-R)), g.lineTo(X(k), Z(R)), g.stroke();
    }
    let ri = currentGame?.rocketInfo?.();
    ri && ((g.fillStyle = `#fff`), g.fillRect(X(ri.x) - 4, Z(ri.z) - 6, 8, 12));
    pl.forEach((p, i) => {
      let q = H.posOf ? H.posOf(p) : p.pos;
      g.fillStyle = LOBBY_COLORS[i];
      g.strokeStyle = `#102430`;
      g.lineWidth = 2;
      g.beginPath(), g.arc(X(q.x), Z(q.z), p.moon ? 4 : 7, 0, Math.PI * 2), g.fill(), g.stroke();
      g.fillStyle = `#fff`;
      g.font = `bold ${Math.max(10, 12 * (w / 300))}px system-ui`;
      g.fillText(`P${i + 1}${p.moon ? `🌙` : ``}`, X(q.x) + 8, Z(q.z) - 6);
    });
  }
  // valikkoon palataan vasta kun KAIKKI pelaajat hyväksyvät (peli jatkuu sillä välin)
  const MENU_TIMEOUT = 10;
  let menuConfirmCleanup = null;
  function setupMenuConfirm(leave, N) {
    menuConfirmCleanup?.();
    let stage = rootEl.querySelector(`.stage`),
      back = document.getElementById(`back`),
      box = document.createElement(`div`);
    ((box.className = `menu-confirm`),
      (box.hidden = !0),
      (box.innerHTML = `<div class="mc-title">Palataanko valikkoon?</div>
      <div class="mc-sub">${N > 1 ? `Kaikkien pelaajien pitää hyväksyä. Peli jatkuu sillä aikaa.` : `Hyväksy, niin palataan aulaan.`}</div>
      <div class="mc-row">${Array.from({ length: N }, (_, i) => `<button type="button" class="mc-p p${i + 1}" data-p="${i}"></button>`).join(``)}</div>
      <button type="button" class="mc-cancel">Peru (Esc) · <span class="mc-time"></span> s</button>`),
      stage.appendChild(box));
    let open = !1,
      ok = Array(N).fill(!1),
      left = 0,
      iv = null;
    const dev = (i) => devices.list[i] || {},
      label = (i) => {
        let d = dev(i),
          k = d.kb === `wasd` ? `<b>B</b>` : d.kb === `arrows` ? `<b>Enter</b>` : ``,
          p = d.pad >= 0 ? `🎮 <b>Start</b>` : ``;
        return `P${i + 1}: ${[k && `paina ${k}`, p].filter(Boolean).join(` tai `) || `klikkaa`} = hyväksy`;
      },
      render = () => {
        (box.querySelectorAll(`.mc-p`).forEach((b, i) => {
          (b.classList.toggle(`ok`, ok[i]), (b.innerHTML = ok[i] ? `P${i + 1}: hyväksytty ✔` : label(i)));
        }),
          (box.querySelector(`.mc-time`).textContent = Math.ceil(left)));
      },
      close = () => {
        ((open = !1), (box.hidden = !0), clearInterval(iv), (iv = null), document.getElementById(`view`)?.focus());
      },
      request = (who) => {
        if (open) return;
        ((open = !0), (ok = Array(N).fill(!1)), who != null && who < N && (ok[who] = !0), (left = MENU_TIMEOUT), (box.hidden = !1), render());
        if (ok.every(Boolean)) return void (cleanup(), leave());
        iv = setInterval(() => {
          ((left -= 0.25), left <= 0 ? close() : render());
        }, 250);
      },
      accept = (i) => {
        if (i == null || i < 0 || i >= N) return;
        if (!open) return request(i);
        ((ok[i] = !0), render(), ok.every(Boolean) && (cleanup(), leave()));
      },
      kbPlayer = (set) => devices.list.findIndex((d, i) => i < N && d.kb === set),
      onKey = (e) => {
        if (e.repeat) return;
        e.code === `Escape`
          ? (e.preventDefault(), open ? close() : request(null))
          : e.code === `KeyB`
            ? accept(kbPlayer(`wasd`) >= 0 ? kbPlayer(`wasd`) : 0)
            : (e.code === `Enter` || e.code === `NumpadEnter`) && (e.preventDefault(), accept(kbPlayer(`arrows`) >= 0 ? kbPlayer(`arrows`) : N > 1 ? 1 : 0));
      },
      cleanup = () => {
        (clearInterval(iv), window.removeEventListener(`keydown`, onKey, !0), box.remove(), (menuConfirmCleanup = null), delete window.__menuConfirm);
      };
    (back.addEventListener(`click`, (e) => {
      (e.currentTarget.blur(), request(null));
    }),
      box.querySelectorAll(`.mc-p`).forEach((b) =>
        b.addEventListener(`click`, (e) => {
          (e.currentTarget.blur(), accept(Number(b.dataset.p)));
        }),
      ),
      box.querySelector(`.mc-cancel`).addEventListener(`click`, close),
      window.addEventListener(`keydown`, onKey, !0),
      (menuConfirmCleanup = cleanup),
      (window.__menuConfirm = { state: () => ({ open, ok: [...ok], left }), accept, request, close: () => open && close() }));
  }
  let infoIv = null;
  function startStage() {
    menuConfirmCleanup?.();
    clearInterval(window.__lobbyPadIv);
    clearInterval(infoIv);
    let N = playerCount;
    (currentGame?.dispose(),
      (rootEl.innerHTML = `<div class="stage n${N}" data-n="${N}">
    <canvas id="view" tabindex="-1"></canvas>
    <div class="splitbar"></div>
    <div class="splitbar"></div>
    <button class="back" type="button" id="back">Valikko</button>
    <button class="fsbtn" type="button" id="fsbtn" title="Kokoruutu päälle/pois (F9)" aria-label="Kokoruutu">⛶</button>
    ${Array.from({ length: N }, (_, i) => `<div class="vp v${i}" style="--pc:${LOBBY_COLORS[i]}"><div class="hud"></div><div class="note" id="n${i + 1}"></div></div>`).join(``)}
    ${N === 3 ? `<div class="vp info"><h4>Tilanne</h4><ul class="info-list"></ul><canvas class="info-map"></canvas></div>` : ``}
    ${N <= 2 ? touchPadHtml(`a`, 0) + (N === 2 ? touchPadHtml(`b`, 1) : ``) : ``}
  </div>`),
      renderHud());
    let e = document.getElementById(`view`),
      devs = devices.list.slice(0, N).map((d) => ({ kb: d.kb || null, pad: d.pad >= 0 ? d.pad : -1 }));
    ((currentGame = startGame(
      e,
      {
        players: setups.slice(0, N),
        devices: devs,
        p1: p1Setup,
        p2: p2Setup,
        challenge: challengeMode,
      },
      (...a) => {
        ((hudState = a), renderHud());
      },
      (...a) => {
        a.forEach((t, i) => {
          let n = document.getElementById(`n${i + 1}`);
          n && n.textContent !== t && (n.textContent = t);
        });
      },
    )),
      e.focus(),
      document.getElementById(`fsbtn`).addEventListener(`click`, (ev) => {
        (ev.currentTarget.blur(), toggleFullscreen(), e.focus());
      }),
      N === 3 && (infoIv = setInterval(() => {
        if (!rootEl.querySelector(`.vp.info`)) return clearInterval(infoIv);
        try {
          infoPanel();
        } catch (err) {}
      }, 250)),
      setupMenuConfirm(() => {
        (clearInterval(infoIv), currentGame?.dispose(), (currentGame = null), showLobby());
      }, N),
      rootEl.querySelectorAll(`.pad button`).forEach((e) => {
        let t = Number(e.dataset.player),
          n = e.dataset.btn;
        (e.addEventListener(`pointerdown`, (r) => {
          (r.preventDefault(), e.setPointerCapture(r.pointerId), currentGame?.setTouch(t, n, !0));
        }),
          e.addEventListener(`pointerup`, (e) => {
            (e.preventDefault(), currentGame?.setTouch(t, n, !1));
          }),
          e.addEventListener(`pointercancel`, () => currentGame?.setTouch(t, n, !1)));
      }));
  }
  showLobby();
})();
