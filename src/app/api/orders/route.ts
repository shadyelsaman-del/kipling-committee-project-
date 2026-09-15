import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getScheduleInfo } from "@/lib/schedule";
import { supabaseAdmin, PAYMENT_SCREENSHOTS_BUCKET } from "@/lib/supabase";
import {
  ALLOWED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_SIZE_BYTES,
} from "@/lib/payment-config";
import type { CartLine } from "@/types";

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

  // Re-fetch menu items server-side to trust prices/availability, not the client cart.
  const menuItemIds = lines.map((l) => l.menuItemId);
  const { data: menuItems, error: menuError } = await supabaseAdmin
    .from("menu_items")
    .select("*")
    .in("id", menuItemIds)
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true);

  if (menuError || !menuItems || menuItems.length !== menuItemIds.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 400 }
    );
  }

  const orderItems = lines.map((line) => {
    const menuItem = menuItems.find((m) => m.id === line.menuItemId)!;
    const quantity = Math.max(1, Math.floor(line.quantity));
    return {
      menu_item_id: menuItem.id,
      item_name: menuItem.name,
      item_price: menuItem.price,
      quantity,
      subtotal: Number((menuItem.price * quantity).toFixed(2)),
    };
  });

  const totalAmount = Number(
    orderItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
  );

  const extension = screenshot.name.split(".").pop() || "jpg";
  const storagePath = `${schedule.deliveryDate}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PAYMENT_SCREENSHOTS_BUCKET)
    .upload(storagePath, screenshot, {
      contentType: screenshot.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to upload payment screenshot." },
      { status: 500 }
    );
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      student_name: studentName,
      student_class: studentClass,
      student_phone: studentPhone,
      restaurant_id: restaurantId,
      delivery_date: schedule.deliveryDate,
      payment_screenshot_path: storagePath,
      total_amount: totalAmount,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    orderItems.map((i) => ({ ...i, order_id: order.id }))
  );

  if (itemsError) {
    return NextResponse.json(
      { error: "Failed to save order items." },
      { status: 500 }
    );
  }

  return NextResponse.json({ orderId: order.id });
}
