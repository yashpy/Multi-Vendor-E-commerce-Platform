# Local Development

## Prerequisites
- Node.js 20+
- Docker & Docker Compose

## Setup

```bash
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

The API listens on `http://localhost:8080`. Health check: `GET /health`.

## Firestore locally

Carts and order tracking use Firestore. For local development without
real GCP credentials, run the Firestore emulator:

```bash
gcloud emulators firestore start --host-port=localhost:8081
export FIRESTORE_EMULATOR_HOST=localhost:8081
```

Without the emulator or GCP credentials configured, cart/tracking/storage
endpoints will fail - the transactional order/product/vendor endpoints do
not depend on Firestore or GCS and work with Docker Compose alone.

## Running tests

```bash
docker compose up -d postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecommerce npm test
```

Tests mock Firestore, BigQuery, and Cloud Storage (see `tests/mocks.ts`)
so `products.test.ts`, `orders.test.ts`, and `carts.test.ts` run without
GCP credentials. `orders.test.ts` and `products.test.ts` require a
reachable PostgreSQL instance.
