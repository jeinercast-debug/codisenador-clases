import Anthropic from '@anthropic-ai/sdk';
import { ESTILO_PEDAGOGICO, MOMENTOS_DEF } from './pedagogy.js';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const MAX_NOTES = 10000;

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const e = new Error('Falta ANTHROPIC_API_KEY. Copiá .env.example a .env y pegá tu clave.');
    e.status = 500;
    throw e;
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function clampNotes(notes) {
  if (!notes) return { text: '', truncated: false };
  if (notes.length <= MAX_NOTES) return { text: notes, truncated: false };
  return { text: notes.slice(0, MAX_NOTES), truncated: true };
}

// Extrae el primer bloque JSON válido de la respuesta del modelo.
function extractJson(text) {
  if (!text) throw new Error('Respuesta vacía del modelo.');
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('El modelo no devolvió JSON.');
  return JSON.parse(raw.slice(start, end + 1));
}

async function callModel({ system, user, maxTokens }) {
  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: 'disabled' }, // salida JSON determinista y rápida (sin thinking)
    system,
    messages: [{ role: 'user', content: user }],
  });
  const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return text;
}

/* ============================ MAPA ============================ */

export async function designMap({ topic, duration, group, notes }) {
  if (!topic || !String(topic).trim()) {
    const e = new Error('Escribí un tema para diseñar la sesión.');
    e.status = 400;
    throw e;
  }
  const { text: notesText, truncated } = clampNotes(notes);

  const system = `${ESTILO_PEDAGOGICO}\n\n${MOMENTOS_DEF}

TAREA: Diseñá el MAPA de una sesión de clase como un arreglo de bloques (los 5 momentos).
Repartí los minutos para que sumen EXACTAMENTE la duración total. Respetá el tope de 20 min
para conceptualización (si hace falta, dividí en dos bloques de conceptualización cortos).
Marcá con "isNew": true EXACTAMENTE UN bloque cuya estrategia sea una que Jeiner no usaría por
defecto. Para cada bloque ofrecé 3 alternativas de estrategia contextualizadas al tema.

Devolvé SOLO un objeto JSON con esta forma exacta (sin texto adicional):
{
  "blocks": [
    {
      "momento": "enganche" | "conceptualizacion" | "practica" | "debate" | "cierre",
      "title": "nombre corto de la estrategia concreta para este bloque",
      "minutes": number,
      "note": "una línea describiendo la actividad de este bloque",
      "isNew": boolean,
      "alternatives": [
        { "title": "estrategia alternativa", "note": "una línea de qué haría" }
      ]
    }
  ]
}
Los momentos van en el orden canónico: enganche, conceptualizacion, practica, debate, cierre.
Puede haber un bloque extra de conceptualizacion si el tema lo exige (máx 6 bloques).`;

  const user = `Tema: ${topic}
Duración total: ${duration} minutos
Grupo: ${group}
${notesText ? `\nNotas / texto de diapositivas del docente:\n"""\n${notesText}\n"""` : ''}

Diseñá el mapa de la sesión.`;

  const text = await callModel({ system, user, maxTokens: 3000 });
  const data = extractJson(text);
  const blocks = normalizeBlocks(data.blocks, Number(duration));
  return { blocks, notesTruncated: truncated };
}

