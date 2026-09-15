import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAllOrders } from "@/lib/data/orders";
import type { Order } from "@/types";
import { AdminNav } from "../admin-nav";
import { LogoutButton } from "./logout-button";
import { OrderCard } from "./order-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  let orders: Order[];
  try {
    orders = await listAllOrders();
  } catch {
    return (
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <p className="text-red-600">Failed to load orders.</p>
      </main>
    );
  }

  const grouped = orders.reduce<Record<string, Order[]>>((acc, order) => {
    (acc[order.delivery_date] ??= []).push(order);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <AdminNav />

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
