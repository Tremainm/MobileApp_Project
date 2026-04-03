import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ShoppingListItemCard from './ShoppingListItemCard';

export default function ShoppingListSection({ title, items, checked, onToggleChecked, onDelete, emptyText }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>

      {items.length > 0 ? (
        items.map(item => (
          <ShoppingListItemCard
            key={item.key}
            name={item.name}
            meta={item.meta}
            checked={checked}
            onToggleChecked={() => onToggleChecked(item.key)}
            onDelete={() => onDelete(item)}
          />
        ))
      ) : (
        <Text style={styles.empty}>{emptyText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#112033',
    marginBottom: 16,
  },
  empty: {
    fontSize: 14,
    color: '#7a8694',
    marginBottom: 12,
  },
});