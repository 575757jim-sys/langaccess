import { Language } from '../data/phrases';

export const getLanguageCode = (lang: Language): string => {
  const codes: Record<Language, string> = {
    spanish: 'es-US',
    tagalog: 'fil-PH',
    vietnamese: 'vi-VN',
    mandarin: 'zh-CN',
    cantonese: 'zh-HK'
  };
  return codes[lang];
};

let voicesCache: SpeechSynthesisVoice[] = [];
let voicesCacheReady = false;
let initPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (initPromise) return initPromise;
  initPromise = new Promise((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      voicesCache = immediate;
      voicesCacheReady = true;
      resolve(immediate);
      return;
    }
    let resolved = false;
    const done = (voices: SpeechSynthesisVoice[]) => {
      if (resolved) return;
      resolved = true;
      voicesCache = voices;
      voicesCacheReady = true;
      resolve(voices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', function handler() {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        done(v);
      }
    });
    setTimeout(() => done(window.speechSynthesis.getVoices()), 1500);
  });
  return initPromise;
};

const FEMALE_HINTS = ['female', 'woman', 'femenina', 'sinji', 'tingting', 'meijia',
  'xiaoyan', 'yaoyao', 'hanhan', 'yating', 'huihui', 'liushu', 'tracy',
  'sin-ji', 'sin ji', 'mei jia', 'xiao yan', 'ya yao', 'han han', 'ya ting',
  'hui hui', 'liu shu', 'google 普通话', 'google 粤语',
  'alice', 'allison', 'amelie', 'anna', 'carmit', 'damayanti', 'ellen',
  'fiona', 'joana', 'karen', 'kate', 'katya', 'kiyomi', 'kanya', 'laura',
  'lekha', 'luca', 'luciana', 'marie', 'mariska', 'mei-jia', 'milena',
  'moira', 'monica', 'nora', 'paulina', 'samantha', 'sara', 'satu',
  'sin-ji', 'tessa', 'ting-ting', 'veena', 'victoria', 'yuna', 'zosia',
  'zuzana', 'kyoko', 'mizuki', 'sora', 'yuna'];

const MALE_HINTS = ['male', 'man', 'masculino', 'daniel', 'alex', 'fred', 'jorge',
  'juan', 'lee', 'luca', 'oliver', 'rishi', 'thomas', 'tom', 'yannick'];

const scoreVoice = (voice: SpeechSynthesisVoice, exactLang: string): number => {
  let s = 0;
  const n = voice.name.toLowerCase();
  const l = voice.lang.toLowerCase();

  if (n.includes('neural')) s += 200;
  if (n.includes('enhanced')) s += 180;
  if (n.includes('premium')) s += 160;
  if (n.includes('google') && !n.includes('compact')) s += 120;
  if (n.includes('microsoft') && !n.includes('compact')) s += 100;
  if (!voice.localService) s += 70;

  if (l === exactLang.toLowerCase()) s += 80;

  if (FEMALE_HINTS.some(h => n.includes(h))) s += 50;
  if (MALE_HINTS.some(h => n.includes(h))) s -= 30;

  if (n.includes('compact')) s -= 150;
  if (n.includes('low quality') || n.includes('novelty')) s -= 120;

  return s;
};

const findBestVoice = (lang: Language, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (voices.length === 0) return null;

  let candidates: SpeechSynthesisVoice[];

  if (lang === 'mandarin') {
    candidates = voices.filter(v => {
      const l = v.lang.toLowerCase();
      return l === 'zh-cn' || l === 'zh_cn' || l === 'cmn-hans-cn' || l === 'cmn';
    });
    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.toLowerCase().startsWith('zh'));
    }
  } else if (lang === 'cantonese') {
    candidates = voices.filter(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l === 'zh-hk' || l === 'yue-hk' || l === 'zh_hk' ||
        n.includes('cantonese') || n.includes('yue') || n.includes('粤') ||
        n.includes('sin-ji') || n.includes('sinji');
    });
    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.toLowerCase().startsWith('zh'));
    }
  } else if (lang === 'tagalog') {
    candidates = voices.filter(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.startsWith('fil') || l.startsWith('tl') ||
        n.includes('tagalog') || n.includes('filipino');
    });
  } else if (lang === 'vietnamese') {
    candidates = voices.filter(v => v.lang.toLowerCase().startsWith('vi'));
  } else if (lang === 'spanish') {
    candidates = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
  } else {
    candidates = voices;
  }

  if (candidates.length === 0) {
    return voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];
  }

  const exactCode = getLanguageCode(lang);
  return candidates.sort((a, b) => scoreVoice(b, exactCode) - scoreVoice(a, exactCode))[0];
};

const getLangSettings = (langCode: string): { rate: number; pitch: number } => {
  if (langCode === 'fil-PH' || langCode === 'tl-PH') return { rate: 0.78, pitch: 1.0 };
  if (langCode === 'zh-CN') return { rate: 0.80, pitch: 1.0 };
  if (langCode === 'zh-HK') return { rate: 0.80, pitch: 1.0 };
  if (langCode === 'vi-VN') return { rate: 0.80, pitch: 1.0 };
  if (langCode === 'es-US') return { rate: 0.88, pitch: 1.0 };
  return { rate: 0.85, pitch: 1.0 };
};

let activeSpeakId = 0;

export const speakText = async (text: string, language: Language): Promise<void> => {
  if (!('speechSynthesis' in window)) return;

  activeSpeakId += 1;
  const myId = activeSpeakId;

  window.speechSynthesis.cancel();

  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  if (myId !== activeSpeakId) return;

  const voices = voicesCacheReady ? voicesCache : await initVoices();
  if (myId !== activeSpeakId) return;

  const langCode = getLanguageCode(language);
  const { rate, pitch } = getLangSettings(langCode);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1.0;

  const voice = findBestVoice(language, voices);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = langCode;
  }

  window.speechSynthesis.speak(utterance);
};

export const isSpeechSupported = (): boolean => 'speechSynthesis' in window;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
}
