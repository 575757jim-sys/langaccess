import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

const cache = new Map<string, ArrayBuffer>();
let currentPlayId = 0;
let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

export const globalAudio = {
  pause() {
    currentSource?.stop();
    currentSource = null;
  },
  get currentTime() { return audioCtx?.currentTime ?? 0; },
  set currentTime(_v: number) {},
};

export function fetchTTSBlob(text: string, language: Language): Promise<ArrayBuffer | null> {
  const key = `${language}::${text}`;
  if (cache.has(key)) return Promise.resolve(cache.get(key)!);
  const params = new URLSearchParams({ text, language });
  return fetch(`${TTS_ENDPOINT}?${params}`, {
    headers: { Authorization: `Bearer ${ANON_KEY_VALUE}` },
  })
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .then((buf) => {
      if (!buf || buf.byteLength < 100) return null;
      cache.set(key, buf);
      return buf;
    })
    .catch(() => null);
}

export function playAudioFromGesture(text: string, language: Language): void {
  const playId = ++currentPlayId;
  const ctx = getAudioContext();

  currentSource?.stop();
  currentSource = null;

  const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();

  const key = `${language}::${text}`;
  const cached = cache.get(key);

  if (cached) {
    resume.then(() => {
      if (currentPlayId !== playId) return;
      return ctx.decodeAudioData(cached.slice(0));
    }).then((decoded) => {
      if (!decoded || currentPlayId !== playId) return;
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      src.connect(ctx.destination);
      currentSource = src;
      src.start(0);
    }).catch(() => {});
    return;
  }

  resume.then(() => fetchTTSBlob(text, language)).then((buf) => {
    if (!buf || currentPlayId !== playId) return;
    return ctx.decodeAudioData(buf.slice(0));
  }).then((decoded) => {
    if (!decoded || currentPlayId !== playId) return;
    const src = ctx.createBufferSource();
    src.buffer = decoded;
    src.connect(ctx.destination);
    currentSource = src;
    src.start(0);
  }).catch(() => {});
}

export function preloadAudio(text: string, language: Language): void {
  fetchTTSBlob(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
