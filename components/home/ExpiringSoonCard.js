import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpiringSoonCard({ name, category, daysLabel, alertColor }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>

      <Text style={[styles.days, { color: alertColor }]}>{daysLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#112033',
    marginBottom: 4,
  },
  category: {
    fontSize: 15,
    color: '#6d7782',
  },
  days: {
    fontSize: 16,
    fontWeight: '800',
  },
});