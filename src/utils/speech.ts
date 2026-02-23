import { Language } from '../data/phrases';

export const getLanguageCode = (lang: Language): string => {
  const codes: Record<Language, string> = {
    spanish: 'es-MX',
    tagalog: 'fil-PH',
    vietnamese: 'vi-VN',
    mandarin: 'zh-CN',
    cantonese: 'zh-HK'
  };
  return codes[lang];
};

export const speakText = (text: string, language: Language): boolean => {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langCode = getLanguageCode(language);
  utterance.lang = langCode;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
  return true;
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
