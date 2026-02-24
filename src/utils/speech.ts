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
    return (
      voiceLang === langCode.toLowerCase() ||
      voiceLang.startsWith(langPrefix + '-') ||
      voiceLangPrefix === langPrefix ||
      (langPrefix === 'fil' && (voiceLangPrefix === 'tl' || voiceLang.includes('tagalog') || voiceLang.includes('fil-ph') || voiceLang.includes('tl-ph'))) ||
      (langPrefix === 'tl' && (voiceLangPrefix === 'fil' || voiceLang.includes('filipino') || voiceLang.includes('fil-ph') || voiceLang.includes('tl-ph')))
    );
  });

  if (matchingVoices.length === 0) {
    return voices.length > 0 ? voices[0] : null;
  }

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
    }
    if (langPrefix === 'fil' || langPrefix === 'tl') {
      if (name.includes('google')) score += 150;
      if (name.includes('amelie') || name.includes('amélie')) score += 100;
      else if (name.includes('rosa')) score += 95;
      else if (name.includes('female')) score += 70;
      if (name.includes('compact')) score -= 200;
    }
    if (langPrefix === 'vi') {
      if (name.includes('linh')) score += 95;
    }
    if (langPrefix === 'zh') {
      if (name.includes('ting-ting') || name.includes('meijia')) score += 95;
      else if (name.includes('sin-ji') || name.includes('sinji')) score += 90;
    }
    if (name.includes('google') && !name.includes('compact')) score += 85;
    if (name.includes('microsoft') && !name.includes('compact')) score += 70;
    if (name.includes('apple')) score += 75;
    if (!voice.localService) score += 60;
    if (lang === langCode.toLowerCase()) score += 50;
    else if (lang.startsWith(langPrefix + '-')) score += 40;
    if (name.includes('compact')) score -= 100;
    if (name.includes('low') || name.includes('novelty')) score -= 80;

    return score;
  };

  matchingVoices.sort((a, b) => qualityScore(b) - qualityScore(a));
  return matchingVoices[0];
};

const loadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }

    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        clearInterval(poll);
        resolve();
      }
    };

    window.speechSynthesis.onvoiceschanged = done;
    const poll = setInterval(() => {
      if (window.speechSynthesis.getVoices().length > 0) done();
    }, 100);

    setTimeout(done, 3000);
  });
};

export const speakText = (text: string, language: Language): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      await loadVoices();

      const langCode = getLanguageCode(language);
      const voice = findBestVoice(langCode);

      const utterance = new SpeechSynthesisUtterance(text);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = langCode === 'fil-PH' ? 'tl-PH' : (langCode || 'en-US');
      }

      utterance.rate = 0.45;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      let hasEnded = false;

      utterance.onend = () => {
        if (!hasEnded) {
          hasEnded = true;
          resolve(true);
        }
      };

      utterance.onerror = (event) => {
        if (!hasEnded) {
          hasEnded = true;
          window.speechSynthesis.cancel();
          resolve(event.error === 'interrupted' || event.error === 'canceled');
        }
      };

      utterance.onpause = () => {
        window.speechSynthesis.resume();
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);

      const maxDuration = Math.ceil(text.length / 10) * 1000 + 10000;
      setTimeout(() => {
        if (!hasEnded) {
          hasEnded = true;
          window.speechSynthesis.cancel();
          resolve(true);
        }
      }, maxDuration);
    } catch {
      resolve(false);
    }
  });
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

export const debugVoices = async (): Promise<void> => {
  await loadVoices();
  const voices = window.speechSynthesis.getVoices();
  console.log('Total voices:', voices.length);
  voices.forEach(v => console.log(`${v.name} (${v.lang})`));
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
