import type { ChatAntwoord, TijdlijnUpdate } from "./types";

const ACTIES = ["toevoegen", "verplaatsen", "urgentie_wijzigen", "afronden", "expert_voorstellen"];
const ZONES = ["nu", "binnenkort", "later"];
const URG = ["laag", "midden", "hoog"];

/** Haalt veilig een ChatAntwoord uit modeltekst. Geeft null als er geen bruikbare JSON in zit. */
export function parseChatAntwoord(raw: string): ChatAntwoord | null {
  let tekst = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const a = tekst.indexOf("{"), b = tekst.lastIndexOf("}");
  if (a === -1 || b <= a) return null;
  tekst = tekst.slice(a, b + 1);
  let o: any;
  try { o = JSON.parse(tekst); } catch { return null; }
  if (!o || typeof o.antwoord !== "string" || !o.antwoord.trim()) return null;
  const updates: TijdlijnUpdate[] = (Array.isArray(o.tijdlijn_updates) ? o.tijdlijn_updates : [])
    .filter((u: any) => u && ACTIES.includes(u.actie))
    .map((u: any) => ({
      actie: u.actie, taak_id: typeof u.taak_id === "string" ? u.taak_id : null,
      titel: String(u.titel ?? ""), uitleg: String(u.uitleg ?? ""),
      zone: ZONES.includes(u.zone) ? u.zone : "binnenkort", urgentie: URG.includes(u.urgentie) ? u.urgentie : "midden",
      fase: Number(u.fase) || 3, reden: String(u.reden ?? ""),
    }));
  return {
    antwoord: o.antwoord, tijdlijn_updates: updates,
    fase_aanpassing: Number.isInteger(o.fase_aanpassing) && o.fase_aanpassing >= 1 && o.fase_aanpassing <= 5 ? o.fase_aanpassing : null,
    vervolgvraag: typeof o.vervolgvraag === "string" && o.vervolgvraag.trim() ? o.vervolgvraag : null,
  };
}
