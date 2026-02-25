import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
type StatusCallback = (status: AudioStatus) => void;

let statusCallback: StatusCallback | null = null;

export const setStatusCallback = (cb: StatusCallback): void => {
  statusCallback = cb;
};

const setStatus = (s: AudioStatus): void => {
  if (statusCallback) statusCallback(s);
};

export const buildTTSUrl = (text: string, language: Language): string => {
  const tl = LANG_CODES[language];
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(tl)}`;
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
