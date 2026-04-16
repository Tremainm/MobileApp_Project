// BasketContext.js
// Global basket state backed by SQLite, with background MongoDB sync.
// Mirrors the PantryContext pattern - every mutation writes to SQLite and
// updates state immediately so all screens re-render without a second SELECT.
// MongoDB sync runs in the background after each local operation.
//
// SQL concepts:
//   SELECT * FROM basket_items                        - load on mount
//   INSERT INTO basket_items (...) VALUES (?, ...)   - addBasketItem
//   UPDATE basket_items SET quantity = ? WHERE id = ? - updateBasketItem
//   DELETE FROM basket_items WHERE id = ?            - deleteBasketItem

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import basketApi from '../api/basketApi';

const BasketContext = createContext(null);

export function BasketProvider({ children }) {
  const db = useSQLiteContext();
  const [basketItems, setBasketItems] = useState([]);

  // Load all basket items from SQLite on mount
  useEffect(() => {
    db.getAllAsync('SELECT * FROM basket_items').then(rows => {
      setBasketItems(rows);
    });
  }, [db]);

  // Returns all basket items sorted by name. Synchronous — reads from state.
  const getBasketItems = useCallback(() => {
    return [...basketItems].sort((a, b) => a.name.localeCompare(b.name));
  }, [basketItems]);

  // INSERT INTO basket_items (id, name, category, quantity, unit) VALUES (?, ?, ?, ?, ?)
  const addBasketItem = useCallback(({ name, category, quantity, unit }) => {
    const id = Date.now().toString();
    const newItem = { id, name, category, quantity, unit };

    // Update local state immediately so UI re-renders without waiting for DB
    setBasketItems(prev => [...prev, newItem]);

    // Write to SQLite
    db.runAsync(
      'INSERT INTO basket_items (id, name, category, quantity, unit) VALUES (?, ?, ?, ?, ?)',
      [id, name, category, quantity, unit]
    );

    // Sync to MongoDB in background — non-blocking so UI is never delayed
    basketApi.createBasketItem({ name, category, quantity, unit }).catch(err =>
      console.warn('[BasketContext] MongoDB sync failed on add:', err.message)
    );

    return newItem;
  }, [db]);

  // UPDATE basket_items SET quantity = ? WHERE id = ?
  const updateBasketItem = useCallback((id, { quantity }) => {
    setBasketItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );

    db.runAsync('UPDATE basket_items SET quantity = ? WHERE id = ?', [quantity, id]);

    basketApi.updateBasketItem(id, { quantity }).catch(err =>
      console.warn('[BasketContext] MongoDB sync failed on update:', err.message)
    );
  }, [db]);

  // DELETE FROM basket_items WHERE id = ?
  const deleteBasketItem = useCallback((id) => {
    setBasketItems(prev => prev.filter(item => item.id !== id));

    db.runAsync('DELETE FROM basket_items WHERE id = ?', [id]);

    basketApi.deleteBasketItem(id).catch(err =>
      console.warn('[BasketContext] MongoDB sync failed on delete:', err.message)
    );
  }, [db]);

  const saveShoppingList = useCallback(async () => {
    return basketApi.saveShoppingList();
  }, []);

  return (
    <BasketContext.Provider
      value={{ basketItems, getBasketItems, addBasketItem, updateBasketItem, deleteBasketItem, saveShoppingList }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider');
  return ctx;
}