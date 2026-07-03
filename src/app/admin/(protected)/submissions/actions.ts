"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeAddress, isGeocodingConfigured } from "@/lib/geocode";

export async function approveSubmission(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();

  // 住所は信頼できる情報源なので、承認時は必ず住所からジオコーディングして
  // 緯度経度を上書きする（投稿フォームでは緯度経度を直接入力させていないため）。
  if (isGeocodingConfigured()) {
    const { data: submission } = await supabase
      .from("store_submissions")
      .select("prefecture, town, address")
      .eq("id", id)
      .single();

    const fullAddress = `${submission?.prefecture ?? ""}${submission?.town ?? ""}${submission?.address ?? ""}`.trim();
    if (fullAddress) {
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        await supabase
          .from("store_submissions")
          .update({ lat: coords.lat, lng: coords.lng })
          .eq("id", id);
      }
    }
  }

  const { error } = await supabase.rpc("approve_submission", {
    submission_id: id,
    reviewer_id: user.id,
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/stores");
  redirect("/admin/submissions");
}

export async function rejectSubmission(id: string, adminNote: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), admin_note: adminNote })
    .eq("id", id);
  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}
