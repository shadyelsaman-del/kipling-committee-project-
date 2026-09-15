import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (typeof body.description === "string") {
    update.description = body.description.trim() || null;
  }
  if (typeof body.imageUrl === "string") {
    update.image_url = body.imageUrl.trim() || null;
  }
  if (typeof body.isActive === "boolean") {
    update.is_active = body.isActive;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("restaurants")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update restaurant." },
      { status: 500 }
    );
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

  const { error } = await supabaseAdmin.from("restaurants").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete restaurant." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
