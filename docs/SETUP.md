# Setup — every key you need and how to get it

Work through this top to bottom. Steps 1–4 get the app running locally with **zero paid
accounts**. Steps 5–7 are needed only when you reach the voice and OAuth work.

---

## 1. Install the toolchain

```bash
brew install node pnpm uv docker
```

Verify:

```bash
node --version   # v20.11+
pnpm --version   # 9+
uv --version
docker --version
```

---

## 2. Start local services

```bash
cd ~/Desktop/projects/voiceform
cp .env.example .env
docker compose up -d
```

That gives you, with no accounts and no keys:

| Service | Purpose | URL |
|---|---|---|
| Postgres | database | `localhost:5432` |
| Redis | queue + cache | `localhost:6379` |
| MinIO | S3-compatible storage | console at `localhost:9001` (`voiceform` / `voiceform123`) |
| Mailpit | catches every outgoing email | inbox at `localhost:8025` |

**Create the MinIO bucket once:** open `localhost:9001`, log in, create a bucket named
`voiceform-media`.

---

## 3. Generate your secret key

```bash
openssl rand -hex 32
```

Paste into `.env` as `SECRET_KEY=`.

---

## 4. Install dependencies and run

```bash
pnpm install
cd apps/api && uv sync && cd ../..

pnpm api:revision "initial schema"
pnpm api:migrate

pnpm api:dev      # terminal 1 — http://localhost:8000/docs
pnpm api:worker   # terminal 2
pnpm dev          # terminal 3 — http://localhost:3000
```

**Use Mailpit while developing.** In `.env` set `SMTP_HOST=localhost` and `SMTP_PORT=1025`, then
every verification code and reset link lands in `localhost:8025` instantly. Switch to real Gmail
only when you want to test genuine delivery.

---

## 5. Gmail SMTP — free, ~10 minutes

Needed for real email delivery.

1. Go to **myaccount.google.com/security**
2. Turn on **2-Step Verification** if it is not already on. App Passwords will not appear without it.
3. Go to **myaccount.google.com/apppasswords**
4. App name: `VoiceForm`. Click **Create**.
5. Copy the **16-character password**. Spaces do not matter, remove them.
6. Fill in `.env`:

```
EMAIL_PROVIDER=smtp
EMAIL_FROM="VoiceForm <your.address@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.address@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_STARTTLS=true
```

**Limits to plan around:** ~500 emails/day on a free account, 2,000/day on Workspace. Expect some
messages to land in spam. Both are why response alerts are digested, and why you will want to move
to Resend before real users arrive.

---

## 6. Speech providers — needed at build step 7

### Deepgram (speech to text)

1. Sign up at **console.deepgram.com**
2. $200 free credit on signup, no card required. That is roughly 45,000 minutes of Nova-3.
3. **API Keys → Create a New API Key**, scope `Member`
4. `DEEPGRAM_API_KEY=` in `.env`

### ElevenLabs (text to speech)

1. Sign up at **elevenlabs.io**
2. Free tier is 10,000 characters/month — enough to develop against, not enough for production.
   Because we cache per question, real usage stays low.
3. **Profile → API Keys → Create**
4. `ELEVENLABS_API_KEY=` in `.env`
5. Browse **Voices** and note 2–3 voice IDs for the Settings voice picker.

### Anthropic (optional — for the response summaries in `32:3558`)

1. **console.anthropic.com** → API Keys → Create Key
2. `ANTHROPIC_API_KEY=` in `.env`

---

## 7. OAuth — needed for the Google and Apple buttons

### Google — free

1. **console.cloud.google.com** → create a project called `VoiceForm`
2. **APIs & Services → OAuth consent screen** → External → fill in app name, your email
3. **Credentials → Create Credentials → OAuth client ID → Web application**
4. Authorised redirect URIs:
   - `http://localhost:8000/v1/auth/google/callback`
   - your production callback later
5. Copy into `.env`:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Apple — **costs $99/year**

Sign in with Apple requires a paid Apple Developer Program membership. There is no free path.

1. **developer.apple.com/programs** → enrol ($99/yr)
2. **Certificates, IDs & Profiles → Identifiers** → App ID, enable Sign In with Apple
3. Create a **Services ID** — this becomes `APPLE_CLIENT_ID`
4. **Keys → Create a key** with Sign In with Apple → download the `.p8` **once**
5. Fill in `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

**Decide now:** if $99/yr is not budgeted, remove the Apple button from the login and signup
screens before they get built. It is cheaper to cut it in Figma than to build and hide it.

---

## 8. Production — only when you deploy

| Service | What for | Free tier |
|---|---|---|
| **Vercel** | Next.js frontend | Yes, generous |
| **Railway** or **Fly.io** | FastAPI + worker | ~$5/mo, needs persistent process for WebSocket |
| **Neon** or **Supabase** | Postgres | Yes |
| **Upstash** | Redis | Yes |
| **Cloudflare R2** | audio storage | 10GB free, zero egress |
| **Resend** | email, replacing Gmail | 3,000/mo free |
| **Sentry** | errors | Yes |
| **PostHog** | completion-rate analytics | Yes |

For R2: Cloudflare dashboard → R2 → Create bucket `voiceform-media` → **Manage API Tokens** →
Create token with Object Read & Write. You get an account ID, access key, and secret. Then:

```
S3_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=voiceform-media
```

Nothing else changes — R2 is S3-compatible and the storage adapter is already written against it.

---

## What you can start on today

Everything in **steps 1–4** needs no accounts and no keys. That covers build phases 1 through 6 in
the working doc: auth, forms CRUD, the builder, publishing, and the entire respondent flow in
typing mode. You only need Deepgram and ElevenLabs when you reach phase 7.
