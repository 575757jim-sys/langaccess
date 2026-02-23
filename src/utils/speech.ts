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

const findBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();

  const exactMatch = voices.find(voice => voice.lang === langCode);
  if (exactMatch) return exactMatch;

  const langPrefix = langCode.split('-')[0];
  const langMatch = voices.find(voice => voice.lang.startsWith(langPrefix));
  if (langMatch) return langMatch;

  const alternateMatch = voices.find(voice =>
    voice.lang.toLowerCase().includes(langPrefix.toLowerCase())
  );
  if (alternateMatch) return alternateMatch;

  return null;
};

export const speakText = (text: string, language: Language): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    const speak = () => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = getLanguageCode(language);

      const voice = findBestVoice(langCode);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = langCode;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
      resolve(true);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
      };
    }
  });
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
