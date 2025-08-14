
export function getProvider() {
  
  return window.onto || window.ethereum;
}

export async function requestAccount(provider) {
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export function toDID(address) {
  return `did:etho:${address.toLowerCase().replace('0x', '')}`;
}

export async function signTypedDataV4(provider, account, signData) {
  const msg = JSON.stringify(signData);
  const method = 'eth_signTypedData_v4';
  const result = await provider.request({
    method,
    params: [account, msg],
  });
  return result;
}
