import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { parseArticleBody, excerptFromBody } from "@/lib/article-body";
import IslandBadge from "@/components/IslandBadge";
import GenreTag from "@/components/GenreTag";
import ArticlePhotoStrip from "@/components/ArticlePhotoStrip";

async function getArticle(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "*, store:stores(*, store_genres(genre:genres(name)), region:regions(*))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const description = excerptFromBody(article.body, 120);
  return {
    title: `${article.title} | 奄美群島飲ミュニティマップ`,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.cover_photo ? [article.cover_photo] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const supabase = await createClient();
  await supabase.rpc("increment_article_view_count", { article_id: article.id });

  const store = article.store;
  const fullAddress = `${store.prefecture}${store.town}${store.address}`;
  const genreNames = store.store_genres.map((sg: { genre: { name: string } }) => sg.genre.name);
  const bodySegments = parseArticleBody(article.body);
  const stripPhotos = Array.from(
    new Set(
      [article.cover_photo, ...bodySegments.filter((s) => s.type === "image").map((s) => s.url)].filter(
        (url): url is string => Boolean(url)
      )
    )
  );

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <div className="bg-tsumugi border-b border-zinc-200 px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-zinc-500 hover:underline">
          ← 奄美群島飲ミュニティマップ
        </Link>
      </div>

      <ArticlePhotoStrip photos={stripPhotos} alt={article.title} />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <IslandBadge
            region={{
              id: store.region.id,
              key: store.region.key,
              name: store.region.name,
              color: store.region.color,
              colorSoft: store.region.color_soft,
              colorBorder: store.region.color_border,
              textColor: store.region.text_color,
            }}
          />
          {genreNames.map((name: string) => (
            <GenreTag key={name} name={name} />
          ))}
        </div>

        <h1 className="text-2xl font-bold leading-snug text-zinc-900 sm:text-3xl">
          {article.title}
        </h1>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold text-zinc-400">この記事のお店</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{store.name}</p>
          <p className="mt-0.5 text-sm text-zinc-500">{fullAddress}</p>
          <Link
            href={`/?store=${store.id}`}
            className="mt-3 inline-flex rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
            style={{ backgroundColor: store.region.color }}
          >
            地図で見る・行き方を調べる
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {bodySegments.map((segment, i) =>
            segment.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- 元画像の縦横比のまま表示したいため、固定枠+object-coverのnext/image(fill)ではなく素のimgを使う
              <img
                key={i}
                src={segment.url}
                alt={segment.alt || article.title}
                className="w-full rounded-xl bg-zinc-100"
                loading="lazy"
              />
            ) : (
              <p
                key={i}
                className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800"
              >
                {segment.content}
              </p>
            )
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-zinc-900">{store.name}</p>
            <p className="truncate text-xs text-zinc-500">{fullAddress}</p>
          </div>
          <Link
            href={`/?store=${store.id}`}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: store.region.color }}
          >
            この店に行く
          </Link>
        </div>
      </div>
    </div>
  );
}
