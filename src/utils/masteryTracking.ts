import { supabase } from '../lib/supabase';
import { getSessionId } from './sessionId';

export type MasteryLevel = 1 | 2 | 3 | 4 | 5;

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  1: 'Seen',
  2: 'Heard',
  3: 'Repeated',
  4: 'Quiz',
  5: 'Used',
};

export interface MasteryRow {
  phrase_id: string;
  sector: string | null;
  language: string | null;
  level: number;
  first_seen_at: string | null;
  mastered_at: string | null;
  updated_at: string | null;
}

export async function recordMasteryEvent(params: {
  phraseId: string;
  level: MasteryLevel;
  sector?: string;
  language?: string;
  email?: string;
}): Promise<void> {
  const session_id = getSessionId();
  const { phraseId, level, sector, language, email } = params;

  try {
    const { data: existing } = await supabase
      .from('phrase_mastery')
      .select('id, level, mastered_at')
      .eq('session_id', session_id)
      .eq('phrase_id', phraseId)
      .maybeSingle();

    const now = new Date().toISOString();
    const nextLevel = Math.max(existing?.level ?? 0, level);
    const nextMasteredAt =
      existing?.mastered_at ?? (nextLevel >= 4 ? now : null);

    if (existing?.id) {
      await supabase
        .from('phrase_mastery')
        .update({
          level: nextLevel,
          mastered_at: nextMasteredAt,
          updated_at: now,
          sector: sector ?? null,
          language: language ?? null,
          email: email ?? null,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('phrase_mastery').insert({
        session_id,
        email: email ?? null,
        phrase_id: phraseId,
        sector: sector ?? null,
        language: language ?? null,
        level: nextLevel,
        mastered_at: nextMasteredAt,
      });
    }
  } catch (err) {
    console.error('recordMasteryEvent error', err);
  }
}

export async function loadMasteryRows(): Promise<MasteryRow[]> {
  const session_id = getSessionId();
  try {
    const { data, error } = await supabase
      .from('phrase_mastery')
      .select('phrase_id, sector, language, level, first_seen_at, mastered_at, updated_at')
      .eq('session_id', session_id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as MasteryRow[]) ?? [];
  } catch (err) {
    console.error('loadMasteryRows error', err);
    return [];
  }
}

export function summarizeMastery(rows: MasteryRow[]) {
  const buckets: Record<MasteryLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) {
    const lvl = Math.min(5, Math.max(1, r.level)) as MasteryLevel;
    buckets[lvl]++;
  }
  const total = rows.length;
  const mastered = buckets[4] + buckets[5];
  return { buckets, total, mastered };
}
