"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function addRegion(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const key = String(formData.get("key") ?? "").trim();
  const color = String(formData.get("color") ?? "#8FA3C9");
  if (!name || !key) return;

  const supabase = createAdminClient();
  await supabase.from("regions").insert({
    name,
    key,
    color,
    color_soft: color,
    color_border: color,
    text_color: "#333333",
    group_key: "amami",
  });
  revalidatePath("/admin/regions");
}

export async function toggleRegionActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("regions").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/admin/regions");
}
