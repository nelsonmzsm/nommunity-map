import Image from "next/image";
import type { Store } from "@/types/store";
import IslandBadge from "./IslandBadge";
import GenreTag from "./GenreTag";
import PhotoPlaceholder from "./PhotoPlaceholder";
import VerifiedBadge from "./VerifiedBadge";

export default function StoreBalloon({
  store,
  onOpenDetail,
}: {
  store: Store;
  onOpenDetail: (store: Store) => void;
}) {
  const photo = store.photos[0];
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(store)}
      className="w-72 text-left"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-zinc-100">
        {photo ? (
          <Image
            src={photo}
            alt={store.name}
            fill
            sizes="288px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <PhotoPlaceholder genres={store.genres} region={store.region} />
        )}
      </div>
      <div className="min-w-0 px-1 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <IslandBadge region={store.region} />
          {store.genres.map((g) => (
            <GenreTag key={g.id} name={g.name} />
          ))}
          <VerifiedBadge verified={store.verified} compact />
        </div>
        <p className="mt-1 truncate text-lg font-bold text-zinc-900">
          {store.name}
        </p>
        <p className="truncate text-sm text-zinc-500">
          {store.prefecture}
          {store.town}
          {store.address}
        </p>
      </div>
    </button>
  );
}
