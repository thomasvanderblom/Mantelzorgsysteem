"use client";
import { useState } from "react";
import type { Status, Task } from "@/lib/types";
import { useStore } from "@/lib/store";
import { BronLinks } from "./BronLinks";

const URG: Record<Task["urgentie"], { label: string; cls: string }> = {
  hoog: { label: "Urgentie hoog", cls: "bg-accent-50 text-accent-700" },
  midden: { label: "Urgentie midden", cls: "bg-mist-50 text-mist-600" },
  laag: { label: "Urgentie laag", cls: "bg-sage-50 text-sage-700" },
};
const STATUS_LABEL: Record<Status, string> = { te_doen: "Te doen", bezig: "Bezig", klaar: "Klaar", expert_bezig: "Expert bezig" };

export function TaskCard({ task, highlight, onExpert }: { task: Task; highlight: boolean; onExpert: (id: string) => void }) {
  const { updateTask } = useStore();
  const [open, setOpen] = useState(false);
  const klaar = task.status === "klaar";
  const toggle = () => updateTask(task.id, { status: klaar ? "te_doen" : "klaar" });

  return (
    <article id={`taak-${task.id}`}
      className={`card anim-pop p-4 ${highlight ? "anim-glow border-accent-600" : ""} ${klaar ? "opacity-70" : ""}`}
      aria-label={task.titel}>
      <div className="flex flex-wrap gap-1.5">
        <span className={`chip ${URG[task.urgentie].cls}`}>{URG[task.urgentie].label}</span>
        <span className={`chip ${task.status === "expert_bezig" ? "bg-accent-100 text-accent-700" : task.status === "klaar" ? "bg-sage-100 text-sage-800" : "bg-sand-100 text-ink-soft"}`}>{STATUS_LABEL[task.status]}</span>
        {task.aangepastDoorChat && <span className="chip bg-mist-100 text-mist-600">Aangepast door chat</span>}
        {task.expertVoorgesteld && task.status !== "expert_bezig" && <span className="chip bg-accent-50 text-accent-700">Expert voorgesteld</span>}
      </div>
      <h3 className={`mt-2 text-lg font-bold leading-snug ${klaar ? "line-through" : ""}`}>{task.titel}</h3>
      <p className="mt-1 text-base text-ink-soft">{task.uitleg}</p>
      <p className="mt-2 text-sm font-semibold text-ink-soft"><span aria-hidden>⏱ </span>Doorlooptijd: {task.doorlooptijd} <span className="font-normal">(indicatie)</span></p>

      <button className="mt-2 text-sm font-bold text-mist-600 underline underline-offset-2" aria-expanded={open} onClick={() => setOpen(!open)}>
        Waarom nu?
      </button>
      {open && (
        <div className="anim-pop mt-1 rounded-xl bg-sand-50 p-3 text-base">
          <p>{task.waarom}</p>
          <BronLinks ids={task.bronnen} className="mt-2" />
        </div>
      )}
      {task.expertVerzoek && <p className="mt-2 rounded-xl bg-accent-50 p-3 text-sm">Je expertaanvraag: {task.expertVerzoek.moment}. {task.expertVerzoek.toelichting}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={klaar ? "btn-ghost btn-sm" : "btn-primary btn-sm"} onClick={toggle} aria-pressed={klaar}>
          {klaar ? "Weer openen" : "Afvinken"}
        </button>
        {!klaar && task.status !== "expert_bezig" && <button className="btn-ghost btn-sm" onClick={() => onExpert(task.id)}>Laat expert dit doen</button>}
        {!klaar && task.status !== "expert_bezig" && (
          <label className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
            <span className="sr-only sm:not-sr-only">Status</span>
            <select className="rounded-lg border border-sand-200 bg-white px-2 py-1.5" value={task.status} aria-label={`Status van ${task.titel}`}
              onChange={(e) => updateTask(task.id, { status: e.target.value as Status })}>
              <option value="te_doen">Te doen</option><option value="bezig">Bezig</option><option value="klaar">Klaar</option>
            </select>
          </label>
        )}
      </div>
    </article>
  );
}
