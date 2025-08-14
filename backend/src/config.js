
import dotenv from 'dotenv';
dotenv.config();

export default {
  PORT: process.env.PORT || 8787,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  CHAIN_ID: parseInt(process.env.CHAIN_ID),
  VERIFYING_CONTRACT: process.env.VERIFYING_CONTRACT,
  ADMIN_AUDIT_KEY: process.env.ADMIN_AUDIT_KEY,
  NONCE_TTL_MS: parseInt(process.env.NONCE_TTL_MS),
};
