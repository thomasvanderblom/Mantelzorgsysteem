"use client";

/** Altijd zichtbaar expertblok: optioneel en betaald, de app zelf is het standaardproduct. */
export function ExpertBlock({ onOpen }: { onOpen: () => void }) {
  return (
    <section id="expert" aria-labelledby="expert-kop" className="scroll-mt-24 rounded-xl2 border border-accent-100 bg-accent-50 p-5 sm:p-7">
      <h2 id="expert-kop" className="text-2xl font-extrabold text-accent-700">Liever dat een expert dit voor je regelt?</h2>
      <p className="mt-1 max-w-2xl text-ink">Je hoeft niet alles zelf te doen. Een expert van Mantelzorg Navigator neemt het regelwerk uit je handen.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["💬", "Vragen beantwoorden", "Je stelt je vraag en krijgt een duidelijk antwoord van iemand die het stelsel kent."],
          ["📝", "Papierwerk en aanvragen", "Formulieren invullen en aanvragen indienen, bijvoorbeeld voor de Wmo of het CIZ."],
          ["📞", "Bellen met instanties", "De wachtrij in bij gemeente of zorgkantoor? Een expert belt voor je."],
        ].map(([icon, titel, tekst]) => (
          <li key={titel} className="rounded-xl bg-white p-4"><span aria-hidden className="text-2xl">{icon}</span><p className="mt-1 font-bold">{titel}</p><p className="text-ink-soft">{tekst}</p></li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button className="btn-accent text-lg" onClick={onOpen}>Vraag een expert</button>
        <p className="max-w-xl text-sm text-ink-soft">Optioneel en betaald, vanaf €XX per uur (voorbeeldbedrag in dit prototype). De app zelf is het standaardproduct: de tijdlijn en de chat gebruik je ook zonder expert.</p>
      </div>
    </section>
  );
}
