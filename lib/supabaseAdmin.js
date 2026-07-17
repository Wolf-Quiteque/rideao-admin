import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente exclusivo do servidor (service role — ignora RLS).
// NUNCA importar em componentes de cliente. Usado pelos route handlers em
// app/api/**; cada mutação deve registar uma entrada em admin_actions.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
