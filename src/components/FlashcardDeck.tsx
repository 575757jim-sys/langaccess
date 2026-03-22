import { useState, useRef, useCallback } from 'react';
import { Volume2, Loader2, ChevronRight, RotateCcw, X, CheckCircle } from 'lucide-react';
import { KeyPhrase } from '../data/certificateData';
import { playAudioFromGesture, unlockAudioContext } from '../utils/speech';
import { spanishPhonetic } from '../utils/spanishPhonetic';

interface Props {
  moduleTitle: string;
  trackTitle: string;
  keyPhrases: KeyPhrase[];
  onStartQuiz: () => void;
  onBack: () => void;
}

type CardStatus = 'learning' | 'done';

interface CardState {
  phrase: KeyPhrase;
  status: CardStatus;
}

export default function FlashcardDeck({ moduleTitle, trackTitle, keyPhrases, onStartQuiz, onBack }: Props) {
  const [cards, setCards] = useState<CardState[]>(() =>
    keyPhrases.map(p => ({ phrase: p, status: 'learning' }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const [allDone, setAllDone] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const learningCards = cards.filter(c => c.status === 'learning');
  const doneCount = cards.filter(c => c.status === 'done').length;
  const total = cards.length;

  const currentCard = learningCards[currentIndex % Math.max(learningCards.length, 1)];

  function handleSpeak(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    if (!currentCard) return;
    unlockAudioContext();
    setPlaying(true);
    playAudioFromGesture(currentCard.phrase.spanish, 'spanish');
    setTimeout(() => setPlaying(false), 3000);
  }

  function handleFlip() {
    if (exiting) return;
    setFlipped(f => !f);
  }

  const advance = useCallback((direction: 'left' | 'right') => {
    if (exiting || !currentCard) return;
    setExiting(direction);

    setTimeout(() => {
      setFlipped(false);
      setCards(prev => {
        const updated = prev.map(c =>
          c.phrase === currentCard.phrase
            ? { ...c, status: direction === 'right' ? 'done' : 'learning' }
            : c
        );
        const remaining = updated.filter(c => c.status === 'learning');
        if (remaining.length === 0) {
          setAllDone(true);
        } else {
          setCurrentIndex(i => i % remaining.length);
        }
        return updated;
      });
      setExiting(null);
    }, 280);
  }, [exiting, currentCard]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) {
      handleFlip();
      return;
    }
    if (dx < -40) advance('left');
    else if (dx > 40) advance('right');
  }

  function handleMouseDown(e: React.MouseEvent) {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (touchStartX.current === null) return;
    const dx = e.clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 8) return;
    if (dx < -40) advance('left');
    else if (dx > 40) advance('right');
  }

  function resetDeck() {
    setCards(keyPhrases.map(p => ({ phrase: p, status: 'learning' })));
    setCurrentIndex(0);
    setFlipped(false);
    setAllDone(false);
    setExiting(null);
  }

  const exitTransformClass =
    exiting === 'left'
      ? 'translate-x-[-110%] rotate-[-8deg] opacity-0'
      : exiting === 'right'
      ? 'translate-x-[110%] rotate-[8deg] opacity-0'
      : '';

  if (allDone) {
    return (
      <div className="fixed inset-0 bg-[#0a0f1e] flex flex-col items-center justify-center z-50 p-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-2">{trackTitle}</p>
        <h2 className="text-2xl font-bold text-white text-center mb-2">{moduleTitle}</h2>
        <p className="text-slate-400 text-sm text-center mb-1">
          You reviewed all {total} phrases.
        </p>
        <p className="text-lg font-semibold text-white text-center mb-8">Ready to take the quiz?</p>

        <button
          onClick={onStartQuiz}
          className="w-full max-w-xs py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 mb-3"
        >
          Start Quiz
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={resetDeck}
          className="w-full max-w-xs py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Practice Again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1e] flex flex-col z-50">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <X className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold leading-none">{trackTitle}</p>
          <p className="text-xs text-slate-400 mt-0.5">{moduleTitle}</p>
        </div>
        <button
          onClick={resetDeck}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-500">
            {doneCount} of {total} phrases
          </span>
          <span className="text-[11px] text-slate-500">
            {learningCards.length} remaining
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4 overflow-hidden">
        <div
          ref={cardRef}
          className={`relative w-full max-w-sm cursor-pointer select-none transition-all duration-[280ms] ease-out ${exitTransformClass}`}
          style={{ perspective: '1000px' }}
          onClick={handleFlip}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            className="relative w-full transition-transform duration-500 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '340px',
            }}
          >
            <div
              className="absolute inset-0 backface-hidden bg-[#111827] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-4">English</p>
              <p className="text-2xl font-bold text-white text-center leading-snug mb-8">{currentCard?.phrase.english}</p>
              <p className="text-[11px] text-slate-600 text-center italic">{currentCard?.phrase.context}</p>
              <div className="absolute bottom-5 right-5">
                <p className="text-[10px] text-slate-600">Tap to flip</p>
              </div>
            </div>

            <div
              className="absolute inset-0 backface-hidden bg-[#0f1c2e] border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center p-8 shadow-2xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-4">Spanish</p>
              <p className="text-2xl font-bold text-white text-center leading-snug mb-3">{currentCard?.phrase.spanish}</p>
              <p className="text-[12px] text-blue-400/80 text-center leading-relaxed mb-6 font-mono">
                {currentCard ? spanishPhonetic(currentCard.phrase.spanish) : ''}
              </p>
              <button
                onClick={handleSpeak}
                onTouchEnd={(e) => { e.stopPropagation(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  playing
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-white/8 text-slate-300 hover:bg-blue-500/20 hover:text-blue-400'
                }`}
              >
                {playing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">Hear pronunciation</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 w-full max-w-sm">
          <button
            onClick={() => advance('left')}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span className="text-lg leading-none">←</span>
            Still learning
          </button>
          <button
            onClick={() => advance('right')}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
          >
            Got it
            <span className="text-lg leading-none">→</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-600 text-center mt-3">
          Swipe left to review again · Swipe right when you know it
        </p>
      </div>
    </div>
  );
}
