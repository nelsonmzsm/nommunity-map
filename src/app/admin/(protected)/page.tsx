import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [{ count: pendingCount }, { count: storeCount }] = await Promise.all([
    supabase
      .from("store_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">ダッシュボード</h1>
      <div className="flex gap-4">
        <Link
          href="/admin/submissions"
          className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <p className="text-xs text-zinc-500">未承認の投稿</p>
          <p className="text-2xl font-bold text-zinc-900">{pendingCount ?? 0}件</p>
        </Link>
        <Link
          href="/admin/stores"
          className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <p className="text-xs text-zinc-500">公開中の店舗数</p>
          <p className="text-2xl font-bold text-zinc-900">{storeCount ?? 0}件</p>
        </Link>
      </div>
    </div>
  );
}
