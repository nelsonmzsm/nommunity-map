export default function Header({ onOpenSubmit }: { onOpenSubmit: () => void }) {
  return (
    <header className="bg-tsumugi flex flex-col gap-3 border-b border-zinc-200 px-4 py-3">
      <div className="min-w-0">
        <h1 className="whitespace-nowrap text-[clamp(1.3rem,6.5vw,1.875rem)] font-bold text-zinc-900 sm:text-3xl md:text-4xl">
          奄美群島飲ミュニティマップ
        </h1>
        <p className="mt-2 whitespace-nowrap text-[clamp(0.5rem,2.6vw,0.875rem)] text-zinc-500 sm:text-sm">
          飲んで、つながり、島になる。奄美群島ゆかりのお店だけを集めたサイト
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onOpenSubmit}
          className="whitespace-nowrap rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white hover:bg-zinc-700 sm:px-5 sm:py-2.5 sm:text-base"
        >
          お店の情報を教える
        </button>
        <a
          href="https://vietmaru.com/works"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
        >
          開発者について
        </a>
      </div>
    </header>
  );
}
