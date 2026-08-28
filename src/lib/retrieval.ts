import { prisma } from "./prisma";
import { embed, toVectorLiteral } from "./embeddings";

/**
 * Standalone retrieval service for the knowledge base. Deliberately has no
 * dependency on the chat/LLM route — it only knows about embeddings + Postgres,
 * so it can be called (or not) from anywhere without coupling to how the LLM
 * integration works.
 */
export type RetrievedChunk = {
  id: string;
  category: string;
  content: string;
  /** Cosine distance to the query embedding — lower is more relevant. */
  distance: number;
};

const DEFAULT_LIMIT = 3;

export async function retrieveRelevantKnowledge(
  question: string,
  limit: number = DEFAULT_LIMIT,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embed(question, "query");
  const literal = toVectorLiteral(queryEmbedding);

  return prisma.$queryRaw<RetrievedChunk[]>`
    SELECT id, category, content, embedding <=> ${literal}::vector AS distance
    FROM knowledge_chunks
    ORDER BY embedding <=> ${literal}::vector
    LIMIT ${limit}
  `;
}
