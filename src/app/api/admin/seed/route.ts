import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";

export async function POST() {
  try {
    const result = await runSeed();
    return NextResponse.json(result, { status: result.seeded ? 201 : 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
