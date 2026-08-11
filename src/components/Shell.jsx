import React from 'react';

const STEPS = [
  { k: 'input', icon: 'ph-pencil-line', label: 'Tema' },
  { k: 'map', icon: 'ph-flow-arrow', label: 'Mapa' },
  { k: 'script', icon: 'ph-notebook', label: 'Guión' },
];

// El paso es alcanzable si ya se llegó a él (orden lineal).
const REACHABLE = { input: ['input'], map: ['input', 'map'], script: ['input', 'map', 'script'] };

export default function Shell({ active, maxStep = 'input', onNavigate, children }) {
  const reachable = REACHABLE[maxStep] || ['input'];
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="app-shell-sidebar no-print" style={{
        width: 220, flexShrink: 0, background: 'var(--surface-inverse)', color: 'var(--text-inverse)',
        display: 'flex', flexDirection: 'column', padding: 'var(--space-7) var(--space-5)', gap: 'var(--space-8)',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>
          Codiseñador<br />de Clases
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STEPS.map((s, i) => {
            const isActive = active === s.k;
            const canGo = reachable.includes(s.k);
            return (
              <button key={s.k} disabled={!canGo} onClick={() => canGo && onNavigate && onNavigate(s.k)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'rgba(255,255,255,.1)' : 'transparent',
                  color: isActive ? '#fff' : canGo ? 'var(--ink-400)' : 'var(--ink-600)',
                  fontSize: 14, fontWeight: 500, border: 0, textAlign: 'left', width: '100%',
                  cursor: canGo ? 'pointer' : 'default', fontFamily: 'var(--font-ui)',
                  transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
                }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                  background: isActive ? 'var(--brand)' : 'rgba(255,255,255,.08)',
                  color: isActive ? '#fff' : 'inherit',
                }}>{i + 1}</span>
                <i className={'ph ' + s.icon} style={{ fontSize: 17 }} />
                {s.label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5 }}>
          Ecología · Biología Evolutiva<br />ITM · Jeiner Castellanos-Barliza
        </div>
      </aside>
      <main className="app-shell-main" style={{ flex: 1, minWidth: 0, padding: 'var(--space-9) var(--space-10)' }}>
        {children}
      </main>
    </div>
  );
}
