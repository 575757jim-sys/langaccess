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
    setTimeout(() => done(window.speechSynthesis.getVoices()), 2000);
  });
  return initPromise;
};

const MANDARIN_FEMALE_NAMES = [
  'ting-ting', 'tingting', 'mei-jia', 'meijia', 'xiao yan', 'xiaoyan',
  'ya yao', 'yaoyao', 'han han', 'hanhan', 'ya ting', 'yating',
  'hui hui', 'huihui', 'liu shu', 'liushu', 'li-na', 'lina',
  'google 普通话（中国大陆）', 'google 国语（台湾）',
  'sin-ji', 'sinji', 'google 粤語（香港）'
];

const CANTONESE_FEMALE_NAMES = [
  'sin-ji', 'sinji', 'sin ji',
  'google 粤語（香港）', 'google 粤语',
  'tracy', 'fiona'
];

const FEMALE_GENERIC = [
  'female', 'woman', 'femenina',
  'samantha', 'victoria', 'karen', 'kate', 'moira', 'tessa', 'fiona',
  'allison', 'ava', 'alice', 'sara', 'anna', 'nora', 'laura',
  'amelie', 'monica', 'paulina', 'yuna', 'kyoko', 'mizuki'
];

const MALE_HINTS = [
  'male', 'man', 'daniel', 'fred', 'jorge', 'juan',
  'lee', 'oliver', 'rishi', 'thomas', 'tom', 'alex', 'gordon', 'luca'
];

const scoreVoice = (voice: SpeechSynthesisVoice, exactLang: string, lang: Language): number => {
  let s = 0;
  const n = voice.name.toLowerCase();
  const l = voice.lang.toLowerCase();

  if (n.includes('neural')) s += 200;
  if (n.includes('enhanced')) s += 180;
  if (n.includes('premium')) s += 160;
  if (n.includes('google') && !n.includes('compact')) s += 120;
  if (n.includes('microsoft') && !n.includes('compact')) s += 100;
  if (!voice.localService) s += 70;

  if (l === exactLang.toLowerCase()) s += 100;

  const femaleList = lang === 'mandarin' ? MANDARIN_FEMALE_NAMES
    : lang === 'cantonese' ? CANTONESE_FEMALE_NAMES
    : FEMALE_GENERIC;

  if (femaleList.some(h => n.includes(h))) s += 80;
  else if (FEMALE_GENERIC.some(h => n.includes(h))) s += 40;

  if (MALE_HINTS.some(h => n === h || n.includes(` ${h}`) || n.startsWith(`${h} `))) s -= 60;

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
      const n = v.name.toLowerCase();
      return l === 'zh-cn' || l === 'zh_cn' || l === 'cmn-hans-cn' || l === 'cmn'
        || n.includes('普通话') || n.includes('国语') || n.includes('mandarin');
    });
    if (candidates.length === 0) {
      candidates = voices.filter(v => {
        const l = v.lang.toLowerCase();
        return l.startsWith('zh') && !v.name.toLowerCase().includes('cantonese')
          && !v.name.toLowerCase().includes('粤') && !v.name.toLowerCase().includes('sin-ji')
          && l !== 'zh-hk' && l !== 'yue-hk';
      });
    }
  } else if (lang === 'cantonese') {
    candidates = voices.filter(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l === 'zh-hk' || l === 'yue-hk' || l === 'zh_hk'
        || n.includes('cantonese') || n.includes('粤語') || n.includes('粤语')
        || n.includes('sin-ji') || n.includes('sinji') || n.includes('hong kong');
    });
    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.toLowerCase() === 'zh-hk');
    }
    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.toLowerCase().startsWith('zh'));
    }
  } else if (lang === 'tagalog') {
    candidates = voices.filter(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.startsWith('fil') || l.startsWith('tl')
        || n.includes('tagalog') || n.includes('filipino');
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
  return candidates.sort((a, b) => scoreVoice(b, exactCode, lang) - scoreVoice(a, exactCode, lang))[0];
};

const getLangSettings = (langCode: string): { rate: number; pitch: number } => {
  if (langCode === 'fil-PH' || langCode === 'tl-PH') return { rate: 0.78, pitch: 1.0 };
  if (langCode === 'zh-CN') return { rate: 0.75, pitch: 1.0 };
  if (langCode === 'zh-HK') return { rate: 0.75, pitch: 1.0 };
  if (langCode === 'vi-VN') return { rate: 0.80, pitch: 1.0 };
  if (langCode === 'es-US') return { rate: 0.88, pitch: 1.0 };
  return { rate: 0.85, pitch: 1.0 };
};

let activeSpeakId = 0;
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

const stopKeepAlive = () => {
  if (keepAliveInterval !== null) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};

const startKeepAlive = () => {
  stopKeepAlive();
  keepAliveInterval = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      stopKeepAlive();
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, 5000);
};

export const speakText = async (text: string, language: Language): Promise<void> => {
  if (!('speechSynthesis' in window)) return;

  activeSpeakId += 1;
  const myId = activeSpeakId;

  stopKeepAlive();
  window.speechSynthesis.cancel();

  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  if (myId !== activeSpeakId) return;

  const voices = voicesCacheReady ? voicesCache : await initVoices();
  if (myId !== activeSpeakId) return;

  const langCode = getLanguageCode(language);
  const { rate, pitch } = getLangSettings(langCode);
  const voice = findBestVoice(language, voices);

  const makeUtterance = (t: string): SpeechSynthesisUtterance => {
    const u = new SpeechSynthesisUtterance(t);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1.0;
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = langCode;
    }
    return u;
  };

  const isChinese = language === 'mandarin' || language === 'cantonese';

  if (isChinese && text.length > 20) {
    const chunks = text.match(/[^，。！？,!?.]+[，。！？,!?.？]?/g) || [text];
    const validChunks = chunks.map(c => c.trim()).filter(c => c.length > 0);

    let chunkIndex = 0;
    const speakNext = () => {
      if (myId !== activeSpeakId || chunkIndex >= validChunks.length) {
        stopKeepAlive();
        return;
      }
      const u = makeUtterance(validChunks[chunkIndex]);
      u.onend = () => {
        if (myId !== activeSpeakId) return;
        chunkIndex++;
        speakNext();
      };
      u.onerror = () => stopKeepAlive();
      window.speechSynthesis.speak(u);
    };

    startKeepAlive();
    speakNext();
  } else {
    const u = makeUtterance(text);
    u.onend = () => stopKeepAlive();
    u.onerror = () => stopKeepAlive();
    startKeepAlive();
    window.speechSynthesis.speak(u);
  }
};

export const isSpeechSupported = (): boolean => 'speechSynthesis' in window;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
}
