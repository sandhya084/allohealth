# Inventory Reservation System

Production-quality sample inventory reservation platform built with Next.js App Router, TypeScript, Prisma, PostgreSQL, TailwindCSS, and shadcn/ui.

Overview
- Multi-warehouse inventory with temporary reservations to avoid overselling.
- Concurrency-safe reservation flow using PostgreSQL row-level locks (SELECT ... FOR UPDATE) inside transactions.
- Reservations expire after 10 minutes; a cron endpoint releases expired reservations.

Local setup
1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies: `npm install`.
3. Generate Prisma client: `npm run prisma:generate`.
4. Migrate: `npm run prisma:migrate`.
5. Seed: `npm run seed`.
6. Run dev server: `npm run dev`.

Docker local database
1. Start Docker Desktop on Windows.
2. Run `docker compose up -d`.
3. Confirm Postgres is running at `localhost:5432`.
4. Run the Prisma migrate and seed steps again.

Concurrency test
1. Start the dev server: `npm run dev`.
2. In another terminal run (adjust base URL if needed):
```bash
TEST_BASE_URL=http://localhost:3000 npm run test:concurrency
```
This script will send two concurrent reservation requests to the same inventory. Expected result: one request returns `201` and the other returns `409`.

Architecture & concurrency
- Business logic lives in `services/reservationService.ts`.
- Reservation is created inside a database transaction. The inventory row is locked with `FOR UPDATE` before checking and incrementing `reservedUnits`. This guarantees exactly-one success under concurrent requests.

API
- `GET /api/products` — list products and inventory per warehouse.
- `GET /api/warehouses` — list warehouses.
- `POST /api/reservations` — create reservation. Expects `productId`, `warehouseId`, `quantity`. Returns `reservationId` and `expiresAt` or redirects when submitted from a form. Returns 409 on insufficient stock.
- `POST /api/reservations/:id/confirm` — confirm reservation (returns 410 if expired).
- `POST /api/reservations/:id/release` — release reservation early.
- `POST /api/cron/release-expired` — cron endpoint to release expired reservations.

Notes & future work
- Add idempotency (via Redis) for safer retries.
- Add background worker or Vercel cron schedule.
- Improve UI with shadcn components and React Query caching.
