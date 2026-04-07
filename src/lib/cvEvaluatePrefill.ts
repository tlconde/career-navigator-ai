import type { CvFormExtraction } from '@/lib/cvFormTypes';

const STORAGE_KEY = 'careerbridge-cv-evaluate-prefill-v1';

/** Plain-text profile for Job Evaluation "Your skills" — mirrors CV questionnaire structure. */
export function formatCvExtractionForEvaluate(m: CvFormExtraction): string {
  return `
Name: ${m.name}
Email: ${m.email || '(not provided)'}
Phone: ${m.phone || '(not provided)'}
Location: ${m.location || '(not provided)'}
LinkedIn: ${m.linkedin || '(not provided)'}
GitHub: ${m.github || '(not provided)'}
Languages: ${m.languages || '(not provided)'}

Skills:
${m.skills}

Experience:
${m.experiences
  .map((e) => `- ${e.jobTitle} at ${e.company} (${e.duration}): ${e.description}`)
  .join('\n')}

Education:
${m.educations.map((e) => `- ${e.degree} from ${e.school} (${e.year})`).join('\n')}

Target role (if stated): ${m.targetRole}
  `.trim();
}

export function saveCvEvaluatePrefill(text: string) {
  try {
    if (!text.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, text);
  } catch {
    /* ignore */
  }
}

export function readCvEvaluatePrefill(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
