import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { designMap, generateScript } from './server/generate.js';
import { extractTextFromBuffer } from './server/extract-text.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5175;
const isProd = process.env.NODE_ENV === 'production';

async function start() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // --- API de generación ---
  app.post('/api/design-map', async (req, res) => {
    try {
      const { topic, duration, group, notes } = req.body || {};
      const result = await designMap({ topic, duration: Number(duration) || 90, group: group || '6º semestre', notes });
      res.json(result);
    } catch (err) {
      console.error('[design-map]', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Error generando el mapa.' });
    }
  });

  app.post('/api/generate-script', async (req, res) => {
    try {
      const { topic, duration, group, notes, blocks } = req.body || {};
      const result = await generateScript({ topic, duration: Number(duration) || 90, group: group || '6º semestre', notes, blocks });
      res.json(result);
    } catch (err) {
      console.error('[generate-script]', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Error generando el guión.' });
    }
  });

  app.post('/api/extract-text', async (req, res) => {
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
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY), model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5' });
  });

  if (isProd) {
    // Sirve el build estático.
    const sirv = (await import('sirv')).default;
    app.use(sirv(path.join(__dirname, 'dist'), { single: true, extensions: [] }));
  } else {
    // Vite en modo middleware: un solo proceso con HMR + API.
    const vite = await createViteServer({
      root: __dirname,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`\n  Codiseñador de Clases → http://localhost:${PORT}\n`);
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('  ⚠  Falta ANTHROPIC_API_KEY. Copiá .env.example a .env y pegá tu clave para generar.\n');
    }
  });
}

start();
