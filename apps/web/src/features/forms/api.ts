import { api } from "@/lib/api-client";

export type FormStatus = "draft" | "live" | "closed";

export interface FormSummary {
  id: string;
  title: string;
  slug: string;
  status: FormStatus;
  response_count: number;
  question_count: number;
  updated_at: string;
}

export interface FormDetail extends FormSummary {
  description: string | null;
  published_at: string | null;
  closed_at: string | null;
  closing_message: string | null;
}

export const formsApi = {
  list: (params: { search?: string; status?: FormStatus }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    const suffix = query.toString();
    return api.get<FormSummary[]>(`/forms${suffix ? `?${suffix}` : ""}`);
  },

  create: (body: { title?: string; description?: string }) =>
    api.post<FormDetail>("/forms", body),

  rename: (formId: string, title: string) => api.patch<FormDetail>(`/forms/${formId}`, { title }),

  duplicate: (formId: string) => api.post<FormDetail>(`/forms/${formId}/duplicate`),

  remove: (formId: string) => api.delete<void>(`/forms/${formId}`),

  close: (formId: string, closing_message?: string) =>
    api.post<FormDetail>(`/forms/${formId}/close`, { closing_message }),

  reopen: (formId: string) => api.post<FormDetail>(`/forms/${formId}/reopen`),
};
