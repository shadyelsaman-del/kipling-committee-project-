import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "kipling_admin_session";

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD environment variable.");
  }
  return password;
}

/** Deterministic session token derived from the shared admin password. */
export function computeAdminSessionToken(): string {
  return crypto
    .createHmac("sha256", getAdminPassword())
    .update("kipling-admin-session")
    .digest("hex");
}

export function isCorrectAdminPassword(candidate: string): boolean {
  const expected = Buffer.from(getAdminPassword());
  const actual = Buffer.from(candidate);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const expected = computeAdminSessionToken();
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(token);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
