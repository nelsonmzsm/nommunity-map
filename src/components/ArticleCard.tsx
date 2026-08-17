import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/types/article";
import IslandBadge from "./IslandBadge";
import PhotoPlaceholder from "./PhotoPlaceholder";

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {article.coverPhoto ? (
          <Image
            src={article.coverPhoto}
            alt={article.title}
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <PhotoPlaceholder genres={[]} region={article.store.region} iconClassName="h-6 w-6" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <IslandBadge region={article.store.region} />
        <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-zinc-900">
          {article.title}
        </p>
        <p className="mt-1 truncate text-xs text-zinc-500">
          {article.store.name} ・ {article.store.prefecture}
          {article.store.town}
        </p>
      </div>
    </Link>
  );
}
