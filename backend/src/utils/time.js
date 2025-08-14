
export const nowISO = () => new Date().toISOString();

export const hasExpired = (createdAt, ttlMs) => {
  const expiry = new Date(createdAt).getTime() + ttlMs;
  return Date.now() > expiry;
};
