// Los 5 momentos pedagógicos — orden canónico, colores e íconos.
// El backend devuelve bloques con `momento` = una de estas claves.
export const MOMENTOS = {
  enganche: {
    key: 'enganche', label: 'Enganche', order: 0, icon: 'ph-lightbulb',
    bg: 'var(--m-enganche-bg)', fg: 'var(--m-enganche-fg)', solid: 'var(--m-enganche-solid)',
  },
  conceptualizacion: {
    key: 'conceptualizacion', label: 'Conceptualización', order: 1, icon: 'ph-book-open-text',
    bg: 'var(--m-concepto-bg)', fg: 'var(--m-concepto-fg)', solid: 'var(--m-concepto-solid)',
  },
  practica: {
    key: 'practica', label: 'Práctica guiada', order: 2, icon: 'ph-flask',
    bg: 'var(--m-practica-bg)', fg: 'var(--m-practica-fg)', solid: 'var(--m-practica-solid)',
  },
  debate: {
    key: 'debate', label: 'Debate', order: 3, icon: 'ph-chats-circle',
    bg: 'var(--m-debate-bg)', fg: 'var(--m-debate-fg)', solid: 'var(--m-debate-solid)',
  },
  cierre: {
    key: 'cierre', label: 'Cierre metacognitivo', order: 4, icon: 'ph-flag-checkered',
    bg: 'var(--m-cierre-bg)', fg: 'var(--m-cierre-fg)', solid: 'var(--m-cierre-solid)',
  },
};

export const MOMENTO_ORDER = ['enganche', 'conceptualizacion', 'practica', 'debate', 'cierre'];

export function momentoOf(key) {
  return MOMENTOS[key] || MOMENTOS.conceptualizacion;
}

export const DURACIONES = [60, 75, 90, 120];
export const GRUPOS = [
  { value: '6º semestre', label: '6.º semestre' },
  { value: '7º semestre', label: '7.º semestre' },
  { value: '8º semestre', label: '8.º semestre' },
];
