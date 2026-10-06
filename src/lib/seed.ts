import type { Answers, Fase, Task, Urgentie, Zone } from "./types";
import { bepaalFase, has } from "./intake";

/**
 * TAKENBIBLIOTHEEK
 * Elke taak hoort bij een fase. De zone (Nu/Binnenkort/Later) hangt af van de afstand tot de huidige fase:
 *  - eigen fase:            "kern" -> Nu, anders Binnenkort
 *  - volgende fase:         "vroeg" (lange doorlooptijd) -> Binnenkort, anders Later
 *  - twee fases vooruit:    alleen "vroeg" -> Later
 *  - eerdere fase:          alleen "blijvend" (blijft altijd relevant)
 * `klaarAls` slaat een taak over als de intake laat zien dat het al geregeld is.
 */
interface Template {
  id: string; fase: Fase; titel: string; uitleg: string; waarom: string; doorlooptijd: string;
  urgentie: Urgentie; kern?: boolean; vroeg?: boolean; blijvend?: boolean;
  klaarAls?: (a: Answers) => boolean;
}

const LIB: Template[] = [
  // ---- Fase 1: Eerste signalen
  { id: "huisarts-afspraak", fase: 1, titel: "Afspraak maken bij de huisarts", uitleg: "Plan een gesprek over het geheugen en vraag om een verwijzing als dat nodig is. Ga het liefst samen.", waarom: "Hoe eerder je weet wat er speelt, hoe meer opties je hebt.", doorlooptijd: "1-2 weken", urgentie: "hoog", kern: true, klaarAls: (a) => !has(a, "gezien", "niemand") },
  { id: "signalen-noteren", fase: 1, titel: "Voorbeelden van vergeetachtigheid noteren", uitleg: "Schrijf op wat je ziet: wat, wanneer en hoe vaak. Dat helpt de huisarts enorm.", waarom: "Een arts heeft maar een paar minuten. Concrete voorbeelden maken dat gesprek sterker.", doorlooptijd: "1 week", urgentie: "midden", kern: true, klaarAls: (a) => !has(a, "diagnose", "geen") },
  { id: "gesprek-naaste", fase: 1, titel: "Voorzichtig het gesprek aangaan met je naaste", uitleg: "Zoek een rustig moment en begin vanuit zorg, niet vanuit kritiek.", waarom: "Je naaste moet zich gehoord voelen, anders loopt het gesprek met de huisarts vast.", doorlooptijd: "Zodra het kan", urgentie: "midden", kern: true, klaarAls: (a) => !has(a, "diagnose", "geen") },
  // ---- Fase 2: Diagnose en onderzoek
  { id: "geheugenpoli", fase: 2, titel: "Onderzoek bij de geheugenpoli plannen", uitleg: "De huisarts kan je doorverwijzen. Daar volgt onderzoek naar de oorzaak van de klachten.", waarom: "Een diagnose is vaak nodig om hulp te kunnen aanvragen.", doorlooptijd: "enkele weken tot maanden wachttijd", urgentie: "hoog", kern: true, klaarAls: (a) => has(a, "gezien", "geheugenpoli") },
  { id: "dossier-medicatie", fase: 2, titel: "Medicatieoverzicht en medische gegevens verzamelen", uitleg: "Vraag bij de apotheek een actueel medicatieoverzicht en bewaar uitslagen bij elkaar.", waarom: "Bij elke afspraak vragen ze hiernaar. Eén map scheelt veel zoeken.", doorlooptijd: "1 week", urgentie: "midden", kern: true },
  { id: "uitslag-bespreken", fase: 2, titel: "De uitslag samen goed bespreken", uitleg: "Maak een afspraak voor de uitslag. Neem een tweede persoon mee en schrijf vragen op.", waarom: "In een emotioneel gesprek onthoud je weinig. Een meeluisteraar helpt.", doorlooptijd: "Op de dag zelf", urgentie: "midden", kern: true, klaarAls: (a) => has(a, "diagnose", "ja") },
  { id: "casemanager-aanvragen", fase: 2, titel: "Een casemanager dementie aanvragen", uitleg: "Een casemanager is het vaste aanspreekpunt voor advies, regie en doorverwijzing. Dit wordt vergoed uit de basisverzekering. De casemanager verleent zelf geen verzorging.", waarom: "Eén vast gezicht voorkomt dat je zelf alle instanties moet aflopen.", doorlooptijd: "2-6 weken", urgentie: "hoog", kern: true, vroeg: true, klaarAls: (a) => has(a, "hulp", "casemanager") },
  { id: "alzheimer-info", fase: 2, titel: "Betrouwbare informatie lezen (bijv. Alzheimer Nederland)", uitleg: "Lees over de ziekte en bekijk de mantelzorgondersteuning in jouw regio.", waarom: "Weten wat je kunt verwachten geeft rust.", doorlooptijd: "Op je eigen tempo", urgentie: "laag", blijvend: false },
  // ---- Fase 3: Thuis ondersteunen
  { id: "volmacht", fase: 3, titel: "Volmacht regelen (bij de notaris)", uitleg: "Met een volmacht mag jij bank- en andere zaken regelen als je naaste dat zelf niet meer kan.", waarom: "Een volmacht kan alleen als je naaste bij het ondertekenen de gevolgen nog begrijpt. Een diagnose betekent niet automatisch dat het niet meer kan: de notaris beoordeelt dat. Later blijft alleen een maatregel via de kantonrechter over.", doorlooptijd: "2-6 weken", urgentie: "hoog", kern: true, klaarAls: (a) => has(a, "juridisch", "volmacht") },
  { id: "mentorschap", fase: 3, titel: "Mentorschap onderzoeken", uitleg: "Een mentor beslist mee over zorg en verblijf als je naaste dat zelf niet meer kan. Dit loopt via de kantonrechter.", waarom: "Goed om nu te bespreken, ook al is het misschien nog niet nodig.", doorlooptijd: "enkele maanden", urgentie: "midden", vroeg: true, klaarAls: (a) => has(a, "juridisch", "mentorschap") },
  { id: "dagbesteding", fase: 3, titel: "Dagbesteding aanvragen", uitleg: "Een of meer dagdelen per week naar een plek met begeleiding. Aanvragen kan via het Wmo-loket van de gemeente.", waarom: "Dit geeft je naaste structuur en jou rustmomenten. Er kan een wachttijd zijn.", doorlooptijd: "enkele weken tot maanden", urgentie: "hoog", kern: true, klaarAls: (a) => has(a, "hulp", "dagbesteding") },
  { id: "respijtzorg", fase: 3, titel: "Respijtzorg bekijken", uitleg: "Respijtzorg neemt de zorg tijdelijk over, bijvoorbeeld een logeerplek of een vrijwilliger aan huis, zodat jij kunt bijkomen. Je vraagt het aan via de huisarts, de wijkverpleegkundige of het Wmo-loket.", waarom: "Wie lang zorgt zonder pauze, raakt overbelast. Het is beter om dit vóór een crisis te regelen.", doorlooptijd: "2-8 weken", urgentie: "midden" },
  { id: "wmo-aanvraag", fase: 3, titel: "Wmo-hulp aanvragen of herzien", uitleg: "Via het Wmo-loket van je gemeente vraag je hulp aan, zoals huishoudelijke hulp of aanpassingen in huis.", waarom: "De gemeente moet binnen 6 weken na je melding onderzoek doen en beslist daarna binnen 2 weken. Het duurt dus even.", doorlooptijd: "tot ca. 8 weken", urgentie: "midden", klaarAls: (a) => has(a, "hulp", "wmo") },
  { id: "huis-veiliger", fase: 3, titel: "Het huis veiliger maken", uitleg: "Denk aan drempels, losse kleden, kookbeveiliging en goede verlichting. Een ergotherapeut kan meekijken.", waarom: "Valongelukken en vergeten pitten zijn veelvoorkomende risico's.", doorlooptijd: "1-4 weken", urgentie: "hoog", kern: true },
  { id: "werkgever", fase: 3, titel: "Gesprek met je werkgever over mantelzorgverlof", uitleg: "Er is kortdurend zorgverlof (minimaal 70% van je loon doorbetaald, tot 2 keer je wekelijkse uren per 12 maanden) en langdurend zorgverlof (onbetaald, tot 6 keer je wekelijkse uren). Bespreek wat past.", waarom: "Hoe eerder je werkgever het weet, hoe makkelijker het later wordt.", doorlooptijd: "1-2 weken", urgentie: "midden", kern: true, blijvend: true },
  { id: "noodplan", fase: 3, titel: "Een noodplan maken voor als jij uitvalt", uitleg: "Schrijf op wie kan invallen en wie bij een crisis gebeld wordt. Hang het op een zichtbare plek.", waarom: "Dan staat niet alles op jouw schouders als er iets gebeurt.", doorlooptijd: "1 week", urgentie: "laag", kern: false },
  { id: "mantelzorgsteun", fase: 3, titel: "Steun voor jezelf zoeken", uitleg: "Veel gemeenten hebben een mantelzorgsteunpunt. Daar kun je praten, advies krijgen en soms een waardering aanvragen.", waarom: "Zorgen voor jezelf is geen luxe. Het houdt de zorg vol.", doorlooptijd: "Direct", urgentie: "midden", blijvend: true },
  // ---- Fase 4: Zwaardere zorg
  { id: "wlz-voorbereiden", fase: 4, titel: "Wlz-indicatie voorbereiden", uitleg: "Verzamel medische gegevens en bespreek met de casemanager of arts wanneer een aanvraag bij het CIZ verstandig is.", waarom: "De aanvraag zelf gaat sneller als de stukken compleet zijn.", doorlooptijd: "2-4 weken voorbereiden", urgentie: "hoog", kern: true, vroeg: true, klaarAls: (a) => has(a, "wlz", "aangevraagd") || has(a, "wlz", "ja") },
  { id: "ciz-aanvragen", fase: 4, titel: "Wlz-indicatie aanvragen bij het CIZ", uitleg: "Het CIZ beoordeelt of je naaste recht heeft op zorg vanuit de Wlz.", waarom: "Na een volledige aanvraag krijg je volgens het CIZ binnen 6 weken besluit, vaak eerder. Bij spoed gaat het sneller.", doorlooptijd: "ca. 6 weken", urgentie: "hoog", kern: true, klaarAls: (a) => has(a, "wlz", "aangevraagd") || has(a, "wlz", "ja") },
  { id: "zorgkantoor", fase: 4, titel: "Contact met het zorgkantoor", uitleg: "Het zorgkantoor regelt (met een indicatie) welke Wlz-zorg er komt en waar.", waarom: "Hier loopt de wachtlijst en de keuze voor zorgaanbieder.", doorlooptijd: "na het CIZ-besluit", urgentie: "midden", kern: true },
  { id: "verpleeghuizen-bekijken", fase: 4, titel: "Verpleeghuizen bezoeken en vergelijken", uitleg: "Bezoek een paar locaties, stel vragen en kijk naar sfeer en betrokkenheid.", waarom: "De wachttijd verschilt per regio en kan maanden duren. Een keuze maken kost tijd.", doorlooptijd: "enkele weken", urgentie: "midden", kern: true, vroeg: true },
  { id: "pgb-vpt", fase: 4, titel: "Zorgvorm kiezen: zorg in natura, pgb of thuis", uitleg: "Met een Wlz-indicatie kun je zorg krijgen in een instelling, thuis met een volledig of modulair pakket thuis (vpt/mpt), of met een pgb. Bespreek de opties met het zorgkantoor.", waarom: "De keuze bepaalt wat je zelf moet regelen.", doorlooptijd: "enkele weken", urgentie: "laag", kern: false },
  // ---- Fase 5: Afscheid en nazorg
  { id: "wensen-bespreken", fase: 5, titel: "Wensen over de laatste levensfase bespreken", uitleg: "Praat over wat je naaste belangrijk vindt, bijvoorbeeld behandelwensen, thuis sterven en uitvaart. Dit heet ook proactieve zorgplanning en kan al na de diagnose.", waarom: "Zolang je naaste kan meepraten, kun je diens wensen vastleggen.", doorlooptijd: "Zo snel mogelijk", urgentie: "midden", kern: true, vroeg: true },
  { id: "palliatieve-zorg", fase: 5, titel: "Palliatieve zorg bespreken met de huisarts", uitleg: "Palliatieve zorg richt zich op comfort en kwaliteit van leven. Vraag wat er mogelijk is.", waarom: "Goede afspraken vooraf geven rust voor iedereen.", doorlooptijd: "enkele dagen", urgentie: "hoog", kern: true },
  { id: "uitvaart", fase: 5, titel: "Uitvaartwensen en uitvaartverzekering nalopen", uitleg: "Zoek op of er een verzekering of wensenlijst is en wie de uitvaartondernemer wordt. Die doet ook de aangifte van het overlijden.", waarom: "Dit scheelt veel beslissingen in een emotionele tijd.", doorlooptijd: "1 week", urgentie: "midden", kern: true },
  { id: "erfrecht", fase: 5, titel: "Erfrecht en administratie regelen", uitleg: "De uitvaartondernemer doet de aangifte van overlijden. Voor een verklaring van erfrecht ga je naar de notaris. Denk ook aan bank, pensioen, zorgverzekering en abonnementen.", waarom: "Er zijn termijnen. Een notaris of expert helpt om niets te missen.", doorlooptijd: "enkele weken tot maanden", urgentie: "midden", kern: true },
  { id: "nazorg", fase: 5, titel: "Nazorg voor jezelf", uitleg: "Rouw heeft tijd nodig. Praat met de huisarts, een lotgenotengroep of een steunpunt.", waarom: "Na lange zorg ontstaat vaak een leegte. Hulp zoeken is normaal.", doorlooptijd: "Zolang als nodig", urgentie: "laag", kern: true, blijvend: true },
];

