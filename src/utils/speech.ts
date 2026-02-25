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
let synthVoicesLoaded = false;

const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.loop = false;
    audioEl.style.display = 'none';
    document.body.appendChild(audioEl);
  }
  return audioEl;
};

const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
};

const speakWithSynthesis = async (text: string, language: Language): Promise<boolean> => {
  if (!('speechSynthesis' in window)) return false;

  const targetLang = TTS_LANG_MAP[language];

  if (!synthVoicesLoaded) {
    await waitForVoices();
    synthVoicesLoaded = true;
  }

  const voices = window.speechSynthesis.getVoices();
  const exactMatch = voices.find(v => v.lang === targetLang);
  const langPrefix = targetLang.split('-')[0];
  const prefixMatch = voices.find(v => v.lang.startsWith(langPrefix));
  const voice = exactMatch || prefixMatch;

  if (!voice && voices.length > 0 && language !== 'spanish') {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang;
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;

  return new Promise((resolve) => {
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
    setTimeout(() => resolve(true), 8000);
  });
};

const speakWithProxy = (text: string, language: Language): void => {
  const audio = getAudio();
  const lang = TTS_PROXY_LANG_MAP[language];
  const proxyUrl = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;

  audio.pause();
  audio.loop = false;
  audio.src = proxyUrl;
  audio.load();

  setTimeout(() => {
    audio.play().catch(() => {});
  }, 100);
};

export const speakText = async (text: string, language: Language): Promise<void> => {
  const success = await speakWithSynthesis(text, language);
  if (!success) {
    speakWithProxy(text, language);
  }
};

export const isSpeechSupported = (): boolean =>
  'speechSynthesis' in window || typeof HTMLAudioElement !== 'undefined';
