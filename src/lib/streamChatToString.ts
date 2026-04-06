import { streamChat } from '@/lib/chat';
import type { ChatCoachType } from '@/lib/coach-types';

type Msg = { role: 'user' | 'assistant'; content: string };

export async function streamChatToString(params: {
  messages: Msg[];
  type: ChatCoachType;
  language: string;
  context?: string;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let text = '';
  return new Promise((resolve) => {
    streamChat({
      ...params,
      onDelta: (chunk) => {
        text += chunk;
      },
      onDone: () => resolve({ ok: true, text }),
      onError: (error) => resolve({ ok: false, error }),
    });
  });
}