function normalizeBlocks(blocks, duration) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('El modelo no devolvió bloques válidos.');
  }
  const valid = ['enganche', 'conceptualizacion', 'practica', 'debate', 'cierre'];
  let cleaned = blocks.map((b, i) => ({
    id: `b${i}-${Date.now()}`,
    momento: valid.includes(b.momento) ? b.momento : 'conceptualizacion',
    title: String(b.title || 'Bloque').slice(0, 120),
    minutes: Math.max(1, Math.round(Number(b.minutes) || 1)),
    note: String(b.note || '').slice(0, 300),
    isNew: Boolean(b.isNew),
    alternatives: Array.isArray(b.alternatives)
      ? b.alternatives.slice(0, 4).map((a) => ({
          title: String(a.title || '').slice(0, 120),
          note: String(a.note || '').slice(0, 240),
        }))
      : [],
  }));

  // Orden canónico garantizado en código — no depende de que el modelo lo acierte.
  // Sort estable: si hay dos bloques de "conceptualizacion" (tema que exige dividir
  // la exposición), conservan el orden relativo en que los devolvió el modelo.
  const ORDER = { enganche: 0, conceptualizacion: 1, practica: 2, debate: 3, cierre: 4 };
  cleaned = cleaned
    .map((b, i) => ({ b, i }))
    .sort((x, y) => (ORDER[x.b.momento] - ORDER[y.b.momento]) || (x.i - y.i))
    .map(({ b }) => b);

  // Garantiza que exactamente un bloque tenga isNew.
  if (!cleaned.some((b) => b.isNew)) {
    const idx = cleaned.findIndex((b) => b.momento === 'practica');
    cleaned[idx >= 0 ? idx : 0].isNew = true;
  }

  // Ajusta la suma a la duración exacta corrigiendo en el último bloque.
  const sum = cleaned.reduce((a, b) => a + b.minutes, 0);
  if (sum !== duration && cleaned.length > 0) {
    cleaned[cleaned.length - 1].minutes = Math.max(1, cleaned[cleaned.length - 1].minutes + (duration - sum));
  }
  return cleaned;
}

/* ============================ GUIÓN ============================ */

export async function generateScript({ topic, duration, group, notes, blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    const e = new Error('No hay mapa para generar el guión.');
    e.status = 400;
    throw e;
  }
  const { text: notesText } = clampNotes(notes);

  const mapSummary = blocks
    .map((b, i) => `${i + 1}. [${b.momento}] ${b.title} — ${b.minutes} min${b.isNew ? ' (estrategia nueva)' : ''}: ${b.note}`)
    .join('\n');

  const system = `${ESTILO_PEDAGOGICO}\n\n${MOMENTOS_DEF}

TAREA: Escribí el GUIÓN COMPLETO de la sesión, un guión por cada bloque del mapa, en el mismo
orden. El guión es lo que Jeiner lleva al aula: NO es un resumen de diapositivas, es su discurso
pedagógico. "sayText" va en primera persona, como si Jeiner hablara frente al grupo.

Devolvé SOLO un objeto JSON con esta forma exacta (sin texto adicional):
{
  "scripts": [
    {
      "sayText": "discurso en primera persona para este bloque (varios párrafos si hace falta)",
      "askQuestions": ["pregunta concreta 1", "pregunta 2"],
      "activity": "instrucciones paso a paso de la actividad, con materiales. Vacío si no aplica.",
      "why": "una línea: el fundamento pedagógico de esta estrategia (sin citas inventadas)",
      "transition": "frase puente para conectar con el bloque siguiente (vacío en el último)"
    }
  ]
}
Debe haber EXACTAMENTE ${blocks.length} entradas en "scripts", una por bloque, en el mismo orden.`;

  const user = `Tema: ${topic}
Duración: ${duration} min · Grupo: ${group}

MAPA DE LA SESIÓN (respetá este orden, estrategias y tiempos):
${mapSummary}
${notesText ? `\nNotas / diapositivas del docente:\n"""\n${notesText}\n"""` : ''}

Escribí el guión completo, un guión por bloque.`;

  const text = await callModel({ system, user, maxTokens: 8000 });
  const data = extractJson(text);
  const scripts = normalizeScripts(data.scripts, blocks.length);
  return { scripts };
}

function normalizeScripts(scripts, expected) {
  if (!Array.isArray(scripts)) throw new Error('El modelo no devolvió el guión.');
  const out = [];
  for (let i = 0; i < expected; i++) {
    const s = scripts[i] || {};
    out.push({
      sayText: String(s.sayText || '').trim(),
      askQuestions: Array.isArray(s.askQuestions)
        ? s.askQuestions.map((q) => String(q).trim()).filter(Boolean)
        : [],
      activity: String(s.activity || '').trim(),
      why: String(s.why || '').trim(),
      transition: String(s.transition || '').trim(),
    });
  }
  return out;
}
