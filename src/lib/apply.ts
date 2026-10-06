import type { Fase, Task, TijdlijnUpdate } from "./types";

export interface ApplyResult {
  tasks: Task[];
  fase: Fase | null;
  changedIds: string[];
  summary: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
const isFase = (n: unknown): n is Fase => typeof n === "number" && [1, 2, 3, 4, 5].includes(n);

/**
 * Past de updates van de chatbot veilig toe op de tijdlijn.
 * - Dubbele taken (zelfde id of bijna dezelfde titel) worden niet opnieuw toegevoegd.
 * - Updates voor onbekende taken worden genegeerd (nooit crashen op modeloutput).
 */
export function applyUpdates(tasks: Task[], updates: TijdlijnUpdate[], faseAanpassing: number | null, huidigeFase: Fase): ApplyResult {
  let next = tasks.map((t) => ({ ...t }));
  const changed = new Set<string>();
  const now = Date.now();
  let added = 0, moved = 0, urg = 0, done = 0, expert = 0;

  const find = (u: TijdlijnUpdate) =>
    next.find((t) => (u.taak_id && t.id === u.taak_id) || (u.titel && norm(t.titel) === norm(u.titel)));
  const touch = (t: Task) => { t.aangepastDoorChat = true; t.gewijzigdOp = now; changed.add(t.id); };

  for (const u of updates) {
    const t = find(u);
    switch (u.actie) {
      case "toevoegen": {
        if (t || !u.titel) break; // bestaat al
        const nieuw: Task = {
          id: `chat-${now}-${added}`, titel: u.titel, uitleg: u.uitleg || "", waarom: u.reden || "Toegevoegd op basis van ons gesprek.",
          doorlooptijd: "Wordt in overleg bepaald", zone: u.zone ?? "binnenkort", urgentie: u.urgentie ?? "midden",
          status: "te_doen", fase: isFase(u.fase) ? u.fase : huidigeFase,
        };
        touch(nieuw); next = [nieuw, ...next]; added++; break;
      }
      case "verplaatsen": if (t && u.zone && t.zone !== u.zone) { t.zone = u.zone; if (u.reden) t.waarom = u.reden; touch(t); moved++; } break;
      case "urgentie_wijzigen": if (t && u.urgentie && t.urgentie !== u.urgentie) { t.urgentie = u.urgentie; touch(t); urg++; } break;
      case "afronden": if (t && t.status !== "klaar") { t.status = "klaar"; touch(t); done++; } break;
      case "expert_voorstellen": if (t && !t.expertVoorgesteld) { t.expertVoorgesteld = true; touch(t); expert++; } break;
    }
  }

  const fase = isFase(faseAanpassing) && faseAanpassing !== huidigeFase ? faseAanpassing : null;
  const delen: string[] = [];
  if (added) delen.push(`+${added} ${added === 1 ? "taak" : "taken"}`);
  if (moved) delen.push(`${moved} verplaatst`);
  if (urg) delen.push(`${urg} urgentie aangepast`);
  if (done) delen.push(`${done} afgerond`);
  if (expert) delen.push(`${expert} expert voorgesteld`);
  if (fase) delen.push(`fase aangepast naar ${fase}`);
  return { tasks: next, fase, changedIds: [...changed], summary: delen.join(", ") };
}
