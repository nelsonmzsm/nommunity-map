import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-tsumugi flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          奄美群島飲ミュニティマップ
        </h1>
        <p className="text-sm text-zinc-500">
          飲んでつながる。奄美群島ゆかりのお店だけを集めたサイト
        </p>
      </div>

      <Link
        href="/submit"
        className="shrink-0 text-sm font-semibold text-zinc-600 underline-offset-2 hover:underline"
      >
        お店の情報を教える
      </Link>
    </header>
  );
}
