import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  if (!Number.isInteger(year)) {
    return NextResponse.json({ error: "year must be an integer" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    select: { createdAt: true, price: true },
  });

  const monthlyTotals = Array(12).fill(0);
  for (const booking of bookings) {
    monthlyTotals[booking.createdAt.getMonth()] += Number(booking.price ?? 0);
  }

  return NextResponse.json(
    monthlyTotals.map((total, index) => ({ month: index + 1, total }))
  );
}
