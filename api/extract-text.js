import { extractTextFromBuffer } from '../server/extract-text.js';

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { filename, data } = req.body || {};
    if (!filename || !data) {
      return res.status(400).json({ error: 'Falta el archivo.' });
    }
    const buffer = Buffer.from(data, 'base64');
    const text = await extractTextFromBuffer(buffer, filename);
    res.json({ text, chars: text.length });
  } catch (err) {
    console.error('[extract-text]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error extrayendo texto del archivo.' });
  }
}
