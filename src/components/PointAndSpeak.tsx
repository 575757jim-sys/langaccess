import { useCallback, useEffect } from 'react';
import { Volume2, X, Loader2 } from 'lucide-react';
import { playAudioFromGesture } from '../utils/speech';
import { Language } from '../data/phrases';

interface PointAndSpeakProps {
  english: string;
  translation: string;
  language: Language;
  onClose: () => void;
}

export default function PointAndSpeak({ english, translation, language, onClose }: PointAndSpeakProps) {
  const handlePlay = useCallback(() => {
    playAudioFromGesture(translation, language);
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
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 select-none"
      onClick={handlePlay}
    >
      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Badge */}
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-10">
        Point &amp; Speak — Tap anywhere to replay
      </p>

      {/* English */}
      <p className="text-2xl sm:text-3xl font-semibold text-slate-500 text-center mb-4 max-w-xl leading-relaxed">
        {english}
      </p>

      {/* Translation — hero text */}
      <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 text-center leading-tight max-w-2xl mb-12">
        {translation}
      </p>

      {/* Audio button */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePlay(); }}
        className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 flex items-center justify-center shadow-xl shadow-blue-600/30 transition-all"
      >
        <Volume2 className="w-8 h-8 text-white" />
      </button>

      <p className="text-sm text-slate-400 mt-5">Tap the button or anywhere on the screen to replay audio</p>
    </div>
  );
}
