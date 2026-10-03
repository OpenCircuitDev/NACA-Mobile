import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ContributionType {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
}

export default function NewContributionScreen() {
  const contributionTypes: ContributionType[] = [
    {
      id: 'dictionary',
      title: 'Dictionary Entry',
      description:
        'Add a new word or phrase to the community dictionary with translations, pronunciation, and examples.',
      icon: 'book',
      color: '#1a365d',
      action: () => router.push('/dictionary/create'),
    },
    {
      id: 'audio',
      title: 'Audio Recording',
      description:
        'Record pronunciation of words or phrases to help others learn correct pronunciation.',
      icon: 'mic',
      color: '#c4a35a',
      action: () =>
        Alert.alert(
          'Coming Soon',
          'Audio recording contributions will be available soon!',
          [{ text: 'OK' }]
        ),
    },
    {
      id: 'media',
      title: 'Media Upload',
      description:
        'Share photos, videos, or documents related to indigenous culture, language, and traditions.',
      icon: 'images',
      color: '#059669',
      action: () =>
        Alert.alert(
          'Coming Soon',
          'Media upload contributions will be available soon!',
          [{ text: 'OK' }]
        ),
    },
  ];

  const renderContributionCard = (type: ContributionType) => (
    <TouchableOpacity
      key={type.id}
      style={styles.card}
      onPress={type.action}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: type.color + '15' }]}>
        <Ionicons name={type.icon} size={48} color={type.color} />
      </View>
      <Text style={styles.cardTitle}>{type.title}</Text>
      <Text style={styles.cardDescription}>{type.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.contributeText, { color: type.color }]}>
          Start Contributing
        </Text>
        <Ionicons name="arrow-forward" size={20} color={type.color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Contribution</Text>
        <Text style={styles.headerSubtitle}>
          Choose the type of contribution you'd like to make
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#1a365d" />
          <Text style={styles.infoText}>
            Your contributions help preserve and share indigenous language and
            culture with the community. All submissions are reviewed before
            publication.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {contributionTypes.map((type) => renderContributionCard(type))}
        </View>

        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Contribution Guidelines</Text>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.guidelineText}>
              Ensure accuracy of translations and pronunciations
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.guidelineText}>
              Respect cultural sensitivity and protocols
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.guidelineText}>
              Provide context and examples when possible
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.guidelineText}>
              Use high-quality audio and images
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guidelinesCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guidelineText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    lineHeight: 22,
  },
});
