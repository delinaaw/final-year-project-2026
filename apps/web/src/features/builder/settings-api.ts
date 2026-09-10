import { api } from "@/lib/api-client";

export type AudienceType = "anyone_with_link" | "invited_only";
export type VoiceSpeed = "slow" | "normal" | "fast";

export interface FormSettings {
  read_questions_aloud: boolean;
  autoplay_audio: boolean;
  voice_id: string;
  voice_speed: VoiceSpeed;
  show_live_transcription: boolean;
  collect_respondent_email: boolean;
  allow_review_and_edit: boolean;
  require_sign_in: boolean;
  one_response_per_person: boolean;
  audience: AudienceType;
  response_limit: number | null;
  show_progress_bar: boolean;
  shuffle_questions: boolean;
  all_questions_required: boolean;
  notify_on_response: boolean;
}

export interface PublishOptions {
  audience: AudienceType;
  read_questions_aloud: boolean;
  show_live_transcription: boolean;
  allow_review_and_edit: boolean;
}

export interface FormTheme {
  primary_color: string;
  header_font: string;
  header_size: number;
  question_font: string;
  question_size: number;
  body_font: string;
  body_size: number;
  header_image_key: string | null;
}

export const themeApi = {
  update: (formId: string, body: Partial<FormTheme>) =>
    api.patch<FormTheme>(`/forms/${formId}/theme`, body),

  headerUrl: (formId: string) =>
    api.get<{ url: string | null }>(`/forms/${formId}/theme/header`),

  uploadHeader: (formId: string, file: File) => {
    const body = new FormData();
    body.append("image", file);
    return api.post<FormTheme>(`/forms/${formId}/theme/header`, body);
  },

  removeHeader: (formId: string) =>
    api.delete<FormTheme>(`/forms/${formId}/theme/header`),
};

export const settingsApi = {
  update: (formId: string, body: Partial<FormSettings>) =>
    api.patch<FormSettings>(`/forms/${formId}/settings`, body),

  publish: (formId: string, body: PublishOptions) =>
    api.post<{ form: { id: string; slug: string; status: string }; respondent_url: string }>(
      `/forms/${formId}/publish`,
      body,
    ),

  invite: (formId: string, emails: string[]) =>
    api.post<{ sent: number }>(`/forms/${formId}/invitations`, { emails }),
};
