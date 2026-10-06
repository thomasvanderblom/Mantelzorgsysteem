"use client";
import { useStore } from "@/lib/store";
import { Footer } from "./Footer";

export function Welcome() {
  const { setStage, loadDemo } = useStore();
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-sage-700">Mantelzorg Navigator</p>
        <h1 className="text-3xl font-extrabold leading-tight text-sage-800 sm:text-5xl">
          Je hoeft dit niet alleen te doen.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">
          Zorgen voor een naaste met dementie voelt als een doolhof van loketten en formulieren.
          Wij maken er een persoonlijke tijdlijn van: wat regel je <strong>nu</strong>, <strong>binnenkort</strong> en <strong>later</strong>, en bij wie.
        </p>
        <ul className="mt-6 space-y-2 text-base">
          {["Tien korte vragen, ongeveer 3 minuten", "Een tijdlijn die past bij jouw situatie", "Een chatassistent die meedenkt en je tijdlijn bijwerkt", "Optioneel: een expert neemt papierwerk en bellen over"].map((t) => (
            <li key={t} className="flex gap-3"><span aria-hidden className="mt-1 text-sage-600">●</span>{t}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="btn-primary text-lg" onClick={() => setStage("intake")}>Start</button>
          <button className="btn-ghost" onClick={loadDemo}>Bekijk demo met Sanne</button>
        </div>
        <p className="mt-6 text-sm text-ink-soft">Er worden geen persoonsgegevens opgeslagen. Alles blijft in je eigen browser.</p>
      </main>
      <Footer />
    </div>
  );
}
