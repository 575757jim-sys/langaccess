import { useState, useCallback } from 'react';
import { ArrowLeft, Volume2, Loader2, RefreshCw, Users } from 'lucide-react';
import { Language, languageData } from '../data/phrases';
import { globalAudio, playAudioFromGesture } from '../utils/speech';

interface ConversationScreenProps {
  language: Language;
  onBack: () => void;
}

interface Turn {
  id: number;
  english: string;
  translation: string;
}

const INTAKE_PROMPTS: string[] = [
  'What is your name?',
  'What brings you in today?',
  'Where does it hurt?',
  'On a scale of 1 to 10, how bad is the pain?',
  'Do you have any allergies?',
  'Are you taking any medications?',
  'Do you have insurance?',
  'Please sign this form.',
  'The doctor will see you shortly.',
  'We need to take your blood pressure.',
];

const LANG_CODES: Record<Language, string> = {
  spanish: 'es', tagalog: 'tl', vietnamese: 'vi',
  mandarin: 'zh-CN', cantonese: 'zh-TW',
  hmong: 'hmn', korean: 'ko', arabic: 'ar',
};

async function translateToLanguage(text: string, targetLang: Language): Promise<string> {
  const code = LANG_CODES[targetLang];
  if (!code) return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${code}`
    );
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

function playTranslation(text: string, language: Language) {
  playAudioFromGesture(text, language);
}

export default function ConversationScreen({ language, onBack }: ConversationScreenProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [staffInput, setStaffInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const langData = languageData[language];

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setStaffInput('');
    setSelectedPrompt(null);
    const translation = await translateToLanguage(text, language);
    const turn: Turn = { id: Date.now(), english: text, translation };
    setTurns(prev => [...prev, turn]);
    playTranslation(translation, language);
    setLoading(false);
  }, [language, loading]);

  const clearConversation = () => {
    setTurns([]);
    globalAudio.pause();
    globalAudio.currentTime = 0;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="sticky top-0 bg-slate-900 border-b border-slate-700 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" />
                Face-to-Face Intake
              </span>
              <button
                onClick={clearConversation}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-xl font-bold text-white">English ↔ {langData.name}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Select a quick prompt or type below. Translation plays automatically on the patient side.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-6 overflow-y-auto pb-64">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Intake Prompts</p>
          <div className="flex flex-wrap gap-2">
            {INTAKE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setSelectedPrompt(prompt); setStaffInput(prompt); }}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                  selectedPrompt === prompt
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-white'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Volume2 className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No messages yet.</p>
            <p className="text-slate-600 text-xs mt-1">Select a quick prompt or type a message below.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {turns.map((turn) => (
              <div key={turn.id} className="bg-blue-600 rounded-2xl p-4 shadow-lg max-w-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">Staff (English)</span>
                  <button
                    onClick={() => playTranslation(turn.translation, language)}
                    className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
                    title="Play translation again"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-base font-semibold leading-snug">{turn.english}</p>
                {turn.translation !== turn.english && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-sm opacity-90 leading-snug">{turn.translation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Staff message (English) — translates and speaks in {langData.name}
              </label>
              <textarea
                value={staffInput}
                onChange={(e) => setStaffInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(staffInput);
                  }
                }}
                placeholder="Type in English..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={() => sendMessage(staffInput)}
              disabled={loading || !staffInput.trim()}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 self-end"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Press Enter to send. Translation plays automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
