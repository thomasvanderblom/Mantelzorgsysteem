"use client";
import { useEffect, useRef, useState } from "react";
import { applyUpdates } from "@/lib/apply";
import { demoAntwoord } from "@/lib/demoEngine";
import { useStore } from "@/lib/store";
import type { ChatAntwoord, ChatMessage } from "@/lib/types";
import { BronLinks } from "./BronLinks";

const CHIPS = ["Mijn moeder valt steeds vaker, wat nu?", "Hoe lang duurt een Wlz-indicatie?", "Ik ben overbelast, wat kan ik uit handen geven?"];
const uid = () => Math.random().toString(36).slice(2, 10);

export function Chat({ onShowChanges }: { onShowChanges: (ids: string[]) => void }) {
  const { state, setChat, applyChange, undo } = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // "demo" = gescripte antwoorden (geen API-sleutel), "live" = echte Claude-API. Wordt bij het laden van de server opgevraagd.
  const [modus, setModus] = useState<"laden" | "demo" | "live">("laden");
  const [toonBadge, setToonBadge] = useState(true);
  const [lastVraag, setLastVraag] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // Houd de nieuwste state vast: na het wachten op de API kan de gebruiker de tijdlijn al hebben aangepast.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try { if (localStorage.getItem("demo-badge-verborgen") === "1") setToonBadge(false); } catch { /* opslag niet beschikbaar */ }
    // Schakelt automatisch over naar de echte API zodra ANTHROPIC_API_KEY op de server is ingesteld.
    fetch("/api/chat").then((r) => r.json()).then((d) => setModus(d.live ? "live" : "demo")).catch(() => setModus("demo"));
  }, []);
  const zetBadge = (aan: boolean) => { setToonBadge(aan); try { localStorage.setItem("demo-badge-verborgen", aan ? "0" : "1"); } catch { /* negeren */ } };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [state.chat, loading, open]);

  /** Live: roept /api/chat aan. Demo: kiest een gescript scenario op basis van trefwoorden. */
  const vraagAntwoord = async (vraag: string, historie: ChatMessage[]): Promise<ChatAntwoord | null> => {
    const cur = stateRef.current;
    if (modus !== "live") {
      await new Promise((r) => setTimeout(r, 700)); // korte pauze zodat het natuurlijk aanvoelt
      const kanOngedaan = cur.chat.some((m) => m.wijzigingen?.undoId && !m.wijzigingen.ongedaan);
      return demoAntwoord(vraag, cur.tasks, cur.fase, kanOngedaan);
    }
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vraag, intake: cur.answers, fase: cur.fase, berichten: historie,
          tijdlijn: cur.tasks.map(({ id, titel, zone, urgentie, status, fase }) => ({ id, titel, zone, urgentie, status, fase })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (!data.antwoord) throw new Error("leeg");
      return data.antwoord as ChatAntwoord;
    } catch {
      return null;
    }
  };

  const send = async (vraag: string, retry = false) => {
    const tekst = vraag.trim();
    if (!tekst || loading || modus === "laden") return;
    setInput(""); setLastVraag(tekst); setLoading(true);
    const historie = state.chat.filter((m) => !m.fout);
    setChat((c) => [...c.filter((m) => !m.fout), ...(retry ? [] : [{ id: uid(), rol: "gebruiker" as const, tekst }])]);
    const antwoord = await vraagAntwoord(tekst, retry ? historie.slice(0, -1) : historie);
    setLoading(false);
    if (!antwoord) {
      setChat((c) => [...c, { id: uid(), rol: "assistent", fout: true, tekst: "Er ging iets mis bij het ophalen van mijn antwoord. Je tijdlijn is niet aangepast. Probeer het gerust nog een keer." }]);
      return;
    }
    // Demo-scenario "ongedaan maken": draai de laatste wijziging terug en toon alleen het antwoord.
    if ((antwoord as { ongedaan_maken?: boolean }).ongedaan_maken) {
      const laatste = [...stateRef.current.chat].reverse().find((m) => m.wijzigingen?.undoId && !m.wijzigingen.ongedaan);
      if (laatste?.wijzigingen?.undoId) undo(laatste.wijzigingen.undoId);
      setChat((c) => [...c, { id: uid(), rol: "assistent", tekst: antwoord.antwoord }]);
      return;
    }
    const res = applyUpdates(stateRef.current.tasks, antwoord.tijdlijn_updates, antwoord.fase_aanpassing, stateRef.current.fase);
    let wijzigingen: ChatMessage["wijzigingen"];
    if (res.summary) {
      const undoId = uid();
      applyChange(res.tasks, res.fase, undoId);
      wijzigingen = { tekst: res.summary, taakIds: res.changedIds, undoId };
    }
    setChat((c) => [...c, { id: uid(), rol: "assistent", tekst: antwoord.antwoord, wijzigingen, vervolgvraag: antwoord.vervolgvraag, bronnen: antwoord.bronnen }]);
  };

  const laatsteWijziging = [...state.chat].reverse().find((m) => m.wijzigingen)?.id;

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Open de chat met de assistent"
          className="btn-primary fixed bottom-4 right-4 z-40 !px-6 !py-3.5 text-lg shadow-lg">
          <span aria-hidden>💬</span> Stel een vraag
        </button>
      )}
      {open && (
        <aside role="dialog" aria-label="Chat met de assistent"
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(640px,calc(100vh-2rem))] sm:w-[400px] sm:rounded-xl2 sm:border sm:border-sand-200 sm:shadow-2xl">
          <div className="flex items-center justify-between rounded-t-xl2 bg-sage-700 px-4 py-3 text-white">
            <div><p className="font-extrabold">Assistent</p><p className="text-sm text-sage-100">Denkt met je mee en past je tijdlijn aan</p>
              {modus === "demo" && toonBadge && (
                <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold" title="Gescripte antwoorden. Stel ANTHROPIC_API_KEY in voor de echte assistent.">
                  Demo-modus
                  <button className="underline" onClick={() => zetBadge(false)} aria-label="Demo-modus indicator verbergen">verberg</button>
                </p>
              )}
              {modus === "demo" && !toonBadge && <button className="mt-1 block text-xs underline opacity-80" onClick={() => zetBadge(true)}>Demo-modus tonen</button>}
            </div>
            <button className="rounded-full px-3 py-1 text-xl hover:bg-sage-800" onClick={() => setOpen(false)} aria-label="Chat sluiten">✕</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {state.chat.length === 0 && (
              <div className="rounded-xl bg-sage-50 p-4">
                <p className="font-bold text-sage-800">Hoi, ik denk graag met je mee.</p>
                <p className="mt-1 text-ink-soft">Vertel wat er speelt, in je eigen woorden. Als er iets bijkomt of verandert, pas ik je tijdlijn aan.</p>
              </div>
            )}
            {state.chat.map((m) => (
              <div key={m.id} className={`flex ${m.rol === "gebruiker" ? "justify-end" : ""}`}>
                <div className={`anim-pop max-w-[90%] rounded-2xl px-4 py-2.5 ${m.rol === "gebruiker" ? "bg-sage-700 text-white" : m.fout ? "bg-accent-50 text-ink" : "bg-sand-50 text-ink"}`}>
                  <p className="whitespace-pre-wrap">{m.tekst}</p>
                  {m.fout && lastVraag && <button className="btn-accent btn-sm mt-2" onClick={() => send(lastVraag, true)} disabled={loading}>Opnieuw proberen</button>}
                  {m.wijzigingen && (
                    <div className="mt-3 rounded-xl border border-sage-300 bg-white p-3 text-sm">
                      <p className="font-bold text-sage-800">Ik heb je tijdlijn aangepast: {m.wijzigingen.tekst}{m.wijzigingen.ongedaan ? " (ongedaan gemaakt)" : ""}</p>
                      {!m.wijzigingen.ongedaan && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button className="btn-primary btn-sm" onClick={() => { onShowChanges(m.wijzigingen!.taakIds); if (window.innerWidth < 640) setOpen(false); }}>Bekijk wijzigingen</button>
                          {m.id === laatsteWijziging && m.wijzigingen.undoId && <button className="btn-ghost btn-sm" onClick={() => undo(m.wijzigingen!.undoId!)}>Ongedaan maken</button>}
                        </div>
                      )}
                    </div>
                  )}
                  {m.rol === "assistent" && !m.fout && <BronLinks ids={m.bronnen} className="mt-2" />}
                  {m.vervolgvraag && <p className="mt-2 font-semibold text-sage-800">{m.vervolgvraag}</p>}
                </div>
              </div>
            ))}
            {loading && <p className="rounded-2xl bg-sand-50 px-4 py-2.5 text-ink-soft" role="status">Ik denk met je mee…</p>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-sand-100 p-3">
            {state.chat.length === 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {CHIPS.map((c) => <button key={c} className="rounded-full border border-sand-200 bg-white px-3 py-1.5 text-left text-sm font-semibold text-sage-800 hover:bg-sage-50" onClick={() => send(c)} disabled={loading}>{c}</button>)}
              </div>
            )}
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <label className="flex-1"><span className="sr-only">Jouw vraag</span>
                <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Typ je vraag…" disabled={loading} /></label>
              <button className="btn-primary" type="submit" disabled={loading || !input.trim()}>Stuur</button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
}
