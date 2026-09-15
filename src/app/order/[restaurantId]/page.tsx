import Link from "next/link";
import { notFound } from "next/navigation";
import { getScheduleInfo } from "@/lib/schedule";
import { getRestaurant } from "@/lib/data/restaurants";
import { listMenuItemsByRestaurant } from "@/lib/data/menu-items";
import { MenuList } from "./menu-list";

export const dynamic = "force-dynamic";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const schedule = await getScheduleInfo();

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

  let restaurant, menuItems;
  try {
    restaurant = await getRestaurant(restaurantId);
    menuItems = restaurant
      ? (await listMenuItemsByRestaurant(restaurantId)).filter((item) => item.is_available)
      : [];
  } catch {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center text-red-600">
        Something went wrong loading this restaurant. Please try again shortly.
      </main>
    );
  }

  if (!restaurant || !restaurant.is_active) {
    notFound();
  }

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
