// AddScreen
// - Purpose: Orchestrates the add/edit pantry item form with camera barcode scanning via expo-camera
//   and product lookup via Open Food Facts (free, no key required).
// - Behaviour:
//    - "Open Scanner" opens the camera to scan a barcode and auto-fills the form.
//    - When opened with route.params.item: pre-fills form for editing.
// - Notes: Requires `npx expo install expo-camera` before use.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import AddPantryItem from '../components/AddPantryItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Free public API - no key required. 4M+ food products from 150 countries.
// Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
const OFF_URL = 'https://world.openfoodfacts.org/api/v0/product';

async function lookupBarcode(barcode) {
  const res = await fetch(`${OFF_URL}/${barcode}.json`, {
    method: 'GET',
    headers: { 'User-Agent': 'PantryManager/1.0' },
  });
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  const data = await res.json();
  if (data.status === 0) return null;
  return data.product;
}

// Map Open Food Facts category tags to our app categories.
// Checks all tags joined together so e.g. "en:long-grain-rice" matches Dry Goods.
function mapApiCategory(tags) {
  if (!tags || tags.length === 0) return '';
  const joined = tags.join(' ').toLowerCase();

  // Dairy - check before drinks so "milk" doesn't fall into drinks
  if (joined.includes('dairy') || joined.includes(':milk') || joined.includes('milks') ||
      joined.includes('cheese') || joined.includes('yogurt') || joined.includes('yoghurt') ||
      joined.includes('butter') || joined.includes('cream') || joined.includes('kefir')) return 'Dairy';

  // Bakery
  if (joined.includes('bread') || joined.includes('biscuit') || joined.includes('cake') ||
      joined.includes('pastry') || joined.includes('bak') || joined.includes('loaf') ||
      joined.includes('roll') || joined.includes('cracker') || joined.includes('wafer')) return 'Bakery';

  // Meat & fish
  if (joined.includes('meat') || joined.includes('beef') || joined.includes('pork') ||
      joined.includes('chicken') || joined.includes('poultry') || joined.includes('fish') ||
      joined.includes('seafood') || joined.includes('salmon') || joined.includes('tuna') ||
      joined.includes('lamb') || joined.includes('sausage') || joined.includes('bacon')) return 'Meat';

  // Frozen
  if (joined.includes('frozen') || joined.includes('ice-cream') || joined.includes('ice cream')) return 'Frozen';

  // Dry Goods - grains, pasta, rice, cereals, canned goods
  if (joined.includes('rice') || joined.includes('pasta') || joined.includes('noodle') ||
      joined.includes('cereal') || joined.includes('grain') || joined.includes('flour') ||
      joined.includes('oat') || joined.includes('lentil') || joined.includes('bean') ||
      joined.includes('chickpea') || joined.includes('canned') || joined.includes('tinned') ||
      joined.includes('dried') || joined.includes('legume') || joined.includes('pulse') ||
      joined.includes('soup') || joined.includes('sauce') || joined.includes('condiment') ||
      joined.includes('oil') || joined.includes('vinegar') || joined.includes('spice') ||
      joined.includes('sugar') || joined.includes('salt') || joined.includes('snack') ||
      joined.includes('chocolate') || joined.includes('jam') || joined.includes('spread') ||
      joined.includes('nut') || joined.includes('seed')) return 'Dry Goods';

  // Produce - fruit and veg
  if (joined.includes('fruit') || joined.includes('vegetable') || joined.includes('produce') ||
      joined.includes('fresh') || joined.includes('salad') || joined.includes('herb') ||
      joined.includes('apple') || joined.includes('banana') || joined.includes('orange') ||
      joined.includes('potato') || joined.includes('onion') || joined.includes('tomato')) return 'Produce';

  // Drinks - last so milk/juice products don't accidentally match here
  if (joined.includes('beverage') || joined.includes('drink') || joined.includes('juice') ||
      joined.includes('water') || joined.includes('soda') || joined.includes('cola') ||
      joined.includes('beer') || joined.includes('wine') || joined.includes('coffee') ||
      joined.includes('tea') || joined.includes('smoothie') || joined.includes('energy-drink')) return 'Drinks';

  return '';  // Return empty string so the field stays unset rather than wrong
}

