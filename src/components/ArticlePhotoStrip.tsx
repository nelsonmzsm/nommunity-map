"use client";

import { useEffect, useRef, useState } from "react";

const PIXELS_PER_SECOND = 50;

function PhotoRow({
  photos,
  alt,
  innerRef,
  hidden,
}: {
  photos: string[];
  alt: string;
  innerRef?: React.Ref<HTMLDivElement>;
  hidden?: boolean;
}) {
  return (
    <div ref={innerRef} aria-hidden={hidden} className="flex h-full shrink-0 items-center gap-1">
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- 各写真を同じ高さ・元の縦横比のまま並べたいため素のimgを使う
        <img key={i} src={src} alt={alt} className="h-full w-auto shrink-0" />
      ))}
    </div>
  );
}

export default function ArticlePhotoStrip({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const segmentRef = useRef<HTMLDivElement>(null);
  const [durationSeconds, setDurationSeconds] = useState(20);

  useEffect(() => {
    if (!segmentRef.current) return;
    const width = segmentRef.current.scrollWidth;
    if (width > 0) setDurationSeconds(Math.max(12, width / PIXELS_PER_SECOND));
  }, [photos.length]);

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div className="flex h-72 w-full items-center justify-center overflow-hidden bg-zinc-100 sm:h-96">
        <PhotoRow photos={photos} alt={alt} />
      </div>
    );
  }

  return (
    <div className="h-72 w-full overflow-hidden bg-zinc-100 sm:h-96">
      <div
        className="photo-strip-track flex h-full"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <PhotoRow photos={photos} alt={alt} innerRef={segmentRef} />
        <PhotoRow photos={photos} alt={alt} hidden />
      </div>
    </div>
  );
}
