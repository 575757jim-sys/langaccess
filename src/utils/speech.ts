import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;

const blobCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();
let currentAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

function cacheKey(text: string, language: Language): string {
  return `${language}::${text}`;
}

function fetchAudioBlob(text: string, language: Language): Promise<string | null> {
  const key = cacheKey(text, language);
  if (blobCache.has(key)) return Promise.resolve(blobCache.get(key)!);
  if (inflight.has(key)) return inflight.get(key)!;

  const promise = (async () => {
    const params = new URLSearchParams({ text, language });
    const response = await fetch(`${TTS_ENDPOINT}?${params}`, {
      headers: { Authorization: `Bearer ${ANON_KEY}` },
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.size < 100) return null;
    const url = URL.createObjectURL(blob);
    blobCache.set(key, url);
    inflight.delete(key);
    return url;
  })();

  inflight.set(key, promise);
  return promise;
}

function stopCurrent(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function playAudio(
  text: string,
  language: Language,
  onLoading?: (loading: boolean) => void,
): void {
  stopCurrent();

  const key = cacheKey(text, language);
  const cached = blobCache.get(key);

  if (cached) {
    const audio = new Audio(cached);
    currentAudio = audio;
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
    audio.play().catch(() => {});
    return;
  }

  const audio = new Audio();
  currentAudio = audio;
  audio.onended = () => { if (currentAudio === audio) currentAudio = null; };

  if (!audioUnlocked) {
    audio.muted = true;
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    audio.play().then(() => {
      audio.muted = false;
      audioUnlocked = true;
    }).catch(() => {});
  }

  onLoading?.(true);

  fetchAudioBlob(text, language).then((url) => {
    onLoading?.(false);
    if (!url || currentAudio !== audio) return;
    audio.src = url;
    audio.play().catch(() => {});
  }).catch(() => {
    onLoading?.(false);
  });
}

export function preloadAudio(text: string, language: Language): void {
  fetchAudioBlob(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
