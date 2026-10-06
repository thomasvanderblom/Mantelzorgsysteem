"use client";
import { FASE_KERN, FASE_NAMEN, samenvatting } from "@/lib/intake";
import { useStore } from "@/lib/store";
import { Footer } from "./Footer";

export function Result() {
  const { state, setStage } = useStore();
  const { fase, answers, tasks } = state;
  const eerste = tasks.filter((t) => t.zone === "nu" && t.status !== "klaar").slice(0, 3);
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-sage-700">Dit is wat we zien</p>
        <h1 className="anim-pop mt-2 text-3xl font-extrabold text-sage-800 sm:text-4xl">
          Jij zit in fase {fase}: {FASE_NAMEN[fase]}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{FASE_KERN[fase]}</p>
        <ul className="card mt-6 space-y-2 p-5">
          {samenvatting(answers).map((r) => <li key={r} className="flex gap-3"><span aria-hidden className="text-sage-600">●</span>{r}</li>)}
        </ul>
        <h2 className="mt-8 text-xl font-extrabold text-sage-800">Je eerste 3 stappen</h2>
        <ol className="mt-3 space-y-3">
          {eerste.map((t, n) => (
            <li key={t.id} className="card flex gap-4 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 font-extrabold text-accent-700">{n + 1}</span>
              <div><p className="font-bold">{t.titel}</p><p className="text-ink-soft">{t.uitleg}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-ink-soft">Fases lopen door elkaar. Daarom zie je ook alvast taken uit de volgende fase in je tijdlijn.</p>
        <button className="btn-primary mt-6 text-lg" onClick={() => setStage("dashboard")}>Naar mijn overzicht</button>
      </main>
      <Footer />
    </div>
  );
}
