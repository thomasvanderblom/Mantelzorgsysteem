import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/chatPrompt";
import { parseChatAntwoord } from "@/lib/chatParse";
import { bouwBronContext } from "@/lib/retrieval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Laat de client weten of de echte API beschikbaar is (sleutel ingesteld) of dat de demo-modus moet draaien. */
export async function GET() {
  return NextResponse.json({ live: !!process.env.ANTHROPIC_API_KEY });
}

/**
 * Chat-endpoint. De API-sleutel (ANTHROPIC_API_KEY) blijft server-side.
 * Verwacht: { vraag, intake, fase, tijdlijn, berichten }. Geeft: { antwoord | fout }.
 */
export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ fout: "geen_sleutel" }, { status: 503 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ fout: "ongeldig" }, { status: 400 }); }
  const { vraag, intake, fase, tijdlijn, berichten } = body ?? {};
  if (typeof vraag !== "string" || !vraag.trim()) return NextResponse.json({ fout: "ongeldig" }, { status: 400 });

  // Context bij elk verzoek: intake, fase, volledige tijdlijn en de laatste ~10 berichten.
  // Retrieval: de best passende fragmenten uit kennisbank en takenbibliotheek, met bron-id's.
  const bronContext = bouwBronContext(String(vraag), Number(fase) as 1 | 2 | 3 | 4 | 5);
  const context = `${bronContext}\n\nIntakeprofiel: ${JSON.stringify(intake)}\nHuidige fase: ${fase}\nHuidige tijdlijn (JSON): ${JSON.stringify(tijdlijn)}`;
  const historie = (Array.isArray(berichten) ? berichten : []).slice(-10)
    .map((m: any) => ({ role: m.rol === "gebruiker" ? "user" as const : "assistant" as const, content: String(m.tekst).slice(0, 4000) }));
  // Bericht-beurten moeten afwisselen; begin met een gebruiker.
  while (historie.length && historie[0].role !== "user") historie.shift();
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of historie) {
    if (messages.length && messages[messages.length - 1].role === m.role) messages[messages.length - 1].content += "\n" + m.content;
    else messages.push(m);
  }
  if (messages.length && messages[messages.length - 1].role === "user") messages.pop();
  messages.push({ role: "user", content: `${context}\n\nVraag van de gebruiker: ${vraag.slice(0, 2000)}` });

  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages,
    });
    const tekst = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const antwoord = parseChatAntwoord(tekst);
    if (!antwoord) {
      // Fallback als het model geen geldige JSON gaf: toon de ruwe tekst zonder tijdlijnwijzigingen.
      return NextResponse.json({ antwoord: { antwoord: tekst.trim() || "Sorry, ik kon geen antwoord maken.", tijdlijn_updates: [], fase_aanpassing: null, vervolgvraag: null } });
    }
    return NextResponse.json({ antwoord });
  } catch (e) {
    console.error("Chat-API fout:", e instanceof Error ? e.message : e);
    return NextResponse.json({ fout: "api_fout" }, { status: 502 });
  }
}
