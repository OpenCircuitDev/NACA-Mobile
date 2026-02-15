import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../src/api/client';

type GameType = 'flashcard' | 'matching' | 'scramble' | 'audio' | 'sentence' | 'timeline';

interface GameDataset {
  id: number;
  name: string;
  description: string;
  gameType: GameType;
  itemCount: number;
}

const GAME_TYPE_CONFIG: Record<GameType, { icon: string; color: string; label: string }> = {
  flashcard: { icon: 'card-outline', color: '#3b82f6', label: 'Flashcards' },
  matching: { icon: 'git-compare-outline', color: '#8b5cf6', label: 'Matching' },
  scramble: { icon: 'shuffle-outline', color: '#10b981', label: 'Word Scramble' },
  audio: { icon: 'volume-high-outline', color: '#f59e0b', label: 'Audio Practice' },
  sentence: { icon: 'text-outline', color: '#ec4899', label: 'Sentence Builder' },
  timeline: { icon: 'time-outline', color: '#06b6d4', label: 'Timeline' },
};

export default function ActivitiesScreen() {
  const [selectedDataset, setSelectedDataset] = useState<GameDataset | null>(null);
  const [showGamePicker, setShowGamePicker] = useState(false);

  const { data: datasets, isLoading, error, refetch } = useQuery({
    queryKey: ['game-datasets'],
    queryFn: async () => {
      const response = await apiRequest('/api/connected/learning/game-data');
      return response.datasets as GameDataset[];
    },
  });

  const handleDatasetPress = (dataset: GameDataset) => {
    if (dataset.gameType) {
      // Navigate directly to the game
      router.push(`/activities/${dataset.gameType}/${dataset.id}`);
    } else {
      // Show game type picker
      setSelectedDataset(dataset);
      setShowGamePicker(true);
    }
  };

  const handleGameTypeSelect = (gameType: GameType) => {
    if (selectedDataset) {
      setShowGamePicker(false);
      router.push(`/activities/${gameType}/${selectedDataset.id}`);
    }
  };

  const renderDatasetCard = ({ item }: { item: GameDataset }) => {
    const config = GAME_TYPE_CONFIG[item.gameType] || {
      icon: 'game-controller-outline',
      color: '#6b7280',
      label: 'Game',
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleDatasetPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={32} color="#ffffff" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.gameType}>{config.label}</Text>
            <Text style={styles.itemCount}>{item.itemCount} items</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load activities</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Games</Text>
        <Text style={styles.headerSubtitle}>
          {datasets?.length || 0} {datasets?.length === 1 ? 'activity' : 'activities'}
        </Text>
      </View>

      {datasets && datasets.length > 0 ? (
        <FlatList
          data={datasets}
          renderItem={renderDatasetCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="game-controller-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No activities available yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for new games!</Text>
        </View>
      )}

      {/* Game Type Picker Modal */}
      <Modal
        visible={showGamePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGamePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGamePicker(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Choose Game Type</Text>
            <Text style={styles.modalSubtitle}>{selectedDataset?.name}</Text>

            <View style={styles.gameTypeList}>
              {(Object.entries(GAME_TYPE_CONFIG) as [GameType, typeof GAME_TYPE_CONFIG[GameType]][]).map(([type, config]) => (
                <TouchableOpacity
                  key={type}
                  style={styles.gameTypeOption}
                  onPress={() => handleGameTypeSelect(type)}
                >
                  <View style={[styles.gameTypeIcon, { backgroundColor: config.color }]}>
                    <Ionicons name={config.icon as any} size={24} color="#ffffff" />
                  </View>
                  <Text style={styles.gameTypeLabel}>{config.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowGamePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
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
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a365d',
  },
  itemCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  gameTypeList: {
    marginBottom: 16,
  },
  gameTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  gameTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gameTypeLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});
