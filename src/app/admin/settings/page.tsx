import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSettings } from "@/lib/data/settings";
import { getScheduleInfo } from "@/lib/schedule";
import { AdminNav } from "../admin-nav";
import { LogoutButton } from "../dashboard/logout-button";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [settings, schedule] = await Promise.all([getSettings(), getScheduleInfo()]);

  return (
    <main className="flex-1 px-6 py-10 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ordering Schedule</h1>
        <LogoutButton />
      </div>
      <AdminNav />

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-sm text-gray-600">Right now, ordering is:</div>
        <div className="mt-1 text-lg font-semibold">
          {schedule.isOpen ? (
            <span className="text-green-700">
              Open — delivery{" "}
              {new Date(`${schedule.deliveryDate}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          ) : (
            <span className="text-red-700">Closed</span>
          )}
        </div>
      </div>

      <SettingsForm settings={settings} />
    </main>
  );
}
