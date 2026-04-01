import { supabase } from '../lib/supabase';

export function getBatchCodeFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const batch = params.get('batch');
  console.log('Batch:', batch);
  return batch;
}

export async function trackBatchVisit(batchCode: string): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();

    const payload = {
      session_id: sessionId,
      language: '',
      sector: '',
      subcategory: '',
      phrase_english: '',
      phrase_translation: ''
    };

    console.log('Batch:', batchCode);

    const { data, error } = await supabase.from('interaction_logs').insert(payload);

    if (error) {
      console.error('DB ERROR:', error);
      throw error;
    }

    console.log('Batch visit tracked:', batchCode);
  } catch (error) {
    console.error('Failed to track batch visit:', error);
  }
}

export async function trackLanguageSelection(batchCode: string, language: string): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();

    const payload = {
      session_id: sessionId,
      language: language,
      sector: '',
      subcategory: '',
      phrase_english: '',
      phrase_translation: ''
    };

    console.log('Batch:', batchCode);

    const { data, error } = await supabase.from('interaction_logs').insert(payload);

    if (error) {
      console.error('DB ERROR:', error);
      throw error;
    }

    console.log('Batch visit tracked:', batchCode);
  } catch (error) {
    console.error('Failed to track language selection:', error);
  }
}

function getOrCreateSessionId(): string {
  const key = 'langaccess_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

export function storeBatchCode(batchCode: string): void {
  sessionStorage.setItem('langaccess_batch_code', batchCode);
  localStorage.setItem('langaccess_batch', batchCode);
}

export function getStoredBatchCode(): string | null {
  return sessionStorage.getItem('langaccess_batch_code');
}
