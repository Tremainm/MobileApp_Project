// HTTP calls for auth endpoints.
// These are the only API calls that do NOT require an auth header
// they are the ones that produce the token in the first place.

import { BASE_URL } from '../config';
import authToken from './authToken';

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Server error ${res.status}`);
  }
  return data;
}

// POST /auth/register
// body: { email, password }
// Returns { token }
async function register(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

// POST /auth/login
// body: { email, password }
// Returns { token }
async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

// PUT /auth/push-token  (requires token already set in authToken module)
// body: { pushToken }
async function postPushToken(pushToken) {
  const res = await fetch(`${BASE_URL}/auth/push-token`, {
    method: 'PUT',
    headers: authToken.getAuthHeaders(),
    body: JSON.stringify({ pushToken }),
  });
  return handleResponse(res);
}

export default { register, login, postPushToken };