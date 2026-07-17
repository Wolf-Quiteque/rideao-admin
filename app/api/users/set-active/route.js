import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const { userId, isActive, adminId } = await req.json();
  await supabaseAdmin.from("profiles").update({ is_active: isActive }).eq("id", userId);
  await supabaseAdmin.from("admin_actions").insert({
    admin_id: adminId,
    action: isActive ? "user_reactivated" : "user_deactivated",
    target_type: "profile",
    target_id: userId,
  });
  return Response.json({ ok: true });
}
