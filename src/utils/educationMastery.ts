import { subcategoryPhrases } from '../data/subcategories';
import { Language } from '../data/phrases';

const STORAGE_KEY = 'langaccess_education_mastery';

export interface EducationMasteryData {
  exploredPhrases: string[];
}

export function getExploredPhrases(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data: EducationMasteryData = JSON.parse(stored);
    return data.exploredPhrases || [];
  } catch (error) {
    console.error('Error reading education mastery data:', error);
    return [];
  }
}

export function addExploredPhrase(phraseId: string): void {
  try {
    const explored = getExploredPhrases();
    if (!explored.includes(phraseId)) {
      explored.push(phraseId);
      const data: EducationMasteryData = { exploredPhrases: explored };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error saving education mastery data:', error);
  }
}

export function getExploredCount(): number {
  return getExploredPhrases().length;
}

export function getTotalEducationPhrases(language: Language): number {
  const educationCategories = ['student-discipline', 'parent-outreach', 'teacher-support', 'special-needs'];
  let total = 0;

  for (const category of educationCategories) {
    const categoryData = subcategoryPhrases[category]?.[language];
    if (categoryData) {
      for (const group of categoryData) {
        total += group.phrases.length;
      }
    }
  }

  return total;
}

export function clearEducationMastery(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing education mastery data:', error);
  }
}
