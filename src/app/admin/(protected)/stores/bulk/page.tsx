import { createClient } from "@/lib/supabase/server";
import BulkImportForm from "./BulkImportForm";

export default async function BulkImportPage() {
  const supabase = await createClient();
  const [{ data: genres }, { data: regions }] = await Promise.all([
    supabase.from("genres").select("id, name").eq("is_active", true).order("sort_order"),
    supabase
      .from("regions")
      .select("id, name")
      .eq("group_key", "amami")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">店舗の一括登録</h1>
      <BulkImportForm genres={genres ?? []} regions={regions ?? []} />
    </div>
  );
}
