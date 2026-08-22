import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ecommerce',
  gcpProjectId: process.env.GCP_PROJECT_ID || '',
  gcsBucket: process.env.GCS_BUCKET || '',
  bqDataset: process.env.BQ_DATASET || 'ecommerce_analytics',
  analyticsPublisherMode: process.env.ANALYTICS_PUBLISHER_MODE || 'local',
};
