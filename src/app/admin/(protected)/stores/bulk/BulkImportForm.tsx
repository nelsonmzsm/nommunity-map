"use client";

import { useState } from "react";
import Link from "next/link";
import { COLUMN_LABELS, parseBulkStoreText, type ParsedRow } from "./parse";
import { bulkCreateStores, type BulkStoreResult } from "./actions";

interface Option {
  id: string;
  name: string;
}

const TEMPLATE_ROW = [
  "呑み処○○",
  "奄美大島",
  "大阪府",
  "大阪市北区",
  "梅田1-2-3",
  "名瀬",
  "居酒屋・その他の飲食店",
  "",
  "奄美出身の店主が営む居酒屋です",
  "",
  "06-0000-0000",
].join("\t");

export default function BulkImportForm({
  genres,
  regions,
}: {
  genres: Option[];
  regions: Option[];
}) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<BulkStoreResult[] | null>(null);

  const handleCopyTemplate = async () => {
    const header = COLUMN_LABELS.join("\t");
    await navigator.clipboard.writeText(`${header}\n${TEMPLATE_ROW}`);
  };

  const handleParse = () => {
    const result = parseBulkStoreText(text, regions, genres);
    setHeaderError(result.headerError ?? null);
    setParsed(result.headerError ? null : result.rows);
    setResults(null);
  };

  const handleBack = () => {
    setParsed(null);
    setHeaderError(null);
  };

  const validRows = (parsed ?? []).filter((r) => r.errors.length === 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await bulkCreateStores(
      validRows.map((r) => ({
        name: r.name,
        regionId: r.regionId!,
        prefecture: r.prefecture,
        town: r.town,
        address: r.address,
        village: r.village,
        genreIds: r.genreIds,
        photos: r.photos,
        profile: r.profile,
        storeUrl: r.storeUrl,
        phone: r.phone,
      }))
    );
    setResults(res);
    setSubmitting(false);
  };

  if (results) {
    const created = results.filter((r) => r.status === "created");
    const failed = results.filter((r) => r.status === "error");
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-zinc-900">
          {created.length}件登録しました
          {failed.length > 0 && `／${failed.length}件失敗しました`}
        </p>
        {failed.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {failed.map((r) => (
              <li key={r.index}>
                {r.name || `（${r.index + 1}行目）`}: {r.message}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-3">
          <Link
            href="/admin/stores"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            店舗一覧を見る
          </Link>
          <button
            type="button"
            onClick={() => {
              setText("");
              setParsed(null);
              setResults(null);
            }}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            続けて登録する
          </button>
        </div>
      </div>
    );
  }

  if (parsed) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-700">
          {parsed.length}件中 <span className="font-semibold text-emerald-700">{validRows.length}件登録可能</span>
          {parsed.length - validRows.length > 0 && (
            <span className="text-red-600">
              ／{parsed.length - validRows.length}件エラーのためスキップされます
            </span>
          )}
        </p>

        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                <th className="px-2 py-1.5">行</th>
                <th className="px-2 py-1.5">店名</th>
                <th className="px-2 py-1.5">島</th>
                <th className="px-2 py-1.5">住所</th>
                <th className="px-2 py-1.5">ジャンル</th>
                <th className="px-2 py-1.5">状態</th>
              </tr>
            </thead>
            <tbody>
              {parsed.map((row) => (
                <tr key={row.rowNumber} className="border-b border-zinc-100">
                  <td className="px-2 py-1.5 text-zinc-400">{row.rowNumber}</td>
                  <td className="px-2 py-1.5">{row.name || "-"}</td>
                  <td className="px-2 py-1.5">{row.regionName || "-"}</td>
                  <td className="px-2 py-1.5 text-zinc-500">
                    {row.prefecture}
                    {row.town}
                    {row.address}
                  </td>
                  <td className="px-2 py-1.5 text-zinc-500">
                    {row.genreNames.join("・") || "-"}
                    {row.unmatchedGenreNames.length > 0 && (
                      <span className="ml-1 text-amber-600">
                        （不明: {row.unmatchedGenreNames.join("・")}）
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {row.errors.length === 0 ? (
                      <span className="font-semibold text-emerald-700">OK</span>
                    ) : (
                      <span className="text-red-600">{row.errors.join(" / ")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-zinc-500">
          登録可能な{validRows.length}件について、住所から緯度経度を自動取得して登録します（取得できなかった行は失敗として報告されます）。
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || validRows.length === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {submitting ? "登録中..." : `${validRows.length}件を登録する`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
        <p className="font-semibold text-zinc-800">貼り付ける表の1行目（見出し）に必要な列名</p>
        <p className="mt-1">{COLUMN_LABELS.join(" / ")}</p>
        <p className="mt-1 text-zinc-500">
          （必須: 店名・島・都道府県・住所。市区町村は「海外」のときのみ省略可。ジャンルは「・」区切りで複数可。写真URLはカンマ区切りで複数可）
        </p>
        <button
          type="button"
          onClick={handleCopyTemplate}
          className="mt-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
        >
          見出し＋サンプル行をコピー
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Excel・Googleスプレッドシートなどからコピーした表をそのまま貼り付けてください
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="1行目に見出し、2行目以降にデータを貼り付けてください"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs"
        />
      </label>

      {headerError && <p className="text-sm text-red-600">{headerError}</p>}

      <div>
        <button
          type="button"
          onClick={handleParse}
          disabled={!text.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          内容を確認する
        </button>
      </div>
    </div>
  );
}
