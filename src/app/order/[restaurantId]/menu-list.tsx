"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { MenuItem } from "@/types";

export function MenuList({
  restaurantId,
  restaurantName,
  items,
}: {
  restaurantId: string;
  restaurantName: string;
  items: MenuItem[];
}) {
  const { cart, addItem, updateQuantity, total } = useCart();

  const quantityFor = (itemId: string) =>
    cart?.restaurantId === restaurantId
      ? cart.lines.find((l) => l.menuItemId === itemId)?.quantity ?? 0
      : 0;

  const cartItemCount =
    cart?.restaurantId === restaurantId
      ? cart.lines.reduce((n, l) => n + l.quantity, 0)
      : 0;

  return (
    <div className="pb-28">
      <ul className="mt-6 flex flex-col gap-3">
        {items.map((item) => {
          const qty = quantityFor(item.id);
          return (
            <li
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-semibold">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-600 mt-0.5">
                    {item.description}
                  </div>
                )}
                <div className="text-sm text-gray-800 mt-1 font-medium">
                  EGP {item.price.toFixed(2)}
                </div>
              </div>
              {qty === 0 ? (
                <button
                  onClick={() =>
                    addItem(restaurantId, restaurantName, {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                    })
                  }
                  className="shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-brand-700 transition"
                >
                  Add
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, qty - 1)}
                    className="h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-5 text-center">{qty}</span>
                  <button
                    onClick={() => updateQuantity(item.id, qty + 1)}
                    className="h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {cartItemCount} item{cartItemCount > 1 ? "s" : ""} &middot; EGP{" "}
              {total.toFixed(2)}
            </div>
            <Link
              href="/checkout"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-white font-medium hover:bg-brand-700 transition"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
