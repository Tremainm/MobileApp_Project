import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ShoppingSummaryCard({ label, value, backgroundColor, accentColor }) {
  return (
    <View style={[styles.card, { backgroundColor }]}> 
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 114,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
});