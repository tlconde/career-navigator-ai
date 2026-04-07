/** Structured output from `evaluate_structured` coach type (edge function). */
export interface EvaluateStructured {
  roleTitle: string;
  matchGrade: string;
  mustHaveKeywords: string[];
  recommendedKeywords: string[];
  missingAreas: string[];
  prioritySkillsToAdd: string[];
  cvBulletImprovements: string[];
  atsNotes: string[];
}

/** Passed from /evaluate to /cv via router state. */
export interface EvaluateHandoff {
  jobDesc: string;
  userSkills: string;
  markdown: string;
  structured: EvaluateStructured | null;
  /** Optional — shown in UI and prompts when the user analyzed from a posting URL. */
  jobUrl?: string;
}

export function emptyEvaluateStructured(): EvaluateStructured {
  return {
    roleTitle: '',
    matchGrade: '',
    mustHaveKeywords: [],
    recommendedKeywords: [],
    missingAreas: [],
    prioritySkillsToAdd: [],
    cvBulletImprovements: [],
    atsNotes: [],
  };
}

/** Build prompt text for CV generation / apply from job evaluation handoff. */
export function formatEvaluationContextForPrompt(h: EvaluateHandoff): string {
  const parts: string[] = [];
  parts.push('## Job evaluation context (tailor the CV for this role and ATS)');
  if (h.jobUrl?.trim()) {
    parts.push(`**Job posting URL:** ${h.jobUrl.trim()}`);
  }
  parts.push(`**Job description:**\n${h.jobDesc.slice(0, 12000)}`);
  if (h.userSkills.trim()) {
    parts.push(`**Candidate background:**\n${h.userSkills.slice(0, 8000)}`);
  }
  if (h.structured) {
    const s = h.structured;
    if (s.roleTitle.trim()) parts.push(`**Inferred role title:** ${s.roleTitle.trim()}`);
    if (s.matchGrade.trim()) parts.push(`**Match grade:** ${s.matchGrade.trim()}`);
    if (s.mustHaveKeywords.length) {
      parts.push(`**Must-have keywords from the JD:** ${s.mustHaveKeywords.join(', ')}`);
    }
    if (s.recommendedKeywords.length) {
      parts.push(`**Recommended keywords to weave in naturally:** ${s.recommendedKeywords.join(', ')}`);
    }
    if (s.missingAreas.length) {
      parts.push(`**Gaps to address (use honest transferable framing):**\n${s.missingAreas.map((x) => `- ${x}`).join('\n')}`);
    }
    if (s.prioritySkillsToAdd.length) {
      parts.push(`**Priority skills to surface:** ${s.prioritySkillsToAdd.join(', ')}`);
    }
    if (s.cvBulletImprovements.length) {
      parts.push(`**Bullet improvement ideas:**\n${s.cvBulletImprovements.map((x) => `- ${x}`).join('\n')}`);
    }
    if (s.atsNotes.length) {
      parts.push(`**ATS notes:**\n${s.atsNotes.map((x) => `- ${x}`).join('\n')}`);
    }
  } else if (h.markdown.trim()) {
    parts.push(`**Full evaluation (markdown reference):**\n${h.markdown.slice(0, 15000)}`);
  }
  return parts.join('\n\n');
}
