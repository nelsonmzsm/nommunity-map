export default function Header({ onOpenSubmit }: { onOpenSubmit: () => void }) {
  return (
    <header className="bg-tsumugi border-b border-zinc-200 px-4 py-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="whitespace-nowrap text-[clamp(1.3rem,6.5vw,1.875rem)] font-bold text-zinc-900 sm:text-3xl md:text-4xl">
              奄美群島飲ミュニティマップ
            </h1>
            <span className="whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
              試験公開中
            </span>
          </div>
          <p className="mt-2 whitespace-nowrap text-[clamp(0.5rem,2.6vw,0.875rem)] text-zinc-500 sm:text-sm">
            飲んで、つながり、島になる。奄美群島ゆかりのお店だけを集めたサイト
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1 sm:pt-0.5">
          <button
            type="button"
            onClick={onOpenSubmit}
            className="whitespace-nowrap rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white hover:bg-zinc-700 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            お店の情報を教える
          </button>
          <a
            href="https://vietmaru.com/works"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-full border border-zinc-300 px-2 py-1 text-[10px] font-medium text-zinc-500 hover:bg-zinc-100 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            開発者について
          </a>
        </div>
      </div>
    </header>
  );
}
