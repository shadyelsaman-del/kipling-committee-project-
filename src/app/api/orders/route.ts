import { NextRequest, NextResponse } from "next/server";
import { getScheduleInfo } from "@/lib/schedule";
import { getMenuItemsByIds } from "@/lib/data/menu-items";
import { getRestaurant } from "@/lib/data/restaurants";
import { createOrder } from "@/lib/data/orders";
import { uploadScreenshot } from "@/lib/screenshot-storage";
import {
  ALLOWED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_SIZE_BYTES,
} from "@/lib/payment-config";
import type { CartLine, OrderLineItem } from "@/types";

export async function POST(req: NextRequest) {
  const schedule = getScheduleInfo();
  if (!schedule.isOpen || !schedule.deliveryDate) {
    return NextResponse.json(
      { error: "Ordering is currently closed." },
      { status: 403 }
    );
  }

  const formData = await req.formData();

  const studentName = String(formData.get("studentName") ?? "").trim();
  const studentClass = String(formData.get("studentClass") ?? "").trim();
  const studentPhone = String(formData.get("studentPhone") ?? "").trim();
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "");
  const screenshot = formData.get("screenshot");

  if (!studentName || !studentClass || !studentPhone || !restaurantId) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  let lines: CartLine[];
  try {
    lines = JSON.parse(itemsRaw);
    if (!Array.isArray(lines) || lines.length === 0) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Cart is empty or invalid." },
      { status: 400 }
    );
  }

  if (!(screenshot instanceof File)) {
    return NextResponse.json(
      { error: "Payment screenshot is required." },
      { status: 400 }
    );
  }
  if (!ALLOWED_SCREENSHOT_TYPES.includes(screenshot.type)) {
    return NextResponse.json(
      { error: "Payment screenshot must be an image file." },
      { status: 400 }
    );
  }
  if (screenshot.size > MAX_SCREENSHOT_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Payment screenshot is too large (max 5 MB)." },
      { status: 400 }
    );
  }

  const restaurant = await getRestaurant(restaurantId);
  if (!restaurant || !restaurant.is_active) {
    return NextResponse.json(
      { error: "Restaurant is no longer available." },
      { status: 400 }
    );
  }

  // Re-fetch menu items server-side to trust prices/availability, not the client cart.
  const menuItemIds = lines.map((l) => l.menuItemId);
  const menuItems = (await getMenuItemsByIds(menuItemIds)).filter(
    (m) => m.restaurant_id === restaurantId && m.is_available
  );

  if (menuItems.length !== menuItemIds.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 400 }
    );
  }

  const items: OrderLineItem[] = lines.map((line) => {
    const menuItem = menuItems.find((m) => m.id === line.menuItemId)!;
    const quantity = Math.max(1, Math.floor(line.quantity));
    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      subtotal: Number((menuItem.price * quantity).toFixed(2)),
    };
  });

  const totalAmount = Number(
    items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
  );

  let screenshotUrl: string;
  try {
    screenshotUrl = await uploadScreenshot(screenshot);
  } catch {
    return NextResponse.json(
      { error: "Failed to upload payment screenshot." },
      { status: 500 }
    );
  }

  const order = await createOrder({
    studentName,
    studentClass,
    studentPhone,
    restaurantId,
    restaurantName: restaurant.name,
    deliveryDate: schedule.deliveryDate,
    screenshotUrl,
    totalAmount,
    items,
  });

  return NextResponse.json({ orderId: order.id });
}
