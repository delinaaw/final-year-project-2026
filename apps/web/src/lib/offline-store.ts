import Dexie, { type EntityTable } from "dexie";

export interface PendingAnswer {
  id: string;
  slug: string;
  responseId: string;
  questionId: string;
  inputMode: "voice" | "text";
  textValue: string | null;
  selectedOptionIds: string[];
  value: Record<string, unknown>;
  savedAt: number;
}

const db = new Dexie("voiceform") as Dexie & {
  pendingAnswers: EntityTable<PendingAnswer, "id">;
};

db.version(1).stores({
  pendingAnswers: "id, slug, responseId, questionId, savedAt",
});

export { db };

export async function savePendingAnswer(answer: Omit<PendingAnswer, "id" | "savedAt">) {
  await db.pendingAnswers.put({
    ...answer,
    id: `${answer.responseId}:${answer.questionId}`,
    savedAt: Date.now(),
  });
}

export async function countPendingAnswers(slug: string) {
  return db.pendingAnswers.where("slug").equals(slug).count();
}

export async function drainPendingAnswers(slug: string) {
  return db.pendingAnswers.where("slug").equals(slug).sortBy("savedAt");
}

export async function clearPendingAnswer(id: string) {
  await db.pendingAnswers.delete(id);
}
