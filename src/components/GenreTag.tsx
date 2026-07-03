export default function GenreTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
      {name}
    </span>
  );
}
