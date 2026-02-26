import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

const audio = new Audio();

export const playAudio = (text: string, language: Language): void => {
  const lang = LANG_CODES[language];
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;

  audio.pause();
  audio.currentTime = 0;
  audio.src = url;
  audio.play();
};
