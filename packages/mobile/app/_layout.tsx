import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/api/queryClient';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CommunityProvider } from '../src/contexts/CommunityContext';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import { processOfflineQueue } from '../src/hooks/useOfflineCache';
import { apiRequest } from '../src/api/client';
import NetInfo from '@react-native-community/netinfo';

function AppContent() {
  const { isAuthenticated } = useAuth();
  usePushNotifications();

  // Process offline queue when coming back online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable && isAuthenticated) {
        processOfflineQueue(apiRequest);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dictionary" />
        <Stack.Screen name="lessons" />
        <Stack.Screen name="activities" />
        <Stack.Screen name="stories" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="learning-paths" />
        <Stack.Screen name="contributions" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        {/* Phase 1 Elder Education — gated to users with elder/CA role */}
        <Stack.Screen name="elder" />
        {/* Phase 2 QR scanner — camera-based + offline cache + scan history */}
        <Stack.Screen name="scan" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CommunityProvider>
          <AppContent />
        </CommunityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
