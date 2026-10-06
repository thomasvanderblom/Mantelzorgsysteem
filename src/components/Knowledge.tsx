"use client";
import { useMemo, useState } from "react";
import { FASE_NAMEN } from "@/lib/intake";
import { KENNIS } from "@/lib/knowledge";
import { useStore } from "@/lib/store";
import type { Fase } from "@/lib/types";
import { BronLinks } from "./BronLinks";
import { LAATST_GECONTROLEERD } from "@/lib/bronnen";

const FASES: Fase[] = [1, 2, 3, 4, 5];

/** Kennisbank per fase, doorzoekbaar over alle fases. */
export function Knowledge() {
  const { state } = useStore();
  const [tab, setTab] = useState<Fase>(state.fase);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  // Bij zoeken tonen we per fase alleen de onderdelen die iets bevatten.
  const treffers = useMemo(() => {
    if (!query) return null;
    const m = (s: string) => s.toLowerCase().includes(query);
    return FASES.flatMap((f) => {
      const k = KENNIS[f];
      const items = [
        ...(m(k.uitleg) ? [{ soort: "Uitleg", tekst: k.uitleg }] : []),
        ...k.instanties.filter((i) => m(i.naam + " " + i.rol)).map((i) => ({ soort: "Instantie", tekst: `${i.naam}: ${i.rol}` })),
        ...k.documenten.filter(m).map((d) => ({ soort: "Document", tekst: d })),
        ...k.fouten.filter(m).map((d) => ({ soort: "Veelgemaakte fout", tekst: d })),
        ...k.doorlooptijden.filter((d) => m(d.wat + " " + d.duur)).map((d) => ({ soort: "Doorlooptijd", tekst: `${d.wat}: ${d.duur}` })),
      ];
      return items.length ? [{ fase: f, items }] : [];
    });
  }, [query]);

  const k = KENNIS[tab];
  return (
    <section id="kennisbank" aria-labelledby="kennis-kop" className="scroll-mt-24">
      <h2 id="kennis-kop" className="text-2xl font-extrabold text-sage-800">Kennisbank</h2>
      <p className="mt-1 text-ink-soft">Uitleg per fase, in gewone taal.</p>
      <label className="mt-4 block">
        <span className="sr-only">Zoek in de kennisbank</span>
        <input type="search" className="input max-w-xl" placeholder="Zoek bijv. CIZ, volmacht of dagbesteding" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      {treffers ? (
        <div className="mt-4 space-y-4" aria-live="polite">
          {treffers.length === 0 && <p className="card p-4 text-ink-soft">Geen resultaten voor “{q}”. Probeer een ander woord of vraag het aan de chat.</p>}
          {treffers.map((t) => (
            <div key={t.fase} className="card p-4">
              <h3 className="font-extrabold text-sage-800">Fase {t.fase}: {FASE_NAMEN[t.fase]}</h3>
              <ul className="mt-2 space-y-2">{t.items.map((i, n) => <li key={n}><span className="chip mr-2 bg-sand-100 text-ink-soft">{i.soort}</span>{i.tekst}</li>)}</ul>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Fases" className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {FASES.map((f) => (
              <button key={f} role="tab" aria-selected={tab === f} onClick={() => setTab(f)}
                className={`btn btn-sm shrink-0 ${tab === f ? "bg-sage-700 text-white" : "bg-white border border-sand-200 text-sage-800 hover:bg-sand-50"}`}>
                {f}. {FASE_NAMEN[f]}{state.fase === f ? " (jij)" : ""}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="card mt-4 grid gap-6 p-5 md:grid-cols-2">
            <p className="text-lg md:col-span-2">{k.uitleg}</p>
            <div>
              <h3 className="font-extrabold text-sage-800">Belangrijkste instanties</h3>
              <dl className="mt-2 space-y-2">{k.instanties.map((i) => <div key={i.naam}><dt className="font-bold">{i.naam}</dt><dd className="text-ink-soft">{i.rol}</dd></div>)}</dl>
            </div>
            <div className="space-y-5">
              <div><h3 className="font-extrabold text-sage-800">Documenten die je nodig hebt</h3><ul className="mt-2 list-disc space-y-1 pl-5">{k.documenten.map((d) => <li key={d}>{d}</li>)}</ul></div>
              <div><h3 className="font-extrabold text-sage-800">Veelgemaakte fouten</h3><ul className="mt-2 list-disc space-y-1 pl-5">{k.fouten.map((d) => <li key={d}>{d}</li>)}</ul></div>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-extrabold text-sage-800">Doorlooptijden (indicatie)</h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">{k.doorlooptijden.map((d) => <li key={d.wat} className="rounded-xl bg-sand-50 p-3"><span className="font-bold">{d.wat}</span><br /><span className="text-ink-soft">{d.duur}</span></li>)}</ul>
            </div>
            <div className="border-t border-sand-100 pt-4 md:col-span-2">
              <BronLinks ids={k.bronnen} />
              <p className="mt-1 text-xs text-ink-soft">Deze uitleg is een samenvatting in gewone taal. Bronnen nagelopen op {LAATST_GECONTROLEERD}. Controleer termijnen en regels altijd bij de bron.</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
