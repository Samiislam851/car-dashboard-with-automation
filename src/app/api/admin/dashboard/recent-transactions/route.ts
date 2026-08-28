import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { vehicle: { select: { name: true, imageUrl: true } } },
  });

  return NextResponse.json(
    bookings.map((booking) => ({
      id: booking.id,
      vehicleName: booking.vehicle.name,
      vehicleImageUrl: booking.vehicle.imageUrl,
      paymentMethod: booking.paymentMethod,
      status: booking.status,
      price: booking.price,
      createdAt: booking.createdAt,
    }))
  );
}
