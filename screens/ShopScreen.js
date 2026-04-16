// BasketScreen
// - Purpose: Show the basket: shows products in basket, users can delete products and modify quantity of products.
// - Key inputs: none (uses BasketContext for SQLite + MongoDB backed basket state).
// - Key outputs: basket list (BasketItem), Button to delete product(s) from the basket, drop-down to change quantity(maybe)
// - Notes: This file should remain orchestration-only: UI and logic for form, image picking, and API calls are delegated to components and hooks.

import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import ShoppingAddItemForm from '../components/shop/ShoppingAddItemForm';
import ShoppingAddButton from '../components/shop/ShoppingAddButton';
import ShoppingListSection from '../components/shop/ShoppingListSection';
import ShoppingSummaryCard from '../components/shop/ShoppingSummaryCard';
import { useBasket } from '../context/BasketContext';
import { usePantry } from '../context/PantryContext';

function buildMeta(item) {
  const quantityLabel = item.quantity ? `Qty ${item.quantity}` : 'Qty 1';
  const detail = item.category || 'Basket item';
  return `${quantityLabel} • ${detail}`;
}

export default function ShopScreen({ navigation }) {
  const { basketItems, addBasketItem, updateBasketItem, deleteBasketItem, saveShoppingList } = useBasket();
  const { getItems, getSuggestions } = usePantry();
  
  const [checkedMap, setCheckedMap] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [editingItem, setEditingItem] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Map basket items from context into the shape the list components expect
  const mappedItems = useMemo(
    () => basketItems.map(item => ({
      key: item.id,
      productId: item.id,
      source: 'basket',
      name: item.name || 'Unnamed item',
      meta: buildMeta(item),
    })),
    [basketItems]
  );

  const toBuyItems = mappedItems.filter(item => !checkedMap[item.key]);
  const checkedItems = mappedItems.filter(item => checkedMap[item.key]);

  // Clean up checkedMap entries for items that no longer exist in the basket
  useEffect(() => {
    const validKeys = new Set(mappedItems.map(item => item.key));
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
  }, [mappedItems]);

  async function handleGetSuggestions() {
    if (getItems().length === 0) {
      Alert.alert('Pantry empty', 'Add some pantry items first so we can make suggestions.');
      return;
    }
    setLoadingSuggestions(true);
    try {
      const { suggestions } = await getSuggestions();
      Alert.alert(
        'Add suggestions to basket?',
        suggestions.map(s => `• ${s.name} (${s.quantity} ${s.unit})`).join('\n'),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add All',
            onPress: () => {
              suggestions.forEach(s => addBasketItem({
                name: s.name,
                category: s.category,
                quantity: s.quantity,
                unit: s.unit,
              }));
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Could not get suggestions. Try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  }

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

  async function handleSaveList() {
    if (basketItems.length === 0) {
      Alert.alert('Empty basket', 'Add some items before saving your list.');
      return;
    }
    try {
      const result = await saveShoppingList();
      Alert.alert('List saved!', 'Your shopping list has been saved to the cloud.');
    } catch (err) {
      Alert.alert('Save failed', err.message);
    }
  }

  function handleOpenAddForm() {
    setShowAddForm(true);
  }

  function handleCancelAddForm() {
    resetAddForm();
    setEditingItem(null);
    setShowAddForm(false);
  }

  function handleSubmitForm() {
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

    if (editingItem) {
      updateBasketItem(editingItem.id, {
        name: trimmedName,
        category: newItemCategory,
        quantity: Number(trimmedQuantity) || 1,
        unit: newItemUnit,
      });
    } else {
      addBasketItem({
        name: trimmedName,
        category: newItemCategory,
        quantity: Number(trimmedQuantity) || 1,
        unit: newItemUnit,
      });
    }

    resetAddForm();
    setEditingItem(null);
    setShowAddForm(false);
  }

  function handleOpenEditForm(item) {
    // item here is the mapped item from mappedItems - we need the raw basket item for current values
    const raw = basketItems.find(b => b.id === item.productId);
    if (!raw) return;
    setEditingItem(raw);
    setNewItemName(raw.name);
    setNewItemCategory(raw.category);
    setNewItemQuantity(String(raw.quantity));
    setNewItemUnit(raw.unit);
    setShowAddForm(true);
  }

  function handleDeleteItem(item) {
    // deleteBasketItem writes to SQLite, updates context state, and syncs to MongoDB
    deleteBasketItem(item.productId);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Shopping List</Text>

        <TouchableOpacity
          style={[styles.suggestBtn, loadingSuggestions && { opacity: 0.6 }]}
          onPress={handleGetSuggestions}
          disabled={loadingSuggestions}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.suggestBtnText}>
            {loadingSuggestions ? 'Getting suggestions...' : 'Suggest items from pantry'}
          </Text>
        </TouchableOpacity>

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
              editingId={editingItem?.id}
              name={newItemName}
              category={newItemCategory}
              quantity={newItemQuantity}
              unit={newItemUnit}
              onNameChange={setNewItemName}
              onCategoryChange={setNewItemCategory}
              onQuantityChange={setNewItemQuantity}
              onUnitChange={setNewItemUnit}
              onCancel={handleCancelAddForm}
              onSubmit={handleSubmitForm}
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
          onEdit={handleOpenEditForm}
          emptyText="No shopping items left to buy."
        />

        <ShoppingListSection
          title="Checked Off"
          items={checkedItems}
          checked
          onToggleChecked={toggleChecked}
          onDelete={handleDeleteItem}
          onEdit={handleOpenEditForm}
          emptyText="Nothing checked off yet."
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveList} activeOpacity={0.85}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save List</Text>
        </TouchableOpacity>
      </ScrollView>

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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0eb28f',
    borderRadius: 14,
    paddingVertical: 13,
    marginHorizontal: 12,
    marginBottom: 20,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 13,
    marginHorizontal: 2,
    marginBottom: 20,
    gap: 8,
  },
  suggestBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});