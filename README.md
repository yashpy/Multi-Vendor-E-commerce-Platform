# Multi-Vendor E-Commerce & Operations Platform

A cloud-native, multi-vendor e-commerce backend built with TypeScript,
Node.js, and Express, using PostgreSQL (Cloud SQL) for transactional data,
Firestore for live carts/order tracking, Cloud Storage for file uploads,
and BigQuery + Looker Studio for analytics.

## Architecture

```mermaid
flowchart TD
    Client[Customers / Clients] --> API[Backend Microservices / REST API<br/>Cloud Run or GKE]
    API --> SQL[(Cloud SQL - PostgreSQL)]
    API --> Firestore[(Firestore<br/>carts / order tracking)]
    API --> GCS[(Cloud Storage<br/>product images, docs, invoices)]
    SQL --> Publisher[Order/Event Publisher]
    Firestore --> Publisher
    Publisher --> Pipeline[Analytics Event Pipeline]
    Pipeline --> BQ[(BigQuery<br/>ecommerce_analytics)]
    BQ --> Looker[Looker Studio Dashboards]
```

See `docs/architecture.md` for a component breakdown.

## Technology stack

- TypeScript, Node.js, Express.js
- PostgreSQL / Google Cloud SQL
- Firestore
- Google Cloud Storage (signed URLs)
- BigQuery + Looker Studio
- Docker / Docker Compose
- Google Cloud Run & Google Kubernetes Engine (GKE)

## Setup

```bash
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

API runs at `http://localhost:8080`. See `docs/local-development.md` for
Firestore emulator setup and test instructions.

## Environment variables

See `.env.example` for all variables: `PORT`, `DATABASE_URL`,
`GCP_PROJECT_ID`, `GCS_BUCKET`, `FIRESTORE_EMULATOR_HOST`, `BQ_DATASET`,
`ANALYTICS_PUBLISHER_MODE` (`local` | `pubsub`).

## Database setup

Migrations live in `db/migrations/` (applied in filename order by
`npm run db:migrate`). Seed data is in `db/seed.sql`. Schema details are
documented in `docs/data-model.md`.

## API examples

See `docs/api.md` for the full reference. Example:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","items":[{"product_id":"d1111111-1111-1111-1111-111111111111","quantity":1}]}'
```

## Google Cloud setup

1. Enable Cloud Run/GKE, Cloud SQL, Firestore, Cloud Storage, and BigQuery
   APIs on your project.
2. Create a Cloud SQL PostgreSQL instance and run the migrations against
   it.
3. Create a Firestore database (native mode).
4. Create a GCS bucket for uploads.
5. See `docs/gcp-deployment.md` for full deployment steps and IAM notes.

## BigQuery setup

```bash
bq query --use_legacy_sql=false < analytics/schema.sql
bq query --use_legacy_sql=false < analytics/views.sql
```

See `analytics/sample_queries.sql` for example analytical queries.

## Looker Studio setup

See `analytics/looker-studio.md` for step-by-step instructions on
connecting Looker Studio to the BigQuery views. No dashboard URL is
included - it must be created manually.

## Testing

```bash
docker compose up -d postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecommerce npm test
```

Tests cover products, orders (including insufficient-inventory and
transaction rollback behavior), carts, and the local analytics publisher.
Google Cloud services (Firestore, BigQuery, GCS) are mocked in tests so
they run without credentials (see `tests/mocks.ts`).

## Deployment

- **Cloud Run**: `infra/cloud-run/deploy.sh` + `service.yaml`
- **GKE**: `infra/k8s/deployment.yaml`, `service.yaml`, `hpa.yaml`,
  `secret.yaml.example`

Full instructions: `docs/gcp-deployment.md`.

## Limitations

- The local analytics publisher (`ANALYTICS_PUBLISHER_MODE=local`) writes
  to a local JSONL file for development convenience. It is **not**
  production change-data-capture. Production CDC requires wiring Pub/Sub
  + Dataflow/Cloud Functions as described in `docs/gcp-deployment.md`.
- No Looker Studio dashboard URL is included; dashboards must be created
  manually against the provided BigQuery views.
- Orders can span multiple vendors; per-vendor reporting is derived via
  `order_items.vendor_id` rather than a denormalized column on `orders`.
- This repository does not implement authentication/authorization,
  payment processing, or shipping-carrier integrations - it focuses on
  the architecture described in the project brief.
