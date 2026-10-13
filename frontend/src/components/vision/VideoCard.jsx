import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';

// ── Track accent color mapping ──────────────────────────────────────────
const TRACK_COLORS = {
  cloud: 'var(--color-cobalt)',
  ai:    'var(--color-violet)',
  data:  'var(--color-emerald)',
};

export default function VideoCard({ video }) {
  const accentColor = TRACK_COLORS[video.trackSlug] || 'var(--color-primary)';

  return (
    <Link
      to={`/vision/video/${video.id}`}
      className="block no-underline text-ink group"
    >
      <article
        className="border-2 bg-surface overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
        style={{
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-brutal-sm)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '6px 8px 0px 0px var(--color-ink)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-brutal-sm)';
        }}
      >
        {/* ── Thumbnail ──────────────────────────────────────────────── */}
        <div className="relative aspect-video overflow-hidden bg-canvas">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
            <div
              className="w-12 h-12 border-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                borderColor: 'var(--color-ink)',
                background: 'var(--color-primary)',
                boxShadow: '3px 3px 0px 0px var(--color-ink)',
              }}
            >
              <Play size={20} className="text-white" fill="white" />
            </div>
          </div>

          {/* Duration badge */}
          <div
            className="absolute bottom-2 right-2 px-2 py-1 label-mono flex items-center gap-1"
            style={{
              background: 'var(--color-ink)',
              color: '#FFFFFF',
              fontSize: '10px',
              letterSpacing: '0.05em',
            }}
          >
            <Clock size={10} />
            {video.duration}
          </div>

          {/* Track tag */}
          <div
            className="absolute top-2 left-2 px-2 py-1 label-mono border"
            style={{
              background: accentColor,
              color: '#FFFFFF',
              borderColor: 'var(--color-ink)',
              fontSize: '9px',
            }}
          >
            {video.track}
          </div>
        </div>

        {/* ── Card Body ──────────────────────────────────────────────── */}
        <div className="p-4 border-t-2" style={{ borderColor: 'var(--color-border)' }}>
          <h3
            className="font-bold text-sm leading-snug mb-2 line-clamp-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {video.title}
          </h3>
          <p
            className="text-xs"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
          >
            {video.channelName}
          </p>
        </div>
      </article>
    </Link>
  );
}
