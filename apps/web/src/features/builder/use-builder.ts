"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  builderApi,
  type FormDetail,
  type Question,
  type QuestionInput,
} from "@/features/builder/api";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useBuilderStore } from "@/stores/builder-store";

function reportError(error: unknown) {
  toast.error(error instanceof ApiError ? error.message : "Something went wrong");
}

export function useForm(formId: string) {
  return useQuery({
    queryKey: queryKeys.forms.detail(formId),
    queryFn: () => builderApi.get(formId),
  });
}

function useTrackedMutation() {
  const queryClient = useQueryClient();
  const setSaveState = useBuilderStore((state) => state.setSaveState);

  return {
    queryClient,
    onMutate: () => setSaveState("saving"),
    onSettled: (formId: string, error: unknown) => {
      setSaveState(error ? "error" : "saved");
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    },
  };
}

export function useUpdateForm(formId: string) {
  const { onMutate, onSettled } = useTrackedMutation();

  return useMutation({
    mutationFn: (body: { title?: string; description?: string }) =>
      builderApi.updateForm(formId, body),
    onMutate,
    onError: reportError,
    onSettled: (_data, error) => onSettled(formId, error),
  });
}

export function useAddQuestion(formId: string) {
  const { onMutate, onSettled } = useTrackedMutation();
  const setActiveQuestion = useBuilderStore((state) => state.setActiveQuestion);

  return useMutation({
    mutationFn: (body: QuestionInput) => builderApi.addQuestion(formId, body),
    onMutate,
    onSuccess: (question) => setActiveQuestion(question.id),
    onError: reportError,
    onSettled: (_data, error) => onSettled(formId, error),
  });
}

export function useUpdateQuestion(formId: string) {
  const { onMutate, onSettled } = useTrackedMutation();

  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: string; body: Partial<QuestionInput> }) =>
      builderApi.updateQuestion(formId, questionId, body),
    onMutate,
    onError: reportError,
    onSettled: (_data, error) => onSettled(formId, error),
  });
}

export function useDeleteQuestion(formId: string) {
  const { onMutate, onSettled } = useTrackedMutation();

  return useMutation({
    mutationFn: (questionId: string) => builderApi.deleteQuestion(formId, questionId),
    onMutate,
    onError: reportError,
    onSettled: (_data, error) => onSettled(formId, error),
  });
}

export function useReorderQuestions(formId: string) {
  const { queryClient, onMutate, onSettled } = useTrackedMutation();

  return useMutation({
    mutationFn: (questionIds: string[]) => builderApi.reorder(formId, questionIds),
    onMutate: async (questionIds) => {
      onMutate();
      const key = queryKeys.forms.detail(formId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FormDetail>(key);

      if (previous) {
        const byId = new Map(previous.questions.map((q) => [q.id, q]));
        const reordered = questionIds
          .map((id, index) => {
            const question = byId.get(id);
            return question ? { ...question, position: index } : null;
          })
          .filter((q): q is Question => q !== null);
        queryClient.setQueryData(key, { ...previous, questions: reordered });
      }

      return { previous };
    },
    onError: (error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.forms.detail(formId), context.previous);
      }
      reportError(error);
    },
    onSettled: (_data, error) => onSettled(formId, error),
  });
}

