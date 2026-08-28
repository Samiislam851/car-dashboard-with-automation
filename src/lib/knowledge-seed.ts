import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { embed, toVectorLiteral } from "./embeddings";
import { KNOWLEDGE_SEED_DATA } from "./knowledge-data";

export async function runKnowledgeSeed() {
  const existing = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM knowledge_chunks
  `;
  const existingCount = Number(existing[0]?.count ?? 0);

  if (existingCount > 0) {
    return {
      seeded: false,
      chunks: existingCount,
      message: "Knowledge base already has chunks — skipped seeding.",
    };
  }

  let inserted = 0;
  for (const entry of KNOWLEDGE_SEED_DATA) {
    const vector = await embed(entry.content);
    const id = randomUUID();

    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks (id, category, content, embedding, created_at)
      VALUES (${id}, ${entry.category}, ${entry.content}, ${toVectorLiteral(vector)}::vector, now())
    `;
    inserted++;
  }

  return {
    seeded: true,
    chunks: inserted,
    message: "Knowledge base seed data created.",
  };
}
