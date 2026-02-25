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

const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesCache = voices;
      voicesCacheReady = true;
      resolve(voices);
      return;
    }
    const handler = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        voicesCache = v;
        voicesCacheReady = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(v);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      const fallback = window.speechSynthesis.getVoices();
      voicesCache = fallback;
      voicesCacheReady = true;
      resolve(fallback);
    }, 1000);
  });
};

const scoreVoice = (voice: SpeechSynthesisVoice, langCode: string, langPrefix: string): number => {
  let s = 0;
  const n = voice.name.toLowerCase();
  const l = voice.lang.toLowerCase();

  if (n.includes('neural')) s += 150;
  if (n.includes('enhanced')) s += 130;
  if (n.includes('premium')) s += 110;
  if (n.includes('google') && !n.includes('compact')) s += 95;
  if (n.includes('microsoft') && !n.includes('compact')) s += 80;
  if (!voice.localService) s += 65;
  if (l === langCode.toLowerCase()) s += 50;
  else if (l.startsWith(langPrefix + '-')) s += 35;
  if (n.includes('compact')) s -= 120;
  if (n.includes('low quality') || n.includes('novelty')) s -= 100;

  return s;
};

const findBestVoice = (langCode: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (voices.length === 0) return null;

  const langPrefix = langCode.split('-')[0];

  const isMatch = (voice: SpeechSynthesisVoice) => {
    const v = voice.lang.toLowerCase();
    const vp = v.split('-')[0];
    return (
      v === langCode.toLowerCase() ||
      vp === langPrefix ||
      (langPrefix === 'fil' && (vp === 'tl' || v.includes('tagalog') || v.includes('filipino'))) ||
      (langPrefix === 'tl' && (vp === 'fil' || v.includes('tagalog') || v.includes('filipino')))
    );
  };

  const matches = voices.filter(isMatch);

  if (matches.length === 0) {
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  return matches.sort((a, b) => scoreVoice(b, langCode, langPrefix) - scoreVoice(a, langCode, langPrefix))[0];
};

const getLangSettings = (langCode: string): { rate: number; pitch: number } => {
  if (langCode === 'fil-PH' || langCode === 'tl-PH') return { rate: 0.78, pitch: 1.0 };
  if (langCode === 'zh-CN') return { rate: 0.82, pitch: 1.05 };
  if (langCode === 'zh-HK') return { rate: 0.82, pitch: 1.05 };
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

  await new Promise<void>((resolve) => setTimeout(resolve, 120));

  if (myId !== activeSpeakId) return;

  const voices = voicesCacheReady ? voicesCache : await initVoices();

  if (myId !== activeSpeakId) return;

  const langCode = getLanguageCode(language);
  const { rate, pitch } = getLangSettings(langCode);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1.0;

  const voice = findBestVoice(langCode, voices);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = langCode === 'fil-PH' ? 'tl-PH' : langCode;
  }

  utterance.onpause = () => {
    if (myId === activeSpeakId) window.speechSynthesis.resume();
  };

  window.speechSynthesis.speak(utterance);
};

export const isSpeechSupported = (): boolean => 'speechSynthesis' in window;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
}
