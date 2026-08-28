# Adding a Minimal RAG Layer — Investigation & Proposal

Status: **proposal only — nothing in this document has been implemented.**

## 1. Current AI/LLM implementation (as of this writing)

### Files involved

| File | Role |
|---|---|
| `src/app/api/chat/route.ts` | Route handler. Auth-gates the request, then calls the LLM and streams the reply back. |
| `src/lib/session.ts` | `getSessionUser()` — reads the `access_token` httpOnly cookie and verifies the JWT. |
| `src/lib/auth.ts` | JWT sign/verify + password hashing primitives used by `session.ts`. |
| `src/components/chat-widget.tsx` | Client UI. Sends the message, reads the response body as a stream, appends it to the assistant bubble chunk by chunk. |
| `src/app/layout.tsx` | Mounts `<ChatWidget />` globally (line 25). |

### The exact function that talks to the LLM

**`streamCompletion(userMessage: string)`** in `src/app/api/chat/route.ts` (lines 17–92).

```ts
function streamCompletion(userMessage: string) {
  const apiKey = process.env.LLM_API_KEY;
  ...
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.LLM_MODEL ?? DEFAULT_MODEL,
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        }),
      });
      // ...reads upstream SSE body, parses `data: {...}` lines,
      // pulls out choices[0].delta.content, and re-enqueues it as
      // plain UTF-8 text chunks on `controller`.
    },
  });
}
```

This is the single point of contact with the LLM. It:
1. Takes one plain string (`userMessage`) — no conversation history, no extra context.
2. Builds a two-message array: a fixed `SYSTEM_PROMPT` + the user's message.
3. POSTs to OpenRouter's OpenAI-compatible endpoint (`https://openrouter.ai/api/v1/chat/completions`) with `stream: true`.
4. Parses OpenRouter's SSE stream itself and re-emits only the text deltas, so the caller sees a flat `text/plain` byte stream — not SSE, not JSON.

### Full request flow

```
ChatWidget.send()                                  (src/components/chat-widget.tsx)
  → POST /api/chat  { message }
      → POST handler (src/app/api/chat/route.ts)
          → getSessionUser()                        (src/lib/session.ts)
              → reads "access_token" cookie, verifyAccessToken()  (src/lib/auth.ts)
          → 401 if no user / validates `message` is a non-empty string
          → streamCompletion(message.trim())
              → fetch → OpenRouter chat-completions (model: openai/gpt-4o-mini by default)
              → parses upstream SSE → re-emits plain-text chunks
          → returns `new Response(stream, { "Content-Type": "text/plain", ... })`
  ← reads res.body via getReader(), decodes chunks, appends to the assistant message text as they arrive
```

Key properties of the current design, relevant to adding RAG:
- **Single-turn**: only the latest message is ever sent to the model. No history is threaded through.
- **One call site**: `streamCompletion` is called exactly once, from the `POST` handler, with a plain string argument.
- **No document/knowledge store** exists anywhere in the app today (confirmed by inspecting the schema below).

## 2. Prisma schema & Neon/Postgres inspection

`prisma/schema.prisma` (Prisma 6.19.3, `provider = "prisma-client-js"`, classic engine):

```prisma
model User    { id, name, email, passwordHash, role, createdAt, vehicles[], bookings[] }
model Vehicle { id, name, category, pricePerDay, transmission, fuelType, seats, status, imageUrl, ownerId, createdAt, bookings[] }
model Booking { id, vehicleId, userId, customerName, startLocation, endLocation, startTime, endTime, price, paymentMethod, status, country, createdAt }
```

No table today is suited to storing free-text knowledge or vectors — this needs a new model.

`DATABASE_URL` points at a **Neon** Postgres instance (`*.neon.tech`, `sslmode=require`).

Direct inspection of the live database (`pg_available_extensions`, `pg_extension`, `version()`):

| Check | Result |
|---|---|
| Postgres version | 18.6 |
| `vector` extension available | ✅ yes — version `0.8.6` |
| `vector` extension installed | ❌ not yet (`CREATE EXTENSION` has not been run) |
| Index methods available | `ivfflat` and `hnsw` (both come with pgvector 0.8.6) |

**Conclusion: this Neon database can do embeddings + similarity search natively via `pgvector`, with no new infrastructure.** It only needs `CREATE EXTENSION IF NOT EXISTS vector;` run once.

## 3. Proposed architecture

The goal is to inject retrieved context into the prompt **without touching `streamCompletion`, `session.ts`, or the client widget at all.** The entire RAG layer lives upstream of the existing call site.

### 3.1 New pieces

**A. Enable pgvector on Neon** (one-time, raw SQL — not a Prisma-schema-managed step by default):
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**B. New table for chunked documents + their embeddings.**

Prisma has no first-class `vector` scalar, so the column is declared with `Unsupported(...)`, which excludes it from the generated Client's typed API — all reads/writes to that column go through `$queryRaw`/`$executeRaw`. This is the standard way to use pgvector with Prisma today.

```prisma
model DocumentChunk {
  id        String   @id @default(uuid())
  source    String?  // e.g. filename or URL the chunk came from
  content   String
  embedding Unsupported("vector(1536)") // dimension must match the embedding model chosen (see 3.3)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("document_chunks")
}
```

Plus a hand-written migration statement (Prisma migrations can carry raw SQL) to add a similarity index:
```sql
CREATE INDEX document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops);
```

