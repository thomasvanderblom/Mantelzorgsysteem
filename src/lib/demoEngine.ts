import type { ChatAntwoord, Fase, Task, TijdlijnUpdate, Urgentie, Zone } from "./types";
import { taakUitBibliotheek } from "./seed";

/**
 * DEMO-MODUS van de chatbot: gescripte scenario's met trefwoordherkenning.
 * Werkt zonder API-sleutel en geeft dezelfde structuur terug als de echte API (ChatAntwoord),
 * dus de tijdlijn wordt op precies dezelfde manier bijgewerkt (toevoegen, verplaatsen, afronden, expert voorstellen).
 * Met "ongedaan_maken" vraagt een scenario de app om de laatste wijziging terug te draaien.
 */
export type DemoAntwoord = ChatAntwoord & { ongedaan_maken?: boolean };
interface Ctx { t: string; tasks: Task[]; fase: Fase; kanOngedaan: boolean }
interface Scenario { id: string; /** Bron-id's (bronnen.ts) waarop het scenario-antwoord steunt. */ bronnen?: string[]; trefwoorden: string[]; bouw: (c: Ctx) => DemoAntwoord | null; /** Alleen gebruiken als geen enkel ander scenario past. */ laatsteKeus?: boolean }

/** Kleine letters, zonder accenten of leestekens, zodat "Wlz-indicatie" en "wlz indicatie" hetzelfde zijn. */
export const normaliseer = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

// ---- Hulpfuncties om updates te bouwen
const bestaat = (c: Ctx, id: string) => c.tasks.find((t) => t.id === id);
const antw = (antwoord: string, tijdlijn_updates: TijdlijnUpdate[] = [], extra: Partial<DemoAntwoord> = {}): DemoAntwoord =>
  ({ antwoord, tijdlijn_updates, fase_aanpassing: null, vervolgvraag: null, ...extra });
const nieuw = (titel: string, uitleg: string, zone: Zone, urgentie: Urgentie, fase: Fase, reden: string): TijdlijnUpdate =>
  ({ actie: "toevoegen", taak_id: null, titel, uitleg, zone, urgentie, fase, reden });

/** Zorgt dat een bibliotheektaak in de gewenste zone/urgentie staat: verplaatst als hij er is, voegt toe als hij ontbreekt. */
function zet(c: Ctx, id: string, zone: Zone, urgentie: Urgentie, reden: string): TijdlijnUpdate[] {
  const t = bestaat(c, id);
  if (!t) {
    const s = taakUitBibliotheek(id);
    return s ? [{ actie: "toevoegen", taak_id: null, titel: s.titel, uitleg: s.uitleg, zone, urgentie, fase: s.fase, reden }] : [];
  }
  if (t.status === "klaar") return [];
  const u: TijdlijnUpdate[] = [];
  const basis = { taak_id: t.id, titel: t.titel, uitleg: "", fase: t.fase, reden, zone, urgentie };
  if (t.zone !== zone) u.push({ ...basis, actie: "verplaatsen" });
  if (t.urgentie !== urgentie) u.push({ ...basis, actie: "urgentie_wijzigen" });
  return u;
}
const expert = (c: Ctx, id: string, reden: string): TijdlijnUpdate[] => {
  const t = bestaat(c, id);
  return t && t.status !== "klaar" && t.status !== "expert_bezig" ? [{ actie: "expert_voorstellen", taak_id: t.id, titel: t.titel, uitleg: "", zone: t.zone, urgentie: t.urgentie, fase: t.fase, reden }] : [];
};

