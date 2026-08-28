import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { embedBatch, toVectorLiteral } from "./embeddings";
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

  // One batched embeddings request for every chunk, rather than one request per chunk.
  const vectors = await embedBatch(
    KNOWLEDGE_SEED_DATA.map((entry) => entry.content),
    "document",
  );

  for (let i = 0; i < KNOWLEDGE_SEED_DATA.length; i++) {
    const entry = KNOWLEDGE_SEED_DATA[i];
    const id = randomUUID();

    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks (id, category, content, embedding, created_at)
      VALUES (${id}, ${entry.category}, ${entry.content}, ${toVectorLiteral(vectors[i])}::vector, now())
    `;
  }

  return {
    seeded: true,
    chunks: KNOWLEDGE_SEED_DATA.length,
    message: "Knowledge base seed data created.",
  };
}
