import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
type StatusCallback = (status: AudioStatus) => void;

let statusCallback: StatusCallback | null = null;

export const setStatusCallback = (cb: StatusCallback | null): void => {
  statusCallback = cb;
};

const setStatus = (s: AudioStatus): void => {
  if (statusCallback) statusCallback(s);
};

export const buildTTSUrl = (text: string, language: Language): string => {
  const tl = LANG_CODES[language];
  const q = encodeURIComponent(text);
  return `${SUPABASE_URL}/functions/v1/tts-proxy?q=${q}&tl=${encodeURIComponent(tl)}`;
};

export const playAudio = (audio: HTMLAudioElement, text: string, language: Language): void => {
  audio.pause();
  audio.currentTime = 0;
  audio.src = buildTTSUrl(text, language);

  setStatus('loading');

  audio.onplaying = () => setStatus('playing');
  audio.onended = () => setStatus('idle');
  audio.onerror = () => setStatus('error');

  audio.play().catch(() => setStatus('error'));
};

export const isSpeechSupported = (): boolean => true;
