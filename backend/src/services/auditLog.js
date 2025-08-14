
import { createHash } from 'crypto';

const log = [];
const MAX = 1000;

export const append = ({ nonce, addr }) => {
  const entry = {
    ts: new Date().toISOString(),
    nonceHash: createHash('sha256').update(nonce).digest('hex'),
    addrHash: createHash('sha256').update(addr.toLowerCase()).digest('hex'),
  };
  log.unshift(entry);
  if (log.length > MAX) log.pop();
};

export const recent = (n) => log.slice(0, n);
