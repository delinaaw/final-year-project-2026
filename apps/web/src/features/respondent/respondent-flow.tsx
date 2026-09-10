"use client";

import { CheckCircle2, ClipboardList, Clock, Keyboard, Mic, Pencil, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AnswerInput, EMPTY_ANSWER, isAnswered, type AnswerValue } from "@/components/respondent/answer-input";
import { DeadEnd } from "@/components/respondent/dead-end";
import { ProgressHeader } from "@/components/respondent/progress-header";
import { PlayQuestionButton } from "@/components/respondent/play-question-button";
import { RespondentShell } from "@/components/respondent/respondent-shell";
import { VoiceRecorder, type VoiceStage } from "@/components/respondent/voice-recorder";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { respondentApi } from "@/features/respondent/api";
import { Button } from "@/components/ui/button";
import type { PublicQuestion } from "@/features/respondent/api";
import {
  usePublicForm,
  useSaveAnswer,
  useStartResponse,
  useSubmitResponse,
} from "@/features/respondent/use-respondent";
import { ApiError } from "@/lib/api-client";
import { formatRelativeDate } from "@/lib/utils";

type Stage = "intro" | "question" | "review" | "submitted";

function minutesLabel(count: number) {
  const minutes = Math.max(1, Math.round(count * 0.4));
  return `About ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function toPayload(question: PublicQuestion, value: AnswerValue) {
  if (question.type === "rating") {
    return { value: { rating: value.rating }, text_value: String(value.rating ?? "") };
  }
  if (["multiple_choice", "checkboxes", "dropdown"].includes(question.type)) {
    return { selected_option_ids: value.optionIds };
  }
  return { text_value: value.text.trim() };
}

export function RespondentFlow() {
  const slug = useParams<{ slug: string }>().slug;
  const { data: form, isPending, error } = usePublicForm(slug);

  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [requiredError, setRequiredError] = useState(false);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [voiceStage, setVoiceStage] = useState<VoiceStage>("idle");
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [blocked, setBlocked] = useState<ApiError | null>(null);
  const startedAt = useRef<number>(Date.now());

  const recorder = useAudioRecorder();
  const start = useStartResponse(slug);
  const saveAnswer = useSaveAnswer(slug, responseId);
  const submit = useSubmitResponse(slug, responseId);

  const questions = useMemo(() => form?.questions ?? [], [form]);
  const question = questions[index];
  const value = question ? (answers[question.id] ?? EMPTY_ANSWER) : EMPTY_ANSWER;

  if (isPending) {
    return (
      <RespondentShell>
        <span className="mt-24 size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </RespondentShell>
    );
  }

  if (error) {
    return (
      <DeadEnd
        title="This link does not work"
        body="The form may have been deleted, or the address may be incomplete. Check the link you were sent and try again."
        action={{ label: "Learn about VoiceForm", href: "/" }}
      />
    );
  }

  if (!form) return null;

  if (blocked?.code === "already_submitted") {
    return (
      <DeadEnd
        title="You have already answered this form"
        body="This form allows one response per person, so it cannot be filled in again."
        action={{ label: "Learn about VoiceForm", href: "/" }}
      />
    );
  }

  if (blocked?.code === "limit_reached") {
    return (
      <DeadEnd
        title="This form has reached its limit"
        body="The number of responses the creator set has been reached, so new answers are not being collected."
        action={{ label: "Learn about VoiceForm", href: "/" }}
      />
    );
  }

  if (form.status === "closed" || blocked?.code === "form_closed") {
    return (
      <DeadEnd
        title="This form is closed"
        body={
          form.closing_message ??
          `“${form.title}” is no longer accepting responses. Reach out to the person who shared it if you still need to take part.`
        }
        detail={form.closed_at ? `Closed on ${formatRelativeDate(form.closed_at)}` : undefined}
        action={{ label: "Learn about VoiceForm", href: "/" }}
      />
    );
  }

  const begin = () =>
    start.mutate(undefined, {
      onSuccess: (session) => {
        setResponseId(session.id);
        const restored: Record<string, AnswerValue> = {};
        for (const answer of session.answers) {
          restored[answer.question_id] = {
            text: answer.text_value ?? "",
            optionIds: answer.selected_option_ids,
            rating: (answer.value?.rating as number | undefined) ?? null,
          };
        }
        setAnswers(restored);
        startedAt.current = Date.now();
        setStage("question");
      },
      onError: (err) => {
        if (err instanceof ApiError) setBlocked(err);
        else toast.error("Could not start this form");
      },
    });

  const persist = (target: PublicQuestion, next: AnswerValue) =>
    saveAnswer.mutate({ question_id: target.id, input_mode: "text", ...toPayload(target, next) });

  const beginRecording = async () => {
    setVoiceStage("permission");
    const started = await recorder.start();
    setVoiceStage(started ? "recording" : "blocked");
  };

  const finishRecording = async () => {
    const result = await recorder.stop();
    if (!question || !responseId) {
      setVoiceStage("idle");
      return;
    }
    if (!result) {
      setVoiceStage("not_recognised");
      return;
    }

    setVoiceStage("processing");
    try {
      const outcome = await respondentApi.submitVoiceAnswer(
        slug,
        responseId,
        question.id,
        result.blob,
      );

      if (!outcome.recognised || !outcome.transcript) {
        setVoiceStage("not_recognised");
        return;
      }

      setTranscripts({ ...transcripts, [question.id]: outcome.transcript });
      setAnswers({
        ...answers,
        [question.id]: {
          text: outcome.transcript,
          optionIds: outcome.selected_option_ids,
          rating: outcome.rating,
        },
      });
      setRequiredError(false);

      if (outcome.needs_confirmation) {
        toast.info("We heard you, but could not match an option. Please pick one.");
        setMode("text");
        setVoiceStage("idle");
        return;
      }

      setVoiceStage("recorded");
    } catch {
      toast.error("Could not process that recording");
      setVoiceStage("not_recognised");
    }
  };

  const resetVoice = () => {
    recorder.cancel();
    setVoiceStage("idle");
  };

  const goNext = () => {
    if (!question) return;
    const required = question.is_required || form.settings.all_questions_required;

    if (required && !isAnswered(question, value)) {
      setRequiredError(true);
      return;
    }

    setRequiredError(false);
    if (isAnswered(question, value) && voiceStage !== "recorded") persist(question, value);

    resetVoice();
    setMode(form.settings.read_questions_aloud ? "voice" : "text");
    if (index < questions.length - 1) setIndex(index + 1);
    else setStage(form.settings.allow_review_and_edit ? "review" : "submitted");

    if (!form.settings.allow_review_and_edit && index === questions.length - 1) finish();
  };

  const finish = () =>
    submit.mutate(Math.round((Date.now() - startedAt.current) / 1000), {
      onSuccess: () => setStage("submitted"),
      onError: (err) => {
        if (err instanceof ApiError) {
          setBlocked(err);
          toast.error(err.message);
        }
      },
    });

  if (stage === "intro") {
    return (
      <RespondentShell>
        <div className="flex w-full max-w-[820px] flex-col items-center gap-6 rounded-2xl border border-line bg-surface-card px-6 py-10 text-center sm:px-10 sm:py-14">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-muted">
            <Mic className="size-7 text-brand" />
          </span>
          <h1 className="text-[26px] font-bold leading-8 text-content-primary sm:text-[32px] sm:leading-10">
            {form.title}
          </h1>
          {form.description ? (
            <p className="max-w-[560px] text-body-m leading-6 text-content-secondary">
              {form.description}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: ClipboardList, label: `${questions.length} questions` },
              { icon: Clock, label: minutesLabel(questions.length) },
              { icon: Save, label: "Answers saved as you go" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="flex items-center gap-2 rounded-full bg-surface-subtle px-3.5 py-2 text-body-s text-content-secondary"
              >
                <chip.icon className="size-4" />
                {chip.label}
              </span>
            ))}
          </div>

          <Button size="lg" onClick={begin} disabled={start.isPending || questions.length === 0}>
            {start.isPending ? "Starting…" : "Start answering"}
          </Button>
          <p className="text-[12px] text-content-placeholder">
            Your microphone is only used while you are answering a question.
          </p>
        </div>
      </RespondentShell>
    );
  }

  if (stage === "submitted") {
    return (
      <RespondentShell>
        <div className="flex w-full max-w-[620px] flex-col items-center gap-5 rounded-2xl border border-line bg-surface-card px-6 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-feedback-success-subtle">
            <CheckCircle2 className="size-8 text-feedback-success" />
          </span>
          <h1 className="text-[24px] font-bold uppercase leading-8 text-content-primary sm:text-[28px]">
            Form submitted successfully
          </h1>
          <p className="text-body-m leading-6 text-content-secondary">
            Thank you for your response. Your answers have been successfully submitted.
          </p>
        </div>
      </RespondentShell>
    );
  }

  if (stage === "review") {
    return (
      <RespondentShell>
        <div className="flex w-full max-w-[820px] flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[24px] font-bold leading-8 text-content-primary sm:text-[28px]">
              {form.title}
            </h1>
            <p className="text-body-m text-content-secondary">
              Confirm your responses before submitting.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-card p-5 sm:p-6">
            <h2 className="text-body-l font-semibold text-content-primary">
              Review your answers before submission
            </h2>

            {questions.map((entry, position) => {
              const entryValue = answers[entry.id] ?? EMPTY_ANSWER;
              const labels = entry.options
                .filter((option) => entryValue.optionIds.includes(option.id))
                .map((option) => option.label);
              const shown =
                entry.type === "rating"
                  ? entryValue.rating
                    ? `${entryValue.rating} of 5`
                    : ""
                  : labels.length > 0
                    ? labels.join(", ")
                    : entryValue.text;

              return (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-xl border border-line px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-body-m font-semibold text-content-primary">
                      {entry.prompt}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIndex(position);
                        setStage("question");
                      }}
                      className="focus-ring flex shrink-0 items-center gap-1.5 rounded text-body-s font-semibold text-content-link"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                  <p className="text-body-m text-content-secondary">
                    {shown || <span className="text-content-placeholder">No answer</span>}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setIndex(questions.length - 1);
                setStage("question");
              }}
            >
              Back
            </Button>
            <Button size="lg" onClick={finish} disabled={submit.isPending}>
              {submit.isPending ? "Submitting…" : "Submit Form"}
            </Button>
          </div>
        </div>
      </RespondentShell>
    );
  }

  if (!question) return null;

  const supportsVoice = question.type !== "file_upload";

  const matchedLabel =
    question.type === "rating"
      ? value.rating
        ? `${value.rating} of 5`
        : null
      : question.options
            .filter((option) => value.optionIds.includes(option.id))
            .map((option) => option.label)
            .join(", ") || null;

  return (
    <RespondentShell>
      <div className="flex w-full max-w-[820px] flex-col gap-6">
        {form.settings.show_progress_bar ? (
          <ProgressHeader current={index + 1} total={questions.length} />
        ) : null}

        <div className="flex flex-col gap-6 rounded-2xl border border-line bg-surface-card p-5 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[20px] font-bold leading-7 text-content-primary sm:text-[24px] sm:leading-8">
              {question.prompt}
              {question.is_required ? <span className="ml-1 text-feedback-error">*</span> : null}
            </h1>
            {form.settings.read_questions_aloud ? (
              <PlayQuestionButton
                slug={slug}
                questionId={question.id}
                autoPlay={form.settings.autoplay_audio}
              />
            ) : null}
          </div>

          {requiredError ? (
            <p
              role="alert"
              className="rounded-xl bg-feedback-error-subtle px-4 py-3 text-body-s text-feedback-error"
            >
              This question is required. Type an answer before moving on.
            </p>
          ) : null}

          {supportsVoice ? (
            <div className="flex w-fit gap-1 rounded-xl bg-surface-subtle p-1">
              {(["voice", "text"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMode(option);
                    if (option === "text") resetVoice();
                  }}
                  aria-pressed={mode === option}
                  className={`focus-ring flex h-9 items-center gap-2 rounded-lg px-4 text-body-s font-semibold transition-colors ${
                    mode === option
                      ? "bg-surface-card text-content-primary"
                      : "text-content-secondary"
                  }`}
                >
                  {option === "voice" ? (
                    <Mic className="size-4" />
                  ) : (
                    <Keyboard className="size-4" />
                  )}
                  {option === "voice" ? "Voice" : "Type"}
                </button>
              ))}
            </div>
          ) : null}

          {supportsVoice && mode === "voice" ? (
            <VoiceRecorder
              stage={voiceStage}
              recorderState={recorder.state}
              elapsed={recorder.elapsed}
              peaks={recorder.peaks}
              transcript={transcripts[question.id] ?? null}
              matchedLabel={matchedLabel}
              onStart={beginRecording}
              onStop={finishRecording}
              onCancel={resetVoice}
              onRetry={() => {
                resetVoice();
                void beginRecording();
              }}
              onSwitchToTyping={() => {
                setMode("text");
                resetVoice();
              }}
            />
          ) : (
            <AnswerInput
              question={question}
              value={value}
              onChange={(next) => {
                setAnswers({ ...answers, [question.id]: next });
                setRequiredError(false);
              }}
            />
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setRequiredError(false);
                if (index > 0) setIndex(index - 1);
                else setStage("intro");
              }}
            >
              Back
            </Button>
            <Button onClick={goNext} disabled={submit.isPending}>
              {index < questions.length - 1 ? "Next question" : "Review answers"}
            </Button>
          </div>
        </div>
      </div>
    </RespondentShell>
  );
}
