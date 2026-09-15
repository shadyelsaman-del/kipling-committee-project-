import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createRestaurant } from "@/lib/data/restaurants";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { name, description } = await req.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const restaurant = await createRestaurant({
    name: name.trim(),
    description: typeof description === "string" ? description.trim() || null : null,
  });

  return NextResponse.json({ restaurant });
}
