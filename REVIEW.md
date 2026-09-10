# Revisió de FILE TOO BIG V2

## Actualització: material nou i retorn de les animacions

Aquesta secció descriu l'estat actual; la revisió inicial que segueix queda
com a registre de les decisions anteriors.

- Quatre capítols: barca, arquitectura, motos i corredor. Text superposat,
  entrades de títol per línies i transicions en forma d'ona a desktop i mòbil.
  Els dos vídeos es mantenen en moviment durant el breu solapament; la resta
  es pausa. El fons sortint es manté opac per evitar enfosquiments entre plans.
- En mòbil vertical, la finestra d'imatge és de proporció aproximada 4:5 dins
  l'escenari, amb text sobreposat. Això limita l'ampliació dels originals
  horitzontals de 1080p. No s'ha fabricat resolució mitjançant escalat.
- Sense ENGAGE, View film ni controls visibles de reproducció. Es mantenen
  només la navegació de capítols, els idiomes i el visor de fotografies.
- Loader sense temps mínim artificial. El percentatge correspon a recursos
  crítics preparats (fonts, poster i primer fotograma), no a bytes descarregats.
  Si són a la memòria cau no apareix; si triguen massa, es retira als 2,4 segons
  sense inventar un 100%. No espera les altres seccions.
- Galeria de vuit imatges al final, abans del contacte: costa, dues barques,
  geometria zenital, casa, barca en moviment, camí amb moto, torre obliqua i
  sunset. Composició asimètrica i formats originals, inclosa la foto vertical.
  No hi ha duplicats dins de la galeria ni localitzacions visibles.
- S'ha seleccionat **calella2.JPG**: millor lectura conjunta de costa i
  arquitectura. **calella1.JPG** no s'hi afegeix perquè repeteix el tema amb
  una composició menys clara. **far.JPG** queda fora pel primer terme massa
  fosc i un subjecte poc destacat. **barquitos.JPG** aporta un zenital vertical
  net i una composició molt diferent de la barca en moviment.
- Del nou **Marc Running - Trim.mp4** s'utilitzen els segons **5,40–8,65**:
  3,25 segons de seguiment continu corrent. Es descarten els canvis bruscos
  anteriors. S'elimina la franja de 8 píxels inferior, es conserva 1920×1080
  i la cadència original, amb una correcció suau de gamma (1,12) i H.264 CRF 19.
  El poster surt del segon 5,95 del material rebut, corrent, no fent una foto.
  No s'han generat persones, paisatges ni detalls artificials.
- Quatre vídeos i totes les variants d'imatge sumen 33,96 MB; no es carreguen
  junts a l'entrada. El nou tall de corredor pesa 2,23 MB.
- Deu proves automàtiques passen: idiomes, absència de controls, càrrega
  inicial, preferències de moviment/dades, menú mòbil, visor, transicions,
  loader i respostes del Worker. S'han exercitat amplades de 390, 768, 1366 i
  1920 en DOM simulat. No equivalen a Safari/Android reals.
- Continua pendent el QA visual real del navegador: la política de la
  previsualització d'aquesta sessió el va bloquejar. S'han inspeccionat els
  fitxers d'imatge i els fotogrames, però no es declara feta una passada visual
  de la web renderitzada. V1 i infraestructura externa continuen intactes.

## Registre de la primera V2

La V2 és independent. S'ha treballat sobre una còpia de la versió publicada
més recent, mantenint intactes el projecte i la publicació originals.

**Límit important:** la carpeta completa de Windows no estava accessible en
aquesta sessió. La selecció s'ha fet amb els cinc muntatges i els setze
fotogrames del projecte, les còpies de més qualitat recuperades de Git i els
adjunts disponibles. No és una revisió de tots els originals del dron.

## Selecció final

