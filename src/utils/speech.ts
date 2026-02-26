import { Language } from '../data/phrases';

const LANG_CODES: Record<Language, string> = {
  spanish: 'es',
  tagalog: 'fil',
  vietnamese: 'vi',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
};

const LANG_FALLBACKS: Record<Language, string[]> = {
  spanish: ['es-ES', 'es-MX', 'es-US', 'es'],
  tagalog: ['fil-PH', 'fil', 'tl-PH', 'tl'],
  vietnamese: ['vi-VN', 'vi'],
  mandarin: ['zh-CN', 'zh-Hans-CN', 'zh'],
  cantonese: ['zh-HK', 'zh-Yue', 'zh-TW', 'zh'],
};

let voiceCache: SpeechSynthesisVoice[] = [];
let voiceCacheReady = false;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (voiceCacheReady && voiceCache.length > 0) {
      resolve(voiceCache);
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      voiceCache = voices;
      voiceCacheReady = true;
      resolve(voices);
      return;
    }

    const handler = () => {
      voiceCache = speechSynthesis.getVoices();
      voiceCacheReady = true;
      speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(voiceCache);
    };
    speechSynthesis.addEventListener('voiceschanged', handler);

    setTimeout(() => {
      if (!voiceCacheReady) {
        voiceCache = speechSynthesis.getVoices();
        voiceCacheReady = true;
        resolve(voiceCache);
      }
    }, 2000);
  });
}

function isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  const femaleKeywords = [
    'female', 'woman', 'girl',
    'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona',
    'alice', 'amelie', 'anna', 'carmit', 'damayanti', 'ellen',
    'ioana', 'joana', 'kanya', 'kyoko', 'laura', 'lekha', 'luciana',
    'mariska', 'mei-jia', 'melina', 'milena', 'monica', 'nora',
    'paulina', 'sara', 'satu', 'sin-ji', 'taini', 'tian-tian',
    'ting-ting', 'veena', 'xiu-ying', 'yelda', 'yuna', 'yuri',
    'zosia', 'zuzana',
  ];
  return femaleKeywords.some((kw) => name.includes(kw));
}

function scoreVoice(voice: SpeechSynthesisVoice, langCode: string): number {
  let score = 0;
  const name = voice.name.toLowerCase();

  if (voice.lang.toLowerCase() === langCode.toLowerCase()) score += 100;
  else if (voice.lang.toLowerCase().startsWith(langCode.toLowerCase().split('-')[0])) score += 50;

  if (isFemaleVoice(voice)) score += 40;

  if (!voice.localService) score += 20;

  const premiumKeywords = ['enhanced', 'premium', 'neural', 'natural', 'siri', 'google'];
  if (premiumKeywords.some((kw) => name.includes(kw))) score += 15;

  return score;
}

function pickVoice(voices: SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice | null {
  const fallbacks = LANG_FALLBACKS[language];
  const primary = LANG_CODES[language];
  const allCodes = [primary, ...fallbacks];

  const candidates = voices.filter((v) =>
    allCodes.some(
      (code) =>
        v.lang.toLowerCase() === code.toLowerCase() ||
        v.lang.toLowerCase().startsWith(code.toLowerCase().split('-')[0])
    )
  );

  if (candidates.length === 0) return null;

  const sorted = [...candidates].sort((a, b) => scoreVoice(b, primary) - scoreVoice(a, primary));
  return sorted[0];
}

export async function playAudio(text: string, language: Language): Promise<void> {
  if (!('speechSynthesis' in window)) {
    console.error('Web Speech API not supported in this browser.');
    return;
  }

  speechSynthesis.cancel();

  const voices = await loadVoices();
  const voice = pickVoice(voices, language);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? LANG_CODES[language];
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  utterance.onerror = (e) => {
    if (e.error !== 'interrupted') {
      console.error('Speech synthesis error:', e.error);
    }
  };

  speechSynthesis.speak(utterance);
}

export const initAudioUnlock = (): void => {
  if ('speechSynthesis' in window) {
    loadVoices();
  }
};
