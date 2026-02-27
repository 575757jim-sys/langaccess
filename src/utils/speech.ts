import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

// Tiny silent MP3 — allows iOS Safari to honour audio.play() synchronously
// inside a user gesture even before the real src is available.
const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZCBUZWNoLCBJbmMuIFVSTDogaHR0cDovL3d3dy5iaWdzb3VuZHRlY2guY29tAFRJVDIAAAAGAAADMTIzNDU2AFRBTEIAAAAHAAAMQ29tcG9zZXIAVFJDSwAAAAIAAAMxAFRZRVIAAAAFAAADMjAyMwAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

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
 * Play TTS audio. Works on iOS Safari by loading a silent MP3 synchronously
 * inside the gesture handler (satisfying the "user activation" requirement),
 * then swapping to the real audio once the network fetch completes.
 */
export function playAudioFromGesture(text: string, language: Language): Promise<void> {
  globalAudio.pause();

  const audio = new Audio(SILENT_MP3);
  audio.volume = 0;
  currentAudio = audio;

  const playPromise = audio.play();
  if (playPromise) playPromise.catch(() => {});

  return fetchBlobUrl(text, language).then((url) => {
    if (!url || currentAudio !== audio) return;
    audio.pause();
    audio.volume = 1;
    audio.src = url;
    audio.load();
    const p = audio.play();
    if (p) p.catch(() => {});
    audio.addEventListener('ended', () => {
      if (currentAudio === audio) currentAudio = null;
    });
  });
}

export function preloadAudio(text: string, language: Language): void {
  fetchBlobUrl(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
