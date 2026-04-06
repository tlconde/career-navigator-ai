import type { CvFormExtraction, EducationRow, ExperienceRow } from '@/lib/cvFormTypes';
import { emptyCvForm } from '@/lib/cvFormTypes';

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function mapExp(x: unknown): ExperienceRow {
  if (!isRecord(x)) return { jobTitle: '', company: '', duration: '', description: '' };
  return {
    jobTitle: str(x.jobTitle),
    company: str(x.company),
    duration: str(x.duration),
    description: str(x.description),
  };
}

function mapEdu(x: unknown): EducationRow {
  if (!isRecord(x)) return { degree: '', school: '', year: '' };
  return {
    degree: str(x.degree),
    school: str(x.school),
    year: str(x.year),
  };
}

/** Extract first top-level `{ ... }` using brace depth (handles `}` inside strings). */
export function extractBalancedJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\' && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (c === '{') depth++;
      if (c === '}') {
        depth--;
        if (depth === 0) return raw.slice(start, i + 1);
      }
    }
  }
  return null;
}

/** LLMs often emit trailing commas — strip before `}` or `]`. */
function stripTrailingCommas(s: string): string {
  let out = s;
  let prev = '';
  while (out !== prev) {
    prev = out;
    out = out.replace(/,(\s*[}\]])/g, '$1');
  }
  return out;
}

function tryParseJsonObject(slice: string): unknown | null {
  const trimmed = stripTrailingCommas(slice.trim());
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

/**
 * Parse JSON from AI response (may include markdown fences, prose, or slightly invalid JSON).
 */
export function parseCvExtractionJson(raw: string): CvFormExtraction | null {
  const trimmed = raw.trim();
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  if (!cleaned && !trimmed) return null;

  let parsed: unknown = tryParseJsonObject(cleaned || trimmed);
  if (parsed === null) {
    const balanced =
      extractBalancedJsonObject(cleaned || trimmed) ?? extractBalancedJsonObject(trimmed);
    if (balanced) parsed = tryParseJsonObject(balanced);
  }

  if (parsed === null) return null;

  if (Array.isArray(parsed)) {
    const first = parsed[0];
    parsed = isRecord(first) ? first : null;
  }
  if (!isRecord(parsed)) return null;

  const base = emptyCvForm();
  const exps = Array.isArray(parsed.experiences)
    ? parsed.experiences.map(mapExp).filter((e) => e.jobTitle || e.company || e.description)
    : [];
  const edus = Array.isArray(parsed.educations)
    ? parsed.educations.map(mapEdu).filter((e) => e.degree || e.school)
    : [];

  return {
    name: str(parsed.name) || base.name,
    email: str(parsed.email) || base.email,
    phone: str(parsed.phone) || base.phone,
    location: str(parsed.location) || base.location,
    linkedin: str(parsed.linkedin) || base.linkedin,
    github: str(parsed.github) || base.github,
    languages: str(parsed.languages) || base.languages,
    skills: str(parsed.skills) || base.skills,
    targetRole: str(parsed.targetRole) || base.targetRole,
    experiences: exps.length ? exps : base.experiences,
    educations: edus.length ? edus : base.educations,
  };
}
