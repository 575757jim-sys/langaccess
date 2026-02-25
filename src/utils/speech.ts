import { Language } from '../data/phrases';

const TTS_LANG_MAP: Record<Language, string> = {
  spanish: 'es',
  tagalog: 'tl',
  vietnamese: 'vi',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

let audioEl: HTMLAudioElement | null = null;

const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.style.display = 'none';
    document.body.appendChild(audioEl);
  }
  return audioEl;
};

export const speakText = (text: string, language: Language): void => {
  const audio = getAudio();
  const lang = TTS_LANG_MAP[language];
  const proxyUrl = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;
  audio.src = proxyUrl;
  audio.load();
  audio.play().catch(() => {});
};

export const isSpeechSupported = (): boolean => true;
