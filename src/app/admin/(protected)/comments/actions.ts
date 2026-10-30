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

export async function hideComment(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_comments")
    .update({ status: "hidden", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/comments");
}

export async function restoreComment(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_comments")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/comments");
}

export async function updateComment(id: string, formData: FormData) {
  await requireAdmin();
  const comment = (formData.get("comment") as string | null)?.trim();
  if (!comment) return;
  const supabase = createAdminClient();
  await supabase.from("store_comments").update({ comment }).eq("id", id);
  revalidatePath("/admin/comments");
}

export async function deleteComment(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("store_comments").delete().eq("id", id);
  revalidatePath("/admin/comments");
}
