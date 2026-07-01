import Link from "next/link";

interface HeaderProps {
  view: "map" | "list";
  onChangeView: (view: "map" | "list") => void;
}

export default function Header({ view, onChangeView }: HeaderProps) {
  return (
    <header className="bg-tsumugi flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
          アマミ飲ミュニティマップ
        </h1>
        <p className="text-sm text-zinc-500">
          奄美群島ゆかりの居酒屋を探そう
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/submit"
          className="shrink-0 text-sm font-semibold text-zinc-600 underline-offset-2 hover:underline"
        >
          お店の情報を教える
        </Link>

        <div className="flex rounded-full border border-zinc-300 bg-zinc-50 p-1 sm:hidden">
          <button
            type="button"
            onClick={() => onChangeView("map")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              view === "map" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            マップ
          </button>
          <button
            type="button"
            onClick={() => onChangeView("list")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              view === "list" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            リスト
          </button>
        </div>
      </div>
    </header>
  );
}
