import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grouped = await prisma.booking.groupBy({
    by: ["vehicleId"],
    _count: { vehicleId: true },
    _sum: { price: true },
    orderBy: { _count: { vehicleId: "desc" } },
    take: 5,
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: grouped.map((g) => g.vehicleId) } },
  });
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const bestSellers = grouped.map((group) => {
    const vehicle = vehicleById.get(group.vehicleId);
    return {
      vehicleId: group.vehicleId,
      name: vehicle?.name ?? "Unknown",
      imageUrl: vehicle?.imageUrl ?? null,
      pricePerDay: vehicle?.pricePerDay ?? null,
      sales: group._count.vehicleId,
      revenue: group._sum.price ?? 0,
    };
  });

  return NextResponse.json(bestSellers);
}
