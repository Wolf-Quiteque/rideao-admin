import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const { rideId, reason, adminId } = await req.json();
  await supabaseAdmin
    .from("rides")
    .update({
      status: "cancelled",
      cancelled_by: "admin",
      cancellation_reason: reason || "Cancelada pela operação",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .not("status", "in", "(completed,cancelled)");
  await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    action: "ride_cancelled",
    target_type: "ride",
    target_id: rideId,
    details: reason ? { reason } : null,
  });
  return Response.json({ ok: true });
}