// Parse Open Food Facts quantity - tries every field the API may populate.
// Logs raw fields in dev so you can see exactly what was returned.
function parseQuantity(product) {
  const unitMap = { l: 'litre', cl: 'ml', oz: 'g', lb: 'kg' };

  function extractFromString(raw) {
    if (!raw) return null;
    // Handle "6 x 330 ml" - take the last number+unit pair
    const matches = [...raw.matchAll(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cl|oz|lb|pcs|pack|bottle|can|box)/gi)];
    const match = matches[matches.length - 1];
    if (!match) return null;
    const rawUnit = match[2].toLowerCase();
    return { quantity: match[1], unit: unitMap[rawUnit] || rawUnit };
  }

  // Only try the actual package quantity fields - NOT serving_size.
  // serving_size is per-serving (e.g. "200 ml") not the total package size (e.g. "1 litre").
  // If these fields are missing (common on incomplete OFF entries), return empty so the
  // user knows to fill it in themselves rather than getting the wrong value silently.
  const packageSources = [
    product.quantity,         // e.g. "500 g" or "1 l" - most reliable
    product.product_quantity, // e.g. "500" - sometimes populated separately
  ];

  for (const src of packageSources) {
    const result = extractFromString(String(src || ''));
    if (result && result.quantity) return result;
  }

  // Try numeric quantity + separate unit field as last resort
  if (product.product_quantity && product.quantity_unit) {
    const rawUnit = product.quantity_unit.toLowerCase();
    return { quantity: String(product.product_quantity), unit: unitMap[rawUnit] || rawUnit };
  }

  // Quantity genuinely not available for this product - leave blank for user to fill in
  return { quantity: '', unit: '' };
}

export default function AddScreen({ navigation, route }) {
  const editingItem = route?.params?.item ?? null;

  const [editingId, setEditingId] = useState(editingItem?.id ?? null);
  const [name, setName] = useState(editingItem?.name ?? '');
  const [category, setCategory] = useState(editingItem?.category ?? '');
  const [quantity, setQuantity] = useState(editingItem?.quantity != null ? String(editingItem.quantity) : '');
  const [unit, setUnit] = useState(editingItem?.unit ?? '');
  const [location, setLocation] = useState(editingItem?.location ?? '');
  const [expiryDate, setExpiryDate] = useState(editingItem?.expiryDate ?? '');
  const [posting, setPosting] = useState(false);

  // Camera / scanner state
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  // useRef flag to block duplicate scans synchronously (useState is async, not fast enough)
  const isProcessing = useRef(false);

  useEffect(() => {
    navigation.setOptions({ title: editingId ? 'Edit Item' : 'Add Item' });
  }, [editingId]);

  // Open scanner
  async function handleOpenScanner() {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera permission required',
          'Please allow camera access in your device settings to scan barcodes.'
        );
        return;
      }
    }
    setScanned(false);
    isProcessing.current = false;
    setScannerVisible(true);
  }

  // Called by CameraView when a barcode is detected
  async function handleBarcodeScanned({ data: barcode }) {
    if (isProcessing.current) return; // synchronous ref guard - prevents camera spam
    isProcessing.current = true;      // set immediately, before any await
    setScanned(true);
    setScanLoading(true);
    try {
      const product = await lookupBarcode(barcode);
      if (!product) {
        Alert.alert(
          'Not found',
          `No product found for barcode ${barcode}. Fill in the details manually.`,
          [{ text: 'OK', onPress: () => setScannerVisible(false) }]
        );
      } else {
        // Clear all auto-fillable fields first so previous scan values never linger.
        // Expiry date and location are intentionally left alone - they are not from
        // the API and the user may have already typed them in.
        setName('');
        setCategory('');
        setQuantity('');
        setUnit('');

        // Now populate whatever this product actually has
        if (product.product_name) setName(product.product_name);

        const mappedCategory = mapApiCategory(product.categories_tags || []);
        if (mappedCategory) setCategory(mappedCategory);

        const { quantity: qty, unit: u } = parseQuantity(product);
        if (qty) setQuantity(qty);
        if (u) setUnit(u);

        // Note: Open Food Facts doesn't provide expiry dates or storage location
        // as these are instance-specific - user fills those manually.

        setScannerVisible(false);
        Alert.alert(
          'Product found!',
          `"${product.product_name}" has been filled in. Please complete the expiry date and any missing fields.`
        );
      }
    } catch (err) {
      Alert.alert('Lookup failed', `Could not fetch product data.\n\n${err.message}`, [
        { text: 'OK', onPress: () => setScannerVisible(false) }
      ]);
    } finally {
      setScanLoading(false);
    }
  }

  // Form helpers 
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
      // TODO: persist to SQLite and update global context
      console.log(editingId ? 'Updating item:' : 'Adding item:', item);
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
            onScanBarcode={handleOpenScanner}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Camera barcode scanner modal */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.cameraContainer}>

          {/* Header bar */}
          <SafeAreaView style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Scan Barcode</Text>
            <View style={{ width: 40 }} />
          </SafeAreaView>

          {/* Camera */}
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />

          {/* Dark overlay with cutout frame */}
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              {scanLoading
                ? <ActivityIndicator size="large" color="#fff" />
                : <Text style={styles.scanHint}>Point your camera at a barcode</Text>
              }
            </View>
          </View>

        </View>
      </Modal>
    </SafeAreaView>
  );
}

const FRAME_SIZE = SCREEN_WIDTH * 0.65;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#888', marginBottom: 20 },

  // Camera modal
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  closeBtn: { padding: 4, width: 40 },
  cameraTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Overlay with transparent cutout
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row', height: FRAME_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: { width: FRAME_SIZE, height: FRAME_SIZE },
  scanHint: { color: '#fff', fontSize: 14, opacity: 0.85 },

  // Corner markers
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.green, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});