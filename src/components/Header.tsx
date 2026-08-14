import Link from "next/link";

export default function Header({ onOpenSubmit }: { onOpenSubmit: () => void }) {
  return (
    <header className="bg-tsumugi border-b border-zinc-200 px-4 py-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        <div className="min-w-0">
          <h1 className="whitespace-nowrap text-[clamp(1.3rem,6.5vw,1.875rem)] font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            <Link href="/" className="hover:opacity-80">
              奄美群島飲ミュニティマップ
            </Link>
          </h1>
          <p className="mt-2 whitespace-nowrap text-[clamp(0.5rem,2.6vw,0.875rem)] text-zinc-500 sm:text-sm">
            飲んで、つながり、島になる。奄美群島ゆかりのお店だけを集めたサイト
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex sm:pt-0.5">
          <button
            type="button"
            onClick={onOpenSubmit}
            className="whitespace-nowrap rounded-full bg-zinc-900 px-5 py-2.5 text-lg font-bold text-white hover:bg-zinc-700"
          >
            お店の情報を教える
          </button>
          <a
            href="https://nelsonmzsm.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-full border border-zinc-300 px-5 py-2.5 text-lg font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            開発者について
          </a>
        </div>
      </div>
    </header>
  );
}
