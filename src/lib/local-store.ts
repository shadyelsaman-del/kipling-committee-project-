import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { MenuItem, Order, Restaurant } from "@/types";

const DB_PATH = path.join(process.cwd(), ".data", "db.json");

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
