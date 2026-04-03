import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuickActionButton({ label, backgroundColor, onPress, iconName = 'cube-outline' }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={36} color="#ffffff" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 148,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  iconWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});