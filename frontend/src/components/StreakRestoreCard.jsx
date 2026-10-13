import { useState } from 'react';
import { restoreStreak } from '../services/api';
import { useAuth } from '../context/AuthContext';

// A flame tint mixed from the theme's surface, so text stays readable in light and dark mode
const TINT = { background: 'color-mix(in srgb, var(--color-flame) 16%, var(--color-surface))' };

const dismissKey = (offer) => `flybeta_streak_restore_dismissed_${offer.broken_on}`;

const readDismissed = (offer) => {
  try {
    return sessionStorage.getItem(dismissKey(offer)) === '1';
  } catch {
    return false;
  }
};

/**
 * Offer to repair a recently broken streak with coins.
 * variant="card" — the Dashboard version; variant="banner" — a slim, dismissible bar for other pages.
 */
export default function StreakRestoreCard({ variant = 'card' }) {
  const { user, updateUser } = useAuth();
  const offer = user?.streak_restore;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [restoredTo, setRestoredTo] = useState(null);
  const [dismissed, setDismissed] = useState(() => (offer ? readDismissed(offer) : false));

  const isBanner = variant === 'banner';

  const handleRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await restoreStreak();
      setRestoredTo(data.restored_streak);
      updateUser(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not restore your streak. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    try { sessionStorage.setItem(dismissKey(offer), '1'); } catch { /* fine — just hide it */ }
    setDismissed(true);
  };

  if (restoredTo !== null) {
    return (
      <div
        className={`border-2 border-ink text-ink ${isBanner ? 'mb-6 px-4 py-3' : 'brutalist-card p-4 md:p-6'}`}
        style={TINT}
        role="status"
      >
        <p className="font-black m-0">🔥 Streak restored — you're back on a {restoredTo}-day streak. Keep it going today!</p>
      </div>
    );
  }

  if (!offer || (isBanner && dismissed)) return null;

  const missed = `${offer.missed_days} day${offer.missed_days === 1 ? '' : 's'}`;
  const button = (
    <button
      onClick={handleRestore}
      disabled={busy || !offer.can_afford}
      className="px-4 py-2 border-2 border-ink bg-ink text-canvas font-black uppercase tracking-wider text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ boxShadow: '3px 3px 0px 0px var(--color-ink)' }}
    >
      {busy ? 'Restoring…' : `Restore for 💰 ${offer.cost}`}
    </button>
  );

  if (isBanner) {
    return (
      <div className="mb-6 border-2 border-ink px-4 py-3 flex flex-wrap items-center gap-3" style={TINT} role="region" aria-label="Streak restore">
        <p className="m-0 flex-1 min-w-[220px] font-bold text-ink">
          💔 Your {offer.lost_streak}-day streak ended — you missed {missed}.
          {offer.can_afford
            ? ` Restore it to 🔥 ${offer.restored_streak} days?`
            : ` Restoring costs ${offer.cost} coins — you have ${user.coins}.`}
        </p>
        {offer.can_afford && button}
        <button
          onClick={handleDismiss}
          className="px-2 py-2 text-ink font-bold uppercase tracking-wider text-xs cursor-pointer hover:underline bg-transparent border-none"
        >
          Not now
        </button>
        {error && <p className="m-0 w-full text-sm font-bold text-primary">{error}</p>}
      </div>
    );
  }

  return (
    <div className="brutalist-card p-4 md:p-6" style={TINT} role="region" aria-label="Streak restore">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="text-4xl" aria-hidden="true">💔</div>
        <div className="flex-1 min-w-0">
          <h3 className="heading-md m-0 mb-1">Your {offer.lost_streak}-day streak ended</h3>
          <p className="m-0 text-sm text-ink">
            You missed {missed}. Restoring bridges the gap so your streak continues at <strong>🔥 {offer.restored_streak} days</strong>.
            {' '}It costs <strong>{offer.cost} coins</strong> ({offer.missed_days} × 50) — you have <strong>{user.coins}</strong>.
          </p>
          {!offer.can_afford && (
            <p className="m-0 mt-2 text-sm font-bold text-ink">Earn more coins by completing lessons, then come back — you have up to a week.</p>
          )}
          {error && <p className="m-0 mt-2 text-sm font-bold text-primary">{error}</p>}
        </div>
        <div className="shrink-0">{button}</div>
      </div>
    </div>
  );
}
