import { createAdminClient } from "@/lib/supabase/admin";
import ArticleForm from "../ArticleForm";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
  const supabase = createAdminClient();
  const [{ data: stores }, { data: existingArticles }] = await Promise.all([
    supabase.from("stores").select("id, name").order("name"),
    supabase.from("articles").select("store_id"),
  ]);
  const storeIdsWithArticle = new Set((existingArticles ?? []).map((a) => a.store_id));
  const availableStores = (stores ?? []).filter((s) => !storeIdsWithArticle.has(s.id));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">記事の新規作成</h1>
      {availableStores.length === 0 ? (
        <p className="text-sm text-zinc-500">
          すべての店舗に既に記事が作成済みです。編集は店舗一覧の各記事から行ってください。
        </p>
      ) : (
        <ArticleForm action={createArticle} stores={availableStores} />
      )}
    </div>
  );
}
