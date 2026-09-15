import Link from "next/link";
import { getScheduleInfo } from "@/lib/schedule";
import { listRestaurants } from "@/lib/data/restaurants";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const schedule = getScheduleInfo();

  if (!schedule.isOpen) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Ordering is closed</h1>
        <p className="text-gray-600 max-w-sm">
          Orders are only open on Saturdays (for Sunday delivery) and Mondays
          (for Tuesday delivery). Come back then!
        </p>
        <Link href="/" className="text-brand-600 font-medium hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  let restaurants;
  try {
    restaurants = (await listRestaurants()).filter((r) => r.is_active);
  } catch {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center text-red-600">
        Something went wrong loading restaurants. Please try again shortly.
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold">Choose a restaurant</h1>
      <p className="text-gray-600 mt-1">
        Delivery on{" "}
        <span className="font-medium">
          {new Date(`${schedule.deliveryDate}T00:00:00`).toLocaleDateString(
            "en-US",
            { weekday: "long", month: "long", day: "numeric" }
          )}
        </span>
      </p>

      {restaurants.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No restaurants are available yet. Check back soon!
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {restaurants.map((r) => (
            <li key={r.id}>
              <Link
                href={`/order/${r.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-400 hover:shadow-sm transition"
              >
                <div className="font-semibold">{r.name}</div>
                {r.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {r.description}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
