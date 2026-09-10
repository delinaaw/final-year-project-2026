import { api } from "@/lib/api-client";
import type { QuestionType } from "@/features/builder/api";

export interface OptionBreakdown {
  option_id: string | null;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionSummary {
  question_id: string;
  prompt: string;
  type: QuestionType;
  response_count: number;
  breakdown: OptionBreakdown[];
  text_answers: string[];
  average_rating: number | null;
}

export interface ResponseOverview {
  form_id: string;
  total_responses: number;
  completion_rate: number;
  average_duration_seconds: number | null;
  summaries: QuestionSummary[];
}

export interface Recording {
  id: string;
  audio_url: string | null;
  duration_seconds: number | null;
  waveform_peaks: number[];
  transcript: string | null;
  transcript_status: string;
  transcript_confidence: number | null;
}

export interface ResponseAnswer {
  id: string;
  question_id: string;
  input_mode: "voice" | "text";
  text_value: string | null;
  selected_option_ids: string[];
  value: Record<string, unknown>;
  was_edited: boolean;
  recording: Recording | null;
}

export interface ResponseDetail {
  id: string;
  index: number;
  total: number;
  respondent_email: string | null;
  submitted_at: string | null;
  duration_seconds: number | null;
  primary_input_mode: "voice" | "text" | null;
  answers: ResponseAnswer[];
}

export const responsesApi = {
  overview: (formId: string) =>
    api.get<ResponseOverview>(`/forms/${formId}/responses/overview`),

  list: (formId: string, limit = 25, offset = 0) =>
    api.get<ResponseDetail[]>(`/forms/${formId}/responses?limit=${limit}&offset=${offset}`),

  get: (formId: string, responseId: string) =>
    api.get<ResponseDetail>(`/forms/${formId}/responses/${responseId}`),

  deleteAll: (formId: string) => api.delete<void>(`/forms/${formId}/responses`),
};