**C. A retrieval helper — new file, e.g. `src/lib/rag.ts`:**
```ts
export async function retrieveContext(query: string): Promise<string | null> {
  const queryEmbedding = await embed(query);          // new embedding call — see 3.3
  const rows = await prisma.$queryRaw<{ content: string }[]>`
    SELECT content
    FROM document_chunks
    ORDER BY embedding <=> ${toVectorLiteral(queryEmbedding)}::vector
    LIMIT 5
  `;
  if (rows.length === 0) return null;
  return rows.map((r) => r.content).join("\n---\n");
}
```
(`<=>` is pgvector's cosine-distance operator; `<->` = Euclidean, `<#>` = inner product — cosine is the usual default for text embeddings.)

**D. One new call site in the existing route — the only edit to `route.ts`:**
```ts
// inside POST(), after validating `message`, before calling streamCompletion:
const context = await retrieveContext(message.trim());
const prompt = context
  ? `Use this context if relevant:\n${context}\n\nQuestion: ${message.trim()}`
  : message.trim();

stream = streamCompletion(prompt); // <-- unchanged function, just a richer string argument
```
`streamCompletion` itself, `session.ts`, `auth.ts`, and `chat-widget.tsx` all stay exactly as they are — the contract (`streamCompletion(userMessage: string) => ReadableStream`) doesn't change shape, only the string passed into it grows a "Context: ..." prefix when relevant chunks are found.

**E. An ingestion path (not built yet, but required to populate the table).** Something admin-gated, following the same pattern as the existing `/api/admin/seed`: accept raw text, chunk it (simple fixed-size/paragraph splitting with overlap — no library needed at this scale), embed each chunk, insert into `document_chunks`. Out of scope for this document, but the schema/table above is designed to support it directly.

### 3.2 Data flow diagram

```
                         ┌─────────────────────────────┐
                         │   POST /api/chat  (route.ts) │
                         └──────────────┬──────────────┘
                                        │
                          getSessionUser()  (unchanged)
                                        │
                     ┌──────────────────▼───────────────────┐
                     │  NEW: retrieveContext(message)        │
                     │   1. embed(message)                   │
                     │   2. pgvector cosine search (top 5)    │
                     │   3. join chunk text                  │
                     └──────────────────┬───────────────────┘
                                        │  augmented prompt string
                     ┌──────────────────▼───────────────────┐
                     │  streamCompletion(prompt)  (UNCHANGED) │
                     │   → OpenRouter → SSE → plain-text     │
                     └──────────────────┬───────────────────┘
                                        │
                                 (same as today)
                                        ▼
                              chat-widget.tsx renders
```

### 3.3 The one open decision: where do embeddings come from?

OpenRouter (the existing `LLM_API_KEY`) is primarily a chat-completions proxy; its embeddings support is limited and inconsistent across providers, so it can't be assumed to just work. Three realistic options:

| Option | How | New env/deps | Vector size | Trade-off |
|---|---|---|---|---|
| **A. Dedicated embeddings API** (recommended default) | `fetch` a standard `/v1/embeddings` endpoint (e.g. OpenAI's `text-embedding-3-small`), same `fetch`-based pattern already used for OpenRouter | 1 new env var (e.g. `EMBEDDING_API_KEY`); no new npm package | 1536 | Best quality/cost ratio, one extra HTTP call per message, needs its own API key |
| **B. OpenRouter embeddings** | Try OpenRouter's `/api/v1/embeddings` with a model that supports it | Reuses `LLM_API_KEY` | model-dependent | Simplest key-wise *if* the chosen model actually supports it on OpenRouter — needs to be verified before relying on it |
| **C. Local/offline model** | Run a small model in-process (e.g. `@xenova/transformers`, `all-MiniLM-L6-v2`) | 1 new npm dependency, no API key, no network call | 384 | Zero marginal cost/key, but adds a sizeable dependency and slower cold starts (model weights loaded into the Node process) |

Whichever is chosen determines the `vector(N)` dimension in the `DocumentChunk` model (1536 for A/B with an OpenAI-style model, 384 for C with MiniLM) — the schema above uses 1536 as a placeholder.

### 3.4 Required dependencies summary

- **Postgres**: `CREATE EXTENSION vector;` on the existing Neon database — no new infrastructure, no new service.
- **Prisma**: no version change needed; uses the existing `Unsupported(...)` field type + `$queryRaw`. (Optional convenience: enable the `postgresqlExtensions` preview feature to let `schema.prisma` declare `extensions = [vector]` and manage the `CREATE EXTENSION` step via `prisma migrate`/`db push` instead of a manual SQL statement — not required.)
- **Embeddings**: either an API key for a hosted embeddings endpoint (option A/B, no new npm package — just `fetch`, matching the existing OpenRouter call style) or one new npm dependency for a local model (option C).
- **Chunking**: no new dependency — simple hand-rolled paragraph/character-window splitting is sufficient at this scale; deliberately not pulling in a framework like LangChain for this.

### 3.5 What does *not* change

- `streamCompletion` — same signature, same OpenRouter call, same SSE-to-plain-text parsing.
- `src/lib/session.ts`, `src/lib/auth.ts` — untouched.
- `src/components/chat-widget.tsx` — untouched; it still just POSTs `{ message }` and reads a `text/plain` stream back.
- Existing models (`User`, `Vehicle`, `Booking`) — untouched; `DocumentChunk` is additive.
