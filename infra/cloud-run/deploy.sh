#!/usr/bin/env bash
set -euo pipefail

# Deploys the API container to Cloud Run.
# Requires: gcloud CLI authenticated with a project that has Cloud Run,
# Artifact Registry / Container Registry, Cloud SQL, Firestore, GCS and
# BigQuery APIs enabled.

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID env var}"
REGION="${REGION:-us-central1}"
IMAGE="${IMAGE:?Set IMAGE env var, e.g. gcr.io/$PROJECT_ID/ecommerce-api}"
DATABASE_URL="${DATABASE_URL:?Set DATABASE_URL env var}"
BUCKET="${BUCKET:?Set BUCKET env var}"

gcloud builds submit --tag "$IMAGE" .

gcloud run deploy ecommerce-api \
  --image "$IMAGE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID,GCS_BUCKET=$BUCKET,DATABASE_URL=$DATABASE_URL,ANALYTICS_PUBLISHER_MODE=pubsub"

echo "Deployed to Cloud Run in region $REGION."