| Peça | Decisió | Durada / qualitat | Motiu |
| --- | --- | --- | --- |
| Barca | Mantinguda com a hero; retallada | 11,8 s, 1920 × 1080, 9,45 MB | Moviment llegible, blau profund, subjecte clar; s'escurça l'entrada |
| Motos | Recuperat el muntatge de més qualitat | 7,8 s, 1920 × 1080, 9,38 MB | Dos talls de 4 i 3,8 s amb recorreguts diferents |
| Casa entre arbres | Separada del muntatge d'arquitectura | 5,4 s, 1920 × 1080, 6,80 MB | Aproximació i llum càlida, amb una lectura clara de l'edifici i l'entorn |
| Geometria | Mantingut el fotograma zenital | Fins a 1600 × 900 | Aporta un angle diferent dels vídeos |
| Última llum | Mantingut el fotograma del sunset | Fins a 1600 × 900 | Millor pausa visual que el vídeo de camp fosc |

Són tres presentacions de vídeo, amb quatre plans en total, i dos fotogrames.
No s'ha intentat arribar a sis vídeos artificialment.

## Material retirat o no seleccionat

- El pla de Marc i els dos fotogrames associats: els nou segons accessibles
  inclouen el mòbil i gestos cap a càmera. S'han inspeccionat fotogrames entre
  els segons 8,1 i 16,3 del muntatge. No s'ha trobat una alternativa prou neta
  per presentar-la com el pla natural, sense mòbil, que s'havia demanat.
  Cal tornar al vídeo original, especialment a altres segons no disponibles.
- El vídeo del jardí emmurallat: gespa dominant, subjecte petit i composició
  menys clara que les motos seleccionades.
- El vídeo del camp al vespre: massa semblant als fotogrames de camp i menys
  contundent que la imatge del sunset.
- El vídeo de la torre: s'ha prioritzat l'aproximació a la casa i s'ha mantingut
  només la vista zenital de la torre per evitar repetir la mateixa funció visual.
- Tres parelles de duplicats exactes: estate / boat-horizon,
  field / islands i moto-garden / lighthouse. També s'ha retirat wake, molt
  semblant als altres camps.
- Els fotogrames de ciutat amb llum plana, les vistes redundants de la torre
  i els fotogrames que repetien directament els vídeos seleccionats.

El fotograma disponible del dia del jardí/BBQ s'ha revisat, però no s'ha afegit
per substituir un duplicat a qualsevol preu. S'ha eliminat el buit de contingut
corresponent. No s'han esborrat originals: V1 i l'historial es conserven.

## Calella

**No s'ha utilitzat material nou identificat com a Calella de Palafrugell.**
No s'ha pogut localitzar de manera verificable en els recursos accessibles.
No s'han rebatejat altres imatges de costa com si fossin de Calella.
L'historial també contenia material costaner retirat expressament en una
revisió anterior; no s'ha recuperat com a material publicable sense aclarir-ne
el context. Per completar aquest punt cal accés als originals.

## Què s'ha recuperat

Les versions de barca, motos i arquitectura en 1080p de l'historial de Git.
La versió publicada les havia reduït a 720p, i triava fitxers de 640 × 360 per
a mòbil. No són masters 4K: aquesta limitació s'ha mantingut explícita.

## Disseny i contingut

- Es conserva la identitat de blau fosc, to clar, verd suau, DM Sans i Playfair.
- Tres capítols amb transicions de dissolució vinculades a l'scroll en pantalles
  amples. S'escurça el recorregut de 7,5 a 3,4 alçades de pantalla.
- En mòbil i tablet vertical, composició normal amb el pla complet a 16:9 i el
  text fora de la imatge. No s'amplia un vídeo horitzontal per omplir una pantalla
  vertical, ni es força el visitant a recórrer un llarg scroll fix.
- Dues imatges amb proporció original, una galeria ampliable i un visor de
  vídeos sense les lletres del hero.
- Serveis amb un propòsit concret, bio breu i contacte directe.
- Anglès a l'entrada; català i castellà en rutes pròpies. S'han revisat també
  alt texts, labels, errors de càrrega, modal, SEO i botons.
- La frase catalana és exactament: Fem que el teu lloc *parli.*
- S'han eliminat les localitzacions públiques, els noms de lloc dels assets
  publicats i les afirmacions que no es podien justificar.
- No hi ha clients, testimonis, permisos, titulacions o experiència inventats.

## Compressió, càrrega i mòbil

H.264, píxels 4:2:0, 30 fps, MP4 fast-start i sense pista d'àudio. Les motos
s'han remultiplexat sense recodificar: estalviar menys d'1 MB no justificava
la pèrdua addicional de detall. La barca usa CRF 22 i arquitectura CRF 20.

