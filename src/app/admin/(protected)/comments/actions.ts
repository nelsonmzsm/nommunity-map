"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveComment(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_comments")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/comments");
}

export async function rejectComment(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_comments")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/comments");
}
