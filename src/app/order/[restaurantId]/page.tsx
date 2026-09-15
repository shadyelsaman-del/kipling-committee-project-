import Link from "next/link";
import { notFound } from "next/navigation";
import { getScheduleInfo } from "@/lib/schedule";
import { supabaseAdmin } from "@/lib/supabase";
import type { MenuItem, Restaurant } from "@/types";
import { MenuList } from "./menu-list";

export const dynamic = "force-dynamic";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const schedule = getScheduleInfo();

  if (!schedule.isOpen) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Ordering is closed</h1>
        <p className="text-gray-600 max-w-sm">
          Orders are only open on Saturdays and Mondays. Come back then!
        </p>
        <Link href="/" className="text-brand-600 font-medium hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  const { data: restaurant } = await supabaseAdmin
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .eq("is_active", true)
    .maybeSingle<Restaurant>();

  if (!restaurant) {
    notFound();
  }

  const { data: items } = await supabaseAdmin
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true)
    .order("name");

  const menuItems = (items ?? []) as MenuItem[];

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <Link href="/order" className="text-sm text-brand-600 hover:underline">
        &larr; All restaurants
      </Link>
      <h1 className="text-2xl font-bold mt-2">{restaurant.name}</h1>
      {restaurant.description && (
        <p className="text-gray-600 mt-1">{restaurant.description}</p>
      )}

      {menuItems.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No menu items available right now.
        </p>
      ) : (
        <MenuList
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          items={menuItems}
        />
      )}
    </main>
  );
}
