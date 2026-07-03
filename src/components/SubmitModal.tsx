"use client";

import { useEffect, useState } from "react";
import SubmitForm from "@/app/submit/SubmitForm";

interface Option {
  id: string;
  name: string;
}

export default function SubmitModal({ onClose }: { onClose: () => void }) {
  const [genres, setGenres] = useState<Option[]>([]);
  const [regions, setRegions] = useState<Option[]>([]);
  const [stores, setStores] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [genresRes, regionsRes, storesRes] = await Promise.all([
        fetch("/api/genres"),
        fetch("/api/regions"),
        fetch("/api/stores"),
      ]);
      const [genresData, regionsData, storesData] = await Promise.all([
        genresRes.json(),
        regionsRes.json(),
        storesRes.json(),
      ]);
      if (!cancelled) {
        setGenres(genresData);
        setRegions(regionsData);
        setStores(storesData.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-tsumugi relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-y-auto rounded-t-2xl p-4 sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ✕
        </button>

        <h1 className="pr-12 text-lg font-bold text-zinc-900">お店の情報を教える</h1>
        <p className="mt-1 text-sm text-zinc-500">
          新しいお店の情報や、既存の掲載店舗の修正情報を教えてください。いただいた内容は運営が確認のうえ掲載します。
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">読み込み中...</p>
        ) : (
          <SubmitForm genres={genres} regions={regions} stores={stores} />
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-lg border border-zinc-300 py-2.5 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
