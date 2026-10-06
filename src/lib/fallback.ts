import type { ChatAntwoord, Task } from "./types";

/**
 * Offline fallback voor de demo: gescripte antwoorden voor de 3 voorbeeldvragen,
 * zodat de demo ook werkt zonder API-sleutel of internet. Alleen gebruikt als de echte API niet bereikbaar is.
 */
export function fallbackAntwoord(vraag: string, tasks: Task[]): ChatAntwoord | null {
  const v = vraag.toLowerCase();
  const bestaat = (id: string) => tasks.some((t) => t.id === id);
  if (v.includes("valt")) {
    return {
      antwoord: "Dat is zorgelijk, en goed dat je het aanpakt. Bel bij een val met letsel of twijfel altijd de huisarts. Ik zet het veiliger maken van het huis en een gesprek met de casemanager bovenaan je tijdlijn. Een ergotherapeut kan thuis meekijken, en de casemanager kan ook vragen naar een alarmering.",
      tijdlijn_updates: [
        ...(bestaat("huis-veiliger") ? [{ actie: "verplaatsen" as const, taak_id: "huis-veiliger", titel: "Het huis veiliger maken", uitleg: "", zone: "nu" as const, urgentie: "hoog" as const, fase: 3, reden: "Vaker vallen maakt dit urgenter." }] : []),
        { actie: "toevoegen", taak_id: null, titel: "Valrisico bespreken met huisarts of casemanager", uitleg: "Vraag naar oorzaken (bijv. medicatie, zicht) en naar een ergotherapeut of personenalarmering.", zone: "nu", urgentie: "hoog", fase: 3, reden: "Valincidenten vragen om een medische blik." },
      ],
      fase_aanpassing: null, vervolgvraag: "Is je moeder bij een val gewond geraakt?",
    };
  }
  if (v.includes("wlz")) {
    return {
      antwoord: "Na een volledige aanvraag beslist het CIZ meestal binnen ongeveer 6 weken. Het voorbereiden van de stukken kost vaak ook een paar weken, en daarna kan er een wachttijd zijn voor een plek. Daarom zet ik de voorbereiding alvast hoger. Weet je zeker dat je de precieze termijn wilt weten, vraag het dan aan de casemanager of het CIZ.",
      tijdlijn_updates: bestaat("wlz-voorbereiden") ? [{ actie: "verplaatsen", taak_id: "wlz-voorbereiden", titel: "Wlz-indicatie voorbereiden", uitleg: "", zone: "binnenkort", urgentie: "hoog", fase: 4, reden: "Doorlooptijden zijn lang, dus begin op tijd." }] : [],
      fase_aanpassing: null, vervolgvraag: null,
    };
  }
  if (v.includes("overbelast") || v.includes("uit handen")) {
    return {
      antwoord: "Dat klinkt zwaar, en het is heel begrijpelijk. Je hoeft dit niet alleen te doen. Ik stel voor dat een expert het papierwerk voor de dagbesteding en de Wmo van je overneemt, en dat je respijtzorg bekijkt voor een rustmoment. Zo houd je het vol.",
      tijdlijn_updates: [
        ...(bestaat("dagbesteding") ? [{ actie: "expert_voorstellen" as const, taak_id: "dagbesteding", titel: "Dagbesteding aanvragen", uitleg: "", zone: "nu" as const, urgentie: "hoog" as const, fase: 3, reden: "Papierwerk en bellen kan een expert overnemen." }] : []),
        ...(bestaat("respijtzorg") ? [{ actie: "verplaatsen" as const, taak_id: "respijtzorg", titel: "Respijtzorg bekijken", uitleg: "", zone: "nu" as const, urgentie: "hoog" as const, fase: 3, reden: "Jij hebt nu rust nodig." }] : []),
      ],
      fase_aanpassing: null, vervolgvraag: "Wat kost je het meeste energie: het regelwerk of de zorg zelf?",
    };
  }
  return null;
}
