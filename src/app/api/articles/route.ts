import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { excerptFromBody } from "@/lib/article-body";
import type { ArticleSummary } from "@/types/article";

const EXCERPT_LENGTH = 200;

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, store_id, slug, title, cover_photo, body, published_at, store:stores(id, name, prefecture, town, region:regions(*))"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articles: ArticleSummary[] = data.map((a) => ({
    id: a.id,
    storeId: a.store_id,
    slug: a.slug,
    title: a.title,
    coverPhoto: a.cover_photo ?? undefined,
    excerpt: excerptFromBody(a.body, EXCERPT_LENGTH),
    publishedAt: a.published_at,
    store: {
      id: a.store.id,
      name: a.store.name,
      prefecture: a.store.prefecture,
      town: a.store.town,
      region: {
        id: a.store.region.id,
        key: a.store.region.key,
        name: a.store.region.name,
        color: a.store.region.color,
        colorSoft: a.store.region.color_soft,
        colorBorder: a.store.region.color_border,
        textColor: a.store.region.text_color,
      },
    },
  }));

  return NextResponse.json(articles);
}
