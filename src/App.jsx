import React from 'react';
import InputScreen from './components/screens/InputScreen.jsx';
import MapScreen from './components/screens/MapScreen.jsx';
import ScriptScreen from './components/screens/ScriptScreen.jsx';
import { designMap, generateScript } from './lib/api.js';

const STEP_INDEX = { input: 0, map: 1, script: 2 };

export default function App() {
  const [form, setForm] = React.useState({ topic: '', duration: 90, group: '6º semestre', notes: '' });
  const [screen, setScreen] = React.useState('input');
  const [maxStep, setMaxStep] = React.useState('input');

  const [blocks, setBlocks] = React.useState([]);
  const [scripts, setScripts] = React.useState([]);
  const [notesTruncated, setNotesTruncated] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [loadingLong, setLoadingLong] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [error, setError] = React.useState('');

  const bumpMax = (step) => setMaxStep((cur) => (STEP_INDEX[step] > STEP_INDEX[cur] ? step : cur));

  // Cronómetro para el aviso de "está tardando más de lo esperado".
  const longTimer = React.useRef(null);
  const startLongTimer = () => {
    setLoadingLong(false);
    longTimer.current = setTimeout(() => setLoadingLong(true), 30000);
  };
  const stopLongTimer = () => { clearTimeout(longTimer.current); setLoadingLong(false); };

  const handleDesign = async () => {
    if (!form.topic.trim()) return;
    setError(''); setLoading(true); startLongTimer();
    try {
      const { blocks: b, notesTruncated: t } = await designMap(form);
      setBlocks(b); setNotesTruncated(t); setScripts([]);
      setScreen('map'); bumpMax('map');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); stopLongTimer();
    }
  };

  const handleRegenerate = async () => {
    setError(''); setRegenerating(true); startLongTimer();
    try {
      const { blocks: b, notesTruncated: t } = await designMap(form);
      setBlocks(b); setNotesTruncated(t); setScripts([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false); stopLongTimer();
    }
  };

  const handleGenerateScript = async () => {
    setError(''); setGenerating(true); startLongTimer();
    try {
      const { scripts: s } = await generateScript({ ...form, blocks });
      setScripts(s);
      setScreen('script'); bumpMax('script');
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false); stopLongTimer();
    }
  };

  const navigate = (step) => { setError(''); setScreen(step); };

  return (
    <>
      {screen === 'input' && (
        <InputScreen
          form={form} setForm={setForm}
          onDesign={handleDesign} loading={loading} loadingLong={loadingLong} error={error}
          onNavigate={navigate} maxStep={maxStep}
        />
      )}
      {screen === 'map' && (
        <MapScreen
          form={form} blocks={blocks} setBlocks={setBlocks}
          onGenerate={handleGenerateScript} onRegenerate={handleRegenerate}
          onBack={() => navigate('input')}
          generating={generating} regenerating={regenerating} error={error} notesTruncated={notesTruncated}
          onNavigate={navigate} maxStep={maxStep}
        />
      )}
      {screen === 'script' && (
        <ScriptScreen
          form={form} blocks={blocks} scripts={scripts}
          onBack={() => navigate('map')}
          onNavigate={navigate} maxStep={maxStep}
        />
      )}
    </>
  );
}
