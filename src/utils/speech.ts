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
           (langPrefix === 'fil' && (voiceLangPrefix === 'tl' || voiceLang.includes('tagalog') || voiceLang.includes('fil-ph') || voiceLang.includes('tl-ph'))) ||
           (langPrefix === 'tl' && (voiceLangPrefix === 'fil' || voiceLang.includes('filipino') || voiceLang.includes('fil-ph') || voiceLang.includes('tl-ph')));
  });

  if (matchingVoices.length === 0) {
    console.warn(`No ${langCode} voices found. Falling back to default system voice.`);
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
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

  // CRITICAL FIX: If we have a large voice list but no perfect match, force first Google or Female voice
  if (matchingVoices.length === 0 && voices.length > 100) {
    console.warn(`Large voice list (${voices.length}) but no ${langCode} match. Using fallback voice.`);
    const fallback = voices.find(v =>
      v.name.toLowerCase().includes('google') ||
      v.name.toLowerCase().includes('female')
    );
    return fallback || voices[0];
  }

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
      console.log('✅ Voices already loaded:', voices.length);
      voicesLoaded = true;
      resolve();
      return;
    }

    console.log('⏳ Waiting for voices to load...');
    let resolved = false;

    // Method 1: onvoiceschanged event
    window.speechSynthesis.onvoiceschanged = () => {
      if (!resolved) {
        const loadedVoices = window.speechSynthesis.getVoices();
        console.log('✅ Voices loaded via event:', loadedVoices.length);
        resolved = true;
        voicesLoaded = true;
        resolve();
      }
    };

    // Method 2: Polling every 500ms as fallback
    const pollInterval = setInterval(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !resolved) {
        console.log('✅ Voices loaded via polling:', voices.length);
        clearInterval(pollInterval);
        resolved = true;
        voicesLoaded = true;
        resolve();
      }
    }, 500);

    // Safety timeout after 5 seconds
    setTimeout(() => {
      if (!resolved) {
        const voices = window.speechSynthesis.getVoices();
        console.warn('⚠️ Voice loading timeout. Found:', voices.length);
        clearInterval(pollInterval);
        resolved = true;
        voicesLoaded = true;
        resolve();
      }
    }, 5000);

    // Trigger voice loading
    window.speechSynthesis.getVoices();
  });

  return voicesLoadPromise;
};

export const speakText = (text: string, language: Language): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      alert('Speech synthesis not supported in this browser');
      resolve(false);
      return;
    }

    try {
      await loadVoices();

      const voiceCount = window.speechSynthesis.getVoices().length;
      console.log(`🔊 DIAGNOSTIC: Voices found: ${voiceCount}`);
      alert(`Voices found: ${voiceCount}`);

      // CRITICAL FIX 1: Unlock audio context - cancel clears the queue
      console.log('🔓 Unlocking audio context with user interaction...');
      window.speechSynthesis.cancel();

      // CRITICAL FIX 2: Resume context multiple times
      window.speechSynthesis.resume();
      await new Promise(r => setTimeout(r, 50));

      // CRITICAL FIX 3: Empty string kickstart to wake up engine
      console.log('🎬 Triggering empty kickstart utterance...');
      const kickstart = new SpeechSynthesisUtterance('');
      kickstart.volume = 0.01;
      kickstart.rate = 1;
      kickstart.pitch = 1;
      window.speechSynthesis.speak(kickstart);
      await new Promise(r => setTimeout(r, 150));

      const langCode = getLanguageCode(language);
      const voice = findBestVoice(langCode);

      console.log('=== Speech Debug Info ===');
      console.log('Target language:', langCode);
      console.log('Selected voice:', voice?.name || 'system default');
      console.log('Voice language:', voice?.lang || 'auto');
      console.log('Total available voices:', voiceCount);
      console.log('Text length:', text.length, 'characters');

      const utterance = new SpeechSynthesisUtterance(text);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
        console.log('🎯 Using voice:', voice.name, voice.lang);
      } else {
        utterance.lang = langCode;
        console.log('⚠️ No voice selected, using default with lang:', langCode);
      }

      // CRITICAL FIX 4: Force volume and state reset
      utterance.rate = 0.45;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      let hasEnded = false;
      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
        console.log('✅ Audio Started - Speech playing successfully');
        console.log('🔊 Hardware speakers engaged');
      };

      utterance.onend = () => {
        if (!hasEnded) {
          hasEnded = true;
          console.log('✅ Speech ended normally');
          resolve(true);
        }
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        if (!hasEnded) {
          hasEnded = true;
          window.speechSynthesis.cancel();
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      };

      utterance.onpause = () => {
        console.log('⏸️ Speech paused, resuming...');
        window.speechSynthesis.resume();
      };

      // CRITICAL FIX 3: Resume again right before speak
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
      console.log('🎤 Speech command sent');

      // Resume after a short delay to handle Chrome suspension
      setTimeout(() => {
        window.speechSynthesis.resume();
      }, 100);

      setTimeout(() => {
        if (!hasStarted && !hasEnded) {
          console.warn('⚠️ Speech did not start within 3 seconds, forcing resume...');
          window.speechSynthesis.resume();
        }
      }, 3000);

      const maxDuration = Math.ceil(text.length / 10) * 1000 + 10000;
      setTimeout(() => {
        if (!hasEnded) {
          hasEnded = true;
          console.log('⏱️ Speech ended via safety timeout');
          window.speechSynthesis.cancel();
          resolve(true);
        }
      }, maxDuration);
    } catch (error) {
      console.error('❌ Speech error:', error);
      alert(`Speech error: ${error}`);
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

const initializeSpeechSynthesis = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    console.log('🔊 Initializing speech synthesis engine...');

    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    console.log(`📢 Found ${voices.length} voices on initial load`);

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        const loadedVoices = window.speechSynthesis.getVoices();
        console.log(`📢 Voices changed event: ${loadedVoices.length} voices now available`);

        console.log('\n=== Available Voices ===');
        loadedVoices.forEach((voice, index) => {
          console.log(`${index + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '[Local]' : '[Remote]'}`);
        });

        const tagalogVoices = loadedVoices.filter(v =>
          v.lang.toLowerCase().includes('fil') ||
          v.lang.toLowerCase().includes('tl') ||
          v.name.toLowerCase().includes('tagalog') ||
          v.name.toLowerCase().includes('filipino')
        );
        console.log(`\n🇵🇭 Tagalog/Filipino voices: ${tagalogVoices.length}`);
        tagalogVoices.forEach(v => console.log(`   - ${v.name} (${v.lang})`));
      };
    }

    const dummyUtterance = new SpeechSynthesisUtterance('');
    dummyUtterance.volume = 0;
    dummyUtterance.rate = 1;
    dummyUtterance.pitch = 1;

    window.speechSynthesis.speak(dummyUtterance);

    setTimeout(() => {
      window.speechSynthesis.cancel();
      console.log('✅ Speech engine wake-up complete');
    }, 100);
  }
};

if (typeof window !== 'undefined') {
  (window as any).debugVoices = debugVoices;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSpeechSynthesis);
  } else {
    initializeSpeechSynthesis();
  }

  window.addEventListener('click', () => {
    if (window.speechSynthesis.getVoices().length === 0) {
      initializeSpeechSynthesis();
    }
  }, { once: true });
}
