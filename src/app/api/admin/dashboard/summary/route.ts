import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeek, lastWeek, totalSales, bookedVehicles] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: "success", createdAt: { gte: weekAgo, lte: now } },
      _sum: { price: true },
    }),
    prisma.booking.aggregate({
      where: { status: "success", createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      _sum: { price: true },
    }),
    prisma.booking.count({ where: { status: "success" } }),
    prisma.booking.findMany({
      where: { status: "success" },
      select: { vehicleId: true },
      distinct: ["vehicleId"],
    }),
  ]);

  const weeklyEarning = Number(thisWeek._sum.price ?? 0);
  const lastWeekEarning = Number(lastWeek._sum.price ?? 0);
  const weeklyChangePercent =
    lastWeekEarning > 0 ? ((weeklyEarning - lastWeekEarning) / lastWeekEarning) * 100 : null;

  return NextResponse.json({
    weeklyEarning,
    weeklyChangePercent,
    totalSales,
    purchasedGoods: bookedVehicles.length,
  });
}
