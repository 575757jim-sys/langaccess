import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
type StatusCallback = (status: AudioStatus) => void;

let statusCallback: StatusCallback | null = null;

export const setStatusCallback = (cb: StatusCallback | null): void => {
  statusCallback = cb;
};

const setStatus = (s: AudioStatus): void => {
  if (statusCallback) statusCallback(s);
};

let currentObjectUrl: string | null = null;

const revokeCurrentUrl = (): void => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
};

export const playAudio = async (text: string, language: Language): Promise<void> => {
  const tl = LANG_CODES[language];
  const q = encodeURIComponent(text);
  const proxyUrl = `${SUPABASE_URL}/functions/v1/tts-proxy?q=${q}&tl=${encodeURIComponent(tl)}`;

  setStatus('loading');

  try {
    const res = await fetch(proxyUrl, {
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Client-Info': 'supabase-js/2',
      },
    });

    if (!res.ok) {
      setStatus('error');
      return;
    }

    const blob = await res.blob();
    if (blob.size < 500) {
      setStatus('error');
      return;
    }

    revokeCurrentUrl();
    const objectUrl = URL.createObjectURL(blob);
    currentObjectUrl = objectUrl;

    const audio = new Audio(objectUrl);

    audio.onplaying = () => setStatus('playing');
    audio.onended = () => {
      setStatus('idle');
      revokeCurrentUrl();
    };
    audio.onerror = () => {
      setStatus('error');
      revokeCurrentUrl();
    };

    await audio.play();
  } catch {
    setStatus('error');
  }
};

export const isSpeechSupported = (): boolean => true;
