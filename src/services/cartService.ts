import { firestore, CARTS_COLLECTION } from '../config/firestore';
import { Cart, CartItem } from '../types';

/**
 * Live shopping cart data stored in Firestore at carts/{userId}.
 */
export async function getCart(userId: string): Promise<Cart> {
  const doc = await firestore.collection(CARTS_COLLECTION).doc(userId).get();
  if (!doc.exists) {
    return { userId, items: [], updatedAt: new Date().toISOString() };
  }
  return doc.data() as Cart;
}

export async function addItem(userId: string, item: CartItem): Promise<Cart> {
  const ref = firestore.collection(CARTS_COLLECTION).doc(userId);
  const doc = await ref.get();
  const cart: Cart = doc.exists
    ? (doc.data() as Cart)
    : { userId, items: [], updatedAt: new Date().toISOString() };

  const existingIndex = cart.items.findIndex((i) => i.productId === item.productId);
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity;
  } else {
    cart.items.push(item);
  }
  cart.updatedAt = new Date().toISOString();

  await ref.set(cart);
  return cart;
}

export async function updateItem(userId: string, productId: string, quantity: number): Promise<Cart | null> {
  const ref = firestore.collection(CARTS_COLLECTION).doc(userId);
  const doc = await ref.get();
  if (!doc.exists) return null;

  const cart = doc.data() as Cart;
  const idx = cart.items.findIndex((i) => i.productId === productId);
  if (idx < 0) return null;

  cart.items[idx].quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  await ref.set(cart);
  return cart;
}

export async function removeItem(userId: string, productId: string): Promise<Cart | null> {
  const ref = firestore.collection(CARTS_COLLECTION).doc(userId);
  const doc = await ref.get();
  if (!doc.exists) return null;

  const cart = doc.data() as Cart;
  cart.items = cart.items.filter((i) => i.productId !== productId);
  cart.updatedAt = new Date().toISOString();
  await ref.set(cart);
  return cart;
}
