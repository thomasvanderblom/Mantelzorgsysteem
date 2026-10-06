/**
 * Bronnenregister. Verwijst naar de organisaties waar de betreffende informatie te vinden is.
 * Let op: dit zijn verwijzingen naar de website van de organisatie, geen letterlijke citaten.
 * Controleer details (termijnen, regels) altijd bij de bron zelf.
 */
export interface Bron { id: string; naam: string; url: string; over: string }

export const BRONNEN: Record<string, Bron> = {
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

/** Filtert onbekende id's weg (belangrijk voor modeloutput) en geeft de volledige bronnen terug. */
export const bronnenVoor = (ids?: string[]): Bron[] =>
  (ids ?? []).filter((id, i, a) => BRONNEN[id] && a.indexOf(id) === i).map((id) => BRONNEN[id]);
