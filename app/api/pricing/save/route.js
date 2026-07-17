import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const { config, adminId } = await req.json();
  await supabaseAdmin
    .from("pricing_config")
    .update({
      base_fare: config.base_fare,
      rate_per_km: config.rate_per_km,
      rate_per_min: config.rate_per_min,
      conforto_multiplier: config.conforto_multiplier,
      xl_multiplier: config.xl_multiplier,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", 1);
  await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    action: "pricing_updated",
    target_type: "pricing",
    target_id: "1",
    details: config,
  });
  return Response.json({ ok: true });
}
