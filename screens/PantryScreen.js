// PantryScreen
// - Purpose: Displays the user's pantry items with category filtering.
// - Key inputs: none (uses mock data for now — will be replaced with SQLite/context later).
// - Key outputs: category filter chips, item count, FlatList of PantryItem cards.
// - Notes: Orchestration-only. Edit/delete handlers just log for now until persistence is wired up.

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

// Replace this with SQLite / context data later.
const MOCK_ITEMS = [
  { id: '1', name: 'Whole Milk',       category: 'Dairy',   quantity: 1,   unit: 'litre', location: 'Fridge', expiryDate: getDateFromNow(2)  },
  { id: '2', name: 'Cheddar Cheese',   category: 'Dairy',   quantity: 500, unit: 'g',      location: 'Fridge', expiryDate: getDateFromNow(12) },
  { id: '3', name: 'Whole Wheat Bread',category: 'Bakery',  quantity: 1,   unit: 'loaf',   location: 'Pantry',       expiryDate: getDateFromNow(5)  },
  { id: '4', name: 'Sourdough Loaf',   category: 'Bakery',  quantity: 1,   unit: 'loaf',   location: 'Pantry',       expiryDate: getDateFromNow(-1) },
  { id: '5', name: 'Broccoli',         category: 'Produce', quantity: 2,   unit: 'heads',  location: 'Fridge', expiryDate: getDateFromNow(3)  },
  { id: '6', name: 'Bananas',          category: 'Produce', quantity: 6,   unit: 'pcs',    location: 'Counter',      expiryDate: getDateFromNow(6)  },
  { id: '7', name: 'Greek Yogurt',     category: 'Dairy',   quantity: 150,   unit: 'ml',   location: 'Fridge', expiryDate: getDateFromNow(8)  },
  { id: '8', name: 'Orange Juice',     category: 'Drinks',  quantity: 1,   unit: 'litre', location: 'Fridge', expiryDate: getDateFromNow(7)  },
  { id: '9', name: 'Pasta',            category: 'Dry Goods',quantity: 500,unit: 'g',      location: 'Pantry',       expiryDate: getDateFromNow(180)},
  { id: '10',name: 'Tinned Tomatoes',  category: 'Dry Goods',quantity: 3,  unit: 'cans',   location: 'Pantry',       expiryDate: null              },
];

// Helper: returns an ISO date string N days from today.
function getDateFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Derive unique categories from the data and prepend "All".
const CATEGORIES = ['All', ...Array.from(new Set(MOCK_ITEMS.map(i => i.category)))];

export default function PantryScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems =
    selectedCategory === 'All'
      ? MOCK_ITEMS
      : MOCK_ITEMS.filter(item => item.category === selectedCategory);

  // Placeholder handlers wire up real logic once SQLite is integrated.
  function handleEdit(item) {
    console.log('Edit pressed for:', item.name);
    // TODO: navigate to AddScreen in edit mode, e.g.:
    // navigation.navigate('Add', { item });
  }

  function handleDelete(id) {
    console.log('Delete confirmed for id:', id);
    // TODO: delete from SQLite and refresh context
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

      {/* Category filter chips */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={cat => cat}
        renderItem={renderCategoryChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipList}
      />

      {/* Item count */}
      <Text style={styles.countText}>
        {filteredItems.length} of {MOCK_ITEMS.length} items
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
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