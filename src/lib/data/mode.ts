import "server-only";

/**
 * When no Google Sheet is configured, the app falls back to a local JSON
 * file for data (see local-store.ts) so it can be tried with zero setup.
 * Set GOOGLE_SHEET_ID (and the other GOOGLE_* vars) to use the real backend.
 */
export function isLocalMode(): boolean {
  return !process.env.GOOGLE_SHEET_ID;
}
