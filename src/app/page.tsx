"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import MobileActionBar from "@/components/MobileActionBar";
import RecentStoresTicker from "@/components/RecentStoresTicker";
import SearchFilters from "@/components/SearchFilters";
import MapView from "@/components/MapView";
import StoreList from "@/components/StoreList";
import ArticleList from "@/components/ArticleList";
import StoreDetailModal from "@/components/StoreDetailModal";
import SubmitModal from "@/components/SubmitModal";
import type { Genre, Region, Store, StoreFilters } from "@/types/store";
import type { ArticleSummary } from "@/types/article";
import { comparePrefecturesByReading } from "@/lib/prefectures";

const INITIAL_FILTERS: StoreFilters = {
  keyword: "",
  regionIds: [],
  genreIds: [],
  prefecture: "",
};

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoreFilters>(INITIAL_FILTERS);
  const [activePanel, setActivePanel] = useState<"map" | "list" | "articles">("map");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [detailStore, setDetailStore] = useState<Store | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // 初回表示（現在地centeringを尊重したい）と、ユーザーが一度でも
  // 絞り込み条件を操作した後（「すべて」に戻した場合も含む）とで、
  // 地図の自動フォーカス挙動を区別するためのフラグ。
  const [filtersTouched, setFiltersTouched] = useState(false);

  const handleFiltersChange = (next: StoreFilters) => {
    setFiltersTouched(true);
    setFilters(next);
  };

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

  // 記事機能は本体の店舗表示とは独立させ、取得に失敗しても
  // 地図・店舗一覧には一切影響しないようにする（記事欄が出ないだけになる）。
  useEffect(() => {
    let cancelled = false;
    fetch("/api/articles")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setArticles(data);
      })
      .catch(() => {});
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
      .sort((a, b) => {
        // 「海外」は件数に関わらず常に一番下。
        if (a.prefecture === "海外") return 1;
        if (b.prefecture === "海外") return -1;
        // それ以外は店舗数の多い順、同数なら都道府県名のあいうえお順。
        if (b.count !== a.count) return b.count - a.count;
        return comparePrefecturesByReading(a.prefecture, b.prefecture);
      });
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

  // モバイルの「お店を探す」パネルが開いている間は地図の表示領域が
  // 大きく縮んでいるため、その間はfitBounds等のフォーカス処理を
  // 実行しない（誤ったズームになるのを防ぐ）。パネルを閉じた瞬間に
  // 改めてフォーカスさせる。
  // filtersTouchedも条件に含めることで、「都道府県：すべて」に戻すなど
  // 絞り込みをすべて解除した操作の直後も、現在地centeringのままにせず
  // 表示中の店舗（＝全国）に合わせて地図を再フォーカスさせる。
  const shouldFocusMap = (hasActiveFilter || filtersTouched) && !filtersOpen;

  return (
    <div className="flex h-dvh flex-col">
      <Header onOpenSubmit={() => setSubmitOpen(true)} />
      <RecentStoresTicker stores={stores} onSelectStore={openDetail} />
      <SearchFilters
        filters={{ ...filters, prefecture: effectivePrefecture }}
        genres={genres}
        regions={regions}
        prefectureOptions={prefectureOptions}
        onChange={handleFiltersChange}
        view={activePanel}
        onChangeView={setActivePanel}
        shownCount={filteredStores.length}
        totalCount={stores.length}
        filtersOpen={filtersOpen}
        onFiltersOpenChange={setFiltersOpen}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className={`h-full w-full flex-1 sm:block ${
            activePanel === "map" ? "block" : "hidden"
          }`}
        >
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
              読み込み中...
            </div>
          ) : (
            <MapView
              stores={filteredStores}
              regions={regions}
              selectedStoreId={selectedStoreId}
              hasActiveFilter={shouldFocusMap}
              onSelectStore={selectStore}
              onOpenDetail={openDetail}
            />
          )}
        </div>

        <div
          className={`h-full w-full shrink-0 flex-col border-zinc-200 sm:flex sm:w-1/2 sm:border-l lg:w-96 ${
            activePanel === "list" || activePanel === "articles" ? "flex" : "hidden"
          }`}
        >
          <div className="hidden shrink-0 border-b border-zinc-200 sm:flex">
            <button
              type="button"
              onClick={() => setActivePanel("list")}
              className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activePanel === "articles"
                  ? "border-transparent text-zinc-400 hover:text-zinc-600"
                  : "border-zinc-900 text-zinc-900"
              }`}
            >
              お店一覧
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("articles")}
              className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activePanel === "articles"
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              訪問記事一覧
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {activePanel === "articles" ? (
              <ArticleList articles={articles} />
            ) : (
              <StoreList
                stores={filteredStores}
                selectedStoreId={selectedStoreId}
                onSelectStore={(store) => selectStore(store.id)}
                onOpenDetail={openDetail}
              />
            )}
          </div>
        </div>
      </div>

      <MobileActionBar onOpenSubmit={() => setSubmitOpen(true)} />

      {detailStore && (
        <StoreDetailModal
          store={detailStore}
          stores={filteredStores}
          article={articles.find((a) => a.storeId === detailStore.id)}
          onClose={() => setDetailStore(null)}
          onNavigate={openDetail}
        />
      )}

      <SubmitModal open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </div>
  );
}
