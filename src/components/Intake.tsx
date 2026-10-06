"use client";
import { useState } from "react";
import { QUESTIONS } from "@/lib/intake";
import { useStore } from "@/lib/store";
import type { Answers } from "@/lib/types";
import { Footer } from "./Footer";

export function Intake() {
  const { finishIntake, setStage } = useStore();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const q = QUESTIONS[i];
  const current = answers[q.id];
  const selected = (id: string) => (Array.isArray(current) ? current.includes(id) : current === id);
  const hasAnswer = Array.isArray(current) ? current.length > 0 : !!current;

  const pick = (id: string) => {
    if (q.multi) {
      let list = Array.isArray(current) ? [...current] : [];
      // "geen/niets" sluit andere keuzes uit en andersom.
      const exclusief = id === "geen" || id === "niets";
      if (list.includes(id)) list = list.filter((x) => x !== id);
      else list = exclusief ? [id] : [...list.filter((x) => x !== "geen" && x !== "niets"), id];
      setAnswers({ ...answers, [q.id]: list });
    } else {
      setAnswers({ ...answers, [q.id]: id });
    }
  };
  const next = () => (i === QUESTIONS.length - 1 ? finishIntake(answers) : setI(i + 1));
  const back = () => (i === 0 ? setStage("welcome") : setI(i - 1));
  const pct = Math.round(((i + 1) / QUESTIONS.length) * 100);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="mb-2 flex justify-between text-sm font-semibold text-ink-soft">
          <span>Vraag {i + 1} van {QUESTIONS.length}</span><span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sand-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Voortgang intake">
          <div className="h-full rounded-full bg-sage-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <fieldset className="mt-8" key={q.id}>
          <legend className="anim-pop text-2xl font-extrabold text-sage-800">{q.vraag}</legend>
          {q.hint && <p className="mt-2 text-ink-soft">{q.hint}</p>}
          <div className="mt-5 grid gap-3" role={q.multi ? "group" : "radiogroup"}>
            {q.opties.map((o) => (
              <button key={o.id} type="button" role={q.multi ? "checkbox" : "radio"} aria-checked={selected(o.id)}
                onClick={() => pick(o.id)}
                className={`flex min-h-[56px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-semibold transition-colors ${selected(o.id) ? "border-sage-600 bg-sage-50 text-sage-800" : "border-sand-200 bg-white hover:bg-sand-50"}`}>
                <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 text-sm ${q.multi ? "rounded-md" : "rounded-full"} ${selected(o.id) ? "border-sage-600 bg-sage-600 text-white" : "border-sand-200"}`}>{selected(o.id) ? "✓" : ""}</span>
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-8 flex justify-between">
          <button className="btn-ghost" onClick={back}>Vorige</button>
          <button className="btn-primary" disabled={!hasAnswer} onClick={next}>{i === QUESTIONS.length - 1 ? "Bekijk mijn resultaat" : "Volgende"}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
