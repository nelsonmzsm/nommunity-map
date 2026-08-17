"use client";

import ArticleBodyEditor from "./ArticleBodyEditor";

interface StoreOption {
  id: string;
  name: string;
  prefecture: string;
  town: string;
  address: string;
}

interface ArticleFormValues {
  store_id?: string;
  slug?: string;
  title?: string;
  cover_photo?: string | null;
  body?: string;
  status?: "draft" | "published";
}

function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ArticleForm({
  action,
  stores,
  initial,
}: {
  action: (formData: FormData) => void;
  stores: StoreOption[];
  initial?: ArticleFormValues;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-3">
      <p className="text-xs text-zinc-500">
        <span className="text-red-600">※</span> は必須項目です
      </p>

      <label className="flex flex-col gap-1 text-sm">
        対象の店舗 <span className="text-red-600">※</span>
        <select
          name="storeId"
          required
          defaultValue={initial?.store_id}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="">選択してください</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}（{store.prefecture}
              {store.town}
              {store.address}）
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        タイトル <span className="text-red-600">※</span>
        <input
          name="title"
          type="text"
          required
          defaultValue={initial?.title}
          onChange={(e) => {
            const slugInput = e.currentTarget.form?.elements.namedItem(
              "slug"
            ) as HTMLInputElement | null;
            if (slugInput && !slugInput.dataset.touched) {
              slugInput.value = slugify(e.currentTarget.value);
            }
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        URLスラッグ（例: amami-kitchen-sumiya） <span className="text-red-600">※</span>
        <input
          name="slug"
          type="text"
          required
          pattern="[a-z0-9\-]+"
          defaultValue={initial?.slug}
          onChange={(e) => {
            e.currentTarget.dataset.touched = "true";
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        カバー写真URL
        <input
          name="coverPhoto"
          type="text"
          defaultValue={initial?.cover_photo ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <ArticleBodyEditor initialBody={initial?.body} />

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend>公開状態</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="status"
              value="draft"
              defaultChecked={(initial?.status ?? "draft") === "draft"}
            />
            下書き
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="status"
              value="published"
              defaultChecked={initial?.status === "published"}
            />
            公開する
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        保存する
      </button>
    </form>
  );
}
