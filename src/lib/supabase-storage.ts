import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "images";

function extensionFromMime(mimeType: string): string {
  const sub = mimeType.split("/")[1]?.split(/[+;]/)[0];
  return sub || "png";
}

// 記事画像・店舗投稿写真のアップロード先。Supabase Storageの公開バケットへ保存し、
// 誰でも閲覧可能な公開URLを返す（Google Driveのサービスアカウントには
// 個人Googleアカウントだとストレージ容量がなくファイル作成できない制限があるため移行）。
export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const supabase = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionFromMime(file.type || "image/png");
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
