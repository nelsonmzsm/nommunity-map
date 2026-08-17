import type { ArticleSummary } from "@/types/article";
import ArticleCard from "./ArticleCard";

export default function ArticleList({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) {
    return (
      <div className="bg-tsumugi flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">
        まだ公開されている取材記事がありません。
      </div>
    );
  }

  return (
    <div className="bg-tsumugi flex h-full flex-col gap-2 overflow-y-auto p-3">
      <p className="px-1 text-xs text-zinc-500">{articles.length}件の記事</p>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
