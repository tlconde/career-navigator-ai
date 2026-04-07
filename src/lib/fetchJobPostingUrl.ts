const FETCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-job-url`;

export async function fetchJobPostingText(
  url: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const resp = await fetch(FETCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ url: url.trim() }),
    });
    const data = (await resp.json()) as { text?: string; error?: string };
    if (!resp.ok) {
      return { ok: false, error: data.error || 'Request failed' };
    }
    const text = typeof data.text === 'string' ? data.text : '';
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
