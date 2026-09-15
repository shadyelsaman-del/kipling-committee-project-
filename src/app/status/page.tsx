"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface StatusOrder {
  id: string;
  student_name: string;
  delivery_date: string;
  status: "pending_review" | "confirmed" | "ready_for_pickup";
  total_amount: number;
  created_at: string;
  restaurants: { name: string } | null;
}

const STATUS_LABELS: Record<StatusOrder["status"], string> = {
  pending_review: "Pending review",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
};

const STATUS_STEPS: StatusOrder["status"][] = [
  "pending_review",
  "confirmed",
  "ready_for_pickup",
];

function StatusContent() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [orders, setOrders] = useState<StatusOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(phoneToLookup: string) {
    if (!phoneToLookup.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders/lookup?phone=${encodeURIComponent(phoneToLookup.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch {
      setError("Could not look up orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = searchParams.get("phone");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- triggers an async lookup on mount
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex-1 px-6 py-10 max-w-xl mx-auto w-full">
      <h1 className="text-2xl font-bold">Check your order status</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(phone);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Your phone number"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-4 py-2 text-white font-medium hover:bg-brand-700 transition"
        >
          Look up
        </button>
      </form>

      {loading && <p className="mt-6 text-gray-500">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {orders && !loading && (
        <ul className="mt-6 flex flex-col gap-4">
          {orders.length === 0 && (
            <p className="text-gray-500">No orders found for this number.</p>
          )}
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {o.restaurants?.name ?? "Order"}
                </span>
                <span className="text-sm text-gray-600">
                  EGP {o.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Delivery:{" "}
                {new Date(`${o.delivery_date}T00:00:00`).toLocaleDateString(
                  "en-US",
                  { weekday: "long", month: "long", day: "numeric" }
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                {STATUS_STEPS.map((step, i) => {
                  const currentIndex = STATUS_STEPS.indexOf(o.status);
                  const reached = i <= currentIndex;
                  return (
                    <span key={step} className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          reached
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {STATUS_LABELS[step]}
                      </span>
                      {i < STATUS_STEPS.length - 1 && (
                        <span className="text-gray-300">→</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={null}>
      <StatusContent />
    </Suspense>
  );
}
