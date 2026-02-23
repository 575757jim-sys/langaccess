import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  keyLength: supabaseAnonKey?.length || 0,
});

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error('CRITICAL: Supabase client failed to initialize!');
} else {
  console.log('Supabase client initialized successfully');

  supabase
    .from('custom_phrases')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('Supabase connection test FAILED:', error);
      } else {
        console.log('Supabase connection test PASSED');
      }
    })
    .catch((err) => {
      console.error('Supabase connection test ERROR:', err);
    });
}
