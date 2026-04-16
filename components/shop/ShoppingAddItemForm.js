import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import ShoppingSelectField from './ShoppingSelectField';

const CATEGORY_OPTIONS = ['Produce', 'Dairy', 'Bakery', 'Drinks', 'Dry Goods', 'Frozen', 'Meat', 'Other'];
const UNIT_OPTIONS = ['pcs', 'gallon', 'bag', 'pack', 'box', 'bottle', 'kg', 'g', 'litre'];

export default function ShoppingAddItemForm({
  editingId,
  name,
  category,
  quantity,
  unit,
  onNameChange,
  onCategoryChange,
  onQuantityChange,
  onUnitChange,
  onCancel,
  onSubmit,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>

      <TextInput
        style={styles.nameInput}
        placeholder="Item name"
        placeholderTextColor="#8a94a1"
        value={name}
        onChangeText={onNameChange}
      />

      <View style={styles.row}>
        <ShoppingSelectField
          value={category}
          placeholder="Category"
          options={CATEGORY_OPTIONS}
          onChange={onCategoryChange}
          flex={1.5}
        />
        <View style={styles.qtyWrap}>
          <TextInput
            style={styles.qtyInput}
            placeholder="Qty"
            placeholderTextColor="#8a94a1"
            value={quantity}
            onChangeText={onQuantityChange}
            keyboardType="numeric"
          />
        </View>
        <ShoppingSelectField
          value={unit}
          placeholder="Unit"
          options={UNIT_OPTIONS}
          onChange={onUnitChange}
          flex={1}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={onSubmit} activeOpacity={0.85}>
          <Text style={styles.addText}>{editingId ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#112033',
    marginBottom: 22,
  },
  nameInput: {
    minHeight: 76,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cfd7e2',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    fontSize: 17,
    color: '#112033',
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    columnGap: 14,
    marginBottom: 22,
  },
  qtyWrap: {
    flex: 0.7,
  },
  qtyInput: {
    minHeight: 74,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cfd7e2',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    fontSize: 17,
    color: '#112033',
  },
  buttonRow: {
    flexDirection: 'row',
    columnGap: 16,
  },
  cancelButton: {
    flex: 1,
    minHeight: 66,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cfd7e2',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#29405c',
  },
  addButton: {
    flex: 1,
    minHeight: 66,
    borderRadius: 20,
    backgroundColor: '#0da46e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
});