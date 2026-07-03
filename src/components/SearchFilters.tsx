import { useState } from "react";
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
  view: "map" | "list";
  onChangeView: (view: "map" | "list") => void;
}

export default function SearchFilters({
  filters,
  genres,
  regions,
  prefectureOptions,
  onChange,
  view,
  onChangeView,
}: SearchFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const prefectureSelect = (
    <select
      value={filters.prefecture}
      onChange={(e) => onChange({ ...filters, prefecture: e.target.value })}
      className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-base font-semibold text-zinc-700"
    >
      <option value="">都道府県: すべて</option>
      {prefectureOptions.map(({ prefecture, count }) => (
        <option key={prefecture} value={prefecture}>
          {prefecture}（{count}）
        </option>
      ))}
    </select>
  );

  return (
    <div className="bg-tsumugi flex flex-col gap-3 border-b border-zinc-200 p-3">
      <input
        type="text"
        value={filters.keyword}
        onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
        placeholder="店名・住所・キーワードで検索"
        className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {regions.map((region) => {
          const active = filters.regionIds.includes(region.id);
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => toggleRegion(region.id)}
              className="shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold transition-opacity sm:px-4 sm:py-2 sm:text-base"
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

        <div className="ml-auto hidden shrink-0 sm:block">
          {prefectureSelect}
        </div>
      </div>

      <div className="flex rounded-full border border-zinc-300 bg-zinc-50 p-1 sm:hidden">
        <button
          type="button"
          onClick={() => onChangeView("map")}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold ${
            view === "map" ? "bg-zinc-900 text-white" : "text-zinc-600"
          }`}
        >
          マップ
        </button>
        <button
          type="button"
          onClick={() => onChangeView("list")}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold ${
            view === "list" ? "bg-zinc-900 text-white" : "text-zinc-600"
          }`}
        >
          リスト
        </button>
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        className="flex items-center justify-center gap-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 sm:hidden"
      >
        {filtersOpen ? "閉じる" : "お店を探す"}
        <span aria-hidden>{filtersOpen ? "▲" : "▼"}</span>
      </button>

      <div
        className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 sm:flex`}
      >
        <div className="sm:hidden">{prefectureSelect}</div>

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
    </div>
  );
}
