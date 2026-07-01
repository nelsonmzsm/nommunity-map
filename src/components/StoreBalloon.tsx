import type { Store } from "@/types/store";
import StoreSummary from "./StoreSummary";

export default function StoreBalloon({
  store,
  onOpenDetail,
}: {
  store: Store;
  onOpenDetail: (store: Store) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(store)}
      className="w-72 rounded-lg p-1 text-left"
    >
      <StoreSummary store={store} />
    </button>
  );
}
