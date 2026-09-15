"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Restaurant } from "@/types";

export function RestaurantDetailsForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [isActive, setIsActive] = useState(restaurant.is_active);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, isActive }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to save changes.");
    }
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${restaurant.name}" and all its menu items? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/restaurants");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete restaurant (it may have existing orders).");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-3 rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <label className="text-sm font-medium">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="text-sm font-medium">
        Description
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Visible to students (active)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-4 py-2 text-white text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-600 hover:underline disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete restaurant"}
        </button>
      </div>
    </form>
  );
}
