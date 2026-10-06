import type { Fase } from "./types";

export interface Kennis {
  uitleg: string;
  instanties: { naam: string; rol: string }[];
  documenten: string[];
  fouten: string[];
  doorlooptijden: { wat: string; duur: string }[];
}

/** Kennisbank per fase. Doorlooptijden zijn indicaties; ze verschillen per regio. */
export const KENNIS: Record<Fase, Kennis> = {
  1: {
    uitleg: "Je merkt dat je naaste vergeetachtiger wordt of anders reageert. Nog niemand heeft er een naam aan gegeven. Het gaat nu om rustig in kaart brengen wat je ziet en de huisarts erbij halen.",
    instanties: [
      { naam: "Huisarts", rol: "Eerste aanspreekpunt. Kijkt naar de klachten en kan doorverwijzen." },
      { naam: "Alzheimer Nederland", rol: "Betrouwbare informatie en lotgenotencontact." },
      { naam: "Gemeentelijk Wmo-loket", rol: "Eerste advies over ondersteuning in de buurt." },
    ],
    documenten: ["Eigen notities over vergeetachtigheid en gedrag", "Overzicht van medicijnen", "Zorgpas of verzekeringsgegevens"],
    fouten: ["Te lang wachten omdat het 'bij de leeftijd hoort'", "Het gesprek aangaan met verwijten in plaats van zorg", "Alleen met de huisarts praten zonder voorbeelden mee te nemen"],
    doorlooptijden: [{ wat: "Afspraak bij de huisarts", duur: "enkele dagen tot 2 weken" }, { wat: "Doorverwijzing geheugenpoli", duur: "enkele weken tot maanden" }],
  },
  2: {
    uitleg: "Er wordt onderzoek gedaan of er is net een diagnose. Dit is een emotionele periode. Het helpt om één vast aanspreekpunt te regelen en alvast te weten wat er op je afkomt.",
    instanties: [
      { naam: "Geheugenpoli of geriater", rol: "Doet onderzoek en stelt de diagnose." },
      { naam: "Casemanager dementie", rol: "Vast aanspreekpunt voor advies, regie en doorverwijzing." },
      { naam: "Huisarts", rol: "Blijft betrokken en houdt het overzicht over medicatie en gezondheid." },
    ],
    documenten: ["Verwijsbrief van de huisarts", "Medicatieoverzicht", "Uitslagen en brieven van de geheugenpoli"],
    fouten: ["Alleen naar het gesprek over de uitslag gaan", "Niet vragen naar een casemanager", "Alles zelf willen regelen in plaats van hulp te accepteren"],
    doorlooptijden: [{ wat: "Onderzoek op de geheugenpoli", duur: "enkele weken tot maanden" }, { wat: "Casemanager krijgen", duur: "enkele weken" }],
  },
  3: {
    uitleg: "Je naaste woont nog thuis, met hulp. Nu draait het om een houdbare situatie: hulp via de gemeente, dagbesteding, tijd voor jezelf en juridische zaken regelen zolang dat nog kan.",
    instanties: [
      { naam: "Wmo-loket van de gemeente", rol: "Beoordeelt en regelt hulp bij het huishouden, dagbesteding en aanpassingen." },
      { naam: "Casemanager dementie", rol: "Denkt mee, regelt hulp en signaleert wanneer de zorg zwaarder wordt." },
      { naam: "Notaris", rol: "Legt een volmacht of andere regelingen vast." },
      { naam: "Kantonrechter", rol: "Beslist over mentorschap of bewind als iemand het zelf niet meer kan." },
      { naam: "Werkgever", rol: "Bespreek zorgverlof en afspraken over werktijden." },
    ],
    documenten: ["Identiteitsbewijs van je naaste", "Medisch overzicht en diagnosebrief", "Overzicht van inkomen, vaste lasten en verzekeringen", "Eventueel bestaand testament of levenstestament"],
    fouten: ["Te lang wachten met een volmacht", "Pas hulp zoeken bij een crisis", "Geen noodplan hebben als jij uitvalt", "Zelf alles doen en geen respijtzorg inzetten"],
    doorlooptijden: [{ wat: "Wmo-aanvraag", duur: "gemeente beslist meestal binnen 8 weken" }, { wat: "Dagbesteding", duur: "enkele weken tot maanden" }, { wat: "Volmacht via notaris", duur: "enkele weken" }, { wat: "Mentorschap via kantonrechter", duur: "enkele maanden" }],
  },
  4: {
    uitleg: "Thuis lukt niet meer of wordt te zwaar. Nu gaat het om de Wlz-indicatie (langdurige zorg), het zorgkantoor en de keuze voor een zorgaanbieder of een verpleeghuis.",
    instanties: [
      { naam: "CIZ", rol: "Beoordeelt of je naaste recht heeft op Wlz-zorg en geeft de indicatie af." },
      { naam: "Zorgkantoor", rol: "Regelt en betaalt Wlz-zorg en beheert de wachtlijst." },
      { naam: "Zorgaanbieder of verpleeghuis", rol: "Levert de zorg, thuis of in een instelling." },
      { naam: "Casemanager of cliëntondersteuner", rol: "Helpt bij de aanvraag en de keuze." },
    ],
    documenten: ["Aanvraagformulier voor het CIZ", "Medische gegevens en diagnose", "Overzicht van de huidige zorg", "Machtiging of volmacht als jij namens je naaste regelt"],
    fouten: ["Te laat beginnen met de aanvraag", "Alleen naar één verpleeghuis kijken", "Niet laten meekijken door casemanager of cliëntondersteuner"],
    doorlooptijden: [{ wat: "CIZ-besluit na volledige aanvraag", duur: "ca. 6 weken" }, { wat: "Plek in een verpleeghuis", duur: "wisselt sterk per regio, soms maanden" }],
  },
  5: {
    uitleg: "De laatste levensfase, het afscheid en wat daarna komt. Er is veel te regelen, maar het hoeft niet allemaal meteen. Zorg ook goed voor jezelf.",
    instanties: [
      { naam: "Huisarts of specialist ouderengeneeskunde", rol: "Begeleidt de palliatieve zorg en stelt het overlijden vast." },
      { naam: "Uitvaartondernemer", rol: "Regelt de uitvaart en de formele meldingen rond het overlijden." },
      { naam: "Notaris", rol: "Helpt met erfrecht, een verklaring van erfrecht en de afwikkeling." },
      { naam: "Gemeente, pensioenfonds en SVB", rol: "Ontvangen de melding en regelen stopzetting van uitkeringen en voorzieningen." },
    ],
    documenten: ["Uitvaartverzekering of wensenlijst", "Testament", "Overzicht van rekeningen, abonnementen en verzekeringen", "Pensioen- en uitkeringsgegevens"],
    fouten: ["Abonnementen en vaste lasten niet tijdig opzeggen", "Een erfenis aanvaarden zonder de gevolgen te kennen", "Geen tijd nemen voor eigen rouw"],
    doorlooptijden: [{ wat: "Verklaring van erfrecht", duur: "enkele weken", }, { wat: "Administratieve afwikkeling", duur: "enkele maanden" }],
  },
};
