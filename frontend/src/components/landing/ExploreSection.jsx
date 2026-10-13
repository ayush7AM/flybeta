const FEATURES = [
  {
    emoji: '🧪',
    title: 'INTERACTIVE LABS',
    description: 'Hands-on coding environments with AI-powered feedback. Build real projects, not toy examples.',
    bg: 'bg-pink-400',
    accent: '#E52E2E',
  },
  {
    emoji: '⚔️',
    title: 'BOSS QUIZZES',
    description: 'Prove your mastery at the end of every level. Only the prepared survive the Boss Quiz.',
    bg: 'bg-cyan-400',
    accent: '#2563EB',
  },
  {
    emoji: '🤖',
    title: 'AI EVALUATOR',
    description: 'Submit your capstone project and get graded by Google Gemini. Real feedback, real growth.',
    bg: 'bg-purple-400',
    accent: '#6D28D9',
  },
];

export default function ExploreSection() {
  return (
    <section id="about-us" className="py-32 px-6">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-block bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black m-0">
            WHAT AWAITS YOU
          </h2>
        </div>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto font-semibold">
          Three pillars of a learning experience designed to make you dangerous.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            className={`${feature.bg} border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-center group`}
          >
            {/* Emoji Badge */}
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-black bg-white flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform duration-200">
              {feature.emoji}
            </div>

            <h3 className="text-xl font-black uppercase tracking-tighter text-black mb-3">
              {feature.title}
            </h3>
            <p className="text-black/70 leading-relaxed text-sm font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
