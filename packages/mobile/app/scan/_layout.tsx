import { Stack } from 'expo-router';

/**
 * QR Scan Stack — Phase 2.6.
 *
 * Surfaces:
 *   - index   — live camera scanner with manual-entry fallback
 *   - result  — show the resolved content for a scanned QR ID
 *   - history — recent scans (last 50)
 */
export default function ScanStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a365d' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontSize: 20, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Scan QR Code' }} />
      <Stack.Screen name="result" options={{ title: 'Result' }} />
      <Stack.Screen name="history" options={{ title: 'Scan History' }} />
    </Stack>
  );
}
