# Setup — every key, in order

Work top to bottom. At the end run `pnpm api:check`, which tests every credential against the
real service and tells you exactly what is missing.

**Total cost to get started: $0.** Every service below has a free tier that covers development.
Cloudflare R2 is the only one that asks for a card, and it will not charge you at our volume.

---

## Checklist

| # | Key | Where from | Cost | Needed by |
|---|---|---|---|---|
| 1 | `SECRET_KEY` | generate locally | free | day one |
| 2 | Postgres + Redis | docker compose | free | day one |
| 3 | R2 keys ×3 | Cloudflare | free (card required) | day one |
| 4 | `SMTP_PASSWORD` | Gmail App Password | free | phase 2 (auth) |
| 5 | `DEEPGRAM_API_KEY` | Deepgram | free $200 credit | phase 7 (voice) |
| 6 | `ELEVENLABS_API_KEY` | ElevenLabs | free 10k chars/mo | phase 7 (voice) |
| 7 | Google OAuth ×2 | Google Cloud | free | phase 2 (auth) |
| 8 | `ANTHROPIC_API_KEY` | Anthropic | pay as you go | phase 9 (summaries) |

Apple Sign In is parked — not in this list.

---

## 0. Toolchain

```bash
brew install node pnpm uv docker
```

```bash
cd ~/Desktop/projects/voiceform
cp .env.example .env
```

Every step below fills in one part of `.env`.

---

## 1. `SECRET_KEY` — 10 seconds

```bash
openssl rand -hex 32
```

```
SECRET_KEY=<paste the 64 characters>
```

This signs your JWTs. Changing it later logs everyone out.

---

## 2. Postgres and Redis — 1 minute, no keys

```bash
docker compose up -d
```

Gives you Postgres on **`5433`**, Redis on `6379`, and Mailpit on `8025`.

> Postgres is on 5433, not 5432, on purpose. macOS developers very often already have a
> Homebrew Postgres bound to `127.0.0.1:5432`, and because `localhost` resolves to the loopback
> address first, it silently shadows Docker's published port. The symptom is
> `role "voiceform" does not exist` even though the container is healthy. The `.env` defaults already
point at all three. Nothing to copy.

---

## 3. Cloudflare R2 — 10 minutes

Stores respondent audio, question audio, and file uploads.

**3a. Enable R2**

1. Sign up or log in at **dash.cloudflare.com**
2. Left sidebar → **R2 Object Storage**
3. Click **Get started** or **Purchase R2**

> Cloudflare asks for a **credit card** to enable R2, even on the free plan. The free tier is
> 10 GB storage, 1M writes, 10M reads per month, and **zero egress charges** — you will not come
> close during development. The card is verification, not a bill.

**3b. Create the bucket**

1. **Create bucket**
2. Name: `voiceform-media`
3. Location: **Automatic**
4. Leave public access **off** — respondent audio is private and served through presigned URLs

**3c. Get your Account ID**

On the R2 overview page, right sidebar, under **Account details**. A 32-character hex string.
Your endpoint is:

