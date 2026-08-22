import { firestore, ORDER_TRACKING_COLLECTION } from '../config/firestore';
import { TrackingEvent, OrderStatus } from '../types';

export async function getTracking(orderId: string): Promise<TrackingEvent | null> {
  const doc = await firestore.collection(ORDER_TRACKING_COLLECTION).doc(orderId).get();
  return doc.exists ? (doc.data() as TrackingEvent) : null;
}

export async function setTracking(
  orderId: string,
  status: OrderStatus,
  location: string
): Promise<TrackingEvent> {
  const event: TrackingEvent = {
    orderId,
    status,
    location,
    timestamp: new Date().toISOString(),
  };
  await firestore.collection(ORDER_TRACKING_COLLECTION).doc(orderId).set(event);
  return event;
}
