import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const Y_LINE_THRESHOLD = 4;

/**
 * Group PDF text items into lines using their transform matrix (better than one blob per page).
 */
function itemsToLines(items: unknown[]): string[] {
  type Enriched = { str: string; x: number; y: number };
  const enriched: Enriched[] = [];
  for (const item of items) {
    if (typeof item !== 'object' || item === null || !('str' in item)) continue;
    const str = (item as { str: string }).str;
    if (!str?.trim()) continue;
    const tr = (item as { transform?: number[] }).transform;
    if (!tr || tr.length < 6) continue;
    enriched.push({ str, x: tr[4], y: tr[5] });
  }
  if (!enriched.length) return [];
  enriched.sort((a, b) => (Math.abs(a.y - b.y) > Y_LINE_THRESHOLD ? b.y - a.y : a.x - b.x));

  const lines: string[] = [];
  let line = '';
  let lineY = Number.NaN;
  for (const it of enriched) {
    if (Number.isNaN(lineY) || Math.abs(it.y - lineY) > Y_LINE_THRESHOLD) {
      if (line.trim()) lines.push(line.trim());
      line = it.str;
      lineY = it.y;
    } else {
      line += (line ? ' ' : '') + it.str;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

/**
 * Extract plain text from a PDF in the browser (no server upload).
 * Quality depends on how the PDF was produced (text-based vs scanned images).
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;
  const chunks: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lines = itemsToLines(textContent.items as unknown[]);
    if (lines.length) chunks.push(lines.join('\n'));
  }

  return chunks.join('\n\n').trim();
}
