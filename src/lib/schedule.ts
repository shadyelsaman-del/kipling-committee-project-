import "server-only";

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

export type OrderingDay = "saturday" | "monday";

export interface ScheduleInfo {
  isOpen: boolean;
  orderingDay: OrderingDay | null;
  /** Delivery date in YYYY-MM-DD form (Cairo calendar day), only set when open. */
  deliveryDate: string | null;
}

/**
 * Ordering is only open on Saturdays (delivery Sunday) and Mondays
 * (delivery Tuesday), based on the school's local (Cairo) calendar day.
 */
export function getScheduleInfo(now: Date = new Date()): ScheduleInfo {
  const { weekday, year, month, day } = getCairoDateParts(now);

  if (weekday === "Sat" || weekday === "Mon") {
    // Build today's Cairo date at UTC noon to avoid DST/midnight edge cases,
    // then add one day for the delivery date.
    const todayUtcNoon = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), 12)
    );
    const deliveryUtcNoon = new Date(todayUtcNoon);
    deliveryUtcNoon.setUTCDate(deliveryUtcNoon.getUTCDate() + 1);

    const deliveryDate = deliveryUtcNoon.toISOString().slice(0, 10);

    return {
      isOpen: true,
      orderingDay: weekday === "Sat" ? "saturday" : "monday",
      deliveryDate,
    };
  }

  return { isOpen: false, orderingDay: null, deliveryDate: null };
}
