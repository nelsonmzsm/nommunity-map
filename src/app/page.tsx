"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import MobileActionBar from "@/components/MobileActionBar";
import RecentStoresTicker from "@/components/RecentStoresTicker";
import SearchFilters from "@/components/SearchFilters";
import MapView from "@/components/MapView";
import StoreList from "@/components/StoreList";
import StoreDetailModal from "@/components/StoreDetailModal";
import SubmitModal from "@/components/SubmitModal";
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
  const [submitOpen, setSubmitOpen] = useState(false);

  const selectStore = (id: string | null) => {
    setSelectedStoreId(id);
    const url = id ? `${window.location.pathname}?store=${id}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  };

  const openDetail = (store: Store) => {
    selectStore(store.id);
    setDetailStore(store);
  };

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

        const storeId = new URLSearchParams(window.location.search).get("store");
        if (storeId) {
          const store = (storesData as Store[]).find((s) => s.id === storeId);
          if (store) {
            setSelectedStoreId(store.id);
            setDetailStore(store);
          }
        }
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
        !store.genres.some((genre) => filters.genreIds.includes(genre.id))
      ) {
        return false;
      }
      if (keyword) {
        const genreNames = store.genres.map((g) => g.name).join(" ");
        const haystack =
          `${store.name} ${store.address} ${store.town} ${store.village} ${genreNames}`.toLowerCase();
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

  const hasActiveFilter =
    filters.keyword.trim() !== "" ||
    filters.regionIds.length > 0 ||
    filters.genreIds.length > 0 ||
    effectivePrefecture !== "";

  return (
    <div className="flex h-dvh flex-col">
      <Header onOpenSubmit={() => setSubmitOpen(true)} />
      <RecentStoresTicker stores={stores} />
      <SearchFilters
        filters={{ ...filters, prefecture: effectivePrefecture }}
        genres={genres}
        regions={regions}
        prefectureOptions={prefectureOptions}
        onChange={setFilters}
        view={mobileView}
        onChangeView={setMobileView}
        shownCount={filteredStores.length}
        totalCount={stores.length}
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
              hasActiveFilter={hasActiveFilter}
              onSelectStore={selectStore}
              onOpenDetail={openDetail}
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
            onSelectStore={(store) => selectStore(store.id)}
            onOpenDetail={openDetail}
          />
        </div>
      </div>

      <MobileActionBar onOpenSubmit={() => setSubmitOpen(true)} />

      {detailStore && (
        <StoreDetailModal
          store={detailStore}
          stores={filteredStores}
          onClose={() => setDetailStore(null)}
          onNavigate={openDetail}
          onOpenSubmit={() => {
            setDetailStore(null);
            setSubmitOpen(true);
          }}
        />
      )}

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} />}
    </div>
  );
}
