/**
 * Bronnenregister. Verwijst naar de organisaties waar de betreffende informatie te vinden is.
 * Let op: dit zijn verwijzingen naar de website van de organisatie, geen letterlijke citaten.
 * Controleer details (termijnen, regels) altijd bij de bron zelf.
 */
export interface Bron { id: string; naam: string; url: string; over: string }

const L = (naam: string, url: string, over: string): Bron => ({ id: "", naam, url, over });

/** Datum waarop de bronnen en feiten voor het laatst zijn nagelopen (via zoekresultaten, zie README). */
export const LAATST_GECONTROLEERD = "6 oktober 2026";

const BASIS: Record<string, Bron> = {
  alzheimer: { id: "alzheimer", naam: "Alzheimer Nederland", url: "https://www.alzheimer-nederland.nl", over: "Informatie, advies en lotgenotencontact over dementie" },
  dementie_nl: { id: "dementie_nl", naam: "Dementie.nl", url: "https://www.dementie.nl", over: "Praktische informatie over leven met dementie" },
  zorginstituut: { id: "zorginstituut", naam: "Zorginstituut Nederland", url: "https://www.zorginstituutnederland.nl", over: "Wlz, zorgstandaarden en kwaliteit van zorg" },
  ciz: { id: "ciz", naam: "CIZ", url: "https://www.ciz.nl", over: "Wlz-indicatie aanvragen en beoordelen" },
  rijksoverheid: { id: "rijksoverheid", naam: "Rijksoverheid", url: "https://www.rijksoverheid.nl", over: "Wmo, Wlz, zorgverlof en andere regelgeving" },
  regelhulp: { id: "regelhulp", naam: "Regelhulp", url: "https://www.regelhulp.nl", over: "Hulpmiddelen om zorg en ondersteuning te vinden" },
  mantelzorg: { id: "mantelzorg", naam: "MantelzorgNL", url: "https://www.mantelzorg.nl", over: "Ondersteuning, rechten en tips voor mantelzorgers" },
  notaris: { id: "notaris", naam: "Notaris.nl (KNB)", url: "https://www.notaris.nl", over: "Volmacht, levenstestament, testament en erfrecht" },
  rechtspraak: { id: "rechtspraak", naam: "De Rechtspraak", url: "https://www.rechtspraak.nl", over: "Mentorschap, bewind en curatele via de kantonrechter" },
  zorgkaart: { id: "zorgkaart", naam: "Zorgkaart Nederland", url: "https://www.zorgkaartnederland.nl", over: "Zorgaanbieders zoeken en vergelijken" },
  palliaweb: { id: "palliaweb", naam: "Palliaweb (IKNL)", url: "https://www.palliaweb.nl", over: "Informatie over palliatieve zorg" },
};

