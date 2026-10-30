"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageToStorage } from "@/lib/supabase-storage";

export interface CommunitySubmitState {
  status: "idle" | "success" | "error";
  message?: string;
}

const MAX_PHOTO_MB = 5;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;

const commentSchema = z.object({
  storeId: z.string().min(1),
  displayName: z.string().min(1, "お名前を入力してください"),
  comment: z.string().min(1, "コメントを入力してください").max(400, "400文字以内で入力してください"),
  company: z.string().optional(), // ハニーポット（人間は空欄のまま送信する）
});

export async function submitComment(
  _prevState: CommunitySubmitState,
  formData: FormData
): Promise<CommunitySubmitState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const data = parsed.data;
  if (data.company) {
    return { status: "success" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("store_comments").insert({
    store_id: data.storeId,
    display_name: data.displayName,
    comment: data.comment,
  });

  if (error) {
    return { status: "error", message: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  return { status: "success" };
}

const photoSchema = z.object({
  storeId: z.string().min(1),
  displayName: z.string().min(1, "お名前を入力してください"),
  comment: z.string().max(1000, "1000文字以内で入力してください").optional(),
  company: z.string().optional(),
});

export async function submitPhoto(
  _prevState: CommunitySubmitState,
  formData: FormData
): Promise<CommunitySubmitState> {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, value]) => typeof value === "string")
  );
  const parsed = photoSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const data = parsed.data;
  if (data.company) {
    return { status: "success" };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "写真を選択してください" };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { status: "error", message: `写真は${MAX_PHOTO_MB}MBまでです` };
  }

  let photoUrl: string;
  try {
    photoUrl = await uploadImageToStorage(file, "store-photos");
  } catch (err) {
    console.error("Photo upload failed:", err);
    return {
      status: "error",
      message: "写真のアップロードに失敗しました。時間をおいて再度お試しください。",
    };
  }

  const comment = data.comment?.trim();

  const supabase = createAdminClient();
  const { error } = await supabase.from("store_photo_submissions").insert({
    store_id: data.storeId,
    display_name: data.displayName,
    photo_url: photoUrl,
    comment: comment ? comment : null,
  });

  if (error) {
    return { status: "error", message: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  return { status: "success" };
}
