import { useState, useEffect } from 'react';
import { getDomains, getCachedDomainsList } from '../services/api';
import TrackCard from '../components/ui/TrackCard';

export default function TrackSelectionPage() {
  const cached = getCachedDomainsList();
  const [domains, setDomains] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    // SWR pattern: fetch silently in the background even if we have cached data
    getDomains()
      .then((data) => {
        // Handle paginated or direct array responses
        const results = data.results || data;
        const finalResults = Array.isArray(results) ? results : [];
        setDomains(finalResults);
      })
      .catch((err) => {
        if (!cached) setError(err.message); // Only show error if we have no fallback data
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md">Loading Tracks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center border-primary">
          <p className="heading-md text-primary mb-2">Connection Error</p>
          <p className="text-muted text-sm">
            Make sure the Django backend is running at <code>localhost:8000</code>
          </p>
          <p className="label-mono text-xs text-muted mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Header */}
      <header className="relative mb-16">
        {/* Decorative tilted block */}
        <div
          className="absolute -top-4 -left-4 w-32 h-32 border-2 border-ink -rotate-6 z-0"
          style={{ background: 'var(--color-primary)' }}
        />

        <div className="relative z-10 bg-surface border-2 border-ink p-8 inline-block"
             style={{ boxShadow: 'var(--shadow-brutal-lg)' }}>
          <h1 className="heading-xl m-0 leading-none">
            <span className="relative z-10">CHOOSE YOUR</span>
            <br />
            <span
              className="inline-block mt-2 px-4 py-1 border-2 border-ink rotate-1 text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              TRACK
            </span>
          </h1>
        </div>

        <p className="mt-8 max-w-2xl border-l-4 border-primary pl-4 bg-surface p-4 border-y-2 border-r-2 border-ink text-muted"
           style={{ boxShadow: 'var(--shadow-brutal-sm)' }}>
          Select your specialized discipline. Your path dictates your curriculum,
          terminal access rights, and ultimate rank. Choose wisely.
        </p>
      </header>

      {/* Track Cards Grid */}
      <div id="tour-tracks" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <TrackCard key={domain.id || domain.name} domain={domain} />
        ))}
      </div>

      {/* Empty state */}
      {domains.length === 0 && (
        <div className="brutalist-card p-12 text-center mt-8">
          <p className="heading-md text-muted mb-2">No tracks available</p>
          <p className="text-sm text-muted">
            Run <code>python manage.py load_level_content</code> to seed curriculum data.
          </p>
        </div>
      )}
    </div>
  );
}
