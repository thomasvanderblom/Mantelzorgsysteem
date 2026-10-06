"use client";
import { useStore } from "@/lib/store";
import { Welcome } from "./Welcome";
import { Intake } from "./Intake";
import { Result } from "./Result";
import { Dashboard } from "./Dashboard";

export function App() {
  const { state, ready } = useStore();
  if (!ready) return <div className="p-8 text-ink-soft" aria-busy="true">Laden...</div>;
  switch (state.stage) {
    case "welcome": return <Welcome />;
    case "intake": return <Intake />;
    case "result": return <Result />;
    default: return <Dashboard />;
  }
}
