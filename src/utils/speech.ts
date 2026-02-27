import { Language } from '../data/phrases';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/tts-proxy`;
export const ANON_KEY_VALUE = ANON_KEY;

const LANG_BCP47: Record<Language, string> = {
  spanish: 'es-US',
  tagalog: 'fil-PH',
  vietnamese: 'vi-VN',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
  hmong: 'hmn',
  korean: 'ko-KR',
  arabic: 'ar-SA',
};

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

const blobCache = new Map<string, string>();
let currentPlayId = 0;
let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

export const globalAudio = {
  pause() {
    currentSource?.stop();
    currentSource = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  },
  get currentTime() { return audioCtx?.currentTime ?? 0; },
  set currentTime(_v: number) {},
};

function speakWithSynthesis(text: string, language: Language): void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = LANG_BCP47[language] || 'en-US';
  utt.rate = 0.9;

  const trySpeak = () => {
    const voices = synth.getVoices();
    const langCode = LANG_BCP47[language] || '';
    const match = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
    if (match) utt.voice = match;
    synth.speak(utt);
  };

  if (synth.getVoices().length > 0) {
    trySpeak();
  } else {
    synth.addEventListener('voiceschanged', trySpeak, { once: true });
    trySpeak();
  }
}

export function fetchTTSBlob(text: string, language: Language | string): Promise<string | null> {
  const key = `${language}::${text}`;
  if (blobCache.has(key)) return Promise.resolve(blobCache.get(key)!);
  const params = new URLSearchParams({ text, language });
  return fetch(`${TTS_ENDPOINT}?${params}`, {
    headers: { Authorization: `Bearer ${ANON_KEY_VALUE}` },
  })
    .then((res) => (res.ok ? res.blob() : null))
    .then((blob) => {
      if (!blob || blob.size < 100) return null;
      const url = URL.createObjectURL(blob);
      blobCache.set(key, url);
      return url;
    })
    .catch(() => null);
}

function playBlobUrl(url: string): void {
  const audio = new Audio(url);
  audio.play().catch(() => {});
}

function playWithAudioContext(blobUrl: string): void {
  fetch(blobUrl)
    .then(r => r.arrayBuffer())
    .then(buf => {
      const ctx = getAudioContext();
      return ctx.decodeAudioData(buf);
    })
    .then(decoded => {
      currentSource?.stop();
      const ctx = getAudioContext();
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      src.connect(ctx.destination);
      currentSource = src;
      src.start(0);
    })
    .catch(() => {});
}

export function playAudioFromGesture(text: string, language: Language): void {
  const playId = ++currentPlayId;
  const key = `${language}::${text}`;
  const cached = blobCache.get(key);

  currentSource?.stop();
  currentSource = null;

  if (isIOS()) {
    if (cached) {
      playBlobUrl(cached);
      return;
    }
    speakWithSynthesis(text, language);
    fetchTTSBlob(text, language).then((url) => {
      if (!url || currentPlayId !== playId) return;
    }).catch(() => {});
    return;
  }

  const ctx = getAudioContext();
  const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();

  if (cached) {
    resume.then(() => {
      if (currentPlayId !== playId) return;
      playWithAudioContext(cached);
    }).catch(() => {});
    return;
  }

  resume
    .then(() => fetchTTSBlob(text, language))
    .then((url) => {
      if (!url || currentPlayId !== playId) return;
      playWithAudioContext(url);
    })
    .catch(() => {});
}

export function preloadAudio(text: string, language: Language): void {
  fetchTTSBlob(text, language).catch(() => {});
}

export const initAudioUnlock = (): void => {};
