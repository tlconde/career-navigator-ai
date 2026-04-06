# CareerBridge — gaps and implementation map

This document lists **what is missing or incomplete** for a “complete,” plug-and-play experience (non-technical users, free OSS). Each item points to **existing modules** in this repo (`career-navigator-ai`) and describes **what to implement** and **how**.

Paths are relative to the **repository root** (`career-navigator-ai/`).

---

## 1. Project metadata and legal

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| No **LICENSE** file | *(repo root)* | Add `LICENSE` (e.g. MIT) | Copy standard MIT text; align with [career-ops](https://github.com/santifer/career-ops) attribution in README. |
| **index.html** still has Lovable placeholders | [`index.html`](../index.html) | Real `<title>`, `meta name="description"`, `og:*` and `twitter:*` for CareerBridge | Replace “Lovable App” / generic OG image with your app name, short description, and optional branded `public/og.png`. |
| README says “Add or confirm license” | [`README.md`](../README.md) | Point to `LICENSE` once added | One line under License section. |

---

## 2. First-run / onboarding (plug-and-play)

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| No **3-step “start here”** on home | [`src/pages/Index.tsx`](../src/pages/Index.tsx) | Short numbered path: language → Evaluate or CV → Advanced → Tracker | Add a slim section (or hero sub-block) with links to `/evaluate`, `/cv`, `/advanced/tracker`; use i18n keys in `src/i18n/*.json`. |
| Privacy is mentioned but **first-visit explainer** is light | [`src/pages/Index.tsx`](../src/pages/Index.tsx), [`src/i18n/en.json`](../src/i18n/en.json) | Optional **dismissible banner**: “Data stays in your browser unless you export” | `localStorage` key e.g. `careerbridge-dismiss-privacy-v1`; small `Alert` from shadcn. |
| **Advanced** is easy to miss for new users | [`src/pages/Index.tsx`](../src/pages/Index.tsx) | Already has teaser; consider duplicate **footer link** | [`src/components/Layout.tsx`](../src/components/Layout.tsx): add “More tools” → `/advanced`. |

---

## 3. Application tracker (localStorage)

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| **CSV export** exists; **no CSV import** | [`src/components/ApplicationTracker.tsx`](../src/components/ApplicationTracker.tsx) | **Import** button + file picker; parse CSV; validate columns; merge or replace with confirm dialog | Match export columns: `company`, `role`, `status`, `url`, `notes`, `updated` (+ generate new `id` per row). Use `FileReader` + parse; on failure show toast (`useToast`). |
| **Status** is free text | [`src/components/ApplicationTracker.tsx`](../src/components/ApplicationTracker.tsx) | Optional **`<Select>`** with canonical statuses + “Custom” | Align labels with career-ops [`templates/states.yml`](https://github.com/santifer/career-ops/blob/main/templates/states.yml) (`Evaluated`, `Applied`, …); store chosen string in `status` field for backward compatibility. |
| No **JSON backup/restore** (optional) | Same | Optional second export format | `download` JSON array of `TrackerRow`; import validates shape. Lower priority than CSV import. |
| Tracker not linked from **Evaluate** after success | [`src/pages/Evaluate.tsx`](../src/pages/Evaluate.tsx) | CTA: “Track this application” → prefill query params or `sessionStorage` seed | Pass company/role via `navigate('/advanced/tracker', { state: {...} })` and read in `ApplicationTracker` to append one row (optional scope). |

---

## 4. AI client and edge function

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| Errors only **toast**; no **inline retry** on Evaluate | [`src/pages/Evaluate.tsx`](../src/pages/Evaluate.tsx), [`src/components/ChatInterface.tsx`](../src/components/ChatInterface.tsx) | On `streamChat` error: show **Retry** button that resends last request | Keep last user payload in `useRef` or component state; `Button` calling same `streamChat` again. |
| `streamChat` catch-all | [`src/lib/chat.ts`](../src/lib/chat.ts) | Distinguish **network offline** vs **HTTP error** (optional) | `catch (e)` inspect `navigator.onLine` / `TypeError`; map to new i18n keys under `common.*`. |
| Maintainer docs for **quotas** | [`README.md`](../README.md) | Short subsection: Lovable AI / Supabase free-tier behavior | Document 429/402 handling already in `chat.ts`; set expectations for OSS contributors. |

**Reference (working today):** [`src/lib/chat.ts`](../src/lib/chat.ts) → `POST` to `${VITE_SUPABASE_URL}/functions/v1/career-coach`; [`supabase/functions/career-coach/index.ts`](../supabase/functions/career-coach/index.ts) defines `SYSTEM_PROMPTS` per `ChatCoachType` ([`src/lib/coach-types.ts`](../src/lib/coach-types.ts)).

---

## 5. Internationalization (i18n)

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| Non-English **fallback** noted in README | [`src/i18n/*.json`](../src/i18n/) | Audit missing keys vs `en.json` | Script or manual pass; keep `en` as source of truth. |
| **NotFound** page is English-only | [`src/pages/NotFound.tsx`](../src/pages/NotFound.tsx) | Wrap with [`Layout`](../src/components/Layout.tsx); use `useTranslation()` for title, body, link | Match tone of `home.*`; use `<Link to="/">` from react-router. |

---

## 6. Advanced hub vs career-ops reality

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| **Scan / batch / PDF / Playwright** cannot run in browser | [`src/pages/Advanced.tsx`](../src/pages/Advanced.tsx), [`src/pages/AdvancedTool.tsx`](../src/pages/AdvancedTool.tsx), [`supabase/functions/career-coach/index.ts`](../supabase/functions/career-coach/index.ts) | Prompts already clarify limitations in **scan** / **batch** system text — ensure **UI copy** in i18n matches (no promise of automated scraping) | Verify `advanced.tools.*.desc` in [`src/i18n/en.json`](../src/i18n/en.json) for each `ADVANCED_TOOL_IDS` in [`src/lib/coach-types.ts`](../src/lib/coach-types.ts). Strengthen wording where needed. |

---

## 7. Progressive Web App (optional polish)

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| No **manifest** / installability | [`index.html`](../index.html), new `public/manifest.webmanifest` | `manifest` + icons `192`/`512` | Link manifest in `<head>`; add icons under `public/`; optional service worker only if offline shell is required (higher effort). |

---

## 8. Testing and quality

| Gap | Paths | What to implement | How |
|-----|--------|---------------------|-----|
| Minimal tests | [`src/test/example.test.ts`](../src/test/example.test.ts) | Unit tests for **CSV parse/import**, `loadRows`/`saveRows`, `isAdvancedToolId` | Vitest + small fixtures in `src/test/fixtures/`. |
| **404** uses `console.error` only | [`src/pages/NotFound.tsx`](../src/pages/NotFound.tsx) | Remove or guard `console.error` in production | Optional: only log in dev (`import.meta.env.DEV`). |

---

## 9. Route and layout map (reference)

| Route | Module | Role |
|-------|--------|------|
| `/` | [`src/pages/Index.tsx`](../src/pages/Index.tsx) | Home, feature cards, Advanced teaser |
| `/interview` | [`src/pages/Interview.tsx`](../src/pages/Interview.tsx) | STAR+R mock interview |
| `/cv` | [`src/pages/CVBuilder.tsx`](../src/pages/CVBuilder.tsx) | CV wizard + PDF text extract [`src/lib/extractPdfText.ts`](../src/lib/extractPdfText.ts) |
| `/evaluate` | [`src/pages/Evaluate.tsx`](../src/pages/Evaluate.tsx) | Job evaluation (streams `evaluate`) |
| `/tips` | [`src/pages/Tips.tsx`](../src/pages/Tips.tsx) | General coaching chat |
| `/advanced` | [`src/pages/Advanced.tsx`](../src/pages/Advanced.tsx) | Hub for tools in [`ADVANCED_TOOL_IDS`](../src/lib/coach-types.ts) |
| `/advanced/:toolId` | [`src/pages/AdvancedTool.tsx`](../src/pages/AdvancedTool.tsx) | Tracker **or** [`ChatInterface`](../src/components/ChatInterface.tsx) per tool |
| `*` | [`src/pages/NotFound.tsx`](../src/pages/NotFound.tsx) | 404 |

**App shell:** [`src/App.tsx`](../src/App.tsx) (routes), [`src/components/Layout.tsx`](../src/components/Layout.tsx) (nav, footer).

---

## 10. Priority order (suggested)

1. ~~**LICENSE** + **index.html** metadata (credibility + sharing).~~ Done (`LICENSE`, `index.html`, README).
2. ~~**CSV import** in [`ApplicationTracker.tsx`](../src/components/ApplicationTracker.tsx) (backup / device change).~~ Done (import + confirm merge/replace).
3. ~~**Onboarding block** on [`Index.tsx`](../src/pages/Index.tsx) + optional privacy banner.~~ Done + footer “More tools” in [`Layout.tsx`](../src/components/Layout.tsx).
4. ~~**Retry** on failed AI + **i18n** for [`NotFound.tsx`](../src/pages/NotFound.tsx).~~ Done.
5. Canonical **status** dropdown (optional but improves consistency).
6. **PWA manifest** + tests (as time allows). *(Vitest: `src/test/parseCvJson.test.ts` for CV JSON parsing.)*

---

## 11. Phase 2 — PDF (HTML), auto-pipeline, deep with live URL fetch

**Roadmap (aligned with project plan):** These are **not** done in the current POC; they require **server-side** pieces (Supabase Edge Functions and/or a small Node worker). See the Cursor plan **Web dashboard + CareerBridge** for full tables and sequencing.

| Feature | Goal | Main modules to add or change |
| -------- | ------ | ------------------------------ |
| **Tailored PDF via HTML** | Download a PDF aligned with career-ops ATS style | New API or Edge Function: render HTML → PDF (options: **browser print** MVP, or **Puppeteer/Playwright** on Fly/Railway/Browserless for parity with [`career-ops` `generate-pdf.mjs`](https://github.com/santifer/career-ops)); template inspired by [`templates/cv-template.html`](https://github.com/santifer/career-ops/blob/main/templates/cv-template.html). Wire from [`src/pages/CVBuilder.tsx`](../src/pages/CVBuilder.tsx) or a new **Export PDF** action after evaluate. |
| **ATS fidelity (must-have)** | Parsers read **text + order**; image PDFs fail | **Primary path:** Chromium `page.pdf()` from semantic single-column HTML (see plan: `h1`/`h2`/`ul`, embedded woff2, no layout tables). **Avoid** html2canvas/jsPDF as the only output — **no reliable text layer**. **QA:** extract text from PDF (`pdftotext` or `pdfjs-dist`); assert name/sections present; optional golden test with JD keywords. |
| **Auto-pipeline** | Paste job URL → extract JD → evaluate → optional PDF → append [`ApplicationTracker`](../src/components/ApplicationTracker.tsx) row | New Edge Function: **fetch URL + extract text** (SSRF-safe); client orchestrates calls to existing `evaluate` flow; then PDF endpoint; then localStorage row. Fails gracefully on SPA-only boards unless Tier 2/3 below. |
| **Deep with live browsing** | “Deep” uses **fetched page text** without requiring the user to paste everything | Extend or add Edge Function **fetch + HTML→text**; feed result into `deep` system prompt in [`supabase/functions/career-coach/index.ts`](../supabase/functions/career-coach/index.ts). For JS-heavy sites: **headless** (hosted Playwright) or **third-party reader API** (Firecrawl, Jina, etc.) — document cost/limits in README. |

**Build order suggested:** (1) URL fetch + extract, (2) auto-pipeline without PDF, then (3) PDF renderer, then (4) headless or third-party extraction if needed.

---

*Generated for CareerBridge (career-navigator-ai). Update this file as features land.*
