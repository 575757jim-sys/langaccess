import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

export const playAudio = (text: string, language: Language): void => {
  const langCode = LANG_CODES[language];
  const player = document.getElementById('medical-audio-player') as HTMLAudioElement | null;
  if (!player) return;
  player.pause();
  player.currentTime = 0;
  player.loop = false;
  player.src = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(langCode)}`;
  player.play().catch((e) => console.error('Needs user tap', e));
};
