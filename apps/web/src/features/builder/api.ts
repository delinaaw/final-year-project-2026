import { api } from "@/lib/api-client";
import type { FormStatus } from "@/features/forms/api";
import type { FormSettings, FormTheme } from "@/features/builder/settings-api";

export type QuestionType =
  | "short_answer"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "date"
  | "rating"
  | "file_upload";

export interface QuestionOption {
  id: string;
  label: string;
  position: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  help_text: string | null;
  position: number;
  is_required: boolean;
  config: Record<string, unknown>;
  options: QuestionOption[];
}

export type { FormSettings, FormTheme } from "@/features/builder/settings-api";

export interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: FormStatus;
  questions: Question[];
  settings: FormSettings;
  theme: FormTheme;
  updated_at: string;
}

export interface QuestionInput {
  type: QuestionType;
  prompt?: string;
  help_text?: string | null;
  is_required?: boolean;
  config?: Record<string, unknown>;
  options?: { id?: string; label: string }[];
}

export const builderApi = {
  get: (formId: string) => api.get<FormDetail>(`/forms/${formId}`),

  updateForm: (formId: string, body: { title?: string; description?: string }) =>
    api.patch<FormDetail>(`/forms/${formId}`, body),

  addQuestion: (formId: string, body: QuestionInput) =>
    api.post<Question>(`/forms/${formId}/questions`, body),

  updateQuestion: (formId: string, questionId: string, body: Partial<QuestionInput>) =>
    api.patch<Question>(`/forms/${formId}/questions/${questionId}`, body),

  deleteQuestion: (formId: string, questionId: string) =>
    api.delete<void>(`/forms/${formId}/questions/${questionId}`),

  reorder: (formId: string, questionIds: string[]) =>
    api.post<Question[]>(`/forms/${formId}/questions/reorder`, { question_ids: questionIds }),

  publish: (formId: string) =>
    api.post<{ form: FormDetail; respondent_url: string }>(`/forms/${formId}/publish`, {}),
};

export const QUESTION_TYPES: { value: QuestionType; label: string; needsOptions: boolean }[] = [
  { value: "multiple_choice", label: "Multiple Choice", needsOptions: true },
  { value: "checkboxes", label: "Checkboxes", needsOptions: true },
  { value: "dropdown", label: "Dropdown", needsOptions: true },
  { value: "short_answer", label: "Short Answer", needsOptions: false },
  { value: "paragraph", label: "Long Answer", needsOptions: false },
  { value: "date", label: "Date", needsOptions: false },
  { value: "rating", label: "Rating", needsOptions: false },
  { value: "file_upload", label: "File Upload", needsOptions: false },
];

export function needsOptions(type: QuestionType) {
  return QUESTION_TYPES.find((entry) => entry.value === type)?.needsOptions ?? false;
}
