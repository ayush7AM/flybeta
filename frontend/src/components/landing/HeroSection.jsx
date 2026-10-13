import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// What used to be scattered stickers, gathered into one tidy row
const HIGHLIGHTS = ['★ Free forever', '3 tracks · 30 levels', '100% hands-on', 'AI-graded capstone'];

export default function HeroSection() {
  const { user } = useAuth();

  const scrollToSteps = (e) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative overflow-hidden">
      {/* ── Two accents, large screens only ──────────────────────────── */}
      <div className="hidden lg:block absolute top-16 right-[14%] rotate-12 select-none pointer-events-none" aria-hidden="true">
        <div className="bg-[#E52E2E] text-white font-black text-xs uppercase tracking-widest px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          BETA
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-20 left-[14%] -rotate-12 select-none pointer-events-none" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="text-[#EAB308]">
          <path d="M24 0L29.5 18.5H48L33.3 29.9L38.8 48L24 36.6L9.2 48L14.7 29.9L0 18.5H18.5L24 0Z" fill="currentColor" stroke="black" strokeWidth="3" />
        </svg>
      </div>

      {/* ── Hero Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-14 md:pb-20 flex flex-col items-center text-center">
        {/* Track trio */}
        <div className="flex gap-4 text-4xl md:text-5xl mb-8" aria-hidden="true">
          <span className="inline-block border-4 border-black bg-white p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">🧑‍💻</span>
          <span className="inline-block border-4 border-black bg-white p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">🤖</span>
          <span className="inline-block border-4 border-black bg-white p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">☁️</span>
        </div>

        {/* Headline blocks */}
        <h1 className="flex flex-col gap-3 items-center m-0">
          <span className="inline-block bg-white border-4 border-black px-6 md:px-8 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-2 hover:rotate-0 transition-transform text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-black">
            Learn tech.
          </span>
          <span className="inline-block bg-[#E52E2E] border-4 border-black px-6 md:px-8 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-1 hover:rotate-0 transition-transform text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
            Level up.
          </span>
          <span className="inline-block bg-[#EAB308] border-4 border-black px-6 md:px-8 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-1 hover:rotate-0 transition-transform text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-black">
            Fly higher.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-ink leading-relaxed m-0">
          Master <strong>AI &amp; Machine Learning</strong>, <strong>Cloud Computing</strong> and <strong>Data Science</strong> with
          bite-sized lessons, boss quizzes that unlock every level, and a capstone graded by AI.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/tracks"
            className="px-8 py-4 bg-[#059669] text-white font-black text-base md:text-lg uppercase tracking-wider no-underline border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
          >
            {user ? 'Continue learning →' : '🎮 Start learning free →'}
          </Link>
          <a
            href="#how-it-works"
            onClick={scrollToSteps}
            className="px-8 py-4 bg-surface text-ink font-black text-base md:text-lg uppercase tracking-wider no-underline border-4 border-ink shadow-[6px_6px_0px_0px_var(--color-ink)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-all"
          >
            See how it works
          </a>
        </div>

        {/* Highlights */}
        <ul className="mt-8 flex flex-wrap justify-center gap-2 list-none p-0 m-0">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="label-mono px-3 py-1.5 border-2 border-ink bg-surface text-ink">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
