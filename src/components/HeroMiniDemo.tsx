import { useState } from 'react';
import { Volume2, Loader2, ChevronRight } from 'lucide-react';
import { Language } from '../data/phrases';
import { playAudioFromGesture } from '../utils/speech';

const MINI_LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'spanish', label: 'Spanish', flag: '🇲🇽' },
  { id: 'mandarin', label: 'Mandarin', flag: '🇨🇳' },
  { id: 'cantonese', label: 'Cantonese', flag: '🇹🇼' },
  { id: 'vietnamese', label: 'Vietnamese', flag: '🇻🇳' },
  { id: 'tagalog', label: 'Tagalog', flag: '🇵🇭' },
];

const MINI_PHRASE = {
  english: 'Where does it hurt?',
  translations: {
    spanish: '¿Dónde le duele?',
    mandarin: '哪里疼？',
    cantonese: '邊度痛？',
    vietnamese: 'Bạn đau ở đâu?',
    tagalog: 'Saan ka masakit?',
    hmong: 'Mob qhov twg?',
    korean: '어디가 아프세요?',
    arabic: 'أين يؤلمك؟',
  } as Record<Language, string>,
};

interface HeroMiniDemoProps {
  onSeeMore: () => void;
}

export default function HeroMiniDemo({ onSeeMore }: HeroMiniDemoProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('spanish');
  const [isLoading, setIsLoading] = useState(false);
  const [played, setPlayed] = useState(false);

  function handlePlay() {
    const text = MINI_PHRASE.translations[selectedLanguage];
    if (!text || isLoading) return;
    setIsLoading(true);
    setPlayed(false);
    playAudioFromGesture(text, selectedLanguage);
    setTimeout(() => {
      setIsLoading(false);
      setPlayed(true);
    }, 2500);
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Quick Demo</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Try LangAccess in 10 Seconds
          </h2>
          <p className="text-slate-500 text-sm">Pick a language, then tap the phrase to hear it instantly.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1 — Choose a language</p>
            <div className="flex flex-wrap gap-2">
              {MINI_LANGUAGES.map(({ id, label, flag }) => (
                <button
                  key={id}
                  onClick={() => { setSelectedLanguage(id); setPlayed(false); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${
                    selectedLanguage === id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  <span className="text-base leading-none">{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2 — Tap the phrase to play</p>
            <button
              onClick={handlePlay}
              disabled={isLoading}
              className={`group w-full text-left rounded-xl border-2 p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 ${
                played
                  ? 'bg-teal-50 border-teal-300'
                  : 'bg-slate-50 hover:bg-teal-50 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                played ? 'bg-teal-500' : 'bg-teal-100 group-hover:bg-teal-500'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-teal-600 group-hover:text-white animate-spin" />
                ) : (
                  <Volume2 className={`w-5 h-5 transition-colors duration-200 ${played ? 'text-white' : 'text-teal-600 group-hover:text-white'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-base font-bold leading-snug mb-1">
                  {MINI_PHRASE.english}
                </p>
                <p className="text-teal-700 text-sm font-medium leading-snug">
                  {MINI_PHRASE.translations[selectedLanguage]}
                </p>
              </div>
              {!isLoading && (
                <span className={`text-xs font-semibold flex-shrink-0 transition-colors ${played ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'}`}>
                  {played ? 'Played' : 'Tap to play'}
                </span>
              )}
            </button>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Real TTS audio — same as the full app.
              </p>
              <button
                onClick={onSeeMore}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                See all phrases
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
