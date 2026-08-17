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
  const loopStartRef = useRef<HTMLImageElement | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loopOffset, setLoopOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  // トップ写真の読み込みが完了して実寸で中央寄せの位置が確定するまでは、
  // その位置合わせ自体をアニメーションさせない（＝左端→中央のスライドを見せない）。
  // 未読み込みのimg要素は仮のフォールバック寸法を返すことがあるため、
  // 幅がわかったかどうかではなく、実際のloadイベントで判定する。
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const hasValidCenter = containerWidth > 0 && coverLoaded;

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
    if (loopStartRef.current) {
      const loop = loopStartRef.current.getBoundingClientRect().left - rowLeft;
      setLoopOffset((prev) => (prev === loop ? prev : loop));
    }
    const cw = container.clientWidth;
    setContainerWidth((prev) => (prev === cw ? prev : cw));
  }, [photos.length]);

  const handleImageLoad = useCallback(
    (i: number) => {
      measure();
      if (i === 0) setCoverLoaded(true);
    },
    [measure]
  );

  useEffect(() => {
    measure();
    // ブラウザキャッシュ等で既に読み込み済みの場合はloadイベントが
    // 発火しないため、その場合はここで明示的に完了扱いにする。
    if (imgRefs.current[0]?.complete) handleImageLoad(0);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, handleImageLoad]);

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

  useEffect(() => {
    if (!hasValidCenter || transitionsEnabled) return;
    const id = requestAnimationFrame(() => setTransitionsEnabled(true));
    return () => cancelAnimationFrame(id);
  }, [hasValidCenter, transitionsEnabled]);

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
  const rawOffset = index === photos.length ? loopOffset : (positions[index]?.left ?? 0);
  const targetOffset = rawOffset - centerOffset;

  return (
    <div ref={containerRef} className="h-72 w-full overflow-hidden bg-zinc-100 sm:h-96">
      <div
        ref={rowRef}
        className="flex h-full w-max items-center gap-1"
        style={{
          transform: `translateX(${-targetOffset}px)`,
          transition:
            transitionsEnabled && withTransition
              ? `transform ${TRANSITION_MS}ms ${EASING}`
              : "none",
        }}
      >
        {/* 初期表示（先頭写真を中央配置）で左端が空白にならないよう、
            末尾の写真を装飾として先頭にも置いておく。 */}
        {/* eslint-disable-next-line @next/next/no-img-element -- 左端の余白埋め用の装飾複製 */}
        <img src={photos[photos.length - 1]} alt="" aria-hidden className="h-full w-auto shrink-0" />

        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- 元の縦横比のまま表示したいため素のimgを使う
          <img
            key={`a-${i}`}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={src}
            alt={alt}
            onLoad={() => handleImageLoad(i)}
            className="h-full w-auto shrink-0"
          />
        ))}
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- 無限ループ用の複製（装飾目的なのでaria-hidden）
          <img
            key={`b-${i}`}
            ref={i === 0 ? loopStartRef : undefined}
            src={src}
            alt=""
            aria-hidden
            className="h-full w-auto shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
