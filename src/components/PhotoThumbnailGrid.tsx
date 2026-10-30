"use client";

import { useState } from "react";
import Image from "next/image";

const VISIBLE_COUNT = 4;

export default function PhotoThumbnailGrid({
  photos,
  altPrefix,
  onSelect,
}: {
  photos: string[];
  altPrefix: string;
  onSelect: (index: number) => void;
}) {
  const [collageOpen, setCollageOpen] = useState(false);

  // 写真が1枚だけの場合はメイン写真と重複するのでサムネ一覧は出さない。
  if (photos.length <= 1) return null;

  const hasOverflow = photos.length > VISIBLE_COUNT;
  const visiblePhotos = photos.slice(0, VISIBLE_COUNT);
  const remainingCount = photos.length - VISIBLE_COUNT;

  // サムネは拡大表示せず、上のメインスライドを該当位置に動かすだけにする。
  const selectPhoto = (i: number) => {
    onSelect(i);
    setCollageOpen(false);
  };

  return (
    <div className="px-4 pt-3">
      <div className="grid w-1/2 grid-cols-2 gap-1.5">
        {visiblePhotos.map((photo, i) => {
          const isOverflowTile = hasOverflow && i === VISIBLE_COUNT - 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => (isOverflowTile ? setCollageOpen(true) : selectPhoto(i))}
              aria-label={isOverflowTile ? "写真をもっと見る" : "この写真を表示"}
              className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
            >
              <Image
                src={photo}
                alt={`${altPrefix} 写真${i + 1}`}
                fill
                sizes="(max-width: 512px) 25vw, 128px"
                className="object-cover"
                unoptimized
              />
              {isOverflowTile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-bold text-white">
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
                  onClick={() => selectPhoto(i)}
                  aria-label="この写真を表示"
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
    </div>
  );
}
