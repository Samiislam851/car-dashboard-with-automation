# Best Car — Car Rental Platform + Admin Dashboard + AI Automation

Technical assessment for **Digital Pylot** (Web Designer / Web Developer + AI Automation).

A full-stack car rental application built from the provided Figma file. It covers both
parts of the brief — a **customer-facing website** developed from the wireframe, and a
**functional admin dashboard** built pixel-accurately from the dashboard design — plus
an **AI assistant** with retrieval-augmented answers and an automated booking workflow,
backed by a real LLM, a vector database, and a REST API layer over PostgreSQL.

| | |
|---|---|
| **Live site** | https://car-dashboard-with-automation.vercel.app |
| **Repository** | https://github.com/Samiislam851/car-dashboard-with-automation |
| **Figma** | [Task file](https://www.figma.com/design/YZVObhEegXBdtzHYA2u0fk/Task) |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 (design tokens in `src/app/globals.css`) |
| Database | PostgreSQL via Prisma 6, with the `pgvector` extension for embeddings |
| Auth | JWT in an httpOnly cookie (`jsonwebtoken` + `bcrypt`) |
| Data fetching | SWR |
| Charts | Recharts |
| AI — chat | OpenRouter (`openai/gpt-4o-mini` by default), streamed |
| AI — embeddings | Voyage AI (`voyage-4-lite`, 1024 dimensions) |
| Hosting | Vercel |

---

## Setup instructions

**Prerequisites:** Node 20+, Yarn, and a PostgreSQL database with the `pgvector`
extension available (Neon, Supabase, and most managed Postgres providers support it).

**1. Install**

```bash
yarn install
```

**2. Configure environment**

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Signs session tokens — use a long random string |
| `LLM_API_KEY` | for AI chat | [OpenRouter](https://openrouter.ai) API key |
| `LLM_MODEL` | no | Overrides the default `openai/gpt-4o-mini` |
| `VOYAGE_API_KEY` | for AI chat | [Voyage AI](https://dashboard.voyageai.com) API key — powers embeddings for the knowledge base |

The app runs without `LLM_API_KEY` / `VOYAGE_API_KEY`; only the chat assistant and its
knowledge-base search are disabled.

**3. Create the database schema**

```bash
npx prisma generate
npx prisma db push
```

The schema is applied with `db push` — there is no migration history in this repo. If
your database doesn't have `pgvector` enabled yet, run once:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**4. Seed demo data + the AI knowledge base**

```bash
npx prisma db seed
```

This is idempotent (safe to run twice) and does two things:
- Creates 7 demo vehicles and ~60 bookings spread over 9 months, so the dashboard
  charts and the chat assistant's inventory answers have real data to work with.
- Generates Voyage embeddings for the company knowledge base (rental requirements,
  cancellation policy, payment methods, insurance, pickup locations, FAQs, service
  area) and stores them in Postgres for the chat assistant's retrieval step.

**5. Run**

```bash
yarn dev
```

Open http://localhost:3000.

**6. Create an admin account**

Registration always creates `role: "user"` — there is deliberately **no public way to
create an admin**. Register through `/register`, then promote the row:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Then visit `/admin`.

> On a fresh deployment where you can't reach the database directly, `POST
> /api/admin/seed` and `GET /api/admin/knowledge/seed` (the latter is a `GET` so it can
> be triggered straight from the browser address bar) run the same two seed steps over
> HTTP once you're signed in as an admin.

### Other commands

```bash
yarn build            # production build
yarn lint              # eslint
npx tsc --noEmit       # typecheck
yarn test:retrieval    # sanity-checks the knowledge-base search against known questions
```

> `yarn test:retrieval` needs the knowledge base already seeded, and Voyage's free tier
> is limited to 3 requests/minute — if you run it right after seeding, you may briefly
> see a `429` rate-limit error mid-run. That's expected on the free tier, not a bug; add
> a payment method on the Voyage dashboard to lift it.

---

## Architecture

```
Browser
  │
  ├─ Customer site (/)  ──┐
  ├─ Admin dashboard (/admin) ── src/proxy.ts (JWT check, role === "admin")
  └─ Chat widget (every page)   │
                                ▼
                          Next.js Route Handlers (src/app/api/**)
                                │
              ┌─────────────────┼──────────────────────┐
              ▼                 ▼                      ▼
        Auth (JWT + bcrypt)   Prisma Client        POST /api/chat
        src/lib/auth.ts       (User, Vehicle,            │
        src/lib/session.ts    Booking,                   ▼
                               KnowledgeChunk)     see "AI Implementation" below
                                    │
                                    ▼
                          PostgreSQL (+ pgvector)
```

- **`src/proxy.ts`** — Next 16 renamed `middleware.ts` to `proxy.ts`. Verifies the JWT
  cookie and requires `role === "admin"` for `/admin/*` and `/api/admin/*`. Page routes
  redirect to `/login`; API routes return `403` JSON. Signed-in users are also bounced
  away from `/login` and `/register`.
- **`prisma/schema.prisma`** — four models: `User`, `Vehicle`, `Booking` (the core
  rental domain) and `KnowledgeChunk` (the AI knowledge base — see below).
- **Every AI concern is its own module**, deliberately decoupled so each can be
  swapped independently (see `src/lib/`: `embeddings.ts`, `retrieval.ts`,
  `vehicle-lookup.ts`, `booking-action.ts`) rather than one monolithic chat file.

---

## Features

### 1. Customer front-end (`/`)

Developed from the wireframe into a polished, responsive site.

- Full-bleed hero with a real photograph, a left-to-right scrim so the copy stays
  legible, and a transparent header that becomes solid on scroll
- Pick-up / drop-off search (city, date, time, swap) that filters the vehicle grid
- Vehicle cards from the live database, with category tabs, favourites and a booking
  summary modal
- How it works · Why choose us · Promo cards · Testimonial carousel · Footer
- `/login`, `/register`, `/bookings` (a customer's own reservations)
- A floating AI chat assistant (see below) available on every page
- Responsive at mobile, tablet and desktop

### 2. Admin dashboard (`/admin`)

Rebuilt from the Figma dashboard design, driven entirely by API data.

- Greeting bar with the signed-in user's name and a working **date-range selector**
  that re-queries the summary cards
- Stat cards — weekly earning with real period-over-period change, total sales,
  purchased goods
- **Best Sellers** and **Recent Transactions** (status badges, payment reference,
  relative timestamps)
- **Sales Analytics** — area chart with a functional year filter
- **Sales by Countries** — world map with a data-driven tooltip
- Collapsible sidebar, ⌘K search focus, sticky footer
- Fully responsive, including a drawer sidebar on mobile

### 3. AI assistant

A floating chat widget on every page. Signed-out visitors can open it and are prompted
to log in; signed-in users get real, grounded answers — see **AI Implementation**
below for how it actually works.

---

## AI Implementation

The chat assistant (`POST /api/chat`) combines three independent, swappable pieces on
every message, then sends the result to a single LLM call:

### 1. Retrieval-Augmented Generation (RAG) over company policy

- **Knowledge base**: `KnowledgeChunk` table (`prisma/schema.prisma`) — free-text
  chunks covering rental requirements, cancellation policy, payment methods, insurance,
  pickup locations, service area (Britain-only), and FAQs (`src/lib/knowledge-data.ts`).
- **Embeddings**: `src/lib/embeddings.ts` calls the **Voyage AI** embeddings API
  (`voyage-4-lite`, `output_dimension: 1024`), batched for ingestion and single-call for
  live queries, with `input_type` set to `"document"` or `"query"` respectively.
- **Storage & search**: embeddings are stored as a native Postgres `vector(1024)`
  column with an `hnsw` cosine-distance index (`pgvector`). `src/lib/retrieval.ts`
  embeds the user's question and runs a similarity search (`embedding <=> query`) for
  the top 3 most relevant chunks — completely independent of the LLM call itself.

### 2. Live vehicle data (never hallucinated)

- `src/lib/vehicle-lookup.ts` detects vehicle-related questions (availability, price,
  seats, type) and queries the **live `Vehicle` table** directly — this is the
  authoritative source for those facts, explicitly labelled as such in the prompt so
  the model doesn't fall back on the static knowledge base for anything that can
  change (price, availability).

### 3. Automated booking — natural language to a real reservation

This is the part that turns the chat assistant into an actual workflow, not just Q&A:

1. The assistant detects booking intent ("book", "rent", "reserve", "hire") across the
   **whole conversation** — the client sends prior turns as `history` alongside each
   message, so this works across multiple messages with no server-side session state.
2. An LLM call (reusing the same completion function used for chat, not a separate
   integration) resolves, from the full transcript: which vehicle the customer means
   (handling partial names like "BMW" → "BMW X5", and a later correction overriding an
   earlier choice), plus pickup location, drop-off location, pickup date/time, and
   return date/time — never guessing a value that wasn't actually said, and never
   substituting a vehicle we don't stock (e.g. "Mercedes") for one we do.
3. **Pickup/drop-off must be within Britain.** If either location resolves to
   somewhere outside England, Scotland, or Wales, the assistant rejects it and asks the
   customer to choose a British location — the company doesn't operate anywhere else.
4. **Every required field is asked for — never skipped.** If any of the four trip
   details above is still missing, the assistant asks for exactly what's missing and
   stops. The booking API is only ever called once all four are present.
5. Once complete, it calls the **existing** `POST /api/bookings` endpoint — the same
   one `src/components/booking-modal.tsx` uses for a manual booking through the UI —
   with the same request shape. No parallel booking logic, no new API.
6. The assistant reports back **exactly** what that API returned: a real confirmation
   with a booking reference and price on success, or a plain "booking failed" message
   on failure (vehicle unavailable, etc.) — it can never claim success when the API
   didn't succeed, because that reply is built directly from the API response, not
   generated by the LLM.
7. "Cancel", "never mind", etc. back out of an in-progress booking attempt immediately.

---

## Automation Workflow

Two automated pipelines run behind this project, both designed to need zero manual
data entry:

### A. Chat-to-booking automation

Described in full above: a customer can go from a plain-English request ("book me a
BMW for next week, pick up and drop off at Manchester") to a **real row in the
`Booking` table**, created through the site's own existing booking API, entirely
through conversation — no form-filling. This is the core "AI feature + automation"
deliverable: natural language in, validated structured data out, real API call, real
result reported back.

### B. Knowledge-base ingestion pipeline

`src/lib/knowledge-seed.ts` is a repeatable, idempotent pipeline:

```
knowledge-data.ts (source text)
        │
        ▼
  embedBatch() — one batched Voyage API call for every chunk
        │
        ▼
  INSERT into KnowledgeChunk (Postgres, vector(1024) column)
```

It's exposed two ways so it can run in any environment:
- **Locally / in CI**: `npx prisma db seed` (wired via `prisma.config.ts`)
- **Against a deployed environment with no direct DB access**: `GET
  /api/admin/knowledge/seed` (and `POST /api/admin/seed` for the demo vehicles/bookings)
  — both admin-gated by `proxy.ts`, and safe to call repeatedly since they no-op once
  data already exists.

`scripts/test-retrieval.ts` (`yarn test:retrieval`) is a small automated check that the
whole pipeline actually works end-to-end — it asks known questions and asserts the
correct knowledge-base category comes back top-ranked.

---

## API

All admin routes are gated by `src/proxy.ts`, which verifies the JWT and requires
`role === "admin"`. Page routes redirect; API routes return `403 JSON`. Signed-in users
are also bounced away from `/login` and `/register`.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/register` | POST | Creates a `user` account, sets the session cookie |
| `/api/auth/login` | POST | Sets the session cookie |
| `/api/auth/logout` | POST | Clears it |
| `/api/auth/me` | GET | Current user |
| `/api/vehicles` | GET | Fleet, shaped for the front-end (derives categories from booking volume) |
| `/api/bookings` | GET · POST | The signed-in customer's bookings — also the endpoint the chat assistant calls |
| `/api/chat` | POST | Streaming AI assistant — RAG + live inventory + booking automation |
| `/api/admin/dashboard/summary` | GET | Accepts `?days=` |
| `/api/admin/dashboard/best-sellers` | GET | Top vehicles by booking count |
| `/api/admin/dashboard/recent-transactions` | GET | Latest 10 |
| `/api/admin/dashboard/sales-analytics` | GET | Accepts `?year=` |
| `/api/admin/dashboard/sales-by-country` | GET | Grouped totals |
| `/api/admin/seed` | POST | Idempotent demo-data seed |
| `/api/admin/knowledge/seed` | GET | Idempotent knowledge-base + embeddings seed |

---

## Project structure

```
src/
  app/
    page.tsx              landing page
    admin/                dashboard (own layout + Nunito font)
    login/ register/ bookings/
    api/                  route handlers (see table above)
  components/
    admin/                dashboard shell, sidebar, topbar, widgets
    *.tsx                 landing sections, auth forms, chat widget
  lib/
    auth.ts               JWT + bcrypt primitives
    session.ts             getSessionUser() — reads and verifies the cookie
    prisma.ts              Prisma singleton
    seed.ts                demo vehicle/booking generator
    knowledge-data.ts       AI knowledge-base source text
    knowledge-seed.ts       embeds + stores the knowledge base (idempotent)
    embeddings.ts           Voyage AI embeddings client
    retrieval.ts            pgvector similarity search — independent of the LLM
    vehicle-lookup.ts       live vehicle inventory for the chat assistant
    booking-action.ts       booking-intent detection + calls the real booking API
    dashboard.ts            SWR hooks, formatters, shared types
    images.ts               Unsplash CDN srcset helper
  proxy.ts                 auth middleware
prisma/schema.prisma       User · Vehicle · Booking · KnowledgeChunk
scripts/test-retrieval.ts  standalone check for the RAG search
docs/rag-architecture.md   original design proposal for the RAG layer
```

---

## Notes on a few decisions

**Images bypass `next/image` for remote photos.** Routing them through `/_next/image`
would make the server download and re-encode each one on every cold request — the
slowest thing on the page on a small Vercel deployment, and it burns the optimisation
quota. `src/lib/images.ts` builds a `srcset` against Unsplash's own CDN instead, so the
browser fetches directly and the server does no image work. Local assets still use
`next/image`.

**Contrast was measured, not eyeballed.** The hero copy sits over a photograph, so the
text/background contrast was sampled from rendered screenshots and tuned until it
cleared WCAG AAA rather than relying on judgement.

**Form controls are 16px on mobile.** iOS Safari auto-zooms any focused control under
16px and never zooms back out, so a scoped media query lifts them — this avoids the
common `maximum-scale=1` workaround, which would break pinch-zoom for low-vision users.

**Registration cannot self-assign a role.** `/api/auth/register` hardcodes
`role: "user"`; admin has to be granted directly in the database.

**Booking automation reuses the real API — it doesn't duplicate it.** The chat
assistant calls the exact same `POST /api/bookings` the manual booking modal uses, over
HTTP, rather than re-implementing booking-creation logic. One source of truth for what
"creating a booking" means, whether it happens through a form or through conversation.

**The LLM is used for extraction, not just chat.** Resolving "which vehicle do they
mean" and "what trip details have they given" is a natural-language problem (partial
names, corrections, typos) that string matching kept getting wrong in practice — so
both use a structured-JSON prompt against the same completion function already used
for chat, rather than fragile regex/keyword heuristics.
