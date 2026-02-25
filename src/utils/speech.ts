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
let voicesLoaded = false;

const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'none';
  }
  return audioEl;
};

export const preloadVoices = (): void => {
  if (!('speechSynthesis' in window)) return;

  const load = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
    }
  };

  load();
  window.speechSynthesis.addEventListener('voiceschanged', load);
};

const findBestVoice = (language: Language): SpeechSynthesisVoice | null => {
  if (cachedVoices.length === 0) return null;

  const targetLang = TTS_LANG_MAP[language];

  const exactMatch = cachedVoices.find(
    v => v.lang.toLowerCase() === targetLang.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  if (language === 'mandarin') {
    return (
      cachedVoices.find(v => v.lang.toLowerCase() === 'zh-cn') ||
      cachedVoices.find(v => v.name.toLowerCase().includes('tingting')) ||
      cachedVoices.find(v => v.name.toLowerCase().includes('mandarin')) ||
      cachedVoices.find(v =>
        v.lang.toLowerCase().startsWith('zh') &&
        !v.lang.toLowerCase().includes('hk') &&
        !v.lang.toLowerCase().includes('tw') &&
        !v.name.toLowerCase().includes('cantonese') &&
        !v.name.toLowerCase().includes('sin-ji')
      ) ||
      null
    );
  }

  if (language === 'cantonese') {
    return (
      cachedVoices.find(v => v.lang.toLowerCase() === 'zh-hk') ||
      cachedVoices.find(v => v.name.toLowerCase().includes('sin-ji')) ||
      cachedVoices.find(v => v.name.toLowerCase().includes('cantonese')) ||
      null
    );
  }

  if (language === 'tagalog') {
    return (
      cachedVoices.find(v => v.lang.toLowerCase().startsWith('fil')) ||
      cachedVoices.find(v => v.lang.toLowerCase().startsWith('tl')) ||
      cachedVoices.find(v => v.name.toLowerCase().includes('tagalog') || v.name.toLowerCase().includes('filipino')) ||
      null
    );
  }

  const langPrefix = targetLang.split('-')[0];
  return cachedVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) || null;
};

const speakWithSynthesis = (text: string, language: Language): void => {
  const targetLang = TTS_LANG_MAP[language];
  const voice = findBestVoice(language);
  const ios = isIOS();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.85;
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  window.speechSynthesis.cancel();

  if (ios) {
    setTimeout(doSpeak, 150);
  } else {
    doSpeak();
  }
};

const speakWithProxy = (text: string, language: Language): void => {
  const audio = getAudio();
  const lang = TTS_PROXY_LANG_MAP[language];
  const proxyUrl = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;

  audio.pause();
  audio.src = proxyUrl;
  audio.play().catch(() => {});
};

export const speakText = (text: string, language: Language): void => {
  if ('speechSynthesis' in window) {
    speakWithSynthesis(text, language);
    return;
  }
  speakWithProxy(text, language);
};

export const isSpeechSupported = (): boolean =>
  'speechSynthesis' in window || typeof HTMLAudioElement !== 'undefined';
