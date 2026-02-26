import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-TW',
};

export const initAudioUnlock = (): void => {
  const unlock = () => {
    const audio = document.getElementById('global-player') as HTMLAudioElement | null;
    if (audio) {
      audio.play().catch(() => {});
    }
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchend', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('touchend', unlock);
};

export const playAudio = (text: string, language: Language): void => {
  const lang = LANG_CODES[language];
  const audio = document.getElementById('global-player') as HTMLAudioElement | null;
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  audio.loop = false;
  audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;
  audio.play().catch((err) => console.error('Click required to unlock audio', err));
};
