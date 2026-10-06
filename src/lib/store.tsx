"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Answers, AppState, ChatMessage, Fase, Stage, Task } from "./types";
import { bepaalFase } from "./intake";
import { SANNE_ANSWERS, genereerTaken, seedTaken } from "./seed";

const KEY = "mantelzorg-navigator-v1";

const demoState = (stage: Stage): AppState => ({
  stage, answers: SANNE_ANSWERS, fase: 3, tasks: seedTaken(), chat: [], undo: [],
});

interface Ctx {
  state: AppState;
  ready: boolean;
  setStage: (s: Stage) => void;
  finishIntake: (a: Answers) => void;
  loadDemo: () => void;
  resetDemo: () => void;
  restartIntake: () => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setChat: (fn: (c: ChatMessage[]) => ChatMessage[]) => void;
  /** Vervangt taken/fase (bijv. door de chatbot) en bewaart een snapshot voor ongedaan maken. */
  applyChange: (tasks: Task[], fase: Fase | null, undoId: string) => void;
  undo: (undoId: string) => void;
}

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore buiten StoreProvider");
  return c;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => demoState("welcome"));
  const [ready, setReady] = useState(false);

  // Laden uit localStorage (alleen in de browser, na hydratatie). Bij fouten starten we met de demo.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && Array.isArray(parsed.tasks) && parsed.stage) setState(parsed);
      }
    } catch { /* corrupte opslag: gewoon doorgaan met de demo */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* opslag vol of geblokkeerd */ }
  }, [state, ready]);

  const setStage = useCallback((stage: Stage) => setState((s) => ({ ...s, stage })), []);
  const finishIntake = useCallback((answers: Answers) => {
    const fase = bepaalFase(answers);
    setState((s) => ({ ...s, answers, fase, tasks: genereerTaken(answers, fase), chat: [], undo: [], stage: "result" }));
  }, []);
  const loadDemo = useCallback(() => setState(demoState("result")), []);
  const resetDemo = useCallback(() => setState(demoState("welcome")), []);
  const restartIntake = useCallback(() => setState((s) => ({ ...s, stage: "intake" })), []);
  const updateTask = useCallback((id: string, patch: Partial<Task>) =>
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, gewijzigdOp: Date.now() } : t)) })), []);
  const setChat = useCallback((fn: (c: ChatMessage[]) => ChatMessage[]) => setState((s) => ({ ...s, chat: fn(s.chat) })), []);
  const applyChange = useCallback((tasks: Task[], fase: Fase | null, undoId: string) =>
    setState((s) => ({ ...s, undo: [...s.undo, { id: undoId, tasks: s.tasks, fase: s.fase }].slice(-10), tasks, fase: fase ?? s.fase })), []);
  const undo = useCallback((undoId: string) =>
    setState((s) => {
      const e = s.undo.find((u) => u.id === undoId);
      if (!e) return s;
      return {
        ...s, tasks: e.tasks, fase: e.fase, undo: s.undo.filter((u) => u.id !== undoId),
        chat: s.chat.map((m) => (m.wijzigingen?.undoId === undoId ? { ...m, wijzigingen: { ...m.wijzigingen, ongedaan: true } } : m)),
      };
    }), []);

  const value = useMemo(
    () => ({ state, ready, setStage, finishIntake, loadDemo, resetDemo, restartIntake, updateTask, setChat, applyChange, undo }),
    [state, ready, setStage, finishIntake, loadDemo, resetDemo, restartIntake, updateTask, setChat, applyChange, undo],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