/** Bronnen per taak (id's uit bronnen.ts): waar de gebruiker meer kan lezen. */
export const TAAK_BRONNEN: Record<string, string[]> = {
  "huisarts-afspraak": ["dem-huisarts", "an-diagnose"], "signalen-noteren": ["an-geheugenverlies", "dem-huisarts"], "gesprek-naaste": ["dem-nietpluis", "an-geheugenverlies"],
  geheugenpoli: ["an-diagnose", "dem-huisarts"], "dossier-medicatie": ["dem-checklist"], "uitslag-bespreken": ["an-diagnose"],
  "casemanager-aanvragen": ["dem-casemanager", "zin-casemanagement"], "alzheimer-info": ["alzheimer", "dementie_nl"],
  volmacht: ["not-levenstestament", "an-vertegenwoordiging", "dem-levenstestament"], mentorschap: ["rs-mentorschap", "not-bewind", "an-vertegenwoordiging"],
  dagbesteding: ["dem-dagbesteding", "rh-dagbesteding", "dem-wmo"], respijtzorg: ["mz-respijt", "rh-logeren"],
  "wmo-aanvraag": ["rh-wmo-aanmelding", "ro-wmo-aanvragen", "dem-wmo"], "huis-veiliger": ["rh-dementie", "dementie_nl"],
  werkgever: ["ro-zorgverlof-salaris", "ro-zorgverlof-duur", "mz-verlof"], noodplan: ["mantelzorg"], mantelzorgsteun: ["rh-mantelzorgondersteuning", "mz-waardering"],
  "wlz-voorbereiden": ["ciz-aanvraag", "ciz-folder"], "ciz-aanvragen": ["ciz-aanvraag", "ciz-folder"], zorgkantoor: ["zin-leveringsvormen", "rh-vpt"],
  "verpleeghuizen-bekijken": ["zorgkaart", "zin-leveringsvormen"], "pgb-vpt": ["zin-leveringsvormen", "rh-vpt", "ro-wlz-thuis"],
  "wensen-bespreken": ["dem-wensen", "pw-dementie"], "palliatieve-zorg": ["pw-dementie", "dem-wensen"], uitvaart: ["not-overlijden", "ro-checklist-overlijden"],
  erfrecht: ["not-erfrecht", "ro-erven", "not-overlijden"], nazorg: ["mantelzorg", "alzheimer"],
};
export const BIBLIOTHEEK = LIB;

