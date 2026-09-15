import { NextRequest, NextResponse } from "next/server";
import { listOrdersByPhone } from "@/lib/data/orders";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  try {
    const orders = await listOrdersByPhone(phone);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to look up orders." }, { status: 500 });
  }
}
