import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Store, StorePost } from "@/types/store";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*, store_genres(genre:genres(*)), region:regions(*)")
    .eq("status", "published");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 推しコメント・写真投稿は、承認待ちのマイグレーション未適用環境でも
  // 地図本体の表示を絶対に壊さないよう、別クエリにして失敗時は空扱いにする。
  const [commentsRes, photosRes] = await Promise.all([
    supabase.from("store_comments").select("*").eq("status", "approved"),
    supabase.from("store_photo_submissions").select("*").eq("status", "approved"),
  ]);

  // 推しコメント（テキストのみ）と写真投稿（写真＋任意コメント）は、
  // 店舗詳細モーダルでは1つの「投稿」フィードとしてまとめて新しい順に表示する。
  const postsByStore = new Map<string, StorePost[]>();
  for (const c of commentsRes.data ?? []) {
    const list = postsByStore.get(c.store_id) ?? [];
    list.push({ id: c.id, displayName: c.display_name, comment: c.comment, createdAt: c.created_at });
    postsByStore.set(c.store_id, list);
  }

  const photosByStore = new Map<string, string[]>();
  for (const p of photosRes.data ?? []) {
    const photoList = photosByStore.get(p.store_id) ?? [];
    photoList.push(p.photo_url);
    photosByStore.set(p.store_id, photoList);

    const postList = postsByStore.get(p.store_id) ?? [];
    postList.push({
      id: p.id,
      displayName: p.display_name,
      comment: p.comment ?? "",
      photoUrl: p.photo_url,
      createdAt: p.created_at,
    });
    postsByStore.set(p.store_id, postList);
  }

  for (const list of postsByStore.values()) {
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const stores: Store[] = data.map((s) => ({
    id: s.id,
    name: s.name,
    genres: s.store_genres.map((sg) => ({ id: sg.genre.id, name: sg.genre.name })),
    region: {
      id: s.region.id,
      key: s.region.key,
      name: s.region.name,
      color: s.region.color,
      colorSoft: s.region.color_soft,
      colorBorder: s.region.color_border,
      textColor: s.region.text_color,
    },
    prefecture: s.prefecture,
    town: s.town,
    village: s.village,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    photos: s.photos,
    userPhotos: photosByStore.get(s.id) ?? [],
    posts: postsByStore.get(s.id) ?? [],
    profile: s.profile,
    storeUrl: s.store_url ?? undefined,
    phone: s.phone ?? undefined,
    isAd: s.is_ad,
    reservationUrl: s.reservation_url ?? undefined,
    providerNote: s.provider_note ?? undefined,
    verified: s.verified,
    createdAt: s.created_at,
  }));

  return NextResponse.json(stores);
}
