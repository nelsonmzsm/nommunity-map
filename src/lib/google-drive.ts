import "server-only";
import { google } from "googleapis";

// Google Docs取り込み機能（記事本文へのエクスポート読み取り）にのみ使用。
// 画像アップロード自体はSupabase Storageへ移行済み（サービスアカウントは
// 個人Googleアカウント配下だとDriveへのファイル作成用ストレージ容量を持たないため）。
export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

// Google DocのURLからドキュIDを取り出す（/document/d/{id}/... の形式）。
export function extractGoogleDocId(url: string): string | null {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// 記事本文への「Google Docs取り込み」用。指定ドキュメントをHTMLとしてエクスポートする。
// ドキュメント側で、このサービスアカウント（GOOGLE_SERVICE_ACCOUNT_EMAIL）に
// 閲覧権限を共有しておく必要がある。画像は原則データURLとして埋め込まれた形で返る。
export async function exportGoogleDocAsHtml(
  docId: string
): Promise<{ title: string; html: string }> {
  const drive = getDriveClient();

  const [meta, exported] = await Promise.all([
    drive.files.get({ fileId: docId, fields: "name" }),
    drive.files.export({ fileId: docId, mimeType: "text/html" }, { responseType: "text" }),
  ]);

  return {
    title: meta.data.name ?? "",
    html: exported.data as string,
  };
}
