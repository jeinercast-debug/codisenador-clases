import React from 'react';

/* ============================ Button ============================ */
const PAD = { sm: '0 14px', md: '0 18px', lg: '0 24px' };
const H = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };
const FS = { sm: 'var(--size-body-s)', md: 'var(--size-body-m)', lg: 'var(--size-body-l)' };
const BTN_SKINS = {
  primary: { background: 'var(--brand)', color: 'var(--brand-on)', border: '1px solid transparent', boxShadow: 'var(--shadow-brand)' },
  accent: { background: 'var(--accent)', color: 'var(--accent-on)', border: '1px solid transparent', boxShadow: 'var(--shadow-sm)' },
  secondary: { background: 'var(--surface-card)', color: 'var(--brand-strong)', border: '1px solid var(--border-brand)', boxShadow: 'var(--shadow-xs)' },
  ghost: { background: 'transparent', color: 'var(--brand-strong)', border: '1px solid transparent', boxShadow: 'none' },
  danger: { background: 'var(--danger-500)', color: 'var(--white)', border: '1px solid transparent', boxShadow: 'var(--shadow-sm)' }
};
export function Button({ variant = 'primary', size = 'md', disabled = false, fullWidth = false, iconLeft, iconRight, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skin = BTN_SKINS[variant] || BTN_SKINS.primary;
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
        height: H[size], padding: PAD[size], width: fullWidth ? '100%' : 'auto',
        font: 'var(--wght-medium) ' + FS[size] + '/1 var(--font-ui)', letterSpacing: '0.005em',
        borderRadius: 'var(--radius-pill)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap', flexShrink: 0,
        transform: press && !disabled ? 'scale(var(--press-scale))' : 'scale(1)',
        filter: hover && !disabled ? 'brightness(0.94)' : 'none',
        transition: 'transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        ...skin,
        background: variant === 'ghost' && hover && !disabled ? 'var(--brand-soft)' : skin.background,
        ...style
      }}
      {...rest}
    >
      {iconLeft}{children}{iconRight}
    </button>
  );
}

/* ============================ IconButton ============================ */
const IB_S = { sm: 32, md: 40, lg: 48 };
export function IconButton({ variant = 'ghost', size = 'md', label, disabled = false, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skins = {
    ghost: { background: hover ? 'var(--brand-soft)' : 'transparent', color: 'var(--ink-600)', border: '1px solid transparent' },
    solid: { background: 'var(--brand)', color: 'var(--brand-on)', border: '1px solid transparent' },
    outline: { background: 'var(--surface-card)', color: 'var(--brand-strong)', border: '1px solid var(--border-subtle)' },
    danger: { background: hover ? 'var(--danger-100)' : 'transparent', color: 'var(--danger-500)', border: '1px solid transparent' }
  };
  return (
    <button aria-label={label} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        width: IB_S[size], height: IB_S[size], display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-pill)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transform: press ? 'scale(var(--press-scale))' : 'scale(1)',
        transition: 'all var(--dur-fast) var(--ease-out)', ...skins[variant], ...style
      }} {...rest}>{children}</button>
  );
}

/* ============================ Card ============================ */
export function Card({ tone = 'plain', interactive = false, padding = 'var(--space-7)', style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    plain: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' },
    tint: { background: 'var(--surface-tint)', border: '1px solid var(--blue-200)' },
    accent: { background: 'var(--accent-soft)', border: '1px solid var(--gold-300)' },
    earth: { background: 'var(--earth-soft)', border: '1px solid var(--clay-200)' },
    inverse: { background: 'var(--surface-inverse)', border: '1px solid var(--ink-800)', color: 'var(--text-inverse)' }
  };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-lg)', padding,
        boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all var(--dur-base) var(--ease-out)', ...tones[tone], ...style
      }} {...rest}>{children}</div>
  );
}

/* ============================ Badge ============================ */
const BADGE_TONES = {
  neutral: ['var(--ink-100)', 'var(--ink-700)'],
  brand: ['var(--brand-soft)', 'var(--blue-700)'],
  accent: ['var(--gold-200)', 'var(--gold-700)'],
  earth: ['var(--clay-200)', 'var(--clay-700)'],
  success: ['var(--success-100)', 'var(--success-500)'],
  danger: ['var(--danger-100)', 'var(--danger-500)']
};
export function Badge({ tone = 'neutral', dot = false, colors, style, children, ...rest }) {
  const [bg, fg] = colors || BADGE_TONES[tone] || BADGE_TONES.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: bg, color: fg,
      font: 'var(--wght-medium) var(--size-caption)/1 var(--font-ui)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase',
      padding: '5px 10px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', flexShrink: 0, ...style }} {...rest}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: fg }} />}
      {children}
    </span>
  );
}

/* ============================ Tag ============================ */
export function Tag({ removable = false, onRemove, selected = false, style, children, ...rest }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
      background: selected ? 'var(--brand)' : 'var(--surface-card)', color: selected ? 'var(--brand-on)' : 'var(--ink-700)',
      border: '1px solid ' + (selected ? 'transparent' : 'var(--border-default)'),
      font: 'var(--wght-regular) var(--size-body-s)/1 var(--font-ui)',
      padding: '7px 12px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', flexShrink: 0, ...style }} {...rest}>
      {children}
      {removable && <button onClick={onRemove} aria-label="Quitar" style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14, opacity: .6 }}>&#215;</button>}
    </span>
  );
}

/* ============================ Input ============================ */
export function Input({ label, hint, error, size = 'md', prefix, suffix, style, id, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = id || React.useId();
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && <label htmlFor={uid} style={{ font: 'var(--text-label)', color: 'var(--text-heading)' }}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', height: h, padding: '0 14px',
        background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)',
        border: '1px solid ' + (error ? 'var(--danger-500)' : focus ? 'var(--border-brand)' : 'var(--border-default)'),
        boxShadow: focus ? 'var(--ring-focus)' : 'var(--shadow-xs)',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)' }}>
        {prefix && <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{prefix}</span>}
        <input id={uid} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', color: 'var(--text-heading)',
            font: 'var(--wght-regular) var(--size-body-m)/1.2 var(--font-ui)', minWidth: 0, ...style }} {...rest} />
        {suffix && <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{suffix}</span>}
      </div>
      {(hint || error) && <span style={{ font: 'var(--wght-regular) var(--size-body-s)/1.3 var(--font-ui)', color: error ? 'var(--danger-500)' : 'var(--text-muted)' }}>{error || hint}</span>}
    </div>
  );
}

/* ============================ Textarea ============================ */
export function Textarea({ label, hint, error, rows = 4, style, id, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = id || React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && <label htmlFor={uid} style={{ font: 'var(--text-label)', color: 'var(--text-heading)' }}>{label}</label>}
      <textarea id={uid} rows={rows} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ resize: 'vertical', padding: '12px 14px', background: 'var(--surface-card)', color: 'var(--text-heading)',
          font: 'var(--wght-regular) var(--size-body-m)/1.5 var(--font-ui)',
          border: '1px solid ' + (error ? 'var(--danger-500)' : focus ? 'var(--border-brand)' : 'var(--border-default)'),
          borderRadius: 'var(--radius-sm)', boxShadow: focus ? 'var(--ring-focus)' : 'var(--shadow-xs)', outline: 'none',
          transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)', ...style }} {...rest} />
      {(hint || error) && <span style={{ font: 'var(--wght-regular) var(--size-body-s)/1.3 var(--font-ui)', color: error ? 'var(--danger-500)' : 'var(--text-muted)' }}>{error || hint}</span>}
    </div>
  );
}

/* ============================ Select ============================ */
export function Select({ label, hint, options = [], size = 'md', style, id, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = id || React.useId();
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && <label htmlFor={uid} style={{ font: 'var(--text-label)', color: 'var(--text-heading)' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex' }}>
        <select id={uid} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ appearance: 'none', width: '100%', height: h, padding: '0 38px 0 14px',
            background: 'var(--surface-card)', color: 'var(--text-heading)',
            font: 'var(--wght-regular) var(--size-body-m)/1 var(--font-ui)',
            border: '1px solid ' + (focus ? 'var(--border-brand)' : 'var(--border-default)'),
            borderRadius: 'var(--radius-sm)', boxShadow: focus ? 'var(--ring-focus)' : 'var(--shadow-xs)', outline: 'none', cursor: 'pointer', ...style }} {...rest}>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: 11 }}>&#9660;</span>
      </div>
      {hint && <span style={{ font: 'var(--wght-regular) var(--size-body-s)/1.3 var(--font-ui)', color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}

/* ============================ Dialog ============================ */
export function Dialog({ open = false, title, description, onClose, footer, width = 460, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'var(--blur-scrim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-7)', zIndex: 60 }}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}
        style={{ width, maxWidth: '100%', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {title && <h3 style={{ font: 'var(--wght-semibold) var(--size-heading-m)/1.2 var(--font-display)', color: 'var(--text-heading)', margin: 0 }}>{title}</h3>}
        {description && <p style={{ font: 'var(--wght-regular) var(--size-body-m)/1.5 var(--font-ui)', color: 'var(--text-muted)', margin: 0 }}>{description}</p>}
        {children}
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ============================ Toast ============================ */
const TOAST_TONES = {
  info: ['var(--brand-soft)', 'var(--blue-700)', 'var(--blue-200)'],
  success: ['var(--success-100)', 'var(--success-500)', '#BFE0CD'],
  warning: ['var(--gold-100)', 'var(--gold-700)', 'var(--gold-300)'],
  danger: ['var(--danger-100)', 'var(--danger-500)', '#F0C4BB']
};
export function Toast({ tone = 'info', title, message, icon, onDismiss, style }) {
  const [bg, fg, bd] = TOAST_TONES[tone] || TOAST_TONES.info;
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', background: bg, border: '1px solid ' + bd,
      borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)', boxShadow: 'var(--shadow-md)', minWidth: 280, ...style }}>
      {icon && <span style={{ color: fg, display: 'flex', marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && <strong style={{ font: 'var(--wght-medium) var(--size-body-m)/1.3 var(--font-ui)', color: fg }}>{title}</strong>}
        {message && <span style={{ font: 'var(--wght-regular) var(--size-body-s)/1.4 var(--font-ui)', color: 'var(--ink-700)' }}>{message}</span>}
      </div>
      {onDismiss && <button onClick={onDismiss} aria-label="Cerrar" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: fg, opacity: .6, fontSize: 15, lineHeight: 1, padding: 0 }}>&#215;</button>}
    </div>
  );
}

/* ============================ Spinner ============================ */
export function Spinner({ size = 20, color = 'currentColor', stroke = 2.5, style }) {
  return (
    <span className="spin" style={{ display: 'inline-flex', width: size, height: size, ...style }}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.22" strokeWidth={stroke} />
        <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    </span>
  );
}
