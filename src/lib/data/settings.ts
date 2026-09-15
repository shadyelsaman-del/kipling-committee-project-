import "server-only";
import { appendRow, getRows, updateRow } from "@/lib/google-sheets";
import { readDb, writeDb } from "@/lib/local-store";
import { isLocalMode } from "./mode";

const SHEET = "Settings";

export type OrderingOverride = "auto" | "open" | "closed";

export interface Settings {
  /** "auto" defers to the Saturday/Monday calendar; "open"/"closed" override it. */
  orderingOverride: OrderingOverride;
  /** Used only when orderingOverride is "open"; falls back to tomorrow if unset. */
  overrideDeliveryDate: string | null;
}

const DEFAULT_SETTINGS: Settings = { orderingOverride: "auto", overrideDeliveryDate: null };

export async function getSettings(): Promise<Settings> {
  if (isLocalMode()) {
    const db = await readDb();
    return db.settings ?? DEFAULT_SETTINGS;
  }

  const rows = await getRows(SHEET);
  if (rows.length === 0) return DEFAULT_SETTINGS;

  const [mode, deliveryDate] = rows[0].values;
  const orderingOverride: OrderingOverride =
    mode === "open" || mode === "closed" ? mode : "auto";

  return { orderingOverride, overrideDeliveryDate: deliveryDate || null };
}

export async function updateSettings(update: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...update };

  if (isLocalMode()) {
    const db = await readDb();
    db.settings = next;
    await writeDb(db);
    return next;
  }

  const values = [next.orderingOverride, next.overrideDeliveryDate ?? ""];
  const rows = await getRows(SHEET);
  if (rows.length === 0) {
    await appendRow(SHEET, values);
  } else {
    await updateRow(SHEET, rows[0].rowNumber, values);
  }
  return next;
}
