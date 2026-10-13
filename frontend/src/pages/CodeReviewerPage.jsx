import { useState } from 'react';
import { reviewCode } from '../services/api';
import LabsSubNav from '../components/layout/LabsSubNav';

const LANGUAGES = ['Python', 'JavaScript', 'SQL', 'Go'];

const SEVERITY_COLORS = {
  CRITICAL: 'var(--color-primary)',
  WARNING: 'var(--color-flame)',
  INFO: 'var(--color-cobalt)',
  STYLE: 'var(--color-muted)',
};

const SEVERITY_BG = {
  CRITICAL: 'var(--color-primary)',
  WARNING: 'var(--color-flame)',
  INFO: 'var(--color-cobalt)',
  STYLE: 'var(--color-border-light)',
};

export default function CodeReviewerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [findings, setFindings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await reviewCode(code.trim(), language.toLowerCase());
      setFindings(data.findings);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit on Ctrl+Enter / Cmd+Enter
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleAnalyze();
    }
  };

  // Count findings by severity
  const severityCounts = findings
    ? findings.reduce((acc, f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <div>
      <LabsSubNav />

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <header className="mb-10 border-b-2 border-ink pb-8">
        <h1 className="heading-xl mb-4 tracking-tighter">CODE DRISHTI</h1>
        <p
          className="text-lg max-w-2xl"
          style={{
            borderLeft: '4px solid var(--color-primary)',
            paddingLeft: '16px',
            color: 'var(--color-muted)',
            lineHeight: 1.6,
          }}
        >
          Submit your code for structural and security analysis.
          Receive actionable findings ranked by severity.
        </p>
      </header>

      {/* ── Code Submission ───────────────────────────────────────────── */}
      <section className="mb-16 relative">
        {/* Decorative circuit trace (desktop only) */}
        <div
          className="absolute -top-4 -left-4 w-[calc(100%+32px)] h-4 hidden md:flex justify-between items-end overflow-hidden z-10"
          style={{
            background: '#d1d5db',
            border: '2px solid var(--color-ink)',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i % 3 === 0 ? '3px' : '1px',
                height: i % 4 === 0 ? '100%' : '50%',
                background: 'var(--color-ink)',
                marginLeft: i === 0 ? '8px' : undefined,
              }}
            />
          ))}
        </div>

        <div className="brutalist-card p-6 md:p-8 relative z-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-ink">
            <h2 className="heading-md flex items-center gap-2">
              🔍 Code Submission
            </h2>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="label-mono px-2 py-1 bg-canvas cursor-pointer"
                style={{
                  border: '2px solid var(--color-ink)',
                  outline: 'none',
                  appearance: 'none',
                  paddingRight: '24px',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M2 4l4 4 4-4\' fill=\'none\' stroke=\'%23111\' stroke-width=\'2\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 6px center',
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Textarea */}
          <textarea
            className="code-textarea h-64"
            placeholder={`# Paste your ${language} code here...\n# Press Ctrl+Enter (⌘+Enter) to analyze\n\ndef process_data(items):\n    for item in items:\n        result = db.query(f"SELECT * FROM users WHERE id={item}")\n        print(result)`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />

          {/* Footer: Button */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <span
                className="label-mono px-2 py-1"
                style={{
                  background: 'var(--color-border-light)',
                  border: '1px solid var(--color-ink)',
                }}
              >
                {language.toUpperCase()}
              </span>
              <span
                className="label-mono px-2 py-1"
                style={{
                  background: 'var(--color-border-light)',
                  border: '1px solid var(--color-ink)',
                }}
              >
                Static Analysis
              </span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className={`brutalist-btn brutalist-btn-primary w-full md:w-auto ${
                loading || !code.trim() ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>⏳ Analyzing...</>
              ) : (
                <>🔬 Analyze Code</>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-4 label-mono text-primary">{error}</p>
          )}
        </div>
      </section>

      {/* ── Review Findings ───────────────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-end mb-8 pb-2 border-b-2 border-ink">
          <h3 className="heading-lg">REVIEW FINDINGS</h3>
        </div>

        {/* Empty State */}
        {!findings && !loading && (
          <div
            className="text-center py-16"
            style={{ border: '2px dashed var(--color-border-light)' }}
          >
            <p className="heading-md text-muted mb-2" style={{ opacity: 0.5 }}>
              🔍 NO FINDINGS YET
            </p>
            <p className="label-mono text-muted">
              Paste your code above and hit "Analyze Code" to get a structural review
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="flex flex-col gap-6 pb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="review-card animate-pulse"
                style={{ minHeight: '120px', opacity: 0.4 }}
              >
                <div className="h-6 w-24 bg-border-light mb-3" />
                <div className="h-5 w-2/3 bg-border-light mb-3" />
                <div className="h-4 w-full bg-border-light mb-2" />
                <div className="h-4 w-1/2 bg-border-light" />
              </div>
            ))}
          </div>
        )}

        {/* Summary Bar */}
        {findings && !loading && (
          <div className="flex flex-wrap gap-3 mb-8">
            <span
              className="label-mono px-3 py-2"
              style={{
                border: '2px solid var(--color-ink)',
                background: 'var(--color-surface)',
              }}
            >
              {findings.length} FINDINGS
            </span>
            {Object.entries(severityCounts).map(([severity, count]) => (
              <span
                key={severity}
                className="severity-badge"
                style={{
                  background: SEVERITY_BG[severity],
                  color: severity === 'STYLE' ? 'var(--color-ink)' : '#fff',
                }}
              >
                {count} {severity}
              </span>
            ))}
          </div>
        )}

        {/* Finding Cards */}
        {findings && !loading && (
          <div className="flex flex-col gap-6 pb-12">
            {findings.map((finding, index) => (
              <div
                key={finding.id}
                className="review-card"
                style={{
                  borderLeftColor: SEVERITY_COLORS[finding.severity],
                  animationDelay: `${index * 100}ms`,
                  animation: 'cardSlideIn 0.4s ease-out both',
                }}
              >
                {/* Header: Severity + Category */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className="severity-badge"
                    style={{
                      background: SEVERITY_BG[finding.severity],
                      color: finding.severity === 'STYLE' ? 'var(--color-ink)' : '#fff',
                    }}
                  >
                    {finding.severity === 'CRITICAL' && '🚨 '}
                    {finding.severity === 'WARNING' && '⚠️ '}
                    {finding.severity === 'INFO' && 'ℹ️ '}
                    {finding.severity === 'STYLE' && '✏️ '}
                    {finding.severity}
                  </span>
                  <span
                    className="label-mono px-2 py-1"
                    style={{
                      background: 'var(--color-border-light)',
                      border: '1px solid var(--color-ink)',
                    }}
                  >
                    {finding.category}
                  </span>
                  <span
                    className="label-mono ml-auto"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Lines {finding.line_range}
                  </span>
                </div>

                {/* Title */}
                <h4 className="heading-md mb-3 leading-tight">{finding.title}</h4>

                {/* Description */}
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {finding.description}
                </p>

                {/* Suggestion Block */}
                <div
                  className="p-4"
                  style={{
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                  <p className="label-mono mb-2" style={{ color: 'var(--color-primary)' }}>
                    💡 Suggestion
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                    {finding.suggestion}
                  </p>
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
