
import { getAddress } from 'ethers';

export const addrFromDid = (did) => {
  const addr = `0x${did.split(':')[2]}`;
  return getAddress(addr);
};

export const didFromAddr = (address) => {
  return `did:etho:${address.toLowerCase().replace('0x', '')}`;
};
