// HTTP calls to the pantry backend REST API.
// Pantry items: { name, category, quantity, unit, location, expiryDate }
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

async function getSuggestions(items) {
  const res = await fetch(`${BASE_URL}/suggestions`, {
    method: 'POST',
    headers: authToken.getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  return handleResponse(res);
}

// GET /pantry - returns array of all pantry items
async function getAllPantryItems() {
  const res = await fetch(`${BASE_URL}/pantry`, { headers: authToken.getAuthHeaders() });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

// POST /pantry - creates a new pantry item
// body: { name, category, quantity, unit, location, expiryDate }
async function createPantryItem(body) {
  const res = await fetch(`${BASE_URL}/pantry`, {
    method: 'POST',
    headers: authToken.getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// PUT /pantry/:id - updates a pantry item
// body: { name, category, quantity, unit, location, expiryDate }
async function updatePantryItem(id, body) {
  const res = await fetch(`${BASE_URL}/pantry/${id}`, {
    method: 'PUT',
    headers: authToken.getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// DELETE /pantry/:id - deletes a pantry item
async function deletePantryItem(id) {
  const res = await fetch(`${BASE_URL}/pantry/${id}`, {
    method: 'DELETE',
    headers: authToken.getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  return true;
}

export default { getAllPantryItems, createPantryItem, updatePantryItem, deletePantryItem, getSuggestions };