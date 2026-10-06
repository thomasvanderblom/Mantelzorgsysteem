"use client";
import { FASE_NAMEN } from "@/lib/intake";
import { useStore } from "@/lib/store";

export function Header() {
  const { state, restartIntake, resetDemo } = useStore();
  const klaar = state.tasks.filter((t) => t.status === "klaar").length;
  const totaal = state.tasks.length;
  const pct = totaal ? Math.round((klaar / totaal) * 100) : 0;
  return (
    <header className="z-30 sm:sticky sm:top-0 border-b border-sand-100 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <p className="text-lg font-extrabold text-sage-800">Mantelzorg Navigator</p>
        <span className="chip bg-sage-100 text-sage-800">Fase {state.fase}: {FASE_NAMEN[state.fase]}</span>
        <div className="flex min-w-[180px] flex-1 items-center gap-3" aria-label={`${klaar} van ${totaal} taken klaar`}>
          <div className="h-2.5 max-w-xs flex-1 overflow-hidden rounded-full bg-sand-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Voortgang taken">
            <div className="h-full rounded-full bg-sage-600 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="whitespace-nowrap text-sm font-semibold text-ink-soft">{klaar} van {totaal} taken klaar</span>
        </div>
        <nav className="flex gap-2" aria-label="Acties">
          <button className="btn-ghost btn-sm" onClick={restartIntake}>Intake opnieuw doen</button>
          <button className="btn-ghost btn-sm" onClick={() => { if (confirm("Alles terugzetten naar de demo met Sanne?")) resetDemo(); }}>Demo resetten</button>
        </nav>
      </div>
    </header>
  );
}
