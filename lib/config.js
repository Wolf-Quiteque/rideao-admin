// Sem credenciais Supabase o painel corre em MODO DEMO com dados simulados
// ao vivo (lib/demoDb.js).

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

export const isDemoMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;
