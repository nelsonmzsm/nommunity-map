"use client";

import { useState } from "react";
import Image from "next/image";

const VISIBLE_COUNT = 4;

export default function PhotoThumbnailGrid({
  photos,
  altPrefix,
}: {
  photos: string[];
  altPrefix: string;
}) {
  const [collageOpen, setCollageOpen] = useState(false);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);

  // 写真が1枚だけの場合はメイン写真と重複するのでサムネ一覧は出さない。
  if (photos.length <= 1) return null;

  const hasOverflow = photos.length > VISIBLE_COUNT;
  const visiblePhotos = photos.slice(0, VISIBLE_COUNT);
  const remainingCount = photos.length - VISIBLE_COUNT;

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5 px-4 pt-3">
        {visiblePhotos.map((photo, i) => {
          const isOverflowTile = hasOverflow && i === VISIBLE_COUNT - 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => (isOverflowTile ? setCollageOpen(true) : setEnlargedIndex(i))}
              aria-label={isOverflowTile ? "写真をもっと見る" : "写真を拡大"}
              className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
            >
              <Image
                src={photo}
                alt={`${altPrefix} 写真${i + 1}`}
                fill
                sizes="(max-width: 512px) 50vw, 256px"
                className="object-cover"
                unoptimized
              />
              {isOverflowTile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                  もっと見る{remainingCount > 0 && <span className="ml-1">+{remainingCount}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {collageOpen && (
        <div
          className="fixed inset-0 z-[62] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setCollageOpen(false);
          }}
        >
          <div
            className="bg-tsumugi flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-zinc-900">写真一覧</h3>
              <button
                type="button"
                onClick={() => setCollageOpen(false)}
                aria-label="閉じる"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEnlargedIndex(i)}
                  aria-label="写真を拡大"
                  className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
                >
                  <Image
                    src={photo}
                    alt={`${altPrefix} 写真${i + 1}`}
                    fill
                    sizes="33vw"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {enlargedIndex !== null && (
        <div
          className="fixed inset-0 z-[66] flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setEnlargedIndex(null);
          }}
        >
          <button
            type="button"
            onClick={() => setEnlargedIndex(null)}
            aria-label="閉じる"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg leading-none text-zinc-700 hover:bg-white"
          >
            ✕
          </button>
          <div
            className="relative h-full max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[enlargedIndex]}
              alt={`${altPrefix} 写真${enlargedIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
