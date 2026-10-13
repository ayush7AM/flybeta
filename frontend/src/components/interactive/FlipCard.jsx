import { useState } from 'react';

/**
 * FlipCard — An interactive Neo-Brutalist flip card component.
 *
 * Usage inside Markdown (via MarkdownRenderer):
 *   <flipcard front="Question text" back="Answer text" image="/path/to/img.png"></flipcard>
 *
 * Props:
 *   - frontText (string): Text displayed on the front face
 *   - backText  (string): Text displayed on the back face
 *   - image     (string): Optional image URL shown on the front face
 */
export default function FlipCard({ frontText, backText, image }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="flip-card-container my-6 cursor-pointer select-none min-h-[16rem]"
      style={{ perspective: '1000px', width: '100%', maxWidth: '420px' }}
      onClick={() => setFlipped((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((prev) => !prev);
        }
      }}
      aria-label={flipped ? `Answer: ${backText}` : `Question: ${frontText}. Tap to flip.`}
    >
      <div
        className="flip-card-inner h-full w-full"
        style={{
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT FACE ─────────────────────────────────────── */}
        <div
          className="flip-card-face flip-card-front flex flex-col items-center justify-center text-center h-full w-full p-6 sm:p-8"
          style={{
            background: '#FDE047',
            border: '4px solid var(--color-ink, #111111)',
            boxShadow: flipped
              ? '2px 2px 0px 0px var(--color-ink, #111111)'
              : '6px 6px 0px 0px var(--color-ink, #111111)',
          }}
        >
          {image && (
            <img
              src={image}
              alt=""
              className="w-full h-32 object-contain mb-3"
              loading="lazy"
            />
          )}
          <p
            className="text-sm sm:text-base font-bold leading-snug"
            style={{ color: 'var(--color-ink, #111111)', fontFamily: 'var(--font-body)' }}
          >
            {frontText}
          </p>
          <span
            className="label-mono mt-4 inline-block"
            style={{
              background: 'var(--color-ink, #111111)',
              color: '#FDE047',
              padding: '4px 12px',
              border: '1px solid var(--color-ink, #111111)',
              fontSize: '10px',
            }}
          >
            ⟳ TAP TO FLIP
          </span>
        </div>

        {/* ── BACK FACE ──────────────────────────────────────── */}
        <div
          className="flip-card-face flip-card-back flex flex-col items-center justify-center text-center h-full w-full p-6 sm:p-8 overflow-y-auto"
          style={{
            background: '#6EE7B7',
            border: '4px solid var(--color-ink, #111111)',
            boxShadow: flipped
              ? '6px 6px 0px 0px var(--color-ink, #111111)'
              : '2px 2px 0px 0px var(--color-ink, #111111)',
          }}
        >
          <span
            className="label-mono mb-3 inline-block"
            style={{
              background: 'var(--color-ink, #111111)',
              color: '#6EE7B7',
              padding: '4px 12px',
              border: '1px solid var(--color-ink, #111111)',
              fontSize: '10px',
            }}
          >
            ✓ ANSWER
          </span>
          <p
            className="text-sm sm:text-base font-bold leading-snug"
            style={{ color: 'var(--color-ink, #111111)', fontFamily: 'var(--font-body)' }}
          >
            {backText}
          </p>
        </div>
      </div>
    </div>
  );
}
