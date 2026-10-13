const STEPS = [
  {
    num: 1,
    icon: '🎯',
    title: 'PICK A TRACK',
    description: 'Choose from Data Science, AI & ML, or Cloud Computing. Your journey starts here.',
    bg: 'bg-lime-400',
    badgeBg: '#059669',
  },
  {
    num: 2,
    icon: '📚',
    title: 'LEARN BY DOING',
    description: 'Rich lessons packed with interactive flip cards, code snippets, and real-world analogies.',
    bg: 'bg-orange-400',
    badgeBg: '#EA580C',
  },
  {
    num: 3,
    icon: '🏆',
    title: 'BEAT THE BOSS',
    description: 'Pass the Level Boss Quiz to prove mastery and unlock the next stage of your curriculum.',
    bg: 'bg-sky-400',
    badgeBg: '#2563EB',
  },
  {
    num: 4,
    icon: '🚀',
    title: 'SHIP YOUR CAPSTONE',
    description: 'Build a real project, push it to GitHub, and get it graded by our AI evaluator.',
    bg: 'bg-rose-400',
    badgeBg: '#E52E2E',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-block bg-black px-8 py-4 shadow-[8px_8px_0px_0px_#059669] rotate-1">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white m-0">
            HOW IT WORKS
          </h2>
        </div>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto font-semibold">
          Four steps from zero to certified. Simple, structured, satisfying.
        </p>
      </div>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={`${step.bg} border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-center group`}
          >
            {/* Step Icon Badge */}
            <div
              className="w-16 h-16 mx-auto mb-5 border-4 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-12 transition-transform duration-200"
              style={{ backgroundColor: step.badgeBg }}
            >
              {step.icon}
            </div>

            {/* Step Label */}
            <div
              className="inline-block px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-widest mb-3 text-white"
              style={{ backgroundColor: step.badgeBg }}
            >
              STEP {step.num}
            </div>

            <h3 className="text-lg font-black uppercase tracking-tighter text-black mb-3">
              {step.title}
            </h3>
            <p className="text-black/70 text-sm leading-relaxed font-medium">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
