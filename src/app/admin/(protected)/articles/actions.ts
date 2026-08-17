"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDriveConfigured, uploadPhotoToDrive } from "@/lib/google-drive";

const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

function articleFieldsFromForm(formData: FormData) {
  const status: "draft" | "published" =
    formData.get("status") === "published" ? "published" : "draft";

  return {
    store_id: String(formData.get("storeId") ?? ""),
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? ""),
    cover_photo: String(formData.get("coverPhoto") ?? "") || null,
    photos: [] as string[],
    body: String(formData.get("body") ?? ""),
    status,
  };
}

// 本文編集エリアへの画像ドラッグ&ドロップから呼ばれる。
// アップロード先はお店の投稿フォームと同じGoogle Driveの共有フォルダ。
export async function uploadArticleImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "画像ファイルが見つかりません" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "画像ファイルのみアップロードできます" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `画像は${MAX_IMAGE_MB}MBまでです` };
  }
  if (!isDriveConfigured()) {
    return { error: "画像アップロード先（Google Drive）が未設定です" };
  }

  try {
    const url = await uploadPhotoToDrive(file);
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アップロードに失敗しました" };
  }
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
