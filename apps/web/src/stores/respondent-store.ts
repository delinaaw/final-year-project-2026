import { create } from "zustand";

export type RespondentStep =
  | "intro"
  | "permission"
  | "blocked"
  | "question"
  | "recording"
  | "processing"
  | "not_recognised"
  | "review"
  | "submitted";

interface RespondentState {
  step: RespondentStep;
  questionIndex: number;
  inputMode: "voice" | "text";
  responseId: string | null;
  setStep: (step: RespondentStep) => void;
  setQuestionIndex: (index: number) => void;
  setInputMode: (mode: "voice" | "text") => void;
  setResponseId: (id: string | null) => void;
  reset: () => void;
}

const initial = {
  step: "intro" as RespondentStep,
  questionIndex: 0,
  inputMode: "voice" as const,
  responseId: null,
};

export const useRespondentStore = create<RespondentState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setQuestionIndex: (questionIndex) => set({ questionIndex }),
  setInputMode: (inputMode) => set({ inputMode }),
  setResponseId: (responseId) => set({ responseId }),
  reset: () => set(initial),
}));
