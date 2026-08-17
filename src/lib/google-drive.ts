import "server-only";
import { google } from "googleapis";
import { Readable } from "node:stream";

export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
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

// 店舗投稿フォームから受け取った写真を、運営のGoogle Driveの専用フォルダへアップロードする。
// アップロード後、リンクを知っている人は閲覧可にして共有可能なURLを返す。
export async function uploadPhotoToDrive(file: File): Promise<string> {
  const drive = getDriveClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data } = await drive.files.create({
    requestBody: {
      name: `${Date.now()}_${file.name}`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType: file.type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = data.id!;
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
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
