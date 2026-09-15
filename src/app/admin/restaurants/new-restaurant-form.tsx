"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewRestaurantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/admin/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to add restaurant.");
      setSubmitting(false);
      return;
    }

    setName("");
    setDescription("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3"
    >
      <h2 className="font-semibold">Add a restaurant</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Restaurant name"
        className="rounded-md border border-gray-300 px-3 py-2"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description (optional)"
        className="rounded-md border border-gray-300 px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-brand-600 px-4 py-2 text-white text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
      >
        {submitting ? "Adding..." : "Add restaurant"}
      </button>
    </form>
  );
}
