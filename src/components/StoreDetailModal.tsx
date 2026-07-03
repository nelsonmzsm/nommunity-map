"use client";

import Image from "next/image";
import Link from "next/link";
import type { Store } from "@/types/store";
import IslandBadge from "./IslandBadge";

export default function StoreDetailModal({
  store,
  onClose,
}: {
  store: Store;
  onClose: () => void;
}) {
  const maxPhotos = store.isAd ? 20 : 5;
  const photos = store.photos.slice(0, maxPhotos);
  const profileLimit = store.isAd ? 1500 : 400;
  const profile = store.profile.slice(0, profileLimit);

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
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: store.region.colorBorder, backgroundColor: store.region.colorSoft }}
        >
          <div className="flex items-center gap-2">
            <IslandBadge region={store.region} />
            {store.isAd && (
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white">
                PR
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-lg text-zinc-700 hover:bg-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {photos.length > 0 && (
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
          )}

          <div className="px-4 pb-4">
            <h2 className="text-2xl font-bold text-zinc-900">{store.name}</h2>
            <p className="mt-1 text-base text-zinc-500">
              {store.genres.map((g) => g.name).join("・")}
            </p>

            <dl className="mt-4 space-y-2 text-base text-zinc-700">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-zinc-400">住所</dt>
                <dd>
                  {store.prefecture}
                  {store.town}
                  {store.address}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-zinc-400">町・集落</dt>
                <dd>
                  {store.town} / {store.village}
                </dd>
              </div>
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
                お店の情報は最新のものでない可能性があります。予約などのお問い合わせは、現在も営業中かどうかご確認をお願いいたします。
              </p>
              <p className="mt-1.5">
                本サイトに掲載されている情報は、基本的に口コミで収集したものですが、間違いを発見した場合は
                <Link href="/submit" className="font-semibold text-zinc-600 underline-offset-2 hover:underline">
                  管理者まで
                </Link>
                お伝えいただけると助かります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
