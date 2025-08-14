
const rateLimitMap = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export default (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - record.start > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
  } else {
    if (record.count >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    record.count++;
    rateLimitMap.set(ip, record);
  }

  next();
};
