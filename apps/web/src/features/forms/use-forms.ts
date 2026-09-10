"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { formsApi, type FormStatus } from "@/features/forms/api";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

function useInvalidateForms() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
}

function reportError(error: unknown) {
  toast.error(error instanceof ApiError ? error.message : "Something went wrong");
}

export function useFormsList(search: string, status: FormStatus | "all") {
  return useQuery({
    queryKey: queryKeys.forms.list(search, status),
    queryFn: () => formsApi.list({ search, status: status === "all" ? undefined : status }),
    placeholderData: (previous) => previous,
  });
}

export function useCreateForm() {
  const router = useRouter();
  const invalidate = useInvalidateForms();

  return useMutation({
    mutationFn: formsApi.create,
    onSuccess: (form) => {
      invalidate();
      router.push(`/forms/${form.id}/build`);
    },
    onError: reportError,
  });
}

export function useRenameForm() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: ({ formId, title }: { formId: string; title: string }) =>
      formsApi.rename(formId, title),
    onSuccess: () => {
      invalidate();
      toast.success("Form renamed");
    },
    onError: reportError,
  });
}

export function useDuplicateForm() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: formsApi.duplicate,
    onSuccess: (form) => {
      invalidate();
      toast.success(`Duplicated as “${form.title}”`);
    },
    onError: reportError,
  });
}

export function useDeleteForm() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: formsApi.remove,
    onSuccess: () => {
      invalidate();
      toast.success("Form deleted");
    },
    onError: reportError,
  });
}

export function useCloseResponses() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: ({ formId, message }: { formId: string; message?: string }) =>
      formsApi.close(formId, message),
    onSuccess: () => {
      invalidate();
      toast.success("Responses closed");
    },
    onError: reportError,
  });
}
