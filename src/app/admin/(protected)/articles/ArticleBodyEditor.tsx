"use client";

import { useRef, useState } from "react";
import { uploadArticleImage, uploadArticleImageFromUrl } from "./actions";

type OrderedSegment = { type: "text"; value: string } | { type: "image"; src: string };

// Google Docs等からのコピペで得られるHTMLを、文章内での画像の位置関係を
// 保ったまま「テキスト／画像」の並びに分解する。
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

export default function ArticleBodyEditor({ initialBody }: { initialBody?: string }) {
  const [body, setBody] = useState(initialBody ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // 単一画像のコピペ（スクリーンショット等）はファイルとして渡ってくる。
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
        // Google Docs等: 文章と画像の並び順を保ったまま処理する
        const segments = extractOrderedContent(html);
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
        insertAtCursor(combined);
      } else {
        // text/htmlが無いが画像ファイルだけ渡ってきたケース
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

  return (
    <label className="flex flex-col gap-1 text-sm">
      本文 <span className="text-red-600">※</span>
      <span className="text-xs font-normal text-zinc-500">
        画像ファイルのドラッグ＆ドロップ、またはGoogle
        Docs等からの画像入りコピペにも対応しています（カーソル位置に自動挿入されます）
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
  );
}
