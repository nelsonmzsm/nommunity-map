"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteImageFromStorage } from "@/lib/supabase-storage";

export async function approvePhoto(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_photo_submissions")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/photos");
}

export async function rejectPhoto(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_photo_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/photos");
}

export async function hidePhoto(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_photo_submissions")
    .update({ status: "hidden", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/photos");
}

export async function restorePhoto(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_photo_submissions")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id);
  revalidatePath("/admin/photos");
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("store_photo_submissions")
    .select("photo_url")
    .eq("id", id)
    .single();
  await supabase.from("store_photo_submissions").delete().eq("id", id);
  if (row?.photo_url) {
    await deleteImageFromStorage(row.photo_url).catch(() => {});
  }
  revalidatePath("/admin/photos");
}
