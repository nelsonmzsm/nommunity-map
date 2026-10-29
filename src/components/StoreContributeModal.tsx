"use client";

import { useActionState, useState } from "react";
import { submitComment, submitPhoto, type CommunitySubmitState } from "@/lib/actions/community";

const INITIAL_STATE: CommunitySubmitState = { status: "idle" };
const MAX_PHOTO_MB = 5;

export default function StoreContributeModal({
  storeId,
  storeName,
  open,
  onClose,
}: {
  storeId: string;
  storeName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"comment" | "photo">("comment");
  const [commentState, commentAction, commentPending] = useActionState(submitComment, INITIAL_STATE);
  const [photoState, photoAction, photoPending] = useActionState(submitPhoto, INITIAL_STATE);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={(e) => {
        // StoreDetailModal の背景クリックにもイベントが伝播し、
        // この投稿モーダルと一緒に店舗詳細モーダルまで閉じてしまうのを防ぐ。
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-tsumugi relative flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-2xl p-4 sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ✕
        </button>

        <h2 className="pr-10 text-base font-bold text-zinc-900">{storeName} に投稿する</h2>
        <p className="mt-1 text-xs text-zinc-500">
          いただいた内容は運営が確認のうえ掲載します。
        </p>

        <div className="mt-4 flex gap-1 border-b border-zinc-200">
          <button
            type="button"
            onClick={() => setTab("comment")}
            className={`border-b-2 px-3 py-2 text-sm font-semibold ${
              tab === "comment"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            推しコメント
          </button>
          <button
            type="button"
            onClick={() => setTab("photo")}
            className={`border-b-2 px-3 py-2 text-sm font-semibold ${
              tab === "photo"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            写真
          </button>
        </div>

        {tab === "comment" ? (
          commentState.status === "success" ? (
            <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              コメントを送信しました。運営が確認のうえ掲載いたします。
            </p>
          ) : (
            <form action={commentAction} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="storeId" value={storeId} />
              <label className="flex flex-col gap-1 text-sm">
                お名前（ニックネーム可）
                <input
                  name="displayName"
                  type="text"
                  required
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                推しコメント
                <textarea
                  name="comment"
                  rows={4}
                  required
                  maxLength={400}
                  placeholder="このお店の好きなところなど自由にどうぞ"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
                />
              </label>
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              {commentState.status === "error" && (
                <p className="text-sm text-red-600">{commentState.message}</p>
              )}
              <button
                type="submit"
                disabled={commentPending}
                className="rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {commentPending ? "送信中..." : "コメントを送信する"}
              </button>
            </form>
          )
        ) : photoState.status === "success" ? (
          <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            写真を送信しました。運営が確認のうえ掲載いたします。
          </p>
        ) : (
          <form action={photoAction} className="mt-4 flex flex-col gap-3">
            <input type="hidden" name="storeId" value={storeId} />
            <label className="flex flex-col gap-1 text-sm">
              お名前（ニックネーム可）
              <input
                name="displayName"
                type="text"
                required
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              写真（1枚、{MAX_PHOTO_MB}MBまで）
              <input
                name="photo"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5"
              />
              {photoFile && <span className="text-xs text-zinc-500">{photoFile.name}</span>}
            </label>
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            {photoState.status === "error" && (
              <p className="text-sm text-red-600">{photoState.message}</p>
            )}
            <button
              type="submit"
              disabled={photoPending}
              className="rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {photoPending ? "送信中..." : "写真を送信する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
