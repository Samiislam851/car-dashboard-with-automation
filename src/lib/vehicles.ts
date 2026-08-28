import useSWR from "swr";
import type { Car } from "./data";
import { fetcher } from "./fetcher";

/** Live vehicle inventory for the public site — replaces the old static CARS fixture. */
export function useVehicles() {
  return useSWR<Car[]>("/api/vehicles", fetcher, { revalidateOnFocus: false });
}

export type Booking = {
  id: string;
  vehicleName: string;
  vehicleImageUrl: string | null;
  startLocation: string | null;
  endLocation: string | null;
  startTime: string | null;
  endTime: string | null;
  price: string | number | null;
  status: string;
  createdAt: string;
};

/** The signed-in customer's own bookings. */
export function useBookings() {
  return useSWR<Booking[]>("/api/bookings", fetcher, { revalidateOnFocus: false });
}
