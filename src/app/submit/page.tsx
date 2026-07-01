import { createClient } from "@/lib/supabase/server";
import SubmitForm from "./SubmitForm";

export default async function SubmitPage() {
  const supabase = await createClient();

  const [{ data: genres }, { data: regions }, { data: stores }] = await Promise.all([
    supabase.from("genres").select("id, name").eq("is_active", true).order("sort_order"),
    supabase
      .from("regions")
      .select("id, name")
      .eq("group_key", "amami")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("stores").select("id, name").eq("status", "published").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-8">
      <h1 className="text-lg font-bold text-zinc-900">お店の情報を教える</h1>
      <p className="mt-1 text-sm text-zinc-500">
        新しいお店の情報や、既存の掲載店舗の修正情報を教えてください。いただいた内容は運営が確認のうえ掲載します。
      </p>
      <SubmitForm
        genres={genres ?? []}
        regions={regions ?? []}
        stores={stores ?? []}
      />
    </div>
  );
}
