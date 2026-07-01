"use client";

import { useActionState, useState } from "react";
import { submitStore, type SubmitState } from "./actions";

interface Option {
  id: string;
  name: string;
}

interface SubmitFormProps {
  genres: Option[];
  regions: Option[];
  stores: Option[];
}

const INITIAL_STATE: SubmitState = { status: "idle" };

export default function SubmitForm({ genres, regions, stores }: SubmitFormProps) {
  const [state, formAction, pending] = useActionState(submitStore, INITIAL_STATE);
  const [kind, setKind] = useState<"new" | "correction">("new");

  if (state.status === "success") {
    return (
      <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        送信ありがとうございました。運営が内容を確認のうえ、掲載いたします。
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="kind"
            value="new"
            checked={kind === "new"}
            onChange={() => setKind("new")}
          />
          新しいお店
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="kind"
            value="correction"
            checked={kind === "correction"}
            onChange={() => setKind("correction")}
          />
          既存店舗の修正
        </label>
      </div>

      {kind === "correction" && (
        <label className="flex flex-col gap-1 text-sm">
          対象の店舗
          <select
            name="targetStoreId"
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        店名
        <input name="name" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        ジャンル
        <select name="genreId" className="rounded-lg border border-zinc-300 px-3 py-2">
          <option value="">選択してください</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        ゆかりの島
        <select name="regionId" className="rounded-lg border border-zinc-300 px-3 py-2">
          <option value="">選択してください</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          都道府県
          <input name="prefecture" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          市区町村
          <input name="town" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        出身集落・町（例: 笠利町出身）
        <input name="village" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        住所
        <input name="address" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        写真URL（1行に1つ）
        <textarea name="photos" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        紹介文
        <textarea name="profile" rows={4} className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        お店のページURL
        <input name="storeUrl" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        電話番号
        <input name="phone" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <hr className="my-2 border-zinc-200" />

      <label className="flex flex-col gap-1 text-sm">
        お名前（必須。「情報提供: 〇〇さん」として公開されます）
        <input
          name="submitterDisplayName"
          type="text"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        連絡先（任意。運営からの確認用で公開されません）
        <input name="submitterContact" type="text" className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        運営へのメッセージ（任意）
        <textarea name="message" rows={2} className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
