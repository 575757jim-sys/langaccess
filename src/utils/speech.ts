import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish:    'es',
  tagalog:    'tl',
  vietnamese: 'vi',
  mandarin:   'zh-CN',
  cantonese:  'zh-HK',
};

let audioUnlocked = false;

const getPlayer = (): HTMLAudioElement | null => {
  return document.getElementById('global-audio-player') as HTMLAudioElement | null;
};

export const initAudioUnlock = (): void => {
  const unlock = () => {
    if (audioUnlocked) return;
    const player = getPlayer();
    if (player) {
      player.play().catch(() => {});
      audioUnlocked = true;
    }
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchend', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('touchend', unlock);
};

export const playAudio = (text: string, language: Language): void => {
  const lang = LANG_CODES[language];
  const player = getPlayer();
  if (!player) return;

  player.pause();
  player.src = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;
  player.load();
  player.play().catch((e) => console.error('Playback Error:', e));
};
