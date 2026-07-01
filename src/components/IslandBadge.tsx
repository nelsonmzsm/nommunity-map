import type { Region } from "@/types/store";

export default function IslandBadge({ region }: { region: Region }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
      style={{
        backgroundColor: region.colorSoft,
        color: region.textColor,
        border: `1.5px solid ${region.colorBorder}`,
      }}
    >
      {region.name}
    </span>
  );
}
