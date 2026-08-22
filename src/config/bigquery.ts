import { BigQuery } from '@google-cloud/bigquery';
import { config } from './index';

/**
 * BigQuery client for the analytics warehouse.
 * Requires a GCP project with the `ecommerce_analytics` dataset created
 * (see analytics/schema.sql). Not used in local-only test runs.
 */
export const bigquery = new BigQuery({
  projectId: config.gcpProjectId || undefined,
});

export const BQ_DATASET = config.bqDataset;
