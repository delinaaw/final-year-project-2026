"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Link2, MessageSquare, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AnswerDistribution } from "@/components/responses/answer-distribution";
import { AudioAnswer } from "@/components/responses/audio-answer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "@/features/builder/use-builder";
import { responsesApi } from "@/features/responses/api";
import { env } from "@/lib/env";
import { queryKeys } from "@/lib/query-keys";
import { getAccessToken } from "@/lib/session";
import { formatRelativeDate } from "@/lib/utils";

type View = "summary" | "individual";

export function ResponsesPage() {
  const formId = useParams<{ formId: string }>().formId;
  const queryClient = useQueryClient();
  const { data: form } = useForm(formId);

  const [view, setView] = useState<View>("summary");
  const [position, setPosition] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const overview = useQuery({
    queryKey: queryKeys.forms.overview(formId),
    queryFn: () => responsesApi.overview(formId),
  });

  const list = useQuery({
    queryKey: [...queryKeys.forms.responses(formId), position],
    queryFn: () => responsesApi.list(formId, 1, position),
    enabled: view === "individual",
  });

  const detail = useQuery({
    queryKey: [...queryKeys.forms.responses(formId), "detail", list.data?.[0]?.id],
    queryFn: () => responsesApi.get(formId, list.data![0]!.id),
    enabled: view === "individual" && Boolean(list.data?.[0]),
  });

  const removeAll = useMutation({
    mutationFn: () => responsesApi.deleteAll(formId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      toast.success("All responses deleted");
      setConfirmDelete(false);
      setView("summary");
    },
    onError: () => toast.error("Could not delete the responses"),
  });

  const exportCsv = async () => {
    const token = await getAccessToken();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/v1/forms/${formId}/responses/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      toast.error("Could not export responses");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${form?.slug ?? "responses"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (overview.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const total = overview.data?.total_responses ?? 0;

  if (total === 0) {
    const url = `${env.NEXT_PUBLIC_APP_URL}/f/${form?.slug ?? ""}`;
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-muted">
          <MessageSquare className="size-7 text-brand" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-[26px] font-bold leading-8 text-content-primary sm:text-[28px]">
            No responses yet
          </h1>
          <p className="text-body-m text-content-secondary">
            Once people start answering, their responses and summaries appear here.
          </p>
        </div>
        <div className="flex w-full max-w-[520px] flex-col gap-2.5 sm:flex-row">
          <span className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-line bg-surface-card px-4 text-body-s text-content-primary">
            <span className="truncate">{url}</span>
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(url);
              toast.success("Link copied");
            }}
          >
            <Link2 className="size-4" />
            Copy link
          </Button>
        </div>
      </div>
    );
  }

  const response = detail.data;

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-6 sm:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold leading-8 text-content-primary sm:text-[28px]">
            {total} {total === 1 ? "response" : "responses"}
          </h1>
          {overview.data?.average_duration_seconds ? (
            <p className="text-body-s text-content-secondary">
              Average time to complete {Math.round(overview.data.average_duration_seconds)}s
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-surface-subtle p-1">
            {(["summary", "individual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                className={`focus-ring h-9 rounded-lg px-4 text-body-s font-semibold transition-colors ${
                  view === option
                    ? "bg-surface-card text-content-primary"
                    : "text-content-secondary"
                }`}
              >
                {option === "summary" ? "Summary" : "Individual"}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete all responses"
            className="text-feedback-error hover:bg-feedback-error-subtle"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {view === "summary" ? (
        <div className="flex flex-col gap-5">
          {overview.data?.summaries.map((summary) => (
            <section
              key={summary.question_id}
              className="flex flex-col gap-5 rounded-2xl border border-line bg-surface-card p-5 sm:p-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-body-l font-semibold text-content-primary">
                  {summary.prompt}
                </h2>
                <p className="text-body-s text-content-secondary">
                  {summary.response_count}{" "}
                  {summary.response_count === 1 ? "response" : "responses"}
                  {summary.average_rating !== null
                    ? ` · average ${summary.average_rating} of 5`
                    : ""}
                </p>
              </div>

              {summary.breakdown.length > 0 ? (
                <AnswerDistribution data={summary.breakdown} />
              ) : summary.text_answers.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {summary.text_answers.slice(0, 10).map((answer, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-line bg-surface-page px-4 py-3 text-body-m text-content-primary"
                    >
                      {answer}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-s text-content-placeholder">No answers yet</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-body-l font-semibold text-content-primary">
                Response {response?.index ?? position + 1} of {total}
              </h2>
              {response?.submitted_at ? (
                <p className="text-body-s text-content-secondary">
                  Submitted {formatRelativeDate(response.submitted_at)}
                  {response.duration_seconds ? ` · ${response.duration_seconds}s` : ""}
                  {response.primary_input_mode
                    ? ` · answered by ${response.primary_input_mode}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                aria-label="Previous response"
                disabled={position === 0}
                onClick={() => setPosition(position - 1)}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Next response"
                disabled={position >= total - 1}
                onClick={() => setPosition(position + 1)}
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {form?.questions.map((question) => {
            const answer = response?.answers.find((a) => a.question_id === question.id);
            const labels = question.options
              .filter((option) => answer?.selected_option_ids.includes(option.id))
              .map((option) => option.label);

            return (
              <section
                key={question.id}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-card p-5 sm:p-6"
              >
                <h3 className="text-body-l font-semibold text-content-primary">
                  {question.prompt}
                </h3>

                {answer?.recording ? <AudioAnswer recording={answer.recording} /> : null}

                {answer?.recording?.transcript ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-content-placeholder">
                      Transcript
                    </span>
                    <p className="text-body-m leading-6 text-content-primary">
                      {answer.recording.transcript}
                    </p>
                  </div>
                ) : (
                  <p className="text-body-m text-content-primary">
                    {labels.join(", ") ||
                      answer?.text_value || (
                        <span className="text-content-placeholder">No answer</span>
                      )}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader
            title="Delete all responses?"
            description={`All ${total} responses for this form will be permanently deleted. This cannot be undone.`}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => removeAll.mutate()}
              disabled={removeAll.isPending}
            >
              {removeAll.isPending ? "Deleting…" : "Delete all"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
