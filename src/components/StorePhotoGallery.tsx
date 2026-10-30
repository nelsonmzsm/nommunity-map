"use client";

import { useState } from "react";
import PhotoCarousel from "./PhotoCarousel";
import PhotoThumbnailGrid from "./PhotoThumbnailGrid";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { Genre, Region } from "@/types/store";

export default function StorePhotoGallery({
  photos,
  altPrefix,
  genres,
  region,
}: {
  photos: string[];
  altPrefix: string;
  genres: Genre[];
  region: Region;
}) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-[3/2] w-full">
        <PhotoPlaceholder genres={genres} region={region} iconClassName="h-12 w-12" />
      </div>
    );
  }

  return (
    <>
      <PhotoCarousel photos={photos} altPrefix={altPrefix} index={index} onChangeIndex={setIndex} />
      <PhotoThumbnailGrid photos={photos} altPrefix={altPrefix} onSelect={setIndex} />
    </>
  );
}
