import { subcategoryPhrases } from '../data/subcategories';
import { Language } from '../data/phrases';

const STORAGE_KEY = 'langaccess_education_mastery';
const MILESTONES_KEY = 'langaccess_education_milestones';

export interface EducationMasteryData {
  exploredPhrases: string[];
}

export interface MilestoneDismissals {
  milestone10: boolean;
  milestone25: boolean;
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

export function getMilestoneDismissals(): MilestoneDismissals {
  try {
    const stored = localStorage.getItem(MILESTONES_KEY);
    if (!stored) return { milestone10: false, milestone25: false };
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading milestone dismissals:', error);
    return { milestone10: false, milestone25: false };
  }
}

export function dismissMilestone(milestone: 'milestone10' | 'milestone25'): void {
  try {
    const dismissals = getMilestoneDismissals();
    dismissals[milestone] = true;
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(dismissals));
  } catch (error) {
    console.error('Error saving milestone dismissal:', error);
  }
}

export function shouldShowMilestone(count: number): 'milestone10' | 'milestone25' | null {
  const dismissals = getMilestoneDismissals();

  if (count >= 25 && !dismissals.milestone25) {
    return 'milestone25';
  }

  if (count >= 10 && !dismissals.milestone10) {
    return 'milestone10';
  }

  return null;
}
