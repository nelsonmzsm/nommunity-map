// スプレッドシートからコピーしたタブ区切りテキストを解析するための純粋関数。
// クライアントコンポーネントから同期的に呼び出す（プレビュー表示用）。

export const COLUMN_LABELS = [
  "店名",
  "島",
  "都道府県",
  "市区町村",
  "住所",
  "出身集落",
  "ジャンル",
  "写真URL",
  "紹介文",
  "お店のページURL",
  "電話番号",
] as const;

// 列見出しの表記ゆれを吸収するためのエイリアス。
const HEADER_ALIASES: Record<string, (typeof COLUMN_LABELS)[number]> = {
  店名: "店名",
  島: "島",
  ゆかりの島: "島",
  都道府県: "都道府県",
  市区町村: "市区町村",
  住所: "住所",
  出身集落: "出身集落",
  "出身集落・町": "出身集落",
  ジャンル: "ジャンル",
  写真URL: "写真URL",
  紹介文: "紹介文",
  お店のページURL: "お店のページURL",
  URL: "お店のページURL",
  電話番号: "電話番号",
  電話: "電話番号",
};

export interface ParsedRow {
  rowNumber: number; // 見出しを除いた、貼り付けデータ内での行番号（1始まり）
  name: string;
  regionName: string;
  regionId: string | null;
  prefecture: string;
  town: string;
  address: string;
  village: string;
  genreNames: string[];
  genreIds: string[];
  unmatchedGenreNames: string[];
  photos: string[];
  profile: string;
  storeUrl: string;
  phone: string;
  errors: string[];
}

export interface ParseResult {
  rows: ParsedRow[];
  headerError?: string;
}

function splitGenreNames(cell: string): string[] {
  return cell
    .split(/[・,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitPhotoUrls(cell: string): string[] {
  return cell
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseBulkStoreText(
  text: string,
  regions: { id: string; name: string }[],
  genres: { id: string; name: string }[]
): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], headerError: "貼り付けられたテキストが空です" };
  }

  const headerCells = lines[0].split("\t").map((c) => c.trim());
  const columnIndex: Partial<Record<(typeof COLUMN_LABELS)[number], number>> = {};
  headerCells.forEach((cell, i) => {
    const mapped = HEADER_ALIASES[cell];
    if (mapped) columnIndex[mapped] = i;
  });

  const required: (typeof COLUMN_LABELS)[number][] = ["店名", "島", "都道府県", "住所"];
  const missing = required.filter((label) => columnIndex[label] === undefined);
  if (missing.length > 0) {
    return {
      rows: [],
      headerError: `1行目（見出し行）に次の列が見つかりません: ${missing.join("・")}`,
    };
  }

  const regionByName = new Map(regions.map((r) => [r.name, r]));
  const genreByName = new Map(genres.map((g) => [g.name, g]));

  const get = (cells: string[], label: (typeof COLUMN_LABELS)[number]) => {
    const idx = columnIndex[label];
    return idx === undefined ? "" : (cells[idx] ?? "").trim();
  };

  const rows: ParsedRow[] = lines.slice(1).map((line, i) => {
    const cells = line.split("\t");
    const name = get(cells, "店名");
    const regionName = get(cells, "島");
    const prefecture = get(cells, "都道府県");
    const town = get(cells, "市区町村");
    const address = get(cells, "住所");
    const village = get(cells, "出身集落");
    const genreNames = splitGenreNames(get(cells, "ジャンル"));
    const photos = splitPhotoUrls(get(cells, "写真URL"));
    const profile = get(cells, "紹介文");
    const storeUrl = get(cells, "お店のページURL");
    const phone = get(cells, "電話番号");

    const region = regionByName.get(regionName);
    const matchedGenres = genreNames
      .map((n) => genreByName.get(n))
      .filter((g): g is { id: string; name: string } => Boolean(g));
    const unmatchedGenreNames = genreNames.filter((n) => !genreByName.has(n));

    const errors: string[] = [];
    const isOverseas = prefecture === "海外";
    if (!name) errors.push("店名が空です");
    if (!regionName) errors.push("島が空です");
    else if (!region) errors.push(`島「${regionName}」が見つかりません`);
    if (!prefecture) errors.push("都道府県が空です");
    if (!town && !isOverseas) errors.push("市区町村が空です（海外の場合は空でも可）");
    if (!address) errors.push("住所が空です");

    return {
      rowNumber: i + 1,
      name,
      regionName,
      regionId: region?.id ?? null,
      prefecture,
      town,
      address,
      village,
      genreNames,
      genreIds: matchedGenres.map((g) => g.id),
      unmatchedGenreNames,
      photos,
      profile,
      storeUrl,
      phone,
      errors,
    };
  });

  return { rows };
}
