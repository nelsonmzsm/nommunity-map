import type { Store } from "@/types/store";
import StoreCard from "./StoreCard";

interface StoreListProps {
  stores: Store[];
  selectedStoreId: string | null;
  onSelectStore: (store: Store) => void;
  onOpenDetail: (store: Store) => void;
}

export default function StoreList({
  stores,
  selectedStoreId,
  onSelectStore,
  onOpenDetail,
}: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="bg-tsumugi flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">
        条件に一致するお店が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="bg-tsumugi flex h-full flex-col gap-2 overflow-y-auto p-3">
      <p className="px-1 text-xs text-zinc-500">{stores.length}件のお店</p>
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          isActive={store.id === selectedStoreId}
          onSelect={onSelectStore}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
