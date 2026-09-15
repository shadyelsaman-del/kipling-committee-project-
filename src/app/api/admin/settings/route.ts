import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateSettings, type OrderingOverride } from "@/lib/data/settings";

const VALID_OVERRIDES: OrderingOverride[] = ["auto", "open", "closed"];

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { orderingOverride, overrideDeliveryDate } = await req.json();

  if (!VALID_OVERRIDES.includes(orderingOverride)) {
    return NextResponse.json({ error: "Invalid ordering override." }, { status: 400 });
  }
  if (overrideDeliveryDate !== undefined && overrideDeliveryDate !== null) {
    if (
      typeof overrideDeliveryDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(overrideDeliveryDate)
    ) {
      return NextResponse.json(
        { error: "Delivery date must be in YYYY-MM-DD form." },
        { status: 400 }
      );
    }
  }

  const settings = await updateSettings({
    orderingOverride,
    overrideDeliveryDate: overrideDeliveryDate || null,
  });

  return NextResponse.json({ settings });
}
