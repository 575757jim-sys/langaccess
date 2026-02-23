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
  const langPrefix = langCode.split('-')[0];

  const matchingVoices = voices.filter(voice =>
    voice.lang === langCode ||
    voice.lang.startsWith(langPrefix + '-') ||
    voice.lang.toLowerCase().includes(langPrefix.toLowerCase())
  );

  if (matchingVoices.length === 0) return null;

  const qualityScore = (voice: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();

    if (name.includes('enhanced') || name.includes('premium')) score += 100;

    if (langPrefix === 'es' && name.includes('paulina')) score += 90;
    if (langPrefix === 'zh' && (name.includes('ting-ting') || name.includes('meijia'))) score += 90;
    if (langPrefix === 'vi' && name.includes('linh')) score += 90;
    if (langPrefix === 'fil' && name.includes('rosa')) score += 90;

    if (name.includes('samantha')) score += 80;
    if (name.includes('google')) score += 70;
    if (name.includes('microsoft')) score += 60;

    if (voice.localService) score += 50;

    if (lang === langCode) score += 40;
    else if (lang.startsWith(langPrefix + '-')) score += 30;

    if (name.includes('compact') || name.includes('low') || name.includes('novelty')) score -= 30;

    return score;
  };

  matchingVoices.sort((a, b) => qualityScore(b) - qualityScore(a));

  return matchingVoices[0];
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
