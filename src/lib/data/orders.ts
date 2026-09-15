import "server-only";
import { randomUUID } from "crypto";
import { appendRow, getRows, updateRow } from "@/lib/google-sheets";
import type { Order, OrderLineItem, OrderStatus } from "@/types";

const SHEET = "Orders";

function parseRow(values: string[]): Order {
  const [
    id,
    createdAt,
    studentName,
    studentClass,
    studentPhone,
    restaurantId,
    restaurantName,
    deliveryDate,
    status,
    screenshotUrl,
    totalAmount,
    itemsJson,
  ] = values;

  let items: OrderLineItem[] = [];
  try {
    items = JSON.parse(itemsJson || "[]");
  } catch {
    items = [];
  }

  return {
    id,
    created_at: createdAt,
    student_name: studentName,
    student_class: studentClass,
    student_phone: studentPhone,
    restaurant_id: restaurantId,
    restaurant_name: restaurantName,
    delivery_date: deliveryDate,
    status: status as OrderStatus,
    screenshot_url: screenshotUrl,
    total_amount: Number(totalAmount),
    items,
  };
}

function toValues(o: Order): (string | number)[] {
  return [
    o.id,
    o.created_at,
    o.student_name,
    o.student_class,
    o.student_phone,
    o.restaurant_id,
    o.restaurant_name,
    o.delivery_date,
    o.status,
    o.screenshot_url,
    o.total_amount,
    JSON.stringify(o.items),
  ];
}

export async function createOrder(input: {
  studentName: string;
  studentClass: string;
  studentPhone: string;
  restaurantId: string;
  restaurantName: string;
  deliveryDate: string;
  screenshotUrl: string;
  totalAmount: number;
  items: OrderLineItem[];
}): Promise<Order> {
  const order: Order = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    student_name: input.studentName,
    student_class: input.studentClass,
    student_phone: input.studentPhone,
    restaurant_id: input.restaurantId,
    restaurant_name: input.restaurantName,
    delivery_date: input.deliveryDate,
    status: "pending_review",
    screenshot_url: input.screenshotUrl,
    total_amount: input.totalAmount,
    items: input.items,
  };
  await appendRow(SHEET, toValues(order));
  return order;
}

export async function listOrdersByPhone(phone: string): Promise<Order[]> {
  const rows = await getRows(SHEET);
  return rows
    .map((row) => parseRow(row.values))
    .filter((order) => order.student_phone === phone)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function listAllOrders(): Promise<Order[]> {
  const rows = await getRows(SHEET);
  return rows
    .map((row) => parseRow(row.values))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function listOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
  const rows = await getRows(SHEET);
  return rows.map((row) => parseRow(row.values)).filter((o) => o.restaurant_id === restaurantId);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const rows = await getRows(SHEET);
  const match = rows.find((row) => row.values[0] === id);
  if (!match) return false;

  const current = parseRow(match.values);
  const next: Order = { ...current, status };
  await updateRow(SHEET, match.rowNumber, toValues(next));
  return true;
}
