import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { name, description, imageUrl } = await req.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("restaurants")
    .insert({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      image_url: typeof imageUrl === "string" ? imageUrl.trim() || null : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create restaurant." },
      { status: 500 }
    );
  }

  return NextResponse.json({ restaurant: data });
}
