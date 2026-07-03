"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Store } from "@/types/store";
import IslandBadge from "./IslandBadge";
import GenreTag from "./GenreTag";
import PhotoPlaceholder from "./PhotoPlaceholder";

export default function StoreDetailModal({
  store,
  stores,
  onClose,
  onNavigate,
  onOpenSubmit,
}: {
  store: Store;
  stores: Store[];
  onClose: () => void;
  onNavigate: (store: Store) => void;
  onOpenSubmit: () => void;
}) {
  const maxPhotos = store.isAd ? 20 : 5;
  const photos = store.photos.slice(0, maxPhotos);
  const profileLimit = store.isAd ? 1500 : 400;
  const profile = store.profile.slice(0, profileLimit);
  const fullAddress = `${store.prefecture}${store.town}${store.address}`;
  const yukari = store.village.replace(/ゆかり$/, "").trim();

  const currentIndex = stores.findIndex((s) => s.id === store.id);
  const canNavigate = currentIndex !== -1 && stores.length > 1;
  const goTo = (offset: number) => {
    if (!canNavigate) return;
    const nextIndex = (currentIndex + offset + stores.length) % stores.length;
    onNavigate(stores[nextIndex]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-tsumugi flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-1 border-b px-2 py-2"
          style={{ borderColor: store.region.colorBorder, backgroundColor: store.region.colorSoft }}
        >
          <button
            type="button"
            onClick={() => goTo(-1)}
            disabled={!canNavigate}
            aria-label="前の店舗"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-white/70 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2 px-1">
            <IslandBadge region={store.region} />
            {store.isAd && (
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white">
                PR
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={!canNavigate}
            aria-label="次の店舗"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-white/70 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-lg text-zinc-700 hover:bg-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {photos.length > 0 ? (
            <div className="flex gap-1.5 overflow-x-auto p-3">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative h-52 w-72 shrink-0 overflow-hidden rounded-xl bg-zinc-100"
                >
                  <Image
                    src={photo}
                    alt={`${store.name} 写真${i + 1}`}
                    fill
                    sizes="288px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 p-3">
              <PhotoPlaceholder
                genres={store.genres}
                region={store.region}
                className="rounded-xl"
                iconClassName="h-12 w-12"
              />
            </div>
          )}

          <div className="px-4 pb-4">
            <h2 className="text-2xl font-bold text-zinc-900">{store.name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {store.genres.map((g) => (
                <GenreTag key={g.id} name={g.name} />
              ))}
            </div>

            <dl className="mt-4 space-y-2 text-base text-zinc-700">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-zinc-400">住所</dt>
                <dd>{fullAddress}</dd>
              </div>
              {yukari && (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-400">ゆかり</dt>
                  <dd>{yukari}</dd>
                </div>
              )}
              {store.phone && (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-400">電話</dt>
                  <dd>{store.phone}</dd>
                </div>
              )}
            </dl>

            <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
              {profile}
            </p>

            {store.providerNote && (
              <p className="mt-2 text-sm text-zinc-500">
                情報提供: {store.providerNote}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {store.storeUrl && (
                <a
                  href={store.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  お店のページへ
                </a>
              )}
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`${store.name} ${fullAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Search className="h-4 w-4" />
                Googleで検索する
              </a>
              {store.isAd && store.reservationUrl && (
                <a
                  href={store.reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg px-4 py-3 text-center text-base font-semibold text-white"
                  style={{ backgroundColor: store.region.color }}
                >
                  予約する
                </a>
              )}
            </div>

            <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-500">
              <p>
                お店の情報は最新でない可能性があります。ご利用の前に、現在も営業中かご確認ください。
              </p>
              <p className="mt-1.5">
                本サイトの掲載情報は、原則的にお寄せいただいた口コミを元にしています。もし間違いを見つけられた場合は
                <button
                  type="button"
                  onClick={onOpenSubmit}
                  className="font-semibold text-zinc-600 underline-offset-2 hover:underline"
                >
                  管理者まで
                </button>
                お伝えいただけると助かります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
