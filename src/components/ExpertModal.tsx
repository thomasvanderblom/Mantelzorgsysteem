"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

const MOMENTEN = ["Zo snel mogelijk", "Deze week", "Volgende week", "In overleg"];

export function ExpertModal({ taakId, onClose }: { taakId: string | null; onClose: () => void }) {
  const { state, updateTask } = useStore();
  const open = state.tasks.filter((t) => t.status !== "klaar" && t.status !== "expert_bezig");
  const [id, setId] = useState(taakId ?? open[0]?.id ?? "");
  const [toelichting, setToelichting] = useState("");
  const [moment, setMoment] = useState(MOMENTEN[0]);
  const [verzonden, setVerzonden] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const taak = state.tasks.find((t) => t.id === id);

  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);

  const verstuur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taak) return;
    updateTask(taak.id, { status: "expert_bezig", expertVerzoek: { toelichting, moment }, aangepastDoorChat: false });
    setVerzonden(true);
  };

  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="expert-modal-kop"
      className="w-[calc(100%-2rem)] max-w-lg rounded-xl2 p-0 shadow-soft backdrop:bg-black/40">
      <div className="p-6">
        {verzonden ? (
          <div className="text-center">
            <p aria-hidden className="text-4xl">✅</p>
            <h2 id="expert-modal-kop" className="mt-2 text-2xl font-extrabold text-sage-800">Je aanvraag is verstuurd</h2>
            <p className="mt-2 text-ink-soft">Een expert neemt contact met je op ({moment.toLowerCase()}) over “{taak?.titel}”. In je tijdlijn staat deze taak nu op <strong>Expert bezig</strong>.</p>
            <button className="btn-primary mt-5" onClick={onClose}>Terug naar mijn overzicht</button>
          </div>
        ) : (
          <form onSubmit={verstuur} className="space-y-4">
            <h2 id="expert-modal-kop" className="text-2xl font-extrabold text-accent-700">Vraag een expert</h2>
            <p className="text-sm text-ink-soft">Optioneel en betaald (vanaf €XX per uur, voorbeeldbedrag). Je betaalt pas na overleg.</p>
            <label className="block"><span className="font-bold">Welke taak?</span>
              <select className="input mt-1" value={id} onChange={(e) => setId(e.target.value)} required>
                {open.map((t) => <option key={t.id} value={t.id}>{t.titel}</option>)}
              </select></label>
            <label className="block"><span className="font-bold">Korte toelichting</span>
              <textarea className="input mt-1 min-h-[96px]" value={toelichting} onChange={(e) => setToelichting(e.target.value)} placeholder="Wat wil je dat de expert voor je doet?" /></label>
            <label className="block"><span className="font-bold">Voorkeursmoment</span>
              <select className="input mt-1" value={moment} onChange={(e) => setMoment(e.target.value)}>{MOMENTEN.map((m) => <option key={m}>{m}</option>)}</select></label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={onClose}>Annuleren</button>
              <button type="submit" className="btn-accent" disabled={!taak}>Verstuur aanvraag</button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
