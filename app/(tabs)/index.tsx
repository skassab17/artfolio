// app/(tabs)/feed.tsx
import { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, ActivityIndicator, RefreshControl, TextInput, Pressable, StyleSheet } from 'react-native';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Artwork {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category: string;
  ownerUid: string;
  createdAt: any;
}

const CATEGORIES = ['Watercolor', 'Oil Painting', 'Digital Art', 'Sketch', 'Other'];

export default function FeedScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchArtworks();
  }, [selectedCategory]);

  async function fetchArtworks() {
    try {
      setLoading(true);

      const colRef = collection(db, 'artworks');
      let q;

      if (selectedCategory && selectedCategory !== 'All') {
        q = query(colRef, where('category', '==', selectedCategory), orderBy('createdAt', 'desc'));
      } else {
        q = query(colRef, orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('🎨 Loaded artworks:', items.length);
      setArtworks(items as Artwork[]);
    } catch (error) {
      console.error('❌ Error loading artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchArtworks();
  };

  const matchingCategories = categoryInput.length > 0
    ? CATEGORIES.filter(cat => cat.toLowerCase().includes(categoryInput.toLowerCase()))
    : [];

  return (
    <View style={styles.container}>
      {/* TextInput for category search */}
      <View style={styles.searchSection}>
        <TextInput
          placeholder="Filter by category..."
          value={categoryInput}
          onChangeText={setCategoryInput}
          style={styles.input}
        />

        {categoryInput.length > 0 && (
          <View style={styles.dropdown}>
            <Pressable onPress={() => { setSelectedCategory('All'); setCategoryInput(''); }}>
              <Text style={styles.dropdownItem}>All</Text>
            </Pressable>
            {matchingCategories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => { setSelectedCategory(cat); setCategoryInput(''); }}
              >
                <Text style={styles.dropdownItem}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Artworks */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 16, color: '#888' }}>No artworks found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.url }}
                style={styles.image}
                resizeMode="cover"
              />
              {item.title && (
                <Text style={styles.title}>{item.title}</Text>
              )}
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
              <Text style={styles.categoryLabel}>Category: {item.category}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 60,   // 🧹 Pushes it DOWN from the top
    marginBottom: 10, // 🧹 Space before list starts
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  card: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
});