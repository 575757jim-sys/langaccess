import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Volume2, Loader2, RefreshCw, Mic, MicOff, Send, ArrowUpDown } from 'lucide-react';
import { Language, languageData } from '../data/phrases';
import { globalAudio, playAudioFromGesture, fetchTTSBlob, ANON_KEY_VALUE } from '../utils/speech';

interface ConversationScreenProps {
  language: Language;
  onBack: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const STT_ENDPOINT = `${SUPABASE_URL}/functions/v1/stt-proxy`;

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

async function translateText(text: string, from: string, to: string): Promise<string> {
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

async function transcribeAudio(blob: Blob, language: Language | 'english'): Promise<string> {
  const arrayBuf = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const audioBase64 = btoa(binary);

  const res = await fetch(STT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY_VALUE}`,
    },
    body: JSON.stringify({ audioBase64, language }),
  });
  const data = await res.json();
  return data.transcript ?? '';
}

type ActiveSide = 'staff' | 'patient';

interface PanelState {
  text: string;
  translation: string;
  isRecording: boolean;
  isTranslating: boolean;
  isPlaying: boolean;
}

const emptyPanel = (): PanelState => ({
  text: '', translation: '', isRecording: false, isTranslating: false, isPlaying: false,
});

export default function ConversationScreen({ language, onBack }: ConversationScreenProps) {
  const langData = languageData[language];
  const langCode = LANG_CODES[language];
  const isRtl = language === 'arabic';

  const [staff, setStaff] = useState<PanelState>(emptyPanel());
  const [patient, setPatient] = useState<PanelState>(emptyPanel());
  const [activeSide, setActiveSide] = useState<ActiveSide>('staff');
  const [showPrompts, setShowPrompts] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingForRef = useRef<ActiveSide | null>(null);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      globalAudio.pause();
    };
  }, []);

  const translate = useCallback(async (text: string, side: ActiveSide) => {
    if (!text.trim()) return;
    if (side === 'staff') {
      setStaff(s => ({ ...s, isTranslating: true }));
      const translation = await translateText(text, 'en', langCode);
      setStaff(s => ({ ...s, translation, isTranslating: false }));
      playAudioFromGesture(translation, language);
    } else {
      setPatient(s => ({ ...s, isTranslating: true }));
      const translation = await translateText(text, langCode, 'en');
      setPatient(s => ({ ...s, translation, isTranslating: false }));
    }
  }, [langCode, language]);

  const sendStaff = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStaff(s => ({ ...s, text }));
    await translate(text, 'staff');
  }, [translate]);

  const sendPatient = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setPatient(s => ({ ...s, text }));
    await translate(text, 'patient');
  }, [translate]);

  const startRecording = useCallback(async (side: ActiveSide) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];
      recordingForRef.current = side;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        if (blob.size < 100) return;

        const langForSTT: Language | 'english' = side === 'patient' ? language : 'english';
        if (side === 'staff') {
          setStaff(s => ({ ...s, isTranslating: true, isRecording: false }));
        } else {
          setPatient(s => ({ ...s, isTranslating: true, isRecording: false }));
        }

        try {
          const transcript = await transcribeAudio(blob, langForSTT);
          if (transcript) {
            if (side === 'staff') {
              setStaff(s => ({ ...s, text: transcript }));
              await translate(transcript, 'staff');
            } else {
              setPatient(s => ({ ...s, text: transcript }));
              await translate(transcript, 'patient');
            }
          } else {
            if (side === 'staff') setStaff(s => ({ ...s, isTranslating: false }));
            else setPatient(s => ({ ...s, isTranslating: false }));
          }
        } catch {
          if (side === 'staff') setStaff(s => ({ ...s, isTranslating: false }));
          else setPatient(s => ({ ...s, isTranslating: false }));
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      if (side === 'staff') setStaff(s => ({ ...s, isRecording: true }));
      else setPatient(s => ({ ...s, isRecording: true }));
    } catch {
      // mic permission denied
    }
  }, [language, translate]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearAll = () => {
    setStaff(emptyPanel());
    setPatient(emptyPanel());
    globalAudio.pause();
    mediaRecorderRef.current?.stop();
  };

  const playTranslation = useCallback((side: ActiveSide) => {
    if (side === 'staff' && staff.translation) {
      playAudioFromGesture(staff.translation, language);
    }
  }, [staff.translation, language]);

  const playPatientOriginal = useCallback(() => {
    if (patient.text) {
      fetchTTSBlob(patient.text, language).then(url => {
        if (url) {
          const audio = new Audio(url);
          audio.play().catch(() => {});
        }
      });
    }
  }, [patient.text, language]);

  const staffIsActive = staff.isRecording || staff.isTranslating;
  const patientIsActive = patient.isRecording || patient.isTranslating;

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide">
            <ArrowUpDown className="w-3.5 h-3.5" />
            FACE-TO-FACE
          </div>
          <button
            onClick={clearAll}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Clear"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language bar */}
      <div className="flex-shrink-0 flex items-center bg-slate-900 border-b border-slate-800">
        <div className="flex-1 py-2 px-4 text-center text-sm font-semibold text-blue-400">
          English (Staff)
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div className="flex-1 py-2 px-4 text-center text-sm font-semibold text-emerald-400">
          {langData.name} (Patient)
        </div>
      </div>

      {/* Main split panels */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Staff panel — top half */}
        <div
          className={`flex-1 flex flex-col border-b-2 transition-colors duration-200 ${
            activeSide === 'staff' ? 'border-blue-500' : 'border-slate-800'
          }`}
          onClick={() => setActiveSide('staff')}
        >
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
            {/* Input area */}
            <textarea
              value={staff.text}
              onChange={(e) => setStaff(s => ({ ...s, text: e.target.value }))}
              onFocus={() => setActiveSide('staff')}
              placeholder="Type or tap mic to speak in English…"
              className="w-full bg-transparent text-white text-xl font-medium placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
              rows={2}
            />

            {/* Translation output */}
            {(staff.translation || staff.isTranslating) && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                {staff.isTranslating ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Translating…</span>
                  </div>
                ) : (
                  <div>
                    <p
                      className="text-2xl font-bold text-emerald-400 leading-relaxed"
                      dir={isRtl ? 'rtl' : undefined}
                    >
                      {staff.translation}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{langData.name}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Staff action bar */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-t border-slate-800/60">
            {showPrompts && (
              <div className="flex-1 overflow-x-auto flex gap-1.5 pb-1 no-scrollbar">
                {STAFF_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={(e) => { e.stopPropagation(); sendStaff(p); }}
                    className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500/60 hover:text-white transition-all whitespace-nowrap"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-shrink-0 flex items-center gap-2 ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setShowPrompts(v => !v); }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-1"
              >
                {showPrompts ? 'Hide' : 'Prompts'}
              </button>
              {staff.translation && !staff.isTranslating && (
                <button
                  onClick={(e) => { e.stopPropagation(); playTranslation('staff'); }}
                  className="p-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                  title="Play translation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {staff.text.trim() && !staff.isTranslating && !staff.isRecording && (
                <button
                  onClick={(e) => { e.stopPropagation(); sendStaff(staff.text); }}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  title="Translate"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
              <MicButton
                isRecording={staff.isRecording}
                isLoading={staff.isTranslating}
                color="blue"
                onStart={(e) => { e.stopPropagation(); setActiveSide('staff'); startRecording('staff'); }}
                onStop={(e) => { e.stopPropagation(); stopRecording(); }}
              />
            </div>
          </div>
        </div>

        {/* Patient panel — bottom half */}
        <div
          className={`flex-1 flex flex-col transition-colors duration-200 border-t-2 ${
            activeSide === 'patient' ? 'border-emerald-500' : 'border-transparent'
          } bg-slate-900/60`}
          onClick={() => setActiveSide('patient')}
        >
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
            {/* Input area */}
            <textarea
              value={patient.text}
              onChange={(e) => setPatient(s => ({ ...s, text: e.target.value }))}
              onFocus={() => setActiveSide('patient')}
              placeholder={`Type or tap mic to speak in ${langData.name}…`}
              dir={isRtl ? 'rtl' : undefined}
              className="w-full bg-transparent text-white text-xl font-medium placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
              rows={2}
            />

            {/* Translation output */}
            {(patient.translation || patient.isTranslating) && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                {patient.isTranslating ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Translating…</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-blue-400 leading-relaxed">
                      {patient.translation}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">English</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Patient action bar */}
          <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-2 border-t border-slate-800/60">
            {patient.text.trim() && !patient.isTranslating && !patient.isRecording && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); playPatientOriginal(); }}
                  className="p-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                  title="Play in patient language"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); sendPatient(patient.text); }}
                  className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title="Translate to English"
                >
                  <Send className="w-4 h-4" />
                </button>
              </>
            )}
            <MicButton
              isRecording={patient.isRecording}
              isLoading={patient.isTranslating && !patientIsActive}
              color="emerald"
              onStart={(e) => { e.stopPropagation(); setActiveSide('patient'); startRecording('patient'); }}
              onStop={(e) => { e.stopPropagation(); stopRecording(); }}
            />
          </div>
        </div>
      </div>

      {/* Recording overlay pulse */}
      {(staffIsActive || patientIsActive) && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute inset-0 border-4 animate-pulse rounded-none ${
              staff.isRecording ? 'border-blue-500/40' : patientIsActive ? 'border-emerald-500/40' : 'border-transparent'
            }`}
          />
        </div>
      )}
    </div>
  );
}

interface MicButtonProps {
  isRecording: boolean;
  isLoading: boolean;
  color: 'blue' | 'emerald';
  onStart: (e: React.MouseEvent) => void;
  onStop: (e: React.MouseEvent) => void;
}

function MicButton({ isRecording, isLoading, color, onStart, onStop }: MicButtonProps) {
  const baseColor = color === 'blue'
    ? 'bg-blue-600 hover:bg-blue-500'
    : 'bg-emerald-600 hover:bg-emerald-500';
  const recordingColor = 'bg-red-600 hover:bg-red-500';

  if (isLoading) {
    return (
      <div className={`p-3 rounded-full ${baseColor} opacity-60`}>
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      </div>
    );
  }

  if (isRecording) {
    return (
      <button
        onClick={onStop}
        className={`p-3 rounded-full ${recordingColor} text-white transition-colors shadow-lg relative`}
        title="Stop recording"
      >
        <MicOff className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className={`p-3 rounded-full ${baseColor} text-white transition-colors shadow-lg`}
      title="Record speech"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
}
