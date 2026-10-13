import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateActiveTheme } from '../services/api';
import EditProfileModal from '../components/EditProfileModal';
import { useStartTour } from '../components/tour/tour';
import ActivityHeatmap from '../components/ActivityHeatmap';
import StreakRestoreCard from '../components/StreakRestoreCard';

// ── Rank badge styling ──────────────────────────────────────────────────

const RANK_COLORS = {
  Novice:      { bg: '#E5E7EB', text: '#374151' },
  Apprentice:  { bg: '#DBEAFE', text: '#1E40AF' },
  Craftsman:   { bg: '#D1FAE5', text: '#065F46' },
  Specialist:  { bg: '#FEF3C7', text: '#92400E' },
  Expert:      { bg: '#FDE68A', text: '#78350F' },
  Master:      { bg: '#E9D5FF', text: '#6B21A8' },
  Grandmaster: { bg: '#FCA5A5', text: '#991B1B' },
  Legend:      { bg: '#111111', text: '#EAB308' },
};

const RANK_ICONS = {
  Novice:      '🌱',
  Apprentice:  '📘',
  Craftsman:   '🔧',
  Specialist:  '🎯',
  Expert:      '⚡',
  Master:      '👑',
  Grandmaster: '💎',
  Legend:      '🏆',
};

// ── Track metadata (matches DESIGN.md accent tokens) ────────────────────

const TRACK_META = {
  cloud:          { label: 'Cloud Computing',   color: '#2563EB', icon: '☁️' },
  ai:             { label: 'AI & ML',           color: '#6D28D9', icon: '🤖' },
  data:           { label: 'Data Science',      color: '#059669', icon: '📊' },
};

function StatTile({ icon, value, label, className = '', style }) {
  return (
    <div className={`border-2 border-ink px-3 py-2.5 flex flex-col gap-1 min-w-0 ${className}`} style={style}>
      <span className="flex items-center gap-2 font-black text-lg leading-tight min-w-0">
        <span aria-hidden="true">{icon}</span>
        <span className="truncate">{value}</span>
      </span>
      <span className="label-mono opacity-80 truncate" style={{ fontSize: '10px' }}>{label}</span>
    </div>
  );
}

