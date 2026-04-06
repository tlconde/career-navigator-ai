

# CareerBridge — Web Wrapper for career-ops

A warm, accessible web app that brings career-ops' powerful AI methodologies to refugees and newcomers — no CLI, no Git, no technical skills needed.

---

## What we're borrowing from career-ops

The career-ops repo is a CLI tool with 14 AI "modes" containing carefully engineered prompts. We'll translate the 4 most relevant modes into our web UI, preserving the core logic:

1. **6-Block Job Evaluation (oferta.md)** — The A-F scoring system with role archetype detection, CV match analysis, gap identification, comp research, CV personalization plan, and STAR+R interview prep stories
2. **ATS-Optimized CV Generation (pdf.md)** — Keyword extraction from JDs, single-column ATS-friendly layout, professional summary rewriting, competency grid generation
3. **STAR+R Interview Prep (_shared.md)** — The Situation-Task-Action-Result-Reflection framework, story bank building, archetype-adapted framing
4. **Negotiation Scripts & Career Coaching (_shared.md)** — Salary expectation frameworks, geographic discount pushback scripts, general job search guidance

---

## Pages & Features

### Home (`/`)
- Welcoming hero: "Your AI Career Assistant" — tagline about free tools for job seekers in a new country
- 4 illustrated feature cards (Interview Practice, CV Builder, Job Evaluation, Career Tips)
- Language picker (top-right): English, Arabic (RTL support), Ukrainian, French, Spanish, Turkish
- Footer crediting career-ops (link to GitHub)

### Interview Practice (`/interview`)
- User selects a job type or pastes a job description
- AI conducts mock interviews using career-ops' **STAR+R method** (Situation, Task, Action, Result, Reflection)
- The Reflection component is key — it signals seniority by showing what was learned
- After each answer: encouraging feedback + specific improvement tips
- Quick-prompt buttons: "Tell me about a challenge", "Describe a team conflict", "Walk me through a project"

### CV/Resume Builder (`/cv`)
- Step-by-step wizard: personal info, skills, work experience, education
- AI generates content using career-ops' methodology:
  - Professional summary with keyword injection from target role
  - ATS-optimized structure (single-column, standard headers)
  - Action-verb bullets reordered by relevance
  - Competency grid from job requirements
- Preview in clean card layout
- Download as formatted text/markdown

### Job Evaluation (`/evaluate`)
- Paste a job description (text)
- AI produces a simplified version of career-ops' **6-Block evaluation**:
  - **Role Summary** — seniority, remote status, domain, TL;DR
  - **Skills Match** — requirements mapped to user's stated skills, with gap analysis
  - **Match Score** — A-F grade with friendly explanation
  - **Action Plan** — concrete next steps to strengthen the application
  - **Interview Prep** — 3-4 STAR+R story prompts tailored to the role
- Simplified from the full 6 blocks since users won't have cv.md files — instead the AI works from what the user tells it in-session

### Career Tips (`/tips`)
- Open chat with AI career coach
- Pre-loaded quick prompts drawn from career-ops' knowledge:
  - "How to negotiate salary" (uses the negotiation scripts from _shared.md)
  - "Write a cover letter"
  - "Improve my LinkedIn profile"
  - "How to find jobs in [country]"
  - "What is ATS and how to pass it?"
- Streaming chat with markdown rendering

---

## Technical Architecture

### i18n
- `react-i18next` with JSON translation files for 6 languages
- RTL support for Arabic via `dir="rtl"` on root element
- AI responses in the user's selected language

### AI Integration
- Single Supabase Edge Function (`career-coach`) using Lovable Cloud
- Accepts `{ type, messages, language, context }` where type = `interview | cv | evaluate | tips`
- System prompts adapted from career-ops mode files (oferta.md, pdf.md, _shared.md), simplified for the refugee audience — removing Santiago-specific archetypes and making them generic
- Streaming responses via SSE

### No Storage
- Completely stateless — no database, no auth, no cookies
- Privacy-first: nothing is saved server-side
- Users can optionally download their CV output

### Design System
- Warm palette: soft sage green, warm amber, cream backgrounds
- Large touch-friendly buttons and cards
- Simple language, no jargon
- Mobile-first responsive layout
- Encouraging micro-copy throughout

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Home page with 4 feature cards |
| `src/pages/Interview.tsx` | Mock interview chat |
| `src/pages/CVBuilder.tsx` | Step-by-step CV wizard |
| `src/pages/Evaluate.tsx` | Job evaluation tool |
| `src/pages/Tips.tsx` | Career coaching chat |
| `src/components/ChatInterface.tsx` | Reusable streaming chat UI |
| `src/components/LanguagePicker.tsx` | Language selector |
| `src/components/Layout.tsx` | Shared layout with nav + footer |
| `src/i18n/` | Translation JSON files (en, ar, uk, fr, es, tr) |
| `src/i18n/config.ts` | i18next configuration |
| `src/lib/prompts.ts` | System prompts adapted from career-ops modes |
| `supabase/functions/career-coach/` | Edge function for AI chat |
| `src/App.tsx` | Routes setup |

