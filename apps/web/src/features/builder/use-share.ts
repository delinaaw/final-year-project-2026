"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  settingsApi,
  type FormSettings,
  type PublishOptions,
} from "@/features/builder/settings-api";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

function reportError(error: unknown) {
  toast.error(error instanceof ApiError ? error.message : "Something went wrong");
}

export function useUpdateSettings(formId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<FormSettings>) => settingsApi.update(formId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) }),
    onError: reportError,
  });
}

export function usePublish(formId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PublishOptions) => settingsApi.publish(formId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
    onError: reportError,
  });
}

export function useInvite(formId: string) {
  return useMutation({
    mutationFn: (emails: string[]) => settingsApi.invite(formId, emails),
    onSuccess: (result) =>
      toast.success(`Invitation sent to ${result.sent} ${result.sent === 1 ? "person" : "people"}`),
    onError: reportError,
  });
}
