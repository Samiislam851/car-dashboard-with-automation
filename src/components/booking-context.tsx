"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Car } from "@/lib/data";

export type Trip = {
  pickupCity: string;
  pickupDate: string;
  pickupTime: string;
  dropCity: string;
  dropDate: string;
  dropTime: string;
};

const EMPTY_TRIP: Trip = {
  pickupCity: "",
  pickupDate: "",
  pickupTime: "",
  dropCity: "",
  dropDate: "",
  dropTime: "",
};

type BookingState = {
  trip: Trip;
  setTrip: (trip: Trip) => void;
  selectedCar: Car | null;
  selectCar: (car: Car | null) => void;
};

const BookingContext = createContext<BookingState | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<Trip>(EMPTY_TRIP);
  const [selectedCar, selectCar] = useState<Car | null>(null);
  const value = useMemo(
    () => ({ trip, setTrip, selectedCar, selectCar }),
    [trip, selectedCar],
  );
  return <BookingContext value={value}>{children}</BookingContext>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
