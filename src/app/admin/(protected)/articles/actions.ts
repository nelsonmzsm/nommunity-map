"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

function articleFieldsFromForm(formData: FormData) {
  const photos = String(formData.get("photos") ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const status: "draft" | "published" =
    formData.get("status") === "published" ? "published" : "draft";

  return {
    store_id: String(formData.get("storeId") ?? ""),
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? ""),
    cover_photo: String(formData.get("coverPhoto") ?? "") || null,
    photos,
    body: String(formData.get("body") ?? ""),
    status,
  };
}

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const fields = articleFieldsFromForm(formData);
  const { error } = await supabase.from("articles").insert({
    ...fields,
    published_at: fields.status === "published" ? new Date().toISOString() : null,
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const fields = articleFieldsFromForm(formData);

  const { data: existing } = await supabase
    .from("articles")
    .select("status, published_at")
    .eq("id", id)
    .single();

  const published_at =
    fields.status === "published"
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

  const { error } = await supabase
    .from("articles")
    .update({ ...fields, published_at, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/articles");
}
