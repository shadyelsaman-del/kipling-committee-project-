import "server-only";
import { Readable } from "stream";
import { getDriveClient } from "./google-sheets";

/**
 * Uploads a payment screenshot to the configured Drive folder and returns a
 * viewable link. The file is shared as "anyone with the link can view" so the
 * admin dashboard can display it directly, without server-side signing.
 */
export async function uploadScreenshot(file: File): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID environment variable.");
  }

  const drive = getDriveClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const created = await drive.files.create({
    requestBody: {
      name: `${Date.now()}-${file.name}`,
      parents: [folderId],
    },
    media: {
      mimeType: file.type,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = created.data.id;
  if (!fileId) {
    throw new Error("Drive upload did not return a file id.");
  }

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
}
