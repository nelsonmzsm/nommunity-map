"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDriveConfigured, uploadPhotoToDrive } from "@/lib/google-drive";

const submissionSchema = z.object({
  kind: z.enum(["new", "correction"]),
  submitterRelation: z.enum(["self", "other"], {
    message: "投稿者とお店の関係を選択してください",
  }),
  targetStoreId: z.string().optional(),
  name: z.string().optional(),
  genreOtherText: z.string().optional(),
  regionId: z.string().optional(),
  prefecture: z.string().optional(),
  town: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  profile: z.string().optional(),
  storeUrl: z.string().optional(),
  phone: z.string().optional(),
  submitterDisplayName: z.string().min(1, "お名前を入力してください"),
  submitterContact: z.string().optional(),
  message: z.string().optional(),
  company: z.string().optional(), // ハニーポット（人間は空欄のまま送信する）
});

export interface SubmitState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitStore(
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, value]) => typeof value === "string")
  );
  const parsed = submissionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const data = parsed.data;

  // ハニーポット: bot が埋めていたら黙って成功扱いにする
  if (data.company) {
    return { status: "success" };
  }

  const genreIds = formData
    .getAll("genreIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  const photoFiles = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  let photos: string[] = [];
  if (photoFiles.length > 0) {
    if (isDriveConfigured()) {
      try {
        photos = await Promise.all(photoFiles.map((file) => uploadPhotoToDrive(file)));
      } catch (err) {
        console.error("Google Drive upload failed:", err);
        return {
          status: "error",
          message: "写真のアップロードに失敗しました。時間をおいて再度お試しください。",
        };
      }
    } else {
      console.warn("Google Drive is not configured; skipping photo upload.");
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("store_submissions").insert({
    target_store_id: data.kind === "correction" ? data.targetStoreId || null : null,
    submitter_display_name: data.submitterDisplayName,
    submitter_contact: data.submitterContact || null,
    submitter_relation: data.submitterRelation,
    name: data.name || null,
    genre_ids: genreIds,
    genre_other_text: data.genreOtherText || null,
    region_id: data.regionId || null,
    prefecture: data.prefecture || null,
    town: data.town || null,
    village: data.village || null,
    address: data.address || null,
    photos,
    profile: data.profile || null,
    store_url: data.storeUrl || null,
    phone: data.phone || null,
    message: data.message || null,
  });

  if (error) {
    return { status: "error", message: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  return { status: "success" };
}
