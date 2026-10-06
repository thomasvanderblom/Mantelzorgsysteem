"use client";
import { useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import { Header } from "./Header";
import { Timeline } from "./Timeline";
import { Footer } from "./Footer";

export function Dashboard() {
  const { state } = useStore();
  const [highlight, setHighlight] = useState<string[]>([]);
  const [expertTaak, setExpertTaak] = useState<string | null>(null);

  /** Scrolt naar de tijdlijn en laat de gewijzigde kaarten even oplichten. */
  const toonWijzigingen = useCallback((ids: string[]) => {
    document.getElementById("tijdlijn")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(ids);
    setTimeout(() => setHighlight([]), 5000);
  }, []);
  void toonWijzigingen; void expertTaak;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-6">
        <Timeline tasks={state.tasks} highlight={highlight} onExpert={setExpertTaak} />
      </main>
      <Footer />
    </div>
  );
}
