import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;

const SILENT_MP3 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAAN//MUZAwAAAGkAAAAAAAAA0gAAAAA';

const player = new Audio();
player.preload = 'none';

let unlocked = false;
let currentPlayKey = '';
const blobCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

function doUnlock(): void {
  if (unlocked) return;
  player.src = SILENT_MP3;
  player.loop = false;
  player.muted = true;
  const p = player.play();
  if (p) {
    p.then(() => {
      player.muted = false;
      unlocked = true;
    }).catch(() => {
      player.muted = false;
    });
  }
}

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
    } catch {
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

function startPlayback(url: string, key: string): void {
  if (player.src !== url) {
    player.src = url;
    player.loop = false;
  }
  currentPlayKey = key;
  player.currentTime = 0;
  player.play().catch(() => {});
}

export function playAudio(
  text: string,
  language: Language,
  onLoading?: (loading: boolean) => void,
): void {
  doUnlock();

  const key = `${language}::${text}`;

  if (currentPlayKey === key && !player.paused && !player.ended) {
    player.pause();
    player.currentTime = 0;
    currentPlayKey = '';
    onLoading?.(false);
    return;
  }

  if (!player.paused) {
    player.pause();
    player.currentTime = 0;
  }

  const cached = blobCache.get(key);
  if (cached) {
    startPlayback(cached, key);
    onLoading?.(false);
    return;
  }

  onLoading?.(true);

  fetchAudio(text, language).then((url) => {
    onLoading?.(false);
    if (!url) return;
    startPlayback(url, key);
  }).catch(() => onLoading?.(false));
}

export function preloadAudio(text: string, language: Language): void {
  fetchAudio(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
