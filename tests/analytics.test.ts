import './mocks';
import fs from 'fs';
import path from 'path';
import { analyticsPublisher } from '../src/services/analyticsPublisher';

describe('Analytics publisher (local mode)', () => {
  const eventsFile = path.join(process.cwd(), 'data', 'analytics-events.jsonl');

  beforeEach(() => {
    if (fs.existsSync(eventsFile)) {
      fs.unlinkSync(eventsFile);
    }
  });

  it('appends order_created events to the local events file', async () => {
    await analyticsPublisher.publish({
      type: 'order_created',
      payload: { order_id: 'order-1', user_id: 'user-1', total_cents: 1000 },
    });

    expect(fs.existsSync(eventsFile)).toBe(true);
    const contents = fs.readFileSync(eventsFile, 'utf8').trim().split('\n');
    expect(contents).toHaveLength(1);

    const record = JSON.parse(contents[0]);
    expect(record.type).toBe('order_created');
    expect(record.payload.order_id).toBe('order-1');
  });

  it('appends multiple events in order', async () => {
    await analyticsPublisher.publish({ type: 'product_event', payload: { product_id: 'p1', event_type: 'created' } });
    await analyticsPublisher.publish({ type: 'product_event', payload: { product_id: 'p2', event_type: 'created' } });

    const contents = fs.readFileSync(eventsFile, 'utf8').trim().split('\n');
    expect(contents).toHaveLength(2);
  });
});
