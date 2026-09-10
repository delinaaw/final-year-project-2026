export const queryKeys = {
  session: ["session"] as const,
  forms: {
    all: ["forms"] as const,
    list: (search?: string, status?: string) => ["forms", "list", search, status] as const,
    detail: (formId: string) => ["forms", formId] as const,
    responses: (formId: string) => ["forms", formId, "responses"] as const,
    overview: (formId: string) => ["forms", formId, "overview"] as const,
  },
  respondent: {
    form: (slug: string) => ["respondent", slug] as const,
    session: (slug: string) => ["respondent", slug, "session"] as const,
  },
  voices: ["voices"] as const,
} as const;
