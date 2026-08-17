"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isDriveConfigured,
  uploadPhotoToDrive,
  extractGoogleDocId,
  exportGoogleDocAsHtml,
} from "@/lib/google-drive";

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

// Google Docs等からのコピペで本文に紛れ込む画像URL（例:
// googleusercontent.com）は、ブラウザから直接fetchするとCORSで弾かれることが
// 多いため、サーバー側で取得してDriveへ保存し直す。
export async function uploadArticleImageFromUrl(
  sourceUrl: string
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  if (!isDriveConfigured()) {
    return { error: "画像アップロード先（Google Drive）が未設定です" };
  }

  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return { error: "画像URLが不正です" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "画像URLが不正です" };
  }

  try {
    const res = await fetch(parsed.toString());
    if (!res.ok) {
      return { error: `画像の取得に失敗しました（${res.status}）` };
    }
    const contentType = res.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) {
      return { error: "画像を取得できませんでした" };
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return { error: `画像は${MAX_IMAGE_MB}MBまでです` };
    }
    const ext = contentType.split("/")[1]?.split(/[+;]/)[0] || "png";
    const file = new File([buffer], `pasted_${Date.now()}.${ext}`, { type: contentType });
    const url = await uploadPhotoToDrive(file);
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アップロードに失敗しました" };
  }
}

// 「Google Docsから取り込む」の第1段階。プレビュー確認用にHTMLとタイトルだけ取得する
// （この時点では画像のアップロードや本文への反映は行わない）。
export async function fetchGoogleDocForImport(
  docUrl: string
): Promise<{ title?: string; html?: string; error?: string }> {
  await requireAdmin();

  if (!isDriveConfigured()) {
    return { error: "Google連携（サービスアカウント）が未設定です" };
  }

  const docId = extractGoogleDocId(docUrl);
  if (!docId) {
    return { error: "Google DocのURLが正しくありません" };
  }

  try {
    const { title, html } = await exportGoogleDocAsHtml(docId);
    return { title, html };
  } catch (e) {
    const message = e instanceof Error ? e.message : "取得に失敗しました";
    if (message.includes("403") || message.toLowerCase().includes("permission")) {
      return {
        error:
          "このドキュメントを読み取れませんでした。サービスアカウント（" +
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL +
          "）に閲覧権限を共有してください。",
      };
    }
    return { error: message };
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
