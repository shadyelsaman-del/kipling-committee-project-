"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderingOverride, Settings } from "@/lib/data/settings";

const OPTIONS: { value: OrderingOverride; label: string; description: string }[] = [
  {
    value: "auto",
    label: "Automatic",
    description: "Open only on Saturdays (Sunday delivery) and Mondays (Tuesday delivery).",
  },
  {
    value: "open",
    label: "Force open",
    description: "Open right now, regardless of the day, until you change this.",
  },
  {
    value: "closed",
    label: "Force closed",
    description: "Closed right now, even on a Saturday or Monday, until you change this.",
  },
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [orderingOverride, setOrderingOverride] = useState<OrderingOverride>(
    settings.orderingOverride
  );
  const [deliveryDate, setDeliveryDate] = useState(settings.overrideDeliveryDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderingOverride,
        overrideDeliveryDate: orderingOverride === "open" ? deliveryDate || null : null,
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
    } else {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          className={`rounded-lg border p-4 cursor-pointer transition ${
            orderingOverride === opt.value
              ? "border-brand-400 bg-brand-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="orderingOverride"
              value={opt.value}
              checked={orderingOverride === opt.value}
              onChange={() => setOrderingOverride(opt.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">{opt.label}</div>
              <div className="text-sm text-gray-600 mt-0.5">{opt.description}</div>
            </div>
          </div>
        </label>
      ))}

      {orderingOverride === "open" && (
        <div className="ml-1">
          <label className="block text-sm font-medium mb-1">
            Delivery date (optional — defaults to tomorrow)
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-green-700">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start mt-2 rounded-full bg-brand-600 px-6 py-2.5 text-white font-medium hover:bg-brand-700 transition disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
