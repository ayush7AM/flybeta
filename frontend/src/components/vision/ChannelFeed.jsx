import { useState } from 'react';
import VideoCard from './VideoCard';
import MOCK_VIDEOS, { TRACKS } from '../../data/mockVideos';
import { Monitor, BrainCircuit, BarChart3, LayoutGrid } from 'lucide-react';

// ── Track section icons ─────────────────────────────────────────────────
const TRACK_ICONS = {
  cloud: Monitor,
  ai:    BrainCircuit,
  data:  BarChart3,
};

// ── Filter badge definitions ────────────────────────────────────────────
const FILTER_BADGES = [
  { key: 'all',   label: 'All',                 color: 'var(--color-primary)',  icon: LayoutGrid },
  { key: 'ai',    label: 'AI',                  color: 'var(--color-violet)',   icon: BrainCircuit },
  { key: 'cloud', label: 'Cloud',               color: 'var(--color-cobalt)',   icon: Monitor },
  { key: 'data',  label: 'Data Science',        color: 'var(--color-emerald)',  icon: BarChart3 },
];

export default function ChannelFeed() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter videos by selected track
  const filteredTracks = activeFilter === 'all'
    ? TRACKS
    : TRACKS.filter((t) => t.slug === activeFilter);

  return (
    <div className="flex flex-col gap-10">
      {/* ── Track Filter Bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {FILTER_BADGES.map(({ key, label, color, icon: Icon }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className="brutalist-badge flex items-center gap-2 cursor-pointer transition-all"
              style={{
                background: isActive ? color : 'var(--color-surface)',
                color: isActive ? '#FFFFFF' : 'var(--color-ink)',
                borderColor: 'var(--color-ink)',
                boxShadow: isActive
                  ? '3px 3px 0px 0px var(--color-ink)'
                  : '2px 2px 0px 0px var(--color-ink)',
                transform: isActive ? 'translate(-1px, -1px)' : 'none',
                padding: '8px 16px',
              }}
            >
              <Icon size={14} />
              {label}
              {key === 'all' && (
                <span style={{ opacity: 0.7 }}>{MOCK_VIDEOS.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Track Sections ─────────────────────────────────────────── */}
      {filteredTracks.map((track) => {
        const videos = MOCK_VIDEOS.filter((v) => v.trackSlug === track.slug);
        const Icon = TRACK_ICONS[track.slug] || Monitor;

        return (
          <section key={track.slug}>
            {/* Track Section Header */}
            <div
              className="flex items-center gap-3 mb-6 pb-3 border-b-2"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="w-10 h-10 border-2 flex items-center justify-center"
                style={{
                  borderColor: 'var(--color-ink)',
                  background: track.color,
                  boxShadow: '3px 3px 0px 0px var(--color-ink)',
                }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <h2
                  className="heading-md tracking-tight"
                  style={{ fontSize: '20px' }}
                >
                  {track.name}
                </h2>
                <span
                  className="label-mono"
                  style={{ color: 'var(--color-muted)', fontSize: '10px' }}
                >
                  {videos.length} VIDEOS
                </span>
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
