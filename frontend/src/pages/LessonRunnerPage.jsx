import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDomain, getCachedDomain, completeLesson } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import LevelBossQuiz from '../components/interactive/LevelBossQuiz';
import CapstoneEvaluator from '../components/interactive/CapstoneEvaluator';
import AuthModal from '../components/auth/AuthModal';
import { Lock } from 'lucide-react';

const TRACK_META = {
  'data-science': { accent: '#059669' },
  'ai-ml': { accent: '#6D28D9' },
  'cloud': { accent: '#2563EB' },
};

const DEFAULT_META = { accent: '#E52E2E' };

export default function LessonRunnerPage() {
  const { name, num, order } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const cached = getCachedDomain(name);
  const [domain, setDomain] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [reward, setReward] = useState(null); // { xp, coins } flash
  const [showLessonList, setShowLessonList] = useState(false); // phones only — always shown on lg

  // Auth gate state
  const [showAuthModal, setShowAuthModal] = useState(false);

  const meta = TRACK_META[name] || DEFAULT_META;
  const levelNum = parseInt(num);
  const lessonOrder = parseInt(order);

  // Freemium gate: unauthenticated users on Level 2+
  const isGatedByAuth = !user && levelNum > 1;

  // Progress gate: logged-in users can't skip ahead to levels they haven't unlocked
  const domainProgress = user?.domain_progress?.find(p => p.domain_name === name);
  const highestUnlockedLevel = domainProgress?.highest_unlocked_level || 1;
  const isLockedByProgress = !!user && levelNum > highestUnlockedLevel;

  useEffect(() => {
    // SWR pattern: fetch silently to revalidate
    getDomain(name)
      .then((data) => setDomain(data))
      .catch((err) => {
        if (!cached) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [name, cached]);

  // Clear reward flash on lesson change
  useEffect(() => {
    setReward(null);
    setCompleting(false);
    setShowLessonList(false);
  }, [order]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md">Loading Lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md text-primary mb-2">Lesson not found</p>
          <Link to={`/track/${name}`} className="brutalist-btn brutalist-btn-primary no-underline mt-4 inline-block">
            ← Back to Roadmap
          </Link>
        </div>
      </div>
    );
  }

  // Find current level and lesson
  const currentLevel = domain.levels?.find(l => l.number === levelNum);
  const currentLesson = currentLevel?.lessons?.find(l => l.order === lessonOrder);
  const allLessons = currentLevel?.lessons?.sort((a, b) => a.order - b.order) || [];

  if (!currentLevel || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md text-primary mb-2">Lesson not found</p>
          <Link to={`/track/${name}`} className="brutalist-btn brutalist-btn-primary no-underline mt-4 inline-block">
            ← Back to Roadmap
          </Link>
        </div>
      </div>
    );
  }

  // ── Auth Gate: Show locked state for Level 2+ when unauthenticated ──
  if (isGatedByAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-6 md:p-12 text-center max-w-lg">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted" strokeWidth={2.5} />
          <h2 className="heading-lg m-0 mb-2">Level {levelNum} is Locked</h2>
          <p className="text-muted mb-6">
            Create a free FlyBeta account to unlock Level 2+ lessons and save your progress!
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="brutalist-btn brutalist-btn-primary text-lg"
          >
            Sign up to unlock →
          </button>
          <div className="mt-4">
            <Link to={`/track/${name}`} className="text-sm text-muted hover:text-ink no-underline">
              ← Back to Roadmap
            </Link>
          </div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialView="register"
            customMessage={`Sign up to unlock Level ${levelNum}: "${currentLevel.title}" and save your XP!`}
          />
        </div>
      </div>
    );
  }

  // ── Progress Gate: Show locked state for levels beyond the user's frontier ──
  if (isLockedByProgress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-6 md:p-12 text-center max-w-lg">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted" strokeWidth={2.5} />
          <h2 className="heading-lg m-0 mb-2">Level {levelNum} is Locked</h2>
          <p className="text-muted mb-6">
            Finish Level {highestUnlockedLevel} to unlock this level.
          </p>
          <Link to={`/track/${name}`} className="brutalist-btn brutalist-btn-primary no-underline inline-block">
            ← Back to Roadmap
          </Link>
        </div>
      </div>
    );
  }

  // Navigation helpers
  const currentIndex = allLessons.findIndex(l => l.order === lessonOrder);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Finishing this level's last lesson opens the next level (once it's unlocked)
  const nextLevel = domain.levels?.find(l => l.number === levelNum + 1);
  const nextLevelFirstLesson = nextLevel?.lessons?.length
    ? [...nextLevel.lessons].sort((a, b) => a.order - b.order)[0]
    : null;

  // Handle lesson completion
  const handleComplete = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCompleting(true);
    try {
      const result = await completeLesson(currentLesson.id);

      // Update AuthContext with new stats (instant Navbar update)
      updateUser(result.user);

      const highestUnlocked = result.user.domain_progress
        ?.find(p => p.domain_name === name)?.highest_unlocked_level || 1;
      const openNextLevel = !nextLesson && nextLevelFirstLesson && highestUnlocked >= nextLevel.number;

      // Always show the success overlay
      setReward({
        xp: currentLesson.xp_reward,
        coins: currentLesson.coins_reward,
        levelCompleted: result.level_completed,
        alreadyDone: result.status === 'already_completed',
        nextLevelNumber: openNextLevel ? nextLevel.number : null,
      });

      // Navigate after 1.5s so the user actually sees the celebration
      setTimeout(() => {
        if (nextLesson) {
          navigate(`/track/${name}/level/${levelNum}/lesson/${nextLesson.order}`);
        } else if (openNextLevel) {
          navigate(`/track/${name}/level/${nextLevel.number}/lesson/${nextLevelFirstLesson.order}`);
        } else {
          navigate(`/track/${name}`);
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      setCompleting(false);
    }
  };



  return (
    <div>
      {/* ── Success Overlay ──────────────────────────────────────────── */}
      {reward && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.55)', animation: 'overlayFadeIn 0.2s ease-out' }}
        >
          <div
            className="text-center px-10 py-8 mx-4 bg-surface"
            style={{
              border: '4px solid var(--color-ink)',
              boxShadow: '12px 12px 0px 0px var(--color-ink)',
              animation: 'overlayPunchIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              maxWidth: '480px',
              width: '100%',
            }}
          >
            {/* Title */}
            <p
              className="heading-xl m-0 mb-1"
              style={{
                color: meta.accent,
                fontSize: '2.25rem',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {reward.levelCompleted
                ? '🏆 LEVEL COMPLETE!'
                : reward.alreadyDone
                  ? '✓ ALREADY DONE!'
                  : '⚡ MISSION ACCOMPLISHED!'}
            </p>

            {/* Subtitle */}
            <p className="label-mono text-muted m-0 mb-4" style={{ fontSize: '0.8rem' }}>
              {reward.alreadyDone ? 'No double rewards — keep going!' : 'Rewards earned'}
            </p>

            {/* Reward Badges */}
            {!reward.alreadyDone && (
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span
                  className="label-mono flex items-center gap-2 px-5 py-2"
                  style={{
                    border: '3px solid var(--color-ink)',
                    boxShadow: '4px 4px 0px 0px var(--color-ink)',
                    background: '#DBEAFE',
                    color: '#2563EB',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                  }}
                >
                  ⚡ +{reward.xp} XP
                </span>
                <span
                  className="label-mono flex items-center gap-2 px-5 py-2"
                  style={{
                    border: '3px solid var(--color-ink)',
                    boxShadow: '4px 4px 0px 0px var(--color-ink)',
                    background: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                  }}
                >
                  💰 +{reward.coins} COINS
                </span>
              </div>
            )}

            {reward.nextLevelNumber && (
              <p className="label-mono m-0 mt-5" style={{ fontSize: '0.85rem' }}>
                🔓 Level {reward.nextLevelNumber} unlocked — opening it now…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Keyframe animations (scoped inline) */}
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes overlayPunchIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 label-mono text-muted flex-wrap">
        <Link to="/tracks" className="no-underline text-muted hover:text-ink">Tracks</Link>
        <span>/</span>
        <Link to={`/track/${name}`} className="no-underline text-muted hover:text-ink">
          {domain.title}
        </Link>
        <span>/</span>
        <span>Level {levelNum}</span>
        <span>/</span>
        <span style={{ color: meta.accent }}>Lesson {lessonOrder}</span>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar — Lesson List */}
        <aside className="lg:w-72 shrink-0">
          <div id="tour-lesson-list" className="brutalist-card p-4 lg:sticky lg:top-24">
            <div className={`flex items-center justify-between gap-3 border-ink ${
              showLessonList ? 'mb-3 pb-2 border-b-2' : 'lg:mb-3 lg:pb-2 lg:border-b-2'
            }`}>
              <h3 className="heading-md text-sm m-0">
                Level {levelNum}: {currentLevel.title}
              </h3>
              {/* Phones: lesson list collapses so the lesson itself comes first */}
              <button
                onClick={() => setShowLessonList(!showLessonList)}
                className="lg:hidden label-mono shrink-0 whitespace-nowrap px-3 py-2 border-2 border-ink bg-canvas text-ink cursor-pointer"
                aria-expanded={showLessonList}
              >
                {currentIndex + 1} / {allLessons.length} {showLessonList ? '▴' : '▾'}
              </button>
            </div>
            <ul className={`list-none p-0 m-0 ${showLessonList ? '' : 'hidden lg:block'}`}>
              {allLessons.map((lesson) => {
                const isActive = lesson.order === lessonOrder;
                return (
                  <li key={lesson.id}>
                    <Link
                      to={`/track/${name}/level/${levelNum}/lesson/${lesson.order}`}
                      className={`flex items-center gap-2 py-2 px-2 no-underline text-sm border-b border-border-light transition-all ${
                        isActive
                          ? 'font-bold'
                          : 'text-ink hover:bg-canvas'
                      }`}
                      style={isActive ? { backgroundColor: '#111111', color: '#FFFFFF' } : undefined}
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center border text-xs shrink-0"
                        style={{
                          borderColor: isActive ? '#fff' : 'var(--color-ink)',
                          background: isActive ? meta.accent : 'transparent',
                          color: isActive ? '#fff' : 'var(--color-ink)',
                        }}
                      >
                        {lesson.order}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Lesson Header */}
          <div className="brutalist-card p-4 md:p-6 mb-6">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {!currentLesson.is_mandatory && (
                <span className="brutalist-badge bg-gold-light text-gold">Bonus</span>
              )}
              <span className="brutalist-badge" style={{ background: meta.accent + '20', color: meta.accent }}>
                ⚡ {currentLesson.xp_reward} XP
              </span>
              <span className="brutalist-badge bg-gold-light text-gold">
                💰 {currentLesson.coins_reward} Coins
              </span>
            </div>
            <h1 className="heading-lg m-0">{currentLesson.title}</h1>
          </div>

          {/* Markdown Content */}
          <div id="tour-lesson-content" className="brutalist-card p-4 md:p-8">
            <MarkdownRenderer content={currentLesson.content_md} />
          </div>

          {/* Boss Quiz or Capstone */}
          {!nextLesson && (
            <div className="mt-16 overflow-visible pb-12">
              {levelNum === 10 ? (
                <CapstoneEvaluator preselectedDomain={domain?.id} />
              ) : (
                <LevelBossQuiz 
                  quizData={currentLevel.quiz_data || []} 
                  levelId={currentLevel.id} 
                  onUnlock={handleComplete} 
                  continueLabel={nextLevelFirstLesson ? `Continue to Level ${nextLevel.number} →` : 'Return to Roadmap →'}
                />
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 gap-4">
            {prevLesson ? (
              <button
                onClick={() => navigate(`/track/${name}/level/${levelNum}/lesson/${prevLesson.order}`)}
                className="brutalist-btn bg-surface text-ink"
              >
                ← Previous
              </button>
            ) : (
              <Link to={`/track/${name}`} className="brutalist-btn bg-surface text-ink no-underline">
                ← Roadmap
              </Link>
            )}

            {!(!nextLesson && (levelNum === 10 || currentLevel.quiz_data)) && (
              <button
                id="tour-complete-btn"
                onClick={handleComplete}
                disabled={completing}
                className={`brutalist-btn brutalist-btn-primary ${completing ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {completing ? 'Saving...' : nextLesson ? (
                  <>
                    <span className="hidden sm:inline">Complete &amp; Continue →</span>
                    <span className="sm:hidden">Complete →</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">✓ Complete Level →</span>
                    <span className="sm:hidden">✓ Finish Level</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth modal for completion gating on Level 1 (guest clicking complete) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="register"
        customMessage="Create a free account to save your progress and earn XP!"
      />
    </div>
  );
}
