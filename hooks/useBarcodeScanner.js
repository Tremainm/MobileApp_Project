// hooks/useBarcodeScanner.js
// Manages camera permission, scanner visibility, and barcode lookup.
// Returns state + handlers needed to drive BarcodeScannerModal.

import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { lookupBarcode, mapApiCategory, parseQuantity } from '../components/publicApi';

export default function useBarcodeScanner({ onProductFound }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  // useRef flag to block duplicate scans synchronously (useState is async, not fast enough)
  const isProcessing = useRef(false);

  async function openScanner() {
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
        const mappedCategory = mapApiCategory(product.categories_tags || []);
        const { quantity, unit } = parseQuantity(product);
        onProductFound({
          name: product.product_name ?? '',
          category: mappedCategory,
          quantity,
          unit,
        });
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

  return {
    scannerVisible,
    scanLoading,
    scanned,
    openScanner,
    handleBarcodeScanned,
    closeScannerModal: () => setScannerVisible(false),
  };
}
