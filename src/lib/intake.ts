import type { Answers, Fase } from "./types";

export interface Question {
  id: string;
  vraag: string;
  hint?: string;
  multi?: boolean;
  opties: { id: string; label: string }[];
}

/** 10 korte vragen, één per scherm. */
export const QUESTIONS: Question[] = [
  { id: "relatie", vraag: "Wat is jouw relatie met je naaste?", opties: [
    { id: "kind", label: "Ik ben zoon of dochter" },
    { id: "partner", label: "Ik ben partner" },
    { id: "familie", label: "Ik ben ander familielid" },
    { id: "vriend", label: "Ik ben vriend, buur of kennis" } ] },
  { id: "woon", vraag: "Hoe woont je naaste nu?", opties: [
    { id: "zelfstandig", label: "Zelfstandig, alleen" },
    { id: "partner", label: "Thuis met een partner" },
    { id: "bij_mij", label: "Bij mij of een ander familielid in huis" },
    { id: "verpleeghuis", label: "In een verpleeghuis of zorginstelling" } ] },
  { id: "situatie", vraag: "Hoe gaat het op dit moment met je naaste?", hint: "Kies wat het beste past.", opties: [
    { id: "stabiel", label: "Rustig, het gaat langzaam achteruit" },
    { id: "snel", label: "Het gaat de laatste tijd snel achteruit" },
    { id: "laatste_fase", label: "Er is sprake van de laatste levensfase" },
    { id: "overleden", label: "Mijn naaste is overleden" } ] },
  { id: "diagnose", vraag: "Is er een diagnose dementie?", opties: [
    { id: "geen", label: "Nee, we maken ons zorgen maar er is nog niets onderzocht" },
    { id: "onderzoek", label: "Er loopt onderzoek, we wachten op uitslag" },
    { id: "ja", label: "Ja, er is een diagnose" } ] },
  { id: "gezien", vraag: "Bij wie is je naaste geweest voor het geheugen?", opties: [
    { id: "niemand", label: "Nog bij niemand" },
    { id: "huisarts", label: "Alleen bij de huisarts" },
    { id: "geheugenpoli", label: "Bij de geheugenpoli of geriater" } ] },
  { id: "hulp", vraag: "Welke hulp is er al?", hint: "Je kunt meerdere dingen kiezen.", multi: true, opties: [
    { id: "thuiszorg", label: "Thuiszorg" },
    { id: "wmo", label: "Hulp via de Wmo (gemeente)" },
    { id: "casemanager", label: "Een casemanager dementie" },
    { id: "dagbesteding", label: "Dagbesteding" },
    { id: "geen", label: "Nog geen hulp" } ] },
  { id: "wlz", vraag: "Is er een Wlz-indicatie (zorg in een verpleeghuis of volledig thuis)?", hint: "De Wlz is de wet voor langdurige zorg. De indicatie komt van het CIZ.", opties: [
    { id: "nee", label: "Nee, nog niet" },
    { id: "aangevraagd", label: "Aangevraagd, we wachten" },
    { id: "ja", label: "Ja, die is er" } ] },
  { id: "juridisch", vraag: "Wat is er juridisch geregeld?", hint: "Je kunt meerdere dingen kiezen.", multi: true, opties: [
    { id: "volmacht", label: "Een volmacht (iemand mag dingen regelen)" },
    { id: "mentorschap", label: "Mentorschap" },
    { id: "bewind", label: "Bewindvoering" },
    { id: "niets", label: "Nog niets, of ik weet het niet" } ] },
  { id: "uren", vraag: "Hoeveel uur per week zorg jij ongeveer?", opties: [
    { id: "lt5", label: "Minder dan 5 uur" },
    { id: "5_10", label: "5 tot 10 uur" },
    { id: "10_20", label: "10 tot 20 uur" },
    { id: "20plus", label: "Meer dan 20 uur" } ] },
  { id: "belasting", vraag: "Wat kost je nu de meeste energie?", opties: [
    { id: "papierwerk", label: "Overzicht houden en papierwerk" },
    { id: "emotioneel", label: "Het emotionele deel" },
    { id: "werk", label: "Zorg combineren met mijn werk" },
    { id: "veiligheid", label: "Zorgen om de veiligheid thuis" } ] },
];

export const has = (a: Answers, key: string, val: string) => {
  const v = a[key];
  return Array.isArray(v) ? v.includes(val) : v === val;
};

