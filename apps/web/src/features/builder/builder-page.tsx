"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Mic, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteQuestionDialog } from "@/components/builder/delete-question-dialog";
import { DictateDialog } from "@/components/builder/dictate-dialog";
import { EmptyBuilder } from "@/components/builder/empty-builder";
import { FormHeaderCard } from "@/components/builder/form-header-card";
import { QuestionCard } from "@/components/builder/question-card";
import { Button } from "@/components/ui/button";
import type { Question } from "@/features/builder/api";
import {
  useAddQuestion,
  useDeleteQuestion,
  useForm,
  useReorderQuestions,
  useUpdateForm,
  useUpdateQuestion,
} from "@/features/builder/use-builder";
import { useBuilderStore } from "@/stores/builder-store";

export function BuilderPage() {
  const formId = useParams<{ formId: string }>().formId;
  const { data: form, isPending } = useForm(formId);

  const activeQuestionId = useBuilderStore((state) => state.activeQuestionId);
  const setActiveQuestion = useBuilderStore((state) => state.setActiveQuestion);
  const [deleting, setDeleting] = useState<Question | null>(null);
  const [dictating, setDictating] = useState(false);

  const updateForm = useUpdateForm(formId);
  const addQuestion = useAddQuestion(formId);
  const updateQuestion = useUpdateQuestion(formId);
  const deleteQuestion = useDeleteQuestion(formId);
  const reorder = useReorderQuestions(formId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (isPending || !form) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const questions = form.questions;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = [...questions];
    const [moved] = next.splice(oldIndex, 1);
    if (moved) next.splice(newIndex, 0, moved);
    reorder.mutate(next.map((q) => q.id));
  };

  const addBlank = () =>
    addQuestion.mutate({
      type: "multiple_choice",
      prompt: "",
      options: [{ label: "Option 1" }],
    });

  return (
    <div className="mx-auto flex w-full max-w-[1136px] flex-1 flex-col gap-5 px-4 py-6 sm:px-8 lg:px-[120px] lg:py-9">
      <FormHeaderCard
        title={form.title}
        description={form.description}
        onChange={(body) => updateForm.mutate(body)}
      />

      {questions.length === 0 ? (
        <EmptyBuilder
          onAddQuestion={addBlank}
          onDictate={() => setDictating(true)}
          isPending={addQuestion.isPending}
        />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    isActive={activeQuestionId === question.id}
                    onActivate={() => setActiveQuestion(question.id)}
                    onChange={(body) =>
                      updateQuestion.mutate({ questionId: question.id, body })
                    }
                    onDelete={() => setDeleting(question)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            variant="secondary"
            size="lg"
            onClick={addBlank}
            disabled={addQuestion.isPending}
            className="w-full border-dashed sm:w-[220px]"
          >
            <Plus className="size-[18px]" />
            Add question
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setDictating(true)}
            className="w-full sm:w-[220px]"
          >
            <Mic className="size-[18px]" />
            Dictate questions
          </Button>
        </>
      )}

      <DictateDialog formId={formId} open={dictating} onOpenChange={setDictating} />

      <DeleteQuestionDialog
        question={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        isPending={deleteQuestion.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteQuestion.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
