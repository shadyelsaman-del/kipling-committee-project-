import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

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

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({
      restaurant_id: restaurantId,
      name: name.trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      price: Number(parsedPrice.toFixed(2)),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create menu item." },
      { status: 500 }
    );
  }

  return NextResponse.json({ menuItem: data });
}
