import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createMenuItem } from "@/lib/data/menu-items";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { restaurantId, name, description, price } = await req.json();

  if (typeof restaurantId !== "string" || !restaurantId) {
    return NextResponse.json({ error: "Restaurant is required." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return NextResponse.json({ error: "Price must be a valid, non-negative number." }, { status: 400 });
  }

  const menuItem = await createMenuItem({
    restaurantId,
    name: name.trim(),
    description: typeof description === "string" ? description.trim() || null : null,
    price: Number(parsedPrice.toFixed(2)),
  });

  return NextResponse.json({ menuItem });
}
