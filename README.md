# Hyytelösankarit

Perheen oma 3D-seikkailupeli: kylä, koti, sirkus, salatila, lentokone ja paljon muuta. Toimii tietokoneella, tabletilla ja puhelimella.

## ▶ Pelaa

**https://jokisenmikko-dotcom.github.io/hyytelosankarit/**

## Asennus puhelimeen ja tabletille

Pelin voi lisätä kotinäyttöön kuten sovelluksen. Ensimmäisen latauksen jälkeen se toimii myös ilman nettiä. Peli on suunniteltu **vaakasuuntaan**.

**Android (Chrome)**
1. Avaa yllä oleva osoite Chromessa.
2. Valitse valikko (⋮) → **Lisää aloitusnäyttöön** / **Asenna sovellus**.
3. Hyväksy. Avaa peli kotinäytön kuvakkeesta, niin se tulee kokoruutuun.

**iPhone ja iPad (Safari)**
1. Avaa yllä oleva osoite Safarissa.
2. Napauta **Jaa** (neliö ja nuoli).
3. Valitse **Lisää Koti-valikkoon** ja anna nimeksi Hyytelösankarit.
4. Avaa peli kuvakkeesta.

**Tietokone:** avaa osoite selaimessa. Näppäimistö ja peliohjaimet toimivat kuten ennenkin.

## Päivitykset

Uusi versio julkaistaan automaattisesti, kun tämän repon `main`-haaraan tuodaan uudet tiedostot. Asennettu peli päivittyy, kun se avataan nettiyhteyden kanssa (sulje ja avaa peli tarvittaessa uudelleen).

Muutokset: [RELEASE_NOTES.md](RELEASE_NOTES.md)

> Tekninen huomio: koko peli on `main`-haarassa yhtenä pakettina `site.tar.gz.b64` (base64-koodattu tar.gz). Julkaisutyönkulku (`.github/workflows/pages.yml`) purkaa paketin ja julkaisee pelin `gh-pages`-haaraan, josta GitHub Pages näyttää sen.
