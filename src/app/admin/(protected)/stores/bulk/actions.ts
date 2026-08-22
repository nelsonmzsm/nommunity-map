"use server";

import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeAddress, isGeocodingConfigured } from "@/lib/geocode";

export interface BulkStoreInput {
  name: string;
  regionId: string;
  prefecture: string;
  town: string;
  address: string;
  village: string;
  genreIds: string[];
  photos: string[];
  profile: string;
  storeUrl: string;
  phone: string;
}

export interface BulkStoreResult {
  index: number;
  name: string;
  status: "created" | "error";
  message?: string;
}

export async function bulkCreateStores(rows: BulkStoreInput[]): Promise<BulkStoreResult[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const results: BulkStoreResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      if (isGeocodingConfigured()) {
        // 「海外」は実在の地名ではないためジオコーディングのクエリからは除く
        // （国名は住所欄にすでに入力されている前提）。
        const prefecturePart = row.prefecture === "海外" ? "" : row.prefecture;
        const townPart = row.prefecture === "海外" ? "" : row.town;
        const fullAddress = `${prefecturePart}${townPart}${row.address}`;
        const coords = await geocodeAddress(fullAddress);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }
      if (lat === null || lng === null) {
        results.push({
          index: i,
          name: row.name,
          status: "error",
          message: "住所から緯度経度を取得できませんでした（住所を見直して個別に再登録してください）",
        });
        continue;
      }

      const { data, error } = await supabase
        .from("stores")
        .insert({
          name: row.name,
          region_id: row.regionId,
          prefecture: row.prefecture,
          town: row.town,
          village: row.village,
          address: row.address,
          lat,
          lng,
          photos: row.photos,
          profile: row.profile,
          store_url: row.storeUrl || null,
          phone: row.phone || null,
        })
        .select("id")
        .single();

      if (error || !data) {
        results.push({
          index: i,
          name: row.name,
          status: "error",
          message: error?.message ?? "登録に失敗しました",
        });
        continue;
      }

      if (row.genreIds.length > 0) {
        await supabase
          .from("store_genres")
          .insert(row.genreIds.map((genre_id) => ({ store_id: data.id, genre_id })));
      }

      results.push({ index: i, name: row.name, status: "created" });
    } catch (e) {
      results.push({
        index: i,
        name: row.name,
        status: "error",
        message: e instanceof Error ? e.message : "エラーが発生しました",
      });
    }
  }

  return results;
}
