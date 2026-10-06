# Bronnencontrole (6 oktober 2026)

Doel: de feiten en links in Mantelzorg Navigator nalopen bij de bronnen.

## Hoe is gecontroleerd?

- Per bewering is gezocht op de website van de betreffende organisatie (beperkt tot hun domein). De uitkomst is een samenvatting van de zoekresultaten.
- De pagina's zelf konden **niet worden geopend**: de netwerkomgeving blokkeert deze sites. De diepe links komen uit de zoekresultaten van de bron zelf (zij bestaan dus in de index), maar zijn niet één voor één geopend.
- **Aanbeveling:** laat een mens de links openen en de inhoud naast de app leggen vóór gebruik buiten de studieopdracht.

## Gecontroleerde beweringen

| Bewering in de app | Uitkomst | Bron |
|---|---|---|
| CIZ-besluit binnen ca. 6 weken na een volledige aanvraag | Bevestigd. Bij spoed sneller (volgens de zoekresultaten binnen 2 weken). Onvolledige aanvraag duurt langer. | ciz.nl (aanvraagformulier Wlz) |
| Wmo: gemeente beslist binnen ca. 8 weken | **Aangescherpt.** Onderzoek binnen 6 weken na melding, daarna besluit binnen 2 weken (samen ca. 8 weken). Eén zoekresultaat noemt 6 weken voor alles; de 6+2-lezing sluit aan op de wet. | regelhulp.nl, rijksoverheid.nl |
| Kortdurend zorgverlof "deels doorbetaald" | **Gecorrigeerd** naar: minimaal 70% loon, max. 2x wekelijkse uren per 12 maanden. Langdurend: onbetaald, max. 6x wekelijkse uren. | rijksoverheid.nl, mantelzorg.nl |
| (nieuw) Verlofwet | Kabinetsplan om beide te combineren in 8 weken (eerste 2 betaald, 70%). In consultatie, beoogd 2028. **Nog niet van kracht.** | rijksoverheid.nl (nieuws 29 juni 2026) |
| Volmacht kan alleen zolang je naaste de gevolgen begrijpt | Bevestigd en verfijnd: ook met diagnose kan het nog als je naaste bij ondertekening wilsbekwaam is. De notaris beoordeelt dat. | notaris.nl, dementie.nl |
| Mentorschap (zorg/verblijf) en bewind (geld) via de kantonrechter | Bevestigd. Curatele = beide. Mentorschap kan met bewind, niet met curatele. | notaris.nl, rechtspraak.nl |
| Casemanager dementie: vast aanspreekpunt | Bevestigd. **Toegevoegd:** vergoed uit de basisverzekering; doet geen verzorging. | dementie.nl, alzheimer-nederland.nl, zorginstituutnederland.nl |
| Wlz-vormen: instelling, thuis (vpt/mpt), pgb | Bevestigd. Behandeling kan niet via pgb. | zorginstituutnederland.nl, regelhulp.nl |
| Dagbesteding via Wmo, respijt/logeren | Bevestigd. Eigen bijdrage mogelijk. Respijtzorg via huisarts, wijkverpleegkundige of Wmo-loket. Logeeropvang valt onder de Wmo als er geen Wlz-indicatie is. | dementie.nl, regelhulp.nl, mantelzorg.nl |
| Na overlijden: uitvaartondernemer, notaris, erfenis | Bevestigd. Uitvaartondernemer doet de aangifte; verklaring van erfrecht via notaris; beneficiair aanvaarden of verwerpen via de rechtbank. | notaris.nl, rijksoverheid.nl |
| Palliatieve zorg en wensen | Bevestigd. Palliaweb: wensen vastleggen (proactieve zorgplanning) kan al na de diagnose. | palliaweb.nl, dementie.nl |
| Mantelzorgwaardering per gemeente | Bevestigd. Gemeenten bepalen zelf de voorwaarden en vorm. | mantelzorg.nl, rijksoverheid.nl |

## Niet geverifieerd (blijven "indicatie")

- Wachttijden: geheugenpoli, dagbesteding, verpleeghuisplek (verschilt per regio).
- Doorlooptijden van volmacht (2-6 weken), mentorschap (enkele maanden) en casemanager (2-6 weken).
- Tips zonder bronbewering: huis veiliger maken, noodplan, gesprek met je naaste.
- Doorlooptijden zijn in de app nu als "(indicatie)" gelabeld.

## Diepe links

44 bron-id's in gebruik; 49 in `src/lib/bronnen.ts` (organisaties plus pagina's). Alle id's in taken, kennisbank en demo-scenario's zijn gecontroleerd op bestaan in het register.
