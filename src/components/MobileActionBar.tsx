export default function MobileActionBar({
  onOpenSubmit,
}: {
  onOpenSubmit: () => void;
}) {
  return (
    <div className="flex shrink-0 border-t border-zinc-200 sm:hidden">
      <button
        type="button"
        onClick={onOpenSubmit}
        className="flex-[7] bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-700"
      >
        お店の情報を教える
      </button>
      <a
        href="https://nelsonmzsm.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-[3] items-center justify-center border-l border-zinc-700 bg-zinc-800 py-3 text-xs font-semibold text-white hover:bg-zinc-700"
      >
        開発者について
      </a>
    </div>
  );
}
