interface Option {
  id: string;
  name: string;
}

interface StoreFormValues {
  name?: string;
  genre_id?: string;
  region_id?: string;
  prefecture?: string;
  town?: string;
  village?: string;
  address?: string;
  lat?: number;
  lng?: number;
  photos?: string[];
  profile?: string;
  store_url?: string | null;
  phone?: string | null;
  is_ad?: boolean;
  reservation_url?: string | null;
  provider_note?: string | null;
}

export default function StoreForm({
  action,
  genres,
  regions,
  initial,
}: {
  action: (formData: FormData) => void;
  genres: Option[];
  regions: Option[];
  initial?: StoreFormValues;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        店名
        <input
          name="name"
          type="text"
          required
          defaultValue={initial?.name}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        ジャンル
        <select
          name="genreId"
          required
          defaultValue={initial?.genre_id}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="">選択してください</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        島
        <select
          name="regionId"
          required
          defaultValue={initial?.region_id}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
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
          <input
            name="prefecture"
            type="text"
            required
            defaultValue={initial?.prefecture}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          市区町村
          <input
            name="town"
            type="text"
            required
            defaultValue={initial?.town}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        出身集落・町
        <input
          name="village"
          type="text"
          required
          defaultValue={initial?.village}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        住所
        <input
          name="address"
          type="text"
          required
          defaultValue={initial?.address}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          緯度(lat)
          <input
            name="lat"
            type="number"
            step="any"
            required
            defaultValue={initial?.lat}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          経度(lng)
          <input
            name="lng"
            type="number"
            step="any"
            required
            defaultValue={initial?.lng}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        写真URL（1行に1つ）
        <textarea
          name="photos"
          rows={3}
          defaultValue={initial?.photos?.join("\n")}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        紹介文
        <textarea
          name="profile"
          rows={4}
          defaultValue={initial?.profile}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        お店のページURL
        <input
          name="storeUrl"
          type="text"
          defaultValue={initial?.store_url ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        電話番号
        <input
          name="phone"
          type="text"
          defaultValue={initial?.phone ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        情報提供者メモ（公開表示されます）
        <input
          name="providerNote"
          type="text"
          defaultValue={initial?.provider_note ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="isAd"
          type="checkbox"
          defaultChecked={initial?.is_ad}
        />
        広告枠（写真・紹介文の掲載上限拡大、予約導線を表示）
      </label>

      <label className="flex flex-col gap-1 text-sm">
        予約URL（広告枠のみ表示）
        <input
          name="reservationUrl"
          type="text"
          defaultValue={initial?.reservation_url ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        保存する
      </button>
    </form>
  );
}
