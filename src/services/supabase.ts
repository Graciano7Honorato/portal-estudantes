import { createClient } from '@supabase/supabase-js';

// URL obtida do seu print
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://clvwabaaomszvrgnhsgm.supabase.co";

// A chave ainda precisa ser colada aqui ou no arquivo .env
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdndhYmFhb21zenZyZ25oc2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTU3NjYsImV4cCI6MjA3OTczMTc2Nn0.IAsuW8eyd66psXmiK9aI-ns8E50Fn0Gl2vl_ifvVHpc";

if (!supabaseKey) {
  console.warn('ATENÇÃO: A chave do Supabase (Anon Key) está faltando!');
  console.warn('Por favor, abra o arquivo src/services/supabase.ts e cole sua chave na variável supabaseKey, ou use o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);