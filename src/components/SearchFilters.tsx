import type { Genre, Region, StoreFilters } from "@/types/store";

interface PrefectureOption {
  prefecture: string;
  count: number;
}

interface SearchFiltersProps {
  filters: StoreFilters;
  genres: Genre[];
  regions: Region[];
  prefectureOptions: PrefectureOption[];
  onChange: (filters: StoreFilters) => void;
}

export default function SearchFilters({
  filters,
  genres,
  regions,
  prefectureOptions,
  onChange,
}: SearchFiltersProps) {
  const toggleRegion = (regionId: string) => {
    const regionIds = filters.regionIds.includes(regionId)
      ? filters.regionIds.filter((id) => id !== regionId)
      : [...filters.regionIds, regionId];
    onChange({ ...filters, regionIds });
  };

  const toggleGenre = (genreId: string) => {
    const genreIds = filters.genreIds.includes(genreId)
      ? filters.genreIds.filter((id) => id !== genreId)
      : [...filters.genreIds, genreId];
    onChange({ ...filters, genreIds });
  };

  return (
    <div className="bg-tsumugi flex flex-col gap-3 border-b border-zinc-200 p-3">
      <input
        type="text"
        value={filters.keyword}
        onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
        placeholder="店名・住所・キーワードで検索"
        className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none"
      />

      <div className="scrollbar-none flex flex-nowrap gap-2 overflow-x-auto">
        {regions.map((region) => {
          const active = filters.regionIds.includes(region.id);
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => toggleRegion(region.id)}
              className="shrink-0 rounded-full px-4 py-2 text-base font-semibold transition-opacity"
              style={{
                backgroundColor: active ? region.color : region.colorSoft,
                color: active ? "#ffffff" : region.textColor,
                border: `1.5px solid ${region.colorBorder}`,
              }}
            >
              {region.name}
            </button>
          );
        })}
      </div>

      <select
        value={filters.prefecture}
        onChange={(e) => onChange({ ...filters, prefecture: e.target.value })}
        className="self-start rounded-full border border-zinc-300 bg-white px-4 py-2 text-base font-semibold text-zinc-700"
      >
        <option value="">都道府県: すべて</option>
        {prefectureOptions.map(({ prefecture, count }) => (
          <option key={prefecture} value={prefecture}>
            {prefecture}（{count}）
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => {
          const active = filters.genreIds.includes(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`rounded-full border px-4 py-2 text-base font-semibold ${
                active
                  ? "border-zinc-700 bg-zinc-800 text-white"
                  : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
