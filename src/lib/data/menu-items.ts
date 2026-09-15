import "server-only";
import { randomUUID } from "crypto";
import { appendRow, deleteRow, getRows, updateRow } from "@/lib/google-sheets";
import type { MenuItem } from "@/types";

const SHEET = "MenuItems";

function parseRow(values: string[]): MenuItem {
  const [id, restaurantId, name, description, price, isAvailable, createdAt] = values;
  return {
    id,
    restaurant_id: restaurantId,
    name,
    description: description || null,
    price: Number(price),
    is_available: isAvailable === "TRUE",
    created_at: createdAt,
  };
}

function toValues(m: MenuItem): (string | number)[] {
  return [
    m.id,
    m.restaurant_id,
    m.name,
    m.description ?? "",
    m.price,
    m.is_available ? "TRUE" : "FALSE",
    m.created_at,
  ];
}

export async function listMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
  const rows = await getRows(SHEET);
  return rows
    .map((row) => parseRow(row.values))
    .filter((item) => item.restaurant_id === restaurantId);
}

export async function getMenuItemsByIds(ids: string[]): Promise<MenuItem[]> {
  const rows = await getRows(SHEET);
  const idSet = new Set(ids);
  return rows.map((row) => parseRow(row.values)).filter((item) => idSet.has(item.id));
}

export async function createMenuItem(input: {
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
}): Promise<MenuItem> {
  const item: MenuItem = {
    id: randomUUID(),
    restaurant_id: input.restaurantId,
    name: input.name,
    description: input.description,
    price: input.price,
    is_available: true,
    created_at: new Date().toISOString(),
  };
  await appendRow(SHEET, toValues(item));
  return item;
}

export async function updateMenuItem(
  id: string,
  update: Partial<Pick<MenuItem, "name" | "description" | "price" | "is_available">>
): Promise<boolean> {
  const rows = await getRows(SHEET);
  const match = rows.find((row) => row.values[0] === id);
  if (!match) return false;

  const current = parseRow(match.values);
  const next: MenuItem = { ...current, ...update };
  await updateRow(SHEET, match.rowNumber, toValues(next));
  return true;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const rows = await getRows(SHEET);
  const match = rows.find((row) => row.values[0] === id);
  if (!match) return false;
  await deleteRow(SHEET, match.rowNumber);
  return true;
}

export async function deleteMenuItemsByRestaurant(restaurantId: string): Promise<void> {
  const rows = await getRows(SHEET);
  const matches = rows.filter((row) => row.values[1] === restaurantId);
  // Delete from the bottom up so earlier row numbers stay valid.
  for (const match of matches.sort((a, b) => b.rowNumber - a.rowNumber)) {
    await deleteRow(SHEET, match.rowNumber);
  }
}
