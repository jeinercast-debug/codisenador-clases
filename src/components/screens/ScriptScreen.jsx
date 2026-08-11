import React from 'react';
import Shell from '../Shell.jsx';
import { Button, Card, Badge, Toast } from '../ds/index.jsx';
import { momentoOf } from '../../lib/momentos.js';

function Section({ icon, label, children }) {
  if (!children) return null;
  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, color: 'var(--text-heading)' }}>
        <i className={'ph ' + icon} style={{ fontSize: 15, color: 'var(--brand)' }} />
        <span style={{ font: 'var(--wght-medium) var(--size-body-s)/1 var(--font-ui)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ color: 'var(--text-body)', fontSize: 'var(--size-body-m)', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function paragraphs(text) {
  return String(text).split(/\n{2,}|\n/).filter((p) => p.trim()).map((p, i) => (
    <p key={i} style={{ margin: '0 0 var(--space-3)' }}>{p}</p>
  ));
}

// Construye el texto plano para "Copiar todo".
function buildPlainText(form, blocks, scripts) {
  const lines = [];
  lines.push(`GUIÓN DE SESIÓN — ${form.topic}`);
  lines.push(`${form.duration} min · ${form.group} · ${new Date().toLocaleDateString('es-CO')}`);
  lines.push('');
  blocks.forEach((b, i) => {
    const m = momentoOf(b.momento);
    const s = scripts[i] || {};
    lines.push('─'.repeat(52));
    lines.push(`${m.label.toUpperCase()} · ${b.title} · ${b.minutes} min${b.isNew ? ' (estrategia nueva)' : ''}`);
    lines.push('');
    if (s.sayText) { lines.push('QUÉ DECIR:'); lines.push(s.sayText); lines.push(''); }
    if (s.askQuestions && s.askQuestions.length) { lines.push('QUÉ PREGUNTAR:'); s.askQuestions.forEach((q) => lines.push('• ' + q)); lines.push(''); }
    if (s.activity) { lines.push('QUÉ ACTIVIDAD:'); lines.push(s.activity); lines.push(''); }
    if (s.why) { lines.push('POR QUÉ ESTA ESTRATEGIA:'); lines.push(s.why); lines.push(''); }
    if (s.transition) { lines.push('TRANSICIÓN:'); lines.push(s.transition); lines.push(''); }
  });
  return lines.join('\n');
}

export default function ScriptScreen({ form, blocks, scripts, onBack, onNavigate, maxStep }) {
  const [copied, setCopied] = React.useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText(form, blocks, scripts));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Shell active="script" maxStep={maxStep} onNavigate={onNavigate}>
      <button onClick={onBack} className="no-print" style={{ border: 0, background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 'var(--space-6)', fontSize: 13, fontFamily: 'var(--font-ui)' }}>
        <i className="ph ph-arrow-left" /> Volver al mapa
      </button>

      <div className="fade-up print-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ marginBottom: 8 }}>{form.topic}</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {form.duration} min · {form.group} · {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }} className="no-print">
            <Button variant="secondary" onClick={() => window.print()} iconLeft={<i className="ph ph-printer" style={{ fontSize: 17 }} />}>Imprimir</Button>
            <Button variant="primary" onClick={copyAll} iconLeft={<i className={'ph ' + (copied ? 'ph-check' : 'ph-copy')} style={{ fontSize: 17 }} />}>
              {copied ? 'Copiado' : 'Copiar todo'}
            </Button>
          </div>
        </div>

        {/* Mini-mapa */}
        <Card tone="tint" padding="var(--space-5)" style={{ marginBottom: 'var(--space-7)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {blocks.map((b, i) => {
            const m = momentoOf(b.momento);
            return (
              <div key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)', padding: '5px 12px 5px 8px' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: m.bg, color: m.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                  <i className={'ph ' + m.icon} />
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-body)', fontFamily: 'var(--font-ui)' }}>{m.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.minutes}′</span>
                {i < blocks.length - 1 && <i className="ph ph-arrow-right" style={{ fontSize: 12, color: 'var(--ink-300)', marginLeft: 2 }} />}
              </div>
            );
          })}
        </Card>

        <div style={{ maxWidth: '72ch', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {blocks.map((b, i) => {
            const m = momentoOf(b.momento);
            const s = scripts[i] || {};
            return (
              <Card key={b.id} className="script-block" tone="plain" padding="var(--space-8)" style={{ borderTop: `4px solid ${m.solid}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <Badge colors={[m.bg, m.fg]}>{m.label}</Badge>
                  {b.isNew && <Badge style={{ background: 'var(--gold-200)', color: 'var(--gold-700)' }}><i className="ph ph-star" style={{ fontSize: 11 }} /> Estrategia nueva</Badge>}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{b.minutes} min</span>
                </div>
                <h3 style={{ margin: '0 0 2px' }}>{b.title}</h3>

                <Section icon="ph-chat-teardrop-text" label="Qué decir">{s.sayText ? paragraphs(s.sayText) : null}</Section>
                {s.askQuestions && s.askQuestions.length > 0 && (
                  <Section icon="ph-question" label="Qué preguntar">
                    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.askQuestions.map((q, k) => <li key={k}>{q}</li>)}
                    </ul>
                  </Section>
                )}
                <Section icon="ph-flask" label="Qué actividad">{s.activity ? paragraphs(s.activity) : null}</Section>
                {s.why && (
                  <div style={{ marginTop: 'var(--space-4)', background: m.bg, borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <i className="ph ph-lightbulb-filament" style={{ fontSize: 16, color: m.fg, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: m.fg, lineHeight: 1.5 }}><strong>Por qué: </strong>{s.why}</span>
                  </div>
                )}
                {s.transition && (
                  <Section icon="ph-arrow-bend-down-right" label="Transición">
                    <em style={{ color: 'var(--text-muted)' }}>{s.transition}</em>
                  </Section>
                )}
              </Card>
            );
          })}
        </div>

        {copied && (
          <div className="no-print" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
            <Toast tone="success" message="Guión copiado al portapapeles." icon={<i className="ph ph-check-circle" style={{ fontSize: 18 }} />} />
          </div>
        )}
      </div>
    </Shell>
  );
}
