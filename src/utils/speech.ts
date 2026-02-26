import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

export const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgU291bmQgRWZmZWN0cyBMaWJyYXJ5AABURVhUAAAABgAAAzIwMTkAVFNTRQAAAA8AAANMYXZmNTYuNDEuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export const globalAudio = new Audio();
globalAudio.loop = false;

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

export function preloadAudio(text: string, language: Language): void {
  fetchTTSBlob(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
