"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function addGenre(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = createAdminClient();
  await supabase.from("genres").insert({ name });
  revalidatePath("/admin/genres");
}

export async function toggleGenreActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("genres").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/admin/genres");
}
