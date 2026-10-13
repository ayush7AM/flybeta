import { Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';

const COMPLETED_GREEN = '#22C55E';

export default function LevelNode({
  level, domainName, isActive, isLocked, isCompleted, completedLessonIds, isAuthGated, onAuthGate, tourId,
}) {
  const lessonCount = level.lessons?.length || 0;
  const mandatoryCount = level.lessons?.filter(l => l.is_mandatory).length || 0;

  // Handle lesson link clicks — intercept if auth-gated
  const handleLessonClick = (e) => {
    if (isAuthGated) {
      e.preventDefault();
      onAuthGate?.();
    }
  };

  return (
    <div id={tourId} className="relative flex items-start gap-3 md:gap-6">
      {/* Connector Line (vertical) */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-ink font-bold text-lg z-10"
          style={{
            background: isCompleted ? COMPLETED_GREEN : isActive ? 'var(--color-primary)' : 'var(--color-surface)',
            color: isCompleted ? '#FFFFFF' : isActive ? 'var(--color-canvas)' : 'var(--color-ink)',
            boxShadow: isCompleted || isActive ? 'var(--shadow-brutal-sm)' : 'none',
          }}
          title={isCompleted ? `Level ${level.number} completed` : undefined}
        >
          {isCompleted ? (
            <Check className="w-7 h-7" strokeWidth={4} aria-label={`Level ${level.number} completed`} />
          ) : (
            level.number
          )}
        </div>
        {/* Vertical line */}
        <div className="w-0.5 h-8 bg-ink" />
      </div>

      {/* Level Card */}
      <div
        className={`flex-1 min-w-0 border-2 border-ink p-3 md:p-4 mb-4 transition-all relative ${
          isActive ? 'bg-surface' : 'bg-canvas'
        } ${isLocked ? 'grayscale opacity-60 pointer-events-none select-none' : ''}`}
        style={{
          boxShadow: isActive && !isLocked ? 'var(--shadow-brutal-sm)' : 'none',
        }}
      >
        {isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <Lock className="w-20 h-20 text-ink" strokeWidth={3} />
          </div>
        )}

        {/* Auth-gated badge for unauthenticated users on Level 2+ */}
        {isAuthGated && (
          <div className="absolute top-2 right-2 z-20">
            <button
              onClick={onAuthGate}
              className="brutalist-badge bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors border border-blue-300 text-xs flex items-center gap-1"
            >
              🔒 Sign up to unlock
            </button>
          </div>
        )}

        <div className={`relative z-10`}>
          <div className="flex items-start md:items-center justify-between gap-2 mb-2">
          <h3 className="heading-md text-lg m-0">{level.title}</h3>
          <span className="label-mono text-muted whitespace-nowrap shrink-0 pt-1 md:pt-0">
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
          </span>
        </div>

        {level.description && (
          <p className="text-sm text-muted m-0 mb-3">{level.description}</p>
        )}

        {/* Lesson list */}
        {level.lessons && level.lessons.length > 0 && (
          <div id={tourId && `${tourId}-lessons`} className="border-t border-border-light pt-3 mt-2">
            <ul className="list-none p-0 m-0">
              {level.lessons.map((lesson) => {
                const lessonDone = completedLessonIds?.has(lesson.id);
                return (
                <li key={lesson.id} className="flex items-start md:items-center justify-between gap-2 py-1.5 border-b border-border-light last:border-b-0">
                  <Link
                    to={`/track/${domainName}/level/${level.number}/lesson/${lesson.order}`}
                    onClick={handleLessonClick}
                    className={`no-underline hover:text-primary transition-colors flex items-start md:items-center gap-2 text-sm min-w-0 ${
                      isAuthGated ? 'text-muted' : 'text-ink'
                    }`}
                  >
                    <span
                      className="w-5 h-5 mt-px md:mt-0 flex items-center justify-center border border-ink text-xs shrink-0"
                      style={lessonDone ? { background: COMPLETED_GREEN, color: '#FFFFFF' } : undefined}
                      title={lessonDone ? `Lesson ${lesson.order} completed` : undefined}
                    >
                      {lessonDone ? (
                        <Check className="w-3.5 h-3.5" strokeWidth={4} aria-label={`Lesson ${lesson.order} completed`} />
                      ) : (
                        lesson.order
                      )}
                    </span>
                    <span className="min-w-0">
                      {lesson.title}
                      {!lesson.is_mandatory && (
                        <span className="brutalist-badge text-xs bg-gold-light text-gold ml-3 align-middle">Bonus</span>
                      )}
                    </span>
                  </Link>
                  <span className="label-mono text-xs text-muted whitespace-nowrap shrink-0 pt-0.5 md:pt-0">{lesson.xp_reward} XP</span>
                </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Mandatory count */}
        <div className="mt-3 flex items-center gap-2">
          <span className="label-mono text-xs" style={{ color: 'var(--color-primary)' }}>
            {mandatoryCount} mandatory
          </span>
          {lessonCount - mandatoryCount > 0 && (
            <span className="label-mono text-xs text-muted">
              • {lessonCount - mandatoryCount} bonus
            </span>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
