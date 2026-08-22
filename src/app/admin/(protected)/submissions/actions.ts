"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeAddress, isGeocodingConfigured } from "@/lib/geocode";

export async function approveSubmission(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();

  // 新規店舗の承認時のみ、住所から自動でジオコーディングして緯度経度を
  // 設定する（投稿フォームでは緯度経度を直接入力させていないため）。
  // 既存店舗への「修正」提案では、住所に関係ない項目だけの修正でも
  // ジオコーディングの結果が微妙にずれて地図上のピン位置が意図せず
  // 動いてしまうことがあるため、自動では上書きしない
  // （住所自体を直したい場合は承認後に編集画面から手動で取得する）。
  const { data: submissionMeta } = await supabase
    .from("store_submissions")
    .select("target_store_id")
    .eq("id", id)
    .single();
  const isNewStore = !submissionMeta?.target_store_id;

  if (isNewStore && isGeocodingConfigured()) {
    const { data: submission } = await supabase
      .from("store_submissions")
      .select("prefecture, town, address")
      .eq("id", id)
      .single();

    // 「海外」は実在の地名ではないため、ジオコーディング対象の文字列には含めない
    // （国名を含めた住所は投稿者がaddressにすべて入力している前提）。
    const prefecturePart = submission?.prefecture === "海外" ? "" : (submission?.prefecture ?? "");
    const townPart = submission?.prefecture === "海外" ? "" : (submission?.town ?? "");
    const fullAddress = `${prefecturePart}${townPart}${submission?.address ?? ""}`.trim();
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
