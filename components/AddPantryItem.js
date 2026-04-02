// AddPantryItem
// - Purpose: Form UI for adding or editing a pantry item. Matches Figma design.
// - Props:
//    - editingId: id of item being edited (null if adding new)
//    - name, setName
//    - category, setCategory
//    - quantity, setQuantity
//    - unit, setUnit
//    - location, setLocation
//    - expiryDate, setExpiryDate  (display string "dd/mm/yyyy")
//    - posting: boolean - true while save is in progress
//    - onSave: callback when Add Item/Save is pressed
//    - onClear: callback when Cancel is pressed
//    - onScanBarcode: callback when Open Scanner is pressed

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const CATEGORIES = ['Dairy', 'Bakery', 'Produce', 'Drinks', 'Dry Goods', 'Meat', 'Frozen', 'Other'];
const UNITS = ['pcs', 'g', 'kg', 'ml', 'litre', 'loaf', 'can', 'box', 'bottle', 'pack'];
const LOCATIONS  = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cupboard'];

// Reusable bottom-sheet dropdown
function Dropdown({ value, placeholder, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#888" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, item === value && styles.modalOptionActive]}
                  onPress={() => { onChange(item); setOpen(false); }}
                >
                  <Text style={[styles.modalOptionText, item === value && styles.modalOptionTextActive]}>
                    {item}
                  </Text>
                  {item === value && <Ionicons name="checkmark" size={16} color={Colors.green} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function AddPantryItem({
  editingId,
  name,        
  setName,
  category,    
  setCategory,
  quantity,    
  setQuantity,
  unit,        
  setUnit,
  location,    
  setLocation,
  expiryDate,  
  setExpiryDate,
  posting,
  onSave,
  onClear,
  onScanBarcode,
}) {
  return (
    <View style={styles.container}>

      {/* Barcode scanner card */}
      <View style={styles.barcodeCard}>
        <Ionicons name="barcode-outline" size={40} color="#aaa" />
        <Text style={styles.barcodeTitle}>Scan Barcode</Text>
        <Text style={styles.barcodeSubtitle}>Quickly add items by scanning</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={onScanBarcode} activeOpacity={0.8}>
          <Text style={styles.scanBtnText}>Open Scanner</Text>
        </TouchableOpacity>
      </View>

      {/* OR ENTER MANUALLY divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Item Name */}
      <Text style={styles.label}>Item Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Organic Apples"
        placeholderTextColor="#bbb"
        value={name}
        onChangeText={setName}
      />

      {/* Category + Location */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Category *</Text>
          <Dropdown value={category} placeholder="Category" options={CATEGORIES} onChange={setCategory} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Location</Text>
          <Dropdown value={location} placeholder="Location" options={LOCATIONS} onChange={setLocation} />
        </View>
      </View>

      {/* Quantity + Unit */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#bbb"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Unit *</Text>
          <Dropdown value={unit} placeholder="Unit" options={UNITS} onChange={setUnit} />
        </View>
      </View>

      {/* Expiry Date */}
      <Text style={styles.label}>Expiry Date *</Text>
      <TextInput
        style={styles.input}
        placeholder="dd/mm/yyyy"
        placeholderTextColor="#bbb"
        value={expiryDate}
        onChangeText={setExpiryDate}
        keyboardType="numeric"
        maxLength={10}
      />

      {/* Cancel / Add Item */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClear} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, posting && styles.btnDisabled]}
          onPress={onSave}
          disabled={posting}
          activeOpacity={0.8}
        >
          <Text style={styles.saveText}>
            {posting
              ? (editingId ? 'Saving...' : 'Adding...')
              : (editingId ? 'Save Changes' : 'Add Item')}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Barcode card
  barcodeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  barcodeTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 8 },
  barcodeSubtitle: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 12 },
  scanBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 10,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { fontSize: 11, fontWeight: '600', color: '#aaa', marginHorizontal: 10, letterSpacing: 0.8 },

  // Form
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 14,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  // Dropdown
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dropdownText: { fontSize: 15, color: '#1a1a1a' },
  dropdownPlaceholder: { color: '#bbb' },

  // Modal sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 12, paddingHorizontal: 16 },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionActive: { backgroundColor: '#f0faf5' },
  modalOptionText: { fontSize: 15, color: '#333' },
  modalOptionTextActive: { color: Colors.green, fontWeight: '600' },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: '#555', fontWeight: '600' },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.green,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});