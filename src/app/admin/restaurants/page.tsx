import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listRestaurants } from "@/lib/data/restaurants";
import { AdminNav } from "../admin-nav";
import { LogoutButton } from "../dashboard/logout-button";
import { NewRestaurantForm } from "./new-restaurant-form";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  let list;
  try {
    list = await listRestaurants();
  } catch {
    return (
      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <p className="text-red-600">Failed to load restaurants.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants &amp; Menus</h1>
        <LogoutButton />
      </div>
      <AdminNav />

      <NewRestaurantForm />

      <ul className="mt-8 flex flex-col gap-3">
        {list.map((r) => (
          <li key={r.id}>
            <Link
              href={`/admin/restaurants/${r.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-400 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.name}</span>
                {!r.is_active && (
                  <span className="text-xs rounded-full bg-gray-100 text-gray-500 px-2 py-1">
                    Inactive
                  </span>
                )}
              </div>
              {r.description && (
                <div className="text-sm text-gray-600 mt-1">{r.description}</div>
              )}
            </Link>
          </li>
        ))}
        {list.length === 0 && (
          <p className="text-gray-500">No restaurants yet — add one above.</p>
        )}
      </ul>
    </main>
  );
}
