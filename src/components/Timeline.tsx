"use client";
import type { Task, Zone } from "@/lib/types";
import { TaskCard } from "./TaskCard";

const ZONES: { id: Zone; titel: string; sub: string; dot: string }[] = [
  { id: "nu", titel: "Nu", sub: "Dit pak je als eerste op", dot: "bg-accent-600" },
  { id: "binnenkort", titel: "Binnenkort", sub: "De komende weken", dot: "bg-sage-600" },
  { id: "later", titel: "Later", sub: "Goed om alvast te weten", dot: "bg-mist-600" },
];

/** De persoonlijke tijdlijn: drie zones, naast elkaar op desktop en onder elkaar op mobiel. */
export function Timeline({ tasks, highlight, onExpert }: { tasks: Task[]; highlight: string[]; onExpert: (id: string) => void }) {
  return (
    <section id="tijdlijn" aria-labelledby="tijdlijn-kop" className="scroll-mt-24">
      <h2 id="tijdlijn-kop" className="text-2xl font-extrabold text-sage-800 sm:text-3xl">Jouw persoonlijke tijdlijn</h2>
      <p className="mt-1 text-ink-soft">Je hoeft niet alles tegelijk. Begin bij <strong>Nu</strong>, de rest volgt vanzelf.</p>
      <div className="relative mt-5 grid gap-6 md:grid-cols-3">
        {ZONES.map((z) => {
          const lijst = tasks.filter((t) => t.zone === z.id).sort((a, b) => Number(a.status === "klaar") - Number(b.status === "klaar"));
          return (
            <div key={z.id} className="rounded-xl2 bg-sand-50 p-3 sm:p-4" aria-label={`Zone ${z.titel}`}>
              <div className="mb-3 flex items-center gap-3">
                <span aria-hidden className={`h-4 w-4 rounded-full ring-4 ring-white ${z.dot}`} />
                <div className="flex-1"><h3 className="text-xl font-extrabold leading-none">{z.titel}</h3><p className="text-sm text-ink-soft">{z.sub}</p></div>
                <span className="chip bg-white text-ink-soft">{lijst.length}</span>
              </div>
              <div className="space-y-3">
                {lijst.map((t) => <TaskCard key={`${t.id}-${t.gewijzigdOp ?? 0}`} task={t} highlight={highlight.includes(t.id)} onExpert={onExpert} />)}
                {lijst.length === 0 && <p className="rounded-xl bg-white p-4 text-ink-soft">Niets in deze zone. Mooi zo.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