/**
 * FASEBEPALING (eenvoudige, uitlegbare regels; de eerste die past wint):
 *  5  Afscheid en nazorg  -> laatste levensfase of overleden
 *  4  Zwaardere zorg      -> Wlz-indicatie aangevraagd/toegekend, of wonen in een verpleeghuis
 *  3  Thuis ondersteunen  -> diagnose is er én er is hulp (thuiszorg, Wmo, casemanager, dagbesteding),
 *                            of de situatie gaat snel achteruit na een diagnose
 *  2  Diagnose en onderzoek -> er loopt onderzoek, of er is een diagnose maar nog geen hulp
 *  1  Eerste signalen     -> geen diagnose en geen onderzoek
 * Fases zijn geen strikte lijn: in de tijdlijn komen ook taken uit de volgende fase mee (zie seed.ts).
 */
export function bepaalFase(a: Answers): Fase {
  if (has(a, "situatie", "laatste_fase") || has(a, "situatie", "overleden")) return 5;
  if (has(a, "wlz", "aangevraagd") || has(a, "wlz", "ja") || has(a, "woon", "verpleeghuis")) return 4;
  const diagnose = has(a, "diagnose", "ja");
  const hulp = ["thuiszorg", "wmo", "casemanager", "dagbesteding"].some((h) => has(a, "hulp", h));
  if (diagnose && (hulp || has(a, "situatie", "snel"))) return 3;
  if (diagnose || has(a, "diagnose", "onderzoek") || has(a, "gezien", "geheugenpoli")) return 2;
  return 1;
}

export const FASE_NAMEN: Record<Fase, string> = {
  1: "Eerste signalen",
  2: "Diagnose en onderzoek",
  3: "Thuis ondersteunen",
  4: "Zwaardere zorg",
  5: "Afscheid en nazorg",
};

export const FASE_KERN: Record<Fase, string> = {
  1: "Er zijn zorgen over geheugen of gedrag, maar nog geen diagnose. Het belangrijkste nu: duidelijkheid krijgen en de eerste stappen zetten.",
  2: "Er is onderzoek of een diagnose. Het belangrijkste nu: de juiste hulp in gang zetten en weten wie wat doet.",
  3: "Je naaste woont nog thuis en er is of komt hulp. Het belangrijkste nu: de zorg thuis houdbaar maken, juridisch voorbereiden en vooruitkijken.",
  4: "De zorg wordt zwaarder. Het belangrijkste nu: de Wlz-indicatie, het zorgkantoor en de keuze voor een zorgaanbieder.",
  5: "Het gaat om afscheid, praktische zaken en zorg voor jezelf. Je hoeft dit niet alleen te doen.",
};

/** Warme samenvatting op het resultaatscherm: "Dit is wat we zien". */
export function samenvatting(a: Answers): string[] {
  const regels: string[] = [];
  const woon: Record<string, string> = {
    zelfstandig: "woont nog zelfstandig", partner: "woont thuis met een partner",
    bij_mij: "woont bij jou of een familielid in huis", verpleeghuis: "woont in een zorginstelling",
  };
  const w = a.woon as string; if (w && woon[w]) regels.push(`Je naaste ${woon[w]}.`);
  if (has(a, "diagnose", "ja")) regels.push("Er is een diagnose dementie.");
  else if (has(a, "diagnose", "onderzoek")) regels.push("Er loopt onderzoek en je wacht op duidelijkheid.");
  else regels.push("Er is nog geen diagnose. Je maakt je wel zorgen.");
  const hulp = (Array.isArray(a.hulp) ? a.hulp : []).filter((h) => h !== "geen");
  if (hulp.length) regels.push(`Er is al hulp: ${hulp.map((h) => ({ thuiszorg: "thuiszorg", wmo: "Wmo-hulp", casemanager: "een casemanager", dagbesteding: "dagbesteding" } as Record<string, string>)[h]).join(", ")}.`);
  else regels.push("Er is nog geen hulp ingeschakeld.");
  if (has(a, "wlz", "nee")) regels.push("Er is nog geen Wlz-indicatie.");
  if (has(a, "juridisch", "niets")) regels.push("Juridisch is er nog niets geregeld.");
  const uren: Record<string, string> = { lt5: "minder dan 5", "5_10": "5 tot 10", "10_20": "10 tot 20", "20plus": "meer dan 20" };
  if (typeof a.uren === "string") regels.push(`Jij zorgt ongeveer ${uren[a.uren]} uur per week.`);
  return regels;
}
