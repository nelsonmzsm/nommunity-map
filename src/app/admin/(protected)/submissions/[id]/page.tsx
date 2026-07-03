import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveSubmission, rejectSubmission } from "../actions";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("store_submissions")
    .select("*, region:regions(name), target_store:stores(name)")
    .eq("id", id)
    .single();

  if (!submission) {
    notFound();
  }

  const { data: submissionGenres } =
    submission.genre_ids.length > 0
      ? await supabase.from("genres").select("name").in("id", submission.genre_ids)
      : { data: [] };

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-900">投稿の確認</h1>

      <dl className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 text-sm">
        {submission.target_store && (
          <div>
            <dt className="text-xs text-zinc-400">対象店舗（修正提案）</dt>
            <dd>{submission.target_store.name}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-zinc-400">店名</dt>
          <dd>{submission.name || "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">ジャンル</dt>
          <dd>
            {(submissionGenres ?? []).map((g) => g.name).join("・") || "-"}
            {submission.genre_other_text && `（${submission.genre_other_text}）`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">島</dt>
          <dd>{submission.region?.name || "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">住所</dt>
          <dd>
            {submission.prefecture} {submission.town} {submission.address || "-"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">お店関係者の出身集落・町</dt>
          <dd>{submission.village || "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">おすすめのコメント</dt>
          <dd className="whitespace-pre-wrap">{submission.profile || "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">写真</dt>
          <dd className="whitespace-pre-wrap">{submission.photos.join("\n") || "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-400">登録者（投稿者）の情報</dt>
          <dd>
            {submission.submitter_display_name}
            {submission.submitter_relation && (
              <span className="ml-1 text-xs text-zinc-500">
                （{submission.submitter_relation === "self" ? "自薦・お店関係者" : "他薦・常連客など"}）
              </span>
            )}
            {submission.submitter_contact && `（連絡先: ${submission.submitter_contact}）`}
          </dd>
        </div>
        {submission.message && (
          <div>
            <dt className="text-xs text-zinc-400">運営へのメッセージ</dt>
            <dd className="whitespace-pre-wrap">{submission.message}</dd>
          </div>
        )}
      </dl>

      {!submission.target_store_id && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          新規店舗の投稿です。承認前に緯度・経度が未設定の場合は、承認後に店舗編集画面から地図の座標を入力してください。
        </p>
      )}

      <div className="flex gap-3">
        <form action={approveSubmission.bind(null, id)}>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            承認する
          </button>
        </form>
        <form action={rejectSubmission.bind(null, id, "")}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            却下する
          </button>
        </form>
      </div>
    </div>
  );
}
