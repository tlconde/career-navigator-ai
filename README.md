# CareerBridge

A warm, accessible web app that brings ideas from **[career-ops](https://github.com/santifer/career-ops)**—Santiago’s Claude Code job-search pipeline—to **refugees and newcomers**. No CLI, Git, or technical setup for end users: open the site, pick a language, and use the tools in the browser.

> **Relationship to career-ops:** career-ops is a local-first CLI with 14 “modes” and rich prompts. CareerBridge exposes a **simplified, web-friendly slice** of that methodology (STAR+R interviews, ATS-oriented CV help, job evaluation, career coaching) via streaming AI. It is **not** a fork of career-ops; prompts and flows are adapted for people without a `cv.md` or developer workflow.

## Features

| Area | Route | What it does |
|------|--------|----------------|
| **Home** | `/` | Hero, four feature entry points, language picker, footer credits |
| **Interview practice** | `/interview` | Mock interviews guided by **STAR+R** (Situation, Task, Action, Result, Reflection) |
| **CV / resume helper** | `/cv` | Step-style flow; AI helps structure and phrase an ATS-friendly markdown CV |
| **Job evaluation** | `/evaluate` | Paste a job description (+ your context); get role summary, skills match, A–F-style match score, action plan, interview prompts |
| **Career tips** | `/tips` | Coaching chat with quick prompts (negotiation, cover letters, LinkedIn, ATS, job search) |

**Internationalization:** English, Arabic (RTL), Ukrainian, French, Spanish, Turkish (`react-i18next`, JSON under `src/i18n/`). Arabic sets `dir="rtl"` on the document when selected.

**Privacy posture:** The product goal is **stateless use**—no account required for the tools; chat goes to your edge function and is not designed to persist application data in-app. (Supabase client in the repo may still use default auth storage if you use other Supabase features later.)

## Tech stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router
- **AI:** Supabase Edge Function `supabase/functions/career-coach` → Lovable AI Gateway (`LOVABLE_API_KEY`), streaming SSE to the client
- **Client:** `src/lib/chat.ts` posts to `{VITE_SUPABASE_URL}/functions/v1/career-coach`

## Local development

### Prerequisites

- Node.js 18+ (20+ recommended)
- A Supabase project with the `career-coach` function deployed (or local Supabase CLI if you use it)

### Setup

```bash
git clone <your-repo-url> career-navigator-ai
cd career-navigator-ai
npm install
```

Copy environment variables (see `.env.example`):

- `VITE_SUPABASE_URL` — your Supabase project URL  
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key (used as `Bearer` for the functions invoke URL)

```bash
npm run dev
```

### Edge function secrets

Configure **`LOVABLE_API_KEY`** in Supabase (Dashboard → Edge Functions → secrets, or CLI) so `career-coach` can call the gateway.

Deploy the function from the repo root (with Supabase CLI linked to your project):

```bash
supabase functions deploy career-coach --no-verify-jwt
```

(Adjust `--no-verify-jwt` vs JWT verification to match your security model; Lovable-hosted projects often document the expected setup.)

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Project layout (high level)

```
src/
  pages/           # Index, Interview, CVBuilder, Evaluate, Tips, NotFound
  components/      # Layout, LanguagePicker, ChatInterface, UI primitives
  i18n/            # config + en, ar, uk, fr, es, tr
  lib/             # chat streaming client, prompts (mirror / reference for edge prompts)
supabase/functions/career-coach/   # Deno edge function (authoritative server prompts)
.lovable/plan.md                   # Original product/architecture notes
```

## Credits

- Methodology and inspiration: **[santifer/career-ops](https://github.com/santifer/career-ops)** (MIT).
- Footer on the app also references the **[AI Opportunity Fund](https://aiopportunityfund.withgoogle.com)**.

## License

Add or confirm your license file at the repo root (e.g. MIT) if you intend open-source distribution.
