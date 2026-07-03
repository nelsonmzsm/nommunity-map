"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import MapView from "@/components/MapView";
import StoreList from "@/components/StoreList";
import StoreDetailModal from "@/components/StoreDetailModal";
import type { Genre, Region, Store, StoreFilters } from "@/types/store";

const INITIAL_FILTERS: StoreFilters = {
  keyword: "",
  regionIds: [],
  genreIds: [],
  prefecture: "",
};

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoreFilters>(INITIAL_FILTERS);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [detailStore, setDetailStore] = useState<Store | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [storesRes, genresRes, regionsRes] = await Promise.all([
        fetch("/api/stores"),
        fetch("/api/genres"),
        fetch("/api/regions"),
      ]);
      const [storesData, genresData, regionsData] = await Promise.all([
        storesRes.json(),
        genresRes.json(),
        regionsRes.json(),
      ]);
      if (!cancelled) {
        setStores(storesData);
        setGenres(genresData);
        setRegions(regionsData);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const storesMatchingNonPrefectureFilters = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return stores.filter((store) => {
      if (
        filters.regionIds.length > 0 &&
        !filters.regionIds.includes(store.region.id)
      ) {
        return false;
      }
      if (
        filters.genreIds.length > 0 &&
        !filters.genreIds.includes(store.genre.id)
      ) {
        return false;
      }
      if (keyword) {
        const haystack =
          `${store.name} ${store.address} ${store.town} ${store.village} ${store.genre.name}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [stores, filters.keyword, filters.regionIds, filters.genreIds]);

  const prefectureOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const store of storesMatchingNonPrefectureFilters) {
      counts.set(store.prefecture, (counts.get(store.prefecture) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([prefecture, count]) => ({ prefecture, count }))
      .sort((a, b) => a.prefecture.localeCompare(b.prefecture, "ja"));
  }, [storesMatchingNonPrefectureFilters]);

  // 絞り込み条件の変更でその都道府県の該当件数が0件になった場合は、
  // 選択中でも「すべて」扱いにする（stateを書き換えずレンダー中に吸収する）。
  const effectivePrefecture = prefectureOptions.some(
    (p) => p.prefecture === filters.prefecture
  )
    ? filters.prefecture
    : "";

  const filteredStores = useMemo(() => {
    if (!effectivePrefecture) return storesMatchingNonPrefectureFilters;
    return storesMatchingNonPrefectureFilters.filter(
      (store) => store.prefecture === effectivePrefecture
    );
  }, [storesMatchingNonPrefectureFilters, effectivePrefecture]);

  return (
    <div className="flex h-dvh flex-col">
      <Header view={mobileView} onChangeView={setMobileView} />
      <SearchFilters
        filters={{ ...filters, prefecture: effectivePrefecture }}
        genres={genres}
        regions={regions}
        prefectureOptions={prefectureOptions}
        onChange={setFilters}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className={`h-full w-full flex-1 sm:block ${
            mobileView === "map" ? "block" : "hidden"
          }`}
        >
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
              読み込み中...
            </div>
          ) : (
            <MapView
              stores={filteredStores}
              selectedStoreId={selectedStoreId}
              prefecture={effectivePrefecture}
              onSelectStore={setSelectedStoreId}
              onOpenDetail={setDetailStore}
            />
          )}
        </div>

        <div
          className={`h-full w-full shrink-0 border-zinc-200 sm:block sm:w-1/2 sm:border-l lg:w-96 ${
            mobileView === "list" ? "block" : "hidden"
          }`}
        >
          <StoreList
            stores={filteredStores}
            selectedStoreId={selectedStoreId}
            onSelectStore={(store) => setSelectedStoreId(store.id)}
            onOpenDetail={setDetailStore}
          />
        </div>
      </div>

      {detailStore && (
        <StoreDetailModal
          store={detailStore}
          onClose={() => setDetailStore(null)}
        />
      )}
    </div>
  );
}
