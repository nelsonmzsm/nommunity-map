import Link from "next/link";
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
      <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 sm:p-8">
        <Link
          href="/"
          aria-label="閉じる"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ✕
        </Link>

        <h1 className="pr-12 text-lg font-bold text-zinc-900">お店の情報を教える</h1>
        <p className="mt-1 text-sm text-zinc-500">
          新しいお店の情報や、既存の掲載店舗の修正情報を教えてください。いただいた内容は運営が確認のうえ掲載します。
        </p>

        <SubmitForm
          genres={genres ?? []}
          regions={regions ?? []}
          stores={stores ?? []}
        />

        <Link
          href="/"
          className="mt-4 block rounded-lg border border-zinc-300 py-2.5 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          閉じる
        </Link>
      </div>
    </div>
  );
}
