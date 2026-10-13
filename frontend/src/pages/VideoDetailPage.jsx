import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getVideoById } from '../data/mockVideos';
import SynapseEngine from '../components/vision/SynapseEngine';

export default function VideoDetailPage() {
  const { id } = useParams();
  const video = getVideoById(id);

  if (!video) {
    return (
      <div className="text-center py-20">
        <h1 className="heading-lg mb-4">VIDEO NOT FOUND</h1>
        <p className="text-muted mb-6">The requested video could not be located.</p>
        <Link
          to="/vision"
          className="brutalist-btn brutalist-btn-primary no-underline"
        >
          ← Back to Vision
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:h-[calc(100vh-100px)] flex flex-col">
      {/* ── Back Navigation ──────────────────────────────────────────── */}
      <Link
        to="/vision"
        className="inline-flex items-center gap-2 label-mono mb-4 no-underline text-muted hover:text-ink transition-colors flex-shrink-0"
      >
        <ArrowLeft size={16} />
        Back to Channels
      </Link>

      {/* ── 60/40 Split Layout ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left: 60% — Video Player */}
        <div className="lg:w-[60%] flex flex-col">
          <div
            className="border-2 bg-ink overflow-hidden"
            style={{
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-brutal)',
            }}
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Meta */}
          <div className="mt-4 flex-shrink-0">
            <h1
              className="heading-md mb-2"
              style={{ fontSize: '22px', textTransform: 'none' }}
            >
              {video.title}
            </h1>
            <p className="label-mono text-muted">{video.channelName}</p>
          </div>
        </div>

        {/* Right: 40% — Synapse Engine */}
        <div className="lg:w-[40%] flex flex-col min-h-0">
          <SynapseEngine videoUrl={`https://www.youtube.com/watch?v=${video.id}`} />
        </div>
      </div>
    </div>
  );
}
