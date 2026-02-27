import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Volume2, Loader2, RefreshCw, Users, Send, Mic } from 'lucide-react';
import { Language, languageData } from '../data/phrases';
import { globalAudio, playAudioFromGesture } from '../utils/speech';

interface ConversationScreenProps {
  language: Language;
  onBack: () => void;
}

type Speaker = 'staff' | 'patient';

interface Turn {
  id: number;
  speaker: Speaker;
  original: string;
  translation: string;
}

const LANG_CODES: Record<Language, string> = {
  spanish: 'es', tagalog: 'tl', vietnamese: 'vi',
  mandarin: 'zh-CN', cantonese: 'zh-TW',
  hmong: 'hmn', korean: 'ko', arabic: 'ar',
};

const STAFF_PROMPTS: string[] = [
  'What is your name?',
  'What brings you in today?',
  'Where does it hurt?',
  'Pain level 1–10?',
  'Any allergies?',
  'Any medications?',
  'Do you have insurance?',
  'Please sign here.',
  'The doctor will see you shortly.',
];

async function translate(text: string, from: string, to: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

export default function ConversationScreen({ language, onBack }: ConversationScreenProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [staffInput, setStaffInput] = useState('');
  const [patientInput, setPatientInput] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [activePanel, setActivePanel] = useState<Speaker>('staff');
  const langData = languageData[language];
  const langCode = LANG_CODES[language];
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRtl = language === 'arabic';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  const sendStaff = useCallback(async (text: string) => {
    if (!text.trim() || loadingStaff) return;
    setLoadingStaff(true);
    setStaffInput('');
    const translation = await translate(text, 'en', langCode);
    const turn: Turn = { id: Date.now(), speaker: 'staff', original: text, translation };
    setTurns(prev => [...prev, turn]);
    playAudioFromGesture(translation, language);
    setLoadingStaff(false);
  }, [language, langCode, loadingStaff]);

  const sendPatient = useCallback(async (text: string) => {
    if (!text.trim() || loadingPatient) return;
    setLoadingPatient(true);
    setPatientInput('');
    const translation = await translate(text, langCode, 'en');
    const turn: Turn = { id: Date.now(), speaker: 'patient', original: text, translation };
    setTurns(prev => [...prev, turn]);
    setLoadingPatient(false);
  }, [langCode, loadingPatient]);

  const clearConversation = () => {
    setTurns([]);
    globalAudio.pause();
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden">
      <div className="bg-slate-950 border-b border-slate-800 z-10 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              Face-to-Face
            </span>
            <button
              onClick={clearConversation}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <h2 className="text-lg font-bold text-white">English ↔ {langData.name}</h2>
          <p className="text-slate-500 text-xs mt-0.5">Two-way conversation mode. Staff types in English; patient types in {langData.name}.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {turns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Conversation will appear here</p>
              <p className="text-slate-600 text-xs mt-1">Use the panels below to send messages</p>
            </div>
          ) : (
            turns.map((turn) => (
              <div
                key={turn.id}
                className={`flex ${turn.speaker === 'staff' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-3 shadow-md ${
                    turn.speaker === 'staff'
                      ? 'bg-blue-600 rounded-tl-sm'
                      : 'bg-emerald-600 rounded-tr-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                      {turn.speaker === 'staff' ? 'Staff' : 'Patient'}
                    </span>
                    {turn.speaker === 'staff' && (
                      <button
                        onClick={() => playAudioFromGesture(turn.translation, language)}
                        className="p-0.5 hover:opacity-70 transition-opacity"
                        title="Play audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-snug">{turn.original}</p>
                  <div className="mt-1.5 pt-1.5 border-t border-white/20">
                    <p className="text-xs opacity-80 leading-snug" dir={turn.speaker === 'staff' && isRtl ? 'rtl' : undefined}>
                      {turn.translation}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-800 flex-shrink-0">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActivePanel('staff')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activePanel === 'staff'
                  ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Mic className="w-4 h-4" />
              Staff (English)
            </button>
            <button
              onClick={() => setActivePanel('patient')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activePanel === 'patient'
                  ? 'bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Mic className="w-4 h-4" />
              Patient ({langData.name})
            </button>
          </div>

          {activePanel === 'staff' && (
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {STAFF_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setStaffInput(prompt)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500/60 hover:text-white transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <textarea
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendStaff(staffInput);
                    }
                  }}
                  placeholder="Type in English…"
                  rows={2}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={() => sendStaff(staffInput)}
                  disabled={loadingStaff || !staffInput.trim()}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 self-end"
                >
                  {loadingStaff ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {activePanel === 'patient' && (
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3 text-center">
                Hand device to patient — they type in {langData.name}, you see the English translation above
              </p>
              <div className="flex gap-2 items-end">
                <textarea
                  value={patientInput}
                  onChange={(e) => setPatientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendPatient(patientInput);
                    }
                  }}
                  placeholder={`Type in ${langData.name}…`}
                  rows={2}
                  dir={isRtl ? 'rtl' : undefined}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={() => sendPatient(patientInput)}
                  disabled={loadingPatient || !patientInput.trim()}
                  className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 self-end"
                >
                  {loadingPatient ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
