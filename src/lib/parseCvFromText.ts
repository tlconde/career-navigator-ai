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
  const labeled = text.match(
    /(?:phone|tel|mobile|gsm|téléphone|telefoon)\s*[:.]?\s*([+()\d][\d\s().-]{7,})/i,
  );
  if (labeled?.[1]) return labeled[1].trim().slice(0, 40);
  const m = text.match(/\+?\d[\d\s().-]{8,}\d/);
  return m ? m[0].trim().slice(0, 40) : '';
}

function sectionAfterHeading(text: string, pattern: RegExp): string {
  const m = text.match(
    new RegExp(
      `(?:^|\\n)#*\\s*(?:${pattern.source})[^\\n]*\\n([\\s\\S]*?)(?=\\n#+\\s|[\\n]{2,}#{1,3}\\s|$)`,
      'i',
    ),
  );
  return m?.[1]?.trim() ?? '';
}

// --- PDF-friendly section headers (no # required) ---

const HEADER_SKILL = [
  /^\s*#*\s*(skills?|technical skills?|core competencies|key skills|compétences|habilidades|vaardigheden|tool|technologies)\s*$/i,
  /^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|TOOLS)$/,
];
const HEADER_EXP = [
  /^\s*#*\s*(work experience|professional experience|employment|employment history|experience|relevant experience|career history|work history|professional background)\s*$/i,
  /^(WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EMPLOYMENT|PROFESSIONAL BACKGROUND)$/,
];
const HEADER_EDU = [
  /^\s*#*\s*(education|academic|qualifications|formation|academic background|studies|university)\s*$/i,
  /^(EDUCATION|ACADEMIC)$/,
];

function matchesAny(line: string, patterns: RegExp[]): boolean {
  const L = line.trim();
  return patterns.some((p) => p.test(L));
}

function isBoundaryForSection(line: string, currentPatterns: RegExp[]): boolean {
  const L = line.trim();
  if (!L) return false;
  if (matchesAny(L, currentPatterns)) return false;
  return (
    matchesAny(L, HEADER_EXP) || matchesAny(L, HEADER_EDU) || matchesAny(L, HEADER_SKILL)
  );
}

function extractPlainSection(lines: string[], startPatterns: RegExp[]): string {
  const idx = lines.findIndex((line) => matchesAny(line, startPatterns));
  if (idx === -1) return '';
  const body: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const L = lines[i].trim();
    if (isBoundaryForSection(lines[i], startPatterns) && body.length > 0) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

function longerNonEmpty(a: string, b: string): string {
  const x = a.trim();
  const y = b.trim();
  if (!x) return y;
  if (!y) return x;
  return x.length >= y.length ? x : y;
}

function inferTargetRole(text: string, experiences: ExperienceRow[] | undefined): string {
  const obj = text.match(
    /(?:^|\n)\s*(?:objective|career objective|professional summary|summary|seeking|looking for|position desired)[:\s]+([^\n]+)/i,
  );
  if (obj?.[1]?.trim()) return obj[1].trim().slice(0, 240);
  const first = experiences?.find((e) => e.jobTitle?.trim());
  if (first?.jobTitle) return first.jobTitle.trim().slice(0, 240);
  return '';
}

function inferLocation(text: string): string | undefined {
  const labeled = text.match(
    /(?:^|\n)\s*(?:location|address|ville|adresse|ubicación|locatie|based in|city)\s*[:]\s*([^\n]+)/i,
  );
  if (labeled?.[1]?.trim()) return labeled[1].trim().slice(0, 200);
  const cityCountry = text.match(
    /(?:^|\n)\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{2,40}),\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{2,40})\s*(?:\n|$)/,
  );
  if (cityCountry?.[1] && cityCountry?.[2]) {
    const a = cityCountry[1].trim();
    const b = cityCountry[2].trim();
    if (!/^(email|phone|http)/i.test(a) && a.split(/\s+/).length <= 4 && b.split(/\s+/).length <= 4) {
      return `${a}, ${b}`;
    }
  }
  return undefined;
}

/**
 * Fast client-side extraction (regex + simple section splits).
 * Tuned for PDF text: plain headings, no markdown, noisy lines.
 */
