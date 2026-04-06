/** Matches `career-coach` edge function `SYSTEM_PROMPTS` keys (chat-backed tools). */
export const CHAT_COACH_TYPES = [
  'interview',
  'cv',
  'cvparse',
  'evaluate',
  'tips',
  'scan',
  'batch',
  'apply',
  'pipeline',
  'outreach',
  'deep',
  'training',
  'project',
] as const;

export type ChatCoachType = (typeof CHAT_COACH_TYPES)[number];

/** All Advanced hub entries (chat + local-only tracker). Order matches career-ops-style workflow. */
export const ADVANCED_TOOL_IDS = [
  'scan',
  'batch',
  'tracker',
  'pipeline',
  'apply',
  'outreach',
  'deep',
  'training',
  'project',
] as const;

export type AdvancedToolId = (typeof ADVANCED_TOOL_IDS)[number];

export function isAdvancedToolId(id: string): id is AdvancedToolId {
  return (ADVANCED_TOOL_IDS as readonly string[]).includes(id);
}
