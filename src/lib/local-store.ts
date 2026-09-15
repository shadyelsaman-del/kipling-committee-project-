import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import type { MenuItem, Order, Restaurant } from "@/types";

// Vercel's deployed bundle directory is read-only; only /tmp is writable
// there. Locally, keep the data in the project so it's easy to find.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "kipling-demo-data")
  : path.join(process.cwd(), ".data");

const DB_PATH = path.join(DATA_DIR, "db.json");

export interface LocalDb {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
}

const EMPTY_DB: LocalDb = { restaurants: [], menuItems: [], orders: [] };

export async function readDb(): Promise<LocalDb> {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    return { ...EMPTY_DB, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_DB };
  }
}

export async function writeDb(db: LocalDb): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}
