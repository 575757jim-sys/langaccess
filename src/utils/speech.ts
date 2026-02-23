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

  const matchingVoices = voices.filter(voice => {
    const voiceLang = voice.lang.toLowerCase();
    const voiceLangPrefix = voiceLang.split('-')[0];

    return voiceLang === langCode.toLowerCase() ||
           voiceLang.startsWith(langPrefix + '-') ||
           voiceLangPrefix === langPrefix ||
           (langPrefix === 'fil' && (voiceLangPrefix === 'tl' || voiceLang.includes('tagalog'))) ||
           (langPrefix === 'tl' && (voiceLangPrefix === 'fil' || voiceLang.includes('filipino')));
  });

  if (matchingVoices.length === 0) return null;

  const qualityScore = (voice: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();

    if (name.includes('enhanced') || name.includes('premium') || name.includes('neural')) score += 120;

    if (langPrefix === 'es') {
      if (name.includes('paulina')) score += 95;
      else if (name.includes('mónica') || name.includes('monica')) score += 90;
      else if (name.includes('diego')) score += 90;
      else if (name.includes('juan')) score += 85;
      else if (name.includes('spanish female') || name.includes('spanish male')) score += 80;
    }

    if (langPrefix === 'fil' || langPrefix === 'tl') {
      if (name.includes('amelie') || name.includes('amélie')) score += 95;
      if (name.includes('rosa')) score += 90;
      else if (name.includes('filipino female') || name.includes('tagalog female')) score += 85;
      else if (name.includes('female')) score += 80;

      if (name.includes('compact') || name.includes('premium')) score -= 100;
    }

    if (langPrefix === 'vi') {
      if (name.includes('linh')) score += 95;
      else if (name.includes('vietnamese female') || name.includes('vietnamese male')) score += 85;
    }

    if (langPrefix === 'zh') {
      if (name.includes('ting-ting') || name.includes('meijia')) score += 95;
      else if (name.includes('sin-ji') || name.includes('sinji')) score += 90;
      else if (name.includes('chinese female') || name.includes('chinese male')) score += 85;
    }

    if (name.includes('google') && !name.includes('compact')) score += 85;
    if (name.includes('microsoft') && !name.includes('compact')) score += 70;
    if (name.includes('apple')) score += 75;
    if (name.includes('samantha')) score += 75;

    if (!voice.localService) score += 60;

    if (lang === langCode.toLowerCase()) score += 50;
    else if (lang.startsWith(langPrefix + '-')) score += 40;

    if (name.includes('compact')) score -= 100;
    if (name.includes('low') || name.includes('novelty')) score -= 80;
    if (name.includes('premium') && (langPrefix === 'fil' || langPrefix === 'tl')) score -= 100;

    return score;
  };

  matchingVoices.sort((a, b) => qualityScore(b) - qualityScore(a));

  return matchingVoices[0];
};

let voicesLoaded = false;
let voicesLoadPromise: Promise<void> | null = null;

const loadVoices = (): Promise<void> => {
  if (voicesLoaded) {
    return Promise.resolve();
  }

  if (voicesLoadPromise) {
    return voicesLoadPromise;
  }

  voicesLoadPromise = new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve();
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        voicesLoaded = true;
        resolve();
      }
    }, 2000);

    window.speechSynthesis.onvoiceschanged = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        voicesLoaded = true;
        resolve();
      }
    };

    window.speechSynthesis.getVoices();
  });

  return voicesLoadPromise;
};

export const speakText = (text: string, language: Language): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      await loadVoices();

      window.speechSynthesis.cancel();

      await new Promise(r => setTimeout(r, 50));

      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = getLanguageCode(language);

      const voice = findBestVoice(langCode);
      if (voice) {
        utterance.voice = voice;
        console.log('Using voice:', voice.name, voice.lang);
      } else {
        console.warn('No voice found for:', langCode);
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

      utterance.onstart = () => {
        console.log('Speech started');
      };

      window.speechSynthesis.speak(utterance);

      await new Promise(r => setTimeout(r, 100));

      if (!window.speechSynthesis.speaking && !hasEnded) {
        hasEnded = true;
        resolve(true);
      }
    } catch (error) {
      console.error('Speech error:', error);
      resolve(false);
    }
  });
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
