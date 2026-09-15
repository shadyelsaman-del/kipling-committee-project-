import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { MenuItem, Restaurant } from "@/types";
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

  const { data: restaurant } = await supabaseAdmin
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle<Restaurant>();

  if (!restaurant) {
    notFound();
  }

  const { data: items } = await supabaseAdmin
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", id)
    .order("name");

  const menuItems = (items ?? []) as MenuItem[];

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <Link href="/admin/restaurants" className="text-sm text-blue-600 hover:underline">
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
