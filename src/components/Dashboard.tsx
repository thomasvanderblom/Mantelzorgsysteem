"use client";
import { useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import { Header } from "./Header";
import { Timeline } from "./Timeline";
import { Footer } from "./Footer";
import { Knowledge } from "./Knowledge";
import { Chat } from "./Chat";
import { ExpertBlock } from "./ExpertBlock";
import { ExpertModal } from "./ExpertModal";

export function Dashboard() {
  const { state } = useStore();
  const [highlight, setHighlight] = useState<string[]>([]);
  const [expertTaak, setExpertTaak] = useState<string | null>(null);
  const [expertOpen, setExpertOpen] = useState(false);
  const openExpert = (id: string | null) => { setExpertTaak(id); setExpertOpen(true); };

  /** Scrolt naar de tijdlijn en laat de gewijzigde kaarten even oplichten. */
  const toonWijzigingen = useCallback((ids: string[]) => {
    document.getElementById("tijdlijn")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(ids);
    setTimeout(() => setHighlight([]), 5000);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-6">
        <Timeline tasks={state.tasks} highlight={highlight} onExpert={openExpert} />
        <ExpertBlock onOpen={() => openExpert(null)} />
        <Knowledge />
      </main>
      <Footer />
      <Chat onShowChanges={toonWijzigingen} />
      {expertOpen && <ExpertModal taakId={expertTaak} onClose={() => setExpertOpen(false)} />}
    </div>
  );
}
