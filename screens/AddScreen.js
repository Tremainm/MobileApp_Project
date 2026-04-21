// AddScreen
// - Purpose: Orchestrates the add/edit pantry item form with camera barcode scanning via expo-camera
//   and product lookup via Open Food Facts (free, no key required).
// - Behaviour:
//    - "Open Scanner" opens the camera to scan a barcode and auto-fills the form.
//    - When opened with route.params.item: pre-fills form for editing.
// - Notes: Requires `npx expo install expo-camera` before use.

import React, { useState, useEffect } from 'react';
import {
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AddPantryItem from '../components/AddPantryItem';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import { usePantry } from '../context/PantryContext';
import useNotifications from '../hooks/useNotifications';

export default function AddScreen({ navigation, route }) {
  const { addPantryItem, updatePantryItem } = usePantry();
  const { expoPushToken } = useNotifications();
  const editingItem = route?.params?.item ?? null;

  const [editingId, setEditingId] = useState(editingItem?.id ?? null);
  const [name, setName] = useState(editingItem?.name ?? '');
  const [category, setCategory] = useState(editingItem?.category ?? '');
  const [quantity, setQuantity] = useState(editingItem?.quantity != null ? String(editingItem.quantity) : '');
  const [unit, setUnit] = useState(editingItem?.unit ?? '');
  const [location, setLocation] = useState(editingItem?.location ?? '');
  const [expiryDate, setExpiryDate] = useState(editingItem?.expiryDate ?? '');
  const [posting, setPosting] = useState(false);

  const { scannerVisible, scanLoading, scanned, openScanner, handleBarcodeScanned, closeScannerModal } =
    useBarcodeScanner({
      onProductFound: ({ name: n, category: cat, quantity: qty, unit: u }) => {
        // Clear auto-fillable fields first so previous scan values never linger.
        // Expiry date and location are intentionally left alone - they are not from
        // the API and the user may have already typed them in.
        setName('');
        setCategory('');
        setQuantity('');
        setUnit('');
        if (n) setName(n);
        if (cat) setCategory(cat);
        if (qty) setQuantity(qty);
        if (u) setUnit(u);
      },
    });

  useEffect(() => {
    navigation.setOptions({ title: editingId ? 'Edit Item' : 'Add Item' });
  }, [editingId]);

  // Re-populate form whenever route.params changes (e.g. navigating from PantryScreen to edit a different item)
  useEffect(() => {
    const item = route?.params?.item ?? null;
    if (item) {
      setEditingId(item.id);
      setName(item.name ?? '');
      setCategory(item.category ?? '');
      setQuantity(item.quantity != null ? String(item.quantity) : '');
      setUnit(item.unit ?? '');
      setLocation(item.location ?? '');
      setExpiryDate(item.expiryDate ?? '');
    } else {
      clearForm();
    }
  }, [route?.params]);

  async function sendPushNotification(expoPushToken, name) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title: 'Item Added',
        body: `${name} has been added to your pantry.`,
      }),
    });
  }

  function clearForm() {
    setEditingId(null);
    setName('');
    setCategory('');
    setQuantity('');
    setUnit('');
    setLocation('');
    setExpiryDate('');
  }

  function handleClear() {
    if (editingId) {
      clearForm();
      navigation.setParams({ item: undefined });
      navigation.goBack();
    } else {
      clearForm();
    }
  }

  function parseDisplayDate(display) {
    if (!display || display.length < 8) return null;
    const parts = display.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    if (!dd || !mm || !yyyy || yyyy.length !== 4) return null;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  function handleExpiryChange(text) {
    const digits = text.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
    setExpiryDate(formatted);
  }

  async function handleSave() {
    if (!name.trim()) return Alert.alert('Validation', 'Item name is required.');
    if (!category) return Alert.alert('Validation', 'Please select a category.');
    if (!quantity.trim() || isNaN(Number(quantity))) return Alert.alert('Validation', 'Please enter a valid quantity.');
    if (!unit.trim()) return Alert.alert('Validation', 'Please select or enter a unit.');
    if (!editingId && expoPushToken) {
      sendPushNotification(expoPushToken, name.trim()).catch(err =>
        console.warn('[Push] Failed to send:', err.message)
      );
    }

    const isoDate = parseDisplayDate(expiryDate);

    const item = {
      id: editingId ?? String(Date.now()),
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit: unit.trim(),
      location: location || 'Pantry',
      expiryDate: isoDate,
    };

    setPosting(true);
    try {
      if (editingId) {
        updatePantryItem(editingId, {
          name: item.name, category: item.category, quantity: item.quantity,
          unit: item.unit, location: item.location, expiryDate: item.expiryDate,
        });
      } else {
        addPantryItem({
          name: item.name, category: item.category, quantity: item.quantity,
          unit: item.unit, location: item.location, expiryDate: item.expiryDate,
        });
      }
      Alert.alert(
        'Success',
        editingId ? `${item.name} updated.` : `${item.name} added to your pantry.`,
        [{ text: 'OK', onPress: () => { clearForm(); if (editingId) navigation.goBack(); } }]
      );
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setPosting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>{editingId ? 'Edit Item' : 'Add to Pantry'}</Text>
          <Text style={styles.subheader}>
            {editingId
              ? 'Update the details below.'
              : 'Scan a barcode or fill in the details manually.'}
          </Text>

          <AddPantryItem
            editingId={editingId}
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            quantity={quantity}
            setQuantity={setQuantity}
            unit={unit}
            setUnit={setUnit}
            location={location}
            setLocation={setLocation}
            expiryDate={expiryDate}
            setExpiryDate={handleExpiryChange}
            posting={posting}
            onSave={handleSave}
            onClear={handleClear}
            onScanBarcode={openScanner}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <BarcodeScannerModal
        visible={scannerVisible}
        scanned={scanned}
        scanLoading={scanLoading}
        onBarcodeScanned={handleBarcodeScanned}
        onClose={closeScannerModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#888', marginBottom: 20 },
});
