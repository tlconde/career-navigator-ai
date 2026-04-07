import type { CvFormExtraction, EducationRow, ExperienceRow } from '@/lib/cvFormTypes';

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const LINKEDIN_RE = /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)\]>'"]+/gi;
const LINKEDIN_LOOSE_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)\]>'"]+/gi;
const GITHUB_RE = /https?:\/\/(?:www\.)?github\.com\/[^\s)\]>'"]+/i;
const GITHUB_LOOSE_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s)\]>'"]+/i;

/** PDFs often break lines; join whitespace so email/phone survive. */
function compactForContactSearch(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
}

function extractNameLineBeforeEmail(text: string): string | undefined {
  const m = text.match(EMAIL_RE);
  if (!m) return undefined;
  const before = text.slice(0, text.indexOf(m[0]));
  const lines = before.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0 && i >= lines.length - 4; i--) {
    const line = lines[i];
    if (line.length < 3 || line.length > 100) continue;
    if (EMAIL_RE.test(line)) continue;
    if (/[|•]/.test(line)) continue;
    if (/^(CV|RESUME|CURRICULUM|PROFILE)/i.test(line)) continue;
    if (/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{2,}$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 8) {
      return line;
    }
  }
  return undefined;
}

function normalizeLinkedinUrl(u: string): string {
  const s = u.split(/[\s\])'"]/)[0] ?? u;
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, '')}`;
}

function normalizeGithubUrl(u: string): string {
  const s = u.split(/[\s\])'"]/)[0] ?? u;
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, '')}`;
}

/** e.g. Resume_Taissa_Conde → Taissa Conde */
function nameFromResumeFilename(stem: string): string | undefined {
  const s = stem.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  const m = s.match(/^(?:resume|cv|curriculum vitae)\s+(.+)$/i);
  if (m?.[1]) {
    const parts = m[1].trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
  }
  return undefined;
}

function extractPhone(text: string): string {
  // Only match phone numbers with a label or starting with +
  const labeled = text.match(
    /(?:phone|tel|mobile|gsm|téléphone|telefoon|cell)\s*[:.]?\s*([+()\d][\d\s().-]{7,})/i,
  );
  if (labeled?.[1]) return labeled[1].trim().slice(0, 40);
  // Only match numbers starting with + (international format) to avoid grabbing random numbers
  const intl = text.match(/\+\d[\d\s().-]{8,}\d/);
  return intl ? intl[0].trim().slice(0, 40) : '';
}

/**
 * Fast client-side extraction (regex + simple section splits).
 * CONSERVATIVE: Only extracts high-confidence contact fields.
 * Lets the AI handle skills, experience, education, and location.
 */
export function parseCvFromTextHeuristic(raw: string, filenameStem?: string): Partial<CvFormExtraction> {
  let text = raw.replace(/\r\n/g, '\n').trim();
  if (!text) return {};

  const out: Partial<CvFormExtraction> = {};

  const compact = compactForContactSearch(text);

  // --- High-confidence contact extractions only ---

  const emailMatch = compact.match(EMAIL_RE) ?? text.match(EMAIL_RE);
  if (emailMatch) out.email = emailMatch[0];

  const liMatch = text.match(LINKEDIN_RE) ?? text.match(LINKEDIN_LOOSE_RE);
  if (liMatch?.[0]) out.linkedin = normalizeLinkedinUrl(liMatch[0]);

  const ghMatch = text.match(GITHUB_RE) ?? text.match(GITHUB_LOOSE_RE);
  if (ghMatch?.[0]) out.github = normalizeGithubUrl(ghMatch[0]);

  const phone = extractPhone(compact) || extractPhone(text);
  if (phone) out.phone = phone;

  // Name extraction (high confidence only)
  const nameLine = text.match(/(?:^|\n)\s*(?:name|full name|nom)\s*:\s*([^\n]+)/i);
  const nameBeforeEmail = extractNameLineBeforeEmail(text);
  const fromFile = filenameStem ? nameFromResumeFilename(filenameStem) : undefined;
  if (nameLine?.[1]?.trim()) {
    out.name = nameLine[1].trim();
  } else if (nameBeforeEmail) {
    out.name = nameBeforeEmail;
  } else if (fromFile) {
    out.name = fromFile;
  } else {
    const first = text.split('\n').map((l) => l.trim()).find(Boolean);
    if (
      first &&
      !EMAIL_RE.test(first) &&
      first.length < 60 &&
      /^[A-Za-zÀ-ÿ\s.'-]{3,}$/.test(first) &&
      first.split(/\s+/).length >= 2 &&
      first.split(/\s+/).length <= 5
    ) {
      out.name = first;
    }
  }

  // Languages only if explicitly labeled
  const langLine = text.match(
    /(?:^|\n)\s*(?:languages?|langues|idiomas|talen)\s*:\s*([^\n]+)/i,
  );
  if (langLine?.[1]?.trim()) out.languages = langLine[1].trim();

  // DO NOT extract skills, experience, education, location, or targetRole heuristically.
  // These are too error-prone from PDF text. Let the AI handle them.

  return out;
}
