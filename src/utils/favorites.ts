import { supabase } from '../lib/supabase';
import { Language, Sector } from '../data/phrases';
import { getSessionId } from './sessionId';

export interface FavoritePhrase {
  id: string;
  sessionId: string;
  language: Language;
  sector: Sector;
  subcategory: string;
  phraseEnglish: string;
  phraseTranslation: string;
  createdAt: number;
}

function mapRow(row: Record<string, unknown>): FavoritePhrase {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    language: row.language as Language,
    sector: row.sector as Sector,
    subcategory: row.subcategory as string,
    phraseEnglish: row.phrase_english as string,
    phraseTranslation: row.phrase_translation as string,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

export async function loadFavorites(): Promise<FavoritePhrase[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('session_id', getSessionId())
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []).map(mapRow);
  } catch {
    return [];
  }
}

export async function addFavorite(params: {
  language: Language;
  sector: Sector;
  subcategory: string;
  phraseEnglish: string;
  phraseTranslation: string;
}): Promise<FavoritePhrase | null> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        session_id: getSessionId(),
        language: params.language,
        sector: params.sector,
        subcategory: params.subcategory,
        phrase_english: params.phraseEnglish,
        phrase_translation: params.phraseTranslation,
      })
      .select()
      .maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
  } catch {
    return null;
  }
}

export async function removeFavorite(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('session_id', getSessionId());
    return !error;
  } catch {
    return false;
  }
}

export async function isFavorited(phraseEnglish: string, language: Language): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('session_id', getSessionId())
      .eq('phrase_english', phraseEnglish)
      .eq('language', language)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}
