"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MenuItem } from "@/types";

export function MenuItemsManager({
  restaurantId,
  items,
}: {
  restaurantId: string;
  items: MenuItem[];
}) {
  return (
    <div className="mt-3 flex flex-col gap-3">
      {items.map((item) => (
        <MenuItemRow key={item.id} item={item} />
      ))}
      {items.length === 0 && (
        <p className="text-gray-500 text-sm">No menu items yet — add one below.</p>
      )}
      <NewMenuItemForm restaurantId={restaurantId} />
    </div>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [price, setPrice] = useState(String(item.price));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function patch(update: Record<string, unknown>) {
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/admin/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      setSaving(false);
      return false;
    }
    setSaving(false);
    router.refresh();
    return true;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const parsedPrice = Number(price);
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a valid, non-negative number.");
      return;
    }
    const ok = await patch({ name, description, price: parsedPrice });
    if (ok) setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const res = await fetch(`/api/admin/menu-items/${item.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="Item name"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="Description (optional)"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          step="0.01"
          min="0"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm w-32"
          placeholder="Price"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center justify-between gap-4">
      <div>
        <div className="font-medium">
          {item.name}{" "}
          {!item.is_available && (
            <span className="text-xs rounded-full bg-gray-100 text-gray-500 px-2 py-0.5">
              Unavailable
            </span>
          )}
        </div>
        {item.description && (
          <div className="text-sm text-gray-600">{item.description}</div>
        )}
        <div className="text-sm text-gray-800 font-medium">
          EGP {item.price.toFixed(2)}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2 text-sm">
        <button
          onClick={() => patch({ isAvailable: !item.is_available })}
          disabled={saving}
          className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100 disabled:opacity-60"
        >
          {item.is_available ? "Mark unavailable" : "Mark available"}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100"
        >
          Edit
        </button>
        <button onClick={handleDelete} className="text-red-600 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

function NewMenuItemForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedPrice = Number(price);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a valid, non-negative number.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/admin/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, name, description, price: parsedPrice }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to add item.");
      setSubmitting(false);
      return;
    }
    setName("");
    setDescription("");
    setPrice("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-dashed border-gray-300 bg-white p-3 flex flex-col gap-2"
    >
      <h3 className="text-sm font-semibold">Add a menu item</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        step="0.01"
        min="0"
        placeholder="Price (EGP)"
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm w-32"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-brand-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
      >
        {submitting ? "Adding..." : "Add item"}
      </button>
    </form>
  );
}
