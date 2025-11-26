import { createClient } from '@supabase/supabase-js';

// Tenta pegar do .env, mas usa strings diretas se falhar (para funcionar no preview)
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || "https://clvwabaaomszvrgnhsgm.supabase.co";
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdndhYmFhb21zenZyZ25oc2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTU3NjYsImV4cCI6MjA3OTczMTc2Nn0.IAsuW8eyd66psXmiK9aI-ns8E50Fn0Gl2vl_ifvVHpc";

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO CRÍTICO: Credenciais do Supabase ausentes.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);