import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleStoreStatus, toggleStoreVerified, deleteStore } from "./actions";
import DeleteStoreButton from "./DeleteStoreButton";

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const { verified } = await searchParams;
  const supabase = createAdminClient();
  let query = supabase
    .from("stores")
    .select("*, store_genres(genre:genres(name)), region:regions(name)")
    .order("created_at", { ascending: false });
  if (verified === "true") query = query.eq("verified", true);
  if (verified === "false") query = query.eq("verified", false);
  const { data: stores } = await query;

  const filterLink = (value?: string) => (value ? `/admin/stores?verified=${value}` : "/admin/stores");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">店舗一覧</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/stores/bulk"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            一括登録
          </Link>
          <Link
            href="/admin/stores/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            新規追加
          </Link>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        {[
          { label: "すべて", value: undefined },
          { label: "裏取り済みのみ", value: "true" },
          { label: "未確認のみ", value: "false" },
        ].map((opt) => (
          <Link
            key={opt.label}
            href={filterLink(opt.value)}
            className={`rounded-full border px-3 py-1 ${
              verified === opt.value
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500">
            <th className="py-2">店名</th>
            <th>ジャンル</th>
            <th>島</th>
            <th>住所</th>
            <th>状態</th>
            <th>裏取り</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(stores ?? []).map((store) => (
            <tr key={store.id} className="border-b border-zinc-100">
              <td className="py-2 font-semibold">{store.name}</td>
              <td>{store.store_genres.map((sg) => sg.genre?.name).join("・")}</td>
              <td>{store.region?.name}</td>
              <td className="text-zinc-500">
                {store.prefecture}
                {store.town}
                {store.address}
              </td>
              <td>{store.status === "published" ? "公開中" : "非公開"}</td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    store.verified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {store.verified ? "裏取り済み" : "未確認"}
                </span>
              </td>
              <td className="space-x-3 text-right">
                <Link
                  href={`/admin/stores/${store.id}/edit`}
                  className="text-zinc-600 hover:underline"
                >
                  編集
                </Link>
                <form
                  className="inline"
                  action={toggleStoreVerified.bind(null, store.id, store.verified)}
                >
                  <button type="submit" className="text-zinc-600 hover:underline">
                    {store.verified ? "未確認に戻す" : "裏取り済みにする"}
                  </button>
                </form>
                <form
                  className="inline"
                  action={toggleStoreStatus.bind(null, store.id, store.status)}
                >
                  <button type="submit" className="text-zinc-600 hover:underline">
                    {store.status === "published" ? "非公開にする" : "公開する"}
                  </button>
                </form>
                <DeleteStoreButton
                  action={deleteStore.bind(null, store.id)}
                  storeName={store.name}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
