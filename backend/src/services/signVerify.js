
import { verifyTypedData } from 'ethers';
import { addrFromDid } from '../utils/did.js';
import config from '../config.js';

export const verify = async ({ nonce, did, proof, signData }) => {
  const record = get(nonce);
  if (!record) throw new Error('Invalid or expired nonce');

  if (proof.created !== signData.message.created) throw new Error('Timestamp mismatch');
  if (signData.message.nonce !== nonce) throw new Error('Nonce mismatch');
  if (signData.domain.name !== 'ONT Login') throw new Error('Invalid domain name');
  if (signData.domain.version !== '1') throw new Error('Invalid version');

  const recovered = verifyTypedData(
    signData.domain,
    signData.types,
    signData.message,
    proof.value
  );

  const expected = addrFromDid(did);
  if (recovered.toLowerCase() !== expected.toLowerCase()) {
    throw new Error('Signature verification failed');
  }

  return { recovered, expected };
};
