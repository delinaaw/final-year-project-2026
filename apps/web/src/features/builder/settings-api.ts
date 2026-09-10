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
