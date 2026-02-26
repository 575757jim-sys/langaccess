import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;

const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgU291bmQgRWZmZWN0cyBMaWJyYXJ5AABURVhUAAAABgAAAzIwMTkAVFNTRQAAAA8AAANMYXZmNTYuNDEuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const audio = new Audio();
audio.loop = false;
audio.preload = 'none';

const cache = new Map<string, string>();

async function fetchBlob(text: string, language: Language): Promise<string | null> {
  const key = `${language}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const params = new URLSearchParams({ text, language });
    const res = await fetch(`${TTS_ENDPOINT}?${params}`, {
      headers: { Authorization: `Bearer ${ANON_KEY}` },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size < 100) return null;
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

export function playAudio(
  text: string,
  language: Language,
  onLoading?: (loading: boolean) => void,
): void {
  audio.pause();
  audio.currentTime = 0;
  audio.loop = false;
  audio.src = SILENT_MP3;
  audio.play().catch(() => {});

  const key = `${language}::${text}`;
  const cached = cache.get(key);

  if (cached) {
    audio.pause();
    audio.src = cached;
    audio.currentTime = 0;
    audio.loop = false;
    audio.play().catch(() => {});
    onLoading?.(false);
    return;
  }

  onLoading?.(true);

  fetchBlob(text, language).then((url) => {
    onLoading?.(false);
    if (!url) return;
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    audio.loop = false;
    audio.play().catch(() => {});
  }).catch(() => onLoading?.(false));
}

export function preloadAudio(text: string, language: Language): void {
  fetchBlob(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
