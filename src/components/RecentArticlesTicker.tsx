"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ArticleSummary } from "@/types/article";

const PIXELS_PER_SECOND = 32;

export default function RecentArticlesTicker({ articles }: { articles: ArticleSummary[] }) {
  const segmentRef = useRef<HTMLDivElement>(null);
  const [durationSeconds, setDurationSeconds] = useState(30);

  useEffect(() => {
    if (!segmentRef.current) return;
    const width = segmentRef.current.offsetWidth;
    if (width > 0) {
      setDurationSeconds(Math.max(20, width / PIXELS_PER_SECOND));
    }
  }, [articles.length]);

  if (articles.length === 0) return null;

  const renderSegment = (copyIndex: 0 | 1) => (
    <div
      key={copyIndex}
      ref={copyIndex === 0 ? segmentRef : undefined}
      aria-hidden={copyIndex === 1}
      className="flex shrink-0 items-center whitespace-nowrap px-4"
    >
      <span>取材記事も読めます　</span>
      {articles.map((article, i) => (
        <span key={article.id} className="flex items-center whitespace-nowrap">
          <Link href={`/articles/${article.slug}`} className="hover:underline">
            {article.title}（{article.store.name}）
          </Link>
          <span className="px-2">{i < articles.length - 1 ? "・" : ""}</span>
        </span>
      ))}
      <span>　以上、繰り返し。</span>
    </div>
  );

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-emerald-900 py-1.5 text-white">
      <span className="relative z-10 shrink-0 bg-emerald-900 pl-3 text-[10px] font-bold tracking-wide text-amber-300">
        記事
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className="ticker-track flex whitespace-nowrap text-xs font-semibold sm:text-sm"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {renderSegment(0)}
          {renderSegment(1)}
        </div>
      </div>
      <Link
        href="/articles"
        className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold hover:bg-white/25 sm:mr-3"
      >
        一覧を見る
      </Link>
    </div>
  );
}
