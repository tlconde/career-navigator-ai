# CareerBridge

A warm, accessible web app that brings ideas from **[career-ops](https://github.com/santifer/career-ops)**—Santiago’s Claude Code job-search pipeline—to **refugees and newcomers**. No CLI, Git, or technical setup for end users: open the site, pick a language, and use the tools in the browser.

> **Relationship to career-ops:** career-ops is a local-first CLI (14 modes, Playwright PDFs and portal scanning, Go dashboard, file-based tracker). CareerBridge exposes the **same coaching workflows** in the browser on the main pages, plus an **Advanced** area that maps to the remaining career-ops modes (scan, batch, tracker, pipeline, apply, outreach, deep, training, project). Heavy automation still lives in [career-ops](https://github.com/santifer/career-ops) on your machine; this app focuses on AI guidance and a simple local-only application table.

## Features

| Area | Route | What it does |
|------|--------|----------------|
| **Home** | `/` | Hero, four feature cards, link to Advanced, language picker, footer |
| **Interview practice** | `/interview` | Mock interviews guided by **STAR+R** |
| **CV / resume helper** | `/cv` | Step-style flow; ATS-oriented markdown CV; upload `.txt/.md` or **PDF** (client-side text extraction via pdf.js) |
| **Job evaluation** | `/evaluate` | Single JD analysis (career-ops–style blocks, simplified) |
| **Career tips** | `/tips` | General coaching chat |
| **Advanced** | `/advanced` | Hub for scan, batch, tracker (browser-local), pipeline, apply, outreach, deep, training, project |

**Internationalization:** English, Arabic (RTL), Ukrainian, French, Spanish, Turkish. Non-English bundles fall back to English for strings that are not translated yet (e.g. Advanced copy).

**Privacy:** Chat is processed by your edge function; the **application tracker** stores rows only in the user’s browser (`localStorage`) with optional CSV export.

## Tech stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router
- **AI:** Supabase Edge Function `supabase/functions/career-coach` → Lovable AI Gateway (`LOVABLE_API_KEY`), streaming SSE
- **Client:** `src/lib/chat.ts` → `{VITE_SUPABASE_URL}/functions/v1/career-coach`

## Local development

### Prerequisites

- Node.js 18+ (20+ recommended)
- A Supabase project with the `career-coach` function deployed (or Supabase CLI locally)

### Setup

```bash
git clone <your-repo-url> career-navigator-ai
cd career-navigator-ai
npm install
```

Copy environment variables (see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

```bash
npm run dev
```

### Edge function

Set **`LOVABLE_API_KEY`** in Supabase secrets. Deploy:

```bash
supabase functions deploy career-coach --no-verify-jwt
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

### Troubleshooting (Windows)

- **`vite` is not recognized:** Scripts invoke Vite via `node ./node_modules/vite/bin/vite.js` so a broken `PATH` to `node_modules/.bin` does not block `npm run dev`. If installs fail, delete `node_modules` and `package-lock.json`, then run `npm install` again.
- **`npm warn tar TAR_ENTRY_ERROR UNKNOWN`:** Often antivirus, sync folders (OneDrive), or file locks. Try: pause AV for the project folder, move the repo to a short path like `C:\dev\...`, close editors holding files, then reinstall.
- **Stay on Vite 5.x:** This repo pins **`vite` to `5.4.21`**. Do **not** run `npm audit fix --force` to “fix” esbuild — it jumps to **Vite 8**, conflicts with `@vitejs/plugin-react-swc` / `lovable-tagger`, and triggers Rolldown / `jsx` warnings. We use an **`overrides`** entry for **`esbuild`** so `npm audit` stays clean without upgrading Vite.
- **Seeing Vite 8 in the terminal?** You are not using this repo’s install (or you ran a global `vite`). Run **`npm install`** here, then **`npm run dev`** — the script must call the local `node_modules` binary (see `package.json` scripts).
- **Browserslist “caniuse-lite is old”:** Run `npm install caniuse-lite@latest` in the project (updates the lockfile). Ignore tools that try to use **Bun** if you don’t have it installed.

### Security / `npm audit`

`npm audit` only reports issues in **this project’s dependency tree**. It does not scan your whole PC. Keeping **`npm audit`** at **0** in this folder is done with the pinned Vite + `esbuild` override; avoid `--force` upgrades that pull Vite 8.

## Project layout (high level)

```
src/
  pages/           # Index, Interview, CVBuilder, Evaluate, Tips, Advanced, AdvancedTool
  components/      # Layout, LanguagePicker, ChatInterface, ApplicationTracker, UI
  lib/             # coach-types, chat client
  i18n/
supabase/functions/career-coach/
.lovable/plan.md
```

## Credits

Methodology and inspiration: **[santifer/career-ops](https://github.com/santifer/career-ops)** (MIT).

## License

[MIT](LICENSE). Methodology credit: [career-ops](https://github.com/santifer/career-ops) (MIT).

### AI quotas

The chat client calls the Supabase `career-coach` edge function. Rate limits and credit exhaustion surface as toasts (`429` / `402`); see `src/lib/chat.ts` and `common.*` i18n keys.
