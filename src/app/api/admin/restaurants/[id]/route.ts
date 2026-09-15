import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteRestaurant, updateRestaurant } from "@/lib/data/restaurants";
import { deleteMenuItemsByRestaurant } from "@/lib/data/menu-items";
import { listOrdersByRestaurant } from "@/lib/data/orders";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const update: { name?: string; description?: string | null; is_active?: boolean } = {};

  if (typeof body.name === "string") {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (typeof body.description === "string") {
    update.description = body.description.trim() || null;
  }
  if (typeof body.isActive === "boolean") {
    update.is_active = body.isActive;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const ok = await updateRestaurant(id, update);
  if (!ok) {
    return NextResponse.json({ error: "Failed to update restaurant." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  const existingOrders = await listOrdersByRestaurant(id);
  if (existingOrders.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete a restaurant that has existing orders." },
      { status: 400 }
    );
  }

  await deleteMenuItemsByRestaurant(id);
  const ok = await deleteRestaurant(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete restaurant." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
