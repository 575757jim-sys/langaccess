import { Language } from '../data/phrases';

const TTS_LANG_MAP: Record<Language, string> = {
  spanish: 'es',
  tagalog: 'tl',
  vietnamese: 'vi',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
};

let audioEl: HTMLAudioElement | null = null;

const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.style.display = 'none';
    document.body.appendChild(audioEl);
  }
  return audioEl;
};

const buildTTSUrl = (text: string, lang: string): string => {
  const encoded = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encoded}&tl=${lang}`;
};

export const speakText = (text: string, language: Language): void => {
  const audio = getAudio();
  const lang = TTS_LANG_MAP[language];
  audio.src = buildTTSUrl(text, lang);
  audio.load();
  audio.play().catch(() => {});
};

export const isSpeechSupported = (): boolean => true;
