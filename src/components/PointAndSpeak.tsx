import { useCallback, useEffect, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { playAudioFromGesture } from '../utils/speech';
import { Language } from '../data/phrases';

interface PointAndSpeakProps {
  english: string;
  translation: string;
  language: Language;
  onClose: () => void;
}

export default function PointAndSpeak({ english, translation, language, onClose }: PointAndSpeakProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    playAudioFromGesture(translation, language);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2500);
  }, [translation, language]);

  useEffect(() => {
    handlePlay();
  }, [handlePlay]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1a2e 100%)' }}
      onClick={handlePlay}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Point &amp; Speak
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* English label */}
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full">
            English
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-semibold text-slate-300 text-center mb-10 max-w-lg leading-relaxed">
          {english}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10 w-full max-w-sm">
          <div className="flex-1 h-px bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Translation — hero */}
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
            Translation
          </span>
        </div>
        <p className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center leading-tight max-w-2xl mb-14 tracking-tight">
          {translation}
        </p>

        {/* Audio button */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePlay(); }}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-95
            ${isPlaying
              ? 'bg-blue-400 shadow-blue-400/40 scale-105'
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/40'}`}
        >
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
          )}
          <Volume2 className="w-10 h-10 text-white relative z-10" />
        </button>
      </div>

      {/* Bottom hint */}
      <div className="pb-8 pt-4 text-center">
        <p className="text-sm text-slate-500">Tap anywhere to replay audio</p>
      </div>
    </div>
  );
}
