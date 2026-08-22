import { getBucket } from '../config/gcs';

export type UploadKind = 'product-image' | 'verification-document' | 'invoice';

const PREFIX: Record<UploadKind, string> = {
  'product-image': 'product-images',
  'verification-document': 'verification-documents',
  invoice: 'invoices',
};

/**
 * Generates a v4 signed URL for direct-to-GCS uploads. The backend never
 * receives the file bytes; the client PUTs directly to the returned URL.
 */
export async function createSignedUploadUrl(kind: UploadKind, fileName: string, contentType: string) {
  const bucket = getBucket();
  const objectName = `${PREFIX[kind]}/${Date.now()}-${fileName}`;
  const file = bucket.file(objectName);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return {
    uploadUrl: url,
    objectName,
    bucket: bucket.name,
    expiresInSeconds: 15 * 60,
  };
}
