import { CustomPhrase, Language, Sector } from '../data/phrases';
import { Subcategory } from '../data/subcategories';
import { supabase } from '../lib/supabase';

export const loadCustomPhrases = async (
  language: Language,
  sector: Sector,
  subcategory: Subcategory
): Promise<CustomPhrase[]> => {
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
  try {
    console.log('Attempting to save phrase:', phrase);

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

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      alert(`Database error: ${error.message}`);
      return null;
    }

    if (!data) {
      console.error('No data returned from insert');
      alert('Failed to save phrase: No data returned');
      return null;
    }

    console.log('Phrase saved successfully:', data);

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
    console.error('Exception while adding custom phrase:', error);
    alert(`Error saving phrase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

export const deleteCustomPhrase = async (id: string): Promise<boolean> => {
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
