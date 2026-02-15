import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  newLessons: boolean;
  achievements: boolean;
  communityUpdates: boolean;
  chatMessages: boolean;
  quietHours: boolean;
}

const STORAGE_KEY = '@notification_settings';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newLessons: true,
    achievements: true,
    communityUpdates: true,
    chatMessages: true,
    quietHours: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a365d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="book-outline" size={20} color="#1d4ed8" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>New Lessons</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when new lessons are available
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.newLessons}
                onValueChange={() => handleToggle('newLessons')}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Achievements</Text>
                  <Text style={styles.settingDescription}>
                    Celebrate your learning milestones
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.achievements}
                onValueChange={() => handleToggle('achievements')}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="people-outline" size={20} color="#16a34a" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Community Updates</Text>
                  <Text style={styles.settingDescription}>
                    News and updates from your community
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.communityUpdates}
                onValueChange={() => handleToggle('communityUpdates')}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#fce7f3' }]}>
                  <Ionicons name="chatbubbles-outline" size={20} color="#db2777" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Chat Messages</Text>
                  <Text style={styles.settingDescription}>
                    Get notified of new messages
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.chatMessages}
                onValueChange={() => handleToggle('chatMessages')}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Quiet Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                  <Ionicons name="moon-outline" size={20} color="#4f46e5" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
                  <Text style={styles.settingDescription}>
                    Pause notifications during specific times
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.quietHours}
                onValueChange={() => handleToggle('quietHours')}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>

            {settings.quietHours && (
              <>
                <View style={styles.divider} />
                <View style={styles.timeRangeContainer}>
                  <Text style={styles.timeRangeLabel}>Time Range</Text>
                  <Text style={styles.timeRangeValue}>10:00 PM - 7:00 AM</Text>
                  <Text style={styles.timeRangeNote}>
                    Custom time picker coming soon
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>
            Notification preferences are saved automatically. You can manage
            device-level notification permissions in your system settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  timeRangeContainer: {
    paddingTop: 8,
  },
  timeRangeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  timeRangeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 4,
  },
  timeRangeNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: 12,
  },
});
