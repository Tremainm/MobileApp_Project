// BasketScreen
// - Purpose: Show the basket: shows products in basket, users can delete products and modify quantity of products.
// - Key inputs: none (uses internal state and the `useBaskets` hook to fetch/manage basket products).
// - Key outputs: basket list (BasketItem), Button to delete product(s) from the basket, drop-down to change quantity(maybe)
// - Notes: This file should remain orchestration-only: UI and logic for form, image picking, and API calls are delegated to components and hooks.

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import BasketItem from '../components/BasketItem';
import useBasket from '../hooks/useBasket';

export default function ShopScreen({navigation}) {
  const { basket, loading, fetchBasketItems, deleteBasketItem, updateBasketItem } = useBasket();

  useEffect(() => {
    fetchBasketItems();
    // Refetch basket items when screen is focused (e.g. after coming back from Inventory or Browse)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBasketItems();
    });
    return unsubscribe;
  }, [navigation]);

  function renderItem({ item }) {
    return (
      <BasketItem 
        item={item.product} 
        quantity={item.quantity}
        onUpdateQuantity={updateBasketItem}
        onDelete={deleteBasketItem}
      />
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Basket</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={basket.filter(item => item.product)}  // removes any items with missing product info (if product was deleted from inventory but still in basket)
          keyExtractor={(item, idx) => item.product._id || item.product.id || String(idx)}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Basket is empty.</Text>}
          contentContainerStyle={basket.length === 0 ? styles.emptyContainer : null}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  spacer: { width: 12 },
  empty: { textAlign: 'center', color: '#666', marginTop: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
});
