import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const { driverId, adminId } = await req.json();
  await supabaseAdmin
    .from("driver_details")
    .update({ is_verified: true, verification_status: "approved", verification_notes: null })
    .eq("id", driverId);
  await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    action: "driver_approved",
    target_type: "profile",
    target_id: driverId,
  });
  return Response.json({ ok: true });
}
