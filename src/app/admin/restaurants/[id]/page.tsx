import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getRestaurant } from "@/lib/data/restaurants";
import { listMenuItemsByRestaurant } from "@/lib/data/menu-items";
import { RestaurantDetailsForm } from "./restaurant-details-form";
import { MenuItemsManager } from "./menu-items-manager";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;

  let restaurant, menuItems;
  try {
    restaurant = await getRestaurant(id);
    menuItems = restaurant ? await listMenuItemsByRestaurant(id) : [];
  } catch {
    return (
      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <p className="text-red-600">Failed to load restaurant.</p>
      </main>
    );
  }

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <Link href="/admin/restaurants" className="text-sm text-brand-600 hover:underline">
        &larr; All restaurants
      </Link>
      <h1 className="text-2xl font-bold mt-2">{restaurant.name}</h1>

      <section className="mt-6">
        <h2 className="font-semibold">Restaurant details</h2>
        <RestaurantDetailsForm restaurant={restaurant} />
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Menu items</h2>
        <MenuItemsManager restaurantId={restaurant.id} items={menuItems} />
      </section>
    </main>
  );
}
