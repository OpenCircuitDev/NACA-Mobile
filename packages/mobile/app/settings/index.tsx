import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
}

export default function SettingsScreen() {
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Please use the NACA website to change your password.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = async () => {
    const url = 'https://naca.community/terms';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open Terms of Service');
    }
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://naca.community/privacy';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open Privacy Policy');
    }
  };

  const sections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'mail-outline',
          label: 'Email',
          value: '[email protected]',
          onPress: () => {},
          showChevron: false,
        },
        {
          icon: 'key-outline',
          label: 'Change Password',
          onPress: handleChangePassword,
          showChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'accessibility-outline',
          label: 'Accessibility',
          onPress: () => router.push('/settings/accessibility'),
          showChevron: true,
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => router.push('/settings/notifications'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle-outline',
          label: 'App Version',
          value: appVersion,
          onPress: () => {},
          showChevron: false,
        },
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          onPress: handleTermsOfService,
          showChevron: true,
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          onPress: handlePrivacyPolicy,
          showChevron: true,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.label}
        style={styles.settingsItem}
        onPress={item.onPress}
        disabled={!item.onPress || item.showChevron === false}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={20} color="#1a365d" />
          </View>
          <Text style={styles.itemLabel}>{item.label}</Text>
        </View>
        <View style={styles.itemRight}>
          {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
          {item.showChevron && (
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <View key={item.label}>
                  {renderSettingsItem(item)}
                  {index < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  itemValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 60,
  },
});
