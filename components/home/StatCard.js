import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ label, value, suffix, accentColor = '#132238' }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <Text style={styles.suffix}>{suffix}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    backgroundColor: '#eef5f3',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#61707d',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  suffix: {
    fontSize: 14,
    color: '#61707d',
  },
});