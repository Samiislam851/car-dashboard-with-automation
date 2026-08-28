import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grouped = await prisma.booking.groupBy({
    by: ["country"],
    where: { country: { not: null } },
    _count: { country: true },
    _sum: { price: true },
    orderBy: { _count: { country: "desc" } },
  });

  return NextResponse.json(
    grouped.map((group) => ({
      country: group.country,
      sales: group._count.country,
      revenue: group._sum.price ?? 0,
    }))
  );
}
