"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STEP_INTERVAL_MS = 3000;
const TRANSITION_MS = 1000;
// 緩やか→速い→直前で減速してピタッと止まる、よくあるカルーセルの緩急カーブ。
const EASING = "cubic-bezier(0.76, 0, 0.24, 1)";

interface Position {
  left: number;
  width: number;
}

export default function ArticlePhotoStrip({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  const measure = useCallback(() => {
    const row = rowRef.current;
    const container = containerRef.current;
    if (!row || !container) return;
    const rowLeft = row.getBoundingClientRect().left;
    const next = imgRefs.current.slice(0, photos.length).map((img) => {
      if (!img) return { left: 0, width: 0 };
      const rect = img.getBoundingClientRect();
      return { left: rect.left - rowLeft, width: rect.width };
    });
    setPositions((prev) =>
      prev.length === next.length &&
      prev.every((v, i) => v.left === next[i].left && v.width === next[i].width)
        ? prev
        : next
    );
    const total = row.scrollWidth / 2;
    setSegmentWidth((prev) => (prev === total ? prev : total));
    const cw = container.clientWidth;
    setContainerWidth((prev) => (prev === cw ? prev : cw));
  }, [photos.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // 3秒ごとに次の写真へ。写真枚数分進んだら（＝複製分の先頭に到達したら）
  // トランジション完了を待ってから、見た目が同じ本来の先頭位置へ
  // トランジションなしで瞬時に巻き戻し、無限ループに見せる。
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => i + 1), STEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [photos.length]);

  useEffect(() => {
    if (index !== photos.length) return;
    const id = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(id);
  }, [index, photos.length]);

  useEffect(() => {
    if (withTransition) return;
    const id = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(id);
  }, [withTransition]);

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div className="flex h-72 w-full items-center justify-center overflow-hidden bg-zinc-100 sm:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element -- 元の縦横比のまま表示したいため素のimgを使う */}
        <img src={photos[0]} alt={alt} className="h-full w-auto" />
      </div>
    );
  }

  // トップ写真（先頭要素）が初期表示で画面中央に来るよう、常に一定量だけ
  // オフセットしておく（以降のステップもこの分だけ均等にずらしたまま進む）。
  const centerOffset =
    containerWidth && positions[0] ? (containerWidth - positions[0].width) / 2 : 0;
  const rawOffset =
    index === photos.length ? segmentWidth + (positions[0]?.left ?? 0) : (positions[index]?.left ?? 0);
  const targetOffset = rawOffset - centerOffset;

  return (
    <div ref={containerRef} className="h-72 w-full overflow-hidden bg-zinc-100 sm:h-96">
      <div
        ref={rowRef}
        className="flex h-full w-max items-center gap-1"
        style={{
          transform: `translateX(${-targetOffset}px)`,
          transition: withTransition ? `transform ${TRANSITION_MS}ms ${EASING}` : "none",
        }}
      >
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- 元の縦横比のまま表示したいため素のimgを使う
          <img
            key={`a-${i}`}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={src}
            alt={alt}
            onLoad={measure}
            className="h-full w-auto shrink-0"
          />
        ))}
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- 無限ループ用の複製（装飾目的なのでaria-hidden）
          <img key={`b-${i}`} src={src} alt="" aria-hidden className="h-full w-auto shrink-0" />
        ))}
      </div>
    </div>
  );
}
