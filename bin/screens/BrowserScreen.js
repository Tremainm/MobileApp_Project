// BrowserScreen
// - Purpose: Show the inventory: shows product list but cannot edit/delete products.
// - Key inputs: none (uses internal state and the `useProducts` hook to fetch/manage products).
// - Key outputs: product list (ProductItem), Button to add product(s) to a basket
// - Notes: This file should remain orchestration-only: UI and logic for form, image picking, and API calls are delegated to components and hooks.

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Button,
} from 'react-native';

import BrowseProductItem from '../components/BrowseProductItem';
import useProducts from '../hooks/useProducts';

export default function BrowserScreen({navigation}) {
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
    // Refetch products when screen is focused (e.g. after coming back from Inventory or Basket)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation]);


  function renderItem({ item }) {
    return <BrowseProductItem item={item} />;
  }

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Products</Text>
      {/* <Button title="Basket" onPress={() => navigation.navigate('Basket')} /> */}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList data={products} keyExtractor={(item, idx) => item._id || item.id || String(idx)} renderItem={renderItem} ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>} contentContainerStyle={products.length === 0 ? styles.emptyContainer : null} />
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
