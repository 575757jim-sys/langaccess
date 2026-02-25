import { Language } from '../data/phrases';

const TTS_LANG_MAP: Record<Language, string> = {
  spanish:    'es-MX',
  tagalog:    'fil-PH',
  vietnamese: 'vi-VN',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

const TTS_PROXY_LANG_MAP: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

let audioEl: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

const isIOS = (): boolean =>
  /iP(hone|ad|od)/.test(navigator.userAgent);

const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = new Audio();
  }
  return audioEl;
};

export const preloadVoices = (): void => {
  if (!('speechSynthesis' in window)) return;
  const load = () => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) cachedVoices = v;
  };
  load();
  window.speechSynthesis.addEventListener('voiceschanged', load);
};

const findVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (cachedVoices.length === 0) return null;
  const lower = lang.toLowerCase();

  const exact = cachedVoices.find(v => v.lang.toLowerCase() === lower);
  if (exact) return exact;

  if (lower === 'zh-cn') {
    return (
      cachedVoices.find(v => v.name === 'Tingting') ||
      cachedVoices.find(v => v.lang.toLowerCase() === 'zh-cn') ||
      null
    );
  }

  if (lower === 'zh-hk') {
    return (
      cachedVoices.find(v => v.name === 'Sin-Ji') ||
      cachedVoices.find(v => v.lang.toLowerCase() === 'zh-hk') ||
      null
    );
  }

  return cachedVoices.find(v => v.lang.toLowerCase().startsWith(lower.split('-')[0])) || null;
};

const makeUtterance = (text: string, language: Language): SpeechSynthesisUtterance => {
  const lang = TTS_LANG_MAP[language];
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  const voice = findVoice(lang);
  if (voice) u.voice = voice;
  return u;
};

const speakViaProxy = (text: string, language: Language): void => {
  const audio = getAudio();
  const lang = TTS_PROXY_LANG_MAP[language];
  const url = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;
  audio.pause();
  audio.src = url;
  audio.play().catch(() => {});
};

export const speakText = (text: string, language: Language): void => {
  if (!('speechSynthesis' in window)) {
    speakViaProxy(text, language);
    return;
  }

  if (isIOS()) {
    if (language === 'tagalog') {
      speakViaProxy(text, language);
      return;
    }

    const utterance = makeUtterance(text, language);
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    } else {
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  const utterance = makeUtterance(text, language);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const isSpeechSupported = (): boolean =>
  'speechSynthesis' in window || typeof HTMLAudioElement !== 'undefined';
