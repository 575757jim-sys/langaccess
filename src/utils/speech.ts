import { Language } from '../data/phrases';

const LANG_CODE: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-TW',
};

let player: HTMLAudioElement | null = null;

const getPlayer = (): HTMLAudioElement => {
  if (!player) {
    player = document.getElementById('global-player') as HTMLAudioElement;
    if (!player) {
      player = document.createElement('audio');
      player.id = 'global-player';
      document.body.appendChild(player);
    }
  }
  return player;
};

const buildUrl = (text: string, language: Language): string => {
  const tl = LANG_CODE[language];
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(tl)}`;
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

export const speakText = (text: string, language: Language): void => {
  const audio = getPlayer();
  audio.pause();

  setStatus('loading');

  audio.oncanplay = null;
  audio.onplaying = null;
  audio.onerror = null;
  audio.onended = null;

  audio.onplaying = () => setStatus('playing');
  audio.onerror = () => setStatus('error');
  audio.onended = () => setStatus('idle');

  audio.src = buildUrl(text, language);
  audio.load();
  audio.play().catch(() => setStatus('error'));
};

export const preloadVoices = (): void => {};

export const isSpeechSupported = (): boolean => true;