// ---- Scenario's
const SCENARIOS: Scenario[] = [
  { id: "ongedaan", trefwoorden: ["ongedaan", "terugdraaien", "draai terug", "undo", "toch niet", "maak dat terug", "herstel"],
    bouw: (c) => c.kanOngedaan
      ? antw("Prima, ik heb de laatste aanpassing van je tijdlijn teruggedraaid. Je tijdlijn is weer zoals die eerder was.", [], { ongedaan_maken: true })
      : antw("Er is op dit moment niets om terug te draaien: ik heb nog geen wijziging in je tijdlijn gedaan.") },

  { id: "afronden", trefwoorden: ["gedaan", "geregeld", "klaar", "afgerond", "afgehandeld", "al gebeld", "heb ik", "is rond"],
    bouw: (c) => {
      const map: [string[], string][] = [
        [["volmacht", "notaris"], "volmacht"], [["dagbesteding"], "dagbesteding"], [["werkgever", "verlof"], "werkgever"],
        [["huis veilig", "veiliger"], "huis-veiliger"], [["wmo"], "wmo-aanvraag"], [["mentorschap"], "mentorschap"],
        [["respijt"], "respijtzorg"], [["noodplan"], "noodplan"], [["ciz", "wlz"], "ciz-aanvragen"], [["zorgkantoor"], "zorgkantoor"],
      ];
      const hit = map.find(([k, id]) => k.some((w) => c.t.includes(w)) && bestaat(c, id) && bestaat(c, id)!.status !== "klaar");
      if (!hit) return null;
      const t = bestaat(c, hit[1])!;
      return antw(`Mooi, dat is weer een zorg minder. Ik heb “${t.titel}” als klaar gemarkeerd. Goed gedaan!`,
        [{ actie: "afronden", taak_id: t.id, titel: t.titel, uitleg: "", zone: t.zone, urgentie: t.urgentie, fase: t.fase, reden: "Je geeft aan dat dit geregeld is." }]);
    } },

  { id: "val", bronnen: ["alzheimer", "dementie_nl"], trefwoorden: ["valt", "vallen", "gevallen", "valpartij", "struikelt", "gestruikeld", "val ", "gevallen"],
    bouw: (c) => antw("Dat is zorgelijk, goed dat je het aanpakt. Bel bij een val met letsel of twijfel altijd de huisarts. Ik zet het veiliger maken van het huis bovenaan. Een ergotherapeut kan thuis meekijken, en de casemanager kan helpen met bijvoorbeeld een alarmering.",
      [...zet(c, "huis-veiliger", "nu", "hoog", "Vaker vallen maakt dit urgenter."),
       nieuw("Valrisico bespreken met huisarts of casemanager", "Vraag naar oorzaken (bijv. medicatie of zicht) en naar een ergotherapeut of alarmering.", "nu", "hoog", 3, "Valincidenten vragen om een medische blik.")],
      { vervolgvraag: "Is je naaste bij een val gewond geraakt?" }) },

  { id: "wlz", bronnen: ["ciz", "zorginstituut"], trefwoorden: ["wlz", "ciz", "indicatie", "zorgkantoor", "langdurige zorg"],
    bouw: (c) => antw("Na een volledige aanvraag beslist het CIZ meestal binnen ongeveer 6 weken. Het voorbereiden van de stukken kost vaak ook een paar weken, en daarna kan er een wachttijd zijn voor een plek. Daarom zet ik de voorbereiding hoger. De precieze termijn hoor je het best van de casemanager of het CIZ zelf.",
      [...zet(c, "wlz-voorbereiden", "binnenkort", "hoog", "De doorlooptijden zijn lang, dus begin op tijd."),
       nieuw("Medische gegevens verzamelen voor de Wlz-aanvraag", "Vraag de casemanager of huisarts welke stukken het CIZ nodig heeft en verzamel die alvast.", "binnenkort", "midden", 4, "Een complete aanvraag gaat sneller.")]) },

  { id: "overbelast", bronnen: ["mantelzorg", "regelhulp"], trefwoorden: ["overbelast", "moe", "uitgeput", "burn", "overweldigd", "red het niet", "kan niet meer", "uit handen", "te veel", "zwaar", "opgebrand"],
    bouw: (c) => antw("Dat klinkt zwaar, en het is heel begrijpelijk. Je hoeft dit niet alleen te doen. Een expert kan het papierwerk voor de dagbesteding van je overnemen, en met respijtzorg krijg je een rustmoment. Zo houd je het vol.",
      [...expert(c, "dagbesteding", "Papierwerk en bellen kan een expert overnemen."), ...zet(c, "respijtzorg", "nu", "hoog", "Jij hebt nu rust nodig."),
       nieuw("Een vast rustmoment voor jezelf inplannen", "Plan elke week een moment dat je niets voor je naaste hoeft te doen, en vraag iemand om in te vallen.", "nu", "midden", 3, "Rust houdt de zorg vol.")],
      { vervolgvraag: "Wat kost je het meeste energie: het regelwerk of de zorg zelf?" }) },

  { id: "volmacht", bronnen: ["notaris", "alzheimer"], trefwoorden: ["volmacht", "notaris", "bankzaken", "bankrekening", "geldzaken", "pinpas", "levenstestament", "testament"],
    bouw: (c) => antw("Een volmacht kan alleen zolang je naaste de gevolgen ervan nog begrijpt. Daarom raad ik aan dit snel te regelen via een notaris. Of dat nog kan, beoordeelt de notaris. Ik zet de taak bovenaan.",
      [...zet(c, "volmacht", "nu", "hoog", "Een volmacht moet geregeld zijn zolang dat nog kan."),
       nieuw("Afspraak maken met een notaris over een volmacht", "Bel een notaris en vraag naar de mogelijkheden en kosten. Neem je naaste mee.", "nu", "hoog", 3, "Dit is de eerste concrete stap.")], { vervolgvraag: "Heeft je naaste zelf al eens iets laten vastleggen, zoals een testament?" }) },

  { id: "mentorschap", bronnen: ["rechtspraak", "notaris"], trefwoorden: ["mentorschap", "mentor", "bewind", "bewindvoering", "curatele", "kantonrechter", "onder curatele"],
    bouw: (c) => antw("Mentorschap gaat over beslissingen over zorg en verblijf, bewind over geld. Beide regel je via de kantonrechter als een volmacht niet (meer) kan. Het is goed om dit nu te bespreken, ook als het nog niet nodig is. Een notaris, de casemanager of een expert kan uitleggen wat bij jullie past.",
      [...zet(c, "mentorschap", "binnenkort", "hoog", "Dit duurt maanden, dus verken het op tijd."),
       nieuw("Verschil tussen volmacht, mentorschap en bewind uitzoeken", "Bespreek met de notaris of casemanager welke regeling past.", "binnenkort", "midden", 3, "Zo kies je de juiste regeling.")]) },

  { id: "werk", bronnen: ["rijksoverheid", "mantelzorg"], trefwoorden: ["werk", "werkgever", "verlof", "zorgverlof", "baas", "leidinggevende", "collega", "ziekmelden", "uren minderen"],
    bouw: (c) => antw("Combineren van werk en zorg is zwaar. Er is kortdurend zorgverlof (deels doorbetaald) en langdurend zorgverlof (onbetaald). Bespreek met je werkgever wat past. Hoe eerder je het gesprek voert, hoe makkelijker het wordt. Ik zet dit bovenaan.",
      [...zet(c, "werkgever", "nu", "hoog", "Je geeft aan dat werk en zorg botsen."),
       nieuw("Gesprek met werkgever voorbereiden (verlof en afspraken)", "Bedenk wat je nodig hebt, bijvoorbeeld andere werktijden of verlof, en vraag een gesprek aan.", "nu", "midden", 3, "Een goede voorbereiding maakt het gesprek makkelijker.")]) },

  { id: "dagbesteding", bronnen: ["regelhulp", "alzheimer"], trefwoorden: ["dagbesteding", "dagopvang", "dagcentrum", "overdag naar", "activiteiten"],
    bouw: (c) => antw("Dagbesteding geeft je naaste structuur en jou rustmomenten. Je vraagt het aan via het Wmo-loket van je gemeente. Er kan een wachttijd zijn, dus begin snel. Een expert kan de aanvraag voor je doen.",
      [...zet(c, "dagbesteding", "nu", "hoog", "Er kan een wachttijd zijn."), ...expert(c, "dagbesteding", "Een expert kan de aanvraag invullen.")]) },

  { id: "respijt", bronnen: ["mantelzorg", "regelhulp"], trefwoorden: ["respijt", "logeren", "logeerhuis", "vakantie", "weekend weg", "even vrij", "pauze", "afleiding", "ontlasten"],
    bouw: (c) => antw("Respijtzorg neemt de zorg tijdelijk over, bijvoorbeeld een logeerplek of een vrijwilliger aan huis. Informeer bij de casemanager of het Wmo-loket wat er in jullie gemeente kan. Ik zet het hoger in je tijdlijn.",
      zet(c, "respijtzorg", "nu", "hoog", "Een pauze voorkomt overbelasting.")) },

  { id: "wmo", bronnen: ["rijksoverheid", "regelhulp"], trefwoorden: ["wmo", "huishoudelijke hulp", "gemeente", "hulp in huis", "schoonmaak", "traplift", "aanpassing"],
    bouw: (c) => antw("Via het Wmo-loket van je gemeente vraag je hulp aan, zoals huishoudelijke hulp of aanpassingen in huis. De gemeente beslist meestal binnen ongeveer 8 weken. Ik zet het alvast in je tijdlijn.",
      zet(c, "wmo-aanvraag", "nu", "midden", "Het besluit van de gemeente duurt even.")) },

  { id: "dwalen", bronnen: ["alzheimer", "dementie_nl"], trefwoorden: ["dwalen", "dwaalt", "loopt weg", "loopt steeds weg", "weggelopen", "weglopen", "wegloop", "verdwaald", "kwijt", "gps", "buiten rond", "niet thuis gevonden"],
    bouw: (c) => antw("Dwalen of weglopen komt bij dementie vaak voor, en het is begrijpelijk dat je je zorgen maakt. Bespreek het met de casemanager: die kent opties zoals een GPS-alarmering. Ik zet het bovenaan en kijk ook naar de veiligheid thuis.",
      [nieuw("Dwaalgedrag bespreken met de casemanager", "Vraag naar mogelijkheden voor alarmering of een GPS-hulpmiddel en maak afspraken met buren.", "nu", "hoog", 3, "Weglopen is een veiligheidsrisico."), ...zet(c, "huis-veiliger", "nu", "hoog", "Veiligheid thuis is nu belangrijker.")],
      { vervolgvraag: "Gebeurt het vooral overdag of ook 's nachts?" }) },

  { id: "medicatie", bronnen: ["dementie_nl"], trefwoorden: ["medicijn", "medicijnen", "medicatie", "pillen", "tabletten", "apotheek", "innemen"],
    bouw: () => antw("Medicatie is belangrijk om goed in de gaten te houden. Ik geef geen medisch advies, maar de huisarts of apotheek kan de medicatie laten nalopen en kijken of een medicijnrol of ondersteuning helpt. Ik zet een taak in je tijdlijn.",
      [nieuw("Medicatie laten controleren bij huisarts of apotheek", "Vraag om een actueel medicatieoverzicht en bespreek of een medicijnrol of toediening door thuiszorg helpt.", "nu", "midden", 3, "Medicatie moet kloppen en goed ingenomen worden.")]) },

  { id: "gedrag", bronnen: ["alzheimer", "dementie_nl"], trefwoorden: ["agressief", "boos", "schreeuwt", "onrustig", "achterdochtig", "paranoia", "beschuldigt", "apathisch", "somber", "gedrag", "driftig"],
    bouw: () => antw("Veranderd gedrag hoort vaak bij dementie, maar het kan zwaar zijn om mee om te gaan. Het is goed om het te bespreken met de casemanager of huisarts, want soms is er een oorzaak die je kunt aanpakken, zoals pijn of een infectie. Ik zet het in je tijdlijn.",
      [nieuw("Gedragsverandering bespreken met casemanager of huisarts", "Noteer wat je ziet, wanneer het gebeurt en wat helpt. Neem dat mee naar het gesprek.", "nu", "hoog", 3, "Veranderd gedrag verdient aandacht en advies.")],
      { vervolgvraag: "Wanneer merk je het het meest?" }) },

  { id: "slaap", bronnen: ["alzheimer"], trefwoorden: ["slaap", "slaapt", "nacht", "'s nachts", "nachtelijke", "doorslapen", "dag nacht ritme"],
    bouw: () => antw("Onrustige nachten komen vaak voor en zijn ook voor jou slopend. Bespreek het met de huisarts of casemanager. Ik zet een taak in je tijdlijn. Neem ook zelf je rust, bijvoorbeeld door een nacht door iemand anders te laten opvangen.",
      [nieuw("Nachtelijke onrust bespreken met huisarts of casemanager", "Houd een paar dagen bij hoe de nachten verlopen en wat helpt.", "binnenkort", "midden", 3, "Slaapproblemen verergeren de belasting voor jullie beiden.")]) },

  { id: "casemanager", bronnen: ["zorginstituut", "alzheimer"], trefwoorden: ["casemanager", "aanspreekpunt", "vaste contactpersoon", "wie kan ik bellen"],
    bouw: (c) => antw("Een casemanager dementie is jullie vaste aanspreekpunt voor advies en doorverwijzing. Als je er al een hebt, plan dan een gesprek om de punten uit je tijdlijn door te nemen. Heb je er nog geen, vraag er dan een aan via de huisarts of de geheugenpoli.",
      [...zet(c, "casemanager-aanvragen", "nu", "hoog", "Een vast aanspreekpunt scheelt veel zoeken."),
       nieuw("Gesprek plannen met de casemanager over mijn tijdlijn", "Neem je tijdlijn mee en loop samen de belangrijkste taken door.", "nu", "midden", 3, "De casemanager kan helpen prioriteren.")]) },

  { id: "kosten", bronnen: ["rijksoverheid", "zorginstituut"], trefwoorden: ["kosten", "kost", "betalen", "eigen bijdrage", "vergoed", "vergoeding", "geld", "duur", "zorgverzekering", "cak"],
    bouw: () => antw("Over kosten kan ik geen precieze bedragen noemen, want die verschillen per situatie en regeling. Voor Wmo-hulp en Wlz-zorg geldt vaak een eigen bijdrage. De gemeente, het zorgkantoor of een expert kan voor jou uitrekenen wat het wordt. Ik zet het uitzoeken in je tijdlijn.",
      [nieuw("Kosten en eigen bijdrage uitzoeken (Wmo en Wlz)", "Vraag bij de gemeente en het zorgkantoor wat de eigen bijdrage is.", "binnenkort", "midden", 3, "Zo ben je niet verrast door kosten.")]) },

  { id: "verpleeghuis", bronnen: ["ciz", "zorgkaart", "zorginstituut"], trefwoorden: ["verpleeghuis", "opname", "niet meer thuis", "thuis lukt niet", "wachtlijst", "zorginstelling", "ouderenzorg", "beschermd wonen"],
    bouw: (c) => antw("Dat is een groot besluit, en het is normaal dat het veel met je doet. Voor een plek in een verpleeghuis is een Wlz-indicatie van het CIZ nodig. De wachttijd verschilt per regio en kan maanden duren. Daarom zet ik de voorbereiding en het bezoeken van locaties vast in je tijdlijn.",
      [...zet(c, "wlz-voorbereiden", "nu", "hoog", "Zonder indicatie geen plek, en de doorlooptijd is lang."), ...zet(c, "verpleeghuizen-bekijken", "binnenkort", "midden", "Een keuze maken kost tijd."), ...zet(c, "zorgkantoor", "binnenkort", "midden", "Het zorgkantoor regelt de wachtlijst.")],
      { vervolgvraag: c.t.includes("niet meer thuis") || c.t.includes("lukt niet") ? "Is het thuis nu acuut onveilig?" : null, fase_aanpassing: c.fase < 4 && (c.t.includes("niet meer thuis") || c.t.includes("lukt niet")) ? 4 : null }) },

  { id: "levenseinde", bronnen: ["palliaweb", "dementie_nl", "mantelzorg"], trefwoorden: ["overleden", "laatste levensfase", "palliatief", "stervende", "sterft", "afscheid", "uitvaart", "euthanasie", "hospice"],
    bouw: (c) => antw("Wat verdrietig, ik leef met je mee. Je hoeft nu niet alles te regelen. Ik zet een paar dingen klaar voor als je eraan toe bent. De huisarts kan palliatieve zorg met je bespreken. Zorg ook goed voor jezelf.",
      [...zet(c, "palliatieve-zorg", "nu", "hoog", "Goede afspraken geven rust."), ...zet(c, "wensen-bespreken", "nu", "midden", "De wensen van je naaste staan voorop."), ...zet(c, "nazorg", "binnenkort", "laag", "Ook jij hebt steun nodig.")],
      { fase_aanpassing: c.fase !== 5 ? 5 : null }) },

  { id: "signalen", bronnen: ["alzheimer", "dementie_nl"], trefwoorden: ["vergeetachtig", "vergeet", "geheugen", "verward", "dementie", "alzheimer", "diagnose", "geheugenpoli", "eerste tekenen"],
    bouw: (c) => antw("Dank je dat je dit deelt. Dementie heeft veel kanten, en elke situatie is anders. Het helpt om voorbeelden te noteren van wat je ziet, en dat te bespreken met de huisarts of casemanager. Ik zet een taak voor je klaar.",
      [...zet(c, "signalen-noteren", "nu", "midden", "Concrete voorbeelden helpen de arts."), ...(c.fase <= 2 ? zet(c, "huisarts-afspraak", "nu", "hoog", "Hoe eerder duidelijkheid, hoe meer opties.") : [])],
      { vervolgvraag: "Is er al een diagnose gesteld?" }) },

  { id: "expert", trefwoorden: ["expert", "papierwerk", "formulier", "uitbesteden", "overnemen", "regelen voor mij", "kan iemand dit", "bellen voor"],
    bouw: (c) => {
      const kandidaten = ["volmacht", "wmo-aanvraag", "dagbesteding", "wlz-voorbereiden"];
      const id = kandidaten.find((k) => { const t = bestaat(c, k); return t && t.status !== "klaar" && t.status !== "expert_bezig"; });
      return antw("Natuurlijk, dat kan. Een expert van Mantelzorg Navigator kan vragen beantwoorden, formulieren invullen en met instanties bellen. Dat is optioneel en betaald. Ik heb een taak gemarkeerd waar een expert je goed bij kan helpen. Klik op “Laat expert dit doen” om het aan te vragen.",
        id ? expert(c, id, "Papierwerk en bellen kan een expert overnemen.") : []);
    } },

  { id: "begin", laatsteKeus: true, trefwoorden: ["wat nu", "waar begin", "wat moet ik", "wat eerst", "hulp", "help", "overzicht", "prioriteit"],
    bouw: (c) => {
      const nu = c.tasks.filter((t) => t.zone === "nu" && t.status !== "klaar").slice(0, 3);
      return antw(nu.length ? `Je hoeft niet alles tegelijk. Begin hiermee:\n${nu.map((t, i) => `${i + 1}. ${t.titel}`).join("\n")}\nDe rest kan wachten. Wil je dat een expert een van deze overneemt?` : "Je hebt niets meer open staan bij Nu. Goed bezig! Kijk gerust naar Binnenkort, of vertel me wat er speelt.");
    } },
];

