"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order, OrderStatus } from "@/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "confirmed", label: "Confirmed" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
];

export function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(next: OrderStatus) {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setStatus(next);
      router.refresh();
    }
    setUpdating(false);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold">
            {order.student_name}{" "}
            <span className="text-gray-500 font-normal">
              &middot; Class {order.student_class}
            </span>
          </div>
          <div className="text-sm text-gray-600">{order.student_phone}</div>
          <div className="text-sm text-gray-600 mt-1">{order.restaurant_name}</div>
        </div>
        <select
          value={status}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="mt-3 text-sm text-gray-700">
        {order.items.map((item) => (
          <li key={item.menuItemId} className="flex justify-between">
            <span>
              {item.quantity}&times; {item.name}
            </span>
            <span>EGP {item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between font-medium">
        <span>Total</span>
        <span>EGP {order.total_amount.toFixed(2)}</span>
      </div>

      {order.screenshot_url && (
        <a
          href={order.screenshot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-brand-600 hover:underline"
        >
          View payment screenshot
        </a>
      )}
    </div>
  );
}
