import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { apiRequest } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Register with backend
        apiRequest('POST', '/api/mobile/push/register', {
          token,
          platform: Platform.OS,
          deviceName: `${Platform.OS} ${Platform.Version}`,
        }).catch(() => {});
      }
    });

    // Listen for notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Update badge count, etc.
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      handleNotificationNavigation(data);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { expoPushToken };
}

async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    // Set notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'NACA Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: 'naca-mobile' });
    return tokenData.data;
  } catch {
    return null;
  }
}

function handleNotificationNavigation(data: any) {
  if (!data) return;

  switch (data.type) {
    case 'new_lesson':
      if (data.lessonId) router.push(`/lessons/take/${data.lessonId}`);
      break;
    case 'achievement':
      router.push('/(tabs)/profile');
      break;
    case 'chat_message':
      if (data.channelId) router.push(`/chat/${data.channelId}`);
      break;
    case 'entry_approved':
      if (data.entryId) router.push(`/dictionary/${data.entryId}`);
      break;
    case 'community_announcement':
      router.push('/(tabs)/community');
      break;
    default:
      router.push('/notifications');
      break;
  }
}

export async function unregisterPushToken(token: string) {
  try {
    await apiRequest('DELETE', '/api/mobile/push/unregister', { token });
  } catch {
    // Ignore errors during cleanup
  }
}
