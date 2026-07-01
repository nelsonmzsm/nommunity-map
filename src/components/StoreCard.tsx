import type { Store } from "@/types/store";
import StoreSummary from "./StoreSummary";

interface StoreCardProps {
  store: Store;
  isActive: boolean;
  onSelect: (store: Store) => void;
  onOpenDetail: (store: Store) => void;
}

export default function StoreCard({
  store,
  isActive,
  onSelect,
  onOpenDetail,
}: StoreCardProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(store);
        onOpenDetail(store);
      }}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        isActive
          ? "border-zinc-400 bg-zinc-50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <StoreSummary store={store} />
    </button>
  );
}
