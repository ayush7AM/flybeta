import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDomain, getCachedDomain } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LevelNode from '../components/ui/LevelNode';
import AuthModal from '../components/auth/AuthModal';

export default function TrackRoadmapPage() {
  const { name } = useParams();
  const { themeKey } = useTheme();
  const { user } = useAuth();
  const cached = getCachedDomain(name);
  const [domain, setDomain] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  // Auth gate modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // SWR pattern: fetch silently to revalidate
    getDomain(name)
      .then((data) => setDomain(data))
      .catch((err) => {
        if (!cached) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [name, cached]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md">Loading Roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md text-primary mb-2">Track not found</p>
          <Link to="/" className="brutalist-btn brutalist-btn-primary no-underline mt-4 inline-block">
            ← Back to Tracks
          </Link>
        </div>
      </div>
    );
  }

  const levels = domain?.levels || [];
  const totalLessons = levels.reduce((acc, l) => acc + (l.lessons?.length || 0), 0);
  
  const domainProgress = user?.domain_progress?.find(p => p.domain_name === name);
  const highestUnlockedLevel = domainProgress?.highest_unlocked_level || 1;
  const completedLessonIds = new Set(user?.completed_lesson_ids || []);

  // A level is done once the user has moved past it, or (for the final level,
  // which has nothing after it) once every mandatory lesson is complete.
  const isLevelCompleted = (level) => {
    if (!user) return false;
    if (domainProgress?.track_completed) return true;
    if (level.number < highestUnlockedLevel) return true;
    const mandatory = level.lessons?.filter(l => l.is_mandatory) || [];
    return mandatory.length > 0 && mandatory.every(l => completedLessonIds.has(l.id));
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 label-mono text-muted">
        <Link to="/tracks" className="no-underline text-muted hover:text-ink">Tracks</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-primary)' }}>{domain?.title || name}</span>
      </div>

      {/* Hero */}
      <header className="mb-12">
        <div className="bg-surface border-2 border-ink p-8 inline-block"
             style={{ boxShadow: 'var(--shadow-brutal-lg)' }}>
          <div className="flex items-center gap-4 mb-2">
            <div
              className="brutalist-badge"
              style={{ background: 'var(--color-primary)', color: 'var(--color-canvas)' }}
            >
              TRACK
            </div>
            <span className="label-mono text-muted">
              {levels.length} Levels • {totalLessons} Lessons
            </span>
          </div>
          <h1 className="heading-xl m-0" style={{ color: 'var(--color-primary)' }}>
            {domain?.title || name}
          </h1>
        </div>
      </header>

      {/* Roadmap */}
      <div className="max-w-3xl">
        {levels.length > 0 ? (
          levels
            .sort((a, b) => a.number - b.number)
            .map((level) => {
              // Freemium gate: Level 2+ requires auth
              const isAuthGated = !user && level.number > 1;

              return (
                <LevelNode
                  key={level.id}
                  level={level}
                  domainName={name}
                  isActive={level.number === (user ? highestUnlockedLevel : 1)}
                  isLocked={user ? level.number > highestUnlockedLevel : false}
                  isCompleted={isLevelCompleted(level)}
                  completedLessonIds={completedLessonIds}
                  tourId={level.number === 1 ? 'tour-first-level' : undefined}
                  isAuthGated={isAuthGated}
                  onAuthGate={() => setShowAuthModal(true)}
                />
              );
            })
        ) : (
          <div className="brutalist-card p-12 text-center">
            <p className="heading-md text-muted mb-2">No levels yet</p>
            <p className="text-sm text-muted">
              Content for this track hasn't been loaded.
            </p>
          </div>
        )}

        {/* End cap */}
        {levels.length > 0 && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 flex items-center justify-center border-2 border-ink text-white text-xl"
                style={{ background: 'var(--color-primary)', boxShadow: 'var(--shadow-brutal-sm)' }}
              >
                🏆
              </div>
            </div>
            <div className="flex-1 border-2 border-ink p-4" style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
              <p className="heading-md m-0" style={{ color: 'var(--color-primary)' }}>
                Track Complete!
              </p>
              {domainProgress?.track_completed ? (
                <p className="text-sm m-0 mt-1">
                  You finished this track.{' '}
                  <Link to={`/certificate/${domainProgress.certificate_id}`} className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    🎓 View your certificate →
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-muted m-0 mt-1">
                  Master all {levels.length} levels and pass the capstone to earn your certificate.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Gate Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="register"
        customMessage="Create a free account to unlock Level 2+ and save your XP!"
      />
    </div>
  );
}
