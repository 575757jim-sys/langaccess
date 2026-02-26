import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

function cacheKey(text: string, language: Language): string {
  return `${language}::${text}`;
}

export async function playAudio(text: string, language: Language): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const key = cacheKey(text, language);

  let objectUrl = audioCache.get(key);

  if (!objectUrl) {
    const params = new URLSearchParams({ text, language });
    const response = await fetch(`${TTS_ENDPOINT}?${params}`, {
      headers: {
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('TTS request failed:', response.status);
      return;
    }

    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    audioCache.set(key, objectUrl);
  }

  const audio = new Audio(objectUrl);
  currentAudio = audio;

  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };

  audio.onerror = () => {
    console.error('Audio playback error');
    if (currentAudio === audio) currentAudio = null;
    audioCache.delete(key);
  };

  await audio.play();
}

export const initAudioUnlock = (): void => {};
