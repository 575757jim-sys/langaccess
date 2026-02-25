import { Language } from '../data/phrases';

const LANG_CODE: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-TW',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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
  return `${SUPABASE_URL}/functions/v1/tts-proxy?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(tl)}`;
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

  audio.onplaying = null;
  audio.onerror = null;
  audio.onended = null;

  audio.onplaying = () => setStatus('playing');
  audio.onerror = () => setStatus('error');
  audio.onended = () => setStatus('idle');

  const url = buildUrl(text, language);
  audio.src = url;

  const reqHeaders = new Headers({
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  });

  fetch(url, { headers: reqHeaders })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      audio.src = objectUrl;
      audio.load();
      return audio.play();
    })
    .catch(() => setStatus('error'));
};

export const preloadVoices = (): void => {};

export const isSpeechSupported = (): boolean => true;
