import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Volume2, Loader2, RefreshCw, Mic, MicOff, Send, ArrowUpDown } from 'lucide-react';
import { Language, languageData } from '../data/phrases';
import { globalAudio, playAudioFromGesture, fetchTTSBlob, ANON_KEY_VALUE } from '../utils/speech';

interface TalkTogetherScreenProps {
  language: Language;
  onBack: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const STT_ENDPOINT = `${SUPABASE_URL}/functions/v1/stt-proxy`;

const TRANSLATE_CODES: Record<Language, string> = {
  spanish: 'es', tagalog: 'tl', vietnamese: 'vi',
  mandarin: 'zh-CN', cantonese: 'zh-TW',
  hmong: 'hmn', korean: 'ko', arabic: 'ar',
};

const LISTENING_TEXT: Record<Language, string> = {
  spanish: 'Escuchando…',
  tagalog: 'Nakikinig…',
  vietnamese: 'Đang nghe…',
  mandarin: '正在聆听…',
  cantonese: '正在聆聽…',
  hmong: 'Tab tom mloog…',
  korean: '듣는 중…',
  arabic: '…جارٍ الاستماع',
};

const STAFF_PROMPTS = [
  'Please bring your permission slip.',
  'Your child is doing well.',
  'There is a meeting next week.',
  'Please sign this form.',
  'School starts at 8 AM.',
  'Attendance is required.',
  'Homework is due tomorrow.',
  'Please contact the office.',
  'Your child needs supplies.',
];

interface Message {
  id: number;
  side: 'staff' | 'patient';
  original: string;
  translation: string;
}

async function doTranslate(text: string, from: string, to: string): Promise<string> {
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

function getMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  if (typeof MediaRecorder === 'undefined') return '';
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function doTranscribe(blob: Blob, mimeType: string, language: Language | 'english'): Promise<string> {
  const audioBase64 = await blobToBase64(blob);
  const res = await fetch(STT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY_VALUE}` },
    body: JSON.stringify({ audioBase64, mimeType, language }),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = data?.detail ?? '';
    if (detail.includes('SERVICE_DISABLED') || detail.includes('speech.googleapis.com')) {
      throw new Error('STT_API_DISABLED');
    }
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data.transcript ?? '';
}

type InputMode = 'type' | 'mic';

interface PanelInputState {
  text: string;
  mode: InputMode;
  recording: boolean;
  busy: boolean;
}

const freshInput = (): PanelInputState => ({ text: '', mode: 'type', recording: false, busy: false });

export default function TalkTogetherScreen({ language, onBack }: TalkTogetherScreenProps) {
  const langData = languageData[language];
  const langCode = TRANSLATE_CODES[language];
  const isRtl = language === 'arabic';

  const [messages, setMessages] = useState<Message[]>([]);
  const [staffInput, setStaffInput] = useState<PanelInputState>(freshInput());
  const [patientInput, setPatientInput] = useState<PanelInputState>(freshInput());
  const [showPrompts, setShowPrompts] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (mrRef.current && mrRef.current.state !== 'inactive') {
        mrRef.current.stop();
      }
      globalAudio.pause();
    };
  }, []);

  const addMessage = (msg: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  };

  const sendStaff = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStaffInput(s => ({ ...s, busy: true, text: '' }));
    const translation = await doTranslate(text, 'en', langCode);
    addMessage({ side: 'staff', original: text, translation });
    setStaffInput(s => ({ ...s, busy: false }));
    playAudioFromGesture(translation, language);
  }, [langCode, language]);

  const sendPatient = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setPatientInput(s => ({ ...s, busy: true, text: '' }));
    const translation = await doTranslate(text, langCode, 'en');
    addMessage({ side: 'patient', original: text, translation });
    setPatientInput(s => ({ ...s, busy: false }));
  }, [langCode]);

  const startRecording = useCallback(async (side: 'staff' | 'patient') => {
    if (mrRef.current && mrRef.current.state !== 'inactive') return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return;
    }

    const mimeType = getMimeType();
    const options = mimeType ? { mimeType } : {};
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, options);
    } catch {
      try {
        mr = new MediaRecorder(stream);
      } catch {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
    }

    chunksRef.current = [];
    mimeTypeRef.current = mr.mimeType || mimeType;
    mrRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const actualMime = mimeTypeRef.current || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: actualMime });

      if (blob.size < 500) {
        if (side === 'staff') setStaffInput(s => ({ ...s, recording: false, busy: false }));
        else setPatientInput(s => ({ ...s, recording: false, busy: false }));
        return;
      }

      if (side === 'staff') setStaffInput(s => ({ ...s, recording: false, busy: true }));
      else setPatientInput(s => ({ ...s, recording: false, busy: true }));

      try {
        const transcript = await doTranscribe(blob, actualMime, side === 'patient' ? language : 'english');
        if (transcript) {
          if (side === 'staff') await sendStaff(transcript);
          else await sendPatient(transcript);
        } else {
          setSttError('No speech detected. Please try again.');
          setTimeout(() => setSttError(null), 4000);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === 'STT_API_DISABLED') {
          setSttError('Speech-to-Text API is not enabled. Please enable it in Google Cloud Console.');
        } else {
          setSttError('Microphone transcription failed. Please type instead.');
        }
        setTimeout(() => setSttError(null), 5000);
      }

      if (side === 'staff') setStaffInput(s => ({ ...s, busy: false }));
      else setPatientInput(s => ({ ...s, busy: false }));
    };

    mr.start(250);

    if (side === 'staff') setStaffInput(s => ({ ...s, recording: true }));
    else setPatientInput(s => ({ ...s, recording: true }));
  }, [language, sendStaff, sendPatient]);

  const stopRecording = useCallback(() => {
    if (mrRef.current && mrRef.current.state === 'recording') {
      mrRef.current.stop();
    }
  }, []);

  const clearAll = () => {
    setMessages([]);
    setStaffInput(freshInput());
    setPatientInput(freshInput());
    globalAudio.pause();
    if (mrRef.current && mrRef.current.state !== 'inactive') mrRef.current.stop();
  };

  const replayMessage = (msg: Message) => {
    if (msg.side === 'staff') {
      playAudioFromGesture(msg.translation, language);
    } else {
      fetchTTSBlob(msg.original, language).then(url => {
        if (url) {
          const a = new Audio(url);
          a.play().catch(() => {});
        }
      });
    }
  };

  const patientSendDisabled = !patientInput.text.trim() || patientInput.busy || patientInput.recording;
  const staffSendDisabled = !staffInput.text.trim() || staffInput.busy || staffInput.recording;

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-200 overflow-hidden select-none">

      {/* ─── PARENT/STUDENT panel (top — rotated 180°) ─── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden rotate-180">
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-400 tracking-widest uppercase">{langData.name}</span>
          {patientInput.busy && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-hidden">
          {messages.filter(m => m.side === 'staff').length > 0 ? (
            (() => {
              const last = messages.filter(m => m.side === 'staff').slice(-1)[0];
              return (
                <div className="w-full space-y-2 text-center">
                  <p
                    className="font-bold text-gray-900 leading-snug break-words"
                    style={{ fontSize: '28px' }}
                    dir={isRtl ? 'rtl' : undefined}
                  >
                    {last.translation}
                  </p>
                  <p className="text-gray-400 leading-snug" style={{ fontSize: '16px' }}>
                    {last.original}
                  </p>
                  <button
                    onClick={() => playAudioFromGesture(last.translation, language)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    style={{ fontSize: '16px' }}
                  >
                    <Volume2 className="w-5 h-5" />
                    Play
                  </button>
                </div>
              );
            })()
          ) : (
            <p className="text-gray-300 text-center" style={{ fontSize: '18px' }}>
              Teacher message will appear here
            </p>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4">
          {patientInput.recording && (
            <p
              className="text-center font-semibold text-green-600 mb-3"
              style={{ fontSize: '18px' }}
              dir={isRtl ? 'rtl' : undefined}
            >
              {LISTENING_TEXT[language]}
            </p>
          )}
          <div className="flex items-center gap-3">
            <textarea
              value={patientInput.text}
              onChange={e => setPatientInput(s => ({ ...s, text: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPatient(patientInput.text); } }}
              placeholder={`Type in ${langData.name}…`}
              dir={isRtl ? 'rtl' : undefined}
              rows={1}
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ fontSize: '18px' }}
            />
            <BigMicBtn
              recording={patientInput.recording}
              busy={patientInput.busy}
              onStart={() => startRecording('patient')}
              onStop={stopRecording}
            />
            <button
              onClick={() => sendPatient(patientInput.text)}
              disabled={patientSendDisabled}
              className="p-3 rounded-2xl bg-gray-900 hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Divider / middle bar ─── */}
      <div className="flex-shrink-0 flex items-center bg-gray-100 border-y border-gray-300 px-4 py-2 gap-3 z-10" style={{ minHeight: '48px' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium" style={{ fontSize: '14px' }}>Back</span>
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="font-semibold text-green-700" style={{ fontSize: '13px' }}>Parent or Student</span>
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-full px-2 py-0.5 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-bold text-gray-500 tracking-widest uppercase" style={{ fontSize: '10px' }}>Talk Together</span>
          </div>
          <span className="font-semibold text-gray-700" style={{ fontSize: '13px' }}>Teacher or Staff</span>
        </div>

        {sttError && (
          <span className="text-red-500 font-medium truncate max-w-[140px]" style={{ fontSize: '11px' }}>{sttError}</span>
        )}

        <button
          onClick={clearAll}
          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
          title="Clear conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ─── TEACHER/STAFF panel (bottom — normal orientation) ─── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-400 tracking-widest uppercase">Teacher or Staff — English</span>
          <button
            onClick={() => setShowPrompts(v => !v)}
            className={`px-3 py-1.5 rounded-full border font-semibold transition-colors ${
              showPrompts
                ? 'bg-green-50 border-green-300 text-green-600'
                : 'border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{ fontSize: '12px' }}
          >
            {showPrompts ? 'Hide prompts' : 'Quick prompts'}
          </button>
        </div>

        {showPrompts && (
          <div className="flex-shrink-0 px-4 pt-3 pb-2 overflow-x-auto flex gap-2 no-scrollbar border-b border-gray-100">
            {STAFF_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendStaff(p)}
                className="flex-shrink-0 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all whitespace-nowrap font-medium"
                style={{ fontSize: '13px' }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-hidden">
          {messages.filter(m => m.side === 'patient').length > 0 ? (
            (() => {
              const last = messages.filter(m => m.side === 'patient').slice(-1)[0];
              return (
                <div className="w-full space-y-2 text-center">
                  <p
                    className="font-bold text-gray-900 leading-snug break-words"
                    style={{ fontSize: '28px' }}
                  >
                    {last.translation}
                  </p>
                  <p
                    className="text-gray-400 leading-snug"
                    style={{ fontSize: '16px' }}
                    dir={isRtl ? 'rtl' : undefined}
                  >
                    {last.original}
                  </p>
                  <button
                    onClick={() => replayMessage(last)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    style={{ fontSize: '16px' }}
                  >
                    <Volume2 className="w-5 h-5" />
                    Play
                  </button>
                </div>
              );
            })()
          ) : (
            <p className="text-gray-300 text-center" style={{ fontSize: '18px' }}>
              Parent or student responses appear here in English
            </p>
          )}
          {staffInput.busy && (
            <div className="flex items-center gap-2 mt-3 text-green-600" style={{ fontSize: '14px' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Translating…
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4">
          {staffInput.recording && (
            <p className="text-center font-semibold text-green-600 mb-3" style={{ fontSize: '18px' }}>
              Listening in English…
            </p>
          )}
          <div className="flex items-center gap-3">
            <textarea
              value={staffInput.text}
              onChange={e => setStaffInput(s => ({ ...s, text: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendStaff(staffInput.text); } }}
              placeholder="Type or speak in English…"
              rows={1}
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              style={{ fontSize: '18px' }}
            />
            <BigMicBtn
              recording={staffInput.recording}
              busy={staffInput.busy}
              onStart={() => startRecording('staff')}
              onStop={stopRecording}
            />
            <button
              onClick={() => sendStaff(staffInput.text)}
              disabled={staffSendDisabled}
              className="p-3 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-25 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} />
    </div>
  );
}

interface BigMicBtnProps {
  recording: boolean;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
}

function BigMicBtn({ recording, busy, onStart, onStop }: BigMicBtnProps) {
  if (busy) {
    return (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
        style={{ width: '72px', height: '72px' }}
      >
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (recording) {
    return (
      <button
        onClick={onStop}
        className="relative rounded-full text-white flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ width: '72px', height: '72px', backgroundColor: '#16a34a' }}
      >
        <MicOff className="w-8 h-8 relative z-10" />
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: '#16a34a', opacity: 0.4 }}
        />
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className="rounded-full text-white flex items-center justify-center flex-shrink-0 transition-colors hover:opacity-90"
      style={{ width: '72px', height: '72px', backgroundColor: '#2563eb' }}
    >
      <Mic className="w-8 h-8" />
    </button>
  );
}
