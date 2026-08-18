// 記事本文に埋め込まれた ![alt](url) 形式のインライン画像を扱うための共通処理。
// 管理画面のドラッグ&ドロップ挿入と、公開ページの描画・一覧の抜粋生成で共有する。

const IMAGE_MARKDOWN_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

export type ArticleBodySegment =
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string };

export function parseArticleBody(body: string): ArticleBodySegment[] {
  const segments: ArticleBodySegment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(IMAGE_MARKDOWN_RE)) {
    const [full, alt, url] = match;
    const index = match.index ?? 0;
    const textBefore = body.slice(lastIndex, index).trim();
    if (textBefore) segments.push({ type: "text", content: textBefore });
    segments.push({ type: "image", url, alt });
    lastIndex = index + full.length;
  }

  const textAfter = body.slice(lastIndex).trim();
  if (textAfter) segments.push({ type: "text", content: textAfter });

  return segments;
}

export function excerptFromBody(body: string, length: number): string {
  const text = body.replace(IMAGE_MARKDOWN_RE, "").replace(/\s+/g, " ").trim();
  return text.slice(0, length);
}
