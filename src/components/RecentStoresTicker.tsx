"use client";

import { useEffect, useRef, useState } from "react";
import type { Store } from "@/types/store";

const RECENT_DAYS = 30;
const PIXELS_PER_SECOND = 32; // 遅め・一定速度でゆっくり左へ流す

export default function RecentStoresTicker({
  stores,
  onSelectStore,
}: {
  stores: Store[];
  onSelectStore: (store: Store) => void;
}) {
  const segmentRef = useRef<HTMLDivElement>(null);
  const [durationSeconds, setDurationSeconds] = useState(30);

  const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const recentStores = stores
    .filter((store) => new Date(store.createdAt).getTime() >= since)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    if (!segmentRef.current) return;
    const width = segmentRef.current.offsetWidth;
    if (width > 0) {
      setDurationSeconds(Math.max(20, width / PIXELS_PER_SECOND));
    }
  }, [recentStores.length]);

  if (recentStores.length === 0) return null;

  const renderSegment = (copyIndex: 0 | 1) => (
    <div
      key={copyIndex}
      ref={copyIndex === 0 ? segmentRef : undefined}
      aria-hidden={copyIndex === 1}
      className="flex shrink-0 items-center whitespace-nowrap px-4"
    >
      <span>最近掲載されたお店　</span>
      {recentStores.map((store, i) => (
        <span key={store.id} className="flex items-center whitespace-nowrap">
          <button
            type="button"
            tabIndex={copyIndex === 1 ? -1 : 0}
            onClick={() => onSelectStore(store)}
            className="cursor-pointer appearance-none bg-transparent p-0 text-inherit hover:underline"
          >
            店舗名：{store.name}／ゆかり：{store.region.name}／場所：{store.prefecture}
            {store.town}
          </button>
          <span className="px-2">{i < recentStores.length - 1 ? "・" : ""}</span>
        </span>
      ))}
      <span>　以上、繰り返し。</span>
    </div>
  );

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-900 py-1.5 text-white">
      <span className="relative z-10 shrink-0 bg-zinc-900 pl-3 text-[10px] font-bold tracking-wide text-amber-400">
        NEW
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className="ticker-track flex whitespace-nowrap text-xs font-semibold sm:text-sm"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {renderSegment(0)}
          {renderSegment(1)}
        </div>
      </div>
    </div>
  );
}
