"use client";

import { useEffect, useRef, useState } from "react";
import type { Store } from "@/types/store";

const RECENT_DAYS = 30;
const PIXELS_PER_SECOND = 32; // 遅め・一定速度でゆっくり左へ流す

export default function RecentStoresTicker({ stores }: { stores: Store[] }) {
  const segmentRef = useRef<HTMLSpanElement>(null);
  const [durationSeconds, setDurationSeconds] = useState(30);

  const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const recentStores = stores
    .filter((store) => new Date(store.createdAt).getTime() >= since)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const entries = recentStores.map(
    (store) => `店舗名：${store.name}／ゆかり：${store.region.name}／場所：${store.prefecture}${store.town}`
  );
  const message = `最近掲載されたお店　${entries.join("　・　")}　以上、繰り返し。`;

  useEffect(() => {
    if (!segmentRef.current) return;
    const width = segmentRef.current.offsetWidth;
    if (width > 0) {
      setDurationSeconds(Math.max(20, width / PIXELS_PER_SECOND));
    }
  }, [message]);

  if (recentStores.length === 0) return null;

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-hidden border-b border-zinc-200 bg-zinc-900 py-1.5 text-white">
      <span className="shrink-0 pl-3 text-[10px] font-bold tracking-wide text-amber-400">
        NEW
      </span>
      <div
        className="ticker-track flex whitespace-nowrap text-xs font-semibold sm:text-sm"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <span ref={segmentRef} className="px-4">
          {message}
        </span>
        <span className="px-4" aria-hidden="true">
          {message}
        </span>
      </div>
    </div>
  );
}
