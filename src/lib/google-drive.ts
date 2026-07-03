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
