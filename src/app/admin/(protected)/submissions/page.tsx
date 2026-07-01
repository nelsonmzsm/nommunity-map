import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("store_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">未承認の投稿</h1>

      {(submissions ?? []).length === 0 && (
        <p className="text-sm text-zinc-500">未承認の投稿はありません。</p>
      )}

      <ul className="flex flex-col gap-2">
        {(submissions ?? []).map((s) => (
          <li key={s.id}>
            <Link
              href={`/admin/submissions/${s.id}`}
              className="block rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50"
            >
              <p className="font-semibold text-zinc-900">
                {s.name ?? "(修正提案・店名未入力)"}
                {s.target_store_id && (
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    既存店舗の修正
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-500">
                情報提供: {s.submitter_display_name} / {new Date(s.created_at).toLocaleString("ja-JP")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
