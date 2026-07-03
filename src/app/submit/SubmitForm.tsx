"use client";

import { useActionState, useState } from "react";
import { submitStore, type SubmitState } from "./actions";
import prefectureCities from "@/data/japan-prefectures-cities.json";

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
const OTHER_GENRE_NAME = "その他の飲食店";
const UNCONFIRMED_REGION_NAME = "未確認";
const PREFECTURES = Object.keys(prefectureCities);
const MAX_PHOTO_MB = 5;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;

export default function SubmitForm({ genres, regions, stores }: SubmitFormProps) {
  const [state, formAction, pending] = useActionState(submitStore, INITIAL_STATE);
  const [kind, setKind] = useState<"new" | "correction">("new");
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [prefecture, setPrefecture] = useState("");

  const selectableRegions = regions.filter((r) => r.name !== UNCONFIRMED_REGION_NAME);
  const otherGenre = genres.find((g) => g.name === OTHER_GENRE_NAME);
  const isOtherGenre = otherGenre != null && genreIds.includes(otherGenre.id);
  const cities: string[] = prefecture
    ? (prefectureCities as Record<string, string[]>)[prefecture] ?? []
    : [];
  const oversizedPhotos = photoFiles.filter((f) => f.size > MAX_PHOTO_BYTES);

  const toggleGenre = (id: string) => {
    setGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  if (state.status === "success") {
    return (
      <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        送信ありがとうございました。運営が内容を確認のうえ、掲載いたします。
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        投稿者とお店の関係
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5">
            <input type="radio" name="submitterRelation" value="self" required />
            自薦（お店関係者です）
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="submitterRelation" value="other" required />
            他薦（お客さん・常連さんなど）
          </label>
        </div>
      </label>

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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
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
        <input name="name" type="text" className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend>ジャンル（複数選択できます）</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {genres.map((genre) => (
            <label key={genre.id} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                name="genreIds"
                value={genre.id}
                checked={genreIds.includes(genre.id)}
                onChange={() => toggleGenre(genre.id)}
              />
              {genre.name}
            </label>
          ))}
        </div>
      </fieldset>

      {isOtherGenre && (
        <label className="flex flex-col gap-1 text-sm">
          ジャンル（自由記入）
          <input
            name="genreOtherText"
            type="text"
            placeholder="例: ラーメン店"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        ゆかりの島
        <select name="regionId" className="rounded-lg border border-zinc-300 bg-white px-3 py-2">
          <option value="">選択してください</option>
          {selectableRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          都道府県
          <select
            name="prefecture"
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          市区町村
          <select
            name="town"
            disabled={!prefecture}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 disabled:bg-zinc-100"
          >
            <option value="">{prefecture ? "選択してください" : "都道府県を先に選択"}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        以降の住所（市区町村より後ろ。例: 道頓堀2-4-7 2F）
        <input name="address" type="text" className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        お店とゆかりのある集落（例: 和泊町国頭）
        <input name="village" type="text" className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        写真（複数選択できます。1枚あたり{MAX_PHOTO_MB}MBまで）
        <input
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5"
        />
        {photoFiles.length > 0 && (
          <span className="text-xs text-zinc-500">
            {photoFiles.map((f) => f.name).join(" / ")}
          </span>
        )}
        {oversizedPhotos.length > 0 && (
          <span className="text-xs text-red-600">
            {MAX_PHOTO_MB}MBを超えている写真があります: {oversizedPhotos.map((f) => f.name).join(" / ")}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        おすすめのコメント（このお店の好きなところなど自由にどうぞ）
        <textarea name="profile" rows={4} className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        お店のページURL
        <input name="storeUrl" type="text" className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        電話番号
        <input name="phone" type="text" className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <p className="text-xs text-zinc-500">
        アップロードいただいた情報（画像含む）は、サイト上に掲載する可能性があります。
      </p>

      <hr className="my-2 border-zinc-200" />

      <div>
        <h2 className="text-sm font-bold text-zinc-900">登録者（あなた）の情報（任意）</h2>
        <p className="mt-0.5 text-xs text-zinc-500">情報確認のために連絡する可能性があります。</p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        お名前（必須・ニックネーム可）
        <input
          name="submitterDisplayName"
          type="text"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="creditName" value="yes" className="mt-1" />
        あなたの名前を情報提供者の一人として追加してもいいですか？（チェックすると「情報提供:
        〇〇さん」として店舗ページに公開されます）
      </label>

      <label className="flex flex-col gap-1 text-sm">
        連絡先（任意。運営からの確認用で公開されません）
        <input name="submitterContact" type="text" className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        運営へのメッセージ（任意）
        <textarea name="message" rows={2} className="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
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
