// ontlogin-pro-app/frontend/app.js
import { createAuthRequest, createSignData712 } from 'https://unpkg.com/@onflow/ont-login-sdk@0.3.0/dist/index.esm.js';
import { getProvider, requestAccount, toDID, signTypedDataV4 } from './wallet.js';
import { apiPostChallenge, apiPostSubmit, apiGetMe, apiPostLogout, apiPostLink, apiGetAuditRecent } from './api.js';
import { showToast } from './components/toast.js';
import { showModal, hideModal } from './components/modal.js';
import { showSpinner, hideSpinner } from './components/spinner.js';

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const linkWalletBtn = document.getElementById('linkWalletBtn');
const unlinkBtn = document.getElementById('unlinkBtn');
const antiPhishingInput = document.getElementById('antiPhishingInput');
const antiPhishingDisplay = document.getElementById('antiPhishingDisplay');
const previewToggle = document.getElementById('previewToggle');
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profileSection');
const primaryDid = document.getElementById('primaryDid');
const checksumAddr = document.getElementById('checksumAddr');
const issuedAt = document.getElementById('issuedAt');
const linkedDid = document.getElementById('linkedDid');

let currentDid = null;
let provider = null;

function loadAntiPhishingPhrase() {
  const phrase = localStorage.getItem('antiPhishingPhrase');
  if (phrase) {
    antiPhishingInput.value = phrase;
    antiPhishingDisplay.textContent = `Your phrase: "${phrase}"`;
  }
}

function saveAntiPhrasingPhrase() {
  const value = antiPhishingInput.value.trim();
  if (value) {
    localStorage.setItem('antiPhishingPhrase', value);
    antiPhishingDisplay.textContent = `Your phrase: "${value}"`;
  } else {
    localStorage.removeItem('antiPhishingPhrase');
    antiPhishingDisplay.textContent = '';
  }
}

async function handleLogin() {
  showSpinner();
  try {
    provider = getProvider();
    if (!provider) {
      showToast('No wallet provider found. Please install ONTO or MetaMask.', 'error');
      hideSpinner();
      return;
    }

    const account = await requestAccount(provider);
    if (!account) throw new Error('Account not found');

    currentDid = toDID(account);

    const authRequest = createAuthRequest();
    const challenge = await apiPostChallenge(authRequest);
    const signData = createSignData712(challenge, currentDid);

    const shouldPreview = previewToggle.checked;
    if (shouldPreview) {
      const phrase = localStorage.getItem('antiPhishingPhrase') || 'No phrase set';
      document.getElementById('phishingBanner').textContent = `Anti-phishing: ${phrase}`;
      document.getElementById('signDataPreview').textContent = JSON.stringify(signData, null, 2);
      showModal();
      await new Promise((resolve) => {
        document.getElementById('confirmSign').onclick = () => resolve(true);
        document.getElementById('cancelSign').onclick = () => resolve(false);
      });
      hideModal();

      if (!document.getElementById('confirmSign').onclick) {
        hideSpinner();
        return;
      }
    }

    const signature = await signTypedDataV4(provider, account, signData);
    const authResponse = {
      ver: '1.0',
      type: 'ontid-evm',
      nonce: challenge.nonce,
      did: currentDid,
      proof: {
        type: 'ecdsa',
        verificationMethod: `${currentDid}#key-1`,
        created: signData.message.created,
        value: signature,
      },
      VPs: [],
    };

    const submitRes = await apiPostSubmit(authResponse);
    const me = await apiGetMe();
    renderProfile(me);
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
  } finally {
    hideSpinner();
  }
}

function renderProfile(me) {
  currentDid = me.did;
  primaryDid.textContent = me.did;
  checksumAddr.textContent = me.address;
  issuedAt.textContent = new Date(me.issuedAt).toLocaleString();
  if (me.linked && me.linked.length > 0) {
    linkedDid.textContent = me.linked[0];
    unlinkBtn.style.display = 'inline-block';
  } else {
    linkedDid.textContent = 'None';
    unlinkBtn.style.display = 'none';
  }
  authSection.style.display = 'none';
  profileSection.style.display = 'block';
  linkWalletBtn.style.display = 'block';
}

async function handleLogout() {
  try {
    await apiPostLogout();
    currentDid = null;
    authSection.style.display = 'block';
    profileSection.style.display = 'none';
    linkWalletBtn.style.display = 'none';
    showToast('Logged out', 'success');
  } catch (err) {
    showToast('Logout failed', 'error');
  }
}

async function handleLinkWallet() {
  if (!provider) return;
  try {
    const account = await requestAccount(provider);
    if (!account) throw new Error('No account selected');
    const did = toDID(account);
    await apiPostLink({ address: account });
    const me = await apiGetMe();
    renderProfile(me);
    showToast('Wallet linked', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function init() {
  loadAntiPhishingPhrase();
  antiPhishingInput.addEventListener('blur', saveAntiPhrasingPhrase);
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  linkWalletBtn.addEventListener('click', handleLinkWallet);
  unlinkBtn.addEventListener('click', async () => {
    await apiPostLink({ address: '' });
    const me = await apiGetMe();
    renderProfile(me);
  });

  fetch('/api/session/me')
    .then((r) => r.json())
    .then((me) => {
      if (me.did) renderProfile(me);
    })
    .catch(() => {});
}

init();
