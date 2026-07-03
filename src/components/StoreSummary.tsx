import Image from "next/image";
import type { Store } from "@/types/store";
import IslandBadge from "./IslandBadge";

export default function StoreSummary({ store }: { store: Store }) {
  const photo = store.photos[0];
  return (
    <div className="flex gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {photo ? (
          <Image
            src={photo}
            alt={store.name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            No Image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <IslandBadge region={store.region} />
          <span className="text-sm text-zinc-500">
            {store.genres.map((g) => g.name).join("・")}
          </span>
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
    </div>
  );
}
