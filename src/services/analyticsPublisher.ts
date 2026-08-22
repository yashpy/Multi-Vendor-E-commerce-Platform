import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { bigquery, BQ_DATASET } from '../config/bigquery';
import { AnalyticsEvent } from '../types';

/**
 * Analytics / CDC event publisher.
 *
 * Architecture:
 *   PostgreSQL -> Order/Event Publisher -> Analytics Event Pipeline -> BigQuery
 *
 * LOCAL MODE ("local", the default):
 *   Events are appended to a local JSONL file (./data/analytics-events.jsonl).
 *   This is a development stand-in ONLY. It is NOT production CDC and does
 *   NOT stream to BigQuery. It exists so the app is fully runnable with
 *   `docker compose up` and no GCP credentials.
 *
 * GCP MODE ("pubsub"):
 *   Events are intended to be published to a Google Cloud Pub/Sub topic,
 *   which a Dataflow job or Cloud Function subscriber then inserts into
 *   BigQuery. Wiring an actual Pub/Sub client is left as an infrastructure
 *   step (see docs/gcp-deployment.md) - this codebase provides the
 *   publish() interface and a direct BigQuery insert path for GCP mode.
 */
class AnalyticsPublisher {
  private localFile = path.join(process.cwd(), 'data', 'analytics-events.jsonl');

  async publish(event: AnalyticsEvent): Promise<void> {
    const record = { ...event, publishedAt: new Date().toISOString() };

    if (config.analyticsPublisherMode === 'local') {
      await this.publishLocal(record);
      return;
    }

    // GCP mode: insert directly into BigQuery. In a full production setup
    // this would instead publish to Pub/Sub and let a separate pipeline
    // (Dataflow / Cloud Function) perform the BigQuery insert.
    await this.publishToBigQuery(record);
  }

  private async publishLocal(record: unknown): Promise<void> {
    const dir = path.dirname(this.localFile);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.appendFile(this.localFile, JSON.stringify(record) + '\n');
  }

  private async publishToBigQuery(record: AnalyticsEvent & { publishedAt: string }): Promise<void> {
    const dataset = bigquery.dataset(BQ_DATASET);

    if (record.type === 'order_created') {
      await dataset.table('orders').insert([record.payload]);
    } else if (record.type === 'product_event') {
      await dataset.table('product_events').insert([record.payload]);
    }
    // order_status_changed events are reflected via Firestore -> BigQuery
    // ingestion (see docs/gcp-deployment.md) rather than a direct table.
  }
}

export const analyticsPublisher = new AnalyticsPublisher();
