import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { approvePhoto, rejectPhoto, hidePhoto, restorePhoto, deletePhoto } from "./actions";

type StatusFilter = "pending" | "approved" | "rejected" | "hidden" | "all";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "未承認" },
  { value: "approved", label: "承認済み" },
  { value: "hidden", label: "非表示" },
  { value: "rejected", label: "却下" },
  { value: "all", label: "すべて" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "未承認",
  approved: "承認済み",
  rejected: "却下",
  hidden: "非表示",
};

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: StatusFilter =
    rawStatus === "approved" ||
    rawStatus === "rejected" ||
    rawStatus === "hidden" ||
    rawStatus === "all"
      ? rawStatus
      : "pending";

  const supabase = createAdminClient();
  let query = supabase
    .from("store_photo_submissions")
    .select("*, store:stores(id, name)")
    .order("created_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data: photos } = await query;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">写真投稿の承認</h1>
        <p className="mt-1 text-xs text-zinc-500">
          承認すると店舗詳細モーダルの写真の先頭に表示されます。
        </p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "pending" ? "/admin/photos" : `/admin/photos?status=${tab.value}`}
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

      {(photos ?? []).length === 0 && (
        <p className="text-sm text-zinc-500">該当する写真はありません。</p>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(photos ?? []).map((p) => (
          <li key={p.id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage上の任意URLのプレビュー表示のため next/image のドメイン許可設定が不要なimgを使う */}
            <img
              src={p.photo_url}
              alt=""
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-zinc-900">{p.store?.name ?? "(店舗削除済み)"}</p>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </div>
            {p.comment && (
              <p className="whitespace-pre-wrap text-zinc-700">{p.comment}</p>
            )}
            <p className="text-xs text-zinc-500">
              投稿者: {p.display_name} ／ {new Date(p.created_at).toLocaleString("ja-JP")}
            </p>
            {p.status === "pending" && (
              <div className="flex gap-2">
                <form action={approvePhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
                  >
                    承認する
                  </button>
                </form>
                <form action={rejectPhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    却下する
                  </button>
                </form>
              </div>
            )}
            {p.status === "approved" && (
              <div className="flex gap-2">
                <form action={hidePhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    非表示にする
                  </button>
                </form>
                <form action={deletePhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    削除する
                  </button>
                </form>
              </div>
            )}
            {p.status === "hidden" && (
              <div className="flex gap-2">
                <form action={restorePhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
                  >
                    再承認する
                  </button>
                </form>
                <form action={deletePhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    削除する
                  </button>
                </form>
              </div>
            )}
            {p.status === "rejected" && (
              <div className="flex gap-2">
                <form action={deletePhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    削除する
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
