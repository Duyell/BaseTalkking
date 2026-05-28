import client from './client';
import type { SessionData } from '../types/chat';

export const getSession = (): Promise<SessionData> => {
  return client.get('/ai/sessions');
};

export const deleteSession = (id: number): Promise<void> => {
  return client.delete(`/ai/sessions/${id}`);
};

export function sendChatMessage(
  message: string,
  onMeta: (sessionId: number) => void,
  onDelta: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): AbortController {
  const controller = new AbortController();
  const token = localStorage.getItem('token');

  fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError('网络请求失败');
        return;
      }
      if (!response.body) {
        onError('流式响应不支持');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data:')) {
            const data = line.slice(6);
            if (currentEvent === 'meta') {
              try {
                const parsed = JSON.parse(data) as { session_id: number };
                onMeta(parsed.session_id);
              } catch {
                // ignore parse errors
              }
            } else if (currentEvent === 'delta') {
              try {
                const content = JSON.parse(data) as string;
                onDelta(content);
              } catch {
                // ignore parse errors
              }
            } else if (currentEvent === 'error') {
              onError(data);
            } else if (currentEvent === 'done') {
              onDone();
            }
          }
        }
      }
    })
    .catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      onError(err instanceof Error ? err.message : '请求失败');
    });

  return controller;
}
