import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { logout } from "../actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <nav className="flex gap-4 text-sm font-semibold text-zinc-700">
          <Link href="/admin">ダッシュボード</Link>
          <Link href="/admin/stores">店舗一覧</Link>
          <Link href="/admin/submissions">投稿承認</Link>
          <Link href="/admin/genres">ジャンル管理</Link>
          <Link href="/admin/regions">地域管理</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-xs text-zinc-500 hover:underline">
            ログアウト
          </button>
        </form>
      </header>
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
