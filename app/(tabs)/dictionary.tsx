import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { searchDictionary, type DictionaryEntry } from '../../src/api/dictionary';

export default function DictionaryScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    const timer = setTimeout(() => setDebouncedQuery(text), 300);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['dictionary', 'search', debouncedQuery],
    queryFn: () => searchDictionary(debouncedQuery, { limit: 50 }),
    enabled: debouncedQuery.length > 0,
  });

  const entries = data?.data?.entries || [];

  const renderEntry = ({ item }: { item: DictionaryEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => router.push(`/dictionary/${item.id}`)}
    >
      <View style={styles.entryContent}>
        <Text style={styles.indigenousWord}>{item.indigenousWord}</Text>
        <Text style={styles.englishWord}>{item.englishTranslation}</Text>
        {item.category && <Text style={styles.category}>{item.category}</Text>}
      </View>
      <View style={styles.entryIcons}>
        {item.audioUrl && <Ionicons name="volume-medium" size={20} color="#1a365d" />}
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dictionary..."
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && <ActivityIndicator style={styles.loader} size="large" color="#1a365d" />}

      {!isLoading && debouncedQuery && entries.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No entries found for "{debouncedQuery}"</Text>
        </View>
      )}

      {!debouncedQuery && (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Search for words in the dictionary</Text>
          <Text style={styles.emptySubtext}>Type a word in English or Indigenous language</Text>
        </View>
      )}

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    margin: 16, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
  loader: { marginTop: 32 },
  empty: { alignItems: 'center', marginTop: 64, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' },
  list: { paddingHorizontal: 16 },
  entryCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
    marginBottom: 8, alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  entryContent: { flex: 1 },
  indigenousWord: { fontSize: 18, fontWeight: '600', color: '#1a365d' },
  englishWord: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  category: { fontSize: 12, color: '#c4a35a', marginTop: 4, fontWeight: '500' },
  entryIcons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
