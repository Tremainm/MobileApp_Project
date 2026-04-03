// BasketScreen
// - Purpose: Show the basket: shows products in basket, users can delete products and modify quantity of products.
// - Key inputs: none (uses internal state and the `useBaskets` hook to fetch/manage basket products).
// - Key outputs: basket list (BasketItem), Button to delete product(s) from the basket, drop-down to change quantity(maybe)
// - Notes: This file should remain orchestration-only: UI and logic for form, image picking, and API calls are delegated to components and hooks.

import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

import ShoppingAddItemForm from '../components/shop/ShoppingAddItemForm';
import ShoppingAddButton from '../components/shop/ShoppingAddButton';
import ShoppingListSection from '../components/shop/ShoppingListSection';
import ShoppingSummaryCard from '../components/shop/ShoppingSummaryCard';
import useBasket from '../hooks/useBasket';

function getBasketItemId(entry, index) {
  return entry?.product?._id || entry?.product?.id || String(index);
}

function buildMeta(item) {
  const quantityLabel = item.quantity ? `Qty ${item.quantity}` : 'Qty 1';
  const detail = item.product?.category || item.product?.description || 'Basket item';
  return `${quantityLabel} • ${detail}`;
}

export default function ShopScreen({navigation}) {
  const { basket, loading, fetchBasketItems, deleteBasketItem } = useBasket();
  const [checkedMap, setCheckedMap] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [customItems, setCustomItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('pcs');

  const basketItems = useMemo(
    () => basket.filter(item => item.product),
    [basket]
  );

  const mappedItems = useMemo(
    () => basketItems.map((item, index) => {
      const productId = getBasketItemId(item, index);
      return {
        key: productId,
        productId,
        source: 'basket',
        name: item.product?.name || 'Unnamed item',
        meta: buildMeta(item),
      };
    }),
    [basketItems]
  );

  const allItems = useMemo(
    () => [...customItems, ...mappedItems],
    [customItems, mappedItems]
  );

  const toBuyItems = allItems.filter(item => !checkedMap[item.key]);
  const checkedItems = allItems.filter(item => checkedMap[item.key]);

  useEffect(() => {
    fetchBasketItems();
    // Refetch basket items when screen is focused (e.g. after coming back from Inventory or Browse)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBasketItems();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const validKeys = new Set(allItems.map(item => item.key));
    setCheckedMap(current => {
      const next = {};
      let changed = false;

      Object.entries(current).forEach(([key, value]) => {
        if (validKeys.has(key)) {
          next[key] = value;
        } else {
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [allItems]);

  function resetAddForm() {
    setNewItemName('');
    setNewItemCategory('Produce');
    setNewItemQuantity('');
    setNewItemUnit('pcs');
  }

  function toggleChecked(itemKey) {
    setCheckedMap(current => ({
      ...current,
      [itemKey]: !current[itemKey],
    }));
  }

  function handleOpenAddForm() {
    setShowAddForm(true);
  }

  function handleCancelAddForm() {
    resetAddForm();
    setShowAddForm(false);
  }

  function handleAddCustomItem() {
    const trimmedName = newItemName.trim();
    const trimmedQuantity = newItemQuantity.trim();

    if (!trimmedName) {
      Alert.alert('Missing item name', 'Enter an item name before adding it to the shopping list.');
      return;
    }

    if (!trimmedQuantity) {
      Alert.alert('Missing quantity', 'Enter a quantity before adding the item.');
      return;
    }

    const id = `custom-${Date.now()}`;
    setCustomItems(current => [
      {
        key: id,
        productId: id,
        source: 'custom',
        name: trimmedName,
        meta: `${trimmedQuantity} ${newItemUnit} • ${newItemCategory}`,
      },
      ...current,
    ]);
    resetAddForm();
    setShowAddForm(false);
  }

  function handleDeleteItem(item) {
    if (item.source === 'custom') {
      setCustomItems(current => current.filter(entry => entry.key !== item.key));
      setCheckedMap(current => {
        const next = { ...current };
        delete next[item.key];
        return next;
      });
      return;
    }

    deleteBasketItem(item.productId);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#10bf86" />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.header}>Shopping List</Text>

          <View style={styles.summaryRow}>
            <ShoppingSummaryCard
              label="To Buy"
              value={toBuyItems.length}
              backgroundColor="#eaf2ff"
              accentColor="#2756ff"
            />
            <ShoppingSummaryCard
              label="Checked"
              value={checkedItems.length}
              backgroundColor="#ecfbf0"
              accentColor="#0ba642"
            />
          </View>

          <View style={styles.addButtonWrap}>
            {showAddForm ? (
              <ShoppingAddItemForm
                name={newItemName}
                category={newItemCategory}
                quantity={newItemQuantity}
                unit={newItemUnit}
                onNameChange={setNewItemName}
                onCategoryChange={setNewItemCategory}
                onQuantityChange={setNewItemQuantity}
                onUnitChange={setNewItemUnit}
                onCancel={handleCancelAddForm}
                onSubmit={handleAddCustomItem}
              />
            ) : (
              <ShoppingAddButton onPress={handleOpenAddForm} />
            )}
          </View>

          <ShoppingListSection
            title="To Buy"
            items={toBuyItems}
            checked={false}
            onToggleChecked={toggleChecked}
            onDelete={handleDeleteItem}
            emptyText="No shopping items left to buy."
          />

          <ShoppingListSection
            title="Checked Off"
            items={checkedItems}
            checked
            onToggleChecked={toggleChecked}
            onDelete={handleDeleteItem}
            emptyText="Nothing checked off yet."
          />
        </ScrollView>
      )}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 26,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#112033',
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    columnGap: 16,
    paddingHorizontal: 12,
    marginBottom: 26,
  },
  addButtonWrap: {
    paddingHorizontal: 2,
    marginBottom: 28,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
