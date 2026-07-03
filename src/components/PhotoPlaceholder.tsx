import type { Genre, Region } from "@/types/store";
import { genreIcon } from "@/lib/genre-icons";

export default function PhotoPlaceholder({
  genres,
  region,
  className,
  iconClassName,
}: {
  genres: Genre[];
  region: Region;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = genreIcon(genres.map((g) => g.name));
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className ?? ""}`}
      style={{ backgroundColor: region.colorSoft }}
    >
      {/* genreIcon always returns one of a fixed set of module-level icon
          components (never creates a new one), so this is safe despite the lint heuristic. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon
        className={iconClassName ?? "h-8 w-8"}
        style={{ color: region.color }}
        strokeWidth={1.5}
      />
    </div>
  );
}
