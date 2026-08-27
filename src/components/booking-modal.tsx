"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useBooking } from "./booking-context";

function line(label: string, value: string) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value || "—"}</span>
    </div>
  );
}

export function BookingModal() {
  const { selectedCar, selectCar, trip } = useBooking();

  useEffect(() => {
    if (!selectedCar) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && selectCar(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedCar, selectCar]);

  if (!selectedCar) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Book the ${selectedCar.name}`}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={() => selectCar(null)}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-brand-600" />
            <h2 className="text-xl font-bold tracking-tight">Booking summary</h2>
          </div>
          <button type="button" aria-label="Close" onClick={() => selectCar(null)} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 divide-y divide-line">
          {line("Car", `${selectedCar.name} · ${selectedCar.type}`)}
          {line("Pick-up", [trip.pickupCity, trip.pickupDate, trip.pickupTime].filter(Boolean).join(" · "))}
          {line("Drop-off", [trip.dropCity, trip.dropDate, trip.dropTime].filter(Boolean).join(" · "))}
          {line("Price", `$${selectedCar.price.toFixed(2)} / day`)}
        </div>

        <p className="mt-5 text-sm leading-6 text-ink/60">
          {trip.pickupCity
            ? "Everything looks good. Confirm to reserve this car — you can cancel free of charge up to 24 hours before pick-up."
            : "Add your pick-up and drop-off details in the search bar to complete this reservation."}
        </p>

        <button
          type="button"
          onClick={() => selectCar(null)}
          className="mt-6 w-full rounded-md bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Confirm booking
        </button>
      </div>
    </div>
  );
}
