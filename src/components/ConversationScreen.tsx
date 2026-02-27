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

const TRANSLATE_CODES: Record<Language, string> = {
  spanish: 'es', tagalog: 'tl', vietnamese: 'vi',
  mandarin: 'zh-CN', cantonese: 'zh-TW',
  hmong: 'hmn', korean: 'ko', arabic: 'ar',
};

const STAFF_PROMPTS = [
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

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

async function doTranscribe(blob: Blob, language: Language | 'english', mimeType: string): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const audioBase64 = btoa(binary);
  const res = await fetch(STT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY_VALUE}` },
    body: JSON.stringify({ audioBase64, language, mimeType }),
  });
  const data = await res.json();
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

export default function ConversationScreen({ language, onBack }: ConversationScreenProps) {
  const langData = languageData[language];
  const langCode = TRANSLATE_CODES[language];
  const isRtl = language === 'arabic';

  const [messages, setMessages] = useState<Message[]>([]);
  const [staffInput, setStaffInput] = useState<PanelInputState>(freshInput());
  const [patientInput, setPatientInput] = useState<PanelInputState>(freshInput());
  const [showPrompts, setShowPrompts] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingSideRef = useRef<'staff' | 'patient' | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      mrRef.current?.stop();
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mrOptions = mimeType ? { mimeType } : {};
      const mr = new MediaRecorder(stream, mrOptions);
      const actualMime = mr.mimeType || mimeType;
      chunksRef.current = [];
      recordingSideRef.current = side;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: actualMime });
        if (blob.size < 100) {
          if (side === 'staff') setStaffInput(s => ({ ...s, recording: false, busy: false }));
          else setPatientInput(s => ({ ...s, recording: false, busy: false }));
          return;
        }
        if (side === 'staff') setStaffInput(s => ({ ...s, recording: false, busy: true }));
        else setPatientInput(s => ({ ...s, recording: false, busy: true }));

        try {
          const transcript = await doTranscribe(blob, side === 'patient' ? language : 'english', actualMime);
          if (transcript) {
            if (side === 'staff') await sendStaff(transcript);
            else await sendPatient(transcript);
          }
        } catch { /* ignore */ }

        if (side === 'staff') setStaffInput(s => ({ ...s, busy: false }));
        else setPatientInput(s => ({ ...s, busy: false }));
      };

      mr.start();
      mrRef.current = mr;
      if (side === 'staff') setStaffInput(s => ({ ...s, recording: true }));
      else setPatientInput(s => ({ ...s, recording: true }));
    } catch { /* mic denied */ }
  }, [language, sendStaff, sendPatient]);

  const stopRecording = useCallback(() => {
    if (mrRef.current?.state === 'recording') mrRef.current.stop();
  }, []);

  const clearAll = () => {
    setMessages([]);
    setStaffInput(freshInput());
    setPatientInput(freshInput());
    globalAudio.pause();
    mrRef.current?.stop();
  };

  const replayMessage = (msg: Message) => {
    if (msg.side === 'staff') {
      playAudioFromGesture(msg.translation, language);
    } else {
      fetchTTSBlob(msg.original, language).then(url => {
        if (url) new Audio(url).play().catch(() => {});
      });
    }
  };

  const patientSendDisabled = !patientInput.text.trim() || patientInput.busy || patientInput.recording;
  const staffSendDisabled = !staffInput.text.trim() || staffInput.busy || staffInput.recording;

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden select-none">

      {/* ─── PATIENT panel (top — rotated 180° so patient reads it across the table) ─── */}
      <div className="flex-1 flex flex-col bg-emerald-950/40 border-b-2 border-emerald-800/60 rotate-180 overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-emerald-900/60">
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Patient — {langData.name}</span>
          <div className="flex items-center gap-2">
            {patientInput.busy && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
          </div>
        </div>

        {/* Patient transcript (latest message to patient side) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.filter(m => m.side === 'staff').slice(-3).map(m => (
            <div key={m.id} className="space-y-0.5">
              <p className="text-xs text-emerald-700">{m.original}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-emerald-300 leading-snug flex-1" dir={isRtl ? 'rtl' : undefined}>
                  {m.translation}
                </p>
                <button
                  onClick={() => playAudioFromGesture(m.translation, language)}
                  className="p-1.5 rounded-full bg-emerald-700/40 text-emerald-300 hover:bg-emerald-600/60 transition-colors flex-shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {messages.filter(m => m.side === 'staff').length === 0 && (
            <p className="text-emerald-800 text-sm text-center mt-4">Staff messages will appear here</p>
          )}
        </div>

        {/* Patient input */}
        <div className="flex-shrink-0 border-t border-emerald-900/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <textarea
              value={patientInput.text}
              onChange={e => setPatientInput(s => ({ ...s, text: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPatient(patientInput.text); } }}
              placeholder={`Speak or type in ${langData.name}…`}
              dir={isRtl ? 'rtl' : undefined}
              rows={1}
              className="flex-1 bg-emerald-950/60 border border-emerald-800/60 text-white placeholder-emerald-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
            <MicBtn
              recording={patientInput.recording}
              busy={patientInput.busy}
              color="emerald"
              onStart={() => startRecording('patient')}
              onStop={stopRecording}
            />
            <button
              onClick={() => sendPatient(patientInput.text)}
              disabled={patientSendDisabled}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Middle bar ─── */}
      <div className="flex-shrink-0 flex items-center bg-slate-900 border-y border-slate-700/60 px-4 py-1.5 gap-3 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Back</span>
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-blue-400">English</span>
          <div className="flex items-center gap-1 bg-blue-600/20 border border-blue-500/40 rounded-full px-2 py-0.5">
            <ArrowUpDown className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Face-to-Face</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400">{langData.name}</span>
        </div>

        <button
          onClick={clearAll}
          className="p-1.5 text-slate-500 hover:text-white transition-colors"
          title="Clear"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Conversation transcript (middle) ─── */}
      <div
        ref={scrollRef}
        className="flex-shrink-0 h-36 overflow-y-auto px-3 py-2 bg-slate-900/80 space-y-1.5 border-b border-slate-800"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 text-xs text-center">Conversation transcript will appear here</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.side === 'staff' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-1.5 ${
                  msg.side === 'staff'
                    ? 'bg-blue-600/30 border border-blue-500/30'
                    : 'bg-emerald-600/30 border border-emerald-500/30'
                }`}
              >
                <p className={`text-xs font-semibold leading-snug ${msg.side === 'staff' ? 'text-blue-200' : 'text-emerald-200'}`}>
                  {msg.original}
                </p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5" dir={msg.side === 'staff' && isRtl ? 'rtl' : undefined}>
                  {msg.translation}
                </p>
              </div>
              <button
                onClick={() => replayMessage(msg)}
                className="self-center p-1 text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ─── STAFF panel (bottom — normal orientation) ─── */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-800">
          <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Staff — English</span>
          <button
            onClick={() => setShowPrompts(v => !v)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors font-semibold ${
              showPrompts ? 'bg-blue-600/30 border-blue-500/40 text-blue-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            {showPrompts ? 'Hide prompts' : 'Quick prompts'}
          </button>
        </div>

        {/* Quick prompts */}
        {showPrompts && (
          <div className="flex-shrink-0 px-3 pt-2 pb-1 overflow-x-auto flex gap-1.5 no-scrollbar">
            {STAFF_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendStaff(p)}
                className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500/60 hover:text-white transition-all whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Latest staff translation shown large for patient (right-side up for staff) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.filter(m => m.side === 'patient').slice(-3).map(m => (
            <div key={m.id} className="space-y-0.5">
              <p className="text-xs text-blue-700" dir={isRtl ? 'rtl' : undefined}>{m.original}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-blue-300 leading-snug flex-1">{m.translation}</p>
                <button
                  onClick={() => replayMessage(m)}
                  className="p-1.5 rounded-full bg-blue-700/40 text-blue-300 hover:bg-blue-600/60 transition-colors flex-shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {messages.filter(m => m.side === 'patient').length === 0 && (
            <p className="text-slate-700 text-sm text-center mt-4">Patient responses will appear here in English</p>
          )}
        </div>

        {/* Staff input */}
        <div className="flex-shrink-0 border-t border-slate-800 px-3 py-2">
          <div className="flex items-center gap-2">
            <textarea
              value={staffInput.text}
              onChange={e => setStaffInput(s => ({ ...s, text: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendStaff(staffInput.text); } }}
              placeholder="Type or speak in English…"
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <MicBtn
              recording={staffInput.recording}
              busy={staffInput.busy}
              color="blue"
              onStart={() => startRecording('staff')}
              onStop={stopRecording}
            />
            <button
              onClick={() => sendStaff(staffInput.text)}
              disabled={staffSendDisabled}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {staffInput.busy && (
            <div className="flex items-center gap-1.5 mt-1.5 text-blue-400 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" /> Translating…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MicBtnProps {
  recording: boolean;
  busy: boolean;
  color: 'blue' | 'emerald';
  onStart: () => void;
  onStop: () => void;
}

function MicBtn({ recording, busy, color, onStart, onStop }: MicBtnProps) {
  const base = color === 'blue' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-emerald-700 hover:bg-emerald-600';

  if (busy) {
    return (
      <div className={`p-2.5 rounded-xl ${base} opacity-50 flex-shrink-0`}>
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      </div>
    );
  }

  if (recording) {
    return (
      <button
        onClick={onStop}
        className="relative p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors flex-shrink-0"
      >
        <MicOff className="w-4 h-4" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-300 rounded-full animate-ping" />
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className={`p-2.5 rounded-xl ${base} text-white transition-colors flex-shrink-0`}
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}
