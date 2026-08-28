import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/lib/data";

/** Same accent palette the static fixtures used — picked deterministically per vehicle so colours stay stable across requests. */
const TINTS = [
  "#3563e9", "#0f172a", "#f97316", "#0ea5e9", "#ef4444", "#22c55e",
  "#a855f7", "#64748b", "#facc15", "#111827", "#7c3aed", "#14b8a6",
];

function tintFor(id: string) {
  const sum = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  return TINTS[sum % TINTS.length];
}

const EXCLUSIVE_PRICE_THRESHOLD = 150;

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "available" },
    orderBy: { createdAt: "asc" },
  });

  if (vehicles.length === 0) {
    return NextResponse.json([]);
  }

  const bookingCounts = await prisma.booking.groupBy({
    by: ["vehicleId"],
    _count: { vehicleId: true },
  });
  const countByVehicle = new Map(bookingCounts.map((b) => [b.vehicleId, b._count.vehicleId]));
  const totalBookings = bookingCounts.reduce((sum, b) => sum + b._count.vehicleId, 0);
  const averageBookings = totalBookings / (bookingCounts.length || 1);

  const cars = vehicles.map((vehicle) => {
    const price = Number(vehicle.pricePerDay);
    const seats = vehicle.seats ?? 4;
    const bookings = countByVehicle.get(vehicle.id) ?? 0;

    // "Popular" ranks by real booking volume once bookings exist; with no history yet, nothing is excluded.
    const isPopular = totalBookings === 0 || bookings >= averageBookings;

    const category: Category[] = [];
    if (isPopular) category.push("popular");
    category.push(seats >= 5 ? "large" : "small");
    if (price >= EXCLUSIVE_PRICE_THRESHOLD) category.push("exclusive");

    return {
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.category ?? "Sedan",
      category,
      price,
      seats,
      gearbox: vehicle.transmission === "Manual" ? "Manual" : "Automatic",
      fuel: vehicle.fuelType ?? "Petrol",
      tint: tintFor(vehicle.id),
    };
  });

  return NextResponse.json(cars);
}
