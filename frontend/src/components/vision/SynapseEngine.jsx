import { useState, useCallback } from 'react';
import { Zap, Check, Loader, AlertCircle } from 'lucide-react';
import { extractVideoKnowledge } from '../../services/api';

// ── Stepper Steps ───────────────────────────────────────────────────────
const STEPS = [
  { label: 'Extracting Transcript...', duration: 1500 },
  { label: 'Analyzing Context...',     duration: 1500 },
  { label: 'Synthesizing Quiz...',     duration: 1500 },
];

export default function SynapseEngine({ videoUrl }) {
  const [phase, setPhase] = useState('idle'); // idle | loading | results
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleExtract = useCallback(async () => {
    setPhase('loading');
    setCurrentStep(0);
    setAnswers({});
    setIsSubmitted(false);
    setErrorMsg('');

    // Start stepper animation independently of the fetch
    let step = 0;
    const advance = () => {
      step++;
      if (step < STEPS.length) {
        setCurrentStep(step);
        setTimeout(advance, STEPS[step].duration);
      }
    };
    setTimeout(advance, STEPS[0].duration);

    try {
      // Call live backend
      const data = await extractVideoKnowledge(videoUrl);
      // data should be the array of 3 questions from Gemini
      setQuizQuestions(data.questions || data); 
      setPhase('results');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to extract quiz.');
      setPhase('idle');
    }
  }, [videoUrl]);

  const handleAnswer = (questionId, optionIndex) => {
    if (!isSubmitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === quizQuestions.length) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── 1. Initial State (The Trigger) ─────────────────────────────── */}
      {phase === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface border-2 border-ink" style={{ boxShadow: 'var(--shadow-brutal)' }}>
          <span style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</span>
          <h2 className="heading-md mb-6">SYNAPSE ENGINE</h2>
          <p className="text-muted mb-8 max-w-xs leading-relaxed">
            Generate interactive quizzes and flashcards directly from this video's context.
          </p>
          {errorMsg && (
            <div className="mb-6 flex items-center gap-2 label-mono px-4 py-2 border-2 bg-[#fef2f2] text-[var(--color-primary)] border-[var(--color-primary)] text-sm w-full max-w-[300px]">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="text-left">{errorMsg}</span>
            </div>
          )}
          <button
            onClick={handleExtract}
            className="label-mono px-8 py-4 cursor-pointer transition-all w-full max-w-[300px]"
            style={{
              background: 'var(--color-violet)',
              color: '#FFFFFF',
              border: '4px solid var(--color-ink)',
              boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
              fontSize: '14px',
              letterSpacing: '0.05em',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px 0px rgba(0,0,0,1)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
            }}
          >
            ⚡ EXTRACT KNOWLEDGE
          </button>
        </div>
      )}

      {/* ── 2. Loading State (The Stepper) ─────────────────────────────── */}
      {phase === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface border-2 border-ink" style={{ boxShadow: 'var(--shadow-brutal)' }}>
          <h3 className="heading-md mb-8">AI PROCESSING</h3>
          <div className="flex flex-col gap-6 w-full max-w-[280px]">
            {STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;

              return (
                <div key={i} className="flex items-center gap-4">
                  {/* Step indicator */}
                  <div
                    className="w-10 h-10 border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      borderColor: 'var(--color-ink)',
                      background: isDone
                        ? 'var(--color-emerald)'
                        : isActive
                        ? 'var(--color-violet)'
                        : 'var(--color-canvas)',
                      boxShadow: '3px 3px 0px 0px var(--color-ink)',
                    }}
                  >
                    {isDone ? (
                      <Check size={20} className="text-white" />
                    ) : isActive ? (
                      <Loader
                        size={20}
                        className="text-white"
                        style={{ animation: 'spin 1s linear infinite' }}
                      />
                    ) : (
                      <span className="label-mono text-muted text-xs">
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    className="label-mono text-sm transition-colors"
                    style={{
                      color: isDone
                        ? 'var(--color-emerald)'
                        : isActive
                        ? 'var(--color-ink)'
                        : 'var(--color-muted)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Results State (Mock Quiz UI) ────────────────────────────── */}
      {phase === 'results' && (
        <div className="flex-1 flex flex-col h-full bg-surface border-2 border-ink overflow-hidden" style={{ boxShadow: 'var(--shadow-brutal)' }}>
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b-2 border-ink bg-canvas">
            <div
              className="w-10 h-10 border-2 flex items-center justify-center"
              style={{
                borderColor: 'var(--color-ink)',
                background: 'var(--color-violet)',
                boxShadow: '2px 2px 0px 0px var(--color-ink)',
              }}
            >
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="heading-md text-lg">SYNAPSE QUIZ</h3>
              <span className="label-mono text-muted text-[10px]">
                {quizQuestions.length} QUESTIONS
              </span>
            </div>
          </div>

          {/* Scrollable Quiz Container */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="flex flex-col gap-6">
              {quizQuestions.map((q, qi) => {
                const questionId = qi; // Use index as ID since backend doesn't provide IDs
                const selectedAnswer = answers[questionId];
                const hasAnswered = selectedAnswer !== undefined;

                return (
                  <div
                    key={questionId}
                    className="border-2 border-ink p-5 bg-surface"
                    style={{
                      boxShadow: '2px 2px 0px 0px var(--color-ink)',
                    }}
                  >
                    <p className="font-bold text-sm mb-4 leading-relaxed">
                      <span className="label-mono text-violet mr-2">Q{qi + 1}</span>
                      {q.question}
                    </p>

                    <div className="flex flex-col gap-3">
                      {q.options.map((option, oi) => {
                        const isSelected = selectedAnswer === oi;
                        const isCorrectOption = oi === q.correct_index;
                        
                        // Styling logic after submission
                        let optionBg = 'var(--color-surface)';
                        let optionBorder = 'var(--color-ink)';
                        let icon = null;

                        if (isSubmitted) {
                          if (isCorrectOption) {
                            optionBg = '#dcfce7'; // green-100
                            optionBorder = 'var(--color-emerald)';
                            icon = <Check size={16} className="text-emerald" />;
                          } else if (isSelected && !isCorrectOption) {
                            optionBg = '#fee2e2'; // red-100
                            optionBorder = 'var(--color-primary)';
                          }
                        } else if (isSelected) {
                          optionBg = '#f3e8ff'; // violet-100
                          optionBorder = 'var(--color-violet)';
                        }

                        return (
                          <label
                            key={oi}
                            className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-all ${
                              !isSubmitted && !isSelected ? 'hover:bg-canvas' : ''
                            }`}
                            style={{
                              background: optionBg,
                              borderColor: optionBorder,
                            }}
                          >
                            <input
                              type="radio"
                              name={`q-${questionId}`}
                              checked={isSelected}
                              onChange={() => handleAnswer(questionId, oi)}
                              disabled={isSubmitted}
                              className="mt-1 w-4 h-4"
                              style={{ accentColor: 'var(--color-violet)' }}
                            />
                            <span className="text-sm flex-1 leading-relaxed">{option}</span>
                            {icon}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Score & Submit Area */}
            <div className="mt-8 pt-6 border-t-2 border-ink">
              {isSubmitted ? (
                <div
                  className="p-5 border-2 border-ink text-center"
                  style={{
                    background: 'var(--color-canvas)',
                    boxShadow: '4px 4px 0px 0px var(--color-ink)',
                  }}
                >
                  <div className="label-mono text-muted mb-2">FINAL SCORE</div>
                  <div className="heading-md text-2xl">
                    {quizQuestions.filter((q, qi) => answers[qi] === q.correct_index).length} / {quizQuestions.length}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== quizQuestions.length}
                  className="label-mono px-6 py-4 w-full transition-all"
                  style={{
                    background: Object.keys(answers).length === quizQuestions.length ? 'var(--color-ink)' : 'var(--color-muted)',
                    color: '#FFFFFF',
                    border: '2px solid var(--color-ink)',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontSize: '14px',
                    letterSpacing: '0.05em',
                    opacity: Object.keys(answers).length === quizQuestions.length ? 1 : 0.7,
                    cursor: Object.keys(answers).length === quizQuestions.length ? 'pointer' : 'not-allowed',
                  }}
                  onMouseDown={(e) => {
                    if (Object.keys(answers).length !== quizQuestions.length) return;
                    e.currentTarget.style.transform = 'translate(4px, 4px)';
                    e.currentTarget.style.boxShadow = '0px 0px 0px 0px rgba(0,0,0,1)';
                  }}
                  onMouseUp={(e) => {
                    if (Object.keys(answers).length !== quizQuestions.length) return;
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
                  }}
                >
                  SUBMIT ANSWERS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
