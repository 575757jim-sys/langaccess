import { useState } from 'react';
import { Volume2, Loader2, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { KeyPhrase } from '../data/certificateData';
import { playAudioFromGesture, unlockAudioContext } from '../utils/speech';
import FlashcardDeck from './FlashcardDeck';

interface Props {
  moduleTitle: string;
  trackTitle: string;
  keyPhrases: KeyPhrase[];
  onReady: () => void;
  onClose: () => void;
}

export default function QuizPhrasePreview({ moduleTitle, trackTitle, keyPhrases, onReady, onClose }: Props) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);

  async function handleSpeak(index: number, spanish: string) {
    unlockAudioContext();
    setPlaying(index);
    playAudioFromGesture(spanish, 'spanish');
    setTimeout(() => setPlaying(prev => (prev === index ? null : prev)), 3000);
  }

  if (showFlashcards) {
    return (
      <FlashcardDeck
        moduleTitle={moduleTitle}
        trackTitle={trackTitle}
        keyPhrases={keyPhrases}
        onStartQuiz={onReady}
        onBack={() => setShowFlashcards(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1e]/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 my-4 flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-white/8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">{trackTitle}</p>
              <p className="text-sm font-bold text-white leading-tight">{moduleTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-sm flex-shrink-0 mt-0.5">
            Exit
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Review these 10 key phrases before the quiz. Tap the speaker icon to hear each one in Spanish.
          </p>
        </div>

        <div className="px-4 pb-4 overflow-y-auto max-h-[50vh] space-y-2.5">
          {keyPhrases.map((phrase, i) => (
            <div
              key={i}
              className="bg-white/4 border border-white/8 rounded-xl p-4 flex gap-3 items-start"
            >
              <span className="w-6 h-6 rounded-full bg-white/8 border border-white/10 text-[11px] font-bold text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 mb-0.5 leading-snug">{phrase.english}</p>
                <p className="text-base font-semibold text-white leading-snug mb-1.5">{phrase.spanish}</p>
                <p className="text-[10px] text-slate-600 leading-snug italic">{phrase.context}</p>
              </div>
              <button
                onClick={() => handleSpeak(i, phrase.spanish)}
                disabled={playing === i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  playing === i
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-white/5 text-slate-500 hover:bg-blue-500/20 hover:text-blue-400'
                }`}
                aria-label={`Speak: ${phrase.spanish}`}
              >
                {playing === i ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-white/8 space-y-3">
          <button
            onClick={() => setShowFlashcards(true)}
            className="w-full py-3 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            Practice with Flashcards
          </button>
          <button
            onClick={onReady}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            I'm Ready — Start Quiz
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
