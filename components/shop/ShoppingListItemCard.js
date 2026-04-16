import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShoppingListItemCard({ name, meta, checked, onToggleChecked, onDelete, onEdit }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.checkboxButton} onPress={onToggleChecked} activeOpacity={0.8}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked ? <Ionicons name="checkmark" size={22} color="#ffffff" /> : null}
        </View>
      </TouchableOpacity>

      <View style={styles.textBlock}>
        <Text style={[styles.name, checked && styles.nameChecked]}>{name}</Text>
        <Text style={[styles.meta, checked && styles.metaChecked]}>{meta}</Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.75}>
          <Ionicons name="create-outline" size={24} color="#377ced" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.75}>
          <Ionicons name="trash-outline" size={24} color={checked ? '#ff7a7a' : '#ff1a1a'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  checkboxButton: {
    marginRight: 16,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5ea8e8',
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#112033',
    marginBottom: 4,
  },
  nameChecked: {
    color: '#7e8590',
    textDecorationLine: 'line-through',
  },
  meta: {
    fontSize: 15,
    color: '#566271',
  },
  metaChecked: {
    color: '#99a2ad',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  editButton: {},
});