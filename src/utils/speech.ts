import { Language } from '../data/phrases';

const LANG_BCP47: Record<Language, string> = {
  spanish:    'es-ES',
  tagalog:    'fil-PH',
  vietnamese: 'vi-VN',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
type StatusCallback = (status: AudioStatus) => void;

let statusCallback: StatusCallback | null = null;
let activeObjectUrl: string | null = null;
let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

export const setStatusCallback = (cb: StatusCallback): void => {
  statusCallback = cb;
};

const setStatus = (s: AudioStatus): void => {
  if (statusCallback) statusCallback(s);
};

const revokeActive = (): void => {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  if (activeUtterance) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
};

const speakViaSynthesis = (text: string, language: Language): boolean => {
  if (!window.speechSynthesis) return false;

  const bcp47 = LANG_BCP47[language];
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v =>
    v.lang === bcp47 ||
    v.lang.startsWith(bcp47.split('-')[0])
  );

  if (!matchingVoice && voices.length > 0) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47;
  if (matchingVoice) utterance.voice = matchingVoice;
  utterance.rate = 0.85;

  utterance.onstart = () => setStatus('playing');
  utterance.onend = () => { setStatus('idle'); activeUtterance = null; };
  utterance.onerror = () => { setStatus('idle'); activeUtterance = null; };

  activeUtterance = utterance;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
};

const speakViaProxy = (text: string, language: Language): void => {
  const LANG_CODE: Record<Language, string> = {
    spanish:    'es',
    tagalog:    'tl',
    vietnamese: 'vi',
    mandarin:   'zh-CN',
    cantonese:  'zh-TW',
  };

  const tl = LANG_CODE[language];
  const url = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(tl)}`;

  fetch(url, {
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      activeObjectUrl = objectUrl;

      const audio = new Audio(objectUrl);
      activeAudio = audio;

      audio.onplaying = () => setStatus('playing');
      audio.onended = () => { setStatus('idle'); revokeActive(); };
      audio.onerror = () => { setStatus('error'); revokeActive(); };

      const p = audio.play();
      if (p) p.catch(() => { setStatus('error'); revokeActive(); });
    })
    .catch(() => setStatus('error'));
};

export const speakText = (text: string, language: Language): void => {
  revokeActive();
  setStatus('loading');

  if (window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const ok = speakViaSynthesis(text, language);
      if (ok) { setStatus('playing'); return; }
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        const ok = speakViaSynthesis(text, language);
        if (!ok) speakViaProxy(text, language);
      };
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  speakViaProxy(text, language);
};

export const preloadVoices = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }
};

export const isSpeechSupported = (): boolean => true;
