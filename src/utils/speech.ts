import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

const blobCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

export const globalAudio = {
  pause() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  },
};

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

async function fetchBlobUrl(text: string, language: string): Promise<string | null> {
  const key = `${language}::${text}`;
  if (blobCache.has(key)) return blobCache.get(key)!;

  try {
    const params = new URLSearchParams({ text, language });
    const res = await fetch(`${TTS_ENDPOINT}?${params}`, {
      headers: { Authorization: `Bearer ${ANON_KEY}` },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size < 100) return null;
    const url = URL.createObjectURL(blob);
    blobCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

export function fetchTTSBlob(text: string, language: Language | string): Promise<string | null> {
  return fetchBlobUrl(text, language as string);
}

/**
 * Play audio. On iOS we must call audio.play() synchronously in the gesture
 * handler — we create the Audio element immediately and swap src once fetched.
 */
export function playAudioFromGesture(text: string, language: Language): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const audio = new Audio();
  currentAudio = audio;

  if (isIOS()) {
    audio.play().catch(() => {});
  }

  return fetchBlobUrl(text, language).then((url) => {
    if (!url || currentAudio !== audio) return;
    audio.src = url;
    audio.load();
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => {
      if (currentAudio === audio) currentAudio = null;
    });
  });
}

export function preloadAudio(text: string, language: Language): void {
  fetchBlobUrl(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
