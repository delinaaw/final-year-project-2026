import { create } from "zustand";

export type BuilderPanel = "none" | "design" | "settings" | "share";
export type SaveState = "idle" | "saving" | "saved" | "error";

interface BuilderState {
  activeQuestionId: string | null;
  panel: BuilderPanel;
  saveState: SaveState;
  setActiveQuestion: (id: string | null) => void;
  setPanel: (panel: BuilderPanel) => void;
  setSaveState: (state: SaveState) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  activeQuestionId: null,
  panel: "none",
  saveState: "idle",
  setActiveQuestion: (activeQuestionId) => set({ activeQuestionId }),
  setPanel: (panel) => set({ panel }),
  setSaveState: (saveState) => set({ saveState }),
}));
