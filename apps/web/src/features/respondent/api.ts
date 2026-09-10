import { api } from "@/lib/api-client";
import type { QuestionType } from "@/features/builder/api";

export interface PublicOption {
  id: string;
  label: string;
}

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  help_text: string | null;
  position: number;
  is_required: boolean;
  options: PublicOption[];
}

export interface PublicFormSettings {
  read_questions_aloud: boolean;
  autoplay_audio: boolean;
  show_live_transcription: boolean;
  allow_review_and_edit: boolean;
  collect_respondent_email: boolean;
  show_progress_bar: boolean;
  all_questions_required: boolean;
}

export interface PublicForm {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: "draft" | "live" | "closed";
  closing_message: string | null;
  closed_at: string | null;
  questions: PublicQuestion[];
  settings: PublicFormSettings;
  theme: { primary_color: string };
}

export interface Answer {
  id: string;
  question_id: string;
  input_mode: "voice" | "text";
  text_value: string | null;
  selected_option_ids: string[];
  value: Record<string, unknown>;
  was_edited: boolean;
}

export interface ResponseSession {
  id: string;
  form_id: string;
  status: "in_progress" | "submitted" | "abandoned";
  answers: Answer[];
}

export interface AnswerInput {
  question_id: string;
  input_mode?: "voice" | "text";
  text_value?: string | null;
  selected_option_ids?: string[];
  value?: Record<string, unknown>;
  was_edited?: boolean;
}

export const respondentApi = {
  getForm: (slug: string) => api.get<PublicForm>(`/public/forms/${slug}`, { auth: false }),

  start: (slug: string, respondentKey: string) =>
    api.post<ResponseSession>(
      `/public/forms/${slug}/responses`,
      { respondent_key: respondentKey },
      { auth: false },
    ),

  saveAnswer: (slug: string, responseId: string, body: AnswerInput) =>
    api.put<Answer>(`/public/forms/${slug}/responses/${responseId}/answers`, body, {
      auth: false,
    }),

  submit: (slug: string, responseId: string, durationSeconds: number) =>
    api.post<ResponseSession>(
      `/public/forms/${slug}/responses/${responseId}/submit`,
      { duration_seconds: durationSeconds },
      { auth: false },
    ),
};

const DEVICE_KEY = "vf.device";

export function getDeviceKey() {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem(DEVICE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, key);
  }
  return key;
}
