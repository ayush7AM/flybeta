import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SectionHeader from './SectionHeader';

const STEPS = [
  {
    num: 1,
    icon: '🎯',
    title: 'Pick a track',
    description: 'AI & ML, Cloud Computing or Data Science — all three are open from day one.',
    color: '#059669',
  },
  {
    num: 2,
    icon: '📚',
    title: 'Learn by doing',
    description: 'Short lessons with flip cards, code you can run and real-world analogies.',
    color: '#EA580C',
  },
  {
    num: 3,
    icon: '⚔️',
    title: 'Beat the boss',
    description: "Score 60% on each level's boss quiz to unlock the next one.",
    color: '#2563EB',
  },
  {
    num: 4,
    icon: '🎓',
    title: 'Ship your capstone',
    description: 'Push a real project to GitHub. Pass the AI review to earn your certificate.',
    color: '#E52E2E',
  },
];

export default function HowItWorksSection() {
  const { user } = useAuth();

  return (
    <section id="how-it-works" className="py-20 md:py-24 px-4 md:px-6 scroll-mt-16 md:scroll-mt-20">
      <SectionHeader
        eyebrow="Your path"
        title="How it works"
        subtitle="Four steps from zero to certified."
        inverted
        tilt="rotate-1"
      />

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto list-none p-0 m-0">
        {STEPS.map((step) => (
          <li
            key={step.num}
            className="bg-surface border-4 border-ink shadow-[6px_6px_0px_0px_var(--color-ink)] overflow-hidden"
          >
            <div className="h-2" style={{ backgroundColor: step.color }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-ink font-black text-lg text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.num}
                </span>
                <span className="text-2xl" aria-hidden="true">{step.icon}</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter text-ink mb-2">
                {step.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed font-medium m-0">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* Closing call to action */}
      <div className="text-center mt-12 md:mt-16">
        <Link
          to="/tracks"
          className="inline-block px-8 py-4 bg-[#059669] text-white font-black text-base md:text-lg uppercase tracking-wider no-underline border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          {user ? 'Continue learning →' : 'Start your first level →'}
        </Link>
      </div>
    </section>
  );
}
