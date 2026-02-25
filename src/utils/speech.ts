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

const findBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
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
  if (matches.length === 0) return null;

  const score = (voice: SpeechSynthesisVoice): number => {
    let s = 0;
    const n = voice.name.toLowerCase();
    const l = voice.lang.toLowerCase();
    if (n.includes('neural')) s += 150;
    if (n.includes('enhanced')) s += 130;
    if (n.includes('google') && !n.includes('compact')) s += 100;
    if (n.includes('microsoft') && !n.includes('compact')) s += 80;
    if (!voice.localService) s += 70;
    if (l === langCode.toLowerCase()) s += 50;
    else if (l.startsWith(langPrefix + '-')) s += 40;
    if (n.includes('premium')) s += 60;
    if (n.includes('compact')) s -= 120;
    if (n.includes('low') || n.includes('novelty')) s -= 100;
    if (voice.localService && !n.includes('enhanced') && !n.includes('neural')) s -= 30;
    return s;
  };

  return matches.sort((a, b) => score(b) - score(a))[0];
};

const getLangSettings = (langCode: string): { rate: number; pitch: number } => {
  if (langCode === 'fil-PH' || langCode === 'tl-PH') return { rate: 0.45, pitch: 0.9 };
  if (langCode === 'zh-CN') return { rate: 0.85, pitch: 1.05 };
  return { rate: 0.9, pitch: 1.0 };
};

export const speakText = (text: string, language: Language): void => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const langCode = getLanguageCode(language);
  const utterance = new SpeechSynthesisUtterance(text);
  const { rate, pitch } = getLangSettings(langCode);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1.0;

  let hasSpoken = false;

  const applyVoiceAndSpeak = () => {
    if (hasSpoken) return;
    hasSpoken = true;

    const voice = findBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = langCode === 'fil-PH' ? 'tl-PH' : langCode;
    }
    utterance.onpause = () => window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    applyVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      applyVoiceAndSpeak();
    };
    window.speechSynthesis.getVoices();
    setTimeout(() => {
      if (!hasSpoken) applyVoiceAndSpeak();
    }, 500);
  }
};

export const isSpeechSupported = (): boolean => 'speechSynthesis' in window;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}
