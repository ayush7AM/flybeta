import { useState } from 'react';
import { generateBlueprint } from '../services/api';
import LabsSubNav from '../components/layout/LabsSubNav';

// Alternating card rotations for the "scattered index card" feel
const CARD_ROTATIONS = ['rotate-0', 'rotate-1', '-rotate-1', 'rotate-[0.5deg]'];

export default function ProjectArchitectPage() {
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await generateBlueprint(prompt.trim());
      setSteps(data.steps);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit on Ctrl+Enter / Cmd+Enter
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div>
      <LabsSubNav />

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <header className="mb-10 border-b-2 border-ink pb-8">
        <h1 className="heading-xl mb-4 tracking-tighter">THE BLUEPRINT LAB</h1>
        <p
          className="text-lg max-w-2xl"
          style={{
            borderLeft: '4px solid var(--color-primary)',
            paddingLeft: '16px',
            color: 'var(--color-muted)',
            lineHeight: 1.6,
          }}
        >
          Architect and define the structural logic of your next AI initiative.
          Input constraints below to generate a tactile project map.
        </p>
      </header>

      {/* ── Project Brief Input ───────────────────────────────────────── */}
      <section className="mb-16 relative">
        {/* Decorative measuring tape (desktop only) */}
        <div
          className="absolute -top-4 -left-4 w-[calc(100%+32px)] h-4 hidden md:flex justify-between items-end overflow-hidden z-10"
          style={{
            background: '#f0d8a8',
            border: '2px solid var(--color-ink)',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '1px',
                height: i % 5 === 0 ? '100%' : '50%',
                background: 'var(--color-ink)',
                marginLeft: i === 0 ? '8px' : undefined,
              }}
            />
          ))}
        </div>

        <div id="tour-blueprint" className="brutalist-card p-6 md:p-8 relative z-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-ink">
            <h2 className="heading-md flex items-center gap-2">
              ⚙ Project Brief
            </h2>
            <span className="label-mono px-2 py-1 bg-canvas" style={{ border: '1px solid var(--color-ink)' }}>
              V_1.0.4
            </span>
          </div>

          {/* Textarea */}
          <textarea
            className="brutalist-textarea h-48"
            placeholder="Describe the core objective, key constraints, and desired outcomes of your project. Be specific about the domain and target audience..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Footer: Tags + Button */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <span
                className="label-mono px-2 py-1"
                style={{
                  background: 'var(--color-border-light)',
                  border: '1px solid var(--color-ink)',
                }}
              >
                NLP
              </span>
              <span
                className="label-mono px-2 py-1"
                style={{
                  background: 'var(--color-border-light)',
                  border: '1px solid var(--color-ink)',
                }}
              >
                Generative
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`brutalist-btn brutalist-btn-primary w-full md:w-auto ${
                loading || !prompt.trim() ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>⏳ Generating...</>
              ) : (
                <>🔧 Generate Blueprint</>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-4 label-mono text-primary">{error}</p>
          )}
        </div>
      </section>

      {/* ── Generated Steps ──────────────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-end mb-8 pb-2 border-b-2 border-ink">
          <h3 className="heading-lg">GENERATED STEPS</h3>
        </div>

        {/* Empty State */}
        {!steps && !loading && (
          <div
            className="text-center py-16"
            style={{ border: '2px dashed var(--color-border-light)' }}
          >
            <p className="heading-md text-muted mb-2" style={{ opacity: 0.5 }}>
              ⚙ NO BLUEPRINT YET
            </p>
            <p className="label-mono text-muted">
              Enter a project brief above and hit "Generate Blueprint"
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="blueprint-card animate-pulse"
                style={{ minHeight: '200px', opacity: 0.4 }}
              >
                <div className="h-10 w-16 bg-border-light mb-4" />
                <div className="h-6 w-3/4 bg-border-light mb-3" />
                <div className="h-4 w-full bg-border-light mb-2" />
                <div className="h-4 w-2/3 bg-border-light" />
              </div>
            ))}
          </div>
        )}

        {/* Blueprint Cards Grid */}
        {steps && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {steps.map((step, index) => (
              <div
                key={step.step_number}
                className={`blueprint-card transform ${CARD_ROTATIONS[index % CARD_ROTATIONS.length]} hover:-translate-y-2 transition-all duration-200`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'cardSlideIn 0.4s ease-out both',
                }}
              >
                {/* Step Number + Tag */}
                <div className="flex justify-between items-start mb-6">
                  <span
                    className="heading-lg"
                    style={{ color: 'var(--color-muted)', opacity: 0.35 }}
                  >
                    {String(step.step_number).padStart(2, '0')}
                  </span>
                  <span
                    className="label-mono px-2 py-1"
                    style={{
                      background: 'var(--color-border-light)',
                      border: '1px solid var(--color-ink)',
                    }}
                  >
                    {step.tag}
                  </span>
                </div>

                {/* Title */}
                <h4 className="heading-md mb-4 leading-tight">{step.title}</h4>

                {/* Task Checklist */}
                <ul className="list-none p-0 m-0 mb-6 space-y-3">
                  {step.tasks.map((task, taskIdx) => (
                    <li
                      key={taskIdx}
                      className="flex gap-2 items-start text-sm"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <span
                        className="shrink-0 mt-0.5"
                        style={{ color: 'var(--color-primary)', fontSize: '14px' }}
                      >
                        □
                      </span>
                      {task}
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div
                  className="mt-auto pt-4 flex justify-between items-center"
                  style={{ borderTop: '2px solid var(--color-ink)' }}
                >
                  <span className="label-mono" style={{ color: 'var(--color-muted)' }}>
                    Est. {step.estimate}
                  </span>
                  <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>
                    ✏️
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Card entrance animation */}
      <style>{`
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
