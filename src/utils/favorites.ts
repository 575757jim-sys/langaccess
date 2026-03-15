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

const LS_KEY = 'langaccess_favorites';
const EMAIL_CAPTURED_KEY = 'langaccess_email_captured';

function readLocal(): FavoritePhrase[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as FavoritePhrase[];
  } catch {
    return [];
  }
}

function writeLocal(favs: FavoritePhrase[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(favs));
  } catch {}
}

function getStoredEmail(): string | null {
  return localStorage.getItem(EMAIL_CAPTURED_KEY);
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
  const local = readLocal();
  const email = getStoredEmail();

  if (local.length > 0) return local;

  try {
    const sessionId = getSessionId();
    let query = supabase.from('favorites').select('*');

    if (email) {
      query = query.or(`session_id.eq.${sessionId},email.eq.${email}`);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];

    const seen = new Set<string>();
    const favs: FavoritePhrase[] = [];
    for (const row of (data ?? []) as Record<string, unknown>[]) {
      const key = `${row.phrase_english}::${row.language}`;
      if (!seen.has(key)) {
        seen.add(key);
        favs.push(mapRow(row));
      }
    }
    writeLocal(favs);
    return favs;
  } catch {
    return [];
  }
}

export async function linkFavoritesToEmail(email: string): Promise<void> {
  const sessionId = getSessionId();
  try {
    await supabase
      .from('favorites')
      .update({ email })
      .eq('session_id', sessionId)
      .is('email', null);
  } catch {}
}

export async function addFavorite(params: {
  language: Language;
  sector: Sector;
  subcategory: string;
  phraseEnglish: string;
  phraseTranslation: string;
}): Promise<FavoritePhrase | null> {
  const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const optimistic: FavoritePhrase = {
    id: tempId,
    sessionId: getSessionId(),
    language: params.language,
    sector: params.sector,
    subcategory: params.subcategory,
    phraseEnglish: params.phraseEnglish,
    phraseTranslation: params.phraseTranslation,
    createdAt: Date.now(),
  };

  const current = readLocal();
  writeLocal([optimistic, ...current]);

  const email = getStoredEmail();

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        session_id: getSessionId(),
        email: email ?? null,
        language: params.language,
        sector: params.sector,
        subcategory: params.subcategory,
        phrase_english: params.phraseEnglish,
        phrase_translation: params.phraseTranslation,
      })
      .select()
      .maybeSingle();
    if (error || !data) return optimistic;
    const saved = mapRow(data as Record<string, unknown>);
    const updated = readLocal().map(f => f.id === tempId ? saved : f);
    writeLocal(updated);
    return saved;
  } catch {
    return optimistic;
  }
}

export async function removeFavorite(id: string): Promise<boolean> {
  const updated = readLocal().filter(f => f.id !== id);
  writeLocal(updated);

  try {
    await supabase
      .from('favorites')
      .delete()
      .eq('id', id);
  } catch {}

  return true;
}

export async function isFavorited(phraseEnglish: string, language: Language): Promise<boolean> {
  const local = readLocal();
  return local.some(f => f.phraseEnglish === phraseEnglish && f.language === language);
}
