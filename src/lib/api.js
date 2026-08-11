const TIMEOUT_MS = 90000;

async function post(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('La generación tardó demasiado. Intentá de nuevo.');
    }
    throw new Error('No se pudo conectar con el servidor de generación.');
  }
  clearTimeout(timer);

  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const msg = (data && data.error) || 'No pude generar la sesión. Intentá de nuevo.';
    throw new Error(msg);
  }
  return data;
}

export function designMap({ topic, duration, group, notes }) {
  return post('/api/design-map', { topic, duration, group, notes });
}

export function generateScript({ topic, duration, group, notes, blocks }) {
  return post('/api/generate-script', { topic, duration, group, notes, blocks });
}

export async function extractText(file) {
  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), '')
  );
  return post('/api/extract-text', { filename: file.name, data: base64 });
}
