import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const { driverId, notes, adminId } = await req.json();
  await supabaseAdmin
    .from("driver_details")
    .update({ is_verified: false, verification_status: "rejected", verification_notes: notes || null })
    .eq("id", driverId);
  await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    action: "driver_rejected",
    target_type: "profile",
    target_id: driverId,
    details: notes ? { notes } : null,
  });
  return Response.json({ ok: true });
}
