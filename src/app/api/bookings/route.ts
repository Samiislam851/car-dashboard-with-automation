import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: { vehicle: { select: { name: true, imageUrl: true } } },
  });

  return NextResponse.json(
    bookings.map((booking) => ({
      id: booking.id,
      vehicleName: booking.vehicle.name,
      vehicleImageUrl: booking.vehicle.imageUrl,
      startLocation: booking.startLocation,
      endLocation: booking.endLocation,
      startTime: booking.startTime,
      endTime: booking.endTime,
      price: booking.price,
      status: booking.status,
      createdAt: booking.createdAt,
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in to book a car" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { vehicleId, startLocation, endLocation, startTime, endTime } = body as Record<string, unknown>;

  if (typeof vehicleId !== "string" || !vehicleId.trim()) {
    return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
  if (vehicle.status !== "available") {
    return NextResponse.json({ error: "This vehicle is not available" }, { status: 409 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { name: true } });

  const booking = await prisma.booking.create({
    data: {
      vehicleId,
      userId: session.id,
      customerName: user?.name ?? session.email,
      startLocation: typeof startLocation === "string" && startLocation ? startLocation : null,
      endLocation: typeof endLocation === "string" && endLocation ? endLocation : null,
      startTime: typeof startTime === "string" && startTime ? new Date(startTime) : null,
      endTime: typeof endTime === "string" && endTime ? new Date(endTime) : null,
      price: vehicle.pricePerDay,
      status: "pending",
    },
    include: { vehicle: { select: { name: true } } },
  });

  return NextResponse.json(
    {
      id: booking.id,
      vehicleName: booking.vehicle.name,
      startLocation: booking.startLocation,
      endLocation: booking.endLocation,
      startTime: booking.startTime,
      endTime: booking.endTime,
      price: booking.price,
      status: booking.status,
      createdAt: booking.createdAt,
    },
    { status: 201 }
  );
}
