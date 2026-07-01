import { createClient } from "@/lib/supabase/server";
import { addRegion, toggleRegionActive } from "./actions";

export default async function AdminRegionsPage() {
  const supabase = await createClient();
  const { data: regions } = await supabase
    .from("regions")
    .select("*")
    .eq("group_key", "amami")
    .order("sort_order");

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">地域管理（奄美群島）</h1>
      <p className="text-xs text-zinc-500">
        現在は奄美群島（group_key = amami）のみ表示しています。将来他地域を扱う場合は別のgroup_keyで管理します。
      </p>

      <form action={addRegion} className="flex flex-wrap gap-2">
        <input
          name="name"
          type="text"
          placeholder="表示名（例: 奄美大島）"
          required
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="key"
          type="text"
          placeholder="キー（例: amami）"
          required
          className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="color"
          type="color"
          defaultValue="#8FA3C9"
          className="h-10 w-14 rounded-lg border border-zinc-300"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          追加
        </button>
      </form>

      <ul className="flex flex-col gap-1.5">
        {(regions ?? []).map((region) => (
          <li
            key={region.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: region.color }}
              />
              <span className={region.is_active ? "" : "text-zinc-400 line-through"}>
                {region.name}
              </span>
            </span>
            <form
              action={toggleRegionActive.bind(null, region.id, region.is_active)}
            >
              <button type="submit" className="text-xs text-zinc-500 hover:underline">
                {region.is_active ? "非表示にする" : "再表示する"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
