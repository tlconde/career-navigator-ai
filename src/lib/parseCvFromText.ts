import type { CvFormExtraction, EducationRow, ExperienceRow } from '@/lib/cvFormTypes';

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const LINKEDIN_RE = /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)\]>'"]+/gi;
const LINKEDIN_LOOSE_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)\]>'"]+/gi;
const GITHUB_RE = /https?:\/\/(?:www\.)?github\.com\/[^\s)\]>'"]+/i;
const GITHUB_LOOSE_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s)\]>'"]+/i;

function compactForContactSearch(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
}

/** Strip markdown + emoji so "## 💼 PROFESSIONAL EXPERIENCE" matches keywords. */
function normalizeHeadingLine(line: string): string {
  return line
    .replace(/^#{1,3}\s*/, '')
    .replace(/\*+/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractNameLineBeforeEmail(text: string): string | undefined {
  const m = text.match(EMAIL_RE);
  if (!m) return undefined;
  const before = text.slice(0, text.indexOf(m[0]));
  const lines = before.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0 && i >= lines.length - 4; i--) {
    const line = lines[i].replace(/^#{1,3}\s*/, '').replace(/\*+/g, '').trim();
    if (line.length < 3 || line.length > 100) continue;
    if (EMAIL_RE.test(line)) continue;
    if (/[|•]/.test(line) && line.includes('|')) continue;
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
  const emojiPhone = text.match(/📱\s*(\+?[\d\s().-]{10,})/);
  if (emojiPhone?.[1]) return emojiPhone[1].trim().slice(0, 40);
  const labeled = text.match(
    /(?:phone|tel|mobile|gsm|téléphone|telefoon|cell)\s*[:.]?\s*([+()\d][\d\s().-]{7,})/i,
  );
  if (labeled?.[1]) return labeled[1].trim().slice(0, 40);
  const intl = text.match(/\+\d[\d\s().-]{8,}\d/);
  return intl ? intl[0].trim().slice(0, 40) : '';
}

function extractLocationLine(text: string): string | undefined {
  const pin = text.match(/📍\s*([^|\n]+)/);
  if (pin?.[1]?.trim()) return pin[1].trim().slice(0, 200);
  const labeled = text.match(
    /(?:^|\n)\s*(?:location|address|ville|adresse|ubicación|locatie|based in)\s*:\s*([^\n]+)/i,
  );
  if (labeled?.[1]?.trim()) return labeled[1].trim().slice(0, 200);
  return undefined;
}

/** Find first ## line whose normalized text includes one of the keywords; return section body until next ## or --- */
function extractMarkdownSectionByKeywords(text: string, keywords: string[]): string {
  const lines = text.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (!/^#{1,3}\s/.test(L.trim())) continue;
    const n = normalizeHeadingLine(L);
    if (keywords.some((k) => n.includes(k))) {
      start = i;
      break;
    }
  }
  if (start === -1) return '';
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const L = lines[i];
    const t = L.trim();
    if (/^#{1,2}\s/.test(t)) break;
    if (/^---\s*$/.test(t)) break;
    body.push(L);
  }
  return body.join('\n').trim();
}

/** Markdown job blocks: ### **Title** | Company | *dates* */
function parseMarkdownExperienceSection(section: string): ExperienceRow[] {
  const rows: ExperienceRow[] = [];
  const parts = section.split(/\n(?=###\s)/);
  for (const part of parts) {
    if (!/^###\s/m.test(part.trim())) continue;
    const firstLine = part.split('\n')[0] ?? '';
    const header = firstLine.replace(/^###\s*/, '').replace(/\*\*/g, '').trim();
    const segs = header.split('|').map((s) => s.replace(/^\*|\*$/g, '').trim());
    const jobTitle = (segs[0] ?? '').slice(0, 200);
    const company = (segs[1] ?? '').slice(0, 200);
    const duration = (segs[2] ?? '').slice(0, 120);
    const rest = part.includes('\n') ? part.slice(part.indexOf('\n') + 1).trim() : '';
    if (jobTitle || company || rest) {
      rows.push({
        jobTitle,
        company,
        duration,
        description: rest.slice(0, 4000),
      });
    }
  }
  return rows;
}

function parseMarkdownEducationSection(section: string): EducationRow[] {
  const rows: EducationRow[] = [];
  const paras = section.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  for (const para of paras.slice(0, 12)) {
    const first = para.split('\n')[0] ?? '';
    const degree = first.replace(/\*\*/g, '').trim();
    const schoolLine = para.split('\n')[1] ?? '';
    const school = schoolLine.replace(/\*+/g, '').split('|')[0]?.trim() ?? '';
    const yearMatch = para.match(/\b(19|20)\d{2}\b/g);
    const year = yearMatch?.[yearMatch.length - 1] ?? '';
    if (degree.length > 5 && (school || year)) {
      rows.push({
        degree: degree.slice(0, 200),
        school: school.slice(0, 200),
        year,
      });
    }
  }
  if (rows.length) return rows;

  const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 20)) {
    const parts = line.split('|').map((p) => p.replace(/\*+/g, '').trim());
    if (parts.length >= 2) {
      rows.push({
        degree: parts[0].slice(0, 200),
        school: parts[1].replace(/Graduated:\s*/i, '').slice(0, 200),
        year: line.match(/\b(19|20)\d{2}\b/)?.[0] ?? '',
      });
    }
  }
  return rows;
}

function parseLanguagesBulletSection(section: string): string {
  const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
  const chunks: string[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '').trim();
    if (cleaned) chunks.push(cleaned);
  }
  return chunks.join('\n').slice(0, 4000);
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

function longerNonEmpty(a: string, b: string): string {
  const x = a.trim();
  const y = b.trim();
  if (!x) return y;
  if (!y) return x;
  return x.length >= y.length ? x : y;
}

function inferTargetRole(text: string, experiences: ExperienceRow[] | undefined): string {
  const obj = text.match(
    /(?:^|\n)\s*(?:objective|career objective|professional summary|executive summary|summary|seeking|looking for|position desired)[:\s]+([^\n]+)/i,
  );
  if (obj?.[1]?.trim()) return obj[1].trim().slice(0, 240);
  const sub = text.match(/^\*\*(.+?)\*\*\s*$/m);
  if (sub?.[1]?.trim() && sub[1].length < 120) return sub[1].trim();
  const first = experiences?.find((e) => e.jobTitle?.trim());
  if (first?.jobTitle) return first.jobTitle.trim().slice(0, 240);
  return '';
}

function extractMarkdownH1Name(text: string): string | undefined {
  const m = text.match(/^#{1}\s+(.+?)\s*$/m);
  if (m?.[1]) {
    const n = m[1].replace(/\*\*/g, '').trim();
    if (n.split(/\s+/).length >= 2 && n.split(/\s+/).length <= 6 && n.length < 90) return n;
  }
  return undefined;
}

/**
 * Heuristic extraction for .md/.txt and PDF text. Handles emoji section titles (e.g. ## 💼 EXPERIENCE).
 */
export function parseCvFromTextHeuristic(raw: string, filenameStem?: string): Partial<CvFormExtraction> {
  let text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
  if (!text) return {};

  // PDF one-line blobs only: inserting newlines before keywords breaks "## 💼 PROFESSIONAL EXPERIENCE" / "## 🌍 LANGUAGES" etc.
  if (!/^#{1,3}\s/m.test(text)) {
    text = text.replace(
      /\s+(?=(?:Work Experience|Professional Experience|Employment|Education|Academic|Skills|Technical Skills|Core Competencies|Summary|Objective)\b)/gi,
      '\n\n',
    );
  }

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

  const loc = extractLocationLine(text);
  if (loc) out.location = loc;

  const h1 = extractMarkdownH1Name(text);
  const nameLine = text.match(/(?:^|\n)\s*(?:name|full name|nom)\s*:\s*([^\n]+)/i);
  const nameBeforeEmail = extractNameLineBeforeEmail(text);
  const fromFile = filenameStem ? nameFromResumeFilename(filenameStem) : undefined;
  if (nameLine?.[1]?.trim()) out.name = nameLine[1].trim();
  else if (h1) out.name = h1;
  else if (nameBeforeEmail) out.name = nameBeforeEmail;
  else if (fromFile) out.name = fromFile;
  else {
    const first = text.split('\n').map((l) => l.trim()).find(Boolean)?.replace(/^#{1,3}\s*/, '').replace(/\*+/g, '').trim();
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
      if (!/^resume\b/i.test(stem) && !/^cv\b/i.test(stem) && stem.length > 2 && stem.length < 100) out.name = stem;
    }
  }

  const langLine = text.match(
    /(?:^|\n)\s*(?:languages?|langues|idiomas|talen)\s*:\s*([^\n]+)/i,
  );
  if (langLine?.[1]?.trim()) out.languages = langLine[1].trim();

  const langSection = extractMarkdownSectionByKeywords(text, ['languages', 'langues']);
  if (langSection && !out.languages) {
    const parsedLang = parseLanguagesBulletSection(langSection);
    out.languages = parsedLang || langSection.replace(/^#{1,3}\s*.*\n/, '').trim().slice(0, 4000);
  }

  const expSectionMd = extractMarkdownSectionByKeywords(text, [
    'professional experience',
    'work experience',
    'employment',
    'experience',
  ]);
  const expSectionMd2 = sectionAfterHeading(
    text,
    /experience|work experience|employment|professional experience|expérience|werkervaring|experiencia/i,
  );
  const expBody = longerNonEmpty(expSectionMd, expSectionMd2);
  if (expBody.length > 15) {
    let rows = parseMarkdownExperienceSection(expBody);
    if (!rows.length) rows = splitExperienceHeuristic(expBody);
    if (rows.length) out.experiences = rows;
  }

  const eduSectionMd = extractMarkdownSectionByKeywords(text, ['education', 'academic', 'qualification']);
  const eduSectionMd2 = sectionAfterHeading(
    text,
    /education|academic|formation|opleiding|educación|studies/i,
  );
  const eduBody = longerNonEmpty(eduSectionMd, eduSectionMd2);
  if (eduBody.length > 10) {
    let eduRows = parseMarkdownEducationSection(eduBody);
    if (!eduRows.length) eduRows = splitEducationHeuristic(eduBody);
    if (eduRows.length) out.educations = eduRows;
  }

  const skillsSectionMd = extractMarkdownSectionByKeywords(text, [
    'core competencies',
    'skills',
    'technical skills',
    'competencies',
  ]);
  const skillsMd2 = sectionAfterHeading(
    text,
    /skills|technical skills|compétences|habilidades|vaardigheden|competencies/i,
  );
  const skillsCombined = longerNonEmpty(skillsSectionMd, skillsMd2);
  if (skillsCombined.length > 3) out.skills = skillsCombined.slice(0, 10000);

  const tr = inferTargetRole(text, out.experiences);
  if (tr) out.targetRole = tr;

  if (!out.languages?.trim()) {
    const blk = text.match(/##\s*[^\n]*LANGUAGES[^\n]*\r?\n([\s\S]*?)(?=\r?\n##\s|\r?\n---\s*\r?\n##|\r?\n---\s*$)/i);
    if (blk?.[1]) {
      const body = blk[1].trim();
      out.languages = parseLanguagesBulletSection(body) || body.slice(0, 4000);
    }
  }

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
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|present|now|current|today)/i,
      )?.[0] ??
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
    const singleLineJob = titleLine.match(/^(.+?)\s+[-–|]\s+(.+?)\s+[-–|]\s+(.+)$/);
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
        degree: parts[0].replace(/\*\*/g, '').slice(0, 200),
        school: parts[1].replace(/\b(19|20)\d{2}\b/g, '').replace(/\*+/g, '').trim().slice(0, 200),
        year,
      });
    } else if (line.length > 8 && year) {
      rows.push({
        degree: line.replace(/\b(19|20)\d{2}\b/g, '').replace(/\*+/g, '').trim().slice(0, 200),
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
