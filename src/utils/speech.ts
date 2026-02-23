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

    if (langPrefix === 'es') {
      if (name.includes('paulina')) score += 90;
      else if (name.includes('mónica') || name.includes('monica')) score += 85;
      else if (name.includes('diego')) score += 85;
      else if (name.includes('spanish female') || name.includes('spanish male')) score += 80;
    }

    if (langPrefix === 'fil' || langPrefix === 'tl') {
      if (name.includes('rosa')) score += 90;
      else if (name.includes('filipino female') || name.includes('tagalog female')) score += 80;
    }

    if (langPrefix === 'vi') {
      if (name.includes('linh')) score += 90;
      else if (name.includes('vietnamese female') || name.includes('vietnamese male')) score += 80;
    }

    if (langPrefix === 'zh') {
      if (name.includes('ting-ting') || name.includes('meijia')) score += 90;
      else if (name.includes('sin-ji') || name.includes('sinji')) score += 85;
      else if (name.includes('chinese female') || name.includes('chinese male')) score += 80;
    }

    if (name.includes('google')) score += 75;
    if (name.includes('microsoft')) score += 65;
    if (name.includes('samantha')) score += 70;

    if (voice.localService) score += 50;

    if (lang === langCode) score += 40;
    else if (lang.startsWith(langPrefix + '-')) score += 30;

    if (name.includes('compact') || name.includes('low') || name.includes('novelty')) score -= 50;

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

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = getLanguageCode(language);

        const voice = findBestVoice(langCode);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.lang = langCode;
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        let hasEnded = false;

        utterance.onend = () => {
          if (!hasEnded) {
            hasEnded = true;
            resolve(true);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          if (!hasEnded) {
            hasEnded = true;
            resolve(false);
          }
        };

        window.speechSynthesis.speak(utterance);

        setTimeout(() => {
          if (!hasEnded) {
            hasEnded = true;
            resolve(true);
          }
        }, 100);
      }, 100);
    };

    const initVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speak();
        return true;
      }
      return false;
    };

    if (!initVoices()) {
      let attempts = 0;
      const maxAttempts = 10;

      const checkVoices = setInterval(() => {
        attempts++;
        if (initVoices() || attempts >= maxAttempts) {
          clearInterval(checkVoices);
          if (attempts >= maxAttempts) {
            speak();
          }
        }
      }, 100);

      window.speechSynthesis.onvoiceschanged = () => {
        if (initVoices()) {
          clearInterval(checkVoices);
        }
      };
    }
  });
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
