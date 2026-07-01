"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

function storeFieldsFromForm(formData: FormData) {
  const photos = String(formData.get("photos") ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  return {
    name: String(formData.get("name") ?? ""),
    genre_id: String(formData.get("genreId") ?? ""),
    region_id: String(formData.get("regionId") ?? ""),
    prefecture: String(formData.get("prefecture") ?? ""),
    town: String(formData.get("town") ?? ""),
    village: String(formData.get("village") ?? ""),
    address: String(formData.get("address") ?? ""),
    lat: Number(formData.get("lat") ?? 0),
    lng: Number(formData.get("lng") ?? 0),
    photos,
    profile: String(formData.get("profile") ?? ""),
    store_url: String(formData.get("storeUrl") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    is_ad: formData.get("isAd") === "on",
    reservation_url: String(formData.get("reservationUrl") ?? "") || null,
    provider_note: String(formData.get("providerNote") ?? "") || null,
  };
}

export async function createStore(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("stores").insert(storeFieldsFromForm(formData));
  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}

export async function updateStore(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("stores")
    .update({ ...storeFieldsFromForm(formData), updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}

export async function toggleStoreStatus(id: string, status: "published" | "hidden") {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("stores")
    .update({ status: status === "published" ? "hidden" : "published" })
    .eq("id", id);
  revalidatePath("/admin/stores");
}
