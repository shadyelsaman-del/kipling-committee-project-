"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dashboard", label: "Orders" },
  { href: "/admin/restaurants", label: "Restaurants & Menus" },
  { href: "/admin/settings", label: "Ordering Schedule" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mt-2 flex gap-4 text-sm">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return active ? (
          <span key={tab.href} className="text-gray-400">
            {tab.label}
          </span>
        ) : (
          <Link key={tab.href} href={tab.href} className="text-brand-600 hover:underline">
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
