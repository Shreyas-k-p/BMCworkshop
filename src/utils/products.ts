import { Product } from '../types';

export const FAILED_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'FIRE PHONE', company: 'AMAZON', type: 'failed' },
  { name: 'GLASS', company: 'GOOGLE', type: 'failed' },
  { name: 'JUICERO PRESS', company: 'JUICERO', type: 'failed' },
  { name: 'QUIBI', company: 'QUIBI', type: 'failed' },
  { name: 'WINDOWS PHONE', company: 'MICROSOFT', type: 'failed' },
  { name: '3D TV', company: 'LG / SAMSUNG', type: 'failed' },
  { name: 'SEGWAY PT', company: 'SEGWAY', type: 'failed' },
];

export const SUCCESSFUL_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'AIRBNB', company: 'AIRBNB INC.', type: 'successful' },
  { name: 'SPOTIFY', company: 'SPOTIFY', type: 'successful' },
  { name: 'NETFLIX', company: 'NETFLIX', type: 'successful' },
  { name: 'UBER', company: 'UBER TECHNOLOGIES', type: 'successful' },
  { name: 'AMAZON PRIME', company: 'AMAZON', type: 'successful' },
  { name: 'CANVA', company: 'CANVA', type: 'successful' },
  { name: 'IPHONE', company: 'APPLE', type: 'successful' },
];

export const ALL_PRODUCTS = [...FAILED_PRODUCTS, ...SUCCESSFUL_PRODUCTS];

export function getRandomProducts(count: number): Product[] {
  // Shuffle all products
  const shuffled = [...ALL_PRODUCTS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((p, idx) => ({
    ...p,
    id: `prod_${idx + 1}_${Date.now()}`
  }));
}
