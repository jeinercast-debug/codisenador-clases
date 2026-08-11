import { designMap } from '../server/generate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { topic, duration, group, notes } = req.body || {};
    const result = await designMap({ topic, duration: Number(duration) || 90, group: group || '6º semestre', notes });
    res.json(result);
  } catch (err) {
    console.error('[design-map]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error generando el mapa.' });
  }
}
