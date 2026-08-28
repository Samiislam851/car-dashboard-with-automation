/**
 * Voyage AI embeddings (https://docs.voyageai.com/reference/embeddings-api).
 * Runs server-side only — never expose VOYAGE_API_KEY to client code.
 */
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-4-lite";
export const EMBEDDING_DIMENSIONS = 1024;

export type EmbeddingInputType = "document" | "query";

function getApiKey(): string {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set");
  }
  return apiKey;
}

type VoyageEmbeddingItem = { embedding: number[]; index: number };
type VoyageEmbeddingResponse = { data: VoyageEmbeddingItem[] };

/** Batched call — pass every chunk you need embedded in one request rather than one per chunk. */
async function callVoyageEmbeddings(inputs: string[], inputType: EmbeddingInputType): Promise<number[][]> {
  const apiKey = getApiKey();

  let res: Response;
  try {
    res = await fetch(VOYAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: inputs,
        model: VOYAGE_MODEL,
        input_type: inputType,
        output_dimension: EMBEDDING_DIMENSIONS,
      }),
    });
  } catch (error) {
    // Never include the key itself in the error.
    throw new Error(`Voyage embeddings request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Voyage embeddings request failed (${res.status}): ${errorText}`);
  }

  const data: VoyageEmbeddingResponse = await res.json();
  // Voyage returns items tagged with their input index — sort defensively so the
  // output order always matches the input order regardless of response order.
  return [...data.data].sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

export async function embed(text: string, inputType: EmbeddingInputType): Promise<number[]> {
  const [vector] = await callVoyageEmbeddings([text], inputType);
  return vector;
}

/** Embeds many chunks in a single Voyage request instead of one request per chunk. */
export async function embedBatch(texts: string[], inputType: EmbeddingInputType): Promise<number[][]> {
  if (texts.length === 0) return [];
  return callVoyageEmbeddings(texts, inputType);
}

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
