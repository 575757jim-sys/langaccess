import { X, Volume2 } from 'lucide-react';
import { Language } from '../data/phrases';
import { playAudioFromGesture } from '../utils/speech';

interface ShowScreenOverlayProps {
  english: string;
  translation: string;
  language: Language;
  onClose: () => void;
}

export default function ShowScreenOverlay({ english, translation, language, onClose }: ShowScreenOverlayProps) {
  const handlePlay = () => {
    playAudioFromGesture(translation, language);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight mb-8 break-words">
          {translation}
        </p>
        <p className="text-xl sm:text-2xl font-medium text-slate-400 leading-relaxed">
          {english}
        </p>
      </div>

      <div
        className="w-full max-w-sm flex gap-3 mt-6 safe-bottom-padding"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handlePlay}
          className="flex-1 flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-4 rounded-2xl text-base font-bold transition-colors active:scale-[0.98]"
        >
          <Volume2 className="w-5 h-5" />
          Play Audio
        </button>
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white py-4 rounded-2xl text-base font-bold transition-colors active:scale-[0.98]"
        >
          <X className="w-5 h-5" />
          Close
        </button>
      </div>
    </div>
  );
}
