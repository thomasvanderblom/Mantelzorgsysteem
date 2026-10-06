import { BRONNEN } from "./bronnen";
import { KENNIS } from "./knowledge";
import { BIBLIOTHEEK, TAAK_BRONNEN } from "./seed";
import { FASE_NAMEN } from "./intake";
import type { Fase } from "./types";

/**
 * Eenvoudige retrieval over de eigen kennisbank en takenbibliotheek (geen externe dienst nodig).
 * De beste fragmenten gaan, met bron-id's, mee in de prompt zodat de chatbot feiten daaruit haalt
 * en kan verwijzen naar Alzheimer Nederland, Zorginstituut, CIZ enzovoort.
 */
export interface Fragment { tekst: string; bronnen: string[]; herkomst: string }

const STOP = new Set(["een", "het", "van", "voor", "met", "die", "dat", "dit", "ook", "niet", "wat", "hoe", "kan", "moet", "naar", "mijn", "zijn", "heeft", "wordt", "maar", "nog", "bij", "als", "dan", "ben", "ik", "je", "we", "de", "en", "is", "te", "er", "om", "op", "aan"]);
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const woorden = (s: string) => norm(s).split(" ").filter((w) => w.length >= 3 && !STOP.has(w));

let cache: Fragment[] | null = null;
export function alleFragmenten(): Fragment[] {
  if (cache) return cache;
  const f: Fragment[] = [];
  (Object.keys(KENNIS) as unknown as Fase[]).forEach((fase) => {
    const k = KENNIS[fase], h = `Kennisbank fase ${fase} (${FASE_NAMEN[fase]})`;
    f.push({ tekst: k.uitleg, bronnen: k.bronnen, herkomst: h });
    k.instanties.forEach((i) => f.push({ tekst: `${i.naam}: ${i.rol}`, bronnen: k.bronnen, herkomst: h }));
    k.doorlooptijden.forEach((d) => f.push({ tekst: `Doorlooptijd ${d.wat}: ${d.duur} (indicatie)`, bronnen: k.bronnen, herkomst: h }));
    k.fouten.forEach((x) => f.push({ tekst: `Veelgemaakte fout: ${x}`, bronnen: k.bronnen, herkomst: h }));
    f.push({ tekst: `Documenten die je nodig hebt: ${k.documenten.join("; ")}`, bronnen: k.bronnen, herkomst: h });
  });
  BIBLIOTHEEK.forEach((t) => f.push({
    tekst: `Taak "${t.titel}": ${t.uitleg} Waarom: ${t.waarom} Doorlooptijd: ${t.doorlooptijd}.`,
    bronnen: TAAK_BRONNEN[t.id] ?? [], herkomst: `Takenbibliotheek fase ${t.fase}`,
  }));
  return (cache = f);
}

/** Geeft de best passende fragmenten voor een vraag (prefix-match op woorden, huidige fase telt licht mee). */
export function zoekFragmenten(vraag: string, fase: Fase, max = 6): Fragment[] {
  const q = woorden(vraag);
  const scored = alleFragmenten().map((fr) => {
    const w = woorden(fr.tekst);
    let score = 0;
    for (const t of q) if (w.some((x) => x.startsWith(t) || (t.length > 4 && t.startsWith(x) && x.length > 4))) score += 1;
    if (score > 0 && fr.herkomst.includes(`fase ${fase}`)) score += 0.5;
    return { fr, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  const top = scored.slice(0, max).map((x) => x.fr);
  return top.length ? top : [alleFragmenten().find((x) => x.herkomst.startsWith(`Kennisbank fase ${fase}`))!];
}

/** Tekstblok voor in de prompt. */
export function bouwBronContext(vraag: string, fase: Fase): string {
  const frs = zoekFragmenten(vraag, fase);
  const lijst = Object.values(BRONNEN).map((b) => `- ${b.id}: ${b.naam} (${b.over})`).join("\n");
  return `BESCHIKBARE BRONNEN (gebruik alleen deze id's in het veld "bronnen"):\n${lijst}\n\nBRONNENCONTEXT (kennisbank en takenbibliotheek, gekoppeld aan bronnen):\n${frs.map((x, i) => `[${i + 1}] (bronnen: ${x.bronnen.join(", ") || "geen"}) ${x.tekst}`).join("\n")}`;
}
