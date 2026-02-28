import { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
import { CertModule, QuizQuestion, PASS_THRESHOLD } from '../data/certificateData';

interface Props {
  module: CertModule;
  trackTitle: string;
  onComplete: (score: number, passed: boolean) => void;
  onClose: () => void;
}

type Phase = 'quiz' | 'result';

export default function CertQuizEngine({ module, trackTitle, onComplete, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions: QuizQuestion[] = module.questions;
  const current = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    setAnswers(prev => [...prev, idx === current.correctIndex]);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      const correct = answers.filter(Boolean).length + (selected === current.correctIndex ? 1 : 0);
      const finalAnswers = [...answers, selected === current.correctIndex];
      const score = finalAnswers.filter(Boolean).length / totalQuestions;
      const passed = score >= PASS_THRESHOLD;
      onComplete(score, passed);
      setPhase('result');
    }
  };

  const finalScore = answers.length === totalQuestions
    ? answers.filter(Boolean).length / totalQuestions
    : 0;
  const passed = finalScore >= PASS_THRESHOLD;

  if (phase === 'result') {
    const correct = answers.filter(Boolean).length;
    return (
      <div className="fixed inset-0 bg-[#0a0f1e]/95 flex items-center justify-center z-50 p-4">
        <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-white/10">
          {passed ? (
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-green-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Module Passed!' : 'Not Quite Yet'}
          </h2>
          <p className="text-slate-400 mb-6">
            {correct}/{totalQuestions} correct — {Math.round(finalScore * 100)}%
          </p>
          {passed ? (
            <p className="text-green-400 text-sm mb-6">
              You passed {module.title} with {Math.round(finalScore * 100)}%.
              {answers.length === totalQuestions && correct === totalQuestions ? ' Perfect score!' : ' Great work!'}
            </p>
          ) : (
            <p className="text-slate-300 text-sm mb-6">
              You need {Math.round(PASS_THRESHOLD * 100)}% to pass. Review the phrases and try again.
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold transition-colors"
          >
            {passed ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1e]/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-white/10 my-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{trackTitle}</p>
            <p className="text-sm font-semibold text-slate-300">{module.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-sm">
            Exit
          </button>
        </div>

        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentIndex
                  ? answers[i] ? 'bg-green-500' : 'bg-red-500'
                  : i === currentIndex
                  ? 'bg-blue-400'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-slate-500 mb-2">Question {currentIndex + 1} of {totalQuestions}</p>
        <h3 className="text-lg font-semibold text-white mb-5 leading-snug">{current.question}</h3>

        <div className="space-y-3 mb-5">
          {current.options.map((opt, idx) => {
            let cls = 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10';
            if (selected !== null) {
              if (idx === current.correctIndex) {
                cls = 'border border-green-500 bg-green-500/15 text-green-300';
              } else if (idx === selected && idx !== current.correctIndex) {
                cls = 'border border-red-500 bg-red-500/15 text-red-300';
              } else {
                cls = 'border border-white/5 bg-white/3 text-slate-500';
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${cls}`}
              >
                <span className="w-6 h-6 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm leading-snug">{opt}</span>
                {selected !== null && idx === current.correctIndex && (
                  <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />
                )}
                {selected !== null && idx === selected && idx !== current.correctIndex && (
                  <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`rounded-xl p-4 mb-5 text-sm ${
            selected === current.correctIndex
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            <p className="font-semibold mb-1">
              {selected === current.correctIndex ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="text-slate-300 text-xs leading-relaxed">{current.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {currentIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
