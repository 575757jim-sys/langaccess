import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

export const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgU291bmQgRWZmZWN0cyBMaWJyYXJ5AABURVhUAAAABgAAAzIwMTkAVFNTRQAAAA8AAANMYXZmNTYuNDEuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export const globalAudio = new Audio();
globalAudio.loop = false;
globalAudio.preload = 'auto';

const cache = new Map<string, string>();

export function fetchTTSBlob(text: string, language: Language): Promise<string | null> {
  const key = `${language}::${text}`;
  if (cache.has(key)) return Promise.resolve(cache.get(key)!);
  const params = new URLSearchParams({ text, language });
  return fetch(`${TTS_ENDPOINT}?${params}`, {
    headers: { Authorization: `Bearer ${ANON_KEY_VALUE}` },
  })
    .then((res) => (res.ok ? res.blob() : null))
    .then((blob) => {
      if (!blob || blob.size < 100) return null;
      const url = URL.createObjectURL(blob);
      cache.set(key, url);
      return url;
    })
    .catch(() => null);
}

/**
 * iOS Safari requires audio.play() to be called synchronously within a user
 * gesture. Once the event handler yields to the network (await / .then), the
 * gesture context is gone and iOS silently refuses play().
 *
 * Strategy:
 *  1. Immediately set src to the silent MP3 and call play() — this captures
 *     the gesture and "unlocks" the audio element on iOS.
 *  2. When the blob resolves, swap src while the element is already playing.
 *     iOS allows src changes on an already-running audio element, so playback
 *     continues seamlessly without needing a second user gesture.
 */
export function playAudioFromGesture(text: string, language: Language): void {
  globalAudio.pause();
  globalAudio.loop = false;

  const key = `${language}::${text}`;
  const cached = cache.get(key);

  if (cached) {
    globalAudio.src = cached;
    globalAudio.currentTime = 0;
    globalAudio.play().catch(() => {});
    return;
  }

  globalAudio.src = SILENT_MP3;
  globalAudio.currentTime = 0;
  const playPromise = globalAudio.play();

  fetchTTSBlob(text, language).then((url) => {
    if (!url) return;
    if (playPromise) {
      playPromise.then(() => {
        globalAudio.src = url;
        globalAudio.currentTime = 0;
        globalAudio.play().catch(() => {});
      }).catch(() => {
        globalAudio.src = url;
        globalAudio.currentTime = 0;
        globalAudio.play().catch(() => {});
      });
    } else {
      globalAudio.src = url;
      globalAudio.currentTime = 0;
      globalAudio.play().catch(() => {});
    }
  }).catch(() => {});
}

export function preloadAudio(text: string, language: Language): void {
  fetchTTSBlob(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
