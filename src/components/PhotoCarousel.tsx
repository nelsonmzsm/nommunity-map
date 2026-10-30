"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 30;

export default function PhotoCarousel({
  photos,
  altPrefix,
  index,
  onChangeIndex,
}: {
  photos: string[];
  altPrefix: string;
  index: number;
  onChangeIndex: (index: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  // indexが変わるたびに5秒後の次送りを予約し直すことで、自動スライドと
  // 手動操作（矢印・スワイプ・サムネ選択）を同じタイマーで一本化している。
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setTimeout(() => {
      onChangeIndex((index + 1) % photos.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [photos.length, index, onChangeIndex]);

  if (photos.length === 0) return null;

  const goTo = (next: number) => {
    onChangeIndex(((next % photos.length) + photos.length) % photos.length);
  };

  return (
    <div
      className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-100"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
        goTo(index + (delta < 0 ? 1 : -1));
      }}
    >
      {photos.map((photo, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
        >
          <Image
            src={photo}
            alt={`${altPrefix} 写真${i + 1}`}
            fill
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
            unoptimized
          />
        </div>
      ))}

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="前の写真"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="次の写真"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
          <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-semibold text-white">
            {index + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  );
}
