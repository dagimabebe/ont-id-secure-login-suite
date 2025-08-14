
export async function apiPostChallenge(authRequest) {
  const res = await fetch('/api/auth/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authRequest),
  });
  return await res.json();
}

export async function apiPostSubmit(authResponse) {
  const res = await fetch('/api/auth/submit', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authResponse),
  });
  return await res.json();
}

export async function apiGetMe() {
  const res = await fetch('/api/session/me', { credentials: 'include' });
  return await res.json();
}

export async function apiPostLogout() {
  const res = await fetch('/api/session/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return await res.json();
}

export async function apiPostLink(data) {
  const res = await fetch('/api/session/link', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function apiGetAuditRecent(adminKey) {
  const res = await fetch(`/api/audit/recent?key=${adminKey}`);
  return await res.json();
}
