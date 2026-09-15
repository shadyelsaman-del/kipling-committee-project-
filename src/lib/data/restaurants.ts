import "server-only";
import { randomUUID } from "crypto";
import { appendRow, deleteRow, getRows, updateRow } from "@/lib/google-sheets";
import { readDb, writeDb } from "@/lib/local-store";
import { isLocalMode } from "./mode";
import type { Restaurant } from "@/types";

const SHEET = "Restaurants";

function parseRow(values: string[]): Restaurant {
  const [id, name, description, isActive, createdAt] = values;
  return {
    id,
    name,
    description: description || null,
    image_url: null,
    is_active: isActive === "TRUE",
    created_at: createdAt,
  };
}

function toValues(r: Restaurant): (string | number)[] {
  return [r.id, r.name, r.description ?? "", r.is_active ? "TRUE" : "FALSE", r.created_at];
}

export async function listRestaurants(): Promise<Restaurant[]> {
  if (isLocalMode()) {
    return (await readDb()).restaurants;
  }
  const rows = await getRows(SHEET);
  return rows.map((row) => parseRow(row.values));
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  if (isLocalMode()) {
    return (await readDb()).restaurants.find((r) => r.id === id) ?? null;
  }
  const rows = await getRows(SHEET);
  const match = rows.find((row) => row.values[0] === id);
  return match ? parseRow(match.values) : null;
}

export async function createRestaurant(input: {
  name: string;
  description: string | null;
}): Promise<Restaurant> {
  const restaurant: Restaurant = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  if (isLocalMode()) {
    const db = await readDb();
    db.restaurants.push(restaurant);
    await writeDb(db);
    return restaurant;
  }

  await appendRow(SHEET, toValues(restaurant));
  return restaurant;
}

export async function updateRestaurant(
  id: string,
  update: Partial<Pick<Restaurant, "name" | "description" | "is_active">>
): Promise<boolean> {
  if (isLocalMode()) {
    const db = await readDb();
    const index = db.restaurants.findIndex((r) => r.id === id);
    if (index === -1) return false;
    db.restaurants[index] = { ...db.restaurants[index], ...update };
    await writeDb(db);
    return true;
  }

  const rows = await getRows(SHEET);
  const match = rows.find((row) => row.values[0] === id);
  if (!match) return false;

  const current = parseRow(match.values);
  const next: Restaurant = { ...current, ...update };
  await updateRow(SHEET, match.rowNumber, toValues(next));
  return true;
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  if (isLocalMode()) {
    const db = await readDb();
    const index = db.restaurants.findIndex((r) => r.id === id);
    if (index === -1) return false;
    db.restaurants.splice(index, 1);
    await writeDb(db);
    return true;
  }

  const rows = await getRows(SHEET);
  const match = rows.find((row) => row.values[0] === id);
  if (!match) return false;
  await deleteRow(SHEET, match.rowNumber);
  return true;
}
