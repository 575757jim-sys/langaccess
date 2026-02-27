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

async function getOrFetchBlobUrl(text: string, language: string): Promise<string | null> {
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
  return getOrFetchBlobUrl(text, language as string);
}

export function playAudioFromGesture(text: string, language: Language): Promise<void> {
  return getOrFetchBlobUrl(text, language).then((url) => {
    if (!url) return;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => {
      if (currentAudio === audio) currentAudio = null;
    });
  });
}

export function preloadAudio(text: string, language: Language): void {
  getOrFetchBlobUrl(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
