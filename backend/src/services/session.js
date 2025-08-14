
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const issue = (res, payload) => {
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(config.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clear = (res) => {
  res.clearCookie(config.SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

export const auth = (req, res, next) => {
  const token = req.cookies[config.SESSION_COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
