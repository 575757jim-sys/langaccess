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
      currentAudio = null;
    }
  },
};

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
 * Play TTS audio triggered by a user gesture.
 *
 * On iOS Safari, audio.play() MUST be called synchronously within the gesture
 * event handler. We do that with a blob URL fetched before the user taps when
 * possible (from cache), or by doing the whole fetch-then-play chain while
 * keeping the Audio element alive from the gesture frame.
 *
 * The approach: create and play a very short silent data URI immediately, then
 * swap in the real audio src when the fetch completes. iOS allows src-swap
 * on an already-playing (or played) element without requiring a new gesture.
 */
export function playAudioFromGesture(text: string, language: Language): void {
  globalAudio.pause();

  const key = `${language}::${text}`;
  const cached = blobCache.get(key);

  const audio = new Audio();
  currentAudio = audio;

  const doPlay = (url: string) => {
    if (currentAudio !== audio) return;
    audio.src = url;
    audio.load();
    const p = audio.play();
    if (p) p.catch(() => {});
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  };

  if (cached) {
    doPlay(cached);
    return;
  }

  // Not cached — we need to "unlock" audio with a synchronous play() call
  // then swap the src. Use a data URI of a 0.1s silence (WAV format).
  const silenceWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  audio.src = silenceWav;
  const unlockPromise = audio.play();
  if (unlockPromise) unlockPromise.catch(() => {});

  fetchBlobUrl(text, language).then((url) => {
    if (!url || currentAudio !== audio) return;
    audio.pause();
    doPlay(url);
  });
}

export function initAudioUnlock(): void {}

export function preloadAudio(text: string, language: Language): void {
  fetchBlobUrl(text, language).catch(() => {});
}
