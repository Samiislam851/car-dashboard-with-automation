"use client";

import { useState } from "react";
import { ArrowRightLeft, MapPin, Search } from "lucide-react";
import { CITIES, TIMES } from "@/lib/data";
import { useBooking, type Trip } from "./booking-context";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

const selectClass =
  "w-full truncate bg-transparent text-xs font-medium text-ink/70 outline-none focus:text-ink";

function TripCard({
  title,
  prefix,
  trip,
  onChange,
  children,
}: {
  title: string;
  prefix: "pickup" | "drop";
  trip: Trip;
  onChange: (patch: Partial<Trip>) => void;
  children?: React.ReactNode;
}) {
  const city = `${prefix}City` as const;
  const date = `${prefix}Date` as const;
  const time = `${prefix}Time` as const;

  return (
    <div className="flex-1 rounded-[10px] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:p-8">
      <p className="flex items-center gap-2 text-base font-semibold">
        <MapPin size={16} className="text-brand-600" />
        {title}
      </p>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <Field label="Locations">
          <select
            className={selectClass}
            value={trip[city]}
            onChange={(e) => onChange({ [city]: e.target.value } as Partial<Trip>)}
          >
            <option value="">Select your city</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <span className="hidden w-px self-stretch bg-line sm:block" />
        <Field label="Date">
          <input
            type="date"
            className={selectClass}
            value={trip[date]}
            onChange={(e) => onChange({ [date]: e.target.value } as Partial<Trip>)}
          />
        </Field>
        <span className="hidden w-px self-stretch bg-line sm:block" />
        <Field label="Time">
          <select
            className={selectClass}
            value={trip[time]}
            onChange={(e) => onChange({ [time]: e.target.value } as Partial<Trip>)}
          >
            <option value="">Select your time</option>
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        {children}
      </div>
    </div>
  );
}

export function SearchBar() {
  const { trip, setTrip } = useBooking();
  const [draft, setDraft] = useState<Trip>(trip);
  const patch = (p: Partial<Trip>) => setDraft((d) => ({ ...d, ...p }));

  const swap = () =>
    setDraft((d) => ({
      pickupCity: d.dropCity,
      pickupDate: d.dropDate,
      pickupTime: d.dropTime,
      dropCity: d.pickupCity,
      dropDate: d.pickupDate,
      dropTime: d.pickupTime,
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrip(draft);
    document.getElementById("rental-deals")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <form
      id="search"
      onSubmit={submit}
      className="container-page relative z-10 -mt-32 flex scroll-mt-24 flex-col items-stretch gap-4 lg:-mt-28 lg:flex-row"
    >
      <TripCard title="Pick - Up" prefix="pickup" trip={draft} onChange={patch} />

      <button
        type="button"
        onClick={swap}
        aria-label="Swap pick-up and drop-off"
        className="mx-auto -my-2 grid size-12 shrink-0 place-items-center self-center rounded-[10px] bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 lg:my-0"
      >
        <ArrowRightLeft size={18} />
      </button>

      <TripCard title="Drop - Off" prefix="drop" trip={draft} onChange={patch}>
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center gap-2 self-end rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition hover:bg-brand-700 sm:mt-6"
        >
          <Search size={16} />
          Search
        </button>
      </TripCard>
    </form>
  );
}
