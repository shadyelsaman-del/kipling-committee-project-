"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { PAYMENT_DETAILS } from "@/lib/payment-config";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, total, clearCart } = useCart();

  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cart || cart.lines.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/order" className="text-brand-600 font-medium hover:underline">
          Browse restaurants
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentName.trim() || !studentClass.trim() || !studentPhone.trim()) {
      setError("Please fill in your name, class, and phone number.");
      return;
    }
    if (!screenshot) {
      setError("Please upload a screenshot of your payment.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("studentName", studentName.trim());
      formData.set("studentClass", studentClass.trim());
      formData.set("studentPhone", studentPhone.trim());
      formData.set("restaurantId", cart!.restaurantId);
      formData.set("items", JSON.stringify(cart!.lines));
      formData.set("screenshot", screenshot);

      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/status?phone=${encodeURIComponent(studentPhone.trim())}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-xl mx-auto w-full">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="text-gray-600 mt-1">Ordering from {cart.restaurantName}</p>

      <ul className="mt-6 flex flex-col gap-2">
        {cart.lines.map((l) => (
          <li
            key={l.menuItemId}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
          >
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-sm text-gray-600">
                EGP {l.price.toFixed(2)} each
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(l.menuItemId, l.quantity - 1)}
                className="h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-5 text-center">{l.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(l.menuItemId, l.quantity + 1)}
                className="h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(l.menuItemId)}
                className="ml-1 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between font-semibold text-lg">
        <span>Total</span>
        <span>EGP {total.toFixed(2)}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <h2 className="font-semibold text-lg">Your details</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <input
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            placeholder="e.g. F"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone number
          </label>
          <input
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            type="tel"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div className="mt-4 rounded-lg bg-brand-50 border border-brand-200 p-4">
          <h2 className="font-semibold">Payment</h2>
          <p className="text-sm text-gray-700 mt-1">
            {PAYMENT_DETAILS.instructions}
          </p>
          <dl className="mt-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium">Instapay:</dt>
              <dd>{PAYMENT_DETAILS.instapayHandle}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Telda:</dt>
              <dd>{PAYMENT_DETAILS.teldaHandle}</dd>
            </div>
          </dl>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Payment screenshot
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700 transition disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit order"}
        </button>
      </form>
    </main>
  );
}