const DIEP: Record<string, Bron> = {  // ---- Diepe links (gevonden via zoekresultaten van de bron zelf; zie README voor de status van de controle)
  "ciz-aanvraag": L("CIZ: aanvraag langdurige zorg (Wlz)", "https://www.ciz.nl/aanvraagformulier-wlz", "Hoe je een Wlz-indicatie aanvraagt en hoe lang het duurt"),
  "ciz-folder": L("CIZ: heeft u blijvend zorg nodig?", "https://www.ciz.nl/folder-heeft-u-blijvend-zorg-nodig-over-de-wet-langdurige-zorg-wlz", "Uitleg over de Wlz"),
  "zin-leveringsvormen": L("Zorginstituut: leveringsvormen Wlz", "https://www.zorginstituutnederland.nl/verzekerde-zorg/l/leveringsvormen-instelling-vpt-mpt-en-pgb-wlz", "Verblijf, vpt, mpt en pgb"),
  "zin-casemanagement": L("Zorginstituut: casemanagement dementie", "https://www.zorginstituutnederland.nl/actueel/nieuws/2024/04/23/casemanagement-dementie", "Casemanagement dementie in de basisverzekering"),
  "zin-zorgstandaard": L("Zorginstituut: Zorgstandaard Dementie", "https://www.zorginstituutnederland.nl/actueel/nieuws/2020/04/22/herziene-zorgstandaard-dementie", "Hoe goede dementiezorg eruit hoort te zien"),
  "ro-wlz-thuis": L("Rijksoverheid: Wlz-zorg thuis", "https://www.rijksoverheid.nl/onderwerpen/verpleeghuizen-en-zorginstellingen/vraag-en-antwoord/zorg-thuis-krijgen-via-wet-langdurige-zorg", "Wlz-zorg thuis krijgen"),
  "rh-vpt": L("Regelhulp: volledig pakket thuis", "https://www.regelhulp.nl/onderwerpen/wetten-regels/wlz/volledig-pakket-thuis", "Wlz-zorg thuis met één aanbieder"),
  "rh-wmo-aanmelding": L("Regelhulp: Wmo-ondersteuning aanvragen", "https://www.regelhulp.nl/onderwerpen/wetten-regels/wmo/aanmelding", "Melding, onderzoek en besluit bij de gemeente"),
  "ro-wmo-aanvragen": L("Rijksoverheid: ondersteuning vanuit de Wmo", "https://www.rijksoverheid.nl/onderwerpen/zorg-en-ondersteuning-thuis/vraag-en-antwoord/ondersteuning-gemeente-wmo-2015-aanvragen", "Hoe krijg je ondersteuning van de gemeente"),
  "dem-wmo": L("Dementie.nl: Wmo en zorg thuis", "https://www.dementie.nl/zorg-en-regelzaken/wet-en-regelgeving/wet-maatschappelijke-ondersteuning-wmo-voor-zorg-thuis-met-dementie", "Wmo aanvragen bij dementie"),
  "dem-dagbesteding": L("Dementie.nl: dagbesteding", "https://www.dementie.nl/zorg-en-regelzaken/zorg-en-hulp-voor-thuis/dagbesteding-voor-je-naaste-met-dementie", "Waarom en hoe dagbesteding"),
  "rh-dagbesteding": L("Regelhulp: dagbesteding", "https://www.regelhulp.nl/onderwerpen/welke-soort/opvang-en-tijdelijk-verblijf/dagbesteding", "Dagbesteding voor volwassenen"),
  "rh-logeren": L("Regelhulp: logeeropvang", "https://www.regelhulp.nl/onderwerpen/opvang-en-tijdelijk-verblijf/logeren", "Tijdelijk logeren als respijtzorg"),
  "mz-respijt": L("MantelzorgNL: vervangende zorg en respijtzorg", "https://www.mantelzorg.nl/onderwerpen/professionals/vervangende-zorg-of-respijtzorg", "Even vrij van mantelzorg"),
  "rh-dementie": L("Regelhulp: dementie", "https://www.regelhulp.nl/onderwerpen/mijn-situatie/ouderen/dementie", "Overzicht hulp en zorg bij dementie"),
  "ro-zorgverlof-salaris": L("Rijksoverheid: zorgverlof en salaris", "https://www.rijksoverheid.nl/vraag-en-antwoord/zorgverlof/zorgverlof-en-salaris", "Wat zorgverlof betekent voor je loon"),
  "ro-zorgverlof-duur": L("Rijksoverheid: duur van zorgverlof", "https://www.rijksoverheid.nl/onderwerpen/zorgverlof/vraag-en-antwoord/duur-zorgverlof", "Hoe lang je zorgverlof kunt opnemen"),
  "mz-verlof": L("MantelzorgNL: verlofregelingen", "https://www.mantelzorg.nl/onderwerpen/werken/verlofregelingen-voor-mantelzorgers", "Verlofregelingen voor mantelzorgers"),
  "ro-verlofwet-2026": L("Rijksoverheid: nieuwe Verlofwet (voorstel)", "https://www.rijksoverheid.nl/actueel/nieuws/2026/06/29/het-kabinet-komt-met-overzichtelijkere-regels-in-verlofwet", "Plannen om zorgverlof samen te voegen (nog niet van kracht)"),
  "an-vertegenwoordiging": L("Alzheimer Nederland: vertegenwoordiging bij dementie", "https://www.alzheimer-nederland.nl/dementie/wat-moet-ik-regelen/vertegenwoordiging-bij-dementie", "Volmacht, mentorschap en bewind bij dementie"),
  "dem-levenstestament": L("Dementie.nl: levenstestament", "https://www.dementie.nl/zorg-en-regelzaken/geldzaken-regelen/dementie-en-je-levenstestament", "Het belang van een levenstestament"),
  "not-levenstestament": L("Notaris.nl: levenstestament en volmacht", "https://www.notaris.nl/levenstestament/levenstestament-en-volmacht", "Stappenplan levenstestament"),
  "not-bewind": L("Notaris.nl: bewind, curatele en mentorschap", "https://www.notaris.nl/levenstestament/bewind-curatele-en-mentorschap", "Verschil tussen de maatregelen"),
  "rs-mentorschap": L("De Rechtspraak: mentorschap", "https://www.rechtspraak.nl/onderwerpen/mentorschap", "Mentorschap en mentor"),
  "dem-checklist": L("Dementie.nl: checklist wat moet je regelen", "https://www.dementie.nl/zorg-en-regelzaken/algemene-regelzaken/checklist-wat-moet-ik-regelen-bij-dementie", "Checklist regelzaken bij dementie"),
  "dem-huisarts": L("Dementie.nl: diagnose door de huisarts", "https://www.dementie.nl/dementie-en-diagnose/diagnose/diagnose-dementie-door-huisarts", "Hoe de huisarts onderzoekt en doorverwijst"),
  "dem-nietpluis": L("Dementie.nl: niet pluis", "https://www.dementie.nl/journey-fase/niet-pluis", "Als je merkt dat er iets niet klopt"),
  "an-diagnose": L("Alzheimer Nederland: de diagnose dementie", "https://www.alzheimer-nederland.nl/dementie/diagnose", "Hoe de diagnose wordt gesteld"),
  "an-geheugenverlies": L("Alzheimer Nederland: geheugenverlies en dementie", "https://www.alzheimer-nederland.nl/dementie/herkennen-symptomen/geheugenverlies-en-dementie", "Symptomen herkennen"),
  "dem-casemanager": L("Dementie.nl: casemanager dementie", "https://www.dementie.nl/zorg-en-regelzaken/zorg-en-hulp-voor-thuis/casemanager-dementie", "Wat een casemanager doet"),
  "mz-waardering": L("MantelzorgNL: mantelzorgwaardering", "https://www.mantelzorg.nl/onderwerpen/geldzaken/mantelzorgwaardering", "Waardering vanuit de gemeente"),
  "rh-mantelzorgondersteuning": L("Regelhulp: mantelzorgondersteuning", "https://www.regelhulp.nl/mantelzorgers/ondersteuning-en-advies/mantelzorgondersteuning", "Ondersteuning en advies voor mantelzorgers"),
  "pw-dementie": L("Palliaweb: richtlijn palliatieve zorg bij dementie", "https://palliaweb.nl/richtlijnen-palliatieve-zorg/richtlijn/dementie", "Palliatieve zorg bij dementie"),
  "dem-wensen": L("Dementie.nl: wensen vastleggen na de diagnose", "https://www.dementie.nl/zorg-en-regelzaken/algemene-regelzaken/je-wensen-vastleggen-na-de-diagnose-dementie", "Wensen en behandelwensen vastleggen"),
  "not-overlijden": L("Notaris.nl: regelen na een overlijden", "https://www.notaris.nl/bij-overlijden/regelen-na-een-overlijden", "Wat je na een overlijden regelt"),
  "not-erfrecht": L("Notaris.nl: verklaring van erfrecht", "https://www.notaris.nl/bij-overlijden/verklaring-van-erfrecht", "Wanneer je een verklaring van erfrecht nodig hebt"),
  "ro-checklist-overlijden": L("Rijksoverheid: checklist bij overlijden", "https://www.rijksoverheid.nl/onderwerpen/erven/vraag-en-antwoord/checklist-bij-overlijden", "Overlijden: wat moet ik regelen?"),
  "ro-erven": L("Rijksoverheid: wat moet ik doen bij een erfenis", "https://www.rijksoverheid.nl/onderwerpen/erven/vraag-en-antwoord/wat-moet-ik-doen-als-ik-een-erfenis-krijg", "Erfenis aanvaarden of verwerpen"),
};

/** Alle bronnen: organisaties (hoofdsite) en diepe links naar specifieke pagina's. */
export const BRONNEN: Record<string, Bron> = Object.fromEntries(
  Object.entries({ ...BASIS, ...DIEP }).map(([id, b]) => [id, { ...b, id }]),
);

/** Filtert onbekende id's weg (belangrijk voor modeloutput) en geeft de volledige bronnen terug. */
export const bronnenVoor = (ids?: string[]): Bron[] =>
  (ids ?? []).filter((id, i, a) => BRONNEN[id] && a.indexOf(id) === i).map((id) => BRONNEN[id]);
