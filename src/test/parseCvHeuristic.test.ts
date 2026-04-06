import { describe, expect, it } from 'vitest';
import { parseCvFromTextHeuristic } from '@/lib/parseCvFromText';
import { mergeCvExtractions } from '@/lib/cvFormMerge';

describe('parseCvFromTextHeuristic', () => {
  it('extracts plain-text sections without markdown headings', () => {
    const raw = `
Jane Doe
jane@example.com | +1 555-123-4567

SUMMARY
Product manager with 5 years experience.

WORK EXPERIENCE

Acme Corp
Senior PM
2020 - Present
• Shipped roadmap

Beta LLC
Analyst
2018 - 2020

SKILLS
SQL
Python
Team leadership

EDUCATION

MBA, State University
2017
`;
    const h = parseCvFromTextHeuristic(raw, 'Resume_Jane_Doe');
    const m = mergeCvExtractions(h, null);
    expect(m.email).toContain('jane@example.com');
    expect(m.skills.toLowerCase()).toMatch(/sql|python/);
    expect(m.experiences.length).toBeGreaterThanOrEqual(1);
    expect(m.targetRole.length).toBeGreaterThan(0);
  });

  it('parses name from Resume_First_Last filename', () => {
    const h = parseCvFromTextHeuristic('no email in body', 'Resume_Taissa_Conde');
    expect(h.name).toMatch(/Taissa Conde/i);
  });
});
