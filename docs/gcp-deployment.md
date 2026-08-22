# Google Cloud Deployment

## What is fully implemented in this repository

- **Cloud SQL**: The app connects via a standard `DATABASE_URL`. When
  deployed on Cloud Run/GKE, point it at a Cloud SQL instance via the
  Cloud SQL Auth Proxy or Unix socket connection string.
- **Firestore**: `src/config/firestore.ts` uses Application Default
  Credentials, which resolve automatically on Cloud Run/GKE.
- **Cloud Storage**: `src/services/storageService.ts` generates real v4
  signed URLs given a configured service account with
  `roles/storage.objectAdmin` (or equivalent) on the target bucket.
- **BigQuery**: `analytics/schema.sql` and `analytics/views.sql` create
  the dataset, tables, and views. `analyticsPublisher.ts` can insert
  directly into BigQuery when `ANALYTICS_PUBLISHER_MODE=pubsub`.

## What requires additional GCP infrastructure (not wired by this repo)

- **Production CDC pipeline**: This repo's local mode simply appends
  events to a JSONL file for development. It is NOT a production
  change-data-capture pipeline. A production setup would typically:
  1. Publish order/product events to a **Pub/Sub topic** from the API
     (or use a CDC tool like Datastream against Cloud SQL).
  2. Use a **Dataflow** job or **Cloud Function** subscriber to insert
     rows into BigQuery.
  3. Similarly, stream Firestore document changes into BigQuery via a
     Firestore-to-BigQuery Cloud Function trigger, or Firestore's native
     BigQuery export.
  This repository provides the `analyticsPublisher.publish()` interface
  and a direct-insert BigQuery path so the pipeline can be extended to
  Pub/Sub without changing calling code.
- **IAM / service accounts**: You must create a service account with the
  minimum required roles (Cloud SQL Client, Firestore User, Storage
  Object Admin, BigQuery Data Editor) and provide its credentials via
  Workload Identity (GKE) or the default Cloud Run runtime service
  account. No credentials are included in this repository.
- **Looker Studio dashboards**: Must be created manually by connecting to
  BigQuery (see `analytics/looker-studio.md`). No dashboard URL exists
  yet.

## Deploying to Cloud Run

```bash
export PROJECT_ID=your-project
export REGION=us-central1
export IMAGE=gcr.io/$PROJECT_ID/ecommerce-api
export DATABASE_URL="postgres://USER:PASSWORD@/DBNAME?host=/cloudsql/$PROJECT_ID:$REGION:INSTANCE"
export BUCKET=your-bucket-name

./infra/cloud-run/deploy.sh
```

## Deploying to GKE

```bash
cp infra/k8s/secret.yaml.example infra/k8s/secret.yaml
# edit secret.yaml with the real DATABASE_URL, then:
kubectl apply -f infra/k8s/secret.yaml
kubectl apply -f infra/k8s/deployment.yaml
kubectl apply -f infra/k8s/service.yaml
kubectl apply -f infra/k8s/hpa.yaml
```

Replace the `IMAGE`, `PROJECT_ID`, and `BUCKET` placeholders in
`infra/k8s/deployment.yaml` before applying.
