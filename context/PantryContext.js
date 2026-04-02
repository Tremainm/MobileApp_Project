// PantryContext.js
// - Purpose: SQLite-backed global store for pantry items.
// - Pattern mirrors TransactionContext from the FinTracker project:
//     CRUD ops write to the DB then mirror the change into local state so screens
//     re-render immediately - no second SELECT needed after every mutation.
//     getItems / getItemsByCategory stay synchronous (they read from state),
//     so no screen changes are required to consume them.
//
// SQL concepts covered:
//   SELECT * FROM pantry_items                         - load on mount
//   INSERT INTO pantry_items (...) VALUES (?, ...)     - addPantryItem
//   UPDATE pantry_items SET ... WHERE id = ?           - updatePantryItem
//   DELETE FROM pantry_items WHERE id = ?              - deletePantryItem

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

const PantryContext = createContext(null);

export function PantryProvider({ children }) {
  const db = useSQLiteContext();
  const [items, setItems] = useState([]);

  // SELECT * FROM pantry_items  (runs once on mount)
  useEffect(() => {
    db.getAllAsync('SELECT * FROM pantry_items').then(rows => {
      setItems(rows);
    });
  }, [db]);

  // SELECT * FROM pantry_items ORDER BY name
  // Returns all items sorted alphabetically. Synchronous - reads from state.
  const getItems = useCallback(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // SELECT * FROM pantry_items WHERE category = ? ORDER BY name
  // Returns items filtered by category. Pass 'All' to get everything.
  const getItemsByCategory = useCallback((category) => {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (category === 'All') return sorted;
    return sorted.filter(item => item.category === category);
  }, [items]);

  // SELECT DISTINCT category FROM pantry_items ORDER BY category
  // Returns sorted unique category strings, prepended with 'All'.
  const getCategories = useCallback(() => {
    const unique = [...new Set(items.map(i => i.category))].sort();
    return ['All', ...unique];
  }, [items]);

  // INSERT INTO pantry_items (id, name, category, quantity, unit, location, expiryDate)
  // VALUES (?, ?, ?, ?, ?, ?, ?)
  const addPantryItem = useCallback(({ name, category, quantity, unit, location, expiryDate }) => {
    const id = Date.now().toString();
    const newItem = { id, name, category, quantity, unit, location, expiryDate: expiryDate ?? null };
    // Mirror into state immediately so UI updates without waiting for DB
    setItems(prev => [...prev, newItem]);
    db.runAsync(
      'INSERT INTO pantry_items (id, name, category, quantity, unit, location, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, quantity, unit, location, expiryDate ?? null]
    );
    return newItem;
  }, [db]);

  // UPDATE pantry_items SET name=?, category=?, quantity=?, unit=?,
  // location=?, expiryDate=? WHERE id = ?
  const updatePantryItem = useCallback((id, { name, category, quantity, unit, location, expiryDate }) => {
    // Mirror into state immediately
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, name, category, quantity, unit, location, expiryDate: expiryDate ?? null }
          : item
      )
    );
    db.runAsync(
      'UPDATE pantry_items SET name=?, category=?, quantity=?, unit=?, location=?, expiryDate=? WHERE id=?',
      [name, category, quantity, unit, location, expiryDate ?? null, id]
    );
  }, [db]);

  // DELETE FROM pantry_items WHERE id = ?
  const deletePantryItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    db.runAsync('DELETE FROM pantry_items WHERE id = ?', [id]);
  }, [db]);

  return (
    <PantryContext.Provider
      value={{ getItems, getItemsByCategory, getCategories, addPantryItem, updatePantryItem, deletePantryItem }}
    >
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error('usePantry must be used inside PantryProvider');
  return ctx;
}