const ONBEKEND = [
  "Dat kan ik in deze demo niet goed beantwoorden, en ik verzin liever niets. Voor zekerheid kun je terecht bij de huisarts, de casemanager, het Wmo-loket of een expert van Mantelzorg Navigator. Probeer anders eens een vraag over bijvoorbeeld vallen, de Wlz-indicatie, volmacht, dagbesteding, werk of overbelasting.",
  "Daar heb ik in deze demo geen antwoord op. Kun je het anders formuleren? Ik kan meedenken over bijvoorbeeld respijtzorg, Wmo-hulp, mentorschap, medicatie, dwaalgedrag of kosten. Bij twijfel is de huisarts of casemanager de beste eerste stap.",
];

/** Kiest het scenario met de meeste trefwoord-treffers (meerwoordige trefwoorden tellen zwaarder). */
export function demoAntwoord(vraag: string, tasks: Task[], fase: Fase, kanOngedaan: boolean): DemoAntwoord {
  const t = normaliseer(vraag);
  const ctx: Ctx = { t, tasks, fase, kanOngedaan };
  const scores = SCENARIOS.map((s, i) => {
    let score = 0;
    for (const kw of s.trefwoorden) {
      const k = normaliseer(kw);
      // Korte trefwoorden (bijv. "moe") moeten een heel woord zijn, anders matcht "moeder".
      if (k && new RegExp(k.length <= 4 ? `(^| )${k}( |$)` : `(^| )${k}`).test(t)) score += k.includes(" ") ? 2 : 1;
    }
    return { s, score, i };
  }).filter((x) => x.score > 0).sort((a, b) => Number(!!a.s.laatsteKeus) - Number(!!b.s.laatsteKeus) || b.score - a.score || a.i - b.i);
  for (const { s } of scores) {
    const r = s.bouw(ctx);
    if (r) {
      // Koppel het antwoord en nieuw toegevoegde taken aan de bronnen van het scenario.
      r.bronnen = s.bronnen;
      r.tijdlijn_updates = r.tijdlijn_updates.map((u) => (u.actie === "toevoegen" && !u.bronnen ? { ...u, bronnen: s.bronnen } : u));
      return r;
    }
  }
  return antw(ONBEKEND[t.length % ONBEKEND.length]);
}

export const AANTAL_SCENARIOS = SCENARIOS.length;
