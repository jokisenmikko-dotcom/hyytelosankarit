# Hyytelösankarit – julkaisutiedot

Tässä tiedostossa näkyvät nykyinen versio ja kaksi edellistä. Jokaisessa versiossa järjestys on: Lisäykset, Muutokset, Korjaukset.

## Versio 3.5

### Lisäykset
- Peliin voi koskea sormella: vasemmalla virtuaaliohjain, oikealla isot napit (Hyppy, Käytä, Lompakko, Kartta/teleportti, Kamera, Valikko). Kameran suuntaa käännetään pyyhkäisemällä.
- Aula ja valikot on suunniteltu isoille sormikohteille. Puhelimessa peli alkaa yhdellä pelaajalla; tabletissa (vaaka) voi pelata kahta pelaajaa, kummallakin oma kosketuspuoli. Peliohjaimet toimivat yhä.
- Uusi grafiikkataso **Mobiili** valitaan automaattisesti kosketuslaitteilla: matala kuvapistetiheys, ei varjoja, lyhyempi näköetäisyys, ei otsalampun valoa.
- Vaakasuunnan vihje ja kokoruutupainike (aulassa ja pelissä).
- Asennettava kotinäyttöön (PWA): suomenkielinen nimi, kuvakkeet, toimii ilman nettiä ensimmäisen latauksen jälkeen. Ohje: MOBIILI_ASENNUS.md.

### Muutokset
- Tietokoneen näppäimistö- ja ohjainkäyttö säilyy ennallaan. Kosketusnäytöt näkyvät vain sormilaitteilla.
- Julkaisutiedot näyttävät nyt versiot 3.5, 3.4 ja 3.3.

### Korjaukset
- Service worker rekisteröidään vain http- ja https-osoitteissa, joten peli avautuu edelleen tietokoneella suoraan index.html-tiedostosta (file://).

## Versio 3.4

### Lisäykset
- Ruoanlaiton reseptilistassa näet edistymisen: rivi täyttyy vihreäksi sitä mukaa kun aineksia on koossa, ja on kokonaan vihreä kun ruoka on valmis laitettavaksi.
- Jääkaapissa on valmiina kaikki tavalliset mausteet (suola, pippuri, paprika, curry, kaneli, valkosipuli, basilika, oregano, tilli, chili, inkivääri, timjami, meirami, vanilja ja muskotti). Niitä voi käyttää kokatessa.
- Kun ruoka valmistuu, se ilmestyy automaattisesti ruokapöytään. Voit istua tuolille ja syödä: lautanen tyhjenee ja tulee pieni onnenbonus.
- Jokaisella hahmolla on oma lompakko ja siihen oma nappi (pelaaja 1: B, pelaaja 2: −, ohjain: View / Create). Aulakortti näyttää kartoituksen.
- Lompakon mekaniikat: avaamalla näet setelit, kolikot, kirjastokortin, perhekuvan, kuitit ja tarrat; voit maksaa kojuilla, sirkus- ja lentolipun; lahjoittaa kolikon kaverille; säästää kotona possuun, joka kasvaa pientä korkoa; löytää kadonneita kolikoita maailmalta; pudottaa lompakon ja löytää tai palauttaa sen. Yhteistyötilassa uudet kolikot noudattavat session rahakattoa (24 / pelaaja).
- Maan alla voi kaivaa lapiolla merkityn tunnelin naapurin taloon. Reitti on merkitty hehkuvin merkein, köydellä, nuolilla ja edistymispalkilla, jotta kukaan ei eksy. Molemmat naapurit voivat kaivaa omalta puoleltaan, jolloin tunneli valmistuu nopeammin. Valmis tunneli on leveä, ja sitä kuljetaan first person -kameralla kuten muutakin maanalaista. Tikkaat vievät naapurin autotalliin.
- Teleporttiase avaa kartan, josta valitaan kohde hiirellä, kosketuksella tai ohjaimen kursorilla. Pelin pitää hyväksyä paikka: sen on oltava kartalla ja käveltävissä (ei seinän sisällä).

### Muutokset
- Lentokenttä on siirretty kylän lähelle (noin x=−88, z=−92), jotta sinne pääsee jalan tai autolla.
- Lentokone näyttää enemmän oikealta koneelta: runko ikkunoineen, viistot siivet, pyrstö ja sivuvakaajat, moottorit, laskutelineet, ohjaamon lasit ja yksinkertainen maalaus.
- Autotallin salaluukun vipu on sivuseinällä, ei luukun kohdalla, jotta siihen ei osu vahingossa.
- Tästä versiosta alkaen jokaisen päivityksen mukana tulee nämä suomenkieliset julkaisutiedot (aula ja RELEASE_NOTES.md).

### Korjaukset
- Seinien läpi ei enää pidä päästä kävelemään (talo, autotalli, sirkus ja muut rakennukset). Myös reitti salaluukusta maan alle on korjattu.
- Maanalaiset käytävät ja köysisilta ovat leveämpiä, jotta kukaan ei jää jumiin.
- Sirkuksesta poistuttaessa ilmestytään aivan teltan oven eteen, ei kauas sivuun.
- Konsolivirhe `wrapToMoon is not defined` aseissa on poistettu.

## Versio 3.3

### Lisäykset
- Yhteinen lentokone ja matkakohteet: Kiina (muuri, pagodi ja panda), Egypti, Japani, Yhdysvallat ja Ruotsi. Koneella pääsee myös takaisin kotiin.
- Päivän ja yön kierto (noin 6 minuuttia). Yöllä on tähtitaivas ja jokaisella otsalamppu, jotta pimeässäkin näkee leikkiä.
- Automaattinen first person -kamera kodin sisällä, autotallissa ja maan alla, jotta kuva ei jää talon ulkopuolelle.
- F3 avaa pienen suorituskykynäytön (FPS ja piirtotiedot).

### Muutokset
- Grafiikka kevennettiin: kaukaiset sisätilat ja valot piilotetaan, kun kukaan ei ole paikalla. Kuvapistetiheyttä rajattiin, jotta peli kulkee sujuvammin myös useammalla pelaajalla.
- Sirkukseen tuli viirit, valoketju, lisää penkkejä, herkkukoju, julisteet ja ystävälliset koriste-eläimet.
- Maanalaisen jokaiseen kammioon tuli tutkittavaa (laatikot, kirjahylly, arkku, kartta, vipupalapeli ja kätkö).
- Sohvalta noustaan sivulle, ja TV:n luota pääsee kävelemään ulos.

### Korjaukset
- Sirkuksen sisätila ei enää kaatunut puuttuvien valotyyppien takia.
- Eväiden ostoväli ei enää estänyt herkun ostamista heti sisään tullessa.
- Maanalaisen valot eivät jää päälle, kun tila on tyhjä.
