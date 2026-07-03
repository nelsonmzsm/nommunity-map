import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleStoreStatus, deleteStore } from "./actions";
import DeleteStoreButton from "./DeleteStoreButton";

export default async function AdminStoresPage() {
  const supabase = createAdminClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("*, store_genres(genre:genres(name)), region:regions(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">店舗一覧</h1>
        <Link
          href="/admin/stores/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          新規追加
        </Link>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500">
            <th className="py-2">店名</th>
            <th>ジャンル</th>
            <th>島</th>
            <th>状態</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(stores ?? []).map((store) => (
            <tr key={store.id} className="border-b border-zinc-100">
              <td className="py-2 font-semibold">{store.name}</td>
              <td>{store.store_genres.map((sg) => sg.genre?.name).join("・")}</td>
              <td>{store.region?.name}</td>
              <td>{store.status === "published" ? "公開中" : "非公開"}</td>
              <td className="space-x-3 text-right">
                <Link
                  href={`/admin/stores/${store.id}/edit`}
                  className="text-zinc-600 hover:underline"
                >
                  編集
                </Link>
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
