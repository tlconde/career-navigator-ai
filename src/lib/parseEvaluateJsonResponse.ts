import { jsonrepair } from 'jsonrepair';
import type { EvaluateStructured } from '@/lib/evaluateTypes';
import { emptyEvaluateStructured } from '@/lib/evaluateTypes';
import { extractBalancedJsonObject } from '@/lib/parseCvJsonResponse';

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
}

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
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return null;
    }
    try {
      return JSON.parse(jsonrepair(trimmed));
    } catch {
      return null;
    }
  }
}

/**
 * Parse JSON from evaluate_structured AI response.
 */
export function parseEvaluateStructuredJson(raw: string): EvaluateStructured | null {
  const trimmed = raw.trim();
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: unknown = tryParseJsonObject(cleaned || trimmed);
  if (parsed === null) {
    const balanced =
      extractBalancedJsonObject(cleaned || trimmed) ?? extractBalancedJsonObject(trimmed);
    if (balanced) parsed = tryParseJsonObject(balanced);
  }

  if (parsed === null || !isRecord(parsed)) return null;

  const base = emptyEvaluateStructured();
  return {
    roleTitle: str(parsed.roleTitle) || base.roleTitle,
    matchGrade: str(parsed.matchGrade) || base.matchGrade,
    mustHaveKeywords: strArr(parsed.mustHaveKeywords),
    recommendedKeywords: strArr(parsed.recommendedKeywords),
    missingAreas: strArr(parsed.missingAreas),
    prioritySkillsToAdd: strArr(parsed.prioritySkillsToAdd),
    cvBulletImprovements: strArr(parsed.cvBulletImprovements),
    atsNotes: strArr(parsed.atsNotes),
  };
}
