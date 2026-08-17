import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ArticleForm from "../../ArticleForm";
import { updateArticle } from "../../actions";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: article }, { data: stores }] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).single(),
    supabase.from("stores").select("id, name").order("name"),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">記事の編集</h1>
      <ArticleForm
        action={updateArticle.bind(null, id)}
        stores={stores ?? []}
        initial={article}
      />
    </div>
  );
}
