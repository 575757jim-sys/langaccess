import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

let currentAudio: HTMLAudioElement | null = null;

export const playAudio = (text: string, language: Language): void => {
  const lang = LANG_CODES[language];
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
  }

  const audio = new Audio();
  audio.src = url;
  currentAudio = audio;
  audio.play().catch((e) => console.warn('Audio playback blocked:', e));
};
