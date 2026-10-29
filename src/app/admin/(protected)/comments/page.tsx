import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveComment, rejectComment } from "./actions";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "未承認" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "却下" },
  { value: "all", label: "すべて" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "未承認",
  approved: "承認済み",
  rejected: "却下",
};

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: StatusFilter =
    rawStatus === "approved" || rawStatus === "rejected" || rawStatus === "all"
      ? rawStatus
      : "pending";

  const supabase = createAdminClient();
  let query = supabase
    .from("store_comments")
    .select("*, store:stores(id, name)")
    .order("created_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data: comments } = await query;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">推しコメントの承認</h1>
        <p className="mt-1 text-xs text-zinc-500">
          承認すると店舗詳細モーダルに公開表示されます。
        </p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "pending" ? "/admin/comments" : `/admin/comments?status=${tab.value}`}
            className={`border-b-2 px-3 py-2 text-sm font-semibold ${
              status === tab.value
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {(comments ?? []).length === 0 && (
        <p className="text-sm text-zinc-500">該当するコメントはありません。</p>
      )}

      <ul className="flex flex-col gap-2">
        {(comments ?? []).map((c) => (
          <li key={c.id} className="rounded-lg border border-zinc-200 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-zinc-900">{c.store?.name ?? "(店舗削除済み)"}</p>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                {STATUS_LABEL[c.status] ?? c.status}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-zinc-800">{c.comment}</p>
            <p className="mt-1 text-xs text-zinc-500">
              投稿者: {c.display_name} ／ {new Date(c.created_at).toLocaleString("ja-JP")}
            </p>
            {c.status === "pending" && (
              <div className="mt-2 flex gap-2">
                <form action={approveComment.bind(null, c.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
                  >
                    承認する
                  </button>
                </form>
                <form action={rejectComment.bind(null, c.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    却下する
                  </button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
