# Codiseñador de Clases

Herramienta personal de Jeiner Castellanos-Barliza para convertir un tema en una sesión de
clase planificada: **mapa visual de los 5 momentos pedagógicos** + **guión hablado por bloque**.

De un tema a una clase lista para dar, respetando el estilo pedagógico propio (5 momentos,
ciclos atencionales de ~20 min, MPICA, ABP con casos colombianos, al menos una estrategia nueva).

## Puesta en marcha

Requiere [Node.js](https://nodejs.org) 18 o superior (ya tenés v24).

1. Instalá las dependencias:

   ```bash
   npm install
   ```

2. Configurá tu clave de la API de Claude:

   ```bash
   cp .env.example .env
   ```

   Abrí `.env` y pegá tu clave en `ANTHROPIC_API_KEY=` (la conseguís en
   https://console.anthropic.com/settings/keys).

3. Arrancá la app:

   ```bash
   npm run dev
   ```

   Abrí http://localhost:5173

## Cómo se usa

1. **Tema** — escribí el tema, elegí duración (60/75/90/120 min) y grupo. Opcionalmente pegá
   notas o texto de tus diapositivas. Clic en **Diseñar sesión**.
2. **Mapa** — la app arma los 5 momentos con tiempos y estrategias. Editá tiempos (los demás se
   reajustan), cambiá la estrategia de un bloque, reordená, o **Regenerá el mapa**. Un bloque
   trae una **estrategia nueva** marcada.
3. **Guión** — clic en **Generar guión**. Por cada bloque: qué decir, qué preguntar, qué
   actividad, por qué esa estrategia y la transición. **Copiá todo** o **Imprimí**.

No hay login, no guarda sesiones (v1): exportás copiando o imprimiendo.

## Arquitectura

- **Frontend**: React + Vite. Diseño = sistema *Fredoka Blue* (tokens y componentes portados).
- **Backend**: Express en modo middleware de Vite (un solo proceso, un solo comando). Expone
  `/api/design-map` y `/api/generate-script`, que hablan con la API de Claude usando la clave
  del `.env` (nunca se expone al navegador).
- **Prompts pedagógicos**: en `server/pedagogy.js` (las reglas de estilo) y `server/generate.js`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo con recarga en caliente + API. |
| `npm run build` | Compila el frontend a `dist/`. |
| `npm run start` | Sirve el build de producción + API. |
| `npm run preview` | `build` + `start`. |

## Notas

- El modelo por defecto es `claude-sonnet-5`; se cambia con `ANTHROPIC_MODEL` en el `.env` (ej. `claude-opus-5` para máxima calidad).
- La generación tarda ~10–20 s (mapa) y algo más (guión).
