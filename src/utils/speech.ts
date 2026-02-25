import { Language } from '../data/phrases';

const TTS_LANG_MAP: Record<Language, string> = {
  spanish: 'es-ES',
  tagalog: 'fil-PH',
  vietnamese: 'vi-VN',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
};

const TTS_PROXY_LANG_MAP: Record<Language, string> = {
  spanish: 'es',
  tagalog: 'tl',
  vietnamese: 'vi',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

let audioEl: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReady = false;

const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'none';
  }
  return audioEl;
};

export const preloadVoices = (): void => {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
    voicesReady = true;
    return;
  }
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
    voicesReady = true;
  });
};

const findVoice = (language: Language): SpeechSynthesisVoice | null => {
  const voices = cachedVoices;
  if (voices.length === 0) return null;

  const targetLang = TTS_LANG_MAP[language];

  const exactMatch = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (exactMatch) return exactMatch;

  if (language === 'mandarin') {
    return voices.find(v =>
      v.lang.toLowerCase().startsWith('zh-cn') ||
      v.lang.toLowerCase() === 'zh_cn' ||
      (v.lang.toLowerCase().startsWith('zh') && v.name.toLowerCase().includes('mandarin')) ||
      (v.lang.toLowerCase().startsWith('zh') &&
        !v.lang.toLowerCase().includes('hk') &&
        !v.lang.toLowerCase().includes('tw') &&
        !v.name.toLowerCase().includes('cantonese'))
    ) || null;
  }

  if (language === 'cantonese') {
    return voices.find(v =>
      v.lang.toLowerCase().startsWith('zh-hk') ||
      v.lang.toLowerCase() === 'zh_hk' ||
      (v.lang.toLowerCase().startsWith('zh') && v.name.toLowerCase().includes('cantonese'))
    ) || null;
  }

  const langPrefix = targetLang.split('-')[0];
  return voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) || null;
};

export const speakText = (text: string, language: Language): void => {
  if ('speechSynthesis' in window && voicesReady) {
    const voice = findVoice(language);
    if (voice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = TTS_LANG_MAP[language];
      utterance.voice = voice;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  const audio = getAudio();
  const lang = TTS_PROXY_LANG_MAP[language];
  const proxyUrl = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;

  audio.pause();
  audio.src = proxyUrl;
  audio.play().catch(() => {});
};

export const isSpeechSupported = (): boolean =>
  'speechSynthesis' in window || typeof HTMLAudioElement !== 'undefined';
