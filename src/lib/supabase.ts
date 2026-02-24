import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vquilyemhhmszyclhwdr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdWlseWVtaGhtc3p5Y2xod2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Nzk3NzAsImV4cCI6MjA4NzQ1NTc3MH0.5gT6rlfgcs7O-XMmZUWLtIW92JMIVQ-KnCvDMNabl-A';

console.log('Supabase initializing with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client created successfully');

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