function zoneVoor(t: Template, huidig: Fase): Zone | null {
  const afstand = t.fase - huidig;
  if (afstand === 0) return t.kern ? "nu" : "binnenkort";
  if (afstand === 1) return t.vroeg ? "binnenkort" : "later";
  if (afstand === 2) return t.vroeg ? "later" : null;
  if (afstand < 0) return t.blijvend ? (t.kern ? "nu" : "binnenkort") : null;
  return null;
}

/** Genereert de startlijst met taken op basis van intake en fase. */
export function genereerTaken(answers: Answers, fase: Fase = bepaalFase(answers)): Task[] {
  const taken: Task[] = [];
  for (const t of LIB) {
    if (t.klaarAls?.(answers)) continue;
    if (t.blijvend === false && t.fase !== fase) continue;
    const zone = zoneVoor(t, fase);
    if (!zone) continue;
    let urgentie = t.urgentie;
    // Zwaar belast of snelle achteruitgang: veiligheid en rust krijgen voorrang.
    if (has(answers, "belasting", "veiligheid") && t.id === "huis-veiliger") urgentie = "hoog";
    if (has(answers, "belasting", "werk") && t.id === "werkgever") urgentie = "hoog";
    if (answers.uren === "20plus" && t.id === "respijtzorg") urgentie = "hoog";
    taken.push({ id: t.id, titel: t.titel, uitleg: t.uitleg, waarom: t.waarom, doorlooptijd: t.doorlooptijd, zone, urgentie, status: "te_doen", fase: t.fase, bronnen: TAAK_BRONNEN[t.id] });
  }
  // Binnen elke zone: hoge urgentie eerst.
  const rang = { hoog: 0, midden: 1, laag: 2 } as const;
  return taken.sort((a, b) => rang[a.urgentie] - rang[b.urgentie]);
}

