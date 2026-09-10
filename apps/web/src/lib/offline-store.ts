import Dexie, { type EntityTable } from "dexie";

export interface PendingAnswer {
  id: string;
  slug: string;
  responseId: string;
  questionId: string;
  inputMode: "voice" | "text";
  textValue: string | null;
  selectedOptionIds: string[];
  audioBlob: Blob | null;
  savedAt: number;
}

const db = new Dexie("voiceform") as Dexie & {
  pendingAnswers: EntityTable<PendingAnswer, "id">;
};

db.version(1).stores({
  pendingAnswers: "id, slug, responseId, questionId, savedAt",
});

export { db };

export async function savePendingAnswer(answer: PendingAnswer) {
  await db.pendingAnswers.put(answer);
}

export async function countPendingAnswers(slug: string) {
  return db.pendingAnswers.where("slug").equals(slug).count();
}

export async function drainPendingAnswers(slug: string) {
  const pending = await db.pendingAnswers.where("slug").equals(slug).sortBy("savedAt");
  return pending;
}

export async function clearPendingAnswer(id: string) {
  await db.pendingAnswers.delete(id);
}
