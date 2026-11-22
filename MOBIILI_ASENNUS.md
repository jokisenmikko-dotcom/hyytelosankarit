# Hyytelösankarit – asennus puhelimeen ja tabletille

Pelin voi lisätä kotinäyttöön kuten sovelluksen. Ensimmäisen latauksen jälkeen se toimii myös ilman nettiä.

Peli on suunniteltu **vaakasuuntaan**. Jos puhelin on pystyssä, näkyy kääntövihje.

## Android (Chrome)

1. Avaa pelin osoite Chromessa (https-sivusto tai kotiverkon osoite).
2. Valitse valikko (⋮) → **Lisää aloitusnäyttöön** / **Asenna sovellus**.
3. Hyväksy. Kuvake ilmestyy kotiin; avaa siitä, niin peli tulee kokoruutuun.

## iPhone ja iPad (Safari)

1. Avaa pelin osoite Safarissa (https).
2. Napauta **Jaa** (neliö ja nuoli).
3. Valitse **Lisää Koti-valikkoon**.
4. Anna nimeksi Hyytelösankarit ja lisää. Avaa kuvakkeesta.

Huomaa: iOS sallii kotinäyttösovelluksen luotettavimmin Safarissa, ei välttämättä muissa selaimissa.

## Tietokone

Voit yhä avata `index.html` suoraan (file://) Chromessa, Edgessä tai Bravessa – service workeriä ei tällöin rekisteröidä, ja peli toimii kuten ennen. Ohjaimet ja näppäimistö ovat ennallaan.

## Julkaisu (hosting)

Service worker ja “Lisää aloitusnäyttöön” vaativat yleensä **HTTPS**-osoitteen. Poikkeus: `localhost` (ja `127.0.0.1`) toimii ilman sertifikaattia.

### Vaihtoehto A: kotiverkon Proxmox-kone

Mikon solmussa peli voidaan tarjota staattisena sivustona (esim. Caddy, nginx tai Traefik LXC/VM:ssä).

- HTTP LAN-osoitteella (`http://192.168.…`) riittää kokeiluun selaimessa, mutta **service worker ei yleensä käynnisty** muilla laitteilla ilman HTTPS:ää.
- Käytännössä tarvitaan HTTPS: joko LAN-sertifikaatti (esim. Caddy + sisäverkko / DNS), tai tunneli julkiseen nimeen (esim. kotiverkon reverse proxy).
- Älä avaa peliä pelkällä `file://`-jaolla puhelimesta; jaa se http/https-palvelimelta.

### Vaihtoehto B: ilmainen staattinen host

Helpoin tapa saada HTTPS automaattisesti:

- **GitHub Pages** (repo, jossa `build/` tai sivuston juuri, Settings → Pages).
- **Cloudflare Pages** (samaan tapaan: lataa `build/`-kansio).

Molemmat antavat `https://…`-osoitteen, jonka voi jakaa perheelle.

## Mitä Mikolta tarvitaan (jos julkaistaan)

Tätä paketointia ei ole viety verkkoon. Julkaisua varten tarvitaan yksi seuraavista:

1. **Kotisolmu:** päätös hostinimestä (esim. `hyytelo.koti`), HTTPS-sertin tapa (Caddy/Let’s Encrypt, omalla nimellä, tai vain localhost-kokeilu), ja mihin kansioon `build/` kopioidaan.
2. **Julkinen sivu:** GitHub- tai Cloudflare-tili (tai muu staattinen host) ja lupa luoda sivusto. Ei tarvitse palvelinosaamista.
3. Testilaitteet: yksi Android-puhelin tai tabletti ja/tai iPad, jotta “Lisää kotinäyttöön” voidaan varmistaa oikealla laitteella.

Valmis jaettava kansio on projektin `build/` (sama sisältö kuin zipissä, valmis kopioitavaksi palvelimelle).
