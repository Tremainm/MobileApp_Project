// pantryApi.js
// HTTP calls to the pantry backend REST API.
// Pantry items: { name, category, quantity, unit, location, expiryDate }
// All functions throw on non-OK responses.

import { BASE_URL } from '../config';

const HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  return res.json().catch(() => null);
}

// GET /pantry - returns array of all pantry items
async function getAllPantryItems() {
  const res = await fetch(`${BASE_URL}/pantry`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

// POST /pantry - creates a new pantry item
// body: { name, category, quantity, unit, location, expiryDate }
async function createPantryItem(body) {
  const res = await fetch(`${BASE_URL}/pantry`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// PUT /pantry/:id - updates a pantry item
// body: { name, category, quantity, unit, location, expiryDate }
async function updatePantryItem(id, body) {
  const res = await fetch(`${BASE_URL}/pantry/${id}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// DELETE /pantry/:id - deletes a pantry item
async function deletePantryItem(id) {
  const res = await fetch(`${BASE_URL}/pantry/${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server: ${res.status} ${text}`);
  }
  return true;
}

export default { getAllPantryItems, createPantryItem, updatePantryItem, deletePantryItem };
