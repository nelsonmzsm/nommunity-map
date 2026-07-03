export default function Header({ onOpenSubmit }: { onOpenSubmit: () => void }) {
  return (
    <header className="bg-tsumugi flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          奄美群島飲ミュニティマップ
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          飲んで、つながり、島になる。奄美群島ゆかりのお店だけを集めたサイト
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5 text-sm">
        <a
          href="https://vietmaru.com/works"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-zinc-600 underline-offset-2 hover:underline"
        >
          開発者について
        </a>
        <button
          type="button"
          onClick={onOpenSubmit}
          className="font-semibold text-zinc-600 underline-offset-2 hover:underline"
        >
          お店の情報を教える
        </button>
      </div>
    </header>
  );
}
