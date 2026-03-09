import { supabase } from '../lib/supabase';
import { Language, Sector } from '../data/phrases';
import { getSessionId } from './sessionId';

export interface InteractionLog {
  id: string;
  logged_at: string;
  language: string;
  sector: string;
  subcategory: string;
  phrase_english: string;
  phrase_translation: string;
  session_id: string;
}

export async function logInteraction(params: {
  language: Language;
  sector: Sector;
  subcategory: string;
  phraseEnglish: string;
  phraseTranslation: string;
}): Promise<void> {
  try {
    await supabase.from('interaction_logs').insert({
      language: params.language,
      sector: params.sector,
      subcategory: params.subcategory,
      phrase_english: params.phraseEnglish,
      phrase_translation: params.phraseTranslation,
      session_id: getSessionId(),
    });
  } catch {
    // Silently fail — logging must never interrupt the user
  }
}

export async function fetchAllLogs(): Promise<InteractionLog[]> {
  try {
    const { data, error } = await supabase
      .from('interaction_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(5000);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export function exportLogsToCSV(logs: InteractionLog[]): void {
  const header = 'Date,Language,Sector,Subcategory,Phrase';
  const rows = logs.map(l =>
    [
      new Date(l.logged_at).toLocaleString(),
      l.language,
      l.sector,
      l.subcategory,
      `"${l.phrase_english.replace(/"/g, '""')}"`,
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `langaccess-interaction-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
