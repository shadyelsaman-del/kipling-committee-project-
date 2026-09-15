import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteMenuItem, updateMenuItem } from "@/lib/data/menu-items";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const update: {
    name?: string;
    description?: string | null;
    price?: number;
    is_available?: boolean;
  } = {};

  if (typeof body.name === "string") {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (typeof body.description === "string") {
    update.description = body.description.trim() || null;
  }
  if (body.price !== undefined) {
    const parsedPrice = Number(body.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a valid, non-negative number." },
        { status: 400 }
      );
    }
    update.price = Number(parsedPrice.toFixed(2));
  }
  if (typeof body.isAvailable === "boolean") {
    update.is_available = body.isAvailable;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const ok = await updateMenuItem(id, update);
  if (!ok) {
    return NextResponse.json({ error: "Failed to update menu item." }, { status: 500 });
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

  const ok = await deleteMenuItem(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete menu item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
