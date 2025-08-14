
import { nanoid } from 'nanoid';
import { hasExpired } from '../utils/time.js';

const store = new Map();
const TTL = 300000;

setInterval(() => {
  for (const [key, value] of store) {
    if (hasExpired(value.createdAt, TTL)) {
      store.delete(key);
    }
  }
}, 60000);

export const create = (domain, types, message) => {
  const nonce = nanoid();
  const createdAt = new Date().toISOString();
  store.set(nonce, { domain, types, message, createdAt });
  return { nonce, domain, types, message, createdAt };
};

export const get = (nonce) => {
  return store.get(nonce);
};

export const consume = (nonce) => {
  const data = store.get(nonce);
  store.delete(nonce);
  return data;
};
