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

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
}

const FONT_SIZE_MAP: Record<FontSize, number> = {
  'small': 14,
  'medium': 16,
  'large': 18,
  'extra-large': 20,
};

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  'small': 'Small',
  'medium': 'Medium',
  'large': 'Large',
  'extra-large': 'Extra Large',
};

const STORAGE_KEY = '@accessibility_settings';

export default function AccessibilityScreen() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
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
      console.error('Failed to load accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    saveSettings({ ...settings, fontSize });
  };

  const handleHighContrastToggle = (value: boolean) => {
    saveSettings({ ...settings, highContrast: value });
  };

  const handleReducedMotionToggle = (value: boolean) => {
    saveSettings({ ...settings, reducedMotion: value });
  };

  const previewFontSize = FONT_SIZE_MAP[settings.fontSize];
  const previewTextColor = settings.highContrast ? '#000000' : '#374151';
  const previewBackgroundColor = settings.highContrast ? '#ffffff' : '#f9fafb';

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a365d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accessibility</Text>
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
        <Text style={styles.headerTitle}>Accessibility</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Font Size Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionDescription}>
              Choose a comfortable reading size
            </Text>
            <View style={styles.fontSizeOptions}>
              {(Object.keys(FONT_SIZE_MAP) as FontSize[]).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeButton,
                    settings.fontSize === size && styles.fontSizeButtonActive,
                  ]}
                  onPress={() => handleFontSizeChange(size)}
                >
                  <Text
                    style={[
                      styles.fontSizeButtonText,
                      settings.fontSize === size && styles.fontSizeButtonTextActive,
                    ]}
                  >
                    {FONT_SIZE_LABELS[size]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View
            style={[
              styles.previewContainer,
              { backgroundColor: previewBackgroundColor },
            ]}
          >
            <Text style={[styles.previewText, { fontSize: previewFontSize, color: previewTextColor }]}>
              This is how text will appear in the app with your current settings.
            </Text>
          </View>
        </View>

        {/* Display Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Options</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="contrast-outline" size={24} color="#1a365d" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>High Contrast</Text>
                  <Text style={styles.settingDescription}>
                    Increase text contrast for better readability
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.highContrast}
                onValueChange={handleHighContrastToggle}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="eye-off-outline" size={24} color="#1a365d" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Reduced Motion</Text>
                  <Text style={styles.settingDescription}>
                    Minimize animations and transitions
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.reducedMotion}
                onValueChange={handleReducedMotionToggle}
                trackColor={{ false: '#d1d5db', true: '#c4a35a' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>
            These settings help make the app more accessible. Changes are saved
            automatically and will apply across the entire app.
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
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontSizeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#1a365d',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  fontSizeButtonTextActive: {
    color: '#1a365d',
    fontWeight: '600',
  },
  previewContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewText: {
    lineHeight: 24,
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
