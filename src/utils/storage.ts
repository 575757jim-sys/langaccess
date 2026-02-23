import { CustomPhrase } from '../data/phrases';

const STORAGE_KEY = 'langaccess_custom_phrases';

export const loadCustomPhrases = (): CustomPhrase[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom phrases:', error);
    return [];
  }
};

export const saveCustomPhrases = (phrases: CustomPhrase[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
  } catch (error) {
    console.error('Error saving custom phrases:', error);
  }
};

export const addCustomPhrase = (phrase: Omit<CustomPhrase, 'id' | 'createdAt'>): CustomPhrase => {
  const phrases = loadCustomPhrases();
  const newPhrase: CustomPhrase = {
    ...phrase,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  phrases.push(newPhrase);
  saveCustomPhrases(phrases);
  return newPhrase;
};

export const deleteCustomPhrase = (id: string): void => {
  const phrases = loadCustomPhrases();
  const filtered = phrases.filter(p => p.id !== id);
  saveCustomPhrases(filtered);
};
