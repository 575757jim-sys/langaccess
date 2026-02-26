import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://vquilyemhhmszyclhwdr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdWlseWVtaGhtc3p5Y2xod2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Nzk3NzAsImV4cCI6MjA4NzQ1NTc3MH0.5gT6rlfgcs7O-XMmZUWLtIW92JMIVQ-KnCvDMNabl-A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
