import React from 'react';
import Shell from '../Shell.jsx';
import { Button, Card, Badge, Tag, IconButton, Spinner, Toast } from '../ds/index.jsx';
import { momentoOf } from '../../lib/momentos.js';
import { rebalance, totalMinutes } from '../../lib/rebalance.js';

function TimeBar({ blocks, total }) {
  return (
    <div style={{ display: 'flex', height: 12, borderRadius: 'var(--radius-pill)', overflow: 'hidden', gap: 2, background: 'var(--surface-sunken)' }}>
      {blocks.map((b) => {
        const m = momentoOf(b.momento);
        return (
          <div key={b.id} title={`${m.label} · ${b.minutes} min`}
            style={{ flexGrow: b.minutes, flexBasis: 0, background: m.solid, transition: 'flex-grow var(--dur-base) var(--ease-out)' }} />
        );
      })}
    </div>
  );
}

function BlockCard({ block, index, count, editing, onEdit, onClose, onChangeMinutes, onChangeStrategy, onMove }) {
  const m = momentoOf(block.momento);
  const stratOptions = [{ title: block.title, note: block.note }, ...block.alternatives.filter((a) => a.title && a.title !== block.title)];

  return (
    <div style={{ position: 'relative' }}>
      <Card tone="plain" padding="var(--space-6)" style={{ borderLeft: `4px solid ${m.solid}`, display: 'flex', flexDirection: 'column', gap: editing ? 'var(--space-5)' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: m.bg, color: m.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={'ph ' + m.icon} style={{ fontSize: 20 }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
              <Badge colors={[m.bg, m.fg]}>{m.label}</Badge>
              {block.isNew && (
                <Badge tone="accent" style={{ background: 'var(--gold-200)', color: 'var(--gold-700)' }}>
                  <i className="ph ph-star" style={{ fontSize: 11 }} /> Estrategia nueva
                </Badge>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--text-heading)' }}>{block.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{block.note}</div>
          </div>
          <Tag style={{ fontWeight: 500 }}>{block.minutes} min</Tag>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }} className="no-print">
            <IconButton variant="ghost" size="sm" label="Subir bloque" disabled={index === 0} onClick={() => onMove(index, -1)}><i className="ph ph-caret-up" /></IconButton>
            <IconButton variant="ghost" size="sm" label="Bajar bloque" disabled={index === count - 1} onClick={() => onMove(index, 1)}><i className="ph ph-caret-down" /></IconButton>
          </div>
          <IconButton variant={editing ? 'solid' : 'ghost'} label="Editar bloque" onClick={() => (editing ? onClose() : onEdit(block.id))} className="no-print">
            <i className={'ph ' + (editing ? 'ph-check' : 'ph-pencil-simple')} />
          </IconButton>
        </div>

        {editing && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ font: 'var(--text-label)', color: 'var(--text-heading)', display: 'block', marginBottom: 8 }}>
                Tiempo del bloque · {block.minutes} min
              </label>
              <input type="range" min="1" max="60" value={block.minutes} onChange={(e) => onChangeMinutes(index, Number(e.target.value))}
                style={{ width: '100%', accentColor: m.solid }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Los demás bloques se reajustan para mantener el total.</div>
            </div>
            <div>
              <label style={{ font: 'var(--text-label)', color: 'var(--text-heading)', display: 'block', marginBottom: 8 }}>Estrategia</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stratOptions.map((opt, k) => {
                  const selected = opt.title === block.title;
                  return (
                    <button key={k} onClick={() => onChangeStrategy(index, opt)} style={{
                      textAlign: 'left', border: '1px solid ' + (selected ? m.solid : 'var(--border-subtle)'),
                      background: selected ? m.bg : 'var(--surface-card)', borderRadius: 'var(--radius-md)',
                      padding: '10px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                      transition: 'all var(--dur-fast) var(--ease-out)', fontFamily: 'var(--font-ui)',
                    }}>
                      <i className={'ph ' + (selected ? 'ph-radio-button' : 'ph-circle')} style={{ fontSize: 18, color: selected ? m.fg : 'var(--ink-400)', marginTop: 1 }} />
                      <span>
                        <span style={{ display: 'block', fontWeight: 500, fontSize: 14, color: 'var(--text-heading)' }}>{opt.title}</span>
                        {opt.note && <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{opt.note}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
      {index < count - 1 && (
        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', color: 'var(--ink-300)', margin: '2px 0' }}>
          <i className="ph ph-arrow-down" style={{ fontSize: 18 }} />
        </div>
      )}
    </div>
  );
}

export default function MapScreen({ form, blocks, setBlocks, onGenerate, onRegenerate, onBack, generating, regenerating, error, notesTruncated, onNavigate, maxStep }) {
  const [editingId, setEditingId] = React.useState(null);
  const [exceeded, setExceeded] = React.useState(false);
  const total = totalMinutes(blocks);
  const target = Number(form.duration);

  const changeMinutes = (index, value) => {
    const { blocks: next, exceeded: ex } = rebalance(blocks, index, value, target);
    setExceeded(ex);
    setBlocks(next);
  };
  const changeStrategy = (index, opt) => {
    setBlocks(blocks.map((b, i) => (i === index ? { ...b, title: opt.title, note: opt.note || b.note } : b)));
  };
  const move = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[index], next[j]] = [next[j], next[index]];
    setBlocks(next);
  };

  return (
    <Shell active="map" maxStep={maxStep} onNavigate={onNavigate}>
      <button onClick={onBack} className="no-print" style={{ border: 0, background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 'var(--space-6)', fontSize: 13, fontFamily: 'var(--font-ui)' }}>
        <i className="ph ph-arrow-left" /> Cambiar tema
      </button>

      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ marginBottom: 8 }}>{form.topic}</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Sesión de <strong style={{ color: 'var(--text-body)' }}>{target} min</strong> para <strong style={{ color: 'var(--text-body)' }}>{form.group}</strong> · {blocks.length} bloques
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }} className="no-print">
            <Button variant="secondary" disabled={regenerating || generating} onClick={onRegenerate}
              iconLeft={regenerating ? <Spinner size={17} /> : <i className="ph ph-arrows-clockwise" style={{ fontSize: 17 }} />}>
              {regenerating ? 'Regenerando…' : 'Regenerar mapa'}
            </Button>
            <Button variant="accent" disabled={generating || regenerating} onClick={onGenerate}
              iconLeft={generating ? <Spinner size={18} color="var(--accent-on)" /> : <i className="ph ph-magic-wand" style={{ fontSize: 18 }} />}>
              {generating ? 'Generando guión…' : 'Generar guión'}
            </Button>
          </div>
        </div>

        <Card tone="tint" padding="var(--space-5)" style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--blue-700)', fontWeight: 500 }}>
            <span>Distribución del tiempo</span>
            <span>{total} / {target} min</span>
          </div>
          <TimeBar blocks={blocks} total={target} />
        </Card>

        {exceeded && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Toast tone="warning" title="Tiempo ajustado" message="Ese bloque excedía la duración de la sesión; se limitó para que el resto conserve al menos un minuto." icon={<i className="ph ph-clock-countdown" style={{ fontSize: 18 }} />} />
          </div>
        )}
        {notesTruncated && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Toast tone="info" message="Solo se usaron los primeros ~10.000 caracteres de tus notas." icon={<i className="ph ph-info" style={{ fontSize: 18 }} />} />
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Toast tone="danger" title="Algo falló" message={error} icon={<i className="ph ph-warning-circle" style={{ fontSize: 18 }} />} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {blocks.map((b, i) => (
            <BlockCard key={b.id} block={b} index={i} count={blocks.length}
              editing={editingId === b.id}
              onEdit={setEditingId} onClose={() => setEditingId(null)}
              onChangeMinutes={changeMinutes} onChangeStrategy={changeStrategy} onMove={move} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
