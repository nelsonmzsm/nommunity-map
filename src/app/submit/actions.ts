"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const submissionSchema = z.object({
  kind: z.enum(["new", "correction"]),
  targetStoreId: z.string().optional(),
  name: z.string().optional(),
  genreId: z.string().optional(),
  regionId: z.string().optional(),
  prefecture: z.string().optional(),
  town: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  photos: z.string().optional(),
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
  const raw = Object.fromEntries(formData.entries());
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

  const photos = (data.photos ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  const supabase = createAdminClient();
  const { error } = await supabase.from("store_submissions").insert({
    target_store_id: data.kind === "correction" ? data.targetStoreId || null : null,
    submitter_display_name: data.submitterDisplayName,
    submitter_contact: data.submitterContact || null,
    name: data.name || null,
    genre_id: data.genreId || null,
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
