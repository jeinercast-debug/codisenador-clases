// Reajuste proporcional de tiempos: al cambiar un bloque, los demás
// se reparten el resto para que la suma siga siendo la duración total.

export function totalMinutes(blocks) {
  return blocks.reduce((a, b) => a + (Number(b.minutes) || 0), 0);
}

// Devuelve una copia de `blocks` con el bloque `index` en `newMinutes`
// y los demás reajustados proporcionalmente para sumar `total`.
export function rebalance(blocks, index, newMinutes, total) {
  const n = blocks.length;
  const clamped = Math.max(1, Math.round(newMinutes));
  const next = blocks.map((b) => ({ ...b }));

  // El bloque editado no puede exceder (total - (n-1)) para dejar >=1 a cada otro.
  const maxForEdited = total - (n - 1);
  const edited = Math.min(clamped, Math.max(1, maxForEdited));
  next[index].minutes = edited;

  const others = next.filter((_, i) => i !== index);
  const remaining = total - edited;
  const othersSum = others.reduce((a, b) => a + b.minutes, 0) || 1;

  // Reparto proporcional, con mínimo 1 por bloque.
  let acc = 0;
  others.forEach((b, k) => {
    if (k === others.length - 1) {
      b.minutes = Math.max(1, remaining - acc);
    } else {
      const share = Math.max(1, Math.round((b.minutes / othersSum) * remaining));
      b.minutes = share;
      acc += share;
    }
  });

  return { blocks: next, exceeded: clamped > maxForEdited };
}

// Normaliza tras reordenar/añadir/quitar: escala para que sume `total`.
export function scaleTo(blocks, total) {
  const n = blocks.length;
  if (n === 0) return blocks;
  const cur = totalMinutes(blocks) || 1;
  const next = blocks.map((b) => ({ ...b, minutes: Math.max(1, Math.round((b.minutes / cur) * total)) }));
  // Corrige el redondeo en el último bloque.
  const diff = total - totalMinutes(next);
  next[n - 1].minutes = Math.max(1, next[n - 1].minutes + diff);
  return next;
}
