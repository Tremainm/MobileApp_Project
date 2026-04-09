// PantryScreen
// - Purpose: Displays pantry items from SQLite via PantryContext, with category filtering.
// - Key inputs: none - reads from PantryContext (backed by SQLite).
// - Key outputs: category filter chips, item count, FlatList of PantryItem cards.

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/colors';
import PantryItem from '../components/PantryItem';
import { usePantry } from '../context/PantryContext';

export default function PantryScreen({ navigation }) {
  const { getItems, getItemsByCategory, getCategories, deletePantryItem } = usePantry();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = getCategories();
  const allItems = getItems();
  const filteredItems = getItemsByCategory(selectedCategory);

  function handleEdit(item) {
    // Navigate to AddScreen in edit mode - passes the full item as a route param
    navigation.navigate('Add', { item, timestamp: Date.now() });
  }

  function handleDelete(id) {
    // deletePantryItem writes to SQLite and mirrors into context state immediately
    deletePantryItem(id);
  }

  function renderItem({ item }) {
    return <PantryItem item={item} onEdit={handleEdit} onDelete={handleDelete} />;
  }

  function renderCategoryChip({ item: cat }) {
    const active = cat === selectedCategory;
    return (
      <TouchableOpacity
        style={[styles.chip, active && styles.chipActive]}
        onPress={() => setSelectedCategory(cat)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>My Pantry</Text>

      {/* Category filter chips - derived live from DB data */}
      <FlatList
        data={categories}
        keyExtractor={cat => cat}
        renderItem={renderCategoryChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipList}
      />

      {/* Item count */}
      <Text style={styles.countText}>
        {filteredItems.length} of {allItems.length} items
      </Text>

      {/* Pantry list */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No items in this category.</Text>
          }
          contentContainerStyle={
            filteredItems.length === 0 ? styles.emptyContainer : styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  chipList: {
    flexGrow: 0,
    marginBottom: 4,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.green,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
  },
  countText: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});