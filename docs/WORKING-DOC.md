# VoiceForm — Working Document

Build reference derived from the Figma file `MZ3i2NQfCqKazD94cUTsYy`.
Every screen listed below maps to a real frame in that file. Node IDs are included so you can
open the exact frame while building.

---

## 1. Product in one paragraph

Creators build forms by typing questions as usual. VoiceForm reads each question aloud to the
respondent and lets them answer by speaking. Speech is converted to text, shown back for review,
and submitted as a normal text response. Typing remains available at every step.

Two audiences, two entirely separate surfaces:

- **Creator** — authenticated. Builds forms, configures voice, publishes, reads responses.
- **Respondent** — anonymous by default. Opens a link, listens, speaks, reviews, submits.

---

## 2. Design tokens

Pulled from Figma variables. Already wired into `apps/web/tailwind.config.ts` and
`apps/web/src/styles/globals.css`.

| Token | Value | Tailwind |
|---|---|---|
| `--brand` | `#807dfe` | `bg-brand`, `text-brand` |
| `--brand-muted` | `#eeedff` | `bg-brand-muted` |
| `--text-primary` | `#01033e` | `text-content-primary` |
| `--text-secondary` | `#5d5d83` | `text-content-secondary` |
| `--text-placeholder` | `#9999b1` | `text-content-placeholder` |
| `--surface-page` | `#fdfdfd` | `bg-surface-page` |
| `--surface-card` | `#ffffff` | `bg-surface-card` |
| `--border-default` | `#e3e3e3` | `border-line` |
| `--border-strong` | `#c8c5c5` | `border-line-strong` |
| Shadow/Card | `0 8px 12px #807dfe14` | `shadow-card` |

**Type** — Manrope throughout.
Display/L 40/48/700 · Heading/XL 32/40/700 · Body L 18/24 · Body M 16/20 · Body S 14/20 ·
Label L/M/S 18/16/14 at 600.

**Radius** — 12px default (`--radius`), 24px on large cards, full on pills.

> **Known conflict.** The Figma contains two design generations. The older frames
> (`Dashboard - *`, original `Respondent Screen`, `Publish Form`, `View Response`) use a blue
> `#1877f2` accent. The newer frames (`Respondent - *`, `Modal - *`, auth, system, component
> specimens) use purple `#807dfe` with proper tokens. **Build against the purple set.** Where an
> old frame is the only reference for a screen, port it to the purple tokens.

---

## 3. Route map

### Marketing — `apps/web/src/app/(marketing)`

| Route | Frame | Notes |
|---|---|---|
| `/` | `1:3782` desktop, `1:4009` mobile | Hero, how-it-works (4 steps), feature grid (6), testimonial wall, FAQ, CTA, footer |
| `/help` | `1:5357` | Search field + FAQ accordion + footer |

### Auth — `apps/web/src/app/(auth)`

Shared layout: purple showcase panel left, form right. Frames `6:3095` onward.

| Route | Frame | Key behaviour |
|---|---|---|
| `/login` | `6:3095` | Email + password, remember me, Google, Apple |
| `/login` error state | `8:3207` | Inline banner + per-field error + attempts remaining |
| `/signup` | `8:3095` | Name, email, password, confirm, terms checkbox |
| `/forgot-password` | `9:3095` | Email only, always returns 202 |
| `/check-email` | `9:3174` | Resend countdown from 0:45 |
| `/reset-password` | `9:3250` | Live rule checklist: 8 chars, number+symbol, uppercase |
| `/password-updated` | `10:3095` | Success, link to log in |
| `/verify-email` | `10:3166` | 6-digit OTP, resend |

### Creator app — `apps/web/src/app/(app)`

| Route | Frame | Notes |
|---|---|---|
| `/forms` empty | `19:3095` | Three start options: blank, by voice, template |
| `/forms` grid | `21:3095` | Cards with Live/Draft/Closed pill, response count, overflow menu |
| `/forms/[id]/build` empty | `26:3406` | "No questions yet", Add question / Dictate questions |
| `/forms/[id]/build` | `26:3498`, `1:4208` | Question blocks, drag handles, floating add rail |
| `/forms/[id]/responses` empty | `32:3558` | Copy-link prompt |
| `/forms/[id]/responses` aggregate | `1:4843` | Pie chart per choice question |
| `/forms/[id]/responses/[rid]` | `32:3632` | Per-answer waveform + transcript, prev/next |
| `/forms/[id]/design` | `1:5192` | Theme colour, per-level typography, header image |
| `/forms/[id]/settings` | `1:5265` | Audio & voice, response, presentation |
| `/forms/[id]/share` | `27:3603` | Link / QR / Embed tabs + three toggles |
| `/forms/[id]/preview` | `1:4807` | Respondent flow with "Preview Mode" banner, nothing saved |

Left rail (`24:3231`): Questions · Responses · Design · Settings · Share, Help pinned bottom.

### Respondent — `apps/web/src/app/f/[slug]`

A state machine, not separate routes. Held in `stores/respondent-store.ts`.

