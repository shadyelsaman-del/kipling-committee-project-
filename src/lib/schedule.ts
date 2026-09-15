import "server-only";
import { getSettings } from "./data/settings";

// The school runs on Cairo time regardless of where the server is hosted.
const SCHOOL_TIMEZONE = "Africa/Cairo";

function getCairoDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return {
    weekday: get("weekday"), // "Sat", "Sun", "Mon", ...
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

function tomorrowIso(now: Date): string {
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export type OrderingDay = "saturday" | "monday";

export interface ScheduleInfo {
  isOpen: boolean;
  orderingDay: OrderingDay | null;
  /** Delivery date in YYYY-MM-DD form (Cairo calendar day), only set when open. */
  deliveryDate: string | null;
}

/** The default Saturday/Monday calendar rule, ignoring any committee override. */
function getAutoSchedule(now: Date): ScheduleInfo {
  const { weekday, year, month, day } = getCairoDateParts(now);

  if (weekday === "Sat" || weekday === "Mon") {
    // Build today's Cairo date at UTC noon to avoid DST/midnight edge cases,
    // then add one day for the delivery date.
    const todayUtcNoon = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), 12)
    );
    const deliveryUtcNoon = new Date(todayUtcNoon);
    deliveryUtcNoon.setUTCDate(deliveryUtcNoon.getUTCDate() + 1);

    return {
      isOpen: true,
      orderingDay: weekday === "Sat" ? "saturday" : "monday",
      deliveryDate: deliveryUtcNoon.toISOString().slice(0, 10),
    };
  }

  return { isOpen: false, orderingDay: null, deliveryDate: null };
}

/**
 * Ordering is open on Saturdays (delivery Sunday) and Mondays (delivery
 * Tuesday) by default, based on the school's local (Cairo) calendar day —
 * unless the committee has manually forced it open or closed from
 * /admin/settings.
 */
export async function getScheduleInfo(now: Date = new Date()): Promise<ScheduleInfo> {
  // Testing-only escape hatch so the ordering flow can be tried on any day
  // without waiting for Saturday/Monday. Never set this in production.
  if (process.env.ALLOW_ORDERING_ANY_DAY === "true") {
    return { isOpen: true, orderingDay: "saturday", deliveryDate: tomorrowIso(now) };
  }

  const settings = await getSettings();

  if (settings.orderingOverride === "closed") {
    return { isOpen: false, orderingDay: null, deliveryDate: null };
  }

  if (settings.orderingOverride === "open") {
    return {
      isOpen: true,
      orderingDay: null,
      deliveryDate: settings.overrideDeliveryDate || tomorrowIso(now),
    };
  }

  return getAutoSchedule(now);
}
