import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const player = new Audio();
player.loop = false;
player.preload = 'none';

let unlocked = false;
const blobCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

function fetchAudio(text: string, language: Language): Promise<string | null> {
  const key = `${language}::${text}`;
  if (blobCache.has(key)) return Promise.resolve(blobCache.get(key)!);
  if (inflight.has(key)) return inflight.get(key)!;

  const p = (async () => {
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
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

function unlockAudio(): void {
  if (unlocked) return;
  player.src = SILENT_WAV;
  player.muted = true;
  player.play().then(() => {
    player.muted = false;
    unlocked = true;
  }).catch(() => {});
}

export function playAudio(
  text: string,
  language: Language,
  onLoading?: (loading: boolean) => void,
): void {
  player.pause();
  player.currentTime = 0;
  player.src = '';

  unlockAudio();

  const key = `${language}::${text}`;
  const cached = blobCache.get(key);

  if (cached) {
    player.src = cached;
    player.play().catch(() => {});
    return;
  }

  onLoading?.(true);

  fetchAudio(text, language).then((url) => {
    onLoading?.(false);
    if (!url) return;
    player.src = url;
    player.play().catch(() => {});
  }).catch(() => onLoading?.(false));
}

export function preloadAudio(text: string, language: Language): void {
  fetchAudio(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