function RankChip({ rank, muted = false }) {
  const colors = RANK_COLORS[rank] || RANK_COLORS.Novice;
  return (
    <span
      className="inline-flex items-center gap-2 whitespace-nowrap label-mono font-bold px-3 py-2 border-2 border-ink shrink-0"
      style={{ backgroundColor: colors.bg, color: colors.text, opacity: muted ? 0.75 : 1 }}
    >
      <span aria-hidden="true">{RANK_ICONS[rank] || '🌱'}</span>
      {rank}
    </span>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, refetchUser, loading } = useAuth();
  const { themeKey, themes, themeKeys, setTheme } = useTheme();

  const [themeUpdating, setThemeUpdating] = useState(null); // key being updated
  const [editModalOpen, setEditModalOpen] = useState(false);
  const startTour = useStartTour();

  // ── Profile save handler (from EditProfileModal) ──────────────────────
  const handleProfileSave = () => {
    refetchUser();
    setEditModalOpen(false);
  };

  // ── Auth guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      navigate('/tracks', { replace: true });
    }
  }, [user, loading, navigate]);

  // ── Theme click handler ───────────────────────────────────────────────
  const handleThemeChange = async (key) => {
    if (key === themeKey) return;
    setThemeUpdating(key);
    // Apply immediately on the frontend
    setTheme(key);
    try {
      await updateActiveTheme(key);
      refetchUser();
    } catch (err) {
      console.error('Failed to save theme:', err);
    } finally {
      setThemeUpdating(null);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="label-mono text-muted">LOADING DASHBOARD...</p>
        </div>
      </div>
    );
  }

  const profile = user; // Alias for convenience below

  const rank = profile?.current_rank || 'Novice';
  const rankColor = RANK_COLORS[rank] || RANK_COLORS.Novice;
  const rankIcon = RANK_ICONS[rank] || '🌱';
  const progressPct = profile?.rank_progress_pct ?? 0;
  const nextRank = profile?.next_rank;
  const xpToNext = profile?.xp_to_next_rank ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-xl">COMMAND CENTER</h1>
          <p className="text-muted label-mono mt-1">YOUR PILOT DASHBOARD</p>
        </div>
        <button
          onClick={startTour}
          className="brutalist-badge bg-canvas text-ink cursor-pointer hover:bg-border-light transition-colors"
          title="Walk through FlyBeta's features again"
        >
          🎓 Replay tutorial
        </button>
      </div>

      {/* ── Broken streak? Offer a coin-paid restore ────────────────── */}
      <StreakRestoreCard />

      {/* ── Hero Identity Card ──────────────────────────────────────── */}
      <div
        id="tour-identity"
        className="brutalist-card p-4 md:p-8"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="flex items-start gap-4 md:gap-6">
          {/* Avatar / Rank Badge */}
          <div
            className="w-16 h-16 md:w-24 md:h-24 border-4 border-ink shrink-0 overflow-hidden"
            style={{
              backgroundColor: rankColor.bg,
              boxShadow: 'var(--shadow-brutal-sm)',
            }}
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-[2.5rem]">
                {rankIcon}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="heading-lg break-words" style={{ margin: 0, textTransform: 'none' }}>
                  {profile?.name || profile?.username}
                </h2>
                <p className="label-mono text-muted mt-1" style={{ textTransform: 'none' }}>@{profile?.username}</p>
              </div>
              <button
                onClick={() => setEditModalOpen(true)}
                className="brutalist-badge bg-canvas text-ink cursor-pointer hover:bg-border-light transition-colors shrink-0"
                title="Edit Profile"
              >
                ✏️ Edit
              </button>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm mt-2 mb-0" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)', textTransform: 'none' }}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <StatTile icon="⚡" value={profile?.total_xp?.toLocaleString() || 0} label="Total XP" className="bg-cobalt-light text-cobalt" />
          <StatTile icon="💰" value={profile?.coins?.toLocaleString() || 0} label="Coins" className="bg-gold-light text-gold" />
          <StatTile
            icon="🔥"
            value={profile?.streak || 0}
            label={`Streak · best ${profile?.best_streak || 0}`}
            className="bg-flame-light text-flame"
          />
          <StatTile icon={rankIcon} value={rank} label="Rank" style={{ backgroundColor: rankColor.bg, color: rankColor.text }} />
        </div>
      </div>

      {/* ── XP & Rank Progress ──────────────────────────────────────── */}
      <div id="tour-rank" className="brutalist-card p-4 md:p-6" style={{ background: 'var(--color-surface)' }}>
        <h3 className="heading-md mb-4">RANK PROGRESSION</h3>

        <div className="flex items-center gap-3 mb-4">
          <RankChip rank={rank} />
          {nextRank ? (
            <>
              <div className="flex-1 flex items-center min-w-[24px]" aria-hidden="true">
                <div className="flex-1 border-t-2 border-dashed border-ink opacity-40" />
                <span className="text-ink opacity-60 text-xs leading-none">▶</span>
              </div>
              <RankChip rank={nextRank} muted />
            </>
          ) : (
            <span className="label-mono text-gold font-bold">🏆 MAX RANK ACHIEVED</span>
          )}
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-8 border-4 border-ink relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-canvas)', boxShadow: 'var(--shadow-brutal-sm)' }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={nextRank ? `Progress to ${nextRank}` : 'Max rank reached'}
        >
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
            }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center label-mono font-bold text-sm"
            style={{ color: progressPct > 50 ? 'white' : 'var(--color-ink)' }}
          >
            {progressPct}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
          <span className="label-mono text-muted">
            {nextRank
              ? `${(profile?.total_xp || 0).toLocaleString()} / ${((profile?.total_xp || 0) + xpToNext).toLocaleString()} XP`
              : `${(profile?.total_xp || 0).toLocaleString()} XP`}
          </span>
          {nextRank && (
            <span className="label-mono font-bold" style={{ color: 'var(--color-primary)' }}>
              {xpToNext.toLocaleString()} XP to go
            </span>
          )}
        </div>
      </div>

      {/* ── Activity Heatmap ────────────────────────────────────────── */}
      <ActivityHeatmap refreshKey={`${profile?.total_xp}-${profile?.streak}`} />

      {/* ── Track Progress ──────────────────────────────────────────── */}
      <div id="tour-track-progress" className="brutalist-card p-6" style={{ background: 'var(--color-surface)' }}>
        <h3 className="heading-md mb-4">TRACK PROGRESS</h3>

        <div className="space-y-4">
          {Object.entries(TRACK_META).map(([slug, meta]) => {
            const dp = profile?.domain_progress?.find((d) => d.domain_name === slug);
            const highest = dp?.highest_unlocked_level || 1;
            const completed = !!dp?.track_completed;
            const trackPct = completed ? 100 : Math.round((Math.max(highest - 1, 0) / 10) * 100);

            return (
              <div key={slug}>
                <div className="flex items-center justify-between mb-1">
                  <span className="label-mono font-bold flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </span>
                  {completed ? (
                    <Link to={`/certificate/${dp.certificate_id}`} className="label-mono text-sm font-bold no-underline" style={{ color: meta.color }}>
                      ✓ Complete · 🎓 Certificate
                    </Link>
                  ) : (
                    <span className="label-mono text-muted text-sm">
                      Level {highest} / 10
                    </span>
                  )}
                </div>
                <div
                  className="w-full h-5 border-3 border-ink relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-canvas)',
                    borderWidth: '3px',
                  }}
                >
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${trackPct}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Theme Selector ──────────────────────────────────────────── */}
      <div className="brutalist-card p-6" style={{ background: 'var(--color-surface)' }}>
        <h3 className="heading-md mb-2">TERMINAL THEME</h3>
        <p className="label-mono text-muted text-sm mb-4">
          SELECT YOUR VISUAL IDENTITY — CHANGES APPLY GLOBALLY
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {themeKeys.map((key) => {
            const t = themes[key];
            const isActive = key === themeKey;
            const isUpdating = themeUpdating === key;
            const primaryColor = t.vars['--color-primary'];
            const borderColor = t.vars['--color-border'] || t.vars['--color-ink'];

            return (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                disabled={isUpdating}
                className="relative flex flex-col items-center gap-2 p-4 border-4 cursor-pointer transition-all"
                style={{
                  borderColor: isActive ? borderColor : 'var(--color-border-light)',
                  backgroundColor: isActive ? t.vars['--color-canvas'] : 'var(--color-surface)',
                  boxShadow: isActive ? `6px 6px 0px 0px ${borderColor}` : 'none',
                  transform: isActive ? 'translate(-2px, -2px)' : 'none',
                  opacity: isUpdating ? 0.6 : 1,
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center border-2 border-ink text-xs font-bold"
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                  >
                    ✓
                  </span>
                )}

                {/* Theme icon */}
                <span className="text-3xl">{t.icon}</span>

                {/* Color swatch */}
                <div
                  className="w-full h-3 border-2"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: borderColor,
                  }}
                />

                {/* Label */}
                <span
                  className="label-mono text-xs font-bold text-center"
                  style={{ color: isActive ? borderColor : 'var(--color-muted)' }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* ── Edit Profile Modal ──────────────────────────────────────── */}
      {editModalOpen && (
        <EditProfileModal
          profile={profile}
          onSave={handleProfileSave}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}
