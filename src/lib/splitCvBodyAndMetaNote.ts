/**
 * Models often append `---` + "Note: ..." after the CV. That belongs in UI, not the downloadable CV.
 * Split on horizontal rule followed by a line starting with Note (markdown bold allowed).
 */
export function splitCvBodyAndMetaNote(raw: string): { body: string; metaNote: string | null } {
  const trimmed = raw.trimEnd();
  if (!trimmed) return { body: '', metaNote: null };

  const afterRule = /\r?\n---\s*\r?\n+\s*((?:\*{0,2}\s*)?Note\s*:\s*[\s\S]+)$/i;
  const m1 = trimmed.match(afterRule);
  if (m1 && m1.index !== undefined && m1.index > 0 && m1[1]) {
    return { body: trimmed.slice(0, m1.index).trimEnd(), metaNote: m1[1].trim() };
  }

  // No rule: trailing "Note: This CV is optimized..." (single block at end)
  const bareNote =
    /\r?\n\r?\n((?:\*{0,2}\s*)?Note\s*:\s*(?:This CV is optimized|optimized for)[\s\S]+)$/i;
  const m3 = trimmed.match(bareNote);
  if (m3 && m3.index !== undefined && m3.index > 0 && m3[1]) {
    return { body: trimmed.slice(0, m3.index).trimEnd(), metaNote: m3[1].trim() };
  }

  return { body: trimmed, metaNote: null };
}
