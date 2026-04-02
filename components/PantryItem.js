// PantryItem
// - Purpose: Renders a single pantry item card with name, category, quantity, location, and expiry info.
// - Props:
//    - item: pantry item object { id, name, category, quantity, unit, location, expiryDate }
//    - onEdit: callback invoked with item when Edit is pressed
//    - onDelete: callback invoked with item id when Delete is confirmed

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Returns days until expiry from an ISO date string. Negative = already expired.
function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
}

// Returns a colour and label based on how many days until expiry.
function getExpiryStyle(days) {
  if (days === null) return null;
  if (days < 0)  return { color: '#d9534f', label: 'Expired' };
  if (days === 0) return { color: '#d9534f', label: 'Expires today' };
  if (days <= 3)  return { color: '#e87b2e', label: `${days} day${days === 1 ? '' : 's'}` };
  if (days <= 7)  return { color: '#e8a52e', label: `${days} days` };
  return { color: Colors.green, label: `${days} days` };
}

export default function PantryItem({ item, onEdit, onDelete }) {
  const days = getDaysUntilExpiry(item.expiryDate);
  const expiryStyle = getExpiryStyle(days);

  function handleDelete() {
    Alert.alert(
      'Remove item',
      `Remove ${item.name} from your pantry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  }

  return (
    <View style={styles.card}>
      {/* Top row: name + action buttons */}
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color="#d9534f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Middle row: quantity + location */}
      <View style={styles.detailRow}>
        <Text style={styles.detailText}>
          Quantity: <Text style={styles.detailBold}>{item.quantity} {item.unit}</Text>
        </Text>
        <View style={styles.locationBlock}>
          <Ionicons name="location-outline" size={13} color="#888" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      {/* Bottom row: expiry */}
      <View style={styles.expiryRow}>
        <Text style={styles.expiryLabel}>Expires:</Text>
        {expiryStyle ? (
          <View style={[styles.expiryBadge, { backgroundColor: expiryStyle.color + '1A' }]}>
            <Text style={[styles.expiryText, { color: expiryStyle.color }]}>
              {expiryStyle.label}
            </Text>
          </View>
        ) : (
          <Text style={styles.noExpiry}>No date set</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  category: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    padding: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#555',
  },
  detailBold: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 2,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  expiryLabel: {
    fontSize: 13,
    color: '#888',
  },
  expiryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noExpiry: {
    fontSize: 13,
    color: '#bbb',
  },
});