import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

const blobCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

let audioUnlocked = false;

export function unlockAudioContext(): void {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try {
    type WebkitAC = { webkitAudioContext: typeof AudioContext };
    const AC = window.AudioContext || (window as unknown as WebkitAC).webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      ctx.resume().catch(() => {});
    }
  } catch (e) {
    console.error('[audio] AudioContext unlock failed:', e);
  }
  try {
    const a = new Audio();
    a.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgU291bmQgRWZmZWN0cyBMaWJyYXJ5//uQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAABIADMzMzM//uQxAADwAABpAAAACAAADSAAAAE';
    a.volume = 0;
    a.play().catch(() => {});
  } catch (e) {
    console.error('[audio] Silent Audio unlock failed:', e);
  }
}

export function initAudioUnlock(): void {
  const handler = () => {
    unlockAudioContext();
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

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error('[tts] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
    return null;
  }

  try {
    const params = new URLSearchParams({ text, language });
    const res = await fetch(`${TTS_ENDPOINT}?${params}`, {
      headers: { Authorization: `Bearer ${ANON_KEY}` },
    });

    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch { detail = '(no body)'; }
      console.error(`[tts] HTTP ${res.status} for lang=${language}: ${detail}`);
      return null;
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('audio')) {
      const body = await res.text();
      console.error(`[tts] Unexpected content-type "${contentType}": ${body}`);
      return null;
    }

    const blob = await res.blob();
    if (blob.size < 100) {
      console.error(`[tts] Blob too small (${blob.size} bytes) for lang=${language}`);
      return null;
    }

    const url = URL.createObjectURL(blob);
    blobCache.set(key, url);
    return url;
  } catch (e) {
    console.error('[tts] Fetch error:', e);
    return null;
  }
}

export function fetchTTSBlob(text: string, language: Language | string): Promise<string | null> {
  return fetchBlobUrl(text, language as string);
}

export function preloadAudio(text: string, language: Language): void {
  fetchBlobUrl(text, language).catch(() => {});
}

function cleanTextForTTS(text: string, language: Language): string {
  if (language === 'mandarin' || language === 'cantonese') {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
  }
  return text;
}

export function playAudioFromGesture(text: string, language: Language): void {
  unlockAudioContext();
  globalAudio.pause();

  const cleaned = cleanTextForTTS(text, language);
  const key = `${language}::${cleaned}`;
  const cached = blobCache.get(key);

  const audio = new Audio();
  audio.preload = 'auto';
  currentAudio = audio;

  const doPlay = (src: string) => {
    audio.src = src;
    const p = audio.play();
    if (p) {
      p.catch((err) => {
        console.error('[audio] play() rejected:', err);
      });
    }
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  };

  if (cached) {
    doPlay(cached);
    return;
  }

  fetchBlobUrl(cleaned, language).then((url) => {
    if (!url) {
      console.error('[audio] No URL returned from TTS — check GOOGLE_TTS_API_KEY is set in Supabase Edge Function secrets');
      if (currentAudio === audio) currentAudio = null;
      return;
    }
    if (currentAudio !== audio) return;
    doPlay(url);
  });
}
