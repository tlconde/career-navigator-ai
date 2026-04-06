import { describe, expect, it } from 'vitest';
import { extractBalancedJsonObject, parseCvExtractionJson } from '@/lib/parseCvJsonResponse';

describe('parseCvExtractionJson', () => {
  it('parses bare JSON', () => {
    const raw = `{"name":"Jane Doe","email":"j@example.com","phone":"","location":"","linkedin":"","github":"","languages":"","skills":"","targetRole":"","experiences":[],"educations":[]}`;
    const r = parseCvExtractionJson(raw);
    expect(r?.name).toBe('Jane Doe');
    expect(r?.email).toBe('j@example.com');
  });

  it('extracts JSON from prose and markdown fences', () => {
    const raw = `Here you go:
\`\`\`json
{"name":"A B","email":"a@b.co","phone":"","location":"","linkedin":"","github":"","languages":"","skills":"","targetRole":"","experiences":[],"educations":[]}
\`\`\`
Hope this helps`;
    const r = parseCvExtractionJson(raw);
    expect(r?.email).toBe('a@b.co');
  });

  it('handles trailing commas', () => {
    const raw = `{
      "name": "X",
      "email": "x@y.z",
      "experiences": [],
      "educations": [],
    }`;
    const r = parseCvExtractionJson(raw);
    expect(r?.email).toBe('x@y.z');
  });

  it('returns balanced object when extra text follows JSON', () => {
    const inner = `{"name":"N","email":"n@e.com","phone":"","location":"","linkedin":"","github":"","languages":"","skills":"","targetRole":"","experiences":[],"educations":[]}`;
    const raw = `${inner} and some trailing junk`;
    const bal = extractBalancedJsonObject(raw);
    expect(bal).toBeTruthy();
    const r = parseCvExtractionJson(raw);
    expect(r?.email).toBe('n@e.com');
  });
});
