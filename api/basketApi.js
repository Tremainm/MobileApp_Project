// HTTP calls to the basket backend REST API.
// Basket items are standalone entries: { name, category, quantity, unit }
// All functions throw on non-OK responses.
// All requests include a Bearer token via authToken.getAuthHeaders().

import { BASE_URL } from '../config';
import authToken from './authToken';

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  return res.json().catch(() => null);
}

// GET /basket - returns array of all basket items
async function getAllBasketItems() {
  const res = await fetch(`${BASE_URL}/basket`, { headers: authToken.getAuthHeaders() });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

// POST /basket - creates a new basket item
// body: { name, category, quantity, unit }
async function createBasketItem(body) {
  const res = await fetch(`${BASE_URL}/basket`, {
    method: 'POST',
    headers: authToken.getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// PUT /basket/:id - updates a basket item
// body: { quantity }
async function updateBasketItem(id, body) {
  const res = await fetch(`${BASE_URL}/basket/${id}`, {
    method: 'PUT',
    headers: authToken.getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// DELETE /basket/:id - deletes a basket item
async function deleteBasketItem(id) {
  const res = await fetch(`${BASE_URL}/basket/${id}`, {
    method: 'DELETE',
    headers: authToken.getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  return true;
}

export default { getAllBasketItems, createBasketItem, updateBasketItem, deleteBasketItem };