import React from 'react';
import Shell from '../Shell.jsx';
import { Button, Card, Textarea, Select, Spinner, Toast } from '../ds/index.jsx';
import { DURACIONES, GRUPOS } from '../../lib/momentos.js';
import { extractText } from '../../lib/api.js';

const ACCEPT = '.pptx,.docx,.pdf,.ppt,.doc';
const MAX_SIZE_MB = 10;

export default function InputScreen({ form, setForm, onDesign, loading, loadingLong, error, onNavigate, maxStep }) {
  const [showNotes, setShowNotes] = React.useState(Boolean(form.notes));
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const fileRef = React.useRef(null);
  const canSubmit = form.topic.trim().length > 0 && !loading && !uploading;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`El archivo supera ${MAX_SIZE_MB} MB.`);
      return;
    }

    setUploadError('');
    setUploading(true);
    setFileName(file.name);
    try {
      const { text } = await extractText(file);
      setForm((f) => ({ ...f, notes: (f.notes ? f.notes + '\n\n' : '') + text }));
      setShowNotes(true);
    } catch (err) {
      setUploadError(err.message);
      setFileName('');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const clearFile = () => {
    setFileName('');
    setUploadError('');
  };

  return (
    <Shell active="input" maxStep={maxStep} onNavigate={onNavigate}>
      <div className="fade-up" style={{ maxWidth: 720 }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--brand)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13 }}>
            <i className="ph ph-sparkle" style={{ fontSize: 16 }} /> Diseño de sesión
          </div>
          <h1 style={{ marginBottom: 8 }}>¿Qué tema vas a enseñar?</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--size-body-l)' }}>
            De un tema a una sesión lista para dar: mapa de los 5 momentos y guión por bloque.
          </p>
        </header>

        <Card tone="plain" padding="var(--space-8)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Textarea
            label="Tema de la clase"
            rows={2}
            placeholder="Ej: Ciclos biogeoquímicos del carbono y nitrógeno"
            value={form.topic}
            onChange={set('topic')}
            style={{ font: 'var(--wght-medium) var(--size-body-l)/1.4 var(--font-ui)' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <Select
              label="Duración de la sesión"
              value={form.duration}
              onChange={set('duration')}
              options={DURACIONES.map((d) => ({ value: d, label: `${d} minutos` }))}
            />
            <Select
              label="Grupo objetivo"
              value={form.group}
              onChange={set('group')}
              options={GRUPOS}
            />
          </div>

          {/* --- Subida de archivos --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ font: 'var(--text-label)', color: 'var(--text-heading)' }}>
              Subir diapositivas o documento (opcional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                onChange={handleFile}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px dashed var(--border-default)',
                  background: 'var(--surface-tint)', color: 'var(--text-link)',
                  font: 'var(--wght-medium) var(--size-body-m)/1 var(--font-ui)',
                  cursor: uploading ? 'wait' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }}
              >
                {uploading ? (
                  <><Spinner size={16} /> Extrayendo texto...</>
                ) : (
                  <><i className="ph ph-upload-simple" style={{ fontSize: 17 }} /> .pptx, .docx o .pdf</>
                )}
              </button>

              {fileName && !uploading && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  font: 'var(--wght-regular) var(--size-body-s)/1 var(--font-ui)',
                  color: 'var(--success-500)',
                }}>
                  <i className="ph ph-check-circle" style={{ fontSize: 15 }} />
                  {fileName}
                  <button onClick={clearFile} style={{
                    border: 0, background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 13, padding: 0, lineHeight: 1,
                  }}>&#215;</button>
                </span>
              )}
            </div>

            {uploadError && (
              <span style={{ font: 'var(--wght-regular) var(--size-body-s)/1.3 var(--font-ui)', color: 'var(--danger-500)' }}>
                {uploadError}
              </span>
            )}

            <span style={{ font: 'var(--wght-regular) var(--size-body-s)/1.3 var(--font-ui)', color: 'var(--text-muted)' }}>
              El texto extraído se agrega a las notas. Máx {MAX_SIZE_MB} MB.
            </span>
          </div>

          {!showNotes ? (
            <button onClick={() => setShowNotes(true)} style={{
              alignSelf: 'flex-start', border: 0, background: 'transparent', color: 'var(--text-link)',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0,
              font: 'var(--wght-medium) var(--size-body-m)/1 var(--font-ui)',
            }}>
              <i className="ph ph-plus-circle" style={{ fontSize: 17 }} /> Añadir notas o texto de diapositivas
            </button>
          ) : (
            <Textarea
              label="Notas adicionales o texto de diapositivas"
              rows={6}
              placeholder="Opcional — pegá aquí el contenido de tus slides o notas que quieras que la herramienta considere."
              value={form.notes}
              onChange={set('notes')}
              hint={`${form.notes.length.toLocaleString('es')} caracteres${form.notes.length > 10000 ? ' · solo se usarán los primeros ~10.000' : ''}`}
            />
          )}

          {error && (
            <Toast tone="danger" title="No se pudo diseñar la sesión" message={error} icon={<i className="ph ph-warning-circle" style={{ fontSize: 18 }} />} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
            <Button variant="primary" size="lg" disabled={!canSubmit} onClick={onDesign}
              iconLeft={loading ? <Spinner size={18} color="#fff" /> : <i className="ph ph-magic-wand" style={{ fontSize: 18 }} />}>
              {loading ? 'Diseñando tu sesión…' : 'Diseñar sesión'}
            </Button>
            {loading && (
              <span className="pulse-soft" style={{ color: 'var(--text-muted)', fontSize: 'var(--size-body-s)' }}>
                {loadingLong ? 'Está tomando más de lo esperado. Esperá un momento…' : 'Suele tomar 10–20 segundos.'}
              </span>
            )}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
