
import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.js';
import { auth } from '../services/session.js';
import { create } from '../services/nonceStore.js';
import { verify } from '../services/signVerify.js';
import { issue, clear } from '../services/session.js';
import { append, recent } from '../services/auditLog.js';
import config from '../config.js';
import { didFromAddr } from '../utils/did.js';

const router = Router();

router.post('/auth/challenge', asyncHandler(async (req, res) => {
  const domain = {
    name: 'ONT Login',
    version: '1',
    chainId: config.CHAIN_ID,
    verifyingContract: config.VERIFYING_CONTRACT,
  };

  const types = {
    Auth: [
      { name: 'nonce', type: 'string' },
      { name: 'created', type: 'string' },
    ],
  };

  const message = {
    nonce: '',
    created: new Date().toISOString(),
  };

  const { nonce } = create(domain, types, message);
  message.nonce = nonce;

  res.json({ nonce, domain, types, message });
}));

router.post('/auth/submit', asyncHandler(async (req, res) => {
  const { nonce, did, proof } = req.body;
  if (!nonce || !did || !proof) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const record = get(nonce);
  if (!record) return res.status(400).json({ error: 'Invalid nonce' });

  const signData = {
    domain: record.domain,
    types: record.types,
    message: record.message,
  };

  await verify({ nonce, did, proof, signData });

  consume(nonce);
  const address = addrFromDid(did);
  const payload = { did, address, issuedAt: new Date().toISOString(), secondaryDids: [] };
  issue(res, payload);
  append({ nonce, addr: address });

  res.json({ ok: true, session: payload });
}));

router.get('/session/me', auth, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

router.post('/session/logout', auth, asyncHandler(async (req, res) => {
  clear(res);
  res.json({ ok: true });
}));

router.post('/session/link', auth, asyncHandler(async (req, res) => {
  const { address } = req.body;
  if (!address) {
    req.user.secondaryDids = [];
    return res.json({ ok: true });
  }

  const provider = req.headers['x-provider'];
  const signer = provider ? await recoverSigner(address, 'link_challenge') : address;
  if (signer.toLowerCase() !== address.toLowerCase()) {
    return res.status(400).json({ error: 'Ownership proof failed' });
  }

  const did = didFromAddr(address);
  if (!req.user.secondaryDids) req.user.secondaryDids = [];
  if (!req.user.secondaryDids.includes(did)) {
    req.user.secondaryDids.push(did);
  }

  res.json({ ok: true });
}));

router.get('/audit/recent', asyncHandler(async (req, res) => {
  const { key } = req.query;
  if (key !== config.ADMIN_AUDIT_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(recent(50));
}));

export default router;
