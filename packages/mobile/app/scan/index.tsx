import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useQRScanner } from '../../src/hooks/useQRScanner';

/**
 * QR Scanner — Phase 2.6 main screen.
 *
 * Live camera scanner with:
 *   - Permission request flow (handled by expo-camera's useCameraPermissions)
 *   - Debounced barcode events (camera fires many times per second; we lock
 *     after the first hit until lookup completes + user navigates back)
 *   - Manual-entry fallback for when the QR is too small / damaged / dimly lit
 *   - Quick links to scan history
 *
 * On successful scan: routes to /scan/result with the qrId as a route param.
 * The lookup actually happens on the result screen so navigation feels instant.
 */
export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [manualEntry, setManualEntry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScannedRef = useRef<string | null>(null);

  // We call lookupQrAndCache up here so cache priming begins immediately. The
  // result screen reads from the same hook (cache hit on the second call).
  const { lookupQrAndCache } = useQRScanner();

  const goToResult = useCallback(
    async (qrId: string) => {
      if (isProcessing || lastScannedRef.current === qrId) return;
      lastScannedRef.current = qrId;
      setIsProcessing(true);
      // Prime the cache so the result screen renders fast
      try {
        await lookupQrAndCache(qrId);
      } catch {
        /* result screen will retry */
      }
      router.push(`/scan/result?qrId=${encodeURIComponent(qrId)}`);
      // Allow the user to scan again after they navigate back
      setTimeout(() => {
        setIsProcessing(false);
        lastScannedRef.current = null;
      }, 1500);
    },
    [isProcessing, lookupQrAndCache],
  );

  const submitManual = () => {
    const trimmed = manualEntry.trim();
    if (!trimmed) {
      Alert.alert('Enter a code', 'Type a QR ID to look up.');
      return;
    }
    goToResult(trimmed);
  };

  // Permission states
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={80} color="#9ca3af" />
        <Text style={styles.heading}>Camera permission needed</Text>
        <Text style={styles.subtle}>
          To scan QR codes, NACA needs access to your camera. Audio is never recorded
          for scanning, and no photos are stored.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
          testID="button-grant-camera"
        >
          <Text style={styles.primaryButtonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={(event) => {
          // expo-camera emits this many times per second when a QR is visible.
          // The goToResult guard ensures we only handle the first hit.
          if (event?.data && event?.type === 'qr') {
            goToResult(event.data);
          }
        }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        {/* Overlay: viewfinder + instructions + manual entry */}
        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            {isProcessing && (
              <View style={styles.processing}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          </View>
          <Text style={styles.instruction}>
            Hold the camera over a QR code on a printed label
          </Text>

          <View style={styles.manualBox}>
            <Text style={styles.manualLabel}>Or type a code manually:</Text>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                value={manualEntry}
                onChangeText={setManualEntry}
                placeholder="abc123XY"
                placeholderTextColor="#9ca3af"
                autoCorrect={false}
                autoCapitalize="none"
                onSubmitEditing={submitManual}
                testID="input-manual-qr"
              />
              <TouchableOpacity
                style={styles.manualButton}
                onPress={submitManual}
                testID="button-submit-manual"
              >
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push('/scan/history')}
            testID="button-history"
          >
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={styles.historyButtonText}>Recent scans</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  camera: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  heading: { fontSize: 20, fontWeight: '600', color: '#111827', marginTop: 16 },
  subtle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  viewfinder: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    marginTop: 32,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#c4a35a',
  },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  processing: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  manualBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  manualLabel: { fontSize: 13, color: '#374151', fontWeight: '500', marginBottom: 6 },
  manualRow: { flexDirection: 'row', gap: 8 },
  manualInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Menlo',
    minHeight: 40,
  },
  manualButton: {
    backgroundColor: '#1a365d',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
});
