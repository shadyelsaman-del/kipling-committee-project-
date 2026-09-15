import "server-only";
import { isLocalMode } from "@/lib/data/mode";
import { uploadScreenshot as uploadToDrive } from "@/lib/google-drive";
import { uploadScreenshotLocal } from "@/lib/local-drive";

export async function uploadScreenshot(file: File): Promise<string> {
  return isLocalMode() ? uploadScreenshotLocal(file) : uploadToDrive(file);
}
