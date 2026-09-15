import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin, PAYMENT_SCREENSHOTS_BUCKET } from "@/lib/supabase";
import { LogoutButton } from "./logout-button";
import { OrderCard, type DashboardOrder } from "./order-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(
      "*, restaurants(name), order_items(id, item_name, item_price, quantity, subtotal)"
    )
    .order("delivery_date", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !orders) {
    return (
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <p className="text-red-600">Failed to load orders.</p>
      </main>
    );
  }

  // Attach a signed URL for each payment screenshot (bucket is private).
  const ordersWithUrls: DashboardOrder[] = await Promise.all(
    orders.map(async (order) => {
      const { data: signed } = await supabaseAdmin.storage
        .from(PAYMENT_SCREENSHOTS_BUCKET)
        .createSignedUrl(order.payment_screenshot_path, 60 * 60);
      return { ...order, screenshotUrl: signed?.signedUrl ?? null };
    })
  );

  const grouped = ordersWithUrls.reduce<Record<string, DashboardOrder[]>>(
    (acc, order) => {
      (acc[order.delivery_date] ??= []).push(order);
      return acc;
    },
    {}
  );

  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="mt-2 flex gap-4 text-sm">
        <span className="text-gray-400">Orders</span>
        <Link href="/admin/restaurants" className="text-blue-600 hover:underline">
          Restaurants &amp; Menus
        </Link>
      </div>

      {dates.length === 0 && (
        <p className="mt-8 text-gray-500">No orders yet.</p>
      )}

      {dates.map((date) => (
        <section key={date} className="mt-10">
          <h2 className="text-lg font-semibold border-b border-gray-200 pb-2">
            {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {grouped[date].map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
