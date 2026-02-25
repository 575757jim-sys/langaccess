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

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
type StatusCallback = (status: AudioStatus) => void;

let statusCallback: StatusCallback | null = null;
let activeObjectUrl: string | null = null;
let activeAudio: HTMLAudioElement | null = null;

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
};

export const speakText = (text: string, language: Language): void => {
  revokeActive();
  setStatus('loading');

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

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          setStatus('error');
          revokeActive();
        });
      }
    })
    .catch(() => setStatus('error'));
};

export const preloadVoices = (): void => {};
export const isSpeechSupported = (): boolean => true;