| Step | Frame | Notes |
|---|---|---|
| `intro` | `28:3558` | Title, question count, duration, Start with voice / I prefer to type |
| `permission` | `28:3607` | Explains the browser prompt before triggering it |
| `blocked` | `28:3643` | 3-step recovery, Continue by typing |
| `question` idle | `1:4942` | Prompt, speaker icon, mic button |
| `recording` | `28:3694` | Live waveform, `Recording · 0:07`, Stop, Cancel |
| `processing` | `29:3558` | "Turning your answer into text…" |
| `not_recognised` | `29:3629` | 3 tips, Record again / Type instead |
| `type` | `29:3683` | Voice/Type toggle, textarea, char counter `104 / 500` |
| `required_error` | `29:3733` | Inline error, blocks Next |
| `review` | `1:4746` | Accordion per question, Re-record, Submit |
| `submitted` | `1:4773` | Confirmation + footer |

Dead ends: Form Closed `30:3558` · Link Invalid `30:3584` · Already Submitted `30:3608` ·
Limit Reached `30:3633`.

### System

404 `17:3095` · 500 `17:3124` (shows reference ID) · Offline `17:3156` (shows locally saved count).

---

## 4. Data model

Implemented in `apps/api/src/voiceform/db/models/`.

```
User ──< Form ──< Question ──< QuestionOption
             ├──  FormSettings   (1:1)
             ├──  FormTheme      (1:1)
             ├──< FormInvitation
             └──< FormResponse ──< Answer ──  AudioRecording (1:1)
                                      └──< FileUpload
```

**Question types** — `short_answer`, `paragraph`, `multiple_choice`, `checkboxes`, `dropdown`,
`date`, `rating`, `file_upload`. Type-specific config lives in `Question.config` (JSONB) so
adding a type never needs a migration.

**Key fields worth knowing**

- `Question.tts_audio_key` — cached synthesized audio. Cleared whenever the prompt changes.
- `AudioRecording.transcript_status` — `pending → processing → completed | failed | not_recognised`.
  Drives the respondent Processing and Not Recognised screens directly.
- `FormResponse.respondent_key` — device cookie hash backing "one response per person".
- `Answer.was_edited` — set when the respondent changes a transcript on the review screen.

---

## 5. API surface

Base `/v1`. Full generated spec at `http://localhost:8000/docs`.

**Auth** — `POST /auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`,
`/auth/verify-email`, `/auth/verify-email/resend`, `/auth/forgot-password`, `/auth/reset-password`

**Users** — `GET|PATCH /users/me`, `POST /users/me/password`

**Forms** — `GET|POST /forms`, `GET|PATCH|DELETE /forms/{id}`,
`POST /forms/{id}/duplicate|publish|close|reopen`, `PATCH /forms/{id}/settings|theme`,
`POST /forms/{id}/invitations`

**Questions** — `POST /forms/{id}/questions`, `PATCH|DELETE /forms/{id}/questions/{qid}`,
`POST /forms/{id}/questions/reorder`

**Responses (creator)** — `GET /forms/{id}/responses`, `/responses/overview`, `/responses/export`,
`GET /forms/{id}/responses/{rid}`, `DELETE /forms/{id}/responses`

**Responses (public)** — `POST /public/forms/{slug}/responses`,
`PUT /public/forms/{slug}/responses/{rid}/answers`,
`POST /public/forms/{slug}/responses/{rid}/submit`

**Speech** — `GET /speech/voices`, `GET /speech/questions/{qid}/audio`, `POST /speech/transcribe`,
`WS /speech/stream`

---

## 6. Voice pipeline

**Text to speech (question playback).**
Synthesized once per question on publish, not per respondent. Key is
`forms/{form_id}/tts/{question_id}/{voice_id}-{digest}.mp3` where digest hashes prompt + voice +
speed. Editing a prompt clears the key and the publish job regenerates it. This is the difference
between paying once per question and once per respondent — do not skip it.

**Speech to text (answers).**
Batch: respondent stops recording → upload to `POST /speech/transcribe` → Deepgram → store
transcript + confidence. Confidence below `0.4` or empty text routes to the Not Recognised screen.

Streaming (only when `show_live_transcription` is on): browser streams chunks over
`WS /speech/stream`, server proxies to Deepgram's live socket, interim results stream back.

**Audio formats.** Chrome gives webm/opus, Safari gives mp4/aac. Send raw to Deepgram — it handles
both. Do not transcode client-side.

---

## 7. Build order

1. **Foundation** — docker compose up, first migration, health endpoint green
2. **Auth** — all 8 screens end to end, Gmail SMTP wired
3. **Forms CRUD** — My Forms empty + grid, create, rename, duplicate, delete
4. **Builder** — question blocks, all 8 types, drag reorder, autosave
5. **Publish & share** — publish modal, slug link, QR, embed, invitations
6. **Respondent (typing only)** — full state machine, no audio yet
7. **Voice** — TTS caching, recording, batch transcription, review & edit
8. **Responses** — aggregate charts, individual view, CSV export
9. **Polish** — offline, system screens, live transcription, response digests

Steps 1–6 give a complete working product with typing. Voice layers on top without rework.

---

## 8. Deliberate decisions

- **Respondent stays anonymous.** Sign-in is opt-in per form (`require_sign_in`).
- **One response per person is a device cookie**, trivially bypassable. The Share modal already
  says so. Keep that copy honest.
- **Autosave, no save button.** Header chip shows `Saving…` / `All changes saved` (`26:3498`).
- **Answers persist as you go.** Offline screen promises it; `FormResponse` starts at first answer,
  not at submit.
- **Response alert emails are digested, not per-response.** Gmail SMTP caps at ~500/day and a
  200-response form would blow through it.
