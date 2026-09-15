import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, student_name, delivery_date, status, total_amount, created_at, restaurant_id, restaurants(name)")
    .eq("student_phone", phone)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to look up orders." }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}
