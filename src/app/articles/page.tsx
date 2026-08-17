"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/types/article";
import type { Region } from "@/types/store";
import IslandBadge from "@/components/IslandBadge";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [regionIds, setRegionIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [articlesRes, regionsRes] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/regions"),
      ]);
      const [articlesData, regionsData] = await Promise.all([
        articlesRes.json(),
        regionsRes.json(),
      ]);
      if (!cancelled) {
        setArticles(articlesData);
        setRegions(regionsData);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleRegion = (regionId: string) => {
    setRegionIds((prev) =>
      prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]
    );
  };

  const filteredArticles = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return articles.filter((article) => {
      if (regionIds.length > 0 && !regionIds.includes(article.store.region.id)) {
        return false;
      }
      if (kw) {
        const haystack = `${article.title} ${article.store.name}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [articles, keyword, regionIds]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-tsumugi flex flex-col gap-3 border-b border-zinc-200 px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-zinc-500 hover:underline">
          ← 奄美群島飲ミュニティマップ
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">取材記事一覧</h1>
          <p className="mt-1 text-sm text-zinc-500">
            運営が実際にお店を訪ねて書いた取材メモです。気になる記事から、お店の場所や行き方もすぐ見られます。
          </p>
        </div>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="記事タイトル・店名で検索"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none sm:w-72"
        />

        <div className="flex flex-wrap gap-1.5">
          {regions.map((region) => {
            const active = regionIds.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => toggleRegion(region.id)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-shadow ${
                  active ? "ring-2 ring-zinc-900 ring-offset-1" : ""
                }`}
                style={{
                  backgroundColor: active ? region.colorBorder : region.color,
                  color: "#ffffff",
                  border: `1.5px solid ${region.colorBorder}`,
                }}
              >
                {region.name}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {loading ? (
          <p className="text-center text-sm text-zinc-500">読み込み中...</p>
        ) : filteredArticles.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            条件に一致する記事が見つかりませんでした。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative h-40 w-full bg-zinc-100">
                  {article.coverPhoto ? (
                    <Image
                      src={article.coverPhoto}
                      alt={article.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <PhotoPlaceholder genres={[]} region={article.store.region} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <IslandBadge region={article.store.region} />
                  <p className="text-base font-bold leading-snug text-zinc-900">
                    {article.title}
                  </p>
                  <p className="mt-auto text-sm text-zinc-500">
                    {article.store.name} ・ {article.store.prefecture}
                    {article.store.town}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
