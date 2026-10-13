import { useEffect, useMemo, useRef, useState } from 'react';
import { getActivity } from '../services/api';

// ── Activity Heatmap (GitHub-style) ──────────────────────────────────────
// One square per day for the last year, shaded by how much the user
// learned that day (lessons + boss quizzes + capstones). Data comes from the
// server, so it follows the user across devices.

const WEEKS = 52;
const CELL = 12;
const GAP = 3;
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Dates are handled as UTC midnights so the browser's time zone never shifts a day;
// "today" comes from the server, which decides where a day begins.
const parseDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

const intensity = (count) => {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

// Shades of the active theme's primary color, so it fits every theme
const SHADES = [
  'var(--color-canvas)',
  'color-mix(in srgb, var(--color-primary) 30%, var(--color-canvas))',
  'color-mix(in srgb, var(--color-primary) 55%, var(--color-canvas))',
  'color-mix(in srgb, var(--color-primary) 80%, var(--color-canvas))',
  'var(--color-primary)',
];

const describe = (day) => {
  const label = new Date(day.ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  if (!day.count) return `${label}: no activity`;
  const parts = [
    day.lessons && `${day.lessons} lesson${day.lessons === 1 ? '' : 's'}`,
    day.quizzes && `${day.quizzes} boss quiz${day.quizzes === 1 ? '' : 'zes'}`,
    day.capstones && `${day.capstones} capstone${day.capstones === 1 ? '' : 's'}`,
  ].filter(Boolean);
  return `${label}: ${parts.join(', ')}${day.xp ? ` · +${day.xp} XP` : ''}`;
};

export default function ActivityHeatmap({ refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getActivity(WEEKS * 7 + 7)
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const { weeks, monthLabels, activeDays } = useMemo(() => {
    if (!data) return { weeks: [], monthLabels: [], activeDays: 0 };

    const byDate = Object.fromEntries(data.days.map((d) => [d.date, d]));
    const today = parseDay(data.today);
    const weekday = (new Date(today).getUTCDay() + 6) % 7; // Mon = 0
    const start = today - ((WEEKS - 1) * 7 + weekday) * MS_PER_DAY;

    const weeksArr = [];
    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const ms = start + (w * 7 + d) * MS_PER_DAY;
        if (ms > today) {
          week.push(null); // future days in the current week
        } else {
          const entry = byDate[toIso(ms)] || {};
          week.push({ ms, ...entry, count: entry.count || 0 });
        }
      }
      weeksArr.push(week);
    }

    const labels = [];
    let lastMonth = -1;
    weeksArr.forEach((week, index) => {
      const month = new Date(week[0].ms).getUTCMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        labels.push({
          index,
          label: new Date(week[0].ms).toLocaleString(undefined, { month: 'short', timeZone: 'UTC' }),
        });
      }
    });

    return {
      weeks: weeksArr,
      monthLabels: labels,
      activeDays: data.days.filter((d) => d.count > 0).length,
    };
  }, [data]);

  // Phones show the most recent weeks first
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [weeks]);

  const gridWidth = WEEKS * (CELL + GAP);

  return (
    <div id="tour-heatmap" className="brutalist-card p-4 md:p-6" style={{ background: 'var(--color-surface)' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <h3 className="heading-md m-0">LEARNING ACTIVITY</h3>
        {data && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="brutalist-badge bg-flame-light text-flame" title="Current streak">
              🔥 {data.current_streak} day{data.current_streak === 1 ? '' : 's'}
            </span>
            <span className="brutalist-badge bg-gold-light text-gold" title="Best streak">
              🏆 Best {data.best_streak}
            </span>
            <span className="brutalist-badge bg-canvas text-ink" title="Active days in the last year">
              📅 {activeDays} active day{activeDays === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      {error && <p className="label-mono text-muted m-0">Couldn't load your activity right now.</p>}
      {!data && !error && <p className="label-mono text-muted m-0">Loading activity…</p>}

      {data && (
        <>
          <div ref={scrollRef} className="overflow-x-auto pb-1">
            <div style={{ width: gridWidth + 32 }}>
              {/* Month labels */}
              <div className="relative h-4 mb-1" style={{ marginLeft: 32 }}>
                {monthLabels.map(({ index, label }) => (
                  <span
                    key={index}
                    className="label-mono text-muted absolute"
                    style={{ left: index * (CELL + GAP), fontSize: '10px', whiteSpace: 'nowrap' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex">
                {/* Weekday labels */}
                <div className="flex flex-col shrink-0" style={{ width: 32, gap: GAP }}>
                  {DAY_LABELS.map((label, i) => (
                    <span key={i} className="label-mono text-muted" style={{ fontSize: '9px', height: CELL, lineHeight: `${CELL}px` }}>
                      {label}
                    </span>
                  ))}
                </div>

                {/* Day squares */}
                <div className="flex" style={{ gap: GAP }} role="img" aria-label={`${activeDays} active days in the last year`}>
                  {weeks.map((week, w) => (
                    <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                      {week.map((day, d) => (
                        <div
                          key={d}
                          title={day ? describe(day) : undefined}
                          style={{
                            width: CELL,
                            height: CELL,
                            background: day ? SHADES[intensity(day.count)] : 'transparent',
                            border: day ? '1px solid var(--color-border-light)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
            <p className="label-mono text-muted m-0" style={{ fontSize: '10px' }}>
              {activeDays === 0 ? "Complete a lesson to light up today's square." : 'Hover a square for details.'}
            </p>
            <div className="flex items-center gap-1">
              <span className="label-mono text-muted" style={{ fontSize: '10px' }}>Less</span>
              {SHADES.map((shade, i) => (
                <div key={i} style={{ width: CELL, height: CELL, background: shade, border: '1px solid var(--color-border-light)' }} />
              ))}
              <span className="label-mono text-muted" style={{ fontSize: '10px' }}>More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