La comparació SSIM contra els encodes recuperats és 0,9917 per a barca,
1,0000 per a motos i 0,9885 per a arquitectura. És una mesura de similitud,
**no una certificació de qualitat dels originals**. S'han inspeccionat també
fotogrames a mida gran, especialment l'aigua i la vegetació.

Els tres vídeos sumen aproximadament 25,62 MB. El conjunt de variants
d'imatges i vídeos publicats suma 28,28 MB; això **no** és el pes de càrrega
inicial. Només el hero comença a reproduir-se, i els altres es preparen en
apropar-s'hi. Es pausa el contingut fora de pantalla i en pestanyes amagades.
El visor atura els vídeos del fons.

Mòbil rep el mateix 1080p real. La selecció està preparada per a 1440p i 4K
quan hi hagi originals que els justifiquin. No s'han generat falsos 4K per
ampliació. Per a aquests loops curts no s'ha afegit HLS ni un servei de vídeo.

Fonts WOFF2 locals, imatges WebP responsives, dimensions explícites, posters
escollits manualment, càrrega diferida i noms d'assets amb hash. Sense embeds
d'Instagram, fonts remotes, analítica ni una pantalla de càrrega artificial.
Reduced-motion i estalvi de dades eviten l'autoplay; la reproducció manual
continua disponible.

## Benchmark

S'han consultat les pàgines professionals de
[2RAW](https://www.2rawaerials.com/),
[Flying Pictures](https://www.flyingpictures.com/) i
[Flying Camera Company](https://www.flyingcameracompany.com/).

La conclusió aplicada és donar prioritat al treball visible, explicar
ràpidament què es pot contractar i posar el contacte a mà. També s'ha fet
visible l'autoria real. No s'han copiat les seves identitats, l'equipament
de produccions grans, els crèdits, els logos de clients o les credencials.
L'anàlisi ha estat de contingut i estructura pública; no s'han mesurat les
seves prestacions en dispositius reals.

## Validació i límits pendents

Comprovacions de codi i DOM: tres idiomes, totes les claus de traducció,
English inicial malgrat la preferència antiga de V1, cursiva catalana, enllaços
interns, fonts i assets, metadades, galeria, canvi d'idioma amb el visor obert,
controls de vídeo, pausa manual, mode mòbil, reduced-motion i data saver.

El Worker supera les proves de GET, HEAD, ranges 206, ETag 304, rang invàlid
416, CORS i restricció als fitxers seleccionats, amb un bucket simulat.
Wrangler ha compilat la configuració amb èxit en mode dry-run.

**No s'ha pogut completar el QA visual de la web en navegador.** La política
del navegador d'aquesta sessió ha bloquejat la previsualització. No s'ha
intentat esquivar-la. Les proves de DOM no reprodueixen el renderitzat, la
descodificació, els gestos ni les restriccions reals d'iPhone/Safari o
Android/Chrome. No hi ha mesures reals de LCP/CLS ni una passada visual
completa de la web desplegada.

GitHub, el compte de Cloudflare i el bucket indicat tampoc no estaven
connectats. La configuració està preparada, però falta desplegar-la en
aquell compte i validar els headers i la reproducció al servidor real.
La V2 de comparació utilitza una publicació independent de Sites.

## Què gravaria després

1. Marc corrent 6–8 segons sense mòbil, amb la mirada endavant i un seguiment
   lateral estable; una segona presa a contrallum, amb silueta separada del fons.
2. Un reveal de costa i arquitectura: començar amb un primer terme i descobrir
   gradualment l'escena, mantenint el mateix ritme i sense corregir el yaw a mig pla.
3. Una aproximació a un edifici on la façana sigui protagonista, seguida d'un
   desplaçament lateral curt. Deixar dos segons de marge net a cada extrem.
4. Una experiència de lleure preparada amb intenció: un subjecte clar, una acció
   simple i llum lateral, evitant grans extensions de gespa sense interès.

Abans d'afegir material nou, el primer pas és recuperar i revisar els originals
de Calella i la resta de la carpeta. Una peça superior hauria de substituir
la més feble, no fer créixer la galeria per inèrcia.
