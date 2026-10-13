import SectionHeader from './SectionHeader';

const FEATURES = [
  {
    emoji: '🧪',
    title: 'AI Labs',
    description: 'Blueprint Lab turns a project idea into a step-by-step build plan. Code Drishti reviews your code and ranks every issue by severity.',
    bg: 'bg-pink-400',
  },
  {
    emoji: '⚔️',
    title: 'Boss Quizzes',
    description: 'Every level ends with a five-question boss. Score 60% to unlock the next level — and bank bonus XP on the way.',
    bg: 'bg-cyan-400',
  },
  {
    emoji: '🎓',
    title: 'AI-Graded Capstone',
    description: 'Ship a real project to GitHub. Pass the AI review to complete the track and earn a certificate you can share.',
    bg: 'bg-purple-400',
  },
];

export default function ExploreSection() {
  return (
    <section id="features" className="py-20 md:py-24 px-4 md:px-6 scroll-mt-16 md:scroll-mt-20">
      <SectionHeader
        eyebrow="Why FlyBeta"
        title="What awaits you"
        subtitle="Three ways FlyBeta turns watching into doing."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={`${feature.bg} border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-center group`}
          >
            <div className="w-16 h-16 mx-auto mb-5 border-4 border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform duration-200">
              {feature.emoji}
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black mb-3">
              {feature.title}
            </h3>
            <p className="text-black/75 leading-relaxed text-sm font-medium m-0">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
