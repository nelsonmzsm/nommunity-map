import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import StoreForm from "../../StoreForm";
import { updateStore } from "../../actions";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: store }, { data: genres }, { data: regions }, { data: storeGenres }] =
    await Promise.all([
      supabase.from("stores").select("*").eq("id", id).single(),
      supabase.from("genres").select("id, name").eq("is_active", true).order("sort_order"),
      supabase
        .from("regions")
        .select("id, name")
        .eq("group_key", "amami")
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("store_genres").select("genre_id").eq("store_id", id),
    ]);

  if (!store) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">店舗の編集</h1>
      <StoreForm
        action={updateStore.bind(null, id)}
        genres={genres ?? []}
        regions={regions ?? []}
        initial={{ ...store, genre_ids: (storeGenres ?? []).map((sg) => sg.genre_id) }}
      />
    </div>
  );
}
