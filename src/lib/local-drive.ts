import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import os from "os";
import path from "path";

// On Vercel the deployed bundle (including public/) is read-only; only /tmp
// is writable there, so screenshots are served through an API route instead
// of Next's static file serving. Locally, public/uploads works directly.
const isVercel = !!process.env.VERCEL;
const UPLOAD_DIR = isVercel
  ? path.join(os.tmpdir(), "kipling-demo-uploads")
  : path.join(process.cwd(), "public", "uploads");

export async function uploadScreenshotLocal(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename), buffer);
  return isVercel ? `/api/local-uploads/${filename}` : `/uploads/${filename}`;
}

export function getLocalUploadPath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}
