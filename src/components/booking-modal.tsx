"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

/** Short, stable reference derived from the booking id. */
function referenceOf(id: string) {
  return `#${id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function toIso(date: string, time: string) {
  if (!date) return null;
  return new Date(`${date}T${time || "00:00"}:00`).toISOString();
}

export function BookingModal() {
  const { selectedCar, selectCar, trip, isAuthenticated } = useBooking();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    if (!selectedCar) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && selectCar(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedCar, selectCar]);

  const close = () => {
    selectCar(null);
    setError(null);
    setConfirmed(null);
  };

  const confirmBooking = async () => {
    if (!selectedCar) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedCar.id,
          startLocation: trip.pickupCity || null,
          endLocation: trip.dropCity || null,
          startTime: toIso(trip.pickupDate, trip.pickupTime),
          endTime: toIso(trip.dropDate, trip.dropTime),
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setConfirmed({ id: data.id, status: data.status });
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCar) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Book the ${selectedCar.name}`}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-brand-600" />
            <h2 className="text-xl font-bold tracking-tight">
              {confirmed ? "Booking confirmed" : "Booking summary"}
            </h2>
          </div>
          <button type="button" aria-label="Close" onClick={close} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {selectedCar.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedCar.imageUrl}
            alt={selectedCar.name}
            className="mt-5 h-36 w-full rounded-lg object-cover"
          />
        )}

        {confirmed ? (
          <>
            <div className="mt-5 divide-y divide-line">
              {line("Reference", referenceOf(confirmed.id))}
              {line("Car", `${selectedCar.name} · ${selectedCar.type}`)}
              {line("Status", confirmed.status)}
            </div>
            <p className="mt-5 text-sm leading-6 text-ink/60">
              Your booking has been saved. Our team will confirm the reservation shortly.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-md border border-line py-3 text-sm font-semibold text-ink transition hover:border-brand-600"
              >
                Close
              </button>
              <Link
                href="/bookings"
                onClick={close}
                className="flex-1 rounded-md bg-brand-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                View my bookings
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 divide-y divide-line">
              {line("Car", `${selectedCar.name} · ${selectedCar.type}`)}
              {line("Pick-up", [trip.pickupCity, trip.pickupDate, trip.pickupTime].filter(Boolean).join(" · "))}
              {line("Drop-off", [trip.dropCity, trip.dropDate, trip.dropTime].filter(Boolean).join(" · "))}
              {line("Price", `$${selectedCar.price.toFixed(2)} / day`)}
            </div>

            <p className="mt-5 text-sm leading-6 text-ink/60">
              {!isAuthenticated
                ? "Log in to confirm this reservation."
                : trip.pickupCity
                  ? "Everything looks good. Confirm to reserve this car — you can cancel free of charge up to 24 hours before pick-up."
                  : "Add your pick-up and drop-off details in the search bar to complete this reservation."}
            </p>

            {error && (
              <p className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
            )}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={confirmBooking}
                disabled={submitting}
                className="mt-6 w-full rounded-md bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "Booking…" : "Confirm booking"}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={close}
                className="mt-6 block w-full rounded-md bg-brand-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Log in to confirm
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
