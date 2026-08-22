import { Firestore } from '@google-cloud/firestore';
import { config } from './index';

/**
 * Firestore client.
 * In local development, set FIRESTORE_EMULATOR_HOST (see .env.example) and
 * run the Firestore emulator via `gcloud emulators firestore start`.
 * In production on GCP, credentials are resolved automatically via
 * Application Default Credentials.
 */
export const firestore = new Firestore({
  projectId: config.gcpProjectId || undefined,
});

export const CARTS_COLLECTION = 'carts';
export const ORDER_TRACKING_COLLECTION = 'order_tracking';
