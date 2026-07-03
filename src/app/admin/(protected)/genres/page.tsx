import { createAdminClient } from "@/lib/supabase/admin";
import { addGenre, toggleGenreActive } from "./actions";

export default async function AdminGenresPage() {
  const supabase = createAdminClient();
  const { data: genres } = await supabase
    .from("genres")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">ジャンル管理</h1>

      <form action={addGenre} className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="新しいジャンル名"
          required
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          追加
        </button>
      </form>

      <ul className="flex flex-col gap-1.5">
        {(genres ?? []).map((genre) => (
          <li
            key={genre.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            <span className={genre.is_active ? "" : "text-zinc-400 line-through"}>
              {genre.name}
            </span>
            <form
              action={toggleGenreActive.bind(null, genre.id, genre.is_active)}
            >
              <button type="submit" className="text-xs text-zinc-500 hover:underline">
                {genre.is_active ? "非表示にする" : "再表示する"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
