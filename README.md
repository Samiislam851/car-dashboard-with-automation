# Best Car — Car Rental Platform + Admin Dashboard

Technical assessment for **Digital Pylot** (Web Designer / Web Developer + AI Automation).

A full-stack car rental application built from the provided Figma file. It covers both
parts of the brief — a **customer-facing website** developed from the wireframe, and a
**functional admin dashboard** built pixel-accurately from the dashboard design — plus an
**AI assistant** backed by a real LLM, and a REST API layer over PostgreSQL.

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
| Database | PostgreSQL via Prisma 6 |
| Auth | JWT in an httpOnly cookie (`jsonwebtoken` + `bcrypt`) |
| Data fetching | SWR |
| Charts | Recharts |
| AI | OpenRouter (`openai/gpt-4o-mini` by default), streamed |
| Hosting | Vercel |

---

## Getting started

**Prerequisites:** Node 20+, Yarn, and a PostgreSQL database.

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

The app runs without `LLM_API_KEY`; only the chat assistant is disabled.

**3. Create the database schema**

```bash
npx prisma generate
npx prisma db push
```

The schema is applied with `db push` — there is no migration history in this repo.

**4. Seed demo data**

7 vehicles and 60 bookings spread over 9 months, so the dashboard charts have something
to show. Idempotent — safe to run twice.

```bash
npx prisma db seed
```

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

> On a fresh deployment where you can't reach the database directly, `POST /api/admin/seed`
> runs the same seed over HTTP once you're signed in as an admin.

### Other commands

```bash
yarn build   # production build
yarn lint    # eslint
npx tsc --noEmit   # typecheck
```

---

## What's implemented

### 1. Customer front-end (`/`)

Developed from the wireframe into a polished, responsive site.

- Full-bleed hero with a real photograph, a left-to-right scrim so the copy stays
  legible, and a transparent header that becomes solid on scroll
- Pick-up / drop-off search (city, date, time, swap) that filters the vehicle grid
- Vehicle cards from the live database, with category tabs, favourites and a booking
  summary modal
- How it works · Why choose us · Promo cards · Testimonial carousel · Footer
- `/login`, `/register`, `/bookings` (a customer's own reservations)
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
to log in; signed-in users get live answers.

- `POST /api/chat` authenticates via the JWT cookie, then calls OpenRouter with
  `stream: true`
- The route parses the provider's SSE deltas and re-emits **plain text**, so the client
  reads one flat stream and renders the reply token by token
- Falls back to a friendly message if the provider is unreachable or unconfigured

---

## API

All admin routes are gated by `src/proxy.ts` (Next 16 renamed `middleware.ts` to
`proxy.ts`), which verifies the JWT and requires `role === "admin"`. Page routes
redirect; API routes return `403 JSON`. Signed-in users are also bounced away from
`/login` and `/register`.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/register` | POST | Creates a `user` account, sets the session cookie |
| `/api/auth/login` | POST | Sets the session cookie |
| `/api/auth/logout` | POST | Clears it |
| `/api/auth/me` | GET | Current user |
| `/api/vehicles` | GET | Fleet, shaped for the front-end (derives categories from booking volume) |
| `/api/bookings` | GET · POST | The signed-in customer's bookings |
| `/api/chat` | POST | Streaming AI assistant |
| `/api/admin/dashboard/summary` | GET | Accepts `?days=` |
| `/api/admin/dashboard/best-sellers` | GET | Top vehicles by booking count |
| `/api/admin/dashboard/recent-transactions` | GET | Latest 10 |
| `/api/admin/dashboard/sales-analytics` | GET | Accepts `?year=` |
| `/api/admin/dashboard/sales-by-country` | GET | Grouped totals |
| `/api/admin/seed` | POST | Idempotent demo-data seed |

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
    session.ts            getSessionUser() — reads and verifies the cookie
    prisma.ts             Prisma singleton
    seed.ts               demo data generator
    dashboard.ts          SWR hooks, formatters, shared types
    images.ts             Unsplash CDN srcset helper
  proxy.ts                auth middleware
prisma/schema.prisma      User · Vehicle · Booking
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
