"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useBookings } from "@/lib/vehicles";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

function money(value: string | number | null) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export function BookingsList() {
  const { data, error, isLoading } = useBookings();

  if (isLoading) return <p className="text-sm font-medium text-muted">Loading your bookings…</p>;
  if (error)
    return (
      <p className="text-sm font-medium text-red-600">Couldn&apos;t load your bookings right now.</p>
    );
  if (!data?.length)
    return <p className="text-sm font-medium text-muted">You haven&apos;t booked a car yet.</p>;

  return (
    <ul className="flex flex-col gap-4">
      {data.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-col gap-3 rounded-[10px] border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-lg font-bold tracking-tight">{booking.vehicleName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">
              {(booking.startLocation || booking.endLocation) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {[booking.startLocation, booking.endLocation].filter(Boolean).join(" → ")}
                </span>
              )}
              {booking.startTime && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {new Date(booking.startTime).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                STATUS_STYLE[booking.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {booking.status}
            </span>
            <span className="text-base font-bold">{money(booking.price)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
