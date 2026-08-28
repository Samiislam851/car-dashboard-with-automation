import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Optional `?days=N` narrows the window; defaults to the trailing 7 days. */
export async function GET(request: NextRequest) {
  const daysParam = Number(request.nextUrl.searchParams.get("days"));
  const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.floor(daysParam) : 7;

  const now = new Date();
  const periodStart = new Date(now.getTime() - days * DAY_MS);
  const previousStart = new Date(now.getTime() - 2 * days * DAY_MS);

  const [thisPeriod, lastPeriod, totalSales, bookedVehicles] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: "success", createdAt: { gte: periodStart, lte: now } },
      _sum: { price: true },
    }),
    prisma.booking.aggregate({
      where: { status: "success", createdAt: { gte: previousStart, lt: periodStart } },
      _sum: { price: true },
    }),
    prisma.booking.count({ where: { status: "success", createdAt: { gte: periodStart, lte: now } } }),
    prisma.booking.findMany({
      where: { status: "success", createdAt: { gte: periodStart, lte: now } },
      select: { vehicleId: true },
      distinct: ["vehicleId"],
    }),
  ]);

  const weeklyEarning = Number(thisPeriod._sum.price ?? 0);
  const lastWeekEarning = Number(lastPeriod._sum.price ?? 0);
  const weeklyChangePercent =
    lastWeekEarning > 0 ? ((weeklyEarning - lastWeekEarning) / lastWeekEarning) * 100 : null;

  return NextResponse.json({
    weeklyEarning,
    weeklyChangePercent,
    totalSales,
    purchasedGoods: bookedVehicles.length,
    days,
    periodStart,
    periodEnd: now,
  });
}
