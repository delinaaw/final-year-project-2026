"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getDeviceKey, respondentApi, type AnswerInput } from "@/features/respondent/api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicForm(slug: string) {
  return useQuery({
    queryKey: queryKeys.respondent.form(slug),
    queryFn: () => respondentApi.getForm(slug),
    retry: false,
  });
}

export function useStartResponse(slug: string) {
  return useMutation({
    mutationFn: () => respondentApi.start(slug, getDeviceKey()),
  });
}

export function useSaveAnswer(slug: string, responseId: string | null) {
  return useMutation({
    mutationFn: (body: AnswerInput) => {
      if (!responseId) throw new Error("No response started");
      return respondentApi.saveAnswer(slug, responseId, body);
    },
  });
}

export function useSubmitResponse(slug: string, responseId: string | null) {
  return useMutation({
    mutationFn: (durationSeconds: number) => {
      if (!responseId) throw new Error("No response started");
      return respondentApi.submit(slug, responseId, durationSeconds);
    },
  });
}
