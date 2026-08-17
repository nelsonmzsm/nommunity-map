"use client";

import { useRef, useState } from "react";
import {
  uploadArticleImage,
  uploadArticleImageFromUrl,
  fetchGoogleDocForImport,
} from "./actions";

type OrderedSegment = { type: "text"; value: string } | { type: "image"; src: string };

// Google Docs等からのコピペ・エクスポートで得られるHTMLを、文章内での画像の
// 位置関係を保ったまま「テキスト／画像」の並びに分解する。
function extractOrderedContent(html: string): OrderedSegment[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const result: OrderedSegment[] = [];
  let textBuffer = "";

  const flush = () => {
    if (textBuffer.trim()) result.push({ type: "text", value: textBuffer });
    textBuffer = "";
  };

  const blockTags = new Set(["P", "DIV", "BR", "LI", "TR"]);

  const walk = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textBuffer += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (el.tagName === "IMG") {
      flush();
      const src = el.getAttribute("src");
      if (src) result.push({ type: "image", src });
      return;
    }
    el.childNodes.forEach(walk);
    if (blockTags.has(el.tagName)) textBuffer += "\n";
  };

  doc.body.childNodes.forEach(walk);
  flush();
  return result;
}

function dataUrlToFile(dataUrl: string): File | null {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, base64] = match;
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
  return new File([array], `pasted.${mime.split("/")[1] || "png"}`, { type: mime });
}

interface DocPreview {
  title: string;
  html: string;
  textPreview: string;
  imageCount: number;
  charCount: number;
}

export default function ArticleBodyEditor({ initialBody }: { initialBody?: string }) {
  const [body, setBody] = useState(initialBody ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [docUrl, setDocUrl] = useState("");
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [preview, setPreview] = useState<DocPreview | null>(null);

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    setBody((current) => {
      const start = el?.selectionStart ?? current.length;
      const end = el?.selectionEnd ?? current.length;
      const next = current.slice(0, start) + text + current.slice(end);
      requestAnimationFrame(() => {
        if (!el) return;
        el.focus();
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
      });
      return next;
    });
  };

  const uploadImageFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return uploadArticleImage(fd);
  };

  // segments（テキスト/画像の並び）を実際にアップロード・結合して1つの文字列にする
  const resolveSegments = async (segments: OrderedSegment[]) => {
    let combined = "";
    for (const segment of segments) {
      if (segment.type === "text") {
        combined += segment.value;
        continue;
      }
      const file = segment.src.startsWith("data:") ? dataUrlToFile(segment.src) : null;
      const result = file
        ? await uploadImageFile(file)
        : await uploadArticleImageFromUrl(segment.src);
      if (result.url) {
        combined += `\n![](${result.url})\n`;
      } else {
        setError(result.error ?? "画像のアップロードに失敗しました");
      }
    }
    return combined;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploading(true);
    setError(null);
    for (const file of imageFiles) {
      const result = await uploadImageFile(file);
      if (result.url) {
        insertAtCursor(`\n![](${result.url})\n`);
      } else {
        setError(result.error ?? "画像のアップロードに失敗しました");
      }
    }
    setUploading(false);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboard = e.clipboardData;
    if (!clipboard) return;

    const fileItems = Array.from(clipboard.items).filter(
      (item) => item.kind === "file" && item.type.startsWith("image/")
    );
    const html = clipboard.getData("text/html");

    if (fileItems.length === 0 && !html) {
      return; // 通常のテキスト貼り付けはブラウザ標準の挙動に任せる
    }

    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      if (html) {
        const combined = await resolveSegments(extractOrderedContent(html));
        insertAtCursor(combined);
      } else {
        for (const item of fileItems) {
          const file = item.getAsFile();
          if (!file) continue;
          const result = await uploadImageFile(file);
          if (result.url) {
            insertAtCursor(`\n![](${result.url})\n`);
          } else {
            setError(result.error ?? "画像のアップロードに失敗しました");
          }
        }
        const text = clipboard.getData("text/plain");
        if (text) insertAtCursor(text);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFetchDoc = async () => {
    if (!docUrl.trim()) return;
    setFetchingDoc(true);
    setError(null);
    setPreview(null);
    const result = await fetchGoogleDocForImport(docUrl.trim());
    setFetchingDoc(false);
    if (!result.html) {
      setError(result.error ?? "取得に失敗しました");
      return;
    }
    const segments = extractOrderedContent(result.html);
    const textPreview = segments
      .filter((s): s is { type: "text"; value: string } => s.type === "text")
      .map((s) => s.value.trim())
      .join(" ")
      .slice(0, 300);
    setPreview({
      title: result.title ?? "",
      html: result.html,
      textPreview,
      imageCount: segments.filter((s) => s.type === "image").length,
      charCount: segments.reduce((n, s) => n + (s.type === "text" ? s.value.length : 0), 0),
    });
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setUploading(true);
    setError(null);
    const combined = await resolveSegments(extractOrderedContent(preview.html));
    insertAtCursor(combined);
    setUploading(false);
    setPreview(null);
    setDocUrl("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
        <span className="text-xs font-semibold text-zinc-500">Google Docsから取り込む</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://docs.google.com/document/d/..."
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleFetchDoc}
            disabled={fetchingDoc || !docUrl.trim()}
            className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {fetchingDoc ? "取得中..." : "取り込む"}
          </button>
        </div>
        <span className="text-[11px] text-zinc-400">
          事前にそのドキュメントをサービスアカウントに共有（閲覧権限）しておいてください
        </span>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        本文 <span className="text-red-600">※</span>
        <span className="text-xs font-normal text-zinc-500">
          画像ファイルのドラッグ＆ドロップ、または画像入りコピペにも対応しています（カーソル位置に自動挿入されます）
        </span>
        <textarea
          ref={textareaRef}
          name="body"
          rows={16}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onPaste={handlePaste}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
            dragOver ? "border-emerald-500 bg-emerald-50" : "border-zinc-300"
          }`}
        />
        {uploading && <span className="text-xs text-zinc-500">画像をアップロード中...</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </label>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-zinc-900">この内容を本文に読み込みますか？</h2>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-800">{preview.title || "（無題のドキュメント）"}</p>
              <p className="mt-1 text-zinc-500">
                文字数: 約{preview.charCount}字 ／ 画像: {preview.imageCount}枚
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-600">
                {preview.textPreview}
                {preview.charCount > 300 && "…"}
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              現在のカーソル位置に追記されます（既存の本文は消えません）。画像はこの後アップロードされます。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                この内容を読み込む
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
