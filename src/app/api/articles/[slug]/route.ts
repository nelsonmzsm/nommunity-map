import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/article";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      "*, store:stores(*, store_genres(genre:genres(*)), region:regions(*))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  const s = data.store;
  const article: Article = {
    id: data.id,
    storeId: data.store_id,
    slug: data.slug,
    title: data.title,
    coverPhoto: data.cover_photo ?? undefined,
    photos: data.photos,
    body: data.body,
    publishedAt: data.published_at,
    store: {
      id: s.id,
      name: s.name,
      genres: s.store_genres.map((sg: { genre: { id: string; name: string } }) => ({
        id: sg.genre.id,
        name: sg.genre.name,
      })),
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
      profile: s.profile,
      storeUrl: s.store_url ?? undefined,
      phone: s.phone ?? undefined,
      isAd: s.is_ad,
      reservationUrl: s.reservation_url ?? undefined,
      providerNote: s.provider_note ?? undefined,
      verified: s.verified,
      createdAt: s.created_at,
    },
  };

  await supabase.rpc("increment_article_view_count", { article_id: data.id });

  return NextResponse.json(article);
}
