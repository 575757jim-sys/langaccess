import { useState, useRef, useCallback, useEffect } from 'react';
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
  const speakerBtnRef = useRef<HTMLButtonElement>(null);
  const speakerTouched = useRef(false);

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
        } else if (direction === 'right') {
          setCurrentIndex(i => i % remaining.length);
        } else {
          setCurrentIndex(i => (i + 1) % remaining.length);
        }
        return updated;
      });
      setExiting(null);
    }, 280);
  }, [exiting, currentCard]);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const handleFlipRef = useRef(handleFlip);
  handleFlipRef.current = handleFlip;
  const currentCardRef = useRef(currentCard);
  currentCardRef.current = currentCard;

  useEffect(() => {
    const card = cardRef.current;
    const speakerBtn = speakerBtnRef.current;
    if (!card) return;

    function onTouchStart(e: TouchEvent) {
      if (speakerBtn && (e.target === speakerBtn || speakerBtn.contains(e.target as Node))) {
        speakerTouched.current = true;
        return;
      }
      speakerTouched.current = false;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (speakerTouched.current) {
        speakerTouched.current = false;
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      e.preventDefault();
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) {
        handleFlipRef.current();
        return;
      }
      if (dx < -40) advanceRef.current('left');
      else if (dx > 40) advanceRef.current('right');
    }

    function onSpeakerTouchEnd(e: TouchEvent) {
      e.stopPropagation();
      e.preventDefault();
      if (!speakerBtn) return;
      const rect = speakerBtn.getBoundingClientRect();
      const touch = e.changedTouches[0];
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        const card = currentCardRef.current;
        if (!card) return;
        unlockAudioContext();
        setPlaying(true);
        playAudioFromGesture(card.phrase.spanish, 'spanish');
        setTimeout(() => setPlaying(false), 3000);
      }
    }

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchend', onTouchEnd, { passive: false });
    if (speakerBtn) speakerBtn.addEventListener('touchend', onSpeakerTouchEnd, { passive: false });
    return () => {
      card.removeEventListener('touchstart', onTouchStart);
      card.removeEventListener('touchend', onTouchEnd);
      if (speakerBtn) speakerBtn.removeEventListener('touchend', onSpeakerTouchEnd);
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (touchStartX.current === null) return;
    const dx = e.clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 40) {
      handleFlip();
      return;
    }
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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '340px',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s ease-out',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front — English */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              }}
            >
              <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1.25rem' }}>
                English
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.35, marginBottom: '2rem' }}>
                {currentCard?.phrase.english}
              </p>
              <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', fontStyle: 'italic' }}>
                Tap to see Spanish
              </p>
            </div>

            {/* Back — Spanish */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: '#0f1c2e',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              }}
            >
              <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1.25rem' }}>
                Español
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.35, marginBottom: '0.75rem' }}>
                {currentCard?.phrase.spanish}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(147,197,253,0.75)', textAlign: 'center', lineHeight: 1.6, marginBottom: '1.5rem', fontFamily: 'monospace' }}>
                {currentCard ? spanishPhonetic(currentCard.phrase.spanish) : ''}
              </p>
              <button
                ref={speakerBtnRef}
                onClick={(e) => { e.stopPropagation(); handleSpeak(e); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: playing ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                  color: playing ? '#93c5fd' : '#cbd5e1',
                  transition: 'all 0.15s',
                }}
              >
                {playing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Hear pronunciation</span>
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
