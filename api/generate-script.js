import { generateScript } from '../server/generate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { topic, duration, group, notes, blocks } = req.body || {};
    const result = await generateScript({ topic, duration: Number(duration) || 90, group: group || '6º semestre', notes, blocks });
    res.json(result);
  } catch (err) {
    console.error('[generate-script]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error generando el guión.' });
  }
}
