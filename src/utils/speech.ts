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
      if (name.includes('google')) score += 150;

      if (name.includes('amelie') || name.includes('amélie')) score += 100;
      else if (name.includes('rosa')) score += 95;
      else if (name.includes('siri')) score += 90;
      else if (name.includes('filipino') || name.includes('tagalog')) score += 85;
      else if (name.includes('female')) score += 70;

      if (name.includes('quality') || name.includes('enhanced')) score += 60;
      if (name.includes('compact')) score -= 200;
      if (name.includes('premium') && name.includes('compact')) score -= 150;
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
      console.error('Speech synthesis not supported');
      resolve(false);
      return;
    }

    try {
      await loadVoices();

      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        await new Promise(r => setTimeout(r, 100));
      }

      const langCode = getLanguageCode(language);
      const voice = findBestVoice(langCode);

      console.log('Selected voice:', voice?.name || 'default', 'for language:', langCode);
      console.log('Available voices:', window.speechSynthesis.getVoices().length);

      const utterance = new SpeechSynthesisUtterance(text);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = langCode;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      let hasEnded = false;
      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
        console.log('Speech started');
      };

      utterance.onend = () => {
        if (!hasEnded) {
          hasEnded = true;
          console.log('Speech ended normally');
          resolve(true);
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (!hasEnded) {
          hasEnded = true;
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      };

      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        if (!hasStarted && !hasEnded) {
          console.warn('Speech did not start within 3 seconds, resuming...');
          window.speechSynthesis.resume();
        }
      }, 3000);

      setTimeout(() => {
        if (!hasEnded && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          hasEnded = true;
          console.log('Speech ended via timeout');
          resolve(true);
        }
      }, 500);
    } catch (error) {
      console.error('Speech error:', error);
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

  console.log('=== Available Voices ===');
  console.log('Total voices:', voices.length);

  const groupedByLang: Record<string, SpeechSynthesisVoice[]> = {};
  voices.forEach(voice => {
    const lang = voice.lang.split('-')[0];
    if (!groupedByLang[lang]) groupedByLang[lang] = [];
    groupedByLang[lang].push(voice);
  });

  Object.keys(groupedByLang).sort().forEach(lang => {
    console.log(`\n${lang.toUpperCase()}:`);
    groupedByLang[lang].forEach(voice => {
      console.log(`  - ${voice.name} (${voice.lang}) ${voice.localService ? '[local]' : '[remote]'}`);
    });
  });

  console.log('\n=== Tagalog/Filipino Voices ===');
  const tagalogVoices = voices.filter(v =>
    v.lang.toLowerCase().includes('fil') ||
    v.lang.toLowerCase().includes('tl') ||
    v.name.toLowerCase().includes('tagalog') ||
    v.name.toLowerCase().includes('filipino')
  );

  if (tagalogVoices.length === 0) {
    console.warn('No Tagalog/Filipino voices found!');
  } else {
    tagalogVoices.forEach(voice => {
      console.log(`  - ${voice.name} (${voice.lang})`);
    });
  }
};

if (typeof window !== 'undefined') {
  (window as any).debugVoices = debugVoices;
}
