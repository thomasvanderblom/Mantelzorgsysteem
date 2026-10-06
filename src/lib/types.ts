// Gedeelde types voor de hele app.

export type Zone = "nu" | "binnenkort" | "later";
export type Urgentie = "laag" | "midden" | "hoog";
export type Status = "te_doen" | "bezig" | "klaar" | "expert_bezig";
export type Fase = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  titel: string;
  uitleg: string;
  waarom: string; // "Waarom nu?"
  doorlooptijd: string; // bijv. "2-4 weken"
  zone: Zone;
  urgentie: Urgentie;
  status: Status;
  fase: Fase;
  /** Markering voor visuele feedback in de tijdlijn. */
  aangepastDoorChat?: boolean;
  /** Tijdstempel (ms) van de laatste wijziging, voor het kort laten oplichten. */
  gewijzigdOp?: number;
  /** De chatbot stelde voor om hier een expert voor in te schakelen. */
  expertVoorgesteld?: boolean;
  /** Id's uit het bronnenregister (zie bronnen.ts). */
  bronnen?: string[];
  expertVerzoek?: { toelichting: string; moment: string };
}

export type Answers = Record<string, string | string[]>;

export interface ChatMessage {
  id: string;
  rol: "gebruiker" | "assistent";
  tekst: string;
  /** Samenvatting van tijdlijnwijzigingen bij een assistent-bericht. */
  wijzigingen?: { tekst: string; taakIds: string[]; undoId: string | null; ongedaan?: boolean };
  vervolgvraag?: string | null;
  bronnen?: string[];
  fout?: boolean;
}

export type TijdlijnUpdate = {
  actie: "toevoegen" | "verplaatsen" | "urgentie_wijzigen" | "afronden" | "expert_voorstellen";
  taak_id: string | null;
  titel: string;
  uitleg: string;
  zone: Zone;
  urgentie: Urgentie;
  fase: number;
  reden: string;
  bronnen?: string[];
};

export interface ChatAntwoord {
  antwoord: string;
  tijdlijn_updates: TijdlijnUpdate[];
  fase_aanpassing: number | null;
  vervolgvraag: string | null;
  /** Bron-id's waar het antwoord op steunt. */
  bronnen?: string[];
}

export type Stage = "welcome" | "intake" | "result" | "dashboard";

export interface UndoEntry {
  id: string;
  tasks: Task[];
  fase: Fase;
}

export interface AppState {
  stage: Stage;
  answers: Answers;
  fase: Fase;
  tasks: Task[];
  chat: ChatMessage[];
  undo: UndoEntry[];
}