export function parseCvFromTextHeuristic(raw: string, filenameStem?: string): Partial<CvFormExtraction> {
  let text = raw.replace(/\r\n/g, '\n').trim();
  if (!text) return {};

  // PDFs often emit a whole page as one long line — insert breaks before typical section titles.
  text = text.replace(
    /\s+(?=(?:Work Experience|Professional Experience|Employment|Education|Academic|Skills|Technical Skills|Summary|Objective|Languages?)\b)/gi,
    '\n\n',
  );

  const lines = text.split(/\r?\n/);
  const out: Partial<CvFormExtraction> = {};

  const compact = compactForContactSearch(text);
  const emailMatch = compact.match(EMAIL_RE) ?? text.match(EMAIL_RE);
  if (emailMatch) out.email = emailMatch[0];

  const liMatch = text.match(LINKEDIN_RE) ?? text.match(LINKEDIN_LOOSE_RE);
  if (liMatch?.[0]) out.linkedin = normalizeLinkedinUrl(liMatch[0]);

  const ghMatch = text.match(GITHUB_RE) ?? text.match(GITHUB_LOOSE_RE);
  if (ghMatch?.[0]) out.github = normalizeGithubUrl(ghMatch[0]);

  const phone = extractPhone(compact) || extractPhone(text);
  if (phone) out.phone = phone;

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
      first.length < 90 &&
      /^[A-Za-zÀ-ÿ\s.'-]{3,}$/.test(first) &&
      first.split(/\s+/).length >= 2 &&
      first.split(/\s+/).length <= 6
    ) {
      out.name = first;
    } else if (filenameStem) {
      const stem = filenameStem.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      const looksLikeFilename =
        /^resume\b/i.test(stem) || /^cv\b/i.test(stem) || /^curriculum\b/i.test(stem);
      if (stem.length > 2 && stem.length < 100 && !looksLikeFilename) out.name = stem;
    }
  }

  const loc = inferLocation(text);
  if (loc) out.location = loc;
  else {
    const locLine = text.match(
      /(?:^|\n)\s*(?:location|address|ville|adresse|ubicación|locatie|based in)\s*:\s*([^\n]+)/i,
    );
    if (locLine?.[1]?.trim()) out.location = locLine[1].trim();
  }

  const langLine = text.match(
    /(?:^|\n)\s*(?:languages?|langues|idiomas|talen)\s*:\s*([^\n]+)/i,
  );
  if (langLine?.[1]?.trim()) out.languages = langLine[1].trim();

  const skillsPlain = extractPlainSection(lines, HEADER_SKILL);
  const skillsMd =
    sectionAfterHeading(text, /skills|technical skills|compétences|habilidades|vaardigheden/i) ||
    text.match(/##\s*Skills[^\n]*\n([\s\S]*?)(?=\n##|\n#\s|$)/i)?.[1]?.trim() ||
    '';
  const skillsCombined = longerNonEmpty(skillsPlain, skillsMd);
  if (skillsCombined.length > 3) out.skills = skillsCombined.slice(0, 10000);

  const expPlain = extractPlainSection(lines, HEADER_EXP);
  const expMd = sectionAfterHeading(
    text,
    /experience|work experience|employment|professional experience|expérience|werkervaring|experiencia/i,
  );
  const expBody = longerNonEmpty(expPlain, expMd);
  if (expBody.length > 40) {
    const rows = splitExperienceHeuristic(expBody);
    if (rows.length) out.experiences = rows;
  }

  const eduPlain = extractPlainSection(lines, HEADER_EDU);
  const eduMd = sectionAfterHeading(
    text,
    /education|academic|formation|opleiding|educación|studies/i,
  );
  const eduBody = longerNonEmpty(eduPlain, eduMd);
  if (eduBody.length > 15) {
    const rows = splitEducationHeuristic(eduBody);
    if (rows.length) out.educations = rows;
  }

  const tr = inferTargetRole(text, out.experiences);
  if (tr) out.targetRole = tr;

  return out;
}

function splitExperienceHeuristic(block: string): ExperienceRow[] {
  let chunks = block.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  if (chunks.length <= 1 && block.includes('\n')) {
    chunks = splitExperienceByDateLines(block);
  }
  const rows: ExperienceRow[] = [];
  for (const chunk of chunks.slice(0, 15)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const titleLine = lines[0];
    const dateRange =
      chunk.match(
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|present|now|current|today|aujourd'hui)/i,
      )?.[0] ??
      chunk.match(/\b(19|20)\d{2}\s*[-–]\s*(?:(19|20)\d{2}|present|now|current|aujourd'hui)\b/i)?.[0] ??
      chunk.match(/\b(19|20)\d{2}\s*[-–]\s*(?:(19|20)\d{2}|present|now|current)\b/i)?.[0] ??
      '';
    let jobTitle = titleLine;
    let company = '';
    let description = '';
    if (lines.length >= 2 && !/^[-•*]/.test(lines[1])) {
      company = lines[1];
      description = lines.slice(2).join('\n');
    } else {
      description = lines.slice(1).join('\n');
    }
    const singleLineJob = titleLine.match(
      /^(.+?)\s+[-–|]\s+(.+?)\s+[-–|]\s+(.+)$/,
    );
    if (singleLineJob && !company) {
      jobTitle = singleLineJob[1].trim();
      company = singleLineJob[2].trim();
      description = [singleLineJob[3].trim(), description].filter(Boolean).join('\n');
    }
    if (titleLine.length > 2) {
      rows.push({
        jobTitle: jobTitle.slice(0, 200),
        company: company.slice(0, 200),
        duration: dateRange.slice(0, 120),
        description: description.slice(0, 4000),
      });
    }
  }
  return rows;
}

/** When paragraphs aren't double-spaced, split by lines that look like date ranges (new role). */
function splitExperienceByDateLines(block: string): string[] {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  const chunks: string[] = [];
  let cur: string[] = [];
  const dateStart = /^(?:\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(19|20)\d{2}\s*[-–])/i;
  for (const line of lines) {
    if (dateStart.test(line) && cur.length >= 2) {
      chunks.push(cur.join('\n'));
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) chunks.push(cur.join('\n'));
  return chunks.length >= 2 ? chunks : [block];
}

function splitEducationHeuristic(block: string): EducationRow[] {
  const paras = block.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const rows: EducationRow[] = [];

  const tryLine = (line: string) => {
    const years = line.match(/\b(19|20)\d{2}\b/g);
    const year = years?.[years.length - 1] ?? '';
    const parts = line.split(/[|–-]/).map((p) => p.trim());
    if (parts.length >= 2) {
      rows.push({
        degree: parts[0].slice(0, 200),
        school: parts[1].replace(/\b(19|20)\d{2}\b/g, '').trim().slice(0, 200),
        year,
      });
    } else if (line.length > 8 && year) {
      rows.push({
        degree: line.replace(/\b(19|20)\d{2}\b/g, '').trim().slice(0, 200),
        school: '',
        year,
      });
    }
  };

  for (const para of paras.slice(0, 12)) {
    for (const line of para.split('\n').map((l) => l.trim()).filter(Boolean)) {
      tryLine(line);
    }
  }
  if (rows.length) return rows;

  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 20)) tryLine(line);
  return rows;
}