/** Demopersona Sanne (47): moeder met Alzheimer, thuiszorg + casemanager, geen volmacht, geen Wlz. */
export const SANNE_ANSWERS: Answers = {
  relatie: "kind", woon: "zelfstandig", situatie: "stabiel", diagnose: "ja", gezien: "geheugenpoli",
  hulp: ["thuiszorg", "casemanager"], wlz: "nee", juridisch: ["niets"], uren: "10_20", belasting: "werk",
};

export function seedTaken(): Task[] {
  const taken = genereerTaken(SANNE_ANSWERS, 3);
  // Eén taak is al afgerond zodat de voortgangsbalk er direct goed uitziet.
  return taken.map((t) => (t.id === "mantelzorgsteun" ? { ...t, status: "klaar" as const } : t));
}

/** Zoekt een taak uit de bibliotheek (voor o.a. de demo-modus van de chat). */
export function taakUitBibliotheek(id: string): Task | null {
  const t = LIB.find((x) => x.id === id);
  if (!t) return null;
  return { id: t.id, titel: t.titel, uitleg: t.uitleg, waarom: t.waarom, doorlooptijd: t.doorlooptijd, zone: "binnenkort", urgentie: t.urgentie, status: "te_doen", fase: t.fase, bronnen: TAAK_BRONNEN[t.id] };
}
