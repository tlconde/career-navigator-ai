import type { CvFormExtraction, EducationRow, ExperienceRow } from '@/lib/cvFormTypes';
import { emptyCvForm } from '@/lib/cvFormTypes';

function pick(ai: string, he: string | undefined): string {
  const a = ai?.trim() ?? '';
  const h = he?.trim() ?? '';
  return a || h || '';
}

function mergeSkills(ai: string, he: string | undefined): string {
  const a = ai?.trim() ?? '';
  const h = he?.trim() ?? '';
  if (!a) return h;
  if (!h) return a;
  if (a === h) return a;
  if (a.includes(h) || h.includes(a)) return a.length >= h.length ? a : h;
  return `${a}\n${h}`;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function expKey(e: ExperienceRow): string {
  return `${norm(e.jobTitle)}|${norm(e.company)}`;
}

function eduKey(e: EducationRow): string {
  return `${norm(e.degree)}|${norm(e.school)}`;
}

/** Combine AI + heuristic rows so upload fills every step even when one source is sparse. */
export function mergeExperienceLists(ai: ExperienceRow[], he: ExperienceRow[] | undefined): ExperienceRow[] {
  const merged: ExperienceRow[] = [];
  const seen = new Set<string>();
  for (const e of ai) {
    if (e.jobTitle?.trim() || e.company?.trim() || e.description?.trim()) {
      const k = expKey(e);
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(e);
      }
    }
  }
  for (const e of he ?? []) {
    if (e.jobTitle?.trim() || e.company?.trim() || e.description?.trim()) {
      const k = expKey(e);
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(e);
      }
    }
  }
  return merged.length ? merged : emptyCvForm().experiences;
}

export function mergeEducationLists(ai: EducationRow[], he: EducationRow[] | undefined): EducationRow[] {
  const merged: EducationRow[] = [];
  const seen = new Set<string>();
  for (const e of ai) {
    if (e.degree?.trim() || e.school?.trim()) {
      const k = eduKey(e);
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(e);
      }
    }
  }
  for (const e of he ?? []) {
    if (e.degree?.trim() || e.school?.trim()) {
      const k = eduKey(e);
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(e);
      }
    }
  }
  return merged.length ? merged : emptyCvForm().educations;
}

/** Merge heuristic extraction with AI JSON; combine lists and prefer non-empty text fields. */
export function mergeCvExtractions(
  heuristic: Partial<CvFormExtraction>,
  ai: CvFormExtraction | null,
): CvFormExtraction {
  const d = emptyCvForm();
  if (!ai) {
    return {
      name: heuristic.name ?? d.name,
      email: heuristic.email ?? d.email,
      phone: heuristic.phone ?? d.phone,
      location: heuristic.location ?? d.location,
      linkedin: heuristic.linkedin ?? d.linkedin,
      github: heuristic.github ?? d.github,
      languages: heuristic.languages ?? d.languages,
      skills: heuristic.skills ?? d.skills,
      targetRole: heuristic.targetRole ?? d.targetRole,
      experiences:
        heuristic.experiences?.some((e) => e.jobTitle || e.company || e.description)
          ? heuristic.experiences!
          : d.experiences,
      educations:
        heuristic.educations?.some((e) => e.degree || e.school)
          ? heuristic.educations!
          : d.educations,
    };
  }

  return {
    name: pick(ai.name, heuristic.name),
    email: pick(ai.email, heuristic.email),
    phone: pick(ai.phone, heuristic.phone),
    location: pick(ai.location, heuristic.location),
    linkedin: pick(ai.linkedin, heuristic.linkedin),
    github: pick(ai.github, heuristic.github),
    languages: pick(ai.languages, heuristic.languages),
    skills: mergeSkills(ai.skills, heuristic.skills),
    targetRole: pick(ai.targetRole, heuristic.targetRole),
    experiences: mergeExperienceLists(ai.experiences, heuristic.experiences),
    educations: mergeEducationLists(ai.educations, heuristic.educations),
  };
}
