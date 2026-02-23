import { CustomPhrase, Language, Sector } from '../data/phrases';
import { Subcategory } from '../data/subcategories';
import { supabase } from '../lib/supabase';

export const loadCustomPhrases = async (
  language: Language,
  sector: Sector,
  subcategory: Subcategory
): Promise<CustomPhrase[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('custom_phrases')
      .select('*')
      .eq('language', language)
      .eq('sector', sector)
      .eq('subcategory', subcategory)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading custom phrases:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      english: row.english,
      translation: row.translation,
      language: row.language as Language,
      sector: row.sector as Sector,
      subcategory: row.subcategory as Subcategory,
      createdAt: new Date(row.created_at).getTime(),
    }));
  } catch (error) {
    console.error('Error loading custom phrases:', error);
    return [];
  }
};

export const addCustomPhrase = async (
  phrase: Omit<CustomPhrase, 'id' | 'createdAt'>
): Promise<CustomPhrase | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('custom_phrases')
      .insert({
        english: phrase.english,
        translation: phrase.translation,
        language: phrase.language,
        sector: phrase.sector,
        subcategory: phrase.subcategory,
      })
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error('Error adding custom phrase:', error);
      return null;
    }

    return {
      id: data.id,
      english: data.english,
      translation: data.translation,
      language: data.language as Language,
      sector: data.sector as Sector,
      subcategory: data.subcategory as Subcategory,
      createdAt: new Date(data.created_at).getTime(),
    };
  } catch (error) {
    console.error('Error adding custom phrase:', error);
    return null;
  }
};

export const deleteCustomPhrase = async (id: string): Promise<boolean> => {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('custom_phrases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom phrase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting custom phrase:', error);
    return false;
  }
};
