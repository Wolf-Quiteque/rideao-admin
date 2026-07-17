import { createClient } from "@supabase/supabase-js";
import { isDemoMode, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Cliente de browser (chave anónima). As policies RLS de admin aplicam-se
// depois do login como utilizador com role 'admin'.
export const supabase = isDemoMode ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
