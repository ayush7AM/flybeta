import { Link } from 'react-router-dom';
import LandingNavbar from './LandingNavbar';

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Decorative Stickers (Organized Chaos) ────────────────────── */}
      <div className="absolute top-32 right-12 md:right-24 rotate-12 z-0 select-none pointer-events-none">
        <div className="bg-[#E52E2E] text-white font-black text-xs uppercase tracking-widest px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          BETA
        </div>
      </div>
      <div className="absolute top-48 left-6 md:left-20 -rotate-6 z-0 select-none pointer-events-none">
        <div className="bg-[#EAB308] text-black font-black text-[10px] uppercase tracking-widest px-3 py-1 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-full">
          ★ FREE FOREVER ★
        </div>
      </div>
      <div className="absolute bottom-40 right-8 md:right-32 rotate-6 z-0 select-none pointer-events-none">
        <div className="w-16 h-16 bg-[#059669] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl -rotate-12">
          ⚡
        </div>
      </div>
      <div className="absolute bottom-60 left-10 md:left-28 -rotate-3 z-0 select-none pointer-events-none">
        <div className="bg-[#6D28D9] text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          100% HANDS-ON
        </div>
      </div>
      <div className="absolute top-72 right-1/4 rotate-[15deg] z-0 select-none pointer-events-none hidden md:block">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#E52E2E]">
          <path d="M24 0L29.5 18.5H48L33.3 29.9L38.8 48L24 36.6L9.2 48L14.7 29.9L0 18.5H18.5L24 0Z" fill="currentColor" stroke="black" strokeWidth="3"/>
        </svg>
      </div>

      {/* ── Landing Navbar ────────────────────────────────────────────── */}
      <LandingNavbar />

      {/* ── Hero Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        {/* Animated emoji cluster */}
        <div className="flex gap-6 text-5xl md:text-7xl mb-12">
          <span className="inline-block border-4 border-black bg-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-3 animate-bounce-slow">🧑‍💻</span>
          <span className="inline-block border-4 border-black bg-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-2 animate-bounce-slow animation-delay-200">🤖</span>
          <span className="inline-block border-4 border-black bg-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-1 animate-bounce-slow animation-delay-400">☁️</span>
        </div>

        {/* Asymmetric headline blocks */}
        <div className="flex flex-col gap-4 items-center">
          <div className="inline-block bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2 hover:rotate-0 transition-transform">
            <span className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black">
              LEARN TECH.
            </span>
          </div>
          <div className="inline-block bg-[#E52E2E] border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1 hover:rotate-0 transition-transform">
            <span className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white">
              LEVEL UP.
            </span>
          </div>
          <div className="inline-block bg-[#EAB308] border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-1 hover:rotate-0 transition-transform">
            <span className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black">
              FLY HIGHER.
            </span>
          </div>
        </div>

        {/* Subheading */}
        <p className="mt-10 max-w-2xl text-lg md:text-xl text-gray-700 leading-relaxed border-l-4 border-black pl-6 text-left bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Master <strong>Data Science</strong>, <strong>AI & Machine Learning</strong>, and <strong>Cloud Computing</strong> through
          gamified levels, boss quizzes, and an AI-powered capstone evaluator.
        </p>

        {/* CTA */}
        <Link
          to="/tracks"
          className="mt-12 inline-block px-12 py-5 bg-[#059669] text-white font-black text-xl uppercase tracking-wider no-underline border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all"
        >
          🎮 START YOUR ADVENTURE!
        </Link>
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────────────── */}
      <div className="relative z-10 flex justify-center pb-10">
        <div className="animate-bounce text-black text-3xl font-black">
          ↓
        </div>
      </div>
    </section>
  );
}
