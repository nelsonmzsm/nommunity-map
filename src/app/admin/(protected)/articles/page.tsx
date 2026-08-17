import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteArticle } from "./actions";
import DeleteArticleButton from "./DeleteArticleButton";

export default async function AdminArticlesPage() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*, store:stores(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">記事管理</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          新規作成
        </Link>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500">
            <th className="py-2">タイトル</th>
            <th>対象店舗</th>
            <th>状態</th>
            <th>閲覧数</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(articles ?? []).map((article) => (
            <tr key={article.id} className="border-b border-zinc-100">
              <td className="py-2 font-semibold">{article.title}</td>
              <td>{article.store?.name}</td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    article.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {article.status === "published" ? "公開中" : "下書き"}
                </span>
              </td>
              <td>{article.view_count}</td>
              <td className="space-x-3 text-right">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="text-zinc-600 hover:underline"
                >
                  編集
                </Link>
                {article.status === "published" && (
                  <a
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:underline"
                  >
                    表示
                  </a>
                )}
                <DeleteArticleButton
                  action={deleteArticle.bind(null, article.id)}
                  articleTitle={article.title}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
