// utils/beacon.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function joinUrl(base: string, path: string) {
  const b = base.endsWith('/') ? base : base + '/';
  const p = path.replace(/^\/+/, '');
  return new URL(p, b).toString();
}

export type Payload = Record<string, unknown>;

export async function sendOne(endpoint: string, payload: Payload): Promise<boolean> {
  const url = endpoint.startsWith('http') ? endpoint : joinUrl(API_BASE, endpoint);

  const body = JSON.stringify({ ...payload, ts: Date.now() });

  try {
    void fetch(url, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      credentials: 'include',
    });
    return true;
  } catch {
    return false;
  }
}
