import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

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

export default async function AdminSubmissionsPage({
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
    .from("store_submissions")
    .select("*, target_store:stores(id, name)")
    .order("created_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data: submissions } = await query;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">投稿の管理</h1>
        <p className="mt-1 text-xs text-zinc-500">
          投稿者の連絡先は承認・却下にかかわらず削除されず、この一覧からいつでも確認できます。
        </p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "pending" ? "/admin/submissions" : `/admin/submissions?status=${tab.value}`}
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

      {(submissions ?? []).length === 0 && (
        <p className="text-sm text-zinc-500">該当する投稿はありません。</p>
      )}

      <ul className="flex flex-col gap-2">
        {(submissions ?? []).map((s) => (
          <li key={s.id}>
            <Link
              href={`/admin/submissions/${s.id}`}
              className="block rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-zinc-900">
                  {s.name ?? "(修正提案・店名未入力)"}
                </p>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
                {s.target_store_id && !s.target_store && (
                  <span className="text-xs text-zinc-400">（登録先の店舗は削除済み）</span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                投稿者: {s.submitter_display_name}
                {s.submitter_contact && ` ／ 連絡先: ${s.submitter_contact}`}
                {" ／ "}
                {new Date(s.created_at).toLocaleString("ja-JP")}
              </p>
              {s.target_store && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  登録された店舗: {s.target_store.name}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
