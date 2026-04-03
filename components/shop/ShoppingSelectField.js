import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShoppingSelectField({ value, placeholder, options, onChange, flex = 1 }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex }}>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)} activeOpacity={0.75}>
        <Text style={[styles.text, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={22} color="#1e2e40" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionActive]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextActive]}>{item}</Text>
                  {item === value ? <Ionicons name="checkmark" size={18} color="#10a36c" /> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 74,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cfd7e2',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 17,
    color: '#112033',
  },
  placeholder: {
    color: '#8a94a1',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#112033',
    textAlign: 'center',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f4',
  },
  optionActive: {
    backgroundColor: '#effaf4',
  },
  optionText: {
    fontSize: 16,
    color: '#112033',
  },
  optionTextActive: {
    color: '#10a36c',
    fontWeight: '700',
  },
});