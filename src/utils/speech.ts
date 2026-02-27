import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

const blobCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

// iOS requires that an AudioContext or Audio element be created/played
// synchronously inside a user gesture at least once before async play() works.
// We maintain a single "unlocked" flag. Once unlocked, async play() is fine.
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Play a tiny silent audio to mark the AudioSession as active.
  const a = new Audio();
  // Minimal valid MP3 (48 bytes, ~0ms silence)
  a.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgU291bmQgRWZmZWN0cyBMaWJyYXJ5//uQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAABIADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAA5TFAMAAAAMAAAAJQAABQAAAF2AAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
  a.volume = 0;
  a.play().catch(() => {});
}

export function initAudioUnlock(): void {
  // Call this on the first user interaction (touchstart/click on document)
  const handler = () => {
    unlockAudio();
    document.removeEventListener('touchstart', handler, true);
    document.removeEventListener('mousedown', handler, true);
  };
  document.addEventListener('touchstart', handler, true);
  document.addEventListener('mousedown', handler, true);
}

export const globalAudio = {
  pause() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
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

export function preloadAudio(text: string, language: Language): void {
  fetchBlobUrl(text, language).catch(() => {});
}

export function playAudioFromGesture(text: string, language: Language): void {
  // Ensure audio is unlocked (this call is synchronous and safe)
  unlockAudio();
  globalAudio.pause();

  const key = `${language}::${text}`;
  const cached = blobCache.get(key);

  const audio = new Audio();
  audio.preload = 'auto';
  currentAudio = audio;

  if (cached) {
    audio.src = cached;
    const p = audio.play();
    if (p) p.catch(() => {});
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
    return;
  }

  // Not cached yet — fetch then play.
  // On iOS: once unlockAudio() has been called at least once (on any prior interaction),
  // async audio.play() will succeed. The unlockAudio() call above handles first-time cases.
  fetchBlobUrl(text, language).then((url) => {
    if (!url || currentAudio !== audio) return;
    audio.src = url;
    const p = audio.play();
    if (p) p.catch(() => {});
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  });
}
