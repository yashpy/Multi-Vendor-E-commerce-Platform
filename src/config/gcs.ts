import { Storage } from '@google-cloud/storage';
import { config } from './index';

/**
 * Google Cloud Storage client used to mint signed upload URLs.
 * Files are never streamed through backend memory - clients upload
 * directly to GCS using the signed URL.
 */
export const storage = new Storage({
  projectId: config.gcpProjectId || undefined,
});

export function getBucket() {
  if (!config.gcsBucket) {
    throw new Error('GCS_BUCKET is not configured');
  }
  return storage.bucket(config.gcsBucket);
}
