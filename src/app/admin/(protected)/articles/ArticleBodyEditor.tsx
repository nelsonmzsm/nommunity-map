"use client";

import { useRef, useState } from "react";
import { uploadArticleImage } from "./actions";

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

  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploading(true);
    setError(null);
    for (const file of imageFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadArticleImage(fd);
      if (result.url) {
        insertAtCursor(`\n![](${result.url})\n`);
      } else {
        setError(result.error ?? "画像のアップロードに失敗しました");
      }
    }
    setUploading(false);
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      本文 <span className="text-red-600">※</span>
      <span className="text-xs font-normal text-zinc-500">
        画像ファイルをこの欄にドラッグ＆ドロップすると、カーソル位置に挿入されます
      </span>
      <textarea
        ref={textareaRef}
        name="body"
        rows={16}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
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
