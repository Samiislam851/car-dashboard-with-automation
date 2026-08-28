import { NextResponse } from "next/server";
import { runKnowledgeSeed } from "@/lib/knowledge-seed";

export async function GET() {
  try {
    const result = await runKnowledgeSeed();
    return NextResponse.json(result, { status: result.seeded ? 201 : 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to seed knowledge base" }, { status: 500 });
  }
}
