# Agent skills (Impeccable)

This folder holds the **[pbakaus/impeccable](https://skills.sh/pbakaus/impeccable)** skill pack installed for **Cursor** (project scope). Skills live under `skills/`; each skill is a `SKILL.md` with detailed workflows and references.

## Security and trust

These skills instruct the agent to read files, edit code, and run checks with **full agent permissions**, same as any other trusted automation. **Review skill content** in `skills/<name>/SKILL.md` before relying on them in sensitive repos. Treat them like any third-party prompt: understand what they do, then use or fork them.

## Version control

- **Commit `skills/`** if you want the same skills for everyone who clones the repo (recommended for teams and reproducible setups).
- **Ignore the whole `.agents/` tree** (e.g. add `.agents/` to `.gitignore`) if skills are personal experiments and should not be shared.

Do not half-commit: either track `skills/` intentionally or exclude `.agents/` so nobody gets a broken partial install.

## How to use these in Cursor

- Ask in natural language, for example: “Use the **audit** skill on the checkout page” or “Run **normalize** on `src/components/Button`.”
- Many design skills expect **design context** first. If you have not set it up, start with **`teach-impeccable`** once, then use **`frontend-design`** or other skills as needed (see each skill’s “MANDATORY PREPARATION” section).
- Optional project file: **`.impeccable.md`** at the repo root can hold persisted design context for the pack.

### Suggested order for new UI work

1. **`teach-impeccable`** — one-time (or when strategy changes) to capture audience, brand, and constraints.  
2. **`frontend-design`** — when building or redesigning UI and you need strong defaults and anti-“AI slop” guardrails.  
3. Other skills below, depending on the problem.

---

## Skill reference (installed)

Skills are listed **alphabetically**. “Use when” is a shorthand; full steps are in each `SKILL.md`.

| Skill | Use when… |
| --- | --- |
| **adapt** | You need **responsive or cross-context** UI: breakpoints, mobile vs desktop, touch targets, print, or “make this work on phone/tablet.” |
| **animate** | You want **motion on purpose**: transitions, micro-interactions, hover states, loading feel—without breaking accessibility (`prefers-reduced-motion`). |
| **arrange** | The **layout feels wrong**: spacing, rhythm, hierarchy, alignment, crowding, or “everything looks the same grid.” |
| **audit** | You want a **technical pass with a report**: accessibility, performance, theming, responsive behavior—**findings and severity**, not necessarily fixes in one go. |
| **bolder** | The UI feels **bland, generic, or too safe** and you want more character and impact—without defaulting to clichéd “AI flashy.” |
| **clarify** | **Copy is the problem**: confusing labels, errors, empty states, instructions, or microcopy that should be clearer. |
| **critique** | You want a **design critique**: hierarchy, IA, cognitive load, emotional journey, and “AI slop” checks—not just code quality. |
| **delight** | You want **moments of joy**: personality in success/empty states, small surprises—appropriate to the product (not gimmicks). |
| **distill** | The UI is **too busy or complex**; you want to **simplify**, remove noise, and focus on the essential job. |
| **extract** | You are **repeating patterns** and want **components, tokens, or patterns** pulled into a shared design system or library. |
| **frontend-design** | You are **building or overhauling** a web UI and want **distinctive, production-grade** frontends with shared principles and references. Often the base skill others build on. |
| **harden** | You need **production robustness**: long/short text, i18n/RTL, errors, loading, overflow—real data and failure modes. |
| **normalize** | UI has **drifted from your design system**: wrong tokens, one-off styles, inconsistent components—**realign** to the system. |
| **onboard** | You are shaping **first-run, onboarding, empty states**, or paths to the “aha moment” and activation. |
| **optimize** | The experience is **slow or janky**: load time, runtime, images, bundle size, animations—**measure, then fix** what matters. |
| **polish** | You are **close to shipping** and want a **final pass**: alignment, spacing, states, consistency—good to great. |
| **quieter** | The design is **too loud, harsh, or overwhelming**; you want a **calmer, more refined** look without killing hierarchy. |
| **teach-impeccable** | **First-time setup** (or refresh): capture **design context** and persist it so other skills do not guess audience and brand from code alone. |

---

## Not installed (omitted by choice)

The following skills from the same pack were **not** installed here (e.g. to avoid skills flagged with Socket alerts in the installer’s security summary): **colorize**, **overdrive**, **typeset**. You can add them later with `npx skills` if you accept their risk profile.

```bash
npx skills add pbakaus/impeccable -a cursor -y -s colorize overdrive typeset
```

---

## Reinstall or update

Project-local install example (Cursor only, same 18 skills as above):

```bash
npx skills add pbakaus/impeccable -a cursor -y -s adapt animate arrange audit bolder clarify critique delight distill extract frontend-design harden normalize onboard optimize polish quieter teach-impeccable
```

Check the [skills CLI](https://skills.sh/) for `list`, `update`, and `remove`.
