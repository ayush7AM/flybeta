import { useState } from 'react';
import SynapseEngine from './SynapseEngine';
import { AlertCircle } from 'lucide-react';

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function SynapseTab() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState(false);

  const handleExtract = () => {
    const id = extractVideoId(url);
    if (!id) {
      setError(true);
      return;
    }
    setVideoId(id);
    setError(false);
  };

  const handleReset = () => {
    setUrl('');
    setVideoId(null);
    setError(false);
  };

  if (videoId) {
    return (
      <div>
        <button
          onClick={handleReset}
          className="brutalist-badge cursor-pointer mb-6 transition-colors hover:bg-canvas"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-ink)',
            padding: '8px 16px',
          }}
        >
          ← NEW EXTRACTION
        </button>

        <div className="h-[600px] flex flex-col lg:flex-row gap-6">
          {/* Left: 60% — Video Player */}
          <div className="lg:w-[60%] flex flex-col">
            <div
              className="border-2 bg-ink overflow-hidden h-full"
              style={{
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-brutal)',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Synapse Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right: 40% — Synapse Engine */}
          <div className="lg:w-[40%] flex flex-col">
            <SynapseEngine videoUrl={`https://www.youtube.com/watch?v=${videoId}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); if (error) setError(false); }}
          placeholder="Paste a YouTube URL…"
          className="flex-1 px-5 py-4 text-lg"
          style={{
            border: '4px solid var(--color-ink)',
            background: 'var(--color-surface)',
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            outline: 'none',
            boxShadow: 'var(--shadow-brutal)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-violet)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-ink)';
          }}
        />
        <button
          onClick={handleExtract}
          disabled={!url.trim()}
          className="label-mono px-8 py-4 cursor-pointer transition-all"
          style={{
            background: 'var(--color-violet)',
            color: '#FFFFFF',
            border: '4px solid var(--color-ink)',
            boxShadow: 'var(--shadow-brutal)',
            fontSize: '14px',
            letterSpacing: '0.1em',
            opacity: !url.trim() ? 0.5 : 1,
          }}
          onMouseDown={(e) => {
            if (!url.trim()) return;
            e.currentTarget.style.transform = 'translate(4px, 4px)';
            e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--color-ink)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-brutal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-brutal)';
          }}
        >
          LOAD VIDEO
        </button>
      </div>

      {error && (
        <div
          className="mt-3 flex items-center gap-2 label-mono px-4 py-2 border-2"
          style={{
            borderColor: 'var(--color-primary)',
            background: '#fef2f2',
            color: 'var(--color-primary)',
          }}
        >
          <AlertCircle size={14} />
          INVALID YOUTUBE URL — Please paste a valid link
        </div>
      )}
    </div>
  );
}
