import { supabase } from '../lib/supabase';

export function getBatchCodeFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const batch = params.get('batch');
  console.log('Batch:', batch);
  return batch;
}

export async function trackBatchVisit(batchCode: string): Promise<void> {
  try {
    const payload = {
      language: '',
      sector: '',
      phrase_english: ''
    };

    console.log('Batch:', batchCode);
    console.log('FINAL DB PAYLOAD:', payload);

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
    const payload = {
      language: language,
      sector: '',
      phrase_english: ''
    };

    console.log('Batch:', batchCode);
    console.log('FINAL DB PAYLOAD:', payload);

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

export function storeBatchCode(batchCode: string): void {
  sessionStorage.setItem('langaccess_batch_code', batchCode);
  localStorage.setItem('langaccess_batch', batchCode);
}

export function getStoredBatchCode(): string | null {
  return sessionStorage.getItem('langaccess_batch_code');
}