```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

**3d. Create API credentials**

1. R2 page → **Manage R2 API Tokens** (top right) → **Create API Token**
2. Token name: `voiceform-api`
3. Permissions: **Object Read & Write**
4. Specify bucket: `voiceform-media`
5. TTL: forever
6. **Create API Token**

The next screen shows **Access Key ID** and **Secret Access Key**. The secret is shown **once** —
copy it now.

```
S3_ENDPOINT_URL=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=voiceform-media
S3_ACCESS_KEY_ID=<access key id>
S3_SECRET_ACCESS_KEY=<secret access key>
```

**3e. Add CORS so the browser can upload directly**

Bucket → **Settings** → **CORS Policy** → **Add CORS policy**:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Add your production domain to `AllowedOrigins` when you deploy. Skipping this makes audio uploads
fail silently in the browser with an opaque CORS error.

---

## 4. Gmail SMTP — 5 minutes

**While developing, you do not need this.** Set `SMTP_HOST=localhost` and `SMTP_PORT=1025` and
every email lands in Mailpit at `localhost:8025` instantly. You can leave `SMTP_USER` and
`SMTP_PASSWORD` filled in — the SMTP provider skips authentication automatically for local
relays, so the same `.env` works for both. Do the steps below when you want real delivery.

1. **myaccount.google.com/security**
2. Turn on **2-Step Verification**. App Passwords do not exist without it.
3. **myaccount.google.com/apppasswords**
4. App name `VoiceForm` → **Create**
5. Copy the 16 characters, remove the spaces

```
EMAIL_PROVIDER=smtp
EMAIL_FROM="VoiceForm <your.address@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.address@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_STARTTLS=true
```

~500 emails/day on a free account. Expect some to land in spam.

---

## 5. Deepgram — 5 minutes

Speech to text.

1. **console.deepgram.com** → sign up
2. **$200 free credit, no card required** — roughly 45,000 minutes of Nova-3
3. **API Keys** → **Create a New API Key**, name `voiceform`, scope **Member**
4. Copy immediately, it is shown once

```
DEEPGRAM_API_KEY=<key>
```

---

## 6. ElevenLabs — 5 minutes

Text to speech, for reading questions aloud.

1. **elevenlabs.io** → sign up
2. Free tier: 10,000 characters/month. Because we cache audio per question rather than per
   respondent, this stretches a long way.
3. Avatar (bottom left) → **API Keys** → **Create API Key**
4. Also open **Voices** and note 2–3 voice IDs for the Settings voice picker

```
ELEVENLABS_API_KEY=<key>
```

---

## 7. Google OAuth — 10 minutes

For the "Continue with Google" button.

1. **console.cloud.google.com** → **Select a project** → **New Project** → `VoiceForm`
2. **APIs & Services** → **OAuth consent screen**
   - User type: **External** → Create
   - App name `VoiceForm`, your email for both support and developer contact
   - Scopes: leave defaults (`email`, `profile`, `openid`)
   - Test users: add your own Gmail
3. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Type: **Web application**
   - Name: `voiceform-web`
   - **Authorised JavaScript origins:** `http://localhost:3000`
   - **Authorised redirect URIs:** `http://localhost:8000/v1/auth/google/callback`
4. Copy both values from the dialog

```
GOOGLE_CLIENT_ID=<...>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<...>
```

While the consent screen is unpublished only your listed test users can log in. That is fine
until launch.

---

## 8. Anthropic — optional, 2 minutes

Only for the response summaries on the Responses screen (build phase 9).

1. **console.anthropic.com** → **API Keys** → **Create Key**

```
ANTHROPIC_API_KEY=<key>
```

---

## 9. Verify everything

```bash
pnpm install
cd apps/api && uv sync && cd ../..
pnpm api:check
```

Output looks like this:

```
  PASS  SECRET_KEY      64 characters
  PASS  Postgres        PostgreSQL 16.4
  PASS  Redis           v7.4.0
  PASS  Cloudflare R2   put/get/delete on voiceform-media
  PASS  SMTP            test email delivered to you@gmail.com
  SKIP  Deepgram        DEEPGRAM_API_KEY is empty
  SKIP  ElevenLabs      ELEVENLABS_API_KEY is empty
  PASS  Google OAuth    credentials present

  Ready to build. Needed later for voice: Deepgram, ElevenLabs
```

`PASS` means the credential was tested against the live service, not just that it is present.
The R2 check does a real put/get/delete. The SMTP check sends you an actual email.

`SKIP` is fine — those are only needed at build phase 7.
`FAIL` blocks you and names the reason.

---

## 10. Run it

```bash
pnpm api:migrate
pnpm api:dev      # terminal 1 — http://localhost:8000/docs
pnpm api:worker   # terminal 2
pnpm dev          # terminal 3 — http://localhost:3000
```

---

## Production later

Same keys, different values. New accounts needed at deploy time only:

| Service | For | Free tier |
|---|---|---|
| Vercel | frontend | yes |
| Railway or Fly.io | API + worker | ~$5/mo, needs a persistent process for WebSockets |
| Neon or Supabase | Postgres | yes |
| Upstash | Redis | yes |
| Resend | email, replacing Gmail | 3,000/mo free |
| Sentry | errors | yes |
| PostHog | completion-rate analytics | yes |

R2 does not change — the same bucket and keys work in production. Add your production domain to
the CORS policy and the Google redirect URIs.
