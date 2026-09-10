"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  settingsApi,
  themeApi,
  type FormSettings,
  type FormTheme,
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

export function useUpdateTheme(formId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<FormTheme>) => themeApi.update(formId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) }),
    onError: reportError,
  });
}

export function useHeaderImage(formId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.forms.detail(formId), "header"] });
  };

  const upload = useMutation({
    mutationFn: (file: File) => themeApi.uploadHeader(formId, file),
    onSuccess: () => {
      invalidate();
      toast.success("Header image updated");
    },
    onError: reportError,
  });

  const remove = useMutation({
    mutationFn: () => themeApi.removeHeader(formId),
    onSuccess: () => {
      invalidate();
      toast.success("Header image removed");
    },
    onError: reportError,
  });

  return { upload, remove };
}
