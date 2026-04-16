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

  useEffect(() => {
    let cancelled = false;

    async function syncFromMongoDB() {
      const localRows = await db.getAllAsync('SELECT * FROM basket_items');
      if (!cancelled) setBasketItems(localRows);

      try {
        const serverItems = await basketApi.getAllBasketItems();

        await db.runAsync('DELETE FROM basket_items');
        for (const item of serverItems) {
          await db.runAsync(
            'INSERT INTO basket_items (id, name, category, quantity, unit, mongoId) VALUES (?, ?, ?, ?, ?, ?)',
            [item._id, item.name, item.category, item.quantity, item.unit, item._id]
          );
        }

        const freshRows = await db.getAllAsync('SELECT * FROM basket_items');
        if (!cancelled) setBasketItems(freshRows);
      } catch (err) {
        console.warn('[BasketContext] MongoDB sync on mount failed, using local data:', err.message);
      }
    }

    syncFromMongoDB();
    return () => { cancelled = true; };
  }, [db]);

  // Returns all basket items sorted by name. Synchronous — reads from state.
  const getBasketItems = useCallback(() => {
    return [...basketItems].sort((a, b) => a.name.localeCompare(b.name));
  }, [basketItems]);

  // INSERT INTO basket_items (id, name, category, quantity, unit) VALUES (?, ?, ?, ?, ?)
  const addBasketItem = useCallback(({ name, category, quantity, unit }) => {
    const tempId  = Date.now().toString();
    const newItem = { id: tempId, name, category, quantity, unit, mongoId: null };

    // Update local state immediately so UI re-renders without waiting for DB
    setBasketItems(prev => [...prev, newItem]);

    // Write to SQLite
    db.runAsync(
      'INSERT INTO basket_items (id, name, category, quantity, unit) VALUES (?, ?, ?, ?, ?)',
      [tempId, name, category, quantity, unit]
    );

    // Sync to MongoDB in background — non-blocking so UI is never delayed
    basketApi.createBasketItem({ name, category, quantity, unit })
      .then(res => {
        const mongoId = res?.item?._id;
        if (mongoId) {
          db.runAsync('UPDATE basket_items SET mongoId = ? WHERE id = ?', [mongoId, tempId]);
          setBasketItems(prev =>
            prev.map(item => item.id === tempId ? { ...item, mongoId } : item)
          );
        }
      })
      .catch(err => console.warn('[BasketContext] MongoDB sync failed on add:', err.message));

    return newItem;
  }, [db]);

  // UPDATE basket_items SET name, category, quantity, unit = ?, ?, ?, ? WHERE id = ?
  const updateBasketItem = useCallback((id, { name, category, quantity, unit }) => {
    const mongoId = basketItems.find(i => i.id === id)?.mongoId;

    setBasketItems(prev =>
      prev.map(item => item.id === id ? { ...item, name, category, quantity, unit } : item)
    );

    db.runAsync(
      'UPDATE basket_items SET name = ?, category = ?, quantity = ?, unit = ? WHERE id = ?',
      [name, category, quantity, unit, id]
    );

    if (mongoId) {
      basketApi.updateBasketItem(mongoId, { name, category, quantity, unit }).catch(err =>
        console.warn('[BasketContext] MongoDB sync failed on update:', err.message)
      );
    }
  }, [db]);

  // DELETE FROM basket_items WHERE id = ?
  const deleteBasketItem = useCallback((id) => {
    const mongoId = basketItems.find(i => i.id === id)?.mongoId;

    setBasketItems(prev => prev.filter(item => item.id !== id));
    db.runAsync('DELETE FROM basket_items WHERE id = ?', [id]);

    if (mongoId) {
      basketApi.deleteBasketItem(mongoId).catch(err =>
        console.warn('[BasketContext] MongoDB sync failed on delete:', err.message)
      );
    }
  }, [db, basketItems]);

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