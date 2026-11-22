# Hyytelösankarit – yhteenveto

## 2.3
- Palikkamaa: world-bound 210 + palikka-poikkeus; padit siirretty sisään (hakku, uusi kaivos)
- Autohyppyri: leveämpi laukaisuikkuna, `_rampJump` + etäisyys launch-pisteestä
- Lammasase: lipas 20, pop osuessa / ~30 m, korkeampi pomppu
- Kuu: laser ei kuole abs>164; ammukset ilman fogia + y-offset kuussa
- Nälkä: oletus 20 min, liuku 5–40
- Lentoauto: ei passiivista vaimenemista lennossa; kiihdytys flyCap≈1.85×top
- Ohjaus: `_gear` vain throttle-syötteestä (f>0 eteen, f<0 peruutus); realistinen reverse
- Aseet max 12 aulassa
- TV: `p.tvChannel` pelaajakohtainen; ei globaalia KeyC; banneri CH n/4; kanava 4 Kuutiojuoksu

## Ohjaus 2.3 (valinta)
Realistinen peruutus säilytetty (lapset oppivat oikean auton tavan), mutta **vaihde lukitaan kaasun/peruutuksen näppäimestä**, ei `speed`-merkin hystereesistä. Näin ohjaus ei “flippaa” kun nopeus värähtelee nollan lähellä.

## 2.2
- Mausteet 90 s; enterLock=0; Palikkamaa 8×; lammasase 3; Pomppupallo; steerSign+PS5; hevosenkengät; nimet; köysiteline